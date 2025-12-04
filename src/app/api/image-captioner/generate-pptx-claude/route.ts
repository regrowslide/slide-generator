import {NextRequest, NextResponse} from 'next/server'
import pptxgen from 'pptxgenjs'

interface ImageData {
  annotation: string
  generatedImageUrl: string
  base64?: string
}

interface SlideContent {
  title: string
  subtitle?: string
  description?: string
  imageIndex: number
}

interface ClaudeSlideStructure {
  presentationTitle: string
  chapters: Array<{
    title: string
    slides: SlideContent[]
  }>
  design: {
    colorScheme: {
      primary: string
      secondary: string
      accent: string
      background: string
      text: string
    }
    fontSettings: {
      titleFont: string
      bodyFont: string
      titleSize: number
      bodySize: number
    }
    layout: {
      titleSlideLayout: 'centered' | 'left-aligned'
      contentSlideLayout: 'image-top' | 'image-left' | 'image-right'
    }
  }
}

interface GenerateClaudeSlideStructureResponse {
  success: boolean
  structure?: ClaudeSlideStructure
  error?: string
}

/**
 * URLから画像を取得してBase64に変換（サーバーサイド用）
 */
const urlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64 = buffer.toString('base64')

  // MIMEタイプを取得
  const contentType = response.headers.get('content-type') || 'image/png'

  return `data:${contentType};base64,${base64}`
}

/**
 * Claude APIが生成したスライド構成を取得（内部API呼び出し）
 */
