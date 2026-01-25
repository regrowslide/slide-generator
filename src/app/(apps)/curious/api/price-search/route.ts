/**
 * 商品価格検索API
 *
 * Gemini API のGoogle Search Grounding機能を使用
 * 商品名、価格、重量、キロ単価をAIで計算して取得
 *
 * 検索順序: a-price.jp → 楽天市場 → 一般検索
 */

import {NextRequest, NextResponse} from 'next/server'

// ===== 型定義 =====

export type SearchSource = 'a-price' | 'rakuten' | 'market' | 'none'

export interface PriceSearchProduct {
  name: string // 商品名
  productId: string | null // 商品ID（あれば）
  price: number | null // 販売価格（円）
  priceText: string // 価格表示テキスト
  weight: number | null // 重量（g）
  weightText: string | null // 重量表示テキスト
  pricePerKg: number | null // キロ単価（円/kg）- AIで計算
  confidence: number // 0-100%
}

export interface PriceSearchResponse {
  success: boolean
  query: string
  source: SearchSource
  product: PriceSearchProduct | null
  error?: string
  rawText?: string
}

// ===== 定数 =====

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL = 'gemini-2.0-flash'

// ===== Gemini API Response型 =====

interface GroundingSupport {
  groundingChunkIndices?: number[]
  confidenceScores?: number[]
}

interface GeminiGroundingResponse {
  candidates?: Array<{
    content?: {parts?: Array<{text?: string}>}
    groundingMetadata?: {
      groundingSupports?: GroundingSupport[]
    }
  }>
  error?: {message: string}
}

// ===== ユーティリティ関数 =====

const parseNumber = (str: string | number | null | undefined): number | null => {
  if (str === null || str === undefined) return null
  if (typeof str === 'number') return str
  const num = parseFloat(String(str).replace(/[^\d.]/g, ''))
  return isNaN(num) ? null : num
}

/**
 * 信頼性スコア計算
 */
const calcConfidence = (
  hasName: boolean,
  hasPrice: boolean,
  hasWeight: boolean,
  hasPricePerKg: boolean,
  supports: GroundingSupport[] | undefined
): number => {
  let score = 0
  if (hasName) score += 20
  if (hasPrice) score += 25
  if (hasWeight) score += 15
  if (hasPricePerKg) score += 20

  if (supports?.length) {
    const avg =
      supports.reduce((sum, s) => {
        const scores = s.confidenceScores || []
        return sum + (scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0)
      }, 0) / supports.length
    score += Math.round(avg * 20)
  }

  return Math.min(100, score)
}

interface ParsedProduct {
  name: string
  productId: string | null
  price: number | null
  priceText: string
  weight: number | null
  weightText: string | null
  pricePerKg: number | null
}

/**
 * JSONから商品情報抽出（重量・キロ単価含む）
 */
const extractProduct = (text: string): ParsedProduct | null => {
  // コードブロック除去
  const str = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*$/g, '')
    .trim()

  // オブジェクト抽出
  let depth = 0
  let start = -1
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{') {
      if (depth === 0) start = i
      depth++
    } else if (str[i] === '}') {
      depth--
      if (depth === 0 && start !== -1) {
        try {
          const obj = JSON.parse(str.substring(start, i + 1))
          if (obj.name && typeof obj.name === 'string' && obj.name.length >= 2) {
            const price = parseNumber(obj.price)
            const weight = parseNumber(obj.weight || obj.weightG)
            const pricePerKg = parseNumber(obj.pricePerKg)

            return {
              name: String(obj.name).trim(),
              productId: obj.productId ? String(obj.productId) : null,
              price,
              priceText: obj.priceText ? String(obj.priceText) : price ? `${price.toLocaleString()}円` : '価格不明',
              weight,
              weightText: obj.weightText ? String(obj.weightText) : weight ? `${weight}g` : null,
              pricePerKg,
            }
          }
        } catch {
          // パース失敗、次のオブジェクトを探す
        }
        start = -1
      }
    }
  }

  return null
}

// ===== Gemini API呼び出し =====

interface SearchResult {
  product: PriceSearchProduct | null
  rawText: string
}

const search = async (prompt: string, apiKey: string): Promise<SearchResult> => {
  const endpoint = `${GEMINI_API_BASE}/${MODEL}:generateContent?key=${apiKey}`

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        contents: [{parts: [{text: prompt}]}],
        tools: [{google_search: {}}],
        generationConfig: {temperature: 0, maxOutputTokens: 1024},
      }),
    })

    if (!res.ok) return {product: null, rawText: ''}

    const data: GeminiGroundingResponse = await res.json()
    if (data.error) return {product: null, rawText: ''}

    // 全candidates・全partsからテキストを結合
    const texts: string[] = []
    for (const candidate of data.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.text) {
          texts.push(part.text)
        }
      }
    }
    const text = texts.join('\n')

    // groundingMetadataは最初のcandidateから取得（通常ここに含まれる）
    const supports = data.candidates?.[0]?.groundingMetadata?.groundingSupports

    if (!text) return {product: null, rawText: ''}

    // 該当なしチェック
    if (/該当.*なし|見つかりませんでした|0件/.test(text) && !text.includes('"name"')) {
      return {product: null, rawText: text}
    }

    const parsed = extractProduct(text)
    if (!parsed) return {product: null, rawText: text}

    const confidence = calcConfidence(true, !!parsed.price, !!parsed.weight, !!parsed.pricePerKg, supports)

    return {
      product: {
        name: parsed.name,
        productId: parsed.productId,
        price: parsed.price,
        priceText: parsed.priceText,
        weight: parsed.weight,
        weightText: parsed.weightText,
        pricePerKg: parsed.pricePerKg,
        confidence,
      },
      rawText: text,
    }
  } catch {
    return {product: null, rawText: ''}
  }
}

