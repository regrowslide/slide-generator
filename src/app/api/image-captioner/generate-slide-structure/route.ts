import {NextRequest, NextResponse} from 'next/server'
import {GenerateSlideStructureResponse, SlideStructure} from 'src/app/(apps)/image-captioner/types'

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
const MAX_RETRIES = 2
const RETRY_DELAY_BASE = 100

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function callGeminiAPIWithRetry(
  apiKey: string,
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
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Gemini API error (attempt ${attempt + 1}/${retries}):`, errorText)

        // 5xxエラーの場合はリトライ
        if (response.status >= 500 && attempt < retries - 1) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
          await sleep(delay)
          continue
        }

        return {
          success: false,
          error: `API error: ${response.status} - ${errorText}`,
        }
      }

      const data = await response.json()
      return {success: true, data}
    } catch (error) {
      console.error(`Gemini API call error (attempt ${attempt + 1}/${retries}):`, error)

      if (attempt < retries - 1) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
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
    error: 'Max retries exceeded',
  }
}

function parseJSONResponse(text: string): SlideStructure | null {
  try {
    // JSONコードブロックを除去
    let jsonText = text.trim()

    // ```json や ``` で囲まれている場合
    if (jsonText.includes('```')) {
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim()
      }
    }

    // JSONオブジェクトのみを抽出
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    const parsed = JSON.parse(jsonText)
    return parsed as SlideStructure
  } catch (error) {
    console.error('JSON parsing error:', error)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {scenario, images} = body

    if (!scenario || !images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'シナリオと画像データが必要です',
        } as GenerateSlideStructureResponse,
        {status: 400}
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEYが設定されていません',
        } as GenerateSlideStructureResponse,
        {status: 500}
      )
    }

    // 画像の注釈内容を整理
    const imageAnnotations = images.map((img: any, index: number) => ({
      index: index + 1,
      annotation: img.annotation || '',
    }))

    const prompt = `あなたはユーザーマニュアルのスライド資料を作成する専門家です。

以下の情報を基に、PowerPointスライドの構成を考えてください。

## シナリオ（全体の流れ）:
${scenario}

## 画像とその注釈内容:
${imageAnnotations.map(img => `画像${img.index}: ${img.annotation || '（注釈なし）'}`).join('\n')}

## 要件:
1. **資料のタイトル**: シナリオから適切なタイトルを生成してください
2. **章立て・構成**: 画像を論理的にグループ化し、章立てを作成してください（例: 「基本操作」「応用操作」「トラブルシューティング」など）
3. **各スライドのタイトル・サブタイトル**: 各画像スライドに適切なタイトルとサブタイトルを付けてください
4. **説明文**: 画像だけでは不足している情報を補完する説明文を追加してください

## 出力形式（JSON）:
以下のJSON形式で出力してください。必ず有効なJSON形式で返してください。

\`\`\`json
{
  "presentationTitle": "資料のタイトル",
  "chapters": [
    {
      "title": "章のタイトル",
      "slides": [
        {
          "title": "スライドのタイトル",
          "subtitle": "サブタイトル（オプション）",
          "description": "画像の説明文や補足情報",
          "imageIndex": 1
        }
      ]
    }
  ]
}
\`\`\`

## 注意事項:
- imageIndexは1から始まる画像のインデックスです（画像1, 画像2, ...）
- すべての画像を必ず含めてください
- タイトルや説明文は簡潔で分かりやすくしてください
- 章立ては論理的な流れになるようにしてください
- 必ず有効なJSON形式で返してください`

    const result = await callGeminiAPIWithRetry(apiKey, prompt)

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'スライド構成の生成に失敗しました',
        } as GenerateSlideStructureResponse,
        {status: 500}
      )
    }

    // レスポンスからテキストを抽出
    const responseText = result.data.candidates?.[0]?.content?.parts?.[0]?.text || result.data.text || ''

    if (!responseText) {
      return NextResponse.json(
        {
          success: false,
          error: 'AIからの応答が空です',
        } as GenerateSlideStructureResponse,
        {status: 500}
      )
    }

    // JSONをパース
    const structure = parseJSONResponse(responseText)

    if (!structure) {
      // フォールバック: シンプルな構成を生成
      const fallbackStructure: SlideStructure = {
        presentationTitle: scenario.split('\n')[0] || 'ユーザーマニュアル',
        chapters: [
          {
            title: '操作手順',
            slides: images.map((img: any, index: number) => ({
              title: `ステップ ${index + 1}`,
              description: img.annotation || '',
              imageIndex: index + 1,
            })),
          },
        ],
      }

      return NextResponse.json({
        success: true,
        structure: fallbackStructure,
      } as GenerateSlideStructureResponse)
    }

    // バリデーション
    if (!structure.presentationTitle || !structure.chapters || !Array.isArray(structure.chapters)) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なスライド構成です',
        } as GenerateSlideStructureResponse,
        {status: 500}
      )
    }

    return NextResponse.json({
      success: true,
      structure,
    } as GenerateSlideStructureResponse)
  } catch (error) {
    console.error('Error generating slide structure:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as GenerateSlideStructureResponse,
      {status: 500}
    )
  }
}
