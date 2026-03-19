import type { Category, CategoryType, FamilyMember, PaymentMethod } from './types'

// カテゴリ区分のラベル
export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  income: '収入',
  fixed_expense: '支出（固定費）',
  variable_expense: '支出（変動費）',
  special_expense: '支出（特別費）',
  savings_investment: '先取り貯金・投資',
}

// デフォルトカテゴリ一覧
export const DEFAULT_CATEGORIES: Category[] = [
  // ── 収入 ──
  { id: 'inc-01', name: '💰 パパ給与', type: 'income', weeklyBudget: null, monthlyBudget: null, order: 1 },
  { id: 'inc-02', name: '💰 ママ給与', type: 'income', weeklyBudget: null, monthlyBudget: null, order: 2 },
  { id: 'inc-03', name: '💴 副業', type: 'income', weeklyBudget: null, monthlyBudget: null, order: 3 },
  { id: 'inc-04', name: '💴 配当金', type: 'income', weeklyBudget: null, monthlyBudget: null, order: 4 },
  { id: 'inc-05', name: '💰 賞与', type: 'income', weeklyBudget: null, monthlyBudget: null, order: 5 },
  { id: 'inc-06', name: '💴 臨時収入', type: 'income', weeklyBudget: null, monthlyBudget: null, order: 6 },
  { id: 'inc-07', name: '💰 児童手当', type: 'income', weeklyBudget: null, monthlyBudget: null, order: 7 },
  { id: 'inc-08', name: '❓ その他', type: 'income', weeklyBudget: null, monthlyBudget: null, order: 8 },

  // ── 先取り貯金・投資 ──
  { id: 'sav-01', name: '💰 貯金', type: 'savings_investment', weeklyBudget: null, monthlyBudget: 50000, order: 10 },
  { id: 'sav-02', name: '💰 特別費積み立て', type: 'savings_investment', weeklyBudget: null, monthlyBudget: 30000, order: 11 },
  { id: 'sav-03', name: '💴 NISA', type: 'savings_investment', weeklyBudget: null, monthlyBudget: 33333, order: 12 },
  { id: 'sav-04', name: '💴 投資', type: 'savings_investment', weeklyBudget: null, monthlyBudget: 10000, order: 13 },
  { id: 'sav-05', name: '💴 iDeCo', type: 'savings_investment', weeklyBudget: null, monthlyBudget: 23000, order: 14 },
  { id: 'sav-06', name: '💰 貯金（臨時）', type: 'savings_investment', weeklyBudget: null, monthlyBudget: null, order: 15 },
  { id: 'sav-07', name: '💴 NISA（臨時）', type: 'savings_investment', weeklyBudget: null, monthlyBudget: null, order: 16 },
  { id: 'sav-08', name: '💴 投資（臨時）', type: 'savings_investment', weeklyBudget: null, monthlyBudget: null, order: 17 },
  { id: 'sav-09', name: '❓ その他', type: 'savings_investment', weeklyBudget: null, monthlyBudget: null, order: 18 },

  // ── 固定費 ──
  { id: 'fix-01', name: '🏠 住宅', type: 'fixed_expense', weeklyBudget: null, monthlyBudget: 85000, order: 20 },
  { id: 'fix-02', name: '💡 電気', type: 'fixed_expense', weeklyBudget: null, monthlyBudget: 12000, order: 21 },
  { id: 'fix-03', name: '🔥 ガス', type: 'fixed_expense', weeklyBudget: null, monthlyBudget: 5000, order: 22 },
  { id: 'fix-04', name: '🚰 水道', type: 'fixed_expense', weeklyBudget: null, monthlyBudget: 4000, order: 23 },
  { id: 'fix-05', name: '🎓 教養・教育', type: 'fixed_expense', weeklyBudget: null, monthlyBudget: 15000, order: 24 },
  { id: 'fix-06', name: '📱 通信費', type: 'fixed_expense', weeklyBudget: null, monthlyBudget: 8000, order: 25 },
  { id: 'fix-07', name: '📽️ サブスク', type: 'fixed_expense', weeklyBudget: null, monthlyBudget: 3000, order: 26 },
  { id: 'fix-08', name: '📃 保険', type: 'fixed_expense', weeklyBudget: null, monthlyBudget: 10000, order: 27 },
  { id: 'fix-09', name: '🚙 自動車', type: 'fixed_expense', weeklyBudget: null, monthlyBudget: 15000, order: 28 },
  { id: 'fix-10', name: '💳 現金・カード', type: 'fixed_expense', weeklyBudget: null, monthlyBudget: 5000, order: 29 },
  { id: 'fix-11', name: '💪 自己投資', type: 'fixed_expense', weeklyBudget: null, monthlyBudget: 5000, order: 30 },
  { id: 'fix-12', name: '👨🏻 パパお小遣い', type: 'fixed_expense', weeklyBudget: null, monthlyBudget: 30000, order: 31 },
  { id: 'fix-13', name: '👩🏻 ママお小遣い', type: 'fixed_expense', weeklyBudget: null, monthlyBudget: 30000, order: 32 },
  { id: 'fix-14', name: '❓ その他', type: 'fixed_expense', weeklyBudget: null, monthlyBudget: null, order: 33 },

  // ── 変動費 ──
  { id: 'var-01', name: '🍙 食費', type: 'variable_expense', weeklyBudget: 10000, monthlyBudget: 45000, order: 40 },
  { id: 'var-02', name: '🧴 日用品', type: 'variable_expense', weeklyBudget: 2000, monthlyBudget: 10000, order: 41 },
  { id: 'var-03', name: '📒 雑費', type: 'variable_expense', weeklyBudget: null, monthlyBudget: 5000, order: 42 },
  { id: 'var-04', name: '⛺️ 趣味・娯楽', type: 'variable_expense', weeklyBudget: null, monthlyBudget: 10000, order: 43 },
  { id: 'var-05', name: '👚 衣服・美容', type: 'variable_expense', weeklyBudget: null, monthlyBudget: 10000, order: 44 },
  { id: 'var-06', name: '🏥 健康・医療', type: 'variable_expense', weeklyBudget: null, monthlyBudget: 5000, order: 45 },
  { id: 'var-07', name: '🍼 子ども', type: 'variable_expense', weeklyBudget: null, monthlyBudget: 10000, order: 46 },
  { id: 'var-08', name: '🍷 交際費', type: 'variable_expense', weeklyBudget: null, monthlyBudget: 8000, order: 47 },
  { id: 'var-09', name: '🚃 交通費', type: 'variable_expense', weeklyBudget: null, monthlyBudget: 5000, order: 48 },
  { id: 'var-10', name: '❓ その他', type: 'variable_expense', weeklyBudget: null, monthlyBudget: null, order: 49 },

  // ── 特別費 ──
  { id: 'spe-01', name: '✈️ 旅行', type: 'special_expense', weeklyBudget: null, monthlyBudget: null, order: 60 },
  { id: 'spe-02', name: '🍴 食事', type: 'special_expense', weeklyBudget: null, monthlyBudget: null, order: 61 },
  { id: 'spe-03', name: '🗒️ 更新料', type: 'special_expense', weeklyBudget: null, monthlyBudget: null, order: 62 },
  { id: 'spe-04', name: '📠 保険', type: 'special_expense', weeklyBudget: null, monthlyBudget: null, order: 63 },
  { id: 'spe-05', name: '🏠 家具・家電', type: 'special_expense', weeklyBudget: null, monthlyBudget: null, order: 64 },
  { id: 'spe-06', name: '🤰🏻 妊活', type: 'special_expense', weeklyBudget: null, monthlyBudget: null, order: 65 },
  { id: 'spe-07', name: '❓ その他', type: 'special_expense', weeklyBudget: null, monthlyBudget: null, order: 66 },
]

// デフォルト支払い方法
export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pay-01', name: 'クレカA', dueDate: 27, account: 'C銀行' },
  { id: 'pay-02', name: 'クレカB', dueDate: 10, account: 'D銀行' },
  { id: 'pay-03', name: 'C銀行', dueDate: null, account: null },
  { id: 'pay-04', name: 'D銀行', dueDate: null, account: null },
  { id: 'pay-05', name: '現金', dueDate: null, account: null },
  { id: 'pay-06', name: 'PayPay', dueDate: null, account: null },
]

// デフォルト家族メンバー（現在2026年想定）
export const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'fam-01', name: 'パパ', birthYear: 1996, role: '夫' },
  { id: 'fam-02', name: 'ママ', birthYear: 1998, role: '妻' },
  { id: 'fam-03', name: '長男', birthYear: 2023, role: '子ども' },
  { id: 'fam-04', name: '次男', birthYear: 2026, role: '子ども' },
]

// 月名リスト
export const MONTHS: string[] = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
]
