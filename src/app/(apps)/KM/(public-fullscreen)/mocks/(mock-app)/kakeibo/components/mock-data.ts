import { DEFAULT_CATEGORIES } from './constants'
import type { AssetItem, LifePlanItem, Satisfaction, SpecialBudget, Transaction } from './types'

// ── ヘルパー ──

/** 指定範囲のランダム整数を返す */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** 配列からランダムに1要素を返す */
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)]
}

/** 満足度をランダムに返す（60%はnull） */
function randomSatisfaction(): Satisfaction {
  const r = Math.random()
  if (r < 0.6) return null
  if (r < 0.75) return '〇'
  if (r < 0.9) return '△'
  return '✕'
}

/** YYYY-MM-DD形式の日付文字列を生成 */
function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// ── モックトランザクション生成 ──

/** 1月〜3月分の現実的なダミーデータを生成（約60〜80件） */
export function generateMockTransactions(): Transaction[] {
  const transactions: Transaction[] = []
  let idCounter = 1

  const paymentMethodIds = ['pay-01', 'pay-02', 'pay-03', 'pay-04', 'pay-05', 'pay-06']

  // カテゴリIDをタイプ別にグルーピング
  const categoryByType = {
    income: DEFAULT_CATEGORIES.filter((c) => c.type === 'income').map((c) => c.id),
    fixed_expense: DEFAULT_CATEGORIES.filter((c) => c.type === 'fixed_expense').map((c) => c.id),
    variable_expense: DEFAULT_CATEGORIES.filter((c) => c.type === 'variable_expense').map((c) => c.id),
    special_expense: DEFAULT_CATEGORIES.filter((c) => c.type === 'special_expense').map((c) => c.id),
    savings_investment: DEFAULT_CATEGORIES.filter((c) => c.type === 'savings_investment').map((c) => c.id),
  }

  const addTx = (
    date: string,
    categoryId: string,
    amount: number,
    memo: string,
    paymentMethodId?: string,
    satisfaction?: Satisfaction
  ) => {
    transactions.push({
      id: `tx-${String(idCounter++).padStart(3, '0')}`,
      date,
      categoryId,
      paymentMethodId: paymentMethodId ?? pick(paymentMethodIds),
      amount,
      satisfaction: satisfaction ?? randomSatisfaction(),
      memo,
    })
  }

  // 各月の固定パターンを生成
  for (const month of [1, 2, 3]) {
    const year = 2026
    const daysInMonth = new Date(year, month, 0).getDate()

    // ── 収入（月初） ──
    addTx(formatDate(year, month, 25), 'inc-01', 350000, 'パパ給与', 'pay-03')
    addTx(formatDate(year, month, 25), 'inc-02', 180000, 'ママ給与（パート）', 'pay-04')
    if (month === 1) {
      addTx(formatDate(year, month, 15), 'inc-07', 30000, '児童手当（2人分）', 'pay-03')
    }

    // ── 先取り貯金・投資（月初に自動） ──
    addTx(formatDate(year, month, 1), 'sav-01', 50000, '毎月積立', 'pay-03')
    addTx(formatDate(year, month, 1), 'sav-02', 30000, '特別費積み立て', 'pay-03')
    addTx(formatDate(year, month, 5), 'sav-03', 33333, 'NISA積立', 'pay-03')
    addTx(formatDate(year, month, 5), 'sav-05', 23000, 'iDeCo拠出', 'pay-03')

    // ── 固定費 ──
    addTx(formatDate(year, month, 1), 'fix-01', 85000, '家賃', 'pay-03')
    addTx(formatDate(year, month, 10), 'fix-02', randInt(8000, 15000), '電気代', 'pay-01')
    addTx(formatDate(year, month, 10), 'fix-03', randInt(3000, 6000), 'ガス代', 'pay-01')
    if (month % 2 === 1) {
      // 水道は隔月
      addTx(formatDate(year, month, 15), 'fix-04', randInt(3500, 5000), '水道代', 'pay-03')
    }
    addTx(formatDate(year, month, 1), 'fix-06', 8000, '通信費（スマホ2台）', 'pay-01')
    addTx(formatDate(year, month, 1), 'fix-07', 2980, 'サブスク（Netflix等）', 'pay-01')
    addTx(formatDate(year, month, 1), 'fix-08', 10000, '生命保険', 'pay-03')
    addTx(formatDate(year, month, 1), 'fix-12', 30000, 'パパお小遣い', 'pay-05')
    addTx(formatDate(year, month, 1), 'fix-13', 30000, 'ママお小遣い', 'pay-05')

    // ── 変動費（日付分散） ──
    // 食費: 週2〜3回の買い物
    const foodDays = [3, 7, 10, 14, 18, 22, 26].filter((d) => d <= daysInMonth)
    for (const day of foodDays) {
      addTx(
        formatDate(year, month, day),
        'var-01',
        randInt(1500, 8000),
        pick(['スーパー', 'イオン', '業務スーパー', 'コープ', 'ドラッグストア']),
        pick(['pay-01', 'pay-06', 'pay-05'])
      )
    }

    // 日用品: 月2〜3回
    addTx(formatDate(year, month, randInt(5, 10)), 'var-02', randInt(800, 3000), pick(['洗剤', 'ティッシュ', 'おむつ']), 'pay-06')
    addTx(formatDate(year, month, randInt(15, 25)), 'var-02', randInt(500, 2500), pick(['シャンプー', 'ラップ', 'ゴミ袋']), 'pay-06')

    // 子ども関連: 月2回程度
    addTx(formatDate(year, month, randInt(1, 15)), 'var-07', randInt(1000, 5000), pick(['おむつ', '絵本', 'ベビーフード']), 'pay-01')
    addTx(formatDate(year, month, randInt(16, daysInMonth)), 'var-07', randInt(2000, 8000), pick(['服', 'おもちゃ', '予防接種']), 'pay-01')

    // 趣味・娯楽: 月1回
    addTx(formatDate(year, month, randInt(10, 25)), 'var-04', randInt(2000, 8000), pick(['映画', '公園', 'ショッピングモール']), 'pay-01')

    // 交際費: 月1回
    if (month !== 3) {
      addTx(formatDate(year, month, randInt(15, 28)), 'var-08', randInt(3000, 8000), pick(['飲み会', 'ランチ会', 'お祝い']), 'pay-01')
    }

    // 健康・医療: 月0〜1回
    if (Math.random() > 0.4) {
      addTx(formatDate(year, month, randInt(5, 25)), 'var-06', randInt(1000, 5000), pick(['小児科', '歯医者', '薬局']), 'pay-05')
    }

    // 交通費: 月1〜2回
    addTx(formatDate(year, month, randInt(1, daysInMonth)), 'var-09', randInt(500, 3000), pick(['電車', 'バス', 'ガソリン']), 'pay-06')

    // 雑費: 月1回
    addTx(formatDate(year, month, randInt(1, daysInMonth)), 'var-03', randInt(300, 2000), pick(['コンビニ', '100均', '文房具']), 'pay-05')
  }

  // ── 特別費（スポット） ──
  addTx('2026-01-03', 'spe-02', 15000, 'お正月外食', 'pay-01')
  addTx('2026-02-14', 'spe-02', 5000, 'バレンタインディナー', 'pay-02')
  addTx('2026-03-20', 'spe-01', 45000, '春休み日帰り旅行', 'pay-01')
  addTx('2026-01-15', 'spe-05', 25000, '加湿器購入', 'pay-02')

  // 日付順にソート
  transactions.sort((a, b) => a.date.localeCompare(b.date))

  return transactions
}

