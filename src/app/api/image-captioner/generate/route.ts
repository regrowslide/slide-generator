import {NextRequest, NextResponse} from 'next/server'
import {GenerateResponse} from 'src/app/(apps)/image-captioner/types'

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent'
const MAX_RETRIES = 3
const RETRY_DELAY_BASE = 1000 // 1秒

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function callGeminiGenerateAPIWithRetry(
  apiKey: string,
  base64Data: string,
  prompt: string,
  retries = MAX_RETRIES
): Promise<{success: boolean; data?: any; error?: string}> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
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
                {
                  inline_data: {
                    mime_type: 'image/png',
                    data: base64Data,
                  },
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
        // 4xxエラーはリトライしない
        if (response.status >= 400 && response.status < 500) {
          return {
            success: false,
            error: `Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`,
          }
        }
        // 5xxエラーやネットワークエラーはリトライ
        if (attempt < retries - 1) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt) // 指数バックオフ
          console.log(`リトライ ${attempt + 1}/${retries}: ${delay}ms待機...`)
          await sleep(delay)
          continue
        }

        return {
          success: false,
          error: `Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`,
        }
      }

      const data = await response.json()

      // 生成された画像を取得（キャメルケースとスネークケースの両方に対応）
      const imagePart = data.candidates?.[0]?.content?.parts?.find((part: any) => {
        const inlineData = part.inlineData || part.inline_data
        console.log(inlineData) //logs
        return inlineData?.mimeType?.startsWith('image/') || inlineData?.mime_type?.startsWith('image/')
      })

      if (!imagePart) {
        // 画像が見つからない場合もリトライ
        if (attempt < retries - 1) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
          console.log(`生成された画像が見つかりません。リトライ ${attempt + 1}/${retries}: ${delay}ms待機...`)
          await sleep(delay)
          continue
        }
        return {
          success: false,
          error: '生成された画像が見つかりません',
        }
      }

      // キャメルケースとスネークケースの両方に対応
      const inlineData = imagePart.inlineData || imagePart.inline_data
      const imageData = inlineData?.data

      if (!imageData) {
        if (attempt < retries - 1) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
          console.log(`画像データが見つかりません。リトライ ${attempt + 1}/${retries}: ${delay}ms待機...`)
          await sleep(delay)
          continue
        }
        return {
          success: false,
          error: '生成された画像のデータが見つかりません',
        }
      }

      return {success: true, data: {inlineData: {mimeType: inlineData?.mimeType || inlineData?.mime_type, data: imageData}}}
    } catch (error) {
      // ネットワークエラーなど
      if (attempt < retries - 1) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
        console.log(`エラー発生。リトライ ${attempt + 1}/${retries}: ${delay}ms待機...`, error)
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
    const {imageBase64, caption, captionPrompt, aspectRatio, resolution} = body

    if (!imageBase64 || !caption) {
      return NextResponse.json(
        {
          success: false,
          error: '画像データまたはキャプションが提供されていません',
        } as GenerateResponse,
        {status: 400}
      )
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEY環境変数が設定されていません',
        } as GenerateResponse,
        {status: 500}
      )
    }

    // Base64データからdata:image/...の部分を除去
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64

    // 解像度のマッピング
    const resolutionMap: Record<string, {width: number; height: number}> = {
      '1024': {width: 1024, height: 1024},
      '2048': {width: 2048, height: 2048},
      '3072': {width: 3072, height: 3072},
      '4K': {width: 3840, height: 2160},
    }

    // アスペクト比のマッピング
    const aspectRatioMap: Record<string, {width: number; height: number}> = {
      '16:9': {width: 16, height: 9},
      '4:3': {width: 4, height: 3},
      '1:1': {width: 1, height: 1},
      '21:9': {width: 21, height: 9},
    }

    const baseRes = resolutionMap[resolution] || resolutionMap['1024']
    const aspect = aspectRatioMap[aspectRatio] || aspectRatioMap['16:9']
    const aspectRatioValue = aspect.width / aspect.height

    // 解像度に基づいて幅と高さを計算
    let width = baseRes.width
    let height = baseRes.height

    if (aspectRatio !== '1:1') {
      if (width > height) {
        height = Math.round(width / aspectRatioValue)
      } else {
        width = Math.round(height * aspectRatioValue)
      }
    }

    // プロンプトを作成
    const prompt = `以下の画像に、以下のキャプションを自然に組み込んだ新しい画像を生成してください。

【元の画像の内容】
${captionPrompt || caption}

【追加するキャプション】
${caption}

【要件】
- キャプションは画像の適切な位置に配置してください（通常は下部または上部）
- キャプションのフォントは読みやすく、画像の内容と調和するようにしてください
- 元の画像の内容を損なわないようにしてください
- マニュアルやドキュメントに適した、プロフェッショナルな見た目にしてください`

    const result = await callGeminiGenerateAPIWithRetry(apiKey, base64Data, prompt)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Unknown error',
        } as GenerateResponse,
        {status: 500}
      )
    }

    const imagePart = result.data!
    const inlineData = imagePart.inlineData || imagePart.inline_data
    const mimeType = inlineData?.mimeType || inlineData?.mime_type || 'image/png'
    const imageBase64Data = inlineData?.data

    if (!imageBase64Data) {
      return NextResponse.json(
        {
          success: false,
          error: '画像データが見つかりません',
        } as GenerateResponse,
        {status: 500}
      )
    }

    // Base64データURLを生成
    const generatedImageUrl = `data:${mimeType};base64,${imageBase64Data}`

    return NextResponse.json({
      success: true,
      imageUrl: generatedImageUrl,
    } as GenerateResponse)
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as GenerateResponse,
      {status: 500}
    )
  }
}
