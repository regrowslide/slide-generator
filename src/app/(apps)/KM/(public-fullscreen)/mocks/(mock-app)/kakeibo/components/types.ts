// カテゴリ区分
export type CategoryType =
  | 'income'
  | 'fixed_expense'
  | 'variable_expense'
  | 'special_expense'
  | 'savings_investment'

// 満足度
export type Satisfaction = '〇' | '△' | '✕' | null

// カテゴリ
export type Category = {
  id: string
  name: string // 絵文字付き名称 例: '🍙 食費'
  type: CategoryType
  weeklyBudget: number | null
  monthlyBudget: number | null
  order: number // 表示順
}

// 支払い方法
export type PaymentMethod = {
  id: string
  name: string
  dueDate: number | null // 引落日
  account: string | null // 引落口座
}

// 収支レコード（入力データ）
export type Transaction = {
  id: string
  date: string // YYYY-MM-DD
  categoryId: string
  paymentMethodId: string
  amount: number
  satisfaction: Satisfaction
  memo: string
}

// 家族メンバー（ライフプラン用）
export type FamilyMember = {
  id: string
  name: string
  birthYear: number
  role: string // '夫' | '妻' | '子ども' など
}

// ライフプラン項目
export type LifePlanItem = {
  id: string
  categoryId: string | null // nullの場合は任意追加項目
  customName: string | null // 任意追加時の名前
  type: CategoryType
  initialValue: number // 初期値（万円）
  growthRate: number // 上昇率（0.015 = 1.5%）
  periods: { startYear: number; endYear: number }[]
  visible: boolean
  useAverage: boolean // 平均値から引用するか
}

// 資産項目
export type AssetItem = {
  id: string
  name: string
  currentValue: number // 現在の資産額（万円）
  annualContribution: number // 年間積立額（万円）
  growthRate: number // 上昇率
  isDefault: boolean // デフォルト表示項目か
  visible: boolean
}

// 特別費予算
export type SpecialBudget = {
  carryOver: number // 前年繰越
  monthlyReserve: number // 月間積立額
}

// ページID
export type PageId =
  | 'input'
  | 'history'
  | 'calendar'
  | 'master-category'
  | 'master-payment'
  | 'annual-transition'
  | 'income-expense-viz'
  | 'payment-management'
  | 'satisfaction-review'
  | 'life-plan'
  | 'asset-projection'
