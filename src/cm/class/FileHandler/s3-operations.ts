import Axios from 'src/cm/lib/axios'
import {requestResultType} from '@cm/types/types'
import {SendFileToS3Props, UploadResult, UploadProgress} from './types'
import {isValidFile} from './validation'
import {validateFile} from './validation'
import {getFileInfo} from './file-info'
import {UPLOAD_TIMEOUT_MS, DEFAULT_SIGNED_URL_EXPIRY_SEC} from './constants'

/**
 * S3へのファイル送信（新しいAPI対応版）
 */
export const sendFileToS3 = async (props: SendFileToS3Props): Promise<UploadResult> => {
  const {file, formDataObj, onProgress, validateFile: shouldValidate = true} = props

  // 入力検証
  if (!isValidFile(file)) {
    return {
      success: false,
      message: '無効なファイルです',
      error: 'Invalid file object',
    }
  }

  if (!formDataObj || typeof formDataObj !== 'object') {
    return {
      success: false,
      message: '無効なフォームデータです',
      error: 'Invalid form data object',
    }
  }

  // bucketKeyの必須チェック
  if (!formDataObj.bucketKey || formDataObj.bucketKey.trim().length === 0) {
    return {
      success: false,
      message: 'bucketKeyが必要です',
      error: 'bucketKey is required',
    }
  }

  // ファイル検証（オプション）
  if (shouldValidate) {
    const validation = validateFile(file)
    if (!validation.isValid) {
      return {
        success: false,
        message: 'ファイル検証に失敗しました',
        error: validation.errors.join(', '),
      }
    }
  }

  const startTime = Date.now()

  try {
    // FormDataの構築
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucketKey', formDataObj.bucketKey)

    if (formDataObj.deleteImageUrl) {
      formData.append('deleteImageUrl', formDataObj.deleteImageUrl)
    }

    if (formDataObj.optimize !== undefined) {
      formData.append('optimize', formDataObj.optimize.toString())
    }

    // アップロード設定
    const config: any = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: UPLOAD_TIMEOUT_MS,
    }

    // プログレス監視
    if (onProgress) {
      config.onUploadProgress = (progressEvent: any) => {
        const {loaded, total} = progressEvent
        if (total > 0) {
          const percentage = Math.round((loaded * 100) / total)
          onProgress({loaded, total, percentage})
        }
      }
    }

    // アップロード実行（新しいエンドポイント）
    const response = await Axios.post('/api/s3', formData, config)
    const result: requestResultType = response.data

    const uploadTime = Date.now() - startTime
    const fileInfo = getFileInfo(file)

    return {
      ...result,
      fileInfo: {
        name: fileInfo.name,
        size: fileInfo.size,
        type: fileInfo.type,
        lastModified: fileInfo.lastModified,
        sizeFormatted: fileInfo.sizeFormatted,
        extension: fileInfo.extension,
      },
      uploadTime,
    }
  } catch (error) {
    console.error('Error uploading file to S3:', error)

    let errorMessage = 'ファイルアップロードに失敗しました'

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'アップロードがタイムアウトしました'
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'ネットワークエラーが発生しました'
      } else if (error.message.includes('413')) {
        errorMessage = 'ファイルサイズが大きすぎます'
      } else if (error.message.includes('400')) {
        errorMessage = 'ファイル形式またはリクエストが無効です'
      } else if (error.message.includes('403')) {
        errorMessage = 'アクセス権限がありません'
      } else if (error.message.includes('500')) {
        errorMessage = 'サーバーエラーが発生しました'
      }
    }

    return {
      success: false,
      message: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error',
      uploadTime: Date.now() - startTime,
    }
  }
}

/**
 * S3からファイルを削除
 */
export const deleteFileFromS3 = async (fileUrl: string, bucketKey: string): Promise<requestResultType> => {
  if (!bucketKey) {
    return {
      success: false,
      message: 'bucketKeyが必要です',
      error: 'bucketKey is required',
    }
  }

  try {
    const response = await Axios.delete(
      `/api/s3?url=${encodeURIComponent(fileUrl)}&bucketKey=${encodeURIComponent(bucketKey)}`
    )
    return response.data
  } catch (error) {
    console.error('Error deleting file from S3:', error)
    return {
      success: false,
      message: 'ファイル削除に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 署名付きURL生成
 */
export const generateSignedUrl = async (key: string, expiresIn: number = DEFAULT_SIGNED_URL_EXPIRY_SEC): Promise<requestResultType> => {
  try {
    const response = await Axios.get(`/api/s3?key=${encodeURIComponent(key)}&expiresIn=${expiresIn}`)
    return response.data
  } catch (error) {
    console.error('Error generating signed URL:', error)
    return {
      success: false,
      message: '署名付きURLの生成に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 複数ファイルの一括アップロード
 */
export const uploadMultipleFiles = async (
  files: File[],
  bucketKey: string,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const result = await sendFileToS3({
      file,
      formDataObj: {bucketKey},
      onProgress: onProgress ? progress => onProgress(i, progress) : undefined,
    })
    results.push(result)
  }

  return results
}
