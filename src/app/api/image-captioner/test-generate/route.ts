import {NextRequest, NextResponse} from 'next/server'

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent'
const MAX_RETRIES = 3
const RETRY_DELAY_BASE = 1000 // 1秒

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

interface TestGenerateResponse {
  success: boolean
  imageUrl?: string
  error?: string
}

async function callGeminiTextToImageAPI(
  apiKey: string,
  prompt: string,
  retries = MAX_RETRIES
): Promise<{success: boolean; data?: any; error?: string}> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`[Attempt ${attempt + 1}/${retries}] Calling Gemini API with prompt: ${prompt.substring(0, 50)}...`)

      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[Attempt ${attempt + 1}] API Error:`, response.status, errorText)

        // 4xxエラーはリトライしない
        if (response.status >= 400 && response.status < 500) {
          return {
            success: false,
            error: `Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`,
          }
        }

        // 5xxエラーやネットワークエラーはリトライ
        if (attempt < retries - 1) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
          console.log(`[Attempt ${attempt + 1}] Retrying in ${delay}ms...`)
          await sleep(delay)
          continue
        }

        return {
          success: false,
          error: `Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`,
        }
      }

      const data = await response.json()
      console.log('[Success] Response data structure:', JSON.stringify(data, null, 2).substring(0, 500))

      // 生成された画像を取得
      const candidates = data.candidates || []
      if (candidates.length === 0) {
        if (attempt < retries - 1) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
          console.log(`[Attempt ${attempt + 1}] No candidates found. Retrying in ${delay}ms...`)
          await sleep(delay)
          continue
        }
        return {
          success: false,
          error: '生成された画像が見つかりません（candidatesが空です）',
        }
      }

      const content = candidates[0]?.content
      if (!content) {
        if (attempt < retries - 1) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
          console.log(`[Attempt ${attempt + 1}] No content found. Retrying in ${delay}ms...`)
          await sleep(delay)
          continue
        }
        return {
          success: false,
          error: '生成された画像が見つかりません（contentが空です）',
        }
      }

      const parts = content.parts || []
      // inlineData (キャメルケース) と inline_data (スネークケース) の両方に対応
      const imagePart = parts.find((part: any) => {
        const inlineData = part.inlineData || part.inline_data
        return inlineData?.mimeType?.startsWith('image/') || inlineData?.mime_type?.startsWith('image/')
      })

      if (!imagePart) {
        if (attempt < retries - 1) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
          console.log(`[Attempt ${attempt + 1}] No image part found. Retrying in ${delay}ms...`)
          await sleep(delay)
          continue
        }
        return {
          success: false,
          error: '生成された画像が見つかりません（imagePartが空です）',
        }
      }

      // キャメルケースとスネークケースの両方に対応
      const inlineData = imagePart.inlineData || imagePart.inline_data
      const mimeType = inlineData?.mimeType || inlineData?.mime_type
      const imageData = inlineData?.data

      if (!imageData) {
        if (attempt < retries - 1) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
          console.log(`[Attempt ${attempt + 1}] No image data found. Retrying in ${delay}ms...`)
          await sleep(delay)
          continue
        }
        return {
          success: false,
          error: '生成された画像のデータが見つかりません',
        }
      }

      console.log('[Success] Image data found, mime_type:', mimeType)
      return {success: true, data: {inlineData: {mimeType, data: imageData}}}
    } catch (error) {
      // ネットワークエラーなど
      console.error(`[Attempt ${attempt + 1}] Network error:`, error)
      if (attempt < retries - 1) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
        console.log(`[Attempt ${attempt + 1}] Retrying in ${delay}ms...`)
        await sleep(delay)
        continue
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  return {
    success: false,
    error: `最大リトライ回数（${retries}回）に達しました`,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {prompt} = body

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'プロンプトが提供されていません',
        } as TestGenerateResponse,
        {status: 400}
      )
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEY環境変数が設定されていません',
        } as TestGenerateResponse,
        {status: 500}
      )
    }

    console.log('[Request] Generating image with prompt:', prompt)

    const result = await callGeminiTextToImageAPI(apiKey, prompt.trim())

    if (!result.success) {
      console.error('[Error] Generation failed:', result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Unknown error',
        } as TestGenerateResponse,
        {status: 500}
      )
    }

    const imagePart = result.data!
    const inlineData = imagePart.inlineData || imagePart.inline_data
    const mimeType = inlineData?.mimeType || inlineData?.mime_type || 'image/png'
    const base64Data = inlineData?.data || inlineData?.data

    // Base64データURLを生成
    const generatedImageUrl = `data:${mimeType};base64,${base64Data}`

    console.log('[Success] Image generated successfully, size:', base64Data.length, 'bytes')

    return NextResponse.json({
      success: true,
      imageUrl: generatedImageUrl,
    } as TestGenerateResponse)
  } catch (error) {
    console.error('[Error] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as TestGenerateResponse,
      {status: 500}
    )
  }
}