// ── ライフプラン初期項目 ──

export const DEFAULT_LIFE_PLAN_ITEMS: LifePlanItem[] = [
  // 収入
  {
    id: 'lp-inc-01',
    categoryId: 'inc-01',
    customName: null,
    type: 'income',
    initialValue: 420, // 万円/年
    growthRate: 0.02,
    periods: [{ startYear: 2026, endYear: 2060 }],
    visible: true,
    useAverage: false,
  },
  {
    id: 'lp-inc-02',
    categoryId: 'inc-02',
    customName: null,
    type: 'income',
    initialValue: 216, // 万円/年
    growthRate: 0.015,
    periods: [{ startYear: 2026, endYear: 2055 }],
    visible: true,
    useAverage: false,
  },
  {
    id: 'lp-inc-03',
    categoryId: 'inc-07',
    customName: null,
    type: 'income',
    initialValue: 24, // 万円/年
    growthRate: 0,
    periods: [{ startYear: 2026, endYear: 2041 }], // 子どもが18歳まで
    visible: true,
    useAverage: false,
  },

  // 先取り貯金・投資
  {
    id: 'lp-sav-01',
    categoryId: 'sav-01',
    customName: null,
    type: 'savings_investment',
    initialValue: 60, // 万円/年
    growthRate: 0,
    periods: [{ startYear: 2026, endYear: 2060 }],
    visible: true,
    useAverage: false,
  },
  {
    id: 'lp-sav-02',
    categoryId: 'sav-03',
    customName: null,
    type: 'savings_investment',
    initialValue: 40, // 万円/年
    growthRate: 0,
    periods: [{ startYear: 2026, endYear: 2060 }],
    visible: true,
    useAverage: false,
  },
  {
    id: 'lp-sav-03',
    categoryId: 'sav-05',
    customName: null,
    type: 'savings_investment',
    initialValue: 27.6, // 万円/年
    growthRate: 0,
    periods: [{ startYear: 2026, endYear: 2060 }],
    visible: true,
    useAverage: false,
  },

  // 固定費
  {
    id: 'lp-fix-01',
    categoryId: 'fix-01',
    customName: null,
    type: 'fixed_expense',
    initialValue: 102, // 万円/年（家賃）
    growthRate: 0.01,
    periods: [{ startYear: 2026, endYear: 2060 }],
    visible: true,
    useAverage: false,
  },
  {
    id: 'lp-fix-02',
    categoryId: null,
    customName: '光熱費合計',
    type: 'fixed_expense',
    initialValue: 25, // 万円/年
    growthRate: 0.02,
    periods: [{ startYear: 2026, endYear: 2060 }],
    visible: true,
    useAverage: true,
  },
  {
    id: 'lp-fix-03',
    categoryId: 'fix-06',
    customName: null,
    type: 'fixed_expense',
    initialValue: 9.6, // 万円/年（通信費）
    growthRate: 0,
    periods: [{ startYear: 2026, endYear: 2060 }],
    visible: true,
    useAverage: false,
  },
  {
    id: 'lp-fix-04',
    categoryId: 'fix-08',
    customName: null,
    type: 'fixed_expense',
    initialValue: 12, // 万円/年（保険）
    growthRate: 0,
    periods: [{ startYear: 2026, endYear: 2060 }],
    visible: true,
    useAverage: false,
  },
  {
    id: 'lp-fix-05',
    categoryId: null,
    customName: 'お小遣い合計',
    type: 'fixed_expense',
    initialValue: 72, // 万円/年
    growthRate: 0,
    periods: [{ startYear: 2026, endYear: 2060 }],
    visible: true,
    useAverage: false,
  },

  // 変動費
  {
    id: 'lp-var-01',
    categoryId: 'var-01',
    customName: null,
    type: 'variable_expense',
    initialValue: 54, // 万円/年（食費）
    growthRate: 0.015,
    periods: [{ startYear: 2026, endYear: 2060 }],
    visible: true,
    useAverage: true,
  },
  {
    id: 'lp-var-02',
    categoryId: null,
    customName: '日用品・雑費',
    type: 'variable_expense',
    initialValue: 18, // 万円/年
    growthRate: 0.01,
    periods: [{ startYear: 2026, endYear: 2060 }],
    visible: true,
    useAverage: true,
  },
  {
    id: 'lp-var-03',
    categoryId: 'var-07',
    customName: null,
    type: 'variable_expense',
    initialValue: 12, // 万円/年（子ども費）
    growthRate: 0.03,
    periods: [{ startYear: 2026, endYear: 2044 }], // 子どもが独立するまで
    visible: true,
    useAverage: true,
  },
  {
    id: 'lp-var-04',
    categoryId: null,
    customName: '教育費',
    type: 'variable_expense',
    initialValue: 30, // 万円/年
    growthRate: 0.02,
    periods: [
      { startYear: 2029, endYear: 2040 }, // 長男 小学〜高校
      { startYear: 2032, endYear: 2043 }, // 次男 小学〜高校
    ],
    visible: true,
    useAverage: false,
  },

  // 特別費
  {
    id: 'lp-spe-01',
    categoryId: null,
    customName: '特別費合計',
    type: 'special_expense',
    initialValue: 36, // 万円/年
    growthRate: 0.01,
    periods: [{ startYear: 2026, endYear: 2060 }],
    visible: true,
    useAverage: false,
  },
]

