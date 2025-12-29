import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {BatchAnalyzeRequest, BatchAnalyzeResponse, AnalysisResult, Extract, ProposedCategory} from '@app/(apps)/hakobun/types'
import {v4 as uuidv4} from 'uuid'
import {callGeminiForJson, HAKOBUN_ANALYSIS_SCHEMA} from '@app/api/google/actions/geminiAPI'

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

    // ===== Phase 3: 一括分析実行 =====
    const results: AnalysisResult[] = []
    const allProposedCategories: Map<string, {count: number; examples: string[]}> = new Map()

    for (const text of texts) {
      if (!text.trim()) continue

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
          continue
        }

        // 各extractに原文（raw_text）を追加
        const parsedExtracts: Extract[] = geminiResponse.data.map((extract: Omit<Extract, 'raw_text'>) => ({
          ...extract,
          raw_text: text, // トピック分割前の全文を追加
        }))

        // 結果オブジェクトを構築
        const parsedResult: AnalysisResult = {
          voice_id: generatedVoiceId,
          process_timestamp: new Date().toISOString(),
          extracts: parsedExtracts,
        }

        results.push(parsedResult)

        // 提案カテゴリを収集
        if (allow_category_generation) {
          parsedExtracts.forEach(extract => {
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

        // 分析結果はDBに保存しない（フロントエンドに表示のみ）
        // 保存は一括保存API（batch-save）で行う
      } catch (error) {
        console.error(`Error analyzing text: ${text.substring(0, 50)}...`, error)
        continue
      }
    }

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
          .map(
            c =>
              `入力「${c.rawSegment}」→ 一般カテゴリ: ${c.correctGeneralCategory || '-'} / カテゴリ: ${c.correctCategory} / 感情: ${c.correctSentiment}`
          )
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

  return `あなたは、投稿内容を「トピック単位」で整理してカテゴリ分類するアシスタントです。

${inputDataExplainSection}## ★重要：トピック単位とは（最優先で理解）

**トピック単位とは「①事実/事象＋②ユーザーの感想や感覚」の構成でできている意味のまとまりのことです。言語学的な「文節」ではありません。**

- ❌ 言語学的文節の例（これは間違い）：「オシャレな内装と」「コーヒーの味も」「店内の雰囲気も」
- ✅ トピック単位の例（正しい分割）：
  - 「オシャレでカッコいい。店内の雰囲気もノリが良かったよ。」→ ①店内環境の事実＋②好意的な感想
  - 「コーヒーの味も最高だったし、」→ ①商品の味の事実＋②好意的な感想
  - 「スタッフの人たちもフレンドリーでよかった。」→ ①接客の事実＋②好意的な感想

**絶対に文の途中で切らないでください。必ず句点「。」や読点「、」で意味が完結する単位で分割します。**

必ず以下のルールに従って処理してください。

---

## トピック分割ルール（順序厳守）

1. **まずテーマを判定する**
- 投稿文を全体的に読み、どのテーマ（例：商品、接客、座席、価格など）に属するかを判断する。

2. **同一テーマは必ず統合する（最優先ルール）**
- 複数文にわたっていても、同じテーマに属する評価・不満・要望・感謝は必ず1つのトピック単位にまとめる。
- これが最優先であり、他のルールより常に優先する。
- 他店舗との比較、過去経験との比較、補足説明（例：「ちなみに」「〜ですが」）なども含め、同じテーマを補強するものは必ず一つにまとめる。
- これらを別カテゴリに分けることは絶対にしない。
- 例：「サラダが悪い」「府中店ではそうではなかった」 → 統合して『サラダ品質への不満』
- 例：「提供速度が遅い」「改善してほしい」 → 統合して『提供速度への不満』（細かく分けない）
- 例：「店内が寒い」「エアコンの調整をしてほしい」「ブランケットが欲しい」 → 統合して『店内温度への不満』（温度に関する同一テーマとして統合）

3. **異なるテーマが含まれている場合のみ分割する**
- 1つの投稿文に複数のテーマ（例：「パンが美味しい」と「接客が雑」）が混在している場合は、テーマごとにトピック単位を分ける。

4. **トピック単位は必ず原文そのまま**
- 投稿文の原文を絶対に削除・省略しないこと。
- 言い換え、要約、加工は禁止。
- 複数文をまとめるときも、必ず投稿者の原文を連結して表示する。

5. **文の途中で切らない（絶対厳守）**
- 「〜と」「〜も」「〜が」などの助詞や接続表現の途中で分割しないこと。
- 必ず意味が完結する形で切る。句点「。」または意味的に完結する読点「、」を境界とする。

---

## 一般カテゴリとカテゴリの2階層構造

### 一般カテゴリ一覧（固定・必ずこの中から選択）

${generalCategoriesList}

### カテゴリマスター一覧（最優先で使用）
${fixedCategories}

---

## カテゴリ名ルール

- 出力は必ず「一般カテゴリ」「カテゴリ」「トピック単位」のセットで行う。
- カテゴリ名は **原則13文字以内** にする。やむを得ない場合は最大15文字まで許容。
- カテゴリ名を区切る際は、**全角ナカグロ（・）** を使用すること。
  - 例：「オシャレ・雰囲気が良い」「治安・イメージが悪い」
- **英字・数字は必ず半角** を使用すること（例：Wi-Fi、BGM、100円）。
- **短いラベル**として「何がどう良い／悪い／要望か」が一読で分かるようにする。
- 抽象的すぎず／細かすぎない。**1段階抽象化**を心がける。
- 店舗名や個別商品名は使わない。ただし**ブランド名レベル**は安定ラベルとして許容。
- 曖昧な表現（例：×「満足」）は禁止。必ず方向性を含める。
- **感情の方向性がわかる命名**を心がける：
  - × テナントが多い → ○ テナントが多く充実（好意的）/ テナント過多で混雑（不満）
  - × イベントがある → ○ イベントが充実している（好意的）/ イベント開催希望（リクエスト）

### 表現テンプレ（参考）
- 評価（良い）: 「Xが美味しい」「Xが早い」「Xが良い」「清潔感がある・綺麗」
- 評価（課題）: 「Xが遅い」「Xが少ない」「Xが雑」「温度が低い」
- ロイヤルティ: 「長年利用のコアなファン」「ブランドのファン・応援している」「個別店舗のファン」
- 価格: 「良心的な金額・通いやすい」「値上がり・サイズ感への懸念」
- 要望: 「バリエーションへの要望」「品揃え要望」「メニューリクエスト」
- 商品: 「商品の美味しさと安定感」「推しメニュー・トッピングがある」「限定メニューが好き・美味しい」
- 体験・運用: 「提供スピードが早い」「店内空間のゆとりと配慮」「操作・メニューが見にくい」

### NG→OKの具体例
- × パンが美味しい → ○ **特定のパンへの美味しさ評価**
- × 新商品希望 → ○ **嗜好別商品の品揃え要望**
- × 接客が気になる → ○ **接客や対応が雑・私語が多い**
- × ドリンク提供のスピードに満足 → ○ **商品の提供スピードが早い**

${additionalRules ? `### 追加ルール（厳守）\n${additionalRules}\n` : ''}
---

## 出力前の必須チェック

NG1：カテゴリ名の長さが13文字以内（最大15文字）か、方向性語（良さ/不満/要望/安心感/不足/改善希望 等）を含むか
NG2：比較・補足・感謝を独立テーマにしていないか（必ず統合）
NG3：文の途中で切っていないか？「〜と」「〜も」で終わるものは不正（必ず意味が完結する形に統合）
NG4：一般カテゴリが「接客・サービス」「店内」「料理・ドリンク」「備品・設備」「値段」「立地」「その他」のいずれかであるか
OK1：同じテーマに属する文を複数箱に分けていないか？同一テーマの複数文が一つにまとめること → 該当する場合は必ず統合してから出力する。
OK2：トピック単位は原文の句読点を保持し、順序通りに連結しているか
OK3：各トピック単位が意味的に完結しているか確認

---

## 1カテゴリ1感情ルール（厳守）

- **一つのカテゴリに対して、「好意的」と「リクエスト/不満」が混在することは絶対に禁止**
- 同一トピック内に好意的な感想とリクエストが混在する場合：
  - **主たる感情（文章全体のトーン）で判定**
  - 「〜して欲しい」「〜だったらいいな」は文脈で判断
  - 好意的な評価の中での期待・希望は「好意的」に分類

【NG例】
入力: 「好みの展示会ですごく気に入りました。今後とも四季折々のタイミングでこのイベントを開催して欲しいですし、そうなったら絶対通いたいと思ってます！」
× カテゴリ「イベントが充実」+ 感情「リクエスト」

【OK例】
入力: 同上
○ カテゴリ「イベントが充実」+ 感情「好意的」
（主たるトーンが好意的なため、リクエスト部分も好意的に含める）

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

${correctionExamples ? `## 直近の正解事例（Few-Shot）\n${correctionExamples}\n\n` : ''}---

## 出力形式

- テキストをトピック単位で分割し、**一般カテゴリ**、**カテゴリ**、感情、ポジネガ判定、熱量を**配列形式**で出力する
- 必ずJSON形式で出力すること
- **sentenceには意味が完結した文を入れること。「〜と」「〜も」で終わる不完全な形は禁止**

### 出力フィールド（必須）

| フィールド | 説明 |
|-----------|------|
| sentence | トピック単位（意味が完結した原文） |
| general_category | 一般カテゴリ（「接客・サービス」「店内」「料理・ドリンク」「備品・設備」「値段」「立地」「その他」のいずれか） |
| category | カテゴリ（詳細な分類名、原則13文字以内、最大15文字） |
| sentiment | 感情（「好意的」「不満」「リクエスト」のいずれか） |
| posi_nega | ポジネガ判定（「positive」「negative」「neutral」のいずれか） |
| magnitude | 熱量スコア（0-100） |
| is_new_generated | 新規生成カテゴリの場合のみtrue（オプション） |

### 出力例

入力: 「オシャレでカッコいい。コーヒーの味も最高だったし、店内の雰囲気もノリが良かったよ。スタッフの人たちもフレンドリーでよかった。」

\`\`\`json
[
  {"sentence": "オシャレでカッコいい。店内の雰囲気もノリが良かったよ。", "general_category": "店内", "category": "オシャレ・雰囲気が良い", "sentiment": "好意的", "posi_nega": "positive", "magnitude": 60},
  {"sentence": "コーヒーの味も最高だったし、", "general_category": "料理・ドリンク", "category": "料理・ドリンクが美味しい", "sentiment": "好意的", "posi_nega": "positive", "magnitude": 55},
  {"sentence": "スタッフの人たちもフレンドリーでよかった。", "general_category": "接客・サービス", "category": "気持ちの良い接客", "sentiment": "好意的", "posi_nega": "positive", "magnitude": 45}
]
\`\`\`

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
- general_categoryの値を${generalCategoryNames}以外にしないこと

---`
}
