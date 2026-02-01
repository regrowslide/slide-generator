// ============================================
// Hakobun Analysis 型定義
// ============================================

// --- 感情タイプ ---
export type SentimentType = '好意的' | '不満' | 'リクエスト' | 'その他'

// --- ポジネガ ---
export type PosiNegaType = 'positive' | 'negative' | 'neutral'

// --- 優先度 ---
export type PriorityType = 'High' | 'Medium' | 'Low'

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
  categories?: HakobunIndustryCategory[]
}

// --- 業種別詳細カテゴリ ---
export interface HakobunIndustryCategory {
  id: number
  createdAt: Date
  sortOrder: number
  name: string
  description?: string | null
  enabled: boolean
  generalCategoryId: number
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

// --- ステージタイプ ---

// --- 抽出要素（トピック単位）---
export interface Extract {
  raw_text: string // 原文（トピック分割前の全文）
  sentence: string // トピック単位（意味が完結した形）
  stage: string // カスタマージャーニーのステージ
  general_category: GeneralCategoryType // 一般カテゴリ（抽象度の高い区分）
  category: string // カテゴリ（詳細なカテゴリ名）
  sentiment: SentimentType // 感情
  posi_nega: PosiNegaType // ポジネガ判定
  magnitude: number // 熱量スコア（0-100）
  is_new_generated?: boolean // 新規生成カテゴリかどうか
  is_new_general_category?: boolean // 新規生成一般カテゴリかどうか（API側で判定）
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

// ============================================
// バッチ分析用型定義
// ============================================

// --- テーブル行（バッチ分析結果表示用）---
export interface TableRow {
  resultIndex: number
  extractIndex: number
  extract: Extract
  voiceId: string
  feedbackGeneralCategory: string
  feedbackCategory: string
  feedbackSentiment: SentimentType
  feedbackComment: string
  isModified: boolean
  /** CorrectionのID（一括登録記録閲覧ページで使用） */
  correctionId?: number
}

// --- 業種別一般カテゴリ（フロントエンド用）---
export interface IndustryGeneralCategoryWithCategories {
  id: number
  name: string
  description: string | null
  sortOrder: number
  categories: {
    id: number
    name: string
    description: string | null
    sortOrder: number
  }[]
}

// --- カテゴリ差分（既存 vs AI分析で新規生成）---
export interface CategoryDiff {
  /** DB登録済みの一般カテゴリ名リスト */
  existingGeneralCategories: string[]
  /** DB登録済みのカテゴリ名リスト */
  existingCategories: string[]
  /** AI分析で検出された一般カテゴリ名リスト */
  detectedGeneralCategories: string[]
  /** AI分析で検出されたカテゴリ名リスト */
  detectedCategories: string[]
  /** AI分析で新規に生成された一般カテゴリ（DB未登録）*/
  newGeneralCategories: string[]
  /** AI分析で新規に生成されたカテゴリ（DB未登録）*/
  newCategories: string[]
}

// --- 保留中の一般カテゴリ（DB未保存、state保持）---
export interface PendingGeneralCategory {
  /** 一時ID（state管理用） */
  tempId: string
  /** カテゴリ名 */
  name: string
  /** 説明 */
  description?: string
  /** 紐づく保留中カテゴリ */
  pendingCategories: PendingCategory[]
}

// --- 保留中のカテゴリ（DB未保存、state保持）---
export interface PendingCategory {
  /** 一時ID（state管理用） */
  tempId: string
  /** 親となる一般カテゴリ名 */
  generalCategoryName: string
  /** カテゴリ名 */
  name: string
  /** 説明 */
  description?: string
}

// ============================================
// 分析BOX / SESSION / Record 型定義
// ============================================

// --- 分析SESSIONステータス ---
export type AnalysisSessionStatus = 'pending' | 'analyzing' | 'completed' | 'error'

// --- 分析BOX ---
export interface HakobunAnalysisBox {
  id: number
  createdAt: Date
  updatedAt?: Date | null
  sortOrder: number
  name: string
  description?: string | null
  hakobunClientId: number
  sessions?: HakobunAnalysisSession[]
}

// --- 分析SESSION ---
export interface HakobunAnalysisSession {
  id: number
  createdAt: Date
  updatedAt?: Date | null
  sortOrder: number
  name: string
  status: AnalysisSessionStatus
  analyzedAt?: Date | null
  errorMessage?: string | null
  analysisBoxId: number
  records?: HakobunAnalysisRecord[]
}

// --- 分析結果レコード ---
export interface HakobunAnalysisRecord {
  id: number
  createdAt: Date
  updatedAt?: Date | null
  sortOrder: number
  rawText: string
  // 分析結果
  analysisStage?: string | null
  analysisSentiment?: string | null
  analysisGeneralCategory?: string | null
  analysisCategory?: string | null
  analysisTopic?: string | null
  // AIの新規提案フラグ
  isProposedGeneralCategory: boolean
  isProposedCategory: boolean
  proposalApproved?: boolean | null // null=未処理、true=承認、false=却下
  // 修正結果
  feedbackStage?: string | null
  feedbackSentiment?: string | null
  feedbackGeneralCategory?: string | null
  feedbackCategory?: string | null
  feedbackTopic?: string | null
  // フラグ・コメント
  isModified: boolean
  reviewerComment?: string | null
  // 有効/無効フラグ
  isEnabled: boolean
  sessionId: number
}

// --- 分析BOX作成用入力 ---
export interface CreateAnalysisBoxInput {
  name: string
  description?: string
  hakobunClientId: number
}

// --- 分析SESSION作成用入力 ---
export interface CreateAnalysisSessionInput {
  name: string
  analysisBoxId: number
}

// --- 分析レコード作成用入力（CSVからの一括登録） ---
export interface CreateAnalysisRecordInput {
  rawText: string
  analysisStage?: string
  analysisSentiment?: string
  analysisGeneralCategory?: string
  analysisCategory?: string
  analysisTopic?: string
  isProposedGeneralCategory?: boolean
  isProposedCategory?: boolean
  sessionId: number
}

// --- フィードバック更新用入力 ---
export interface UpdateAnalysisRecordFeedbackInput {
  feedbackStage?: string
  feedbackSentiment?: string
  feedbackGeneralCategory?: string
  feedbackCategory?: string
  feedbackTopic?: string
  reviewerComment?: string
  isModified: boolean
}

// ============================================
// ルール自動生成用型定義
// ============================================

// --- AIが生成したルール ---
export interface GeneratedRule {
  targetCategory: string  // 対象カテゴリ
  ruleDescription: string  // ルール内容
  priority: 'High' | 'Medium' | 'Low'  // 優先度
  isNew: boolean  // 新規ルールか既存マージか
  mergedWithRuleId?: number  // マージ先の既存ルールID（既存マージの場合）
}

// --- ルール生成APIリクエスト ---
export interface GenerateRuleFromSessionRequest {
  sessionId: number
  hakobunClientId: number
}

// --- ルール生成APIレスポンス ---
export interface GenerateRuleFromSessionResponse {
  success: boolean
  generatedRules?: GeneratedRule[]
  savedCount?: number
  error?: string
}

// ============================================
// デバッグビューア用型定義
// ============================================

// Server Actionsからエクスポート
export type {
  ClientOption,
  DataCounts,
  ClientFullData,
} from '../_actions/debug-viewer-actions'
