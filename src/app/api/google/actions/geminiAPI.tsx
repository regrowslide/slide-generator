/**
 * Gemini API 共通ヘルパー
 *
 * 主な機能:
 * - Structured Output（responseMimeType + responseSchema）対応
 * - 堅牢なJSON抽出（複数パターン対応）
 * - JSON修復機能（末尾カンマ等の自動修正）
 * - リトライ機構
 */

// ===== 型定義 =====

export type GeminiModel =
  | 'gemini-2.5-flash'
  | 'gemini-2.0-flash'
  | 'gemini-1.5-flash'
  | 'gemini-1.5-pro'
  | 'gemini-3-flash-preview'
  | 'gemini-2.5-flash-lite'

export interface GeminiGenerationConfig {
  temperature?: number
  topK?: number
  topP?: number
  maxOutputTokens?: number
  responseMimeType?: 'application/json' | 'text/plain'
  responseSchema?: GeminiResponseSchema
}

export interface GeminiResponseSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean'
  items?: GeminiResponseSchema
  properties?: Record<string, GeminiResponseSchema>
  required?: string[]
  enum?: string[]
  description?: string
}

export interface GeminiInlineData {
  mimeType: string
  data: string
}

export interface GeminiRequestOptions {
  model?: GeminiModel
  prompt: string
  inlineData?: GeminiInlineData[]
  generationConfig?: GeminiGenerationConfig
  maxRetries?: number
  retryDelayMs?: number
  apiKey?: string
}

export interface GeminiResponse<T = unknown> {
  success: boolean
  data?: T
  rawText?: string
  error?: string
  retryCount?: number
}

// ===== 定数 =====

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

const DEFAULT_GENERATION_CONFIG: GeminiGenerationConfig = {
  temperature: 0.2,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 4096,
}

// ===== JSON抽出・修復関数 =====

/**
 * Geminiの応答テキストからJSONを抽出する
 * 複数のパターンに対応
 */
export function extractJsonFromResponse(text: string): string | null {
  if (!text || typeof text !== 'string') return null

  const trimmedText = text.trim()

  // パターン1: ```json ... ``` (大文字小文字不問、改行有無両対応)
  const codeBlockMatch = trimmedText.match(/```(?:json|JSON)?\s*([\s\S]*?)```/i)
  if (codeBlockMatch && codeBlockMatch[1]) {
    const content = codeBlockMatch[1].trim()
    if (content.startsWith('[') || content.startsWith('{')) {
      return content
    }
  }

  // パターン2: 配列全体を抽出（貪欲マッチ）
  const arrayMatch = trimmedText.match(/\[\s*\{[\s\S]*\}\s*\]/)
  if (arrayMatch) {
    return arrayMatch[0]
  }

  // パターン3: オブジェクト全体を抽出
  const objectMatch = trimmedText.match(/\{[\s\S]*\}/)
  if (objectMatch) {
    return objectMatch[0]
  }

  // パターン4: テキストがそのままJSONの場合
  if (
    (trimmedText.startsWith('[') && trimmedText.endsWith(']')) ||
    (trimmedText.startsWith('{') && trimmedText.endsWith('}'))
  ) {
    return trimmedText
  }

  return null
}

/**
 * 軽微なJSON形式エラーを修復する
 */
export function repairJson(jsonString: string): string {
  if (!jsonString) return jsonString

  let repaired = jsonString

  // 末尾カンマを除去（配列）
  repaired = repaired.replace(/,(\s*)\]/g, '$1]')

  // 末尾カンマを除去（オブジェクト）
  repaired = repaired.replace(/,(\s*)\}/g, '$1}')

  // 改行を含む文字列内の生の改行を\nに変換（JSONパースエラー対策）
  // 注: これは慎重に行う必要がある

  return repaired
}

/**
 * JSONを安全にパースする（修復試行付き）
 */
export function safeJsonParse<T>(jsonString: string): { success: boolean; data?: T; error?: string } {
  if (!jsonString) {
    return { success: false, error: 'Empty JSON string' }
  }

  // 1回目: そのままパース
  try {
    const data = JSON.parse(jsonString) as T
    return { success: true, data }
  } catch (firstError) {
    // 2回目: 修復してパース
    try {
      const repaired = repairJson(jsonString)
      const data = JSON.parse(repaired) as T
      return { success: true, data }
    } catch (secondError) {
      return {
        success: false,
        error: `JSON parse failed: ${secondError instanceof Error ? secondError.message : 'Unknown error'}`,
      }
    }
  }
}

// ===== メイン関数 =====

