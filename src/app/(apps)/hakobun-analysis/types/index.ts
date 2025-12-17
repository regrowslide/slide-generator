// ============================================
// Hakobun Analysis 型定義
// ============================================

// --- 感情タイプ ---
export type SentimentType = '好意的' | '不満' | '中立'

// --- 優先度 ---
export type PriorityType = 'High' | 'Medium' | 'Low'

// --- カテゴリマスター ---
export interface HakobunCategory {
  id: number
  categoryCode: string
  generalCategory: string
  specificCategory: string
  description?: string | null
  hakobunClientId: number
}

// --- 修正データペア ---
export interface HakobunCorrection {
  id: number
  createdAt: Date
  rawSegment: string
  correctCategoryCode: string
  sentiment: SentimentType
  reviewerComment?: string | null
  archived: boolean
  hakobunClientId: number
}

// --- ルール ---
export interface HakobunRule {
  id: number
  createdAt: Date
  targetCategory: string
  ruleDescription: string
  priority: PriorityType
  hakobunClientId: number
}

// --- クライアント ---
export interface HakobunClient {
  id: number
  clientId: string
  name: string
  createdAt: Date
  updatedAt?: Date | null
}

// --- 顧客の声 ---
export interface HakobunVoice {
  id: number
  voiceId: string
  rawText: string
  processedAt?: Date | null
  resultJson?: AnalysisResult | null
  hakobunClientId: number
  createdAt: Date
}

// ============================================
// 分析結果の型定義（3階層モデル）
// ============================================

// --- 抽出要素（最下層）---
export interface Extract {
  text_fragment: string
  sentiment: SentimentType
  category_id: string
  general_category: string
  specific_category: string
  is_new_generated: boolean
}

// --- セグメント（中間層）---
export interface Segment {
  segment_id: number
  input_text: string
  extracts: Extract[]
}

// --- 分析結果（最上層）---
export interface AnalysisResult {
  voice_id: string
  process_timestamp: string
  segments: Segment[]
}

// ============================================
// APIリクエスト/レスポンス型
// ============================================

// --- 分析APIリクエスト ---
export interface AnalyzeRequest {
  voice_id?: string
  client_id: string
  timestamp?: string
  raw_text: string
}

// --- 分析APIレスポンス ---
export interface AnalyzeResponse {
  success: boolean
  result?: AnalysisResult
  error?: string
}

// --- フィードバックAPIリクエスト ---
export interface FeedbackRequest {
  client_id: string
  voice_id: string
  corrections: FeedbackCorrection[]
}

export interface FeedbackCorrection {
  segment_id: number
  extract_index: number
  original_text_fragment: string
  correct_category_code: string
  correct_sentiment: SentimentType
  reviewer_comment?: string
}

// --- フィードバックAPIレスポンス ---
export interface FeedbackResponse {
  success: boolean
  saved_count?: number
  error?: string
}

// --- カテゴリAPIレスポンス ---
export interface CategoriesResponse {
  success: boolean
  categories?: HakobunCategory[]
  error?: string
}

// --- ルールAPIレスポンス ---
export interface RulesResponse {
  success: boolean
  rules?: HakobunRule[]
  error?: string
}

// --- クライアントAPIレスポンス ---
export interface ClientsResponse {
  success: boolean
  clients?: HakobunClient[]
  error?: string
}

// ============================================
// フロントエンド状態管理用型
// ============================================

export type AnalysisStatus = 'idle' | 'analyzing' | 'completed' | 'error'

export interface LogEntry {
  id: string
  timestamp: Date
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
}

export interface AppState {
  selectedClientId: string | null
  rawText: string
  analysisResult: AnalysisResult | null
  status: AnalysisStatus
  logs: LogEntry[]
  categories: HakobunCategory[]
  rules: HakobunRule[]
  corrections: HakobunCorrection[]
}

// --- フィードバック編集用 ---
export interface ExtractEdit {
  segmentId: number
  extractIndex: number
  originalExtract: Extract
  editedCategoryCode: string
  editedSentiment: SentimentType
  comment: string
  isModified: boolean
}




