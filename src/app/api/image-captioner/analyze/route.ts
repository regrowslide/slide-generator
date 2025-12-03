import {NextRequest, NextResponse} from 'next/server'
import {AnalyzeResponse} from 'src/app/(apps)/image-captioner/types'

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
const MAX_RETRIES = 2
const RETRY_DELAY_BASE = 50 // 50ms

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

      // 空レスポンスのチェック（空白のみも含む）
      if (!text || text.trim() === '') {
        console.log(`[Attempt ${attempt + 1}/${retries}] 空レスポンス検出。リトライします...`)
        if (attempt < retries - 1) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
          console.log(`リトライ ${attempt + 1}/${retries}: ${delay}ms待機...`)
          await sleep(delay)
          continue
        }
        return {
          success: false,
          error: 'Gemini APIからの応答が空です',
        }
      }

      // JSONパースと検証を試行
      let jsonParseError: Error | null = null
      let isValidResponse = false
      let parsedResult: any = null

      try {
        // 複数のJSON抽出パターンを試行
        const patterns = [/```json\n([\s\S]*?)\n```/, /```\n([\s\S]*?)\n```/, /\{[\s\S]*\}/]

        let jsonText: string | null = null
        for (const pattern of patterns) {
          const match = text.match(pattern)
          if (match) {
            jsonText = match[1] || match[0]
            break
          }
        }

        if (jsonText) {
          parsedResult = JSON.parse(jsonText)
          // レスポンスの妥当性チェック（annotationのみをチェック）
          isValidResponse =
            parsedResult && typeof parsedResult === 'object' && parsedResult.annotation && parsedResult.annotation.trim() !== ''
        } else {
          console.log(`[Attempt ${attempt + 1}/${retries}] JSONが見つかりません。テキスト全体:`, text.substring(0, 200))
        }
      } catch (error) {
        jsonParseError = error instanceof Error ? error : new Error(String(error))
        console.log(`[Attempt ${attempt + 1}/${retries}] JSONパースエラー:`, jsonParseError.message)
        console.log(`パースしようとしたテキスト:`, text.substring(0, 500))
      }

      // 空レスポンス、JSONパースエラー、または無効なレスポンスの場合はリトライ
      if (!isValidResponse) {
        if (attempt < retries - 1) {
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
          console.log(`無効なレスポンス。リトライ ${attempt + 1}/${retries}: ${delay}ms待機...`)
          await sleep(delay)
          continue
        }
        // 最後の試行でも失敗した場合、フォールバック値を返す
        return {
          success: true,
          data: {
            text,
            rawData: data,
            parsedResult: parsedResult || {
              annotation: '画像の分析に失敗しました。画面の一般的な説明を記載してください。',
            },
          },
        }
      }

      return {success: true, data: {text, rawData: data, parsedResult}}
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
    const {imageBase64, scenario} = body

    if (!imageBase64) {
      return NextResponse.json(
        {
          success: false,
          error: '画像データが提供されていません',
        } as AnalyzeResponse,
        {status: 400}
      )
    }

    const apiKey = process.env.GEMINI_API_KEY

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
    const prompt = `あなたはユーザーマニュアル作成の専門家です。以下のスクリーンショット画像を詳細に分析し、適切な注釈（吹き出しなど）を付与するためのプロンプトを生成してください。

${scenario ? `【画面操作のシナリオ】\n${scenario}\n` : ''}

**重要：画像が認識できない場合でも、必ずJSON形式で応答してください。空のレスポンスは絶対に返さないでください。**

【タスク】
1. 画像の内容を正確に理解する（どの画面操作のステップか、どのUI要素が重要か）
2. ユーザーマニュアルに適した、簡易版の注釈内容（annotation）を生成する

【注釈内容の要件（簡易版）】
- **どの箇所に、どんな注釈を入れるかを明確に表記**
- ピクセル、色、スタイルなどの詳細な指定は含めない
- 重要なUI要素（ボタン、入力欄、メニューなど）にどのような注釈を付けるかを簡潔に記述
- 操作手順が分かりやすくなるように、矢印や番号などの種類を指定
- 例：「ユーザー名入力欄に吹き出しを追加して説明」「ログインボタンに矢印を追加」「各メニュー項目に番号を付ける」

【出力形式 - 必須】
**必ず以下のJSON形式で返してください。annotationのみが必須です。**

{
  "annotation": "どの箇所に、どんな注釈を入れるかを簡潔に記述（例：ユーザー名入力欄に吹き出し、パスワード入力欄に吹き出し、ログインボタンに矢印）"
}

【具体例】
画像がログイン画面の場合：
{
  "annotation": "ユーザー名入力欄に吹き出しを追加して「ユーザー名を入力」と説明。パスワード入力欄に吹き出しを追加して「パスワードを入力」と説明。ログインボタンに矢印を追加して「ここをクリックしてログイン」と説明。"
}

画像がメニュー画面の場合：
{
  "annotation": "各メニュー項目の左側に番号ラベル（1, 2, 3...）を追加。各項目の右側に吹き出しを追加して操作内容を説明。選択された項目にハイライトを追加。"
}

画像がフォーム入力画面の場合：
{
  "annotation": "各入力欄の上にラベルを表示。必須項目にバッジを追加。送信ボタンに矢印を追加して説明。"
}

【注意事項 - 必ず守ってください】
- **画像が認識できない場合でも、必ずJSON形式で応答してください。空のレスポンスは絶対に返さないでください。**
- 画像が完全に読み取れない場合でも、画面の一般的な説明や操作手順の推測を含めてください。
- annotationは日本語で、どの箇所にどんな注釈を入れるかを簡潔に記述（空文字列は不可）
- ピクセル、色、スタイルなどの詳細な指定は含めない（簡易版のみ）
- 必ずJSON形式で返してください。テキストのみの説明は不要です。`

    // 画像サイズをログに記録（デバッグ用）
    const imageSize = base64Data.length
    console.log(`[Analyze] 画像サイズ: ${Math.round(imageSize / 1024)}KB`)

    const result = await callGeminiAPIWithRetry(apiKey, base64Data, prompt)

    if (!result.success) {
      console.error(`[Analyze] API呼び出し失敗:`, result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Unknown error',
        } as AnalyzeResponse,
        {status: 500}
      )
    }

    const text = result.data!.text
    console.log(`[Analyze] APIレスポンステキスト（最初の200文字）:`, text.substring(0, 200))

    // 既にパース済みの結果がある場合はそれを使用
    if (result.data!.parsedResult) {
      const parsedResult = result.data!.parsedResult
      console.log(`[Analyze] パース済み結果を使用:`, {
        annotation: parsedResult.annotation?.substring(0, 50),
      })
      return NextResponse.json({
        success: true,
        annotation: parsedResult.annotation || '画像の分析に失敗しました。画面の一般的な説明を記載してください。',
      } as AnalyzeResponse)
    }

    // JSON部分を抽出（複数のパターンを試行）
    const patterns = [/```json\n([\s\S]*?)\n```/, /```\n([\s\S]*?)\n```/, /\{[\s\S]*\}/]

    let jsonText: string | null = null
    let jsonMatch: RegExpMatchArray | null = null

    for (const pattern of patterns) {
      jsonMatch = text.match(pattern)
      if (jsonMatch) {
        jsonText = jsonMatch[1] || jsonMatch[0]
        break
      }
    }

    if (!jsonMatch || !jsonText) {
      console.warn(`[Analyze] JSONが見つかりません。テキスト全体:`, text.substring(0, 500))
      // JSONが見つからない場合、フォールバック値を返す
      return NextResponse.json({
        success: true,
        annotation: text.substring(0, 100) || '画像の分析に失敗しました。画面の一般的な説明を記載してください。',
      } as AnalyzeResponse)
    }

    let parsedResult: any
    try {
      parsedResult = JSON.parse(jsonText)
      console.log(`[Analyze] JSONパース成功:`, {
        annotation: parsedResult.annotation?.substring(0, 50),
      })
    } catch (error) {
      console.error(`[Analyze] JSONパースエラー:`, error)
      console.error(`パースしようとしたJSON:`, jsonText.substring(0, 500))
      // パースエラーの場合、フォールバック値を返す
      return NextResponse.json({
        success: true,
        annotation: text.substring(0, 100) || '画像の分析に失敗しました。画面の一般的な説明を記載してください。',
      } as AnalyzeResponse)
    }

    // レスポンスの妥当性チェック（annotationのみをチェック）
    if (!parsedResult || typeof parsedResult !== 'object' || !parsedResult.annotation || parsedResult.annotation.trim() === '') {
      console.warn(`[Analyze] 無効なレスポンス形式:`, parsedResult)
      // 無効なレスポンスの場合、フォールバック値を返す
      return NextResponse.json({
        success: true,
        annotation:
          parsedResult.annotation || text.substring(0, 100) || '画像の分析に失敗しました。画面の一般的な説明を記載してください。',
      } as AnalyzeResponse)
    }

    return NextResponse.json({
      success: true,
      annotation: parsedResult.annotation,
    } as AnalyzeResponse)
  } catch (error) {
    console.error('[Analyze] 予期しないエラー:', error)
    console.error('エラー詳細:', error instanceof Error ? error.stack : String(error))
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as AnalyzeResponse,
      {status: 500}
    )
  }
}
