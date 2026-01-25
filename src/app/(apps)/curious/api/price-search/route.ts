/**
 * A-Price商品検索API
 *
 * Gemini APIのGoogle Search Grounding機能を使用して
 * a-price.jpから商品データを取得する
 */

import {NextRequest, NextResponse} from 'next/server'

// ===== 型定義 =====

export interface PriceSearchProduct {
  name: string // 商品名
  price: number | null // 価格（税込）
  priceText: string // 価格表示テキスト
  description: string | null // 商品説明
  category: string | null // カテゴリ
}

export interface PriceSearchResponse {
  success: boolean
  query: string
  products: PriceSearchProduct[]
  totalFound: number
  error?: string
  rawText?: string // デバッグ用
}

// ===== 定数 =====

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL = 'gemini-2.0-flash'

// ===== Gemini API Response型 =====

interface GeminiGroundingResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
    groundingMetadata?: {
      groundingChunks?: Array<{
        web?: {
          uri?: string
          title?: string
        }
      }>
    }
  }>
  error?: {
    message: string
  }
}

// ===== JSON修復・パース関数 =====

/**
 * 不完全なJSONを修復する
 * - 途中で切れた文字列を閉じる
 * - 途中で切れたオブジェクト/配列を閉じる
 * - 不完全なオブジェクトを除去
 */
const repairIncompleteJson = (jsonStr: string): string => {
  let str = jsonStr.trim()

  // コードブロックを除去
  str = str.replace(/```json\s*/gi, '').replace(/```\s*$/g, '')

  // 配列の開始を確認
  if (!str.startsWith('[')) {
    const arrayStart = str.indexOf('[')
    if (arrayStart !== -1) {
      str = str.substring(arrayStart)
    } else {
      return '[]'
    }
  }

  // 最後の完全なオブジェクトを見つける
  const completedObjects: string[] = []
  let depth = 0
  let inString = false
  let escapeNext = false
  let objectStart = -1

  for (let i = 0; i < str.length; i++) {
    const char = str[i]

    if (escapeNext) {
      escapeNext = false
      continue
    }

    if (char === '\\') {
      escapeNext = true
      continue
    }

    if (char === '"' && !escapeNext) {
      inString = !inString
      continue
    }

    if (inString) continue

    if (char === '{') {
      if (depth === 1) {
        objectStart = i
      }
      depth++
    } else if (char === '}') {
      depth--
      if (depth === 1 && objectStart !== -1) {
        // 完全なオブジェクトを抽出
        const obj = str.substring(objectStart, i + 1)
        completedObjects.push(obj)
        objectStart = -1
      }
    } else if (char === '[' && depth === 0) {
      depth = 1
    } else if (char === ']' && depth === 1) {
      break
    }
  }

  if (completedObjects.length === 0) {
    return '[]'
  }

  return '[' + completedObjects.join(',') + ']'
}

/**
 * 商品オブジェクトが有効かどうかを検証
 */
const isValidProduct = (obj: unknown): obj is Record<string, unknown> => {
  if (!obj || typeof obj !== 'object') return false
  const product = obj as Record<string, unknown>

  // 最低限 name が必要
  if (!product.name || typeof product.name !== 'string') return false
  if (product.name.length < 2) return false

  return true
}

/**
 * 価格文字列から数値を抽出
 */
const parsePrice = (priceStr: string): number | null => {
  if (!priceStr) return null
  const cleaned = String(priceStr).replace(/[^\d]/g, '')
  const price = parseInt(cleaned, 10)
  return isNaN(price) ? null : price
}

/**
 * JSONテキストから商品配列を抽出
 */
const extractProductsFromJson = (text: string): PriceSearchProduct[] => {
  // 修復したJSONをパース
  const repairedJson = repairIncompleteJson(text)

  try {
    const parsed = JSON.parse(repairedJson)
    const items = Array.isArray(parsed) ? parsed : []

    return items
      .filter(isValidProduct)
      .slice(0, 10)
      .map((p): PriceSearchProduct => {
        const priceValue = typeof p.price === 'number' ? p.price : parsePrice(String(p.price || p.priceText || ''))

        return {
          name: String(p.name || '').trim(),
          price: priceValue,
          priceText: p.priceText ? String(p.priceText) : priceValue ? `${priceValue.toLocaleString()}円` : '価格不明',
          description: p.description ? String(p.description).trim() : null,
          category: p.category ? String(p.category).trim() : null,
        }
      })
  } catch (error) {
    console.error('JSON parse failed after repair:', error)
    console.error('Repaired JSON:', repairedJson.substring(0, 500))
    return []
  }
}

/**
 * テキストレスポンスから商品情報を抽出（フォールバック）
 */
