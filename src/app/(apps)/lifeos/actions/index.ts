'use server'

import {v4 as uuidv4} from 'uuid'
import OpenAI from 'openai'
import {
  ArchetypeType,
  ProcessNaturalLanguageResult,
  GenerateSchemaResult,
  SelectArchetypeResult,
  Plan,
  AILogRecord,
  MultiPlan,
  Category,
  DBCategory,
} from '../types'
import {categoryStore} from '../lib/store'

/**
 * OpenAI APIクライアントの初期化
 */
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY環境変数が設定されていません')
  }
  return new OpenAI({apiKey})
}

/**
 * 既存カテゴリと照合する
 */
function matchCategory(aiCategory: string, existingCategories: Category[]): string {
  // 完全一致
  const exactMatch = existingCategories.find(cat => cat.name === aiCategory)
  if (exactMatch) return exactMatch.name

  // 部分一致（大文字小文字を無視）
  const partialMatch = existingCategories.find(
    cat => cat.name.toLowerCase().includes(aiCategory.toLowerCase()) || aiCategory.toLowerCase().includes(cat.name.toLowerCase())
  )
  if (partialMatch) return partialMatch.name

  // 一致しない場合は新規カテゴリとして返す
  return aiCategory
}

/**
 * AIログレコードをPlanに変換
 */
function convertAILogRecordToPlan(record: AILogRecord, index: number): Plan {
  return {
    title: `${record.category}ログ #${index + 1}`,
    description: record.description,
    category: record.category,
    schema: record.schema,
    archetype: record.archetype,
    data: record.data,
    items: [
      {
        id: `${index + 1}-1`,
        label: `カテゴリ: ${record.category}`,
        status: 'pending',
      },
      {
        id: `${index + 1}-2`,
        label: `アーキタイプ: ${record.archetype}`,
        status: 'pending',
      },
      {
        id: `${index + 1}-3`,
        label: `データ項目: ${Object.keys(record.data).length}件`,
        status: 'pending',
      },
    ],
  }
}

/**
 * AIプロンプトを生成
 */
