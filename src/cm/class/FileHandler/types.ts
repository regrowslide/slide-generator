import {requestResultType} from '@cm/types/types'

/**
 * プログレス情報の型
 */
export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

/**
 * アップロード結果の型
 */
export interface UploadResult extends requestResultType {
  fileInfo?: {
    name: string
    size: number
    type: string
    lastModified: number
    sizeFormatted?: string
    extension?: string
  }
  uploadTime?: number
}

/**
 * S3アップロード用のフォームデータ型
 */
export interface S3FormData {
  bucketKey: string
  deleteImageUrl?: string
  optimize?: boolean
}

/**
 * S3アップロード用のプロパティ
 */
export interface SendFileToS3Props {
  file: File | null
  formDataObj: S3FormData
  onProgress?: (progress: UploadProgress) => void
  validateFile?: boolean
}

/**
 * ファイル検証結果の型
 */
export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

/**
 * ファイルリスト検証結果の型
 */
export interface FileListValidationResult {
  isValid: boolean
  validFiles: File[]
  invalidFiles: {file: File; errors: string[]}[]
  totalSize: number
  totalSizeFormatted: string
  errorMessages: string[]
  summary: {
    totalFiles: number
    validFiles: number
    invalidFiles: number
    oversizedFiles: number
    unsupportedFiles: number
  }
}

/**
 * リサイズオプションの型
 */
export interface ResizeOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0-1の範囲
  format?: 'jpeg' | 'png' | 'webp'
  maintainAspectRatio?: boolean
}

/**
 * リサイズ結果の型
 */
export interface ResizeResult {
  success: boolean
  originalFile: File
  resizedFile?: File
  originalSize: number
  resizedSize: number
  compressionRatio?: number
  error?: string
}

/**
 * ファイル情報の型
 */
export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
  sizeFormatted: string
  extension: string
}
