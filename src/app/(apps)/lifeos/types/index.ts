/**
 * LifeOS 型定義
 */

export type ArchetypeType = 'metric-tracker' | 'task-list' | 'timeline-log' | 'attribute-card' | 'heatmap'

/**
 * 拡張スキーマフィールド定義（UI表示用メタデータを含む）
 */
export interface EnrichedSchemaField {
  // 基本情報
  type: 'string' | 'number' | 'boolean' | 'date' // Array/Object除外
  label: string // 表示用ラベル（例: "ページ数"）
  description?: string // フィールドの説明

  // 表示設定
  displayType: 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'datetime' | 'url' | 'email' | 'enum' | 'rating'
  sortOrder: number // 表示順序
  hidden?: boolean // 論理削除フラグ

  // 数値型オプション
  unit?: string // 単位（例: "ページ", "km"）
  min?: number
  max?: number
  step?: number // 入力ステップ

  // 入力制約
  required?: boolean
  defaultValue?: string | number | boolean // デフォルト値
  placeholder?: string // プレースホルダー

  // enum型オプション
  enum?: string[] // 選択肢
  enumLabels?: Record<string, string> // 選択肢の表示ラベル
}

/**
 * 拡張スキーマ（キーごとにEnrichedSchemaFieldを持つ）
 */
export type EnrichedSchema = Record<string, EnrichedSchemaField>

export interface LifeOSData {
  id: string
  category: Category
  schema: Record<string, EnrichedSchemaField> // カテゴリから取得したスキーマ
  archetype: ArchetypeType
  data: Record<string, any>
  createdAt: Date
  updatedAt?: Date
}

export interface Category {
  id: string
  name: string
  description?: string
  schema: Record<string, EnrichedSchemaField>
  createdAt?: Date
  updatedAt?: Date
}

/**
 * データベース用カテゴリ型（Prismaモデル対応）
 */
export interface DBCategory {
  id: number
  createdAt: Date
  updatedAt: Date | null
  sortOrder: number
  name: string
  description: string | null
  schema: EnrichedSchema
}

/**
 * データベース用ログ型（Prismaモデル対応）
 * schemaフィールドは削除され、カテゴリのスキーマを参照する
 */
export interface DBLog {
  id: number
  createdAt: Date
  updatedAt: Date | null
  sortOrder: number
  archetype: ArchetypeType
  // schema: EnrichedSchema  ← 削除（カテゴリのスキーマを参照）
  data: Record<string, unknown>
  description: string | null
  categoryId: number
  category?: DBCategory
}

export interface ArchetypeMapping {
  schemaPattern: Record<string, string>
  archetype: ArchetypeType
}

/**
 * AI処理の計画
 */
export interface Plan {
  title: string
  description?: string
  category: string
  schema: Record<string, unknown>
  archetype: ArchetypeType
  data: unknown
  items?: PlanItem[]
}

export interface PlanItem {
  id: string
  label: string
  status: 'confirmed' | 'pending' | 'rejected'
}

/**
 * AIが返すログレコードの構造
 */
export interface AILogRecord {
  category: string
  archetype: ArchetypeType
  schema: Record<string, unknown>
  data: Record<string, unknown>
  description: string
  confidence?: number
}

/**
 * 複数のPlanを含む構造
 */
export interface MultiPlan {
  title: string
  description?: string
  plans: Plan[]
  totalRecords: number
}

/**
 * Server Actionsの戻り値型
 */
export interface ProcessNaturalLanguageResult {
  success: boolean
  message?: string
  plans?: Plan[] // 複数ログレコード対応
  multiPlan?: MultiPlan // 複数ログレコード用
}

export interface GenerateSchemaResult {
  success: boolean
  message?: string
  schema?: Record<string, unknown>
  archetype?: ArchetypeType
}

export interface SelectArchetypeResult {
  success: boolean
  message?: string
  archetype?: ArchetypeType
}

/**
 * ログエントリ（処理ログ）
 */
export interface LogEntry {
  id: string
  timestamp: Date
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
}

/**
 * LifeOSアプリ状態
 */
export interface LifeOSState {
  data: LifeOSData[]
  currentInput: string
  isProcessing: boolean
  logs: LogEntry[]
  selectedCategory: string | null
}

/**
 * ログとスキーマをマージした結果
 */
export interface MergedLogData {
  definedFields: Record<string, {field: EnrichedSchemaField; value: unknown}>
  orphanFields: Record<string, unknown> // スキーマにないフィールド（警告表示）
  missingFields: Array<{key: string; field: EnrichedSchemaField}> // データにないフィールド（空白表示）
}