const generateClaudeSlideStructure = async (
  scenario: string,
  images: ImageData[],
  baseUrl: string,
  designPreferences?: unknown
): Promise<ClaudeSlideStructure> => {
  const response = await fetch(`${baseUrl}/api/image-captioner/generate-slides-claude`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      scenario,
      images: images.map(img => ({
        base64: img.base64,
        annotation: img.annotation,
      })),
      designPreferences,
    }),
  })

  const result: GenerateClaudeSlideStructureResponse = await response.json()

  if (!result.success || !result.structure) {
    throw new Error(result.error || 'スライド構成の生成に失敗しました')
  }

  return result.structure
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {scenario, images, designPreferences} = body as {
      scenario: string
      images: ImageData[]
      designPreferences?: unknown
    }

    if (!images || images.length === 0) {
      return NextResponse.json({success: false, error: '画像がありません'}, {status: 400})
    }

    const completedImages = images.filter(img => img.generatedImageUrl)

    if (completedImages.length === 0) {
      return NextResponse.json(
        {success: false, error: '生成済みの画像がありません。先に画像を生成してください。'},
        {status: 400}
      )
    }

    // ベースURLを取得
    const baseUrl = request.nextUrl.origin

    // Claude APIが生成したスライド構成を取得
    const structure = await generateClaudeSlideStructure(scenario, images, baseUrl, designPreferences)

    const {design} = structure
    const pptx = new pptxgen()

    // プレゼンテーションの設定
    pptx.layout = 'LAYOUT_WIDE'
    pptx.author = 'Image Captioner'
    pptx.company = ''

    // タイトルスライド
    const titleSlide = pptx.addSlide()

    // タイトルスライドのレイアウトに応じて配置
    if (design.layout.titleSlideLayout === 'centered') {
      titleSlide.addText(structure.presentationTitle, {
        x: 0.5,
        y: 2.5,
        w: 9,
        h: 1.5,
        fontSize: design.fontSettings.titleSize + 8,
        bold: true,
        align: 'center',
        color: design.colorScheme.primary,
        fontFace: design.fontSettings.titleFont,
      })

      const scenarioFirstLine = scenario.split('\n')[0] || scenario.substring(0, 100)
      if (scenarioFirstLine) {
        titleSlide.addText(scenarioFirstLine, {
          x: 0.5,
          y: 4.2,
          w: 9,
          h: 0.8,
          fontSize: design.fontSettings.bodySize + 6,
          align: 'center',
          color: design.colorScheme.text,
          fontFace: design.fontSettings.bodyFont,
        })
      }
    } else {
      titleSlide.addText(structure.presentationTitle, {
        x: 0.5,
        y: 2.5,
        w: 9,
        h: 1.5,
        fontSize: design.fontSettings.titleSize + 8,
        bold: true,
        align: 'left',
        color: design.colorScheme.primary,
        fontFace: design.fontSettings.titleFont,
      })

      const scenarioFirstLine = scenario.split('\n')[0] || scenario.substring(0, 100)
      if (scenarioFirstLine) {
        titleSlide.addText(scenarioFirstLine, {
          x: 0.5,
          y: 4.2,
          w: 9,
          h: 0.8,
          fontSize: design.fontSettings.bodySize + 6,
          align: 'left',
          color: design.colorScheme.text,
          fontFace: design.fontSettings.bodyFont,
        })
      }
    }

    // 各章のスライドを生成
    for (const chapter of structure.chapters) {
      // 章タイトルスライド
      const chapterSlide = pptx.addSlide()
      chapterSlide.addText(chapter.title, {
        x: 0.5,
        y: 3,
        w: 9,
        h: 1.5,
        fontSize: design.fontSettings.titleSize,
        bold: true,
        align: 'center',
        color: design.colorScheme.primary,
        fontFace: design.fontSettings.titleFont,
      })

      // 章内の各スライドを生成
      for (const slideContent of chapter.slides) {
        const imageIndex = slideContent.imageIndex - 1

        if (imageIndex < 0 || imageIndex >= completedImages.length) {
          console.warn(`無効な画像インデックス: ${slideContent.imageIndex}`)
          continue
        }

        const img = completedImages[imageIndex]

        try {
          // URLからBase64データを取得
          const base64Data = await urlToBase64(img.generatedImageUrl)
          const slide = pptx.addSlide()

          // レイアウトに応じて画像とテキストの配置を決定
          const layout = design.layout.contentSlideLayout

          if (layout === 'image-top') {
            // 画像を上部に配置
            if (slideContent.title) {
              slide.addText(slideContent.title, {
                x: 0.5,
                y: 0.3,
                w: 9,
                h: 0.6,
                fontSize: design.fontSettings.titleSize - 8,
                bold: true,
                align: 'left',
                color: design.colorScheme.primary,
                fontFace: design.fontSettings.titleFont,
              })
            }

            if (slideContent.subtitle) {
              slide.addText(slideContent.subtitle, {
                x: 0.5,
                y: 0.9,
                w: 9,
                h: 0.4,
                fontSize: design.fontSettings.bodySize + 4,
                align: 'left',
                color: design.colorScheme.secondary,
                fontFace: design.fontSettings.bodyFont,
                italic: true,
              })
            }

            const imageY = slideContent.subtitle ? 1.5 : slideContent.title ? 1.1 : 0.5
            slide.addImage({
              data: base64Data,
              x: 0.5,
              y: imageY,
              w: 9,
              h: 4.5,
            })

            if (slideContent.description) {
              slide.addText(slideContent.description, {
                x: 0.5,
                y: 6.2,
                w: 9,
                h: 0.8,
                fontSize: design.fontSettings.bodySize,
                color: design.colorScheme.text,
                align: 'left',
                valign: 'top',
                wrap: true,
                fontFace: design.fontSettings.bodyFont,
                lineSpacing: 24,
              })
            }
          } else if (layout === 'image-left') {
            // 画像を左側に配置
            slide.addImage({
              data: base64Data,
              x: 0.5,
              y: 1,
              w: 4.5,
              h: 5.5,
            })

            if (slideContent.title) {
              slide.addText(slideContent.title, {
                x: 5.5,
                y: 1,
                w: 4.5,
                h: 0.6,
                fontSize: design.fontSettings.titleSize - 8,
                bold: true,
                align: 'left',
                color: design.colorScheme.primary,
                fontFace: design.fontSettings.titleFont,
              })
            }

            if (slideContent.subtitle) {
              slide.addText(slideContent.subtitle, {
                x: 5.5,
                y: 1.7,
                w: 4.5,
                h: 0.4,
                fontSize: design.fontSettings.bodySize + 4,
                align: 'left',
                color: design.colorScheme.secondary,
                fontFace: design.fontSettings.bodyFont,
                italic: true,
              })
            }

            if (slideContent.description) {
              slide.addText(slideContent.description, {
                x: 5.5,
                y: 2.3,
                w: 4.5,
                h: 4.2,
                fontSize: design.fontSettings.bodySize,
                color: design.colorScheme.text,
                align: 'left',
                valign: 'top',
                wrap: true,
                fontFace: design.fontSettings.bodyFont,
                lineSpacing: 24,
              })
            }
          } else {
            // image-right
            if (slideContent.title) {
              slide.addText(slideContent.title, {
                x: 0.5,
                y: 1,
                w: 4.5,
                h: 0.6,
                fontSize: design.fontSettings.titleSize - 8,
                bold: true,
                align: 'left',
                color: design.colorScheme.primary,
                fontFace: design.fontSettings.titleFont,
              })
            }

            if (slideContent.subtitle) {
              slide.addText(slideContent.subtitle, {
                x: 0.5,
                y: 1.7,
                w: 4.5,
                h: 0.4,
                fontSize: design.fontSettings.bodySize + 4,
                align: 'left',
                color: design.colorScheme.secondary,
                fontFace: design.fontSettings.bodyFont,
                italic: true,
              })
            }

            if (slideContent.description) {
              slide.addText(slideContent.description, {
                x: 0.5,
                y: 2.3,
                w: 4.5,
                h: 4.2,
                fontSize: design.fontSettings.bodySize,
                color: design.colorScheme.text,
                align: 'left',
                valign: 'top',
                wrap: true,
                fontFace: design.fontSettings.bodyFont,
                lineSpacing: 24,
              })
            }

            slide.addImage({
              data: base64Data,
              x: 5.5,
              y: 1,
              w: 4.5,
              h: 5.5,
            })
          }
        } catch (error) {
          console.error(`画像の処理に失敗しました:`, error)
          continue
        }
      }
    }

    // PPTXファイルをBufferとして生成
    const pptxBuffer = (await pptx.write({outputType: 'nodebuffer'})) as Buffer

    const fileName = `${structure.presentationTitle.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_')}-claude-${new Date().toISOString().split('T')[0]}.pptx`

    return new NextResponse(pptxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    })
  } catch (error) {
    console.error('PPTX生成エラー:', error)
    return NextResponse.json(
      {success: false, error: error instanceof Error ? error.message : 'PPTX生成に失敗しました'},
      {status: 500}
    )
  }
}

