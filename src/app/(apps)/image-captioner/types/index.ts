export interface ImageItem {
  id: string
  file: File
  preview: string // base64 data URL（プレビュー用、低解像度）
  originalBase64?: string // 元のファイルのBase64（API送信用、高解像度）
  annotation: string // 注釈内容（簡潔な説明）
  annotationPrompt: string // AIが生成した注釈プロンプト（画像生成用の詳細な指示）
  generatedImageUrl?: string // Nano Banana Proで生成された画像のURL
  status: 'pending' | 'analyzing' | 'analyzed' | 'generating' | 'completed' | 'error'
  error?: string
}

export interface AppSettings {
  aspectRatio: '16:9' | '4:3' | '1:1' | '21:9'
  resolution: '1024' | '2048' | '3072' | '4K'
}

export interface LogEntry {
  id: string
  timestamp: Date
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
  imageId?: string
}

export interface AppState {
  step: 1 | 2 | 3 | 4
  settings: AppSettings
  images: ImageItem[]
  scenario: string // 画面操作の流れを説明したテキスト（シナリオ）
  isProcessing: boolean
  logs: LogEntry[]
}

export interface AnalyzeResponse {
  success: boolean
  annotation: string // 簡易版の注釈内容（どの箇所に、どんな注釈を入れるか）
  error?: string
}

export interface GenerateResponse {
  success: boolean
  imageUrl: string
  error?: string
}