// ===== プロンプト =====

const createPrompt = (site: string, searchUrl: string, q: string) => `
${site}で「${q}」を検索し、業務用食材として最適な商品1件を取得してください。
検索URL: ${searchUrl}

【取得する情報】
1. 商品名（正式名称）
2. 商品ID（あれば）
3. 販売価格（税込）
4. 内容量・重量（g単位で計算）
5. キロ単価（価格÷重量×1000で計算）

【重要】
- 業務用・大容量商品を優先
- 重量は必ずg単位に換算（1kg=1000g、1L≒1000g）
- キロ単価は必ず計算して返す

JSON形式で返してください:
{
  "name": "商品名",
  "productId": "商品ID（あれば、なければnull）",
  "price": 数値（円）,
  "priceText": "○○円（税込）",
  "weight": 数値（g単位）,
  "weightText": "○kg / ○g / ○ml 等",
  "pricePerKg": 数値（円/kg）
}

該当商品がない場合は「該当商品なし」と回答。`

const promptAprice = (q: string) => createPrompt('a-price.jp', `https://a-price.jp/search?q=${encodeURIComponent(q)}`, q)

const promptRakuten = (q: string) =>
  createPrompt('楽天市場', `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(q)}/`, q)

const promptMarket = (q: string) => `
「${q}」の業務用食材としての市場価格を調査し、最適な商品1件を取得してください。
Amazon、業務スーパー、コストコ、卸売サイト等から調査してください。

【取得する情報】
1. 商品名（正式名称）
2. 商品ID（あれば）
3. 販売価格（税込）
4. 内容量・重量（g単位で計算）
5. キロ単価（価格÷重量×1000で計算）

【重要】
- 業務用・大容量商品を優先
- 重量は必ずg単位に換算（1kg=1000g、1L≒1000g）
- キロ単価は必ず計算して返す

JSON形式で返してください:
{
  "name": "商品名",
  "productId": "商品ID（あれば、なければnull）",
  "price": 数値（円）,
  "priceText": "○○円（税込）",
  "weight": 数値（g単位）,
  "weightText": "○kg / ○g / ○ml 等",
  "pricePerKg": 数値（円/kg）
}

該当商品がない場合は「該当商品なし」と回答。`

// ===== APIハンドラー =====

const sources: Array<{
  source: SearchSource
  prompt: (q: string) => string
}> = [
  {source: 'a-price', prompt: promptAprice},
  {source: 'rakuten', prompt: promptRakuten},
  {source: 'market', prompt: promptMarket},
]

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')
  const debug = req.nextUrl.searchParams.get('debug') === 'true'

  if (!query) {
    return NextResponse.json<PriceSearchResponse>(
      {
        success: false,
        query: '',
        source: 'none',
        product: null,
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
        source: 'none',
        product: null,
        error: 'GEMINI_API_KEYが設定されていません',
      },
      {status: 500}
    )
  }

  let lastRaw = ''

  for (const {source, prompt} of sources) {
    const result = await search(prompt(query), apiKey)

    lastRaw = result.rawText

    if (result.product && result.product.pricePerKg) {
      const res: PriceSearchResponse = {
        success: true,
        query,
        source,
        product: result.product,
      }
      if (debug) res.rawText = result.rawText
      return NextResponse.json<PriceSearchResponse>(res)
    }
  }

  const res: PriceSearchResponse = {
    success: true,
    query,
    source: 'none',
    product: null,
  }
  if (debug) res.rawText = lastRaw
  return NextResponse.json<PriceSearchResponse>(res)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const query = body.q || body.query

    if (!query) {
      return NextResponse.json<PriceSearchResponse>(
        {
          success: false,
          query: '',
          source: 'none',
          product: null,
          error: '検索クエリが必要です',
        },
        {status: 400}
      )
    }

    const url = new URL(req.url)
    url.searchParams.set('q', query)
    if (body.debug) url.searchParams.set('debug', 'true')

    return GET(new NextRequest(url))
  } catch {
    return NextResponse.json<PriceSearchResponse>(
      {
        success: false,
        query: '',
        source: 'none',
        product: null,
        error: 'リクエスト解析エラー',
      },
      {status: 400}
    )
  }
}
