/**
 * Regrow アプリの型定義
 */

// ============================================================
// 基本型
// ============================================================

/** YYYY-MM形式の月 */
export type YearMonth = string

/** 店舗名 */
export type StoreName = '港北店' | '青葉店' | '中央店'

// ABCD評価は不要のため削除

// ============================================================
// インポートデータ（担当者別分析表から）
// ============================================================

/** スタッフ売上レコード（Excelから抽出） */
export type StaffRecord = {
  rank: number
  staffName: string
  storeName: StoreName
  sales: number // 売上合計
  customerCount: number // 対応客数
  newCustomerCount: number // 新規客数（W列から取得）
  nominationCount: number // 指名数
  unitPrice: number // 客単価
}

/** 店舗合計（Excelから抽出） */
export type StoreTotals = {
  storeName: StoreName
  sales: number
  customerCount: number
  nominationCount: number
  unitPrice: number
}

/** インポートデータ全体 */
export type ImportedData = {
  staffRecords: StaffRecord[]
  storeTotals: StoreTotals[]
  importedAt: Date
  fileName: string
}

// ============================================================
// 手動入力データ
// ============================================================

/** 店舗KPI（手動入力） */
export type StoreKpi = {
  storeName: StoreName
  utilizationRate: number | null // 稼働率 (%)
  returnRate: number | null // 再来率 (%)
  csRegistrationCount: number | null // CS登録数
  comment: string // コメント
}

/** スライド閲覧モード */
export type SlideViewMode = 'scroll' | 'pagination'

/** スタッフ権限 */
export type StaffRole = 'admin' | 'manager' | 'viewer'

/** スタッフマスタ */
export type StaffMaster = {
  staffName: string
  storeName: StoreName
  role: StaffRole
  isActive: boolean // 退職者はfalse
}

/** スタッフ手動入力データ */
export type StaffManualData = {
  staffName: string
  storeName: StoreName
  utilizationRate: number | null // 稼働率 (%)
  csRegistrationCount: number | null // CS登録数
}

/** お客様の声（手動入力） */
export type CustomerVoice = {
  content: string
}

/** 手動入力データ全体 */
export type ManualData = {
  storeKpis: StoreKpi[]
  staffManualData: StaffManualData[]
  customerVoice: CustomerVoice
}

// ============================================================
// 月次データ統合型
// ============================================================

/** YYYY-MM単位の月次データ */
export type MonthlyData = {
  yearMonth: YearMonth // "2026-02"
  importedData: ImportedData | null
  manualData: ManualData
  createdAt: Date
  updatedAt: Date
}

// ============================================================
// Excel解析結果
// ============================================================

/** Excelファイル解析結果 */
export type ExcelParseResult = {
  storeName: string // フルネーム（例: "Relaxation Salon SAMPLE港北店"）
  storeShortName: StoreName // 短縮名（例: "港北店"）
  periodStart: string // 集計期間開始（例: "2026-02-01"）
  periodEnd: string // 集計期間終了（例: "2026-02-28"）
  staffList: StaffRecord[]
  total: Omit<StoreTotals, 'storeName'>
}

// ============================================================
// UI用型
// ============================================================

/** セクションキー */
export type SectionKey = 'guidance' | 'import' | 'import-data' | 'manual-input' | 'slides'

/** ガイダンスステップ */
export type GuidanceStep = {
  step: number
  title: string
  description: string
  completed: boolean
  actionLabel: string
  targetSection: SectionKey
}

/** ステータス */
export type Status = 'completed' | 'incomplete' | 'in-progress'
