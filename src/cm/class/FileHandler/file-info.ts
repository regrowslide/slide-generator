import {FILE_TYPE_CONFIGS, FileTypeConfig} from '@cm/types/file-types'
import {FileInfo} from './types'
import {FILE_SIZE_BASE, FILE_SIZE_UNITS} from './constants'

/**
 * バイト数を人間可読形式に変換
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(FILE_SIZE_BASE))
  return parseFloat((bytes / Math.pow(FILE_SIZE_BASE, i)).toFixed(2)) + ' ' + FILE_SIZE_UNITS[i]
}

/**
 * ファイルタイプ設定を取得
 */
export const getFileTypeConfigs = (): readonly FileTypeConfig[] => {
  return FILE_TYPE_CONFIGS
}

/**
 * ファイル情報を取得
 */
export const getFileInfo = (file: File): FileInfo => {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    sizeFormatted: formatFileSize(file.size),
    extension: file.name.split('.').pop()?.toLowerCase() || '',
  }
}
