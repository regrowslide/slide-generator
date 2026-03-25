import type {
  KajiClient,
  KajiStaff,
  KajiStaffRate,
  KajiShiftAssignment,
  KajiStaffAvailability,
  KajiStaffPl,
  KajiDashboardKpi,
  KajiRankingItem,
} from '../types'

// ===== クライアント（案件先）=====
export const MOCK_CLIENTS: KajiClient[] = [
  {
    id: 1,
    name: '神戸北大型',
    location: '神戸市北区',
    roles: [
      { id: 'DR', name: 'ディレクター' },
      { id: 'CL1', name: 'クローザー1' },
      { id: 'CL2', name: 'クローザー2' },
      { id: 'CL3', name: 'クローザー3' },
      { id: 'CH', name: 'キャッチャー' },
    ],
  },
  {
    id: 2,
    name: 'エディオン難波',
    location: '大阪市中央区',
    roles: [
      { id: 'DR', name: 'ディレクター' },
      { id: 'CL1', name: 'クローザー1' },
      { id: 'CL2', name: 'クローザー2' },
    ],
  },
  {
    id: 3,
    name: 'エディオン船堀',
    location: '東京都江戸川区',
    roles: [
      { id: 'DR', name: 'ディレクター' },
      { id: 'CL1', name: 'クローザー1' },
    ],
  },
  {
    id: 4,
    name: 'ビックカメラアリオ八尾',
    location: '大阪府八尾市',
    roles: [
      { id: 'DR', name: 'ディレクター' },
      { id: 'CL1', name: 'クローザー1' },
      { id: 'CL2', name: 'クローザー2' },
    ],
  },
  {
    id: 5,
    name: 'イオン三田',
    location: '兵庫県三田市',
    roles: [
      { id: 'DR', name: 'ディレクター' },
      { id: 'CL1', name: 'クローザー1' },
    ],
  },
  {
    id: 6,
    name: 'イオン神戸北',
    location: '神戸市北区',
    roles: [
      { id: 'DR', name: 'ディレクター' },
      { id: 'CL1', name: 'クローザー1' },
      { id: 'CL2', name: 'クローザー2' },
    ],
  },
  {
    id: 7,
    name: '関西文化イベント',
    location: '大阪市北区',
    roles: [
      { id: 'DR', name: 'ディレクター' },
      { id: 'CL1', name: 'クローザー1' },
      { id: 'CL2', name: 'クローザー2' },
      { id: 'CL3', name: 'クローザー3' },
      { id: 'CH', name: 'キャッチャー' },
    ],
  },
  {
    id: 8,
    name: 'au神戸北',
    location: '神戸市北区',
    roles: [
      { id: 'DR', name: 'ディレクター' },
      { id: 'CL1', name: 'クローザー1' },
    ],
  },
  {
    id: 9,
    name: 'ドコモショップ三宮',
    location: '神戸市中央区',
    roles: [
      { id: 'DR', name: 'ディレクター' },
      { id: 'CL1', name: 'クローザー1' },
    ],
  },
]

// ===== スタッフ =====
export const MOCK_STAFF: KajiStaff[] = [
  { id: 1, name: '高橋', nearestStation: '三宮', isActive: true, employmentType: '自社' },
  { id: 2, name: '原田', nearestStation: '梅田', isActive: true, employmentType: '自社' },
  { id: 3, name: '松本', nearestStation: '難波', isActive: true, employmentType: '自社' },
  { id: 4, name: '大津', nearestStation: '西宮', isActive: true, employmentType: '自社' },
  { id: 5, name: '吉田', nearestStation: '神戸', isActive: true, employmentType: '自社' },
  { id: 6, name: '広瀬', nearestStation: '尼崎', isActive: true, employmentType: '自社' },
  { id: 7, name: '中田', nearestStation: '宝塚', isActive: true, employmentType: '自社' },
  { id: 8, name: '宮本', nearestStation: '三田', isActive: true, employmentType: '他社', companyName: 'パートナーA' },
  { id: 9, name: '佐々木', nearestStation: '明石', isActive: true, employmentType: '他社', companyName: 'パートナーA' },
  { id: 10, name: '近藤', nearestStation: '姫路', isActive: true, employmentType: '他社', companyName: 'パートナーB' },
  { id: 11, name: '山田', nearestStation: '天王寺', isActive: true, employmentType: '自社' },
  { id: 12, name: '小笠原', nearestStation: '京橋', isActive: true, employmentType: '他社', companyName: 'パートナーC' },
  { id: 13, name: '西田', nearestStation: '新大阪', isActive: true, employmentType: '自社' },
  { id: 14, name: '上原', nearestStation: '茨木', isActive: true, employmentType: '自社' },
  { id: 15, name: '藤田', nearestStation: '高槻', isActive: true, employmentType: '他社', companyName: 'パートナーB' },
  { id: 16, name: '岩田', nearestStation: '堺東', isActive: true, employmentType: '自社' },
  { id: 17, name: '豊田', nearestStation: '北新地', isActive: true, employmentType: '自社' },
  { id: 18, name: '鎮谷', nearestStation: '住吉', isActive: true, employmentType: '他社', companyName: 'パートナーA' },
  { id: 19, name: '菊池', nearestStation: '芦屋', isActive: true, employmentType: '自社' },
  { id: 20, name: '大森', nearestStation: '垂水', isActive: true, employmentType: '他社', companyName: 'パートナーC' },
]

