// ============================================
// Hakobun Analysis 型定義
// ============================================

// --- 感情タイプ ---
export type SentimentType = '好意的' | '不満' | 'リクエスト' | 'その他'

// --- ポジネガ ---
export type PosiNegaType = 'positive' | 'negative' | 'neutral'

// --- 優先度 ---
export type PriorityType = 'High' | 'Medium' | 'Low'

// --- カテゴリマスター ---
export interface HakobunCategory {
  id: number
  categoryCode: string
  generalCategory: string
  specificCategory: string
  description?: string | null
  enabled: boolean
  hakobunClientId: number
}

// --- 修正データペア ---
export interface HakobunCorrection {
  id: number
  createdAt: Date
  rawSegment: string

  // 修正前の情報（日本語名称で記録）
  originalGeneralCategory?: string | null // 修正前の一般カテゴリ
  originalCategory?: string | null // 修正前のカテゴリ
  originalSentiment?: string | null // 修正前の感情

  // 修正後の情報（日本語名称で記録）
  correctGeneralCategory?: string | null // 修正後の一般カテゴリ
  correctCategory: string // 修正後のカテゴリ
  correctSentiment: SentimentType // 修正後の感情

  // 後方互換性のため残す（非推奨）
  correctCategoryCode?: string | null
  sentiment?: SentimentType | null

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

// --- 業種 ---
export interface HakobunIndustry {
  id: number
  createdAt: Date
  code: string
  name: string
  generalCategories?: HakobunIndustryGeneralCategory[]
}

// --- 業種別一般カテゴリ ---
export interface HakobunIndustryGeneralCategory {
  id: number
  sortOrder: number
  name: string
  description?: string | null
  industryId: number
}

// --- クライアント ---
export interface HakobunClient {
  id: number
  clientId: string
  name: string
  createdAt: Date
  updatedAt?: Date | null
  // AI分析用設定
  inputDataExplain?: string | null
  analysisStartDate?: Date | null
  analysisEndDate?: Date | null
  industryId?: number | null
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

// --- 一般カテゴリタイプ ---
export type GeneralCategoryType = '接客・サービス' | '店内' | '料理・ドリンク' | '備品・設備' | '値段' | '立地' | 'その他'

// --- 抽出要素（トピック単位）---
export interface Extract {
  raw_text: string // 原文（トピック分割前の全文）
  sentence: string // トピック単位（意味が完結した形）
  general_category: GeneralCategoryType // 一般カテゴリ（抽象度の高い区分）
  category: string // カテゴリ（詳細なカテゴリ名）
  sentiment: SentimentType // 感情
  posi_nega: PosiNegaType // ポジネガ判定
  magnitude: number // 熱量スコア（0-100）
  is_new_generated?: boolean // 新規生成カテゴリかどうか
}

// --- 分析結果 ---
export interface AnalysisResult {
  voice_id: string
  process_timestamp: string
  extracts: Extract[] // トピック単位の配列（意味のまとまり）
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
  allow_category_generation?: boolean // カテゴリ生成提案を許可するか（デフォルト: true）
}

// --- 一括分析APIリクエスト ---
export interface BatchAnalyzeRequest {
  client_id: string
  texts: string[] // 改行区切りのテキスト配列
  allow_category_generation?: boolean // カテゴリ生成提案を許可するか（デフォルト: true）
}

// --- 一括分析APIレスポンス ---
export interface BatchAnalyzeResponse {
  success: boolean
  results?: AnalysisResult[] // 各テキストの分析結果
  proposed_categories?: ProposedCategory[] // 提案された新規カテゴリ
  error?: string
}

// --- 提案カテゴリ ---
export interface ProposedCategory {
  category: string // カテゴリ名
  count: number // 使用回数
  examples: string[] // 使用例（最大3件）
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
  extract_index: number
  original_sentence: string

  // 修正前の情報（日本語名称で記録）
  original_general_category?: string // 修正前の一般カテゴリ
  original_category?: string // 修正前のカテゴリ
  original_sentiment?: SentimentType // 修正前の感情

  // 修正後の情報（日本語名称で記録）
  correct_general_category?: string // 修正後の一般カテゴリ
  correct_category: string // 修正後のカテゴリ
  correct_sentiment: SentimentType // 修正後の感情

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
  extractIndex: number
  originalExtract: Extract
  editedCategory: string
  editedSentiment: SentimentType
  comment: string
  isModified: boolean
}
