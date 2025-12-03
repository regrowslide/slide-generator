import {NextRequest, NextResponse} from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  GenerateClaudeSlideStructureResponse,
  ClaudeSlideStructure,
  ClaudeDesignPreferences,
} from 'src/app/(apps)/image-captioner/types'

const MAX_RETRIES = 2
const RETRY_DELAY_BASE = 1000

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function callClaudeAPIWithRetry(
  anthropic: Anthropic,
  prompt: string,
  images: Array<{base64: string; annotation: string}>,
  retries = MAX_RETRIES
): Promise<{success: boolean; data?: any; error?: string}> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const imageContents = images.map(img => {
        const base64Data = img.base64.includes(',') ? img.base64.split(',')[1] : img.base64
        // Base64データURLからMIMEタイプを判定
        let mediaType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp' = 'image/png'
        if (img.base64.includes('data:')) {
          const mimeMatch = img.base64.match(/data:([^;]+)/)
          if (mimeMatch) {
            const mime = mimeMatch[1]
            if (mime === 'image/jpeg' || mime === 'image/jpg') {
              mediaType = 'image/jpeg'
            } else if (mime === 'image/png') {
              mediaType = 'image/png'
            } else if (mime === 'image/gif') {
              mediaType = 'image/gif'
            } else if (mime === 'image/webp') {
              mediaType = 'image/webp'
            }
          }
        }
        return {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: mediaType,
            data: base64Data,
          },
        }
      })

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              ...imageContents,
            ],
          },
        ],
      })

      const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
      return {success: true, data: text}
    } catch (error: any) {
      console.error(`Claude API error (attempt ${attempt + 1}/${retries}):`, error)

      // 5xxエラーやレート制限エラーの場合はリトライ
      if ((error.status >= 500 || error.status === 429) && attempt < retries - 1) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
        await sleep(delay)
        continue
      }

      return {
        success: false,
        error: error.message || 'Claude API呼び出しに失敗しました',
      }
    }
  }

  return {
    success: false,
    error: 'Max retries exceeded',
  }
}

function parseJSONResponse(text: string): ClaudeSlideStructure | null {
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
    return parsed as ClaudeSlideStructure
  } catch (error) {
    console.error('JSON parsing error:', error)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {scenario, images, designPreferences} = body

    if (!scenario || !images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'シナリオと画像データが必要です',
        } as GenerateClaudeSlideStructureResponse,
        {status: 400}
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'ANTHROPIC_API_KEYが設定されていません',
        } as GenerateClaudeSlideStructureResponse,
        {status: 500}
      )
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    })

    // デザイン設定のデフォルト値
    const designPrefs: ClaudeDesignPreferences = designPreferences || {
      style: 'modern',
      colorScheme: 'blue',
      font: 'Arial',
    }

    // 画像の注釈内容を整理
    const imageAnnotations = images.map((img: any, index: number) => ({
      index: index + 1,
      annotation: img.annotation || '',
    }))

    const prompt = `あなたはプレゼンテーションデザインの専門家です。
以下の情報を基に、PowerPointスライドの構成とデザインを考えてください。

## シナリオ（全体の流れ）:
${scenario}

## 画像とその注釈内容:
${imageAnnotations.map(img => `画像${img.index}: ${img.annotation || '（注釈なし）'}`).join('\n')}

## デザイン要件:
- スタイル: ${designPrefs.style}
- カラースキーム: ${designPrefs.colorScheme}
- フォント: ${designPrefs.font}

## 要件:
1. **資料のタイトル**: シナリオから適切なタイトルを生成してください
2. **章立て・構成**: 画像を論理的にグループ化し、章立てを作成してください（例: 「基本操作」「応用操作」「トラブルシューティング」など）
3. **各スライドのタイトル・サブタイトル**: 各画像スライドに適切なタイトルとサブタイトルを付けてください
4. **説明文**: 画像だけでは不足している情報を補完する説明文を追加してください
5. **デザイン設定**: 指定されたスタイル、カラースキーム、フォントに基づいて、統一感のあるデザインを提案してください

## 出力形式（JSON）:
以下のJSON形式で出力してください。必ず有効なJSON形式で返してください。

\`\`\`json
{
  "presentationTitle": "資料のタイトル",
  "design": {
    "colorScheme": {
      "primary": "#2c3e50",
      "secondary": "#3498db",
      "accent": "#e74c3c",
      "background": "#ffffff",
      "text": "#2c3e50"
    },
    "fontSettings": {
      "titleFont": "Arial",
      "bodyFont": "Arial",
      "titleSize": 36,
      "bodySize": 14
    },
    "layout": {
      "titleSlideLayout": "centered",
      "contentSlideLayout": "image-top"
    }
  },
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
- デザインは指定されたスタイルとカラースキームに基づいて統一感を持たせてください
- 必ず有効なJSON形式で返してください`

    const result = await callClaudeAPIWithRetry(
      anthropic,
      prompt,
      images.map((img: any) => ({
        base64: img.base64 || '',
        annotation: img.annotation || '',
      }))
    )

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'スライド構成の生成に失敗しました',
        } as GenerateClaudeSlideStructureResponse,
        {status: 500}
      )
    }

    // JSONをパース
    const structure = parseJSONResponse(result.data)

    if (!structure) {
      // フォールバック: シンプルな構成を生成
      const fallbackStructure: ClaudeSlideStructure = {
        presentationTitle: scenario.split('\n')[0] || 'ユーザーマニュアル',
        design: {
          colorScheme: {
            primary: '#2c3e50',
            secondary: '#3498db',
            accent: '#e74c3c',
            background: '#ffffff',
            text: '#2c3e50',
          },
          fontSettings: {
            titleFont: 'Arial',
            bodyFont: 'Arial',
            titleSize: 36,
            bodySize: 14,
          },
          layout: {
            titleSlideLayout: 'centered',
            contentSlideLayout: 'image-top',
          },
        },
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
      } as GenerateClaudeSlideStructureResponse)
    }

    // バリデーション
    if (!structure.presentationTitle || !structure.chapters || !Array.isArray(structure.chapters) || !structure.design) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なスライド構成です',
        } as GenerateClaudeSlideStructureResponse,
        {status: 500}
      )
    }

    return NextResponse.json({
      success: true,
      structure,
    } as GenerateClaudeSlideStructureResponse)
  } catch (error) {
    console.error('Error generating Claude slide structure:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as GenerateClaudeSlideStructureResponse,
      {status: 500}
    )
  }
}