function generatePrompt(input: string, existingCategories: DBCategory[]): string {
  const categoryNames = existingCategories.map(cat => cat.name).join('、')
  const categoryList = categoryNames ? `既存カテゴリ: ${categoryNames}` : '既存カテゴリはありません'

  // 既存カテゴリのスキーマ情報とarchetypes情報をJSON形式で準備
  const categorySchemas = existingCategories.map(cat => ({
    name: cat.name,
    schema: cat.schema,
    archetypes: cat.archetypes || [],
  }))
  const categorySchemasJson = JSON.stringify(categorySchemas, null, 2)

  return `あなたはユーザーの自然言語入力から、複数のログレコードを抽出する専門家です。

【入力テキスト】
${input}

【既存カテゴリとスキーマ情報】
${categorySchemasJson}

【タスク】
1. 入力テキストから、記録すべき情報を可能な限り分割して抽出してください
2. 各情報について、以下のJSON形式でログレコードを作成してください：
   - category: カテゴリ名（${categoryList}を参考に、既存カテゴリに該当する場合は既存カテゴリ名を使用してください）
   - archetype: UIアーキタイプ（metric-tracker, task-list, timeline-log, attribute-card, heatmapのいずれか）
   - schema: 拡張データスキーマ（各フィールドにtype, label, displayType, unitを含む）
   - data: 抽出されたデータ（数値、文字列、日付など、実際の値を含むオブジェクト）
   - description: 元のテキストからの説明（簡潔に）
   - confidence: 抽出の確信度（0-1の数値）

【archetype選択の重要な原則】
1. **既存カテゴリを使用する場合**：
   - 既存カテゴリのarchetypes配列を参照してください
   - 既存カテゴリにarchetypesが定義されている場合、その中から最も適切なarchetypeを選択してください
   - 既存カテゴリにarchetypesが定義されていない、または空配列の場合、データの特性に基づいて適切なarchetypeを選択してください
   - 選択したarchetypeが既存カテゴリのarchetypesに含まれていない場合、それは新規archetypeとして扱われます

2. **新規カテゴリを作成する場合**：
   - データの特性に基づいて適切なarchetypeを選択してください

【スキーマ生成の重要な原則】
1. **既存カテゴリを使用する場合**：
   - 既存カテゴリのスキーマ情報を参照し、そのスキーマ構造に合わせてデータを抽出してください
   - 既存スキーマのフィールド名、型、ラベル、表示タイプなどを可能な限り維持してください
   - ユーザーの発話に既存スキーマにない新しい項目が含まれている場合は、その新規項目もスキーマに追加してください
   - 既存のenumフィールドに新しい選択肢が含まれている場合は、enum配列に追加してください

2. **新規カテゴリを作成する場合**：
   - ユーザーの発話から適切なスキーマを生成してください
   - スキーマフィールドには必ず必要なメタデータ（type, label, displayType, sortOrder等）を含めてください

【スキーマの必須フィールド】
schemaの各フィールドには必ず以下を含めてください：
- type: データ型（"string", "number", "boolean", "date"のいずれか。Array/Object型は使用しない）
- label: 日本語の表示用ラベル（例: "ページ数", "書籍名"）
- displayType: UI表示タイプ（"text", "textarea", "number", "boolean", "date", "datetime", "url", "email", "enum", "rating"のいずれか）
- sortOrder: 表示順序（数値、小さい順に表示される）
- required: 必須かどうか（boolean、デフォルト: false）
- description: フィールドの説明（任意）
- placeholder: プレースホルダー（任意）
- unit: 単位（数値の場合、例: "ページ", "km", "分"）※該当する場合のみ
- min/max: 数値の最小値/最大値（数値型の場合、任意）
- step: 数値の入力ステップ（数値型の場合、任意）
- enum: 選択肢の配列（enum型の場合、必須）
- enumLabels: 選択肢の表示ラベル（enum型の場合、任意。例: {"good": "良い", "bad": "悪い"}）

【出力形式】
以下のJSON形式で回答してください。records配列に、抽出されたすべてのログレコードを含めてください。

{
  "records": [
    {
      "category": "読書",
      "archetype": "attribute-card",
      "schema": {
        "pages": {
          "type": "number",
          "label": "ページ数",
          "displayType": "number",
          "sortOrder": 1,
          "required": true,
          "unit": "ページ",
          "min": 0
        },
        "bookTitle": {
          "type": "string",
          "label": "書籍名",
          "displayType": "text",
          "sortOrder": 0,
          "required": true,
          "placeholder": "書籍名を入力"
        },
        "timestamp": {
          "type": "date",
          "label": "記録日時",
          "displayType": "date",
          "sortOrder": 2,
          "required": false
        }
      },
      "data": {
        "pages": 10,
        "bookTitle": "Kindleの本",
        "timestamp": "2025-01-01T00:00:00Z"
      },
      "description": "Kindleの本を10ページ読んだ",
      "confidence": 0.9
    }
  ]
}

【重要な注意事項】
- 入力テキストに含まれるすべての記録すべき情報を抽出してください
- 各ログレコードは独立した情報として扱ってください
- **既存カテゴリを使用する場合**：
  * 既存スキーマのフィールド構造を可能な限り維持してください
  * 既存フィールドのsortOrder、required、unit、descriptionなどのメタデータも維持してください
  * ユーザーの発話に新規項目が含まれている場合は、既存スキーマに追加してください
  * 新規フィールドのsortOrderは既存フィールドの最大値+1から始めてください
  * archetypeは既存カテゴリのarchetypesから選択し、新規archetypeがあればそれも含めてください
- **新規カテゴリを作成する場合**：
  * カテゴリ名は既存カテゴリに該当しない場合のみ、適切な新規カテゴリ名を生成してください
  * スキーマフィールドには必ずlabel（日本語表示名）、displayType（UI表示タイプ）、sortOrder（表示順序）を含めてください
  * archetypeはデータの特性に基づいて適切に選択してください
- archetypeはデータの特性に応じて適切に選択してください：
  * metric-tracker: 数値データを追跡する場合（体重、距離、カロリーなど）
  * task-list: タスクやTODO項目の場合
  * timeline-log: 時系列のイベントやログの場合
  * attribute-card: 属性や特徴を記録する場合（読書、気分など）
  * heatmap: 時間帯や期間の分布を可視化する場合
- schemaとdataの構造（キー名）は完全に一致させてください
- 数値には適切な単位を含めてください
- 日付や時刻はISO 8601形式で記録してください
- sortOrderは0から始まる連番で、小さい順に表示されます
- requiredがtrueのフィールドは必須項目として扱われます
- enum型のフィールドにはenum配列を必ず含めてください
- 既存enumフィールドに新しい選択肢を追加する場合は、既存の選択肢も維持してください`
}

