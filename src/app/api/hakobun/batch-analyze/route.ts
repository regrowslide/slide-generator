import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {BatchAnalyzeRequest, BatchAnalyzeResponse, AnalysisResult, Extract, ProposedCategory} from '@app/(apps)/hakobun/types'
import {v4 as uuidv4} from 'uuid'
import {callGeminiForJson, HAKOBUN_ANALYSIS_SCHEMA} from '@app/api/google/actions/geminiAPI'
import pLimit from 'p-limit'

// Gemini API同時実行数（環境変数で設定可能、デフォルト4）
const GEMINI_CONCURRENCY = parseInt(process.env.GEMINI_CONCURRENCY || '4')

export async function POST(request: NextRequest) {
  try {
    const body: BatchAnalyzeRequest = await request.json()
    const {client_id, texts, allow_category_generation = true} = body

    if (!client_id || !texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'client_id と texts（配列）は必須です',
        } as BatchAnalyzeResponse,
        {status: 400}
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEY環境変数が設定されていません',
        } as BatchAnalyzeResponse,
        {status: 500}
      )
    }

    // クライアント存在確認
    const client = await prisma.hakobunClient.findUnique({
      where: {clientId: client_id},
    })

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: `クライアント "${client_id}" が見つかりません`,
        } as BatchAnalyzeResponse,
        {status: 404}
      )
    }

    // ===== Phase 1: コンテキスト取得 (Retrieval) =====

    // クライアントに業種が紐づいていない場合はエラー
    if (!client.industryId) {
      return NextResponse.json(
        {
          success: false,
          error: 'クライアントに業種が紐づけられていません。クライアント管理で業種を設定してください。',
        } as BatchAnalyzeResponse,
        {status: 400}
      )
    }

    // 1. 業種別一般カテゴリと詳細カテゴリ取得
    const industryGeneralCategories = await prisma.hakobunIndustryGeneralCategory.findMany({
      where: {
        industryId: client.industryId,
      },
      include: {
        categories: {
          where: {
            enabled: true, // 有効なカテゴリのみ
          },
          orderBy: {sortOrder: 'asc'},
        },
      },
      orderBy: {sortOrder: 'asc'},
    })

    // 2. 直近修正事例50件取得（アーカイブ済みは除外、かつ現在の業種のカテゴリに一致するもののみ）
    const allCorrections = await prisma.hakobunCorrection.findMany({
      where: {
        hakobunClientId: client.id,
        archived: false,
      },
      orderBy: {createdAt: 'desc'},
      take: 100, // フィルタリング前により多く取得
    })

    // 現在の業種の一般カテゴリ名のセットを作成
    const validGeneralCategoryNames = new Set(industryGeneralCategories.map(gc => gc.name))

    // 現在の業種のカテゴリに一致する修正事例のみをフィルタリング
    const corrections = allCorrections
      .filter(c => {
        // correctGeneralCategoryがnullの場合は除外
        if (!c.correctGeneralCategory) return false
        // 現在の業種の一般カテゴリに一致するもののみ
        return validGeneralCategoryNames.has(c.correctGeneralCategory)
      })
      .slice(0, 50) // 最大50件まで

    // 3. 全ルール取得
    const rules = await prisma.hakobunRule.findMany({
      where: {hakobunClientId: client.id},
      orderBy: [{priority: 'asc'}, {createdAt: 'desc'}],
    })

    // ===== Phase 2: 動的プロンプト構築 =====
    const systemPrompt = buildSystemPrompt(
      industryGeneralCategories,
      corrections,
      rules,
      allow_category_generation,
      client.inputDataExplain
    )

    // ===== Phase 3: 一括分析実行（並列処理） =====
    const startTime = Date.now()
    const limit = pLimit(GEMINI_CONCURRENCY)

    // 空のテキストを除外
    const validTexts = texts.filter(t => t.trim())
    console.log(`[Batch Analyze] Starting parallel analysis: ${validTexts.length} texts, concurrency: ${GEMINI_CONCURRENCY}`)

    // 並列でGemini API呼び出し
    const apiResults = await Promise.all(
      validTexts.map(text =>
        limit(async () => {
          const generatedVoiceId = uuidv4()
          try {
            const fullPrompt = `${systemPrompt}\n\n【分析対象テキスト】\n${text}`

            const geminiResponse = await callGeminiForJson<Omit<Extract, 'raw_text'>[]>(fullPrompt, HAKOBUN_ANALYSIS_SCHEMA, {
              model: 'gemini-2.0-flash',
              maxRetries: 2,
              generationConfig: {
                temperature: 0.2,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 4096,
              },
            })

            if (!geminiResponse.success || !geminiResponse.data) {
              console.error('Gemini API Error:', geminiResponse.error, geminiResponse.rawText)
              return null
            }

            // 各extractに原文（raw_text）を追加
            const parsedExtracts: Extract[] = geminiResponse.data.map((extract: Omit<Extract, 'raw_text'>) => ({
              ...extract,
              raw_text: text,
            }))

            // 結果オブジェクトを構築
            const parsedResult: AnalysisResult = {
              voice_id: generatedVoiceId,
              process_timestamp: new Date().toISOString(),
              extracts: parsedExtracts,
            }

            return {result: parsedResult, extracts: parsedExtracts}
          } catch (error) {
            console.error(`Error analyzing text: ${text.substring(0, 50)}...`, error)
            return null
          }
        })
      )
    )

    // 結果を集約
    const results: AnalysisResult[] = []
    const allProposedCategories: Map<string, {count: number; examples: string[]}> = new Map()

    for (const apiResult of apiResults) {
      if (!apiResult) continue

      results.push(apiResult.result)

      // 提案カテゴリを収集
      if (allow_category_generation) {
        apiResult.extracts.forEach(extract => {
          if (extract.is_new_generated && extract.category) {
            const existing = allProposedCategories.get(extract.category)
            if (existing) {
              existing.count++
              if (existing.examples.length < 3) {
                existing.examples.push(extract.sentence)
              }
            } else {
              allProposedCategories.set(extract.category, {
                count: 1,
                examples: [extract.sentence],
              })
            }
          }
        })
      }
    }

    const processingTime = Date.now() - startTime
    console.log(`[Batch Analyze] Completed: ${results.length}/${validTexts.length} texts in ${processingTime}ms (${(processingTime / 1000).toFixed(1)}s)`)

    // 提案カテゴリを配列に変換
    const proposedCategories: ProposedCategory[] = Array.from(allProposedCategories.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      examples: data.examples,
    }))

    return NextResponse.json({
      success: true,
      results,
      proposed_categories: proposedCategories.length > 0 ? proposedCategories : undefined,
    } as BatchAnalyzeResponse)
  } catch (error) {
    console.error('Batch analyze error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as BatchAnalyzeResponse,
      {status: 500}
    )
  }
}

