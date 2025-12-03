import {NextRequest, NextResponse} from 'next/server'
import {AnalyzeResponse} from '../../types'

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

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
      console.error('Gemini API Error:', errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Gemini API Error: ${response.status} ${response.statusText}`,
        } as AnalyzeResponse,
        {status: response.status}
      )
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini APIからの応答が空です',
        } as AnalyzeResponse,
        {status: 500}
      )
    }

    // JSON部分を抽出
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // JSONが見つからない場合、テキストから推測して返す
      return NextResponse.json({
        success: true,
        caption: text.substring(0, 100),
        captionPrompt: text,
      } as unknown as AnalyzeResponse)
    }

    const jsonText = jsonMatch[1] || jsonMatch[0]
    const result = JSON.parse(jsonText)

    return NextResponse.json({
      success: true,
      caption: result.caption || text.substring(0, 100),
      captionPrompt: result.captionPrompt || text,
    } as unknown as AnalyzeResponse)
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