/**
 * 自然言語を処理してカテゴリとスキーマを生成
 */
export async function processNaturalLanguage(input: string): Promise<ProcessNaturalLanguageResult> {
  if (!input || input.trim().length === 0) {
    return {
      success: false,
      message: '入力が空です',
    }
  }

  try {
    // ステップ1: 既存カテゴリを取得
    let existingCategories: DBCategory[] = []
    try {
      existingCategories = await categoryStore.getAll()
    } catch (categoryError) {
      console.error('カテゴリ取得エラー:', categoryError)
      // カテゴリ取得に失敗しても処理を続行（空配列で続行）
    }

    // ステップ2: OpenAI APIを呼び出してログレコードを抽出
    let openai: OpenAI
    try {
      openai = getOpenAIClient()
    } catch (apiKeyError) {
      return {
        success: false,
        message: 'OpenAI APIキーが設定されていません。環境変数を確認してください。',
      }
    }

    const prompt = generatePrompt(input, existingCategories)

    let response
    try {
      response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'あなたは自然言語からログレコードを抽出する専門家です。ユーザーの入力から複数のログレコードを抽出し、JSON形式で返してください。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: {type: 'json_object'},
        temperature: 0.3, // 一貫性を重視
        max_tokens: 4000,
      })
    } catch (apiError: any) {
      console.error('OpenAI API呼び出しエラー:', apiError)

      // エラーの種類に応じたメッセージ
      if (apiError?.status === 401) {
        return {
          success: false,
          message: 'OpenAI APIキーが無効です。APIキーを確認してください。',
        }
      } else if (apiError?.status === 429) {
        return {
          success: false,
          message: 'APIレート制限に達しました。しばらく待ってから再試行してください。',
        }
      } else if (apiError?.status === 500 || apiError?.status >= 500) {
        return {
          success: false,
          message: 'OpenAI APIサーバーエラーが発生しました。しばらく待ってから再試行してください。',
        }
      } else {
        return {
          success: false,
          message: `AI API呼び出しに失敗しました: ${apiError?.message || 'Unknown error'}`,
        }
      }
    }

    const content = response.choices[0]?.message?.content
    if (!content) {
      return {
        success: false,
        message: 'AIからの応答が空です。もう一度お試しください。',
      }
    }

    // ステップ3: JSONをパース
    let aiResponse: {records: AILogRecord[]}
    try {
      // コードブロックを除去
      let jsonText = content.trim()
      const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/) || jsonText.match(/```\n([\s\S]*?)\n```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1]
      }

      // JSONオブジェクトの開始位置を探す
      const jsonStart = jsonText.indexOf('{')
      const jsonEnd = jsonText.lastIndexOf('}')
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd + 1)
      }

      aiResponse = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('JSONパースエラー:', parseError)
      console.error('AI応答（最初の500文字）:', content.substring(0, 500))
      return {
        success: false,
        message: `AIからの応答の解析に失敗しました。JSON形式が正しくありません。エラー: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
      }
    }

    // ステップ4: レコードの検証とカテゴリ照合
    if (!aiResponse.records || !Array.isArray(aiResponse.records)) {
      return {
        success: false,
        message: 'AIからの応答にrecords配列が見つかりませんでした。',
      }
    }

    if (aiResponse.records.length === 0) {
      return {
        success: false,
        message: '抽出されたログレコードがありません。入力テキストに記録すべき情報が含まれていない可能性があります。',
      }
    }

    // ステップ5: 各レコードの検証とカテゴリ照合
    const validationErrors: string[] = []
    const plans: Plan[] = aiResponse.records
      .map((record, index) => {
        // 基本的な検証
        if (!record.category) {
          validationErrors.push(`レコード ${index + 1}: カテゴリがありません`)
          return null
        }
        if (!record.archetype) {
          validationErrors.push(`レコード ${index + 1}: アーキタイプがありません`)
          return null
        }
        if (!['metric-tracker', 'task-list', 'timeline-log', 'attribute-card', 'heatmap'].includes(record.archetype)) {
          validationErrors.push(`レコード ${index + 1}: 無効なアーキタイプ "${record.archetype}"`)
          return null
        }
        if (!record.schema || typeof record.schema !== 'object') {
          validationErrors.push(`レコード ${index + 1}: スキーマが無効です`)
          return null
        }
        if (!record.data || typeof record.data !== 'object') {
          validationErrors.push(`レコード ${index + 1}: データが無効です`)
          return null
        }

        // カテゴリを照合
        const matchedCategory = matchCategory(record.category, existingCategories as unknown as Category[])
        const updatedRecord: AILogRecord = {
          ...record,
          category: matchedCategory,
        }
        return convertAILogRecordToPlan(updatedRecord, index)
      })
      .filter((plan): plan is Plan => plan !== null)

    // 検証エラーがある場合はログに記録
    if (validationErrors.length > 0) {
      console.warn('ログレコード検証エラー:', validationErrors)
    }

    if (plans.length === 0) {
      return {
        success: false,
        message: `有効なログレコードが抽出できませんでした。${validationErrors.length > 0 ? `エラー: ${validationErrors.join('; ')}` : ''}`,
      }
    }

    // 一部のレコードが無効な場合でも、有効なレコードがあれば成功として返す
    if (plans.length < aiResponse.records.length) {
      console.warn(
        `${aiResponse.records.length}件中${plans.length}件のログレコードが有効でした。無効なレコードはスキップされました。`
      )
    }

    // ステップ6: MultiPlanを作成
    const multiPlan: MultiPlan = {
      title: `${plans.length}件のログレコードを抽出`,
      description: `入力テキストから${plans.length}件のログレコードを抽出しました。各レコードを確認・編集してから保存してください。`,
      plans,
      totalRecords: plans.length,
    }

    return {
      success: true,
      plans,
      multiPlan,
    }
  } catch (error) {
    console.error('processNaturalLanguage エラー:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '処理に失敗しました',
    }
  }
}

/**
 * カテゴリとデータからスキーマを生成
 */
export async function generateSchema(category: string, data: unknown): Promise<GenerateSchemaResult> {
  try {
    // AIを使用してスキーマを生成
    const openai = getOpenAIClient()
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2)

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'あなたはデータからスキーマを生成する専門家です。',
        },
        {
          role: 'user',
          content: `カテゴリ: ${category}\nデータ: ${dataStr}\n\nこのデータから適切なスキーマを生成し、適切なアーキタイプを選択してください。JSON形式で返してください。`,
        },
      ],
      response_format: {type: 'json_object'},
      temperature: 0.3,
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return {
        success: false,
        message: 'AIからの応答が空です',
      }
    }

    try {
      const result = JSON.parse(content)
      return {
        success: true,
        schema: result.schema || {},
        archetype: result.archetype || 'attribute-card',
      }
    } catch (parseError) {
      return {
        success: false,
        message: 'スキーマ生成の解析に失敗しました',
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'スキーマ生成に失敗しました',
    }
  }
}

/**
 * スキーマから適切なアーキタイプを選択
 */
export async function selectArchetype(schema: unknown): Promise<SelectArchetypeResult> {
  try {
    const schemaObj = schema as Record<string, unknown>

    // スキーマの特性からアーキタイプを推測
    let archetype: ArchetypeType = 'attribute-card'

    const hasNumericFields = Object.values(schemaObj).some(
      field => typeof field === 'object' && field !== null && (field as any).type === 'number'
    )
    const hasStatusField = 'status' in schemaObj
    const hasTimelineFields = 'timestamp' in schemaObj || 'startTime' in schemaObj || 'endTime' in schemaObj

    if (hasStatusField) {
      archetype = 'task-list'
    } else if (hasNumericFields) {
      archetype = 'metric-tracker'
    } else if (hasTimelineFields) {
      archetype = 'timeline-log'
    }

    return {
      success: true,
      archetype,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'アーキタイプ選択に失敗しました',
    }
  }
}

/**
 * ログを保存
 */
export async function saveLog(data: {
  category: string
  schema: Record<string, unknown>
  archetype: ArchetypeType
  data: unknown
}): Promise<{success: boolean; id?: string; message?: string}> {
  try {
    // TODO: Prismaでデータベースに保存
    const id = uuidv4()

    return {
      success: true,
      id,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '保存に失敗しました',
    }
  }
}

/**
 * カテゴリを保存
 */
export async function saveCategory(data: {
  name: string
  description?: string
  schema: Record<string, unknown>
}): Promise<{success: boolean; id?: string; message?: string}> {
  try {
    // TODO: Prismaでデータベースに保存
    const id = uuidv4()

    return {
      success: true,
      id,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '保存に失敗しました',
    }
  }
}