// ===== 単価マスタ（スタッフ×クライアント別）=====
// 簡易的に全組み合わせ生成
const generateRates = (): KajiStaffRate[] => {
  const rates: KajiStaffRate[] = []
  for (const staff of MOCK_STAFF) {
    for (const client of MOCK_CLIENTS) {
      for (const role of client.roles) {
        // 役割で基本単価を変動
        const baseUnit =
          role.id === 'DR' ? 25000 : role.id.startsWith('CL') ? 18000 : 15000
        // スタッフIDで微小変動
        const variation = (staff.id % 5) * 1000
        const unitPrice = baseUnit + variation
        // 支払いは売上の70〜80%
        const paymentRate = staff.employmentType === '自社' ? 0.7 : 0.8
        rates.push({
          staffId: staff.id,
          clientId: client.id,
          roleId: role.id,
          unitPrice,
          paymentPrice: Math.round(unitPrice * paymentRate),
        })
      }
    }
  }
  return rates
}

export const MOCK_STAFF_RATES: KajiStaffRate[] = generateRates()

// ===== 2026年3月のシフト配置データ =====
const generateAssignments = (): KajiShiftAssignment[] => {
  const assignments: KajiShiftAssignment[] = []
  let id = 1

  // 疑似ランダム（シード固定相当）
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  for (let day = 1; day <= 31; day++) {
    const date = `2026-03-${String(day).padStart(2, '0')}`
    let seed = day * 7

    // 各クライアントに1〜3名配置
    for (const client of MOCK_CLIENTS) {
      const staffCount = Math.min(
        client.roles.length,
        1 + Math.floor(seededRandom(seed++) * 3)
      )

      for (let s = 0; s < staffCount; s++) {
        const staffIndex = Math.floor(seededRandom(seed++) * MOCK_STAFF.length)
        const staff = MOCK_STAFF[staffIndex]
        const role = client.roles[s % client.roles.length]
        const transportCost = [500, 800, 1000, 1200, 1500][
          Math.floor(seededRandom(seed++) * 5)
        ]

        // 重複配置を避ける（同日同スタッフ）
        const alreadyAssigned = assignments.some(
          (a) => a.date === date && a.staffId === staff.id
        )
        if (!alreadyAssigned) {
          assignments.push({
            id: id++,
            date,
            staffId: staff.id,
            clientId: client.id,
            roleId: role.id,
            transportCost,
          })
        }
      }
    }
  }

  return assignments
}

export const MOCK_ASSIGNMENTS: KajiShiftAssignment[] = generateAssignments()

// ===== 空きスタッフ（稼働可能申告）=====
const generateAvailability = (): KajiStaffAvailability[] => {
  const availability: KajiStaffAvailability[] = []
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  for (let day = 1; day <= 31; day++) {
    const date = `2026-03-${String(day).padStart(2, '0')}`
    // 各スタッフが60%の確率で稼働可能
    for (const staff of MOCK_STAFF) {
      if (seededRandom(day * 100 + staff.id) > 0.4) {
        availability.push({ staffId: staff.id, date })
      }
    }
  }
  return availability
}

export const MOCK_AVAILABILITY: KajiStaffAvailability[] = generateAvailability()

// ===== 計算ユーティリティ =====

// 個人別PL算出
export const calculateStaffPl = (): KajiStaffPl[] => {
  const plMap = new Map<number, KajiStaffPl>()

  for (const assignment of MOCK_ASSIGNMENTS) {
    const staff = MOCK_STAFF.find((s) => s.id === assignment.staffId)
    if (!staff) continue

    const rate = MOCK_STAFF_RATES.find(
      (r) =>
        r.staffId === assignment.staffId &&
        r.clientId === assignment.clientId &&
        r.roleId === assignment.roleId
    )
    if (!rate) continue

    const existing = plMap.get(staff.id)
    const revenue = rate.unitPrice
    const payment = rate.paymentPrice + assignment.transportCost

    if (existing) {
      existing.totalWorkDays += 1
      existing.totalRevenue += revenue
      existing.totalPayment += payment
      existing.grossProfit = existing.totalRevenue - existing.totalPayment
      existing.grossMarginRate =
        existing.totalRevenue > 0
          ? (existing.grossProfit / existing.totalRevenue) * 100
          : 0
    } else {
      const grossProfit = revenue - payment
      plMap.set(staff.id, {
        staffId: staff.id,
        staffName: staff.name,
        employmentType: staff.employmentType,
        companyName: staff.companyName,
        totalWorkDays: 1,
        totalRevenue: revenue,
        totalPayment: payment,
        grossProfit,
        grossMarginRate: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
      })
    }
  }

  return Array.from(plMap.values()).sort(
    (a, b) => b.grossProfit - a.grossProfit
  )
}