// ── 資産推移の初期項目 ──

export const DEFAULT_ASSET_ITEMS: AssetItem[] = [
  {
    id: 'asset-01',
    name: '現金・預金',
    currentValue: 300, // 万円
    annualContribution: 60, // 万円/年
    growthRate: 0.00001, // 0.001%
    isDefault: true,
    visible: true,
  },
  {
    id: 'asset-02',
    name: '投資資産（NISA・iDeCo等）',
    currentValue: 150, // 万円
    annualContribution: 67.6, // 万円/年（NISA40 + iDeCo27.6）
    growthRate: 0.04, // 4%
    isDefault: true,
    visible: true,
  },
  {
    id: 'asset-03',
    name: '不動産（評価額）',
    currentValue: 0, // 万円（賃貸なので0）
    annualContribution: 0,
    growthRate: -0.01, // -1%
    isDefault: true,
    visible: false, // 賃貸のため非表示
  },
]

// ── 特別費予算 ──

export const DEFAULT_SPECIAL_BUDGET: SpecialBudget = {
  carryOver: 100000, // 前年繰越（円）
  monthlyReserve: 30000, // 月間積立額（円）
}

// ══════════════════════════════════════════════
// デモ用シードデータ（12ヶ月分・確定的データ）
// ══════════════════════════════════════════════

