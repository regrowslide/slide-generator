/**
 * FileHandler関連の定数定義
 */

// 画像リサイズのデフォルト値
export const DEFAULT_MAX_WIDTH = 800
export const DEFAULT_MAX_HEIGHT = 600
export const DEFAULT_QUALITY = 0.8

// ファイル名の制限
export const MAX_FILE_NAME_LENGTH = 255

// アップロード設定
export const UPLOAD_TIMEOUT_MS = 300000 // 5分

// 署名付きURLのデフォルト有効期限（秒）
export const DEFAULT_SIGNED_URL_EXPIRY_SEC = 3600

// 危険な拡張子リスト
export const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.jar'] as const

// ファイルサイズフォーマット用の定数
export const FILE_SIZE_BASE = 1024
export const FILE_SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB'] as const
