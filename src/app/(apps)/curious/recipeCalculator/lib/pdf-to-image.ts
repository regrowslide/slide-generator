'use client'

import {pdfjs} from 'react-pdf'

// PDF.jsのワーカーとcMap（日本語フォント対応）を設定
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

// cMap設定（日本語PDFに必要）
const CMAP_URL = `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`
const CMAP_PACKED = true

export interface PdfConversionResult {
  images: string[] // Base64データURL配列
  pageCount: number
}

/**
 * PDFファイルを画像に変換する
 * @param file PDFファイル
 * @param scale 解像度スケール（デフォルト: 4.0 = 高精細画像）
 * @returns 各ページの画像（Base64データURL）
 */
export const convertPdfToImages = async (file: File, scale: number = 4.0): Promise<PdfConversionResult> => {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({
    data: arrayBuffer,
    cMapUrl: CMAP_URL,
    cMapPacked: CMAP_PACKED,
  }).promise

  const images: string[] = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({scale})

    // Canvasを作成
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Canvas contextの取得に失敗しました')
    }

    canvas.width = viewport.width
    canvas.height = viewport.height

    // PDFページをCanvasに描画
    await page.render({
      canvas,
      canvasContext: context,
      viewport,
    }).promise

    // CanvasをBase64画像に変換
    const imageDataUrl = canvas.toDataURL('image/png')
    images.push(imageDataUrl)
  }

  return {
    images,
    pageCount: pdf.numPages,
  }
}

/**
 * 複数ページのPDFを1つの画像に結合する（縦に連結）
 * @param images Base64画像配列
 * @returns 結合された画像（Base64データURL）
 */
export const mergeImages = async (images: string[]): Promise<string> => {
  if (images.length === 0) {
    throw new Error('結合する画像がありません')
  }

  if (images.length === 1) {
    return images[0]
  }

  // 各画像を読み込んでサイズを取得
  const loadedImages = await Promise.all(
    images.map(
      src =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = src
        })
    )
  )

  // キャンバスサイズを計算（最大幅、高さの合計）
  const maxWidth = Math.max(...loadedImages.map(img => img.width))
  const totalHeight = loadedImages.reduce((sum, img) => sum + img.height, 0)

  // 結合用キャンバスを作成
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas contextの取得に失敗しました')
  }

  canvas.width = maxWidth
  canvas.height = totalHeight

  // 背景を白に
  context.fillStyle = 'white'
  context.fillRect(0, 0, canvas.width, canvas.height)

  // 各画像を縦に描画
  let currentY = 0
  for (const img of loadedImages) {
    context.drawImage(img, 0, currentY)
    currentY += img.height
  }

  return canvas.toDataURL('image/png')
}