/** デモに相応しい12ヶ月分の確定的トランザクションを生成 */
export function generateDemoTransactions(): Transaction[] {
  const txs: Transaction[] = []
  let id = 1
  const YEAR = 2026

  const tx = (
    date: string,
    categoryId: string,
    amount: number,
    memo: string,
    payId: string,
    sat: Satisfaction = null
  ) => {
    txs.push({
      id: `demo-${String(id++).padStart(4, '0')}`,
      date,
      categoryId,
      paymentMethodId: payId,
      amount,
      satisfaction: sat,
      memo,
    })
  }

  // 月ごとの変動要素（季節性を反映）
  const monthlyElectric = [14000, 13500, 11000, 8500, 7000, 8000, 12000, 14500, 11000, 8000, 9000, 13000]
  const monthlyGas = [6000, 5500, 4500, 3500, 3000, 2500, 2000, 2000, 2500, 3000, 4000, 5500]
  const monthlyWater = [null, 4500, null, 4200, null, 3800, null, 4000, null, 3900, null, 4300] // 隔月

  // 食費の週次パターン（1週あたり、月4〜5回の買い物）
  const foodWeekly = [
    // [日, 金額, 店名]
    [3, 6800, 'イオン'], [7, 3200, 'コープ'], [10, 5500, '業務スーパー'],
    [14, 4800, 'ドラッグストア'], [18, 7200, 'スーパー'], [22, 3500, 'コープ'],
    [26, 5800, 'イオン'],
  ] as [number, number, string][]

  for (let m = 1; m <= 12; m++) {
    const mm = String(m).padStart(2, '0')
    const d = (day: number) => `${YEAR}-${mm}-${String(day).padStart(2, '0')}`
    const daysInMonth = new Date(YEAR, m, 0).getDate()

    // ── 収入（25日） ──
    tx(d(25), 'inc-01', 350000, 'パパ給与', 'pay-03')
    tx(d(25), 'inc-02', 180000, 'ママ給与（パート）', 'pay-04')
    // 児童手当（2月・6月・10月の15日）
    if ([2, 6, 10].includes(m)) {
      tx(d(15), 'inc-07', 60000, '児童手当（2人分×4ヶ月）', 'pay-03')
    }
    // 賞与（6月・12月）
    if (m === 6) tx(d(10), 'inc-05', 500000, '夏季賞与', 'pay-03')
    if (m === 12) tx(d(10), 'inc-05', 600000, '冬季賞与', 'pay-03')
    // 副業（隔月）
    if (m % 2 === 0) tx(d(28), 'inc-03', 15000, 'ライティング報酬', 'pay-04')

    // ── 先取り貯金・投資（1日〜5日） ──
    tx(d(1), 'sav-01', 50000, '毎月積立', 'pay-03')
    tx(d(1), 'sav-02', 30000, '特別費積み立て', 'pay-03')
    tx(d(5), 'sav-03', 33333, 'NISA積立（つみたて枠）', 'pay-03')
    tx(d(5), 'sav-05', 23000, 'iDeCo拠出', 'pay-03')
    // 賞与月は臨時貯金・NISA
    if (m === 6) {
      tx(d(15), 'sav-06', 100000, '賞与から臨時貯金', 'pay-03')
      tx(d(15), 'sav-07', 100000, 'NISA成長投資枠', 'pay-03')
    }
    if (m === 12) {
      tx(d(15), 'sav-06', 150000, '賞与から臨時貯金', 'pay-03')
      tx(d(15), 'sav-07', 100000, 'NISA成長投資枠', 'pay-03')
    }

    // ── 固定費 ──
    tx(d(1), 'fix-01', 85000, '家賃', 'pay-03')
    tx(d(10), 'fix-02', monthlyElectric[m - 1], '電気代', 'pay-01')
    tx(d(10), 'fix-03', monthlyGas[m - 1], 'ガス代', 'pay-01')
    if (monthlyWater[m - 1] !== null) {
      tx(d(15), 'fix-04', monthlyWater[m - 1]!, '水道代', 'pay-03')
    }
    tx(d(1), 'fix-06', 8000, '通信費（スマホ2台）', 'pay-01')
    tx(d(1), 'fix-07', 2980, 'サブスク（Netflix+Spotify）', 'pay-01')
    tx(d(1), 'fix-08', 10000, '生命保険', 'pay-03')
    tx(d(1), 'fix-12', 30000, 'パパお小遣い', 'pay-05')
    tx(d(1), 'fix-13', 30000, 'ママお小遣い', 'pay-05')
    // 教育費（幼稚園・4月〜3月）
    tx(d(5), 'fix-05', 15000, '長男 幼稚園', 'pay-03')

    // ── 変動費：食費（季節による微増減） ──
    const foodMultiplier = [1.1, 1.0, 1.0, 0.95, 0.95, 1.0, 1.05, 1.1, 1.0, 1.0, 1.0, 1.15][m - 1]
    for (const [day, base, shop] of foodWeekly) {
      if (day <= daysInMonth) {
        const amount = Math.round(base * foodMultiplier / 100) * 100
        const sat: Satisfaction = amount <= 5000 ? '〇' : amount >= 7000 ? '△' : null
        tx(d(day), 'var-01', amount, shop, ['pay-01', 'pay-06', 'pay-05'][day % 3], sat)
      }
    }

    // ── 変動費：日用品（月2回） ──
    const dailyGoods: [number, number, string][] = [
      [8, 2800, '洗剤・ティッシュ'], [20, 1500, 'おむつ・ベビー用品'],
    ]
    for (const [day, amt, memo] of dailyGoods) {
      tx(d(Math.min(day, daysInMonth)), 'var-02', amt, memo, 'pay-06')
    }

    // ── 変動費：子ども（月2回） ──
    const kidItems: [number, number, string, Satisfaction][] = [
      [5, 3500, '絵本・おもちゃ', '〇'],
      [18, 4000 + (m % 3) * 1000, '子ども服・ベビーフード', m % 2 === 0 ? '〇' : '△'],
    ]
    for (const [day, amt, memo, sat] of kidItems) {
      tx(d(Math.min(day, daysInMonth)), 'var-07', amt, memo, 'pay-01', sat)
    }

    // ── 変動費：趣味・娯楽（月1〜2回） ──
    const hobbies: Record<number, [number, number, string, Satisfaction][]> = {
      1: [[11, 5500, '初売りショッピング', '〇']],
      2: [[14, 4800, 'バレンタインデート', '〇']],
      3: [[21, 6200, 'お花見', '〇']],
      4: [[12, 3500, '公園ピクニック', '〇'], [29, 8000, 'GW準備', '△']],
      5: [[4, 12000, 'GW遊園地', '〇'], [18, 3000, '映画', '〇']],
      6: [[14, 4000, '水族館', '〇']],
      7: [[20, 5500, 'プール', '〇'], [28, 3500, '花火大会', '〇']],
      8: [[10, 8000, 'BBQ', '〇'], [24, 4500, '夏祭り', '〇']],
      9: [[15, 5000, 'ぶどう狩り', '〇']],
      10: [[10, 6000, 'ハロウィンイベント', '〇']],
      11: [[3, 4500, '紅葉ドライブ', '〇']],
      12: [[24, 8000, 'クリスマスディナー', '〇'], [31, 5000, '年越し準備', null]],
    }
    for (const [day, amt, memo, sat] of (hobbies[m] ?? [])) {
      tx(d(Math.min(day, daysInMonth)), 'var-04', amt, memo, 'pay-01', sat)
    }

    // ── 変動費：衣服・美容（月0〜1回） ──
    if ([3, 4, 6, 9, 10, 12].includes(m)) {
      const clothingItems: Record<number, [number, number, string]> = {
        3: [8, 8000, '春物コート'],
        4: [15, 5500, 'ママ美容院'],
        6: [10, 6000, '夏物セール'],
        9: [12, 7500, '秋物ジャケット'],
        10: [20, 4500, 'パパ美容院'],
        12: [5, 12000, '冬物アウター'],
      }
      const [day, amt, memo] = clothingItems[m]
      tx(d(day), 'var-05', amt, memo, 'pay-02', amt >= 8000 ? '△' : '〇')
    }

    // ── 変動費：交際費（月1回） ──
    const socialItems: Record<number, [number, number, string]> = {
      1: [8, 5000, '新年会'], 2: [22, 4000, 'ランチ会'], 3: [15, 6000, '送別会'],
      4: [12, 7000, '歓迎会'], 5: [20, 4500, 'ママ友ランチ'], 6: [25, 5000, '飲み会'],
      7: [18, 6500, 'BBQ（友人）'], 8: [8, 5000, '帰省お土産'], 9: [22, 4000, 'ランチ会'],
      10: [15, 5500, '飲み会'], 11: [8, 4000, 'ママ友ランチ'], 12: [20, 8000, '忘年会'],
    }
    if (socialItems[m]) {
      const [day, amt, memo] = socialItems[m]
      tx(d(day), 'var-08', amt, memo, 'pay-01', amt >= 7000 ? '✕' : null)
    }

    // ── 変動費：健康・医療（月0〜1回） ──
    const medicalItems: Record<number, [number, number, string]> = {
      1: [20, 3500, '小児科（風邪）'],
      3: [10, 5000, '歯医者（定期検診）'],
      5: [15, 2500, '薬局'],
      7: [8, 4000, '小児科（夏風邪）'],
      9: [12, 3000, '皮膚科'],
      11: [5, 6000, 'インフルエンザ予防接種×2'],
    }
    if (medicalItems[m]) {
      const [day, amt, memo] = medicalItems[m]
      tx(d(day), 'var-06', amt, memo, 'pay-05')
    }

    // ── 変動費：交通費（毎月） ──
    tx(d(15), 'var-09', 2000 + (m % 3) * 500, 'ガソリン・駐車場', 'pay-06')

    // ── 変動費：雑費（毎月） ──
    tx(d(12), 'var-03', 800 + (m % 4) * 300, 'コンビニ・100均', 'pay-05')
  }

  // ── 特別費（年間イベント） ──
  tx('2026-01-03', 'spe-02', 18000, 'お正月 外食（両家）', 'pay-01', '〇')
  tx('2026-01-15', 'spe-05', 25000, '加湿器 購入', 'pay-02', '〇')
  tx('2026-02-14', 'spe-02', 6000, 'バレンタインディナー', 'pay-01', '〇')
  tx('2026-03-20', 'spe-01', 45000, '春休み日帰り旅行（箱根）', 'pay-01', '〇')
  tx('2026-04-05', 'spe-07', 15000, '長男 入園準備品', 'pay-02', null)
  tx('2026-05-05', 'spe-02', 8000, 'こどもの日 外食', 'pay-01', '〇')
  tx('2026-06-20', 'spe-04', 24000, '自動車保険（年払い）', 'pay-03', null)
  tx('2026-07-25', 'spe-05', 35000, 'エアコン修理', 'pay-02', '✕')
  tx('2026-08-12', 'spe-01', 120000, '夏休み家族旅行（沖縄）', 'pay-01', '〇')
  tx('2026-09-15', 'spe-03', 85000, '賃貸更新料', 'pay-03', '✕')
  tx('2026-10-31', 'spe-07', 5000, 'ハロウィン衣装', 'pay-06', '〇')
  tx('2026-11-20', 'spe-05', 45000, '掃除機買い替え', 'pay-02', '〇')
  tx('2026-12-24', 'spe-02', 12000, 'クリスマスディナー', 'pay-01', '〇')
  tx('2026-12-25', 'spe-07', 20000, 'クリスマスプレゼント（子ども）', 'pay-02', '〇')

  // 日付順ソート
  txs.sort((a, b) => a.date.localeCompare(b.date))
  return txs
}
