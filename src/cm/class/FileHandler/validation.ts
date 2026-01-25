import {FILE_TYPE_CONFIGS} from '@cm/types/file-types'
import {FileValidationResult, FileListValidationResult} from './types'
import {formatFileSize} from './file-info'
import {MAX_FILE_NAME_LENGTH, DANGEROUS_EXTENSIONS} from './constants'

/**
 * ファイルが有効かどうかをチェック
 */
export const isValidFile = (file: File | null): file is File => {
  return file !== null && file instanceof File && file.size > 0
}

/**
 * ファイル検証（強化版）
 */
export const validateFile = (file: File): FileValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  if (!isValidFile(file)) {
    errors.push('無効なファイルです')
    return {isValid: false, errors, warnings}
  }

  // ファイル名の検証
  if (!file.name || file.name.trim().length === 0) {
    errors.push('ファイル名が無効です')
  }

  // ファイルサイズの検証
  if (file.size === 0) {
    errors.push('ファイルサイズが0バイトです')
  }

  const fileSize = file.size
  // MIMEタイプの検証
  const config = FILE_TYPE_CONFIGS.find(config => config.mediaType === file.type)
  if (config === undefined) {
    errors.push(`サポートされていないファイル形式です: ${file.type}`)
  } else if (config.maxSizeMB && fileSize > config.maxSizeMB) {
    errors.push(
      `ファイルサイズが制限を超えています: ${formatFileSize(fileSize)} > ${formatFileSize(config.maxSizeMB)}`
    )
  }

  // ファイル名の文字数制限
  if (file.name.length > MAX_FILE_NAME_LENGTH) {
    errors.push(`ファイル名が長すぎます（${MAX_FILE_NAME_LENGTH}文字以内）`)
  }

  // 危険な拡張子のチェック
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension && DANGEROUS_EXTENSIONS.includes(`.${extension}` as any)) {
    errors.push('危険なファイル形式です')
  }

  return {isValid: errors.length === 0, errors, warnings}
}

/**
 * ファイルリスト全体の検証
 */
export const validateFileList = (files: File[]): FileListValidationResult => {
  const validFiles: File[] = []
  const invalidFiles: {file: File; errors: string[]}[] = []
  let totalSize = 0
  let oversizedFiles = 0
  let unsupportedFiles = 0

  // 各ファイルの検証
  files.forEach(file => {
    const validation = validateFile(file)
    totalSize += file.size

    if (validation.isValid) {
      validFiles.push(file)
    } else {
      invalidFiles.push({file, errors: validation.errors})

      // エラーの分類
      if (validation.errors.some(error => error.includes('ファイルサイズが制限を超えています'))) {
        oversizedFiles++
      }
      if (validation.errors.some(error => error.includes('サポートされていないファイル形式'))) {
        unsupportedFiles++
      }
    }
  })

  const errorMessages = invalidFiles.map(
    (invalid, index) => `ファイル${index + 1} (${invalid.file.name}): ${invalid.errors.join(', ')}`
  )

  return {
    isValid: invalidFiles.length === 0,
    validFiles,
    invalidFiles,
    errorMessages,
    totalSize,
    totalSizeFormatted: formatFileSize(totalSize),
    summary: {
      totalFiles: files.length,
      validFiles: validFiles.length,
      invalidFiles: invalidFiles.length,
      oversizedFiles,
      unsupportedFiles,
    },
  }
}