const extractProductsFromText = (text: string): PriceSearchProduct[] => {
  const products: PriceSearchProduct[] = []

  // 商品名と価格のパターンを探す
  // 例: "商品名 - 1,234円" や "商品名: 1234円（税込）"
  const patterns = [
    /[「『]([^」』]+)[」』]\s*[:\-－：]?\s*(\d{1,3}(?:,\d{3})*)\s*円/g,
    /(\S+(?:\s+\S+)*?)\s+(\d{1,3}(?:,\d{3})*)\s*円(?:\s*[(（]税込[)）])?/g,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1].trim()
      const priceStr = match[2]

      if (name.length >= 2 && !products.some(p => p.name === name)) {
        const price = parsePrice(priceStr)
        products.push({
          name,
          price,
          priceText: `${priceStr}円`,
          description: null,
          category: null,
        })
      }

      if (products.length >= 10) break
    }
    if (products.length >= 10) break
  }

  return products
}

// ===== APIハンドラー =====

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const debug = searchParams.get('debug') === 'true'

  if (!query) {
    return NextResponse.json<PriceSearchResponse>(
      {
        success: false,
        query: '',
        products: [],
        totalFound: 0,
        error: '検索クエリ（q）が必要です',
      },
      {status: 400}
    )
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json<PriceSearchResponse>(
      {
        success: false,
        query,
        products: [],
        totalFound: 0,
        error: 'GEMINI_API_KEYが設定されていません',
      },
      {status: 500}
    )
  }

  // プロンプト: URLを省略してトークン節約
  const prompt = `
a-price.jp で「${query}」を検索して、商品情報をJSON形式で返してください。

検索URL: https://a-price.jp/search?q=${encodeURIComponent(query)}

以下の形式で最大10件まで出力:
\`\`\`json
[
  {"name": "商品名", "price": 数値, "priceText": "○○円（税込）", "description": "説明", "category": "カテゴリ"}
]
\`\`\`

ルール:
- URLやimageUrlは不要（含めないで）
- priceは数値のみ（カンマや円記号なし）
- 商品が見つからない場合は空配列 []
- 必ずJSON形式で
`

  const endpoint = `${GEMINI_API_BASE}/${MODEL}:generateContent?key=${apiKey}`
  const requestBody = {
    contents: [{parts: [{text: prompt}]}],
    tools: [{google_search: {}}],
    generationConfig: {
      temperature: 0.1,
    },
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API Error:', errorText)
      return NextResponse.json<PriceSearchResponse>(
        {
          success: false,
          query,
          products: [],
          totalFound: 0,
          error: `Gemini API Error: ${response.status}`,
        },
        {status: 500}
      )
    }

    const data: GeminiGroundingResponse = await response.json()

    if (data.error) {
      return NextResponse.json<PriceSearchResponse>(
        {
          success: false,
          query,
          products: [],
          totalFound: 0,
          error: data.error.message,
        },
        {status: 500}
      )
    }

    // すべてのパーツからテキストを結合
    const allTexts: string[] = []
    for (const candidate of data.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.text) {
          allTexts.push(part.text)
        }
      }
    }

    const fullText = allTexts.join('\n')

    if (debug) {
      console.log('=== Gemini Response ===')
      console.log(fullText)
      console.log('=======================')
    }

    if (!fullText) {
      return NextResponse.json<PriceSearchResponse>(
        {
          success: false,
          query,
          products: [],
          totalFound: 0,
          error: '応答が空です',
        },
        {status: 500}
      )
    }

    // JSONを含むテキストを探す
    let products: PriceSearchProduct[] = []

    // まずJSONパースを試みる
    if (fullText.includes('[') && fullText.includes('{')) {
      products = extractProductsFromJson(fullText)
    }

    // JSONパースが失敗した場合、テキスト抽出を試みる
    if (products.length === 0) {
      products = extractProductsFromText(fullText)
    }

    const responseData: PriceSearchResponse = {
      success: true,
      query,
      products,
      totalFound: products.length,
    }

    // デバッグモードの場合、生テキストも返す
    if (debug) {
      responseData.rawText = fullText
    }

    return NextResponse.json<PriceSearchResponse>(responseData)
  } catch (error) {
    console.error('Gemini API call failed:', error)
    return NextResponse.json<PriceSearchResponse>(
      {
        success: false,
        query,
        products: [],
        totalFound: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const query = body.q || body.query

    if (!query) {
      return NextResponse.json<PriceSearchResponse>(
        {
          success: false,
          query: '',
          products: [],
          totalFound: 0,
          error: '検索クエリ（q または query）が必要です',
        },
        {status: 400}
      )
    }

    // GETと同じ処理を実行
    const url = new URL(request.url)
    url.searchParams.set('q', query)
    if (body.debug) {
      url.searchParams.set('debug', 'true')
    }

    const getRequest = new NextRequest(url)
    return GET(getRequest)
  } catch {
    return NextResponse.json<PriceSearchResponse>(
      {
        success: false,
        query: '',
        products: [],
        totalFound: 0,
        error: 'リクエストボディの解析に失敗しました',
      },
      {status: 400}
    )
  }
}