/**
 * Gemini APIを呼び出す（リトライ機構付き）
 *
 * @example
 * // 基本的な使用法
 * const result = await callGeminiAPI({
 *   prompt: 'Hello, Gemini!',
 * })
 *
 * @example
 * // JSON形式のレスポンスを強制する（Structured Output）
 * const result = await callGeminiAPI<MyType[]>({
 *   prompt: 'Analyze this text...',
 *   generationConfig: {
 *     responseMimeType: 'application/json',
 *     responseSchema: {
 *       type: 'array',
 *       items: {
 *         type: 'object',
 *         properties: {
 *           name: { type: 'string' },
 *           value: { type: 'number' },
 *         },
 *         required: ['name', 'value'],
 *       },
 *     },
 *   },
 * })
 */
export async function callGeminiAPI<T = unknown>(options: GeminiRequestOptions): Promise<GeminiResponse<T>> {
  const {
    model = 'gemini-2.0-flash',
    prompt,
    generationConfig = {},
    maxRetries = 2,
    retryDelayMs = 1000,
    apiKey = process.env.GEMINI_API_KEY,
  } = options

  if (!apiKey) {
    return {
      success: false,
      error: 'GEMINI_API_KEY環境変数が設定されていません',
    }
  }

  if (!prompt) {
    return {
      success: false,
      error: 'プロンプトが指定されていません',
    }
  }

  const endpoint = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`

  const mergedConfig: GeminiGenerationConfig = {
    ...DEFAULT_GENERATION_CONFIG,
    ...generationConfig,
  }

  const { inlineData } = options

  const parts: Array<{ text: string } | { inlineData: GeminiInlineData }> = [
    ...(inlineData || []).map(d => ({ inlineData: d })),
    { text: prompt },
  ]

  const requestBody = {
    contents: [{ parts }],
    generationConfig: mergedConfig,
  }

  let lastError: string = ''
  let retryCount = 0

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Gemini API Error (attempt ${attempt + 1}):`, errorText)
        lastError = `Gemini API Error: ${response.status} ${response.statusText}`

        if (attempt < maxRetries) {
          retryCount++
          await delay(retryDelayMs * (attempt + 1)) // バックオフ
          continue
        }
        break
      }

      const data = await response.json()
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      if (!rawText) {
        lastError = 'Gemini APIからの応答が空です'
        if (attempt < maxRetries) {
          retryCount++
          await delay(retryDelayMs * (attempt + 1))
          continue
        }
        break
      }

      // JSON形式が期待される場合
      if (mergedConfig.responseMimeType === 'application/json' || mergedConfig.responseSchema) {
        // Structured Outputの場合、レスポンスは直接JSONのはず
        const parseResult = safeJsonParse<T>(rawText)
        if (parseResult.success) {
          return {
            success: true,
            data: parseResult.data,
            rawText,
            retryCount,
          }
        }

        // Structured Outputでもパースに失敗した場合、JSON抽出を試みる
        const extractedJson = extractJsonFromResponse(rawText)
        if (extractedJson) {
          const extractParseResult = safeJsonParse<T>(extractedJson)
          if (extractParseResult.success) {
            return {
              success: true,
              data: extractParseResult.data,
              rawText,
              retryCount,
            }
          }
        }

        lastError = 'AIからの応答をJSONとして解析できませんでした'
        if (attempt < maxRetries) {
          retryCount++
          await delay(retryDelayMs * (attempt + 1))
          continue
        }

        return {
          success: false,
          error: lastError,
          rawText,
          retryCount,
        }
      }

      // テキスト形式の場合
      return {
        success: true,
        data: rawText as unknown as T,
        rawText,
        retryCount,
      }
    } catch (error) {
      console.error(`Gemini API call failed (attempt ${attempt + 1}):`, error)
      lastError = error instanceof Error ? error.message : 'Unknown error'

      if (attempt < maxRetries) {
        retryCount++
        await delay(retryDelayMs * (attempt + 1))
        continue
      }
    }
  }

  return {
    success: false,
    error: lastError || 'Gemini API呼び出しに失敗しました',
    retryCount,
  }
}

/**
 * JSON形式のレスポンスを期待するGemini API呼び出し
 * Structured Outputを自動的に有効化し、フォールバックとしてJSON抽出も行う
 */
export async function callGeminiForJson<T>(
  prompt: string,
  responseSchema: GeminiResponseSchema,
  options?: Omit<GeminiRequestOptions, 'prompt' | 'generationConfig'> & {
    generationConfig?: Omit<GeminiGenerationConfig, 'responseMimeType' | 'responseSchema'>
  }
): Promise<GeminiResponse<T>> {
  return callGeminiAPI<T>({
    ...options,
    prompt,
    generationConfig: {
      ...options?.generationConfig,
      responseMimeType: 'application/json',
      responseSchema,
    },
  })
}

/**
 * テキスト形式のレスポンスを期待するGemini API呼び出し
 */
export async function callGeminiForText(
  prompt: string,
  options?: Omit<GeminiRequestOptions, 'prompt'>
): Promise<GeminiResponse<string>> {
  return callGeminiAPI<string>({
    ...options,
    prompt,
    generationConfig: {
      ...options?.generationConfig,
      responseMimeType: 'text/plain',
    },
  })
}

// ===== ユーティリティ =====

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
