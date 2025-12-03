import {NextRequest, NextResponse} from 'next/server'
import {GenerateResponse} from 'src/app/(apps)/image-captioner/types'

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent'
const MAX_RETRIES = 2
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
      const candidates = data.candidates || []
      if (candidates.length === 0) {
        if (attempt < retries - 1) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
          console.log(
            `生成された画像が見つかりません（candidatesが空です）。リトライ ${attempt + 1}/${retries}: ${delay}ms待機...`
          )
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
          console.log(`生成された画像が見つかりません（contentが空です）。リトライ ${attempt + 1}/${retries}: ${delay}ms待機...`)
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
        // 画像が見つからない場合もリトライ
        if (attempt < retries - 1) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
          console.log(
            `生成された画像が見つかりません（imagePartが空です）。リトライ ${attempt + 1}/${retries}: ${delay}ms待機...`
          )
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
          console.log(`画像データが見つかりません。リトライ ${attempt + 1}/${retries}: ${delay}ms待機...`)
          await sleep(delay)
          continue
        }
        return {
          success: false,
          error: '生成された画像のデータが見つかりません',
        }
      }

      return {success: true, data: {inlineData: {mimeType, data: imageData}}}
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
    const {imageBase64, annotation, aspectRatio, resolution} = body

    if (!imageBase64 || !annotation) {
      return NextResponse.json(
        {
          success: false,
          error: '画像データまたは注釈内容が提供されていません',
        } as GenerateResponse,
        {status: 400}
      )
    }

    const apiKey = process.env.GEMINI_API_KEY

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

    // プロンプトを作成（簡易版のannotationから詳細プロンプトを生成して画像生成）
    const prompt = `以下のスクリーンショット画像に、ユーザーマニュアル用の現代的で洗練された注釈（吹き出し、矢印、番号など）を追加した新しい画像を生成してください。

【簡易版の注釈指示】
${annotation}

上記の簡易版の注釈指示を基に、以下のデザインガイドラインに従って、具体的で詳細な注釈を追加してください。

【現代的で洗練されたデザインガイドライン】

1. **吹き出しのデザイン（背景に溶け込まない色付け）**
   - 背景色：画面に溶け込まないよう、薄い黄色（#FFF9C4 または #FFEB3Bの20-30%透明度）、薄い青（#E3F2FD または #2196F3の20-30%透明度）、または薄いオレンジ（#FFE0B2 または #FF9800の20-30%透明度）など、適度に色付けされた背景を使用する
   - 画面の背景色に応じて、コントラストが高くなる色を選択する（白い画面には薄い黄色やオレンジ、暗い画面には薄い青や緑）
   - 枠線：2-3pxの濃い色（#333333 または #1976D2）で明確な境界線を付けて、背景との区別を明確にする
   - 角丸：8-12pxの角丸で現代的で柔らかい印象にする
   - 影：中程度のドロップシャドウ（0 2px 8px rgba(0,0,0,0.2)）で立体感を出し、背景から浮き上がるようにする
   - 余白：テキストの周りに適切な余白（10-14px）を確保する

2. **テキストの視認性（読みやすさ重視）**
   - フォントサイズ：14-16pxで読みやすくする
   - フォント色：濃いグレー（#333333 または #2C3E50）でコントラストを確保
   - フォントウェイト：通常は400-500、重要な説明のみ600を使用（過度に太字にしない）
   - 行間：1.5-1.6倍で読みやすさを確保

3. **矢印のデザイン（シンプルで洗練）**
   - 色：アクセントカラー（#3B82F6 や #10B981 など、鮮やかすぎない青や緑）
   - 太さ：2-3pxでシンプルで洗練された見た目
   - スタイル：柔らかい曲線で、直線的すぎない現代的な形状
   - 影：必要に応じて軽い影を付ける
   - 位置：UI要素から吹き出しへ、または操作の流れを示す位置に配置

4. **番号のデザイン（控えめで洗練）**
   - 背景：円形または角丸の四角形（8-10px角丸、24-28pxサイズ）
   - 背景色：アクセントカラー（#3B82F6 など）で、テキストは白（#FFFFFF）
   - スタイル：軽い影（0 2px 4px rgba(0,0,0,0.15)）で立体感を出す
   - 位置：操作順序を示す位置に配置

5. **配置とレイアウト（機能性重視）**
   - 注釈は画面の重要な部分を隠さないように配置
   - 複数の注釈がある場合は、統一感のある配置とサイズ
   - 吹き出し同士が重ならないように適切な間隔（15-20px）を保つ
   - 画面の端から適切な距離（12-16px）を保つ
   - 余白を適切に取り、見やすさを重視

6. **統一感とプロフェッショナルさ（ミニマルデザイン）**
   - すべての注釈で同じデザインシステムを使用
   - 色のパレットを統一（2-3色程度、過度に多色にしない）
   - フォントスタイルを統一
   - 過度な装飾を避け、機能性を重視
   - プロフェッショナルで現代的、かつ機能的な見た目

【重要な注意事項】
- 元の画像の内容を損なわないように、注釈は補助的な役割に留める
- 過度な装飾を避け、ミニマルでクリーンなデザインを心がける
- 視認性を最優先にし、小さな画面でも読み取れるサイズにする
- ユーザーが迷わないよう、操作手順を明確に示す
- 現代的で洗練された、プロフェッショナルなデザインを実現する`

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
