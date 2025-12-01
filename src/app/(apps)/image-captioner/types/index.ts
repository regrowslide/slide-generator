export interface ImageItem {
  id: string
  file: File
  preview: string // base64 data URL
  caption: string
  captionPrompt: string // AIが生成したキャプション指示
  tags: string[]
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
  context: string
  isProcessing: boolean
  logs: LogEntry[]
}

export interface AnalyzeResponse {
  success: boolean
  caption: string
  captionPrompt: string
  error?: string
}

export interface GenerateResponse {
  success: boolean
  imageUrl: string
  error?: string
}

