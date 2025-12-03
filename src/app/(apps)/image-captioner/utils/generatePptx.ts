import pptxgen from 'pptxgenjs'
import {ImageItem, SlideStructure, GenerateSlideStructureResponse} from '../types'

/**
 * URLから画像を取得してBase64に変換（ヘッダー付き）
 */
const urlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()

    // MIMEタイプを取得（デフォルトはpng）
    const mimeType = blob.type || 'image/png'

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        // pptxgenjsはヘッダー付きのBase64データを期待している
        // data:image/png;base64, の形式で返す
        if (base64.startsWith('data:')) {
          resolve(base64)
        } else {
          // ヘッダーがない場合は追加
          resolve(`data:${mimeType};base64,${base64}`)
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('画像の取得に失敗しました:', error)
    throw error
  }
}

/**
 * AIが生成したスライド構成を取得
 */
const generateSlideStructure = async (scenario: string, images: ImageItem[]): Promise<SlideStructure> => {
  const response = await fetch('/api/image-captioner/generate-slide-structure', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      scenario,
      images: images.map(img => ({
        annotation: img.annotation,
      })),
    }),
  })

  const result: GenerateSlideStructureResponse = await response.json()

  if (!result.success || !result.structure) {
    throw new Error(result.error || 'スライド構成の生成に失敗しました')
  }

  return result.structure
}

/**
 * PPTXスライドを生成してダウンロード（AI生成の構成を使用）
 */
export const generatePptx = async (scenario: string, images: ImageItem[]) => {
  const pptx = new pptxgen()

  // プレゼンテーションの設定
  pptx.layout = 'LAYOUT_WIDE' // 16:9のレイアウト
  pptx.author = 'Image Captioner'
  pptx.company = ''

  // 生成済み画像を取得
  const completedImages = images.filter(img => img.status === 'completed' && img.generatedImageUrl)

  if (completedImages.length === 0) {
    throw new Error('生成済みの画像がありません。先に画像を生成してください。')
  }

  // AIが生成したスライド構成を取得
  const structure = await generateSlideStructure(scenario, images)

  // タイトルスライド
  const titleSlide = pptx.addSlide()
  titleSlide.addText(structure.presentationTitle, {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1.5,
    fontSize: 44,
    bold: true,
    align: 'center',
    color: '1a1a1a',
    fontFace: 'Arial',
  })

  // シナリオの最初の行をサブタイトルとして表示
  const scenarioFirstLine = scenario.split('\n')[0] || scenario.substring(0, 100)
  if (scenarioFirstLine) {
    titleSlide.addText(scenarioFirstLine, {
      x: 0.5,
      y: 4.2,
      w: 9,
      h: 0.8,
      fontSize: 20,
      align: 'center',
      color: '666666',
      fontFace: 'Arial',
    })
  }

  // 各章のスライドを生成
  let slideIndex = 0
  for (const chapter of structure.chapters) {
    // 章タイトルスライド
    const chapterSlide = pptx.addSlide()
    chapterSlide.addText(chapter.title, {
      x: 0.5,
      y: 3,
      w: 9,
      h: 1.5,
      fontSize: 36,
      bold: true,
      align: 'center',
      color: '2c3e50',
      fontFace: 'Arial',
    })

    // 章内の各スライドを生成
    for (const slideContent of chapter.slides) {
      const imageIndex = slideContent.imageIndex - 1 // 1ベースから0ベースに変換

      if (imageIndex < 0 || imageIndex >= completedImages.length) {
        console.warn(`無効な画像インデックス: ${slideContent.imageIndex}`)
        continue
      }

      const img = completedImages[imageIndex]

      try {
        // URLからBase64データを取得
        const base64Data = await urlToBase64(img.generatedImageUrl!)
        const slide = pptx.addSlide()

        // スライドタイトル
        if (slideContent.title) {
          slide.addText(slideContent.title, {
            x: 0.5,
            y: 0.3,
            w: 9,
            h: 0.6,
            fontSize: 28,
            bold: true,
            align: 'left',
            color: '2c3e50',
            fontFace: 'Arial',
          })
        }

        // サブタイトル
        if (slideContent.subtitle) {
          slide.addText(slideContent.subtitle, {
            x: 0.5,
            y: 0.9,
            w: 9,
            h: 0.4,
            fontSize: 18,
            align: 'left',
            color: '5a6c7d',
            fontFace: 'Arial',
            italic: true,
          })
        }

        // 画像を追加（タイトル/サブタイトルの下に配置）
        const imageY = slideContent.subtitle ? 1.5 : slideContent.title ? 1.1 : 0.5
        slide.addImage({
          data: base64Data,
          x: 0.5,
          y: imageY,
          w: 9,
          h: 4.5,
        })

        // 説明文（画像の下）
        if (slideContent.description) {
          slide.addText(slideContent.description, {
            x: 0.5,
            y: 6.2,
            w: 9,
            h: 0.8,
            fontSize: 14,
            color: '363636',
            align: 'left',
            valign: 'top',
            wrap: true,
            fontFace: 'Arial',
            lineSpacing: 24,
          })
        }

        slideIndex++
      } catch (error) {
        console.error(`画像 ${img.file.name} の処理に失敗しました:`, error)
        // エラーが発生した画像はスキップして続行
        continue
      }
    }
  }

  // PPTXファイルを生成してダウンロード
  const fileName = `${structure.presentationTitle.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_')}-${new Date().toISOString().split('T')[0]}.pptx`
  pptx.writeFile({fileName})
}