// ダッシュボードKPI算出
export const calculateDashboardKpi = (): KajiDashboardKpi => {
  const staffPl = calculateStaffPl()
  const totalRevenue = staffPl.reduce((sum, s) => sum + s.totalRevenue, 0)
  const totalPayment = staffPl.reduce((sum, s) => sum + s.totalPayment, 0)
  const totalGrossProfit = totalRevenue - totalPayment
  const totalWorkingDays = staffPl.reduce((sum, s) => sum + s.totalWorkDays, 0)

  return {
    totalRevenue,
    totalPayment,
    totalGrossProfit,
    grossMarginRate: totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0,
    totalWorkingDays,
    activeStaffCount: staffPl.length,
    averageRoi:
      totalPayment > 0 ? (totalGrossProfit / totalPayment) * 100 : 0,
  }
}

// ランキング生成
export const calculateRankings = () => {
  const staffPl = calculateStaffPl()

  const profitRanking: KajiRankingItem[] = staffPl
    .sort((a, b) => b.grossProfit - a.grossProfit)
    .slice(0, 10)
    .map((s, i) => ({ rank: i + 1, name: s.staffName, value: s.grossProfit }))

  const revenueRanking: KajiRankingItem[] = staffPl
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10)
    .map((s, i) => ({ rank: i + 1, name: s.staffName, value: s.totalRevenue }))

  const workdaysRanking: KajiRankingItem[] = staffPl
    .sort((a, b) => b.totalWorkDays - a.totalWorkDays)
    .slice(0, 10)
    .map((s, i) => ({
      rank: i + 1,
      name: s.staffName,
      value: s.totalWorkDays,
    }))

  return { profitRanking, revenueRanking, workdaysRanking }
}

// キャリア（携帯キャリア）別粗利
export const calculateCarrierProfit = () => {
  // クライアント名からキャリアを推定
  const carrierMap: Record<string, number> = {
    au: 0,
    docomo: 0,
    softbank: 0,
    その他: 0,
  }

  for (const assignment of MOCK_ASSIGNMENTS) {
    const client = MOCK_CLIENTS.find((c) => c.id === assignment.clientId)
    const rate = MOCK_STAFF_RATES.find(
      (r) =>
        r.staffId === assignment.staffId &&
        r.clientId === assignment.clientId &&
        r.roleId === assignment.roleId
    )
    if (!client || !rate) continue

    const profit = rate.unitPrice - rate.paymentPrice - assignment.transportCost
    const name = client.name.toLowerCase()

    if (name.includes('au')) {
      carrierMap['au'] += profit
    } else if (name.includes('ドコモ') || name.includes('docomo')) {
      carrierMap['docomo'] += profit
    } else if (name.includes('ソフトバンク') || name.includes('softbank')) {
      carrierMap['softbank'] += profit
    } else {
      carrierMap['その他'] += profit
    }
  }

  return Object.entries(carrierMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

// 役割別ROI
export const calculateRoleRoi = () => {
  const roleData: Record<string, { revenue: number; payment: number }> = {}

  for (const assignment of MOCK_ASSIGNMENTS) {
    const rate = MOCK_STAFF_RATES.find(
      (r) =>
        r.staffId === assignment.staffId &&
        r.clientId === assignment.clientId &&
        r.roleId === assignment.roleId
    )
    if (!rate) continue

    const roleName =
      assignment.roleId === 'DR'
        ? 'ディレクター'
        : assignment.roleId === 'CH'
          ? 'キャッチャー'
          : 'クローザー'

    if (!roleData[roleName]) {
      roleData[roleName] = { revenue: 0, payment: 0 }
    }
    roleData[roleName].revenue += rate.unitPrice
    roleData[roleName].payment += rate.paymentPrice + assignment.transportCost
  }

  return Object.entries(roleData).map(([name, data]) => ({
    name,
    roi: data.payment > 0 ? ((data.revenue - data.payment) / data.payment) * 100 : 0,
  }))
}
