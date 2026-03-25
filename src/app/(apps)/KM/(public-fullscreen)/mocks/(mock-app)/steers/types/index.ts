// クライアント（案件先）
export type KajiClient = {
  id: number
  name: string // "神戸北大型", "エディオン難波" 等
  location: string // 場所
  roles: KajiRole[] // この案件で必要な役割
}

// 役割
export type KajiRole = {
  id: string // "DR", "CL1", "CL2", "CH" 等
  name: string // "ディレクター", "クローザー", "キャッチャー"
}

// スタッフ
export type KajiStaff = {
  id: number
  name: string
  nearestStation: string // 最寄り駅
  isActive: boolean
  employmentType: '自社' | '他社'
  companyName?: string // 他社の場合の会社名
}

// スタッフ×クライアント別単価
export type KajiStaffRate = {
  staffId: number
  clientId: number
  roleId: string
  unitPrice: number // 売上単価（クライアントからもらう額）
  paymentPrice: number // 支払単価（スタッフに払う額）
}

// シフト配置
export type KajiShiftAssignment = {
  id: number
  date: string // "2026-03-01"
  staffId: number
  clientId: number
  roleId: string
  transportCost: number // 交通費
}

// 空きシフト（稼働可能申告）
export type KajiStaffAvailability = {
  staffId: number
  date: string
}

// 個人別PL行
export type KajiStaffPl = {
  staffId: number
  staffName: string
  employmentType: '自社' | '他社'
  companyName?: string
  totalWorkDays: number
  totalRevenue: number // 売上
  totalPayment: number // 支払（給与+交通費）
  grossProfit: number // 粗利
  grossMarginRate: number // 粗利率
}

// ダッシュボードKPI
export type KajiDashboardKpi = {
  totalRevenue: number
  totalPayment: number
  totalGrossProfit: number
  grossMarginRate: number
  totalWorkingDays: number
  activeStaffCount: number
  averageRoi: number
}

// ランキング行
export type KajiRankingItem = {
  rank: number
  name: string
  value: number
}
