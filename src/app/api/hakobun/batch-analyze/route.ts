import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {BatchAnalyzeRequest, BatchAnalyzeResponse, AnalysisResult, Extract, ProposedCategory} from '@app/(apps)/hakobun/types'
import {v4 as uuidv4} from 'uuid'
import {callGeminiForJson, HAKOBUN_ANALYSIS_SCHEMA} from '@app/api/google/actions/geminiAPI'
import pLimit from 'p-limit'

// Gemini API同時実行数（環境変数で設定可能、デフォルト4）
const GEMINI_CONCURRENCY = parseInt(process.env.GEMINI_CONCURRENCY || '4')

// ログユーティリティ
const log = (phase: string, message: string, data?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString()
  const dataStr = data ? ` | ${JSON.stringify(data)}` : ''
  console.log(`[${timestamp}] [Hakobun] [${phase}] ${message}${dataStr}`)
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  const totalStartTime = Date.now()

  log('START', `Request started`, {requestId})

  try {
    const body: BatchAnalyzeRequest = await request.json()
    const {client_id, texts, allow_category_generation = true} = body

    if (!client_id || !texts || !Array.isArray(texts) || texts.length === 0) {
      log('ERROR', 'Validation failed: missing required fields', {requestId})
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

    // クライアント存在確認（ステージも含めて取得）
    const client = await prisma.hakobunClient.findUnique({
      where: {clientId: client_id},
      include: {
        HakobunClientStage: {
          where: {enabled: true},
          orderBy: {sortOrder: 'asc'},
        },
      },
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

    log('INIT', `Processing ${texts.length} texts for client: ${client_id}`, {
      requestId,
      textCount: texts.length,
      allowCategoryGeneration: allow_category_generation,
    })

    // ===== Phase 1: コンテキスト取得 (Retrieval) =====
    const phase1Start = Date.now()
    log('PHASE1', 'Starting context retrieval', {requestId})

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

    log('PHASE1', `Context retrieval completed`, {
      requestId,
      durationMs: Date.now() - phase1Start,
      generalCategoryCount: industryGeneralCategories.length,
      correctionCount: corrections.length,
      ruleCount: rules.length,
    })

    // ===== Phase 2: 動的プロンプト構築 =====
    const phase2Start = Date.now()
    log('PHASE2', 'Building dynamic prompt', {requestId})
    // クライアントのステージ一覧を取得（未設定の場合はデフォルト）
    const clientStages =
      client.HakobunClientStage && client.HakobunClientStage.length > 0
        ? client.HakobunClientStage.map(s => ({name: s.name, description: s.description}))
        : []

    const systemPrompt = buildSystemPrompt(
      industryGeneralCategories,
      corrections,
      rules,
      allow_category_generation,
      client.inputDataExplain,
      clientStages
    )

    log('PHASE2', `Prompt built`, {
      requestId,
      durationMs: Date.now() - phase2Start,
      promptLength: systemPrompt.length,
    })

    // ===== Phase 3: 一括分析実行（並列処理） =====
    const phase3Start = Date.now()
    const limit = pLimit(GEMINI_CONCURRENCY)

    // 空のテキストを除外
    const validTexts = texts.filter(t => t.trim())
    log('PHASE3', `Starting parallel analysis`, {
      requestId,
      totalTexts: validTexts.length,
      concurrency: GEMINI_CONCURRENCY,
      estimatedTimeSeconds: Math.ceil(validTexts.length / GEMINI_CONCURRENCY) * 3, // 1テキストあたり約3秒と推定
    })

    // 進捗トラッキング
    let completedCount = 0
    let errorCount = 0

    // 並列でGemini API呼び出し
    const apiResults = await Promise.all(
      validTexts.map((text, index) =>
        limit(async () => {
          const generatedVoiceId = uuidv4()
          const itemStartTime = Date.now()
          try {
            const fullPrompt = `${systemPrompt}\n\n【分析対象テキスト】\n${text}`

            const geminiResponse = await callGeminiForJson<Omit<Extract, 'raw_text'>[]>(fullPrompt, HAKOBUN_ANALYSIS_SCHEMA, {
              model: 'gemini-2.5-flash-lite',
              maxRetries: 1,
              generationConfig: {
                temperature: 0.1,
                topK: 1,
                topP: 0.1,
                maxOutputTokens: 4096,
              },
            })

            if (!geminiResponse.success || !geminiResponse.data) {
              errorCount++
              log('PHASE3', `Item ${index + 1}/${validTexts.length} FAILED`, {
                requestId,
                itemIndex: index + 1,
                error: geminiResponse.error,
                durationMs: Date.now() - itemStartTime,
              })
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

            completedCount++
            // 10件ごと、または最初と最後にログ出力
            if (completedCount === 1 || completedCount === validTexts.length || completedCount % 10 === 0) {
              const progress = Math.round((completedCount / validTexts.length) * 100)
              log('PHASE3', `Progress: ${completedCount}/${validTexts.length} (${progress}%)`, {
                requestId,
                completed: completedCount,
                total: validTexts.length,
                errors: errorCount,
                elapsedMs: Date.now() - phase3Start,
              })
            }

            return {result: parsedResult, extracts: parsedExtracts}
          } catch (error) {
            errorCount++
            log('PHASE3', `Item ${index + 1}/${validTexts.length} ERROR`, {
              requestId,
              itemIndex: index + 1,
              error: error instanceof Error ? error.message : 'Unknown error',
              durationMs: Date.now() - itemStartTime,
            })
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

    const phase3Duration = Date.now() - phase3Start
    log('PHASE3', `Analysis completed`, {
      requestId,
      successCount: results.length,
      errorCount,
      totalTexts: validTexts.length,
      durationMs: phase3Duration,
      avgTimePerTextMs: Math.round(phase3Duration / validTexts.length),
    })

    // 提案カテゴリを配列に変換
    const proposedCategories: ProposedCategory[] = Array.from(allProposedCategories.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      examples: data.examples,
    }))

    const totalDuration = Date.now() - totalStartTime
    log('COMPLETE', `Request completed successfully`, {
      requestId,
      totalDurationMs: totalDuration,
      totalDurationSec: (totalDuration / 1000).toFixed(1),
      resultsCount: results.length,
      proposedCategoriesCount: proposedCategories.length,
    })

    return NextResponse.json({
      success: true,
      results,
      proposed_categories: proposedCategories.length > 0 ? proposedCategories : undefined,
    } as BatchAnalyzeResponse)
  } catch (error) {
    const totalDuration = Date.now() - totalStartTime
    log('ERROR', `Request failed`, {
      requestId,
      totalDurationMs: totalDuration,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
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
  inputDataExplain?: string | null,
  clientStages?: {name: string; description: string | null}[]
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

  // ステージ一覧（クライアント設定またはデフォルト）
  const stages = clientStages && clientStages.length > 0 ? clientStages : []

  // ステージ名リスト（禁止事項・出力フィールド用）
  const stageNames = stages.map(s => `「${s.name}」`).join('、')

  // ステージ定義（プロンプト用）- 番号付きで明確化
  const stageDefinitions = stages.map((s, i) => `${i + 1}. **${s.name}** ${s.description ? `：${s.description}` : ''}`).join('\n')

  // ステージ名の配列（出力例用）
  const stageNameArray = stages.map(s => s.name)
  // 出力例用のステージ
  const exampleStage1 = stageNameArray[Math.min(4, stageNameArray.length - 1)] || stageNameArray[0]

  return `あなたは、顧客の声を「ステージ」「感情」「一般カテゴリ」「カテゴリ」別に分類し、経営改善に役立つインサイトを抽出するアシスタントです。

# ══════════════════════════════════════════════════════════════
# 【最重要】ステージ(stage)の制約 - 必ず最初に確認すること
# ══════════════════════════════════════════════════════════════

## 許可されたステージ一覧（これ以外は使用禁止）
${stageDefinitions}

### 【絶対厳守】ステージ出力ルール

1. **stageフィールドには、上記一覧に記載された名前のみ出力可能**
2. **上記一覧にない名前を出力することは厳禁**
3. **迷った場合は、上記一覧の中から最も意味が近いものを選択すること**


### ステージ判定の手順
1. 顧客の発言内容を確認
2. 上記の許可されたステージ一覧を参照
3. 最も適切なステージを一覧から選択
4. **一覧にない名前は絶対に出力しない**

# ══════════════════════════════════════════════════════════════

【重要：業界・業種による違い】
このプロンプト内で示される例（カテゴリ名など）は参考例です。
実際の一般カテゴリ・カテゴリは、「一般カテゴリ一覧」と「カテゴリマスター一覧」に記載されたものを使用してください。

${inputDataExplainSection}## ★分析の目的と粒度

**目的：「ステージ」×「感情」×「一般カテゴリ」×「カテゴリ」の組み合わせで顧客の声を集計し、経営判断に活かすこと**

この目的のため、以下の粒度で抽出してください：
- **分割基準**：「一般カテゴリ」または「感情」が変わるときのみ分割
- **統合基準**：同じ「一般カテゴリ」かつ同じ「感情」なら、複数文でも1つにまとめる

---

## 分割・統合の判断基準（最優先ルール）

### ★最重要：同一トピックの一連の感想は統合する

**原則：同じ事柄（トピック）について述べている一連の文は、1つの抽出にまとめる**

以下のパターンは**必ず統合**すること：
1. **不満 → 改善要望**：不満を述べた後に「改善を期待」「〜してほしい」と続く場合は、**全体を「不満」として1つに統合**
2. **事実 → 評価**：事実を述べた後に感想・評価が続く場合は**統合**
3. **同じ一般カテゴリ × 同じ感情** → **必ず統合**
4. **比較・補足・理由説明** → メインの意見と**統合**
5. **「〜が良い。だから〜」のような因果関係** → **統合**

### 分割すべきケース（別々の抽出にする）
- **異なる一般カテゴリで、かつ独立したトピック** → 分割
- **明確に異なる感情で、かつ独立したトピック**（好意的 vs 不満 など） → 分割

### 分割NGの判断基準（迷ったら統合）
- 「改善を期待します」「〜してほしいです」「〜だと嬉しいです」→ 前の文と**統合**
- 「そのため」「だから」「ので」で繋がる文 → **統合**
- 同じ対象（人・物・場所）について述べている → **統合**

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

${additionalRules ? `### 追加ルール（厳守）\n${additionalRules}\n` : ''}
---

## 感情判定のルール

- **1つの抽出には1つの感情**を割り当てる
- **主たるトーン（メインの感情）を選択**する
- 好意的な評価の中に含まれる軽い要望・期待は「好意的」に分類
- **不満を述べた後の「改善を期待」「〜してほしい」は「不満」に分類**（リクエストではない）

---

## 感情(sentiment)の定義

- **好意的**：肯定的・賞賛的な評価語が含まれる
- **不満**：否定的・批判的な評価語が含まれる
- **リクエスト**：改善要望や提案語句が含まれる
- **その他**：上記3つのいずれにも明確に分類できない場合のみ使用

## 熱量スコア(magnitude)の定義（0–100）

- 0–25：軽度の感情表現
- 26–50：中程度の感情表現
- 51–75：強い感情表現
- 76–100：非常に強い情熱的表現

${correctionExamples ? `## 直近の正解事例（Few-Shot）\n${correctionExamples}\n\n` : ''}---

## 出力形式

- **「一般カテゴリ」×「感情」が変わるときのみ分割**して、配列形式で出力
- 必ずJSON形式で出力すること

### 出力フィールド（必須）

| フィールド | 説明 | 制約 |
|-----------|------|------|
| sentence | 抽出した原文 | 意味が完結した形 |
| stage | ステージ | **${stageNames}のいずれか（これ以外禁止）** |
| general_category | 一般カテゴリ | マスター一覧から選択 |
| category | カテゴリ | 原則13文字以内 |
| sentiment | 感情 | 「好意的」「不満」「リクエスト」「その他」 |
| posi_nega | ポジネガ判定 | 「positive」「negative」「neutral」 |
| magnitude | 熱量スコア | 0-100 |
| is_new_generated | 新規生成フラグ | 新規カテゴリの場合のみtrue |

### 出力例（※stageは必ず許可リストから選択）

入力: 「サービスが良くて満足しています。また利用したいです。」

\`\`\`json
[
  {"sentence": "サービスが良くて満足しています。また利用したいです。", "stage": "${exampleStage1}", "general_category": "（該当する一般カテゴリ）", "category": "サービスに満足", "sentiment": "好意的", "posi_nega": "positive", "magnitude": 50}
]
\`\`\`

※ stageは必ず「${stageNames}」のいずれかを使用すること

### カテゴリ選択ルール

1. マスタカテゴリ一覧を最優先で使用
2. ${
    allowCategoryGeneration
      ? `マスターに該当するカテゴリがない場合のみ、is_new_generated: true として新しいカテゴリを提案`
      : 'マスターカテゴリ一覧から必ず選択。新規カテゴリの生成は禁止'
  }
3. 一般カテゴリは必ず${generalCategoryNames}から選択

# ══════════════════════════════════════════════════════════════
# 【禁止事項】出力前に必ず確認すること
# ══════════════════════════════════════════════════════════════

1. **stageの値は${stageNames}以外を絶対に出力しないこと**
   - 新しいステージ名を生成・提案することは禁止
2. sentimentは「好意的」「不満」「リクエスト」「その他」のみ
3. posi_negaは「positive」「negative」「neutral」のみ
4. general_categoryは${generalCategoryNames}のみ
5. JSON以外の文字列を含めないこと

---`
}
