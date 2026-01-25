/**
 * FileHandler - エントリーポイント
 *
 * 後方互換性のためのFileHandlerクラスを提供します。
 * Tree Shaking対応のため、個別関数もエクスポートしています。
 */

// 個別関数のエクスポート（Tree Shaking対応）
export * from './validation'
export * from './file-info'
export * from './image-resize'
export * from './s3-operations'
export * from './types'
export * from './constants'

// 後方互換性のためのFileHandlerクラス
import * as validation from './validation'
import * as fileInfo from './file-info'
import * as imageResize from './image-resize'
import * as s3Ops from './s3-operations'

/**
 * FileHandlerクラス（後方互換性のため）
 * 例: import { validateFile, getFileInfo } from '@cm/class/FileHandler'
 */
export class FileHandler {
  /**
   * ファイルタイプ設定を取得
   */
  static getFileTypeConfigs = fileInfo.getFileTypeConfigs

  /**
   * ファイル情報を取得
   */
  static getFileInfo = fileInfo.getFileInfo

  /**
   * ファイル検証（強化版）
   */
  static validateFile = validation.validateFile

  /**
   * ファイルリスト全体の検証
   */
  static validateFileList = validation.validateFileList

  /**
   * 画像ファイルのクライアントサイドリサイズ
   */
  static resizeImage = imageResize.resizeImage

  /**
   * 複数の画像ファイルを一括リサイズ
   */
  static resizeMultipleImages = imageResize.resizeMultipleImages

  /**
   * ファイルリストの自動最適化（検証 + リサイズ）
   */
  static optimizeFileList = imageResize.optimizeFileList

  /**
   * S3へのファイル送信（新しいAPI対応版）
   */
  static sendFileToS3 = s3Ops.sendFileToS3

  /**
   * S3からファイルを削除
   */
  static deleteFileFromS3 = s3Ops.deleteFileFromS3

  /**
   * 署名付きURL生成
   */
  static generateSignedUrl = s3Ops.generateSignedUrl

  /**
   * 複数ファイルの一括アップロード
   */
  static uploadMultipleFiles = s3Ops.uploadMultipleFiles
}
