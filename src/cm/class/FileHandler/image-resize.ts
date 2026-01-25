import {ResizeOptions, ResizeResult} from './types'
import {DEFAULT_MAX_WIDTH, DEFAULT_MAX_HEIGHT, DEFAULT_QUALITY} from './constants'
import {validateFileList} from './validation'

/**
 * リサイズ後の寸法を計算
 */
export const calculateResizeDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  maintainAspectRatio: boolean = true
): {width: number; height: number} => {
  if (!maintainAspectRatio) {
    return {width: maxWidth, height: maxHeight}
  }

  const aspectRatio = originalWidth / originalHeight

  let newWidth = maxWidth
  let newHeight = maxHeight

  if (originalWidth > originalHeight) {
    newHeight = newWidth / aspectRatio
    if (newHeight > maxHeight) {
      newHeight = maxHeight
      newWidth = newHeight * aspectRatio
    }
  } else {
    newWidth = newHeight * aspectRatio
    if (newWidth > maxWidth) {
      newWidth = maxWidth
      newHeight = newWidth / aspectRatio
    }
  }

  return {width: Math.round(newWidth), height: Math.round(newHeight)}
}

/**
 * 画像ファイルのクライアントサイドリサイズ
 */
export const resizeImage = async (file: File, options: ResizeOptions = {}): Promise<ResizeResult> => {
  const {
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT,
    quality = DEFAULT_QUALITY,
    format = 'jpeg',
    maintainAspectRatio = true,
  } = options

  return new Promise(resolve => {
    // 画像ファイルでない場合はエラー
    if (!file.type.startsWith('image/')) {
      resolve({
        success: false,
        originalFile: file,
        originalSize: file.size,
        resizedSize: 0,
        error: '画像ファイルではありません',
      })
      return
    }

    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      resolve({
        success: false,
        originalFile: file,
        originalSize: file.size,
        resizedSize: 0,
        error: 'Canvas context を取得できませんでした',
      })
      return
    }

    img.onload = () => {
      try {
        // リサイズ後の寸法を計算
        const {width, height} = calculateResizeDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight,
          maintainAspectRatio
        )

        // Canvasのサイズを設定
        canvas.width = width
        canvas.height = height

        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height)

        // Blobに変換
        canvas.toBlob(
          blob => {
            if (!blob) {
              resolve({
                success: false,
                originalFile: file,
                originalSize: file.size,
                resizedSize: 0,
                error: 'Blob変換に失敗しました',
              })
              return
            }

            // 新しいファイル名を生成
            const originalName = file.name
            const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'))
            const newFileName = `${nameWithoutExt}_resized.${format}`

            // 新しいFileオブジェクトを作成
            const resizedFile = new File([blob], newFileName, {
              type: `image/${format}`,
              lastModified: Date.now(),
            })

            const compressionRatio = ((file.size - resizedFile.size) / file.size) * 100

            resolve({
              success: true,
              originalFile: file,
              resizedFile,
              originalSize: file.size,
              resizedSize: resizedFile.size,
              compressionRatio,
            })
          },
          `image/${format}`,
          quality
        )
      } catch (error) {
        resolve({
          success: false,
          originalFile: file,
          originalSize: file.size,
          resizedSize: 0,
          error: `リサイズ処理中にエラーが発生しました: ${error}`,
        })
      }
    }

    img.onerror = () => {
      resolve({
        success: false,
        originalFile: file,
        originalSize: file.size,
        resizedSize: 0,
        error: '画像の読み込みに失敗しました',
      })
    }

    // 画像を読み込み
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 複数の画像ファイルを一括リサイズ
 */
export const resizeMultipleImages = async (
  files: File[],
  options: ResizeOptions = {},
  onProgress?: (index: number, result: ResizeResult) => void
): Promise<ResizeResult[]> => {
  const results: ResizeResult[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const result = await resizeImage(file, options)
    results.push(result)

    if (onProgress) {
      onProgress(i, result)
    }
  }

  return results
}

/**
 * ファイルリストの自動最適化（検証 + リサイズ）
 */
export const optimizeFileList = async (
  files: File[],
  resizeOptions: ResizeOptions = {},
  onProgress?: (step: string, progress: number) => void
): Promise<{
  validFiles: File[]
  invalidFiles: {file: File; errors: string[]}[]
  resizedFiles: File[]
  summary: {
    totalFiles: number
    validFiles: number
    invalidFiles: number
    resizedFiles: number
    totalSizeReduction: number
  }
}> => {
  // Step 1: ファイル検証
  if (onProgress) onProgress('ファイル検証中...', 0)
  const validation = validateFileList(files)

  // Step 2: 画像ファイルのリサイズ
  if (onProgress) onProgress('画像リサイズ中...', 30)
  const imageFiles = validation.validFiles.filter(file => file.type.startsWith('image/'))
  const nonImageFiles = validation.validFiles.filter(file => !file.type.startsWith('image/'))

  const resizeResults = await resizeMultipleImages(imageFiles, resizeOptions, (index, result) => {
    if (onProgress) {
      const progress = 30 + (index / imageFiles.length) * 60
      onProgress(`画像リサイズ中... (${index + 1}/${imageFiles.length})`, progress)
    }
  })

  // Step 3: 結果の集計
  if (onProgress) onProgress('結果集計中...', 90)
  const resizedFiles: File[] = []
  let totalSizeReduction = 0

  resizeResults.forEach(result => {
    if (result.success && result.resizedFile) {
      resizedFiles.push(result.resizedFile)
      totalSizeReduction += result.originalSize - result.resizedSize
    } else {
      // リサイズに失敗した場合は元のファイルを使用
      resizedFiles.push(result.originalFile)
    }
  })

  // 非画像ファイルも追加
  resizedFiles.push(...nonImageFiles)

  if (onProgress) onProgress('完了', 100)

  return {
    validFiles: validation.validFiles,
    invalidFiles: validation.invalidFiles,
    resizedFiles,
    summary: {
      totalFiles: files.length,
      validFiles: validation.validFiles.length,
      invalidFiles: validation.invalidFiles.length,
      resizedFiles: resizeResults.filter(r => r.success).length,
      totalSizeReduction,
    },
  }
}