// 動的プロンプト構築関数（current-prompt.md統合版）
function buildSystemPrompt(
  industryGeneralCategories: {
    name: string
    description: string | null
    categories: {name: string; description: string | null}[]
  }[],
  corrections: {rawSegment: string; correctCategory: string; correctSentiment: string}[],
  rules: {targetCategory: string; ruleDescription: string; priority: string}[],
  allowCategoryGeneration: boolean = true,
  inputDataExplain?: string | null
): string {
  // マスタカテゴリ一覧（一般カテゴリごとにグループ化）
  const fixedCategories =
    industryGeneralCategories.length > 0
      ? industryGeneralCategories
          .map(
            gc =>
              `【${gc.name}】\n${gc.categories.map(c => `  - ${c.name}${c.description ? `（${c.description}）` : ''}`).join('\n')}`
          )
          .join('\n')
      : '（マスタカテゴリが未登録です）'

  // 追加ルール
  const additionalRules =
    rules.length > 0 ? rules.map(r => `- [${r.priority}] ${r.targetCategory}: ${r.ruleDescription}`).join('\n') : ''

  // 直近の修正事例（Few-Shot）
  const correctionExamples =
    corrections.length > 0
      ? corrections
          .slice(0, 20)
          .map(c => `入力「${c.rawSegment}」→ カテゴリ: ${c.correctCategory} / 感情: ${c.correctSentiment}`)
          .join('\n')
      : ''

  // 一般カテゴリ一覧
  const generalCategoriesList =
    industryGeneralCategories.length > 0
      ? industryGeneralCategories.map(gc => `- **${gc.name}**: ${gc.description || '該当する評価'}`).join('\n')
      : '（一般カテゴリが未登録です）'

  // 一般カテゴリ名リスト（禁止事項チェック用）
  const generalCategoryNames =
    industryGeneralCategories.length > 0 ? industryGeneralCategories.map(gc => `「${gc.name}」`).join('、') : ''

  // 一般カテゴリが空の場合はエラー
  if (!generalCategoryNames) {
    return 'エラー: 業種に一般カテゴリが設定されていません。'
  }

  // 投稿データの説明
  const inputDataExplainSection = inputDataExplain
    ? `## Inputデータの説明

${inputDataExplain}

---
`
    : ''

  return `あなたは、顧客の声を「一般カテゴリ」「カテゴリ」別に分類し、経営改善に役立つインサイトを抽出するアシスタントです。

【重要：業界・業種による違い】
このプロンプト内で示される例（カテゴリ名、ステージ名など）は**飲食店を想定した一例**です。
実際の一般カテゴリ・カテゴリは、クライアントの**業界・業種によって大きく異なります**。
必ず「一般カテゴリ一覧」と「カテゴリマスター一覧」に記載されたものを優先して使用してください。
例に出てくるカテゴリ名（「接客が丁寧」「パンが美味しい」等）はあくまで参考であり、
実際には「一般カテゴリ一覧」「カテゴリマスター一覧」に記載のものを使ってください。

${inputDataExplainSection}## ★最重要：分析の目的と粒度

**目的：「一般カテゴリ」×「カテゴリ」×「感情」の組み合わせで顧客の声を集計し、経営判断に活かすこと**

この目的のため、以下の粒度で抽出してください：
- **分割基準**：「一般カテゴリ」または「感情」が変わるときのみ分割
- **統合基準**：同じ「一般カテゴリ」かつ同じ「感情」なら、複数文でも1つにまとめる

---

## 分割・統合の判断基準（最優先ルール）

### 統合すべきケース（1つの抽出にまとめる）
- 同じ一般カテゴリ × 同じ感情 → **必ず統合**
- 比較・補足・理由説明 → メインの意見と**統合**
- 「〜が良い。だから〜」のような因果関係 → **統合**

【統合の例】
- 入力：「店内が寒い。エアコンの温度を上げてほしい。ブランケットがあると嬉しいです。」
- → 1つに統合：「店内が寒い。エアコンの温度を上げてほしい。ブランケットがあると嬉しいです。」（環境・設備 × リクエスト）

### 分割すべきケース（別々の抽出にする）
- **異なる一般カテゴリ** → 分割
- **異なる感情**（好意的 vs 不満 など） → 分割

【分割の例】
- 入力：「パンはとても美味しかったです。ただ、店員さんの態度が少し気になりました。」
- → 2つに分割：
  - 「パンはとても美味しかったです。」（商品・メニュー × 好意的）
  - 「ただ、店員さんの態度が少し気になりました。」（接客・サービス × 不満）

---

## 抽出文（sentence）のルール

1. **原文をそのまま使用**（言い換え・要約・省略は禁止）
2. **意味が完結する形で抽出**（「〜と」「〜も」で終わらない）
3. **統合時は原文を連結**（順序を保持）

---

## 一般カテゴリとカテゴリの2階層構造

### 一般カテゴリ一覧（固定・必ずこの中から選択）

${generalCategoriesList}

### カテゴリマスター一覧（最優先で使用）
${fixedCategories}

---

## カテゴリ名ルール

- **原則13文字以内**（最大15文字まで許容）
- 区切りは**全角ナカグロ（・）**を使用
- **英字・数字は半角**（例：Wi-Fi、BGM）
- **感情の方向性を含める**（何がどう良い/悪い/要望か一読で分かるように）

### 良いカテゴリ名の例
- 「接客が丁寧・気配りがある」（好意的な接客）
- 「接客や対応が雑・私語が多い」（不満な接客）
- 「メニューへのリクエスト」（要望）
- 「パンが美味しい・満足」（好意的な商品評価）
- 「お店への感謝・応援の声」（ロイヤルティ）

${additionalRules ? `### 追加ルール（厳守）\n${additionalRules}\n` : ''}
---

## 出力前チェックリスト

1. **同じ一般カテゴリ × 同じ感情の文を分割していないか？** → 該当する場合は必ず統合
2. **カテゴリ名に感情の方向性が含まれているか？**
3. **抽出文が意味的に完結しているか？**（「〜と」「〜も」で終わっていないか）
4. **一般カテゴリがマスター一覧から選択されているか？**

---

## 感情判定のルール

- **1つの抽出には1つの感情**を割り当てる
- 好意的な評価の中に含まれる軽い要望・期待は「好意的」に分類
- 明確な改善要望・不満は「リクエスト」または「不満」に分類

【判定例】
- 「すごく気に入りました。また開催してほしい！」→ **好意的**（主たるトーンがポジティブ）
- 「良いのですが、〜してほしい」→ **リクエスト**（改善要望が主眼）
- 「〜が残念でした」→ **不満**

---

## 感情(sentiment)の定義

- **好意的**：肯定的・賞賛的な評価語が含まれる
- **不満**：否定的・批判的な評価語が含まれる
- **リクエスト**：改善要望や提案語句が含まれる
- **その他**：上記3つのいずれにも明確に分類できない場合のみ使用。
  【重要】「その他」は最後の手段です。安易に使用しないでください。
  必ず「好意的」「不満」「リクエスト」での分類を試み、
  本当に分類不可能な場合のみ「その他」を選択すること。

## 熱量スコア(magnitude)の定義（0–100）

- 0–5：ほぼ感情表現なし（レビューではほとんど使用しない）
- 6–25：軽度の感情表現（短いポジ／ネガ語句）
- 26–50：中程度の感情表現（感嘆符１つ、強調詞を含む）
- 51–75：強い感情表現（複数の感嘆符や絵文字、強い語気）
- 76–100：非常に強い情熱的表現（長文での熱意、複数絵文字）
- レビュー文全体の熱量分布を考慮し、低めに偏りすぎないよう割り当てる

---

## ステージ(stage)の定義 - カスタマージャーニー

顧客がどの段階で発言しているかを判定してください。

- **認知**：商品・サービスの存在を初めて知った段階での感想
  - 例：「SNSで見て気になった」「広告で知った」「友人に教えてもらった」
- **興味**：興味を持ち、情報収集している段階
  - 例：「メニューを見て気になった」「口コミを調べた」「どんな感じか知りたかった」
- **検討**：購入・利用を具体的に検討している段階
  - 例：「他店と比較した」「予算内か確認した」「予約しようか迷った」
- **購入**：購入・契約・予約の瞬間に関する感想
  - 例：「注文がスムーズだった」「決済が簡単だった」「予約が取りやすかった」
- **利用**：実際に商品・サービスを利用している段階での感想（最も多い）
  - 例：「美味しかった」「接客が良かった」「居心地が良い」「店内が寒い」
- **リピート**：再利用・継続利用に関する意向
  - 例：「また来たい」「定期的に利用している」「次も買いたい」「友人にも勧めたい」
- **その他**：上記に該当しない場合のみ使用

【重要】多くの顧客の声は「利用」段階に該当します。迷った場合は「利用」を選択してください。

${correctionExamples ? `## 直近の正解事例（Few-Shot）\n${correctionExamples}\n\n` : ''}---

## 出力形式

- **「一般カテゴリ」×「感情」が変わるときのみ分割**して、配列形式で出力
- 必ずJSON形式で出力すること
- **sentenceには意味が完結した原文を入れること**

### 出力フィールド（必須）

| フィールド | 説明 |
|-----------|------|
| sentence | 抽出した原文（意味が完結した形、統合時は連結） |
| stage | ステージ（「認知」「興味」「検討」「購入」「利用」「リピート」「その他」） |
| general_category | 一般カテゴリ（マスター一覧から選択） |
| category | カテゴリ（詳細分類、原則13文字以内） |
| sentiment | 感情（「好意的」「不満」「リクエスト」「その他」） |
| posi_nega | ポジネガ判定（「positive」「negative」「neutral」） |
| magnitude | 熱量スコア（0-100） |
| is_new_generated | 新規生成カテゴリの場合のみtrue |

**※以下の出力例は飲食店を想定した一例です。実際の一般カテゴリ・カテゴリは「一般カテゴリ一覧」「カテゴリマスター一覧」に従ってください。**

### 出力例1（複数の一般カテゴリがある場合 → 分割）

入力: 「朝早めに駅に着いた時に利用してます。店員さんの対応が早くてささっとカフェオレなど出してくれて嬉しいです。」

\`\`\`json
[
  {"sentence": "朝早めに駅に着いた時に利用してます。", "stage": "リピート", "general_category": "店舗・立地", "category": "来店のルーティンがある", "sentiment": "好意的", "posi_nega": "positive", "magnitude": 30},
  {"sentence": "店員さんの対応が早くてささっとカフェオレなど出してくれて嬉しいです。", "stage": "利用", "general_category": "接客・サービス", "category": "接客が丁寧・気配りがある", "sentiment": "好意的", "posi_nega": "positive", "magnitude": 55}
]
\`\`\`

### 出力例2（同じ一般カテゴリ×同じ感情 → 統合）

入力: 「店内が寒い。エアコンの温度を上げてほしい。ブランケットがあると嬉しいです。」

\`\`\`json
[
  {"sentence": "店内が寒い。エアコンの温度を上げてほしい。ブランケットがあると嬉しいです。", "stage": "利用", "general_category": "運営・設備", "category": "店内温度への不満・改善要望", "sentiment": "リクエスト", "posi_nega": "negative", "magnitude": 45}
]
\`\`\`
※ 3文とも「運営・設備」×「リクエスト」なので1つに統合

### 出力例3（同じ一般カテゴリでも感情が異なる → 分割）

入力: 「パンはとても美味しいので気に入っています。ただ、メニューが店舗によって少ないので少し残念です。」

\`\`\`json
[
  {"sentence": "パンはとても美味しいので気に入っています。", "stage": "利用", "general_category": "商品・メニュー", "category": "パンが美味しい・満足", "sentiment": "好意的", "posi_nega": "positive", "magnitude": 50},
  {"sentence": "ただ、メニューが店舗によって少ないので少し残念です。", "stage": "利用", "general_category": "商品・メニュー", "category": "メニューへのリクエスト", "sentiment": "リクエスト", "posi_nega": "negative", "magnitude": 35}
]
\`\`\`
※ 同じ「商品・メニュー」でも感情が「好意的」と「リクエスト」で異なるので分割

### カテゴリ選択ルール

1. マスタカテゴリ一覧を最優先で使用
2. ${
    allowCategoryGeneration
      ? `マスターに該当するカテゴリがない場合のみ、is_new_generated: true として新しいカテゴリを提案してください。

**新規カテゴリ提案時の粒度ルール（重要）**:
- 既存のカテゴリマスター一覧の粒度（抽象度・詳細度）を必ず参考にすること
- 既存カテゴリと同じレベルの抽象化を行うこと（抽象的すぎず、細かすぎない）
- 既存カテゴリの命名規則（13文字以内、全角ナカグロ使用、方向性を含む）に従うこと
- 既存カテゴリの表現スタイル（例：「Xが美味しい」「Xが早い」「清潔感がある・綺麗」など）を参考にすること
- 既存カテゴリと同程度の粒度で、一貫性のあるカテゴリ名を提案すること`
      : 'マスターカテゴリ一覧から必ず選択してください。新規カテゴリの生成は禁止です。'
  }
3. 一般カテゴリは必ず${generalCategoryNames}から選択
4. ${allowCategoryGeneration ? '新規一般カテゴリを提案する場合も、既存の一般カテゴリの粒度と抽象度を参考にすること' : ''}

### 禁止事項

- 応答にJSON以外の文字列を含めないこと。余計な説明や補足は禁止。
- 番号の附番
- 余計な文字の追加
- 感情(sentiment)の値を"好意的"、"不満"、"リクエスト"、"その他"以外にしないこと
- posi_negaの値を"positive"、"negative"、"neutral"以外にしないこと
- stageの値を"認知"、"興味"、"検討"、"購入"、"利用"、"リピート"、"その他"以外にしないこと
- general_categoryの値を${generalCategoryNames}以外にしないこと

---`
}
