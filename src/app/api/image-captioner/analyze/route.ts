import {NextRequest, NextResponse} from 'next/server'
import {AnalyzeResponse} from '../../../app/(apps)/image-captioner/types'

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
const MAX_RETRIES = 3
const RETRY_DELAY_BASE = 1000 // 1秒

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function callGeminiAPIWithRetry(
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
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
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
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      if (!text) {
        // 応答が空の場合もリトライ
        if (attempt < retries - 1) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
          console.log(`応答が空です。リトライ ${attempt + 1}/${retries}: ${delay}ms待機...`)
          await sleep(delay)
          continue
        }
        return {
          success: false,
          error: 'Gemini APIからの応答が空です',
        }
      }

      return {success: true, data: {text, rawData: data}}
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
    const {imageBase64, context} = body

    if (!imageBase64) {
      return NextResponse.json(
        {
          success: false,
          error: '画像データが提供されていません',
        } as AnalyzeResponse,
        {status: 400}
      )
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEY環境変数が設定されていません',
        } as AnalyzeResponse,
        {status: 500}
      )
    }

    // Base64データからdata:image/...の部分を除去
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64

    // プロンプトを作成
    const prompt = `あなたはスクリーンショット解析の専門家です。以下の画像を詳細に分析し、マニュアル作成に適したキャプションを生成してください。

${context ? `【全体のコンテキスト】\n${context}\n` : ''}

【タスク】
1. 画像の内容を正確に理解する
2. マニュアルやドキュメントに適した、明確で簡潔なキャプションを生成する
3. 画像のどの部分をどう説明すべきかの指示（captionPrompt）も生成する

【出力形式】
以下のJSON形式で回答してください：

{
  "caption": "画像の内容を簡潔に説明したキャプション（50文字程度）",
  "captionPrompt": "画像のどの部分をどう説明するかの詳細な指示（200文字程度）"
}

【注意事項】
- キャプションは日本語で、専門用語を避けずに正確に記述してください
- スクリーンショットの場合は、UI要素や操作手順を明確に説明してください
- captionPromptは、後で画像生成AIに渡す際のプロンプトとして使える形式にしてください`

    const result = await callGeminiAPIWithRetry(apiKey, base64Data, prompt)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Unknown error',
        } as AnalyzeResponse,
        {status: 500}
      )
    }

    const text = result.data!.text

    // JSON部分を抽出
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // JSONが見つからない場合、テキストから推測して返す
      return NextResponse.json({
        success: true,
        caption: text.substring(0, 100),
        captionPrompt: text,
      } as AnalyzeResponse)
    }

    const jsonText = jsonMatch[1] || jsonMatch[0]
    const parsedResult = JSON.parse(jsonText)

    return NextResponse.json({
      success: true,
      caption: parsedResult.caption || text.substring(0, 100),
      captionPrompt: parsedResult.captionPrompt || text,
    } as AnalyzeResponse)
  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as AnalyzeResponse,
      {status: 500}
    )
  }
}

