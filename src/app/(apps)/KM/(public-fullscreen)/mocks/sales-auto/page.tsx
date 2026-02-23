'use client'

import React, {useState, useEffect, useCallback} from 'react'
import {
  Car,
  LayoutDashboard,
  Handshake,
  ClipboardList,
  FileText,
  Truck,
  CalendarDays,
  BarChart3,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  AlertTriangle,
  PanelRightOpen,
  Users,
  RotateCcw,
  Trash2,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  CircleDot,
  Calendar,
  Edit3,
  X,
  Eye,
  CheckCircle2,
  Circle,
  ArrowRight,
  ChevronDown,
  Filter,
  Star,
  Phone,
  Mail,
  Printer,
  LucideIcon,
} from 'lucide-react'
import {
  SplashScreen,
  InfoSidebar,
  Modal,
  GuidanceOverlay,
  GuidanceStartButton,
  usePersistedState,
  generateId,
  resetPersistedData,
  type Feature,
  type TimeEfficiencyItem,
  type OverviewInfo,
  type OperationStep,
  type GuidanceStep,
} from '../_components'

// ==========================================
// 機能説明データ
// ==========================================

const FEATURES: Feature[] = [
  {icon: Handshake, title: '商談管理', description: '見込み客の初回接触から成約まで、商談の全プロセスを一元管理。ABC判定と後追いタスクで営業効率を最大化。', benefit: '成約率を25%向上'},
  {icon: FileText, title: '見積・請求', description: '車両本体＋オプション＋値引きの見積書を即座に作成。成約後は請求書を自動生成し、入金管理まで一気通貫。', benefit: '見積作成時間を80%短縮'},
  {icon: Truck, title: '納車管理', description: '注文から納車までのスケジュールとステータスを可視化。必要書類の回収状況も一目で確認。', benefit: '納車遅延をゼロに'},
  {icon: BarChart3, title: '売上分析', description: '月次売上・前年同月比・営業マン別実績をリアルタイムで可視化。データに基づく経営判断を支援。', benefit: '分析作業を95%削減'},
]

const TIME_EFFICIENCY: TimeEfficiencyItem[] = [
  {task: '商談進捗確認', before: '30分/日', after: 'ダッシュボード即確認', saved: '30分/日'},
  {task: '見積書作成', before: '30分/件', after: '5分/件', saved: '25分/件'},
  {task: '納車スケジュール管理', before: '1時間/日', after: '10分/日', saved: '50分/日'},
  {task: '月次売上レポート', before: '3時間/月', after: '自動生成', saved: '3時間/月'},
]

const CHALLENGES = [
  '商談の進捗状況が営業マンの頭の中にしかない',
  '見積書作成に時間がかかり商談のスピード感が落ちる',
  '納車スケジュールの管理が属人的でミスが発生する',
  '売上データの集計・分析に時間がかかる',
  '後追い営業が漏れて機会損失が発生する',
]

const OVERVIEW: OverviewInfo = {
  description: '自動車ディーラーの営業活動全体をデジタル管理するシステムです。見込み客管理から成約、納車、アフターフォローまで一気通貫で管理します。',
  automationPoints: [
    '商談ステータスの自動追跡とABC判定による優先度管理',
    '見積書・請求書のワンクリック自動生成',
    '納車スケジュールと必要書類の一元管理',
    '売上実績の自動集計とリアルタイム分析',
  ],
  userBenefits: [
    '営業活動の属人化を解消し、チーム全体で情報共有',
    '見積作成のスピードアップで商談の機会損失を防止',
    'データに基づく営業戦略の立案が可能に',
  ],
}

const OPERATION_STEPS: OperationStep[] = [
  {step: 1, action: 'ダッシュボードを確認', detail: '今月の商談状況・成約件数・売上推移を一目で把握'},
  {step: 2, action: '商談を登録・管理', detail: '顧客情報と車種を選んで商談を作成。ステータスとランクで進捗管理'},
  {step: 3, action: '見積書を作成', detail: '商談から見積書をワンクリック生成。オプション・値引きも反映'},
  {step: 4, action: '納車スケジュールを管理', detail: '成約後の納車予定日・書類回収状況を管理'},
  {step: 5, action: '売上分析を確認', detail: '月次推移・前年比・営業マン別実績をグラフで確認'},
]

const getGuidanceSteps = (setActiveTab: (tab: TabId) => void): GuidanceStep[] => [
  {targetSelector: '[data-guidance="dashboard-tab"]', title: 'ダッシュボード', description: '商談状況・売上推移・直近の活動をリアルタイムで確認できます。', position: 'bottom', action: () => setActiveTab('dashboard')},
  {targetSelector: '[data-guidance="deals-tab"]', title: '商談管理', description: '商談の作成・編集・ステータス変更が行えます。ABC判定で優先度を管理。', position: 'bottom', action: () => setActiveTab('dashboard')},
  {targetSelector: '[data-guidance="add-deal-button"]', title: '商談の新規追加', description: '「商談追加」ボタンで新しい商談を登録します。顧客・車種・金額を入力。', position: 'bottom', action: () => setActiveTab('deals')},
  {targetSelector: '[data-guidance="deal-row"]', title: '商談の編集', description: '商談の行をクリックすると編集モーダルが開きます。ステータス・ランクの変更も可能。', position: 'bottom', action: () => setActiveTab('deals')},
  {targetSelector: '[data-guidance="daily-tab"]', title: '日報・勤怠', description: '営業日報の作成と勤怠の打刻を行います。', position: 'bottom', action: () => setActiveTab('deals')},
  {targetSelector: '[data-guidance="add-daily-button"]', title: '日報の作成', description: '「日報作成」ボタンで営業活動の日報を登録します。', position: 'bottom', action: () => setActiveTab('daily')},
  {targetSelector: '[data-guidance="estimates-tab"]', title: '見積・請求', description: '見積書の作成と請求書の自動生成を行います。', position: 'bottom', action: () => setActiveTab('daily')},
  {targetSelector: '[data-guidance="add-estimate-button"]', title: '見積書の作成', description: '「見積作成」ボタンで新しい見積書を作成します。車両・オプション・値引きを入力。', position: 'bottom', action: () => setActiveTab('estimates')},
  {targetSelector: '[data-guidance="calendar-tab"]', title: 'カレンダー / 納車', description: '商談予定と納車スケジュールをカレンダーで統合管理。チェックボックスで表示切替が可能です。', position: 'bottom', action: () => setActiveTab('estimates')},
  {targetSelector: '[data-guidance="add-delivery-button"]', title: '納車の登録', description: '「納車追加」ボタンで納車予定を登録します。顧客・車種・納車日を入力。', position: 'bottom', action: () => setActiveTab('calendar')},
  {targetSelector: '[data-guidance="analytics-tab"]', title: '売上分析', description: '月次売上・前年比・担当別実績をグラフで可視化します。', position: 'bottom', action: () => setActiveTab('calendar')},
  {targetSelector: '[data-guidance="info-button"]', title: '機能説明', description: 'システムの概要・操作手順・時間削減効果を確認できます。右下のボタンからいつでも開けます。', position: 'top', action: () => setActiveTab('analytics')},
]

// ==========================================
// 型定義
// ==========================================

interface SalesPerson {
  id: string
  name: string
  team: string
}

interface Customer {
  id: string
  name: string
  nameKana: string
  phone: string
  email: string
  address: string
  birthDate: string
  occupation: string
  note: string
}

interface CarModel {
  id: string
  name: string
  maker: string
  category: string
  basePrice: number
  image: string
}

type DealStatus = '初回接触' | 'ヒアリング' | '試乗済' | '見積提示' | '商談中' | '成約' | '失注'
type DealRank = 'A' | 'B' | 'C'

interface DealTask {
  id: string
  title: string
  dueDate: string
  done: boolean
}

interface Deal {
  id: string
  customerId: string
  salesPersonId: string
  carModelId: string
  status: DealStatus
  rank: DealRank
  amount: number
  nextAction: string
  nextActionDate: string
  tasks: DealTask[]
  note: string
  createdAt: string
  updatedAt: string
}

interface DailyActivity {
  type: '電話' | '来店' | '訪問' | '試乗' | 'メール' | 'その他'
  customerName: string
  content: string
}

interface DailyReport {
  id: string
  salesPersonId: string
  date: string
  activities: DailyActivity[]
  summary: string
  nextDayPlan: string
}

interface AttendanceRecord {
  id: string
  salesPersonId: string
  date: string
  clockIn: string
  clockOut: string
  note: string
}

interface EstimateOption {
  name: string
  price: number
}

interface Estimate {
  id: string
  dealId: string
  customerId: string
  carModelId: string
  options: EstimateOption[]
  discount: number
  taxRate: number
  totalBeforeTax: number
  totalWithTax: number
  createdAt: string
  validUntil: string
}

interface Invoice {
  id: string
  estimateId: string
  dealId: string
  customerId: string
  amount: number
  status: '未請求' | '請求済' | '入金済'
  issuedAt: string
  dueDate: string
  paidAt: string | null
}

type DeliveryStatus = '受注' | '車両手配中' | '登録手続中' | '納車整備中' | '納車準備完了' | '納車済'

interface DeliveryDocument {
  name: string
  collected: boolean
}

interface DeliverySchedule {
  id: string
  dealId: string
  customerId: string
  carModelId: string
  salesPersonId: string
  status: DeliveryStatus
  scheduledDate: string
  documents: DeliveryDocument[]
  note: string
}

interface MonthlySales {
  month: string
  amount: number
  count: number
}

// ==========================================
// マスタデータ
// ==========================================

const SALES_PERSONS: SalesPerson[] = [
  {id: 'SP01', name: '田中太郎', team: 'A'},
  {id: 'SP02', name: '鈴木花子', team: 'A'},
  {id: 'SP03', name: '佐藤健一', team: 'B'},
  {id: 'SP04', name: '高橋美咲', team: 'B'},
  {id: 'SP05', name: '伊藤大輔', team: 'A'},
  {id: 'SP06', name: '渡辺ゆかり', team: 'B'},
]

const CAR_MODELS: CarModel[] = [
  {id: 'CM01', name: 'アクセラ セダン', maker: 'メーカーA', category: 'セダン', basePrice: 2800000, image: ''},
  {id: 'CM02', name: 'クロスフィールド SUV', maker: 'メーカーA', category: 'SUV', basePrice: 3500000, image: ''},
  {id: 'CM03', name: 'プリモ コンパクト', maker: 'メーカーA', category: 'コンパクト', basePrice: 1980000, image: ''},
  {id: 'CM04', name: 'グランツ ミニバン', maker: 'メーカーA', category: 'ミニバン', basePrice: 3200000, image: ''},
  {id: 'CM05', name: 'スポルトX', maker: 'メーカーA', category: 'スポーツ', basePrice: 4200000, image: ''},
  {id: 'CM06', name: 'エコドライブ HV', maker: 'メーカーA', category: 'ハイブリッド', basePrice: 2600000, image: ''},
  {id: 'CM07', name: 'ラグジーEV', maker: 'メーカーA', category: 'EV', basePrice: 5500000, image: ''},
  {id: 'CM08', name: 'タウンムーバー', maker: 'メーカーA', category: '軽自動車', basePrice: 1500000, image: ''},
  {id: 'CM09', name: 'アドベンチャー 4WD', maker: 'メーカーA', category: 'SUV', basePrice: 3800000, image: ''},
  {id: 'CM10', name: 'ファミリーワゴン', maker: 'メーカーA', category: 'ワゴン', basePrice: 2900000, image: ''},
]

const OPTION_CATALOG: EstimateOption[] = [
  {name: 'カーナビ (10インチ)', price: 250000},
  {name: 'ETC2.0車載器', price: 35000},
  {name: 'ドライブレコーダー (前後)', price: 45000},
  {name: 'フロアマット', price: 25000},
  {name: 'ボディコーティング', price: 80000},
  {name: 'サイドバイザー', price: 18000},
  {name: '革シートカバー', price: 150000},
  {name: 'ルーフキャリア', price: 55000},
]

const DELIVERY_REQUIRED_DOCS: string[] = ['印鑑証明書', '車庫証明書', '委任状', '住民票', '自動車保険証券', '旧車両の登録抹消書類']

// ==========================================
// シード付きランダム生成
// ==========================================

const createSeededRandom = (seed: number) => {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    return s / 0x7fffffff
  }
}

// ==========================================
// 初期データ生成
// ==========================================

const generateInitialData = () => {
  const rand = createSeededRandom(20260222)

  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]
  const pickN = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min

  const CUSTOMER_NAMES = [
    {name: '山田一郎', kana: 'ヤマダイチロウ'},
    {name: '中村美紀', kana: 'ナカムラミキ'},
    {name: '小林正人', kana: 'コバヤシマサト'},
    {name: '加藤裕子', kana: 'カトウユウコ'},
    {name: '吉田健太', kana: 'ヨシダケンタ'},
    {name: '松本恵理', kana: 'マツモトエリ'},
    {name: '井上隆志', kana: 'イノウエタカシ'},
    {name: '木村由美', kana: 'キムラユミ'},
    {name: '清水大介', kana: 'シミズダイスケ'},
    {name: '森田亮太', kana: 'モリタリョウタ'},
    {name: '藤井真弓', kana: 'フジイマユミ'},
    {name: '西村和也', kana: 'ニシムラカズヤ'},
    {name: '三浦聡子', kana: 'ミウラサトコ'},
    {name: '岡田浩二', kana: 'オカダコウジ'},
    {name: '前田恭子', kana: 'マエダキョウコ'},
    {name: '上田誠', kana: 'ウエダマコト'},
    {name: '原田千佳', kana: 'ハラダチカ'},
    {name: '石井翔太', kana: 'イシイショウタ'},
    {name: '長谷川涼', kana: 'ハセガワリョウ'},
    {name: '斉藤美香', kana: 'サイトウミカ'},
  ]

  const OCCUPATIONS = ['会社員', '自営業', '公務員', '医師', '主婦', 'エンジニア', '教員', '経営者', '看護師', '弁護士']
  const CITIES = ['東京都世田谷区', '神奈川県横浜市', '千葉県船橋市', '埼玉県さいたま市', '東京都練馬区', '神奈川県川崎市', '千葉県柏市', '東京都杉並区', '埼玉県越谷市', '東京都板橋区']

  const customers: Customer[] = CUSTOMER_NAMES.map((cn, i) => ({
    id: `CUST${String(i + 1).padStart(3, '0')}`,
    name: cn.name,
    nameKana: cn.kana,
    phone: `090-${String(pickN(1000, 9999))}-${String(pickN(1000, 9999))}`,
    email: `${cn.kana.toLowerCase().slice(0, 4)}@example.com`,
    address: `${pick(CITIES)}${pickN(1, 9)}-${pickN(1, 30)}-${pickN(1, 15)}`,
    birthDate: `${pickN(1965, 2000)}-${String(pickN(1, 12)).padStart(2, '0')}-${String(pickN(1, 28)).padStart(2, '0')}`,
    occupation: pick(OCCUPATIONS),
    note: '',
  }))

  const DEAL_STATUSES: DealStatus[] = ['初回接触', 'ヒアリング', '試乗済', '見積提示', '商談中', '成約', '失注']
  const RANKS: DealRank[] = ['A', 'B', 'C']
  const NEXT_ACTIONS = ['電話フォロー', '試乗案内', '見積提示', '契約書送付', '値引交渉', '下取り査定', '在庫確認', '上長相談']

  const deals: Deal[] = []
  const estimates: Estimate[] = []
  const invoices: Invoice[] = []
  const deliveries: DeliverySchedule[] = []

  for (let month = 1; month <= 12; month++) {
    const dealCount = pickN(8, 12)
    for (let d = 0; d < dealCount; d++) {
      const customer = pick(customers)
      const sp = pick(SALES_PERSONS)
      const car = pick(CAR_MODELS)
      const status = pick(DEAL_STATUSES)
      const rank = pick(RANKS)
      const day = pickN(1, 28)
      const dateStr = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const optCount = pickN(0, 4)
      const selectedOpts = Array.from({length: optCount}, () => pick(OPTION_CATALOG))
      const optTotal = selectedOpts.reduce((s, o) => s + o.price, 0)
      const discount = pickN(0, 5) * 50000
      const amount = car.basePrice + optTotal - discount

      const taskCount = pickN(1, 3)
      const tasks: DealTask[] = Array.from({length: taskCount}, (_, ti) => ({
        id: `T${month}${d}${ti}`,
        title: pick(NEXT_ACTIONS),
        dueDate: `2026-${String(month).padStart(2, '0')}-${String(Math.min(day + pickN(1, 7), 28)).padStart(2, '0')}`,
        done: rand() > 0.5,
      }))

      const dealId = `DEAL${String(deals.length + 1).padStart(4, '0')}`
      deals.push({
        id: dealId,
        customerId: customer.id,
        salesPersonId: sp.id,
        carModelId: car.id,
        status,
        rank,
        amount,
        nextAction: pick(NEXT_ACTIONS),
        nextActionDate: `2026-${String(month).padStart(2, '0')}-${String(Math.min(day + pickN(1, 14), 28)).padStart(2, '0')}`,
        tasks,
        note: '',
        createdAt: dateStr,
        updatedAt: dateStr,
      })

      if (status === '成約') {
        const taxRate = 0.1
        const totalBeforeTax = amount
        const totalWithTax = Math.round(amount * (1 + taxRate))
        const estId = `EST${String(estimates.length + 1).padStart(4, '0')}`
        estimates.push({
          id: estId,
          dealId,
          customerId: customer.id,
          carModelId: car.id,
          options: selectedOpts,
          discount,
          taxRate,
          totalBeforeTax,
          totalWithTax,
          createdAt: dateStr,
          validUntil: `2026-${String(month).padStart(2, '0')}-${String(Math.min(day + 14, 28)).padStart(2, '0')}`,
        })

        const invId = `INV${String(invoices.length + 1).padStart(4, '0')}`
        const invStatus = month <= 10 ? '入金済' as const : month === 11 ? '請求済' as const : '未請求' as const
        invoices.push({
          id: invId,
          estimateId: estId,
          dealId,
          customerId: customer.id,
          amount: totalWithTax,
          status: invStatus,
          issuedAt: dateStr,
          dueDate: `2026-${String(Math.min(month + 1, 12)).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          paidAt: invStatus === '入金済' ? `2026-${String(Math.min(month + 1, 12)).padStart(2, '0')}-${String(pickN(1, 28)).padStart(2, '0')}` : null,
        })

        const DELIVERY_STATUSES: DeliveryStatus[] = ['受注', '車両手配中', '登録手続中', '納車整備中', '納車準備完了', '納車済']
        const delStatus = month <= 9 ? '納車済' as const : pick(DELIVERY_STATUSES)
        deliveries.push({
          id: `DEL${String(deliveries.length + 1).padStart(4, '0')}`,
          dealId,
          customerId: customer.id,
          carModelId: car.id,
          salesPersonId: sp.id,
          status: delStatus,
          scheduledDate: `2026-${String(Math.min(month + 1, 12)).padStart(2, '0')}-${String(pickN(1, 28)).padStart(2, '0')}`,
          documents: DELIVERY_REQUIRED_DOCS.map((name) => ({name, collected: rand() > 0.3})),
          note: '',
        })
      }
    }
  }

  const ACTIVITY_TYPES: DailyActivity['type'][] = ['電話', '来店', '訪問', '試乗', 'メール', 'その他']
  const dailyReports: DailyReport[] = []
  const attendance: AttendanceRecord[] = []

  // 直近3ヶ月分の日報と勤怠
  for (let mi = 0; mi < 3; mi++) {
    const m = mi === 0 ? 12 : mi === 1 ? 1 : 2
    const y = mi === 0 ? 2025 : 2026
    const daysInMonth = new Date(y, m, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(y, m - 1, day)
      const dow = dateObj.getDay()
      if (dow === 0 || dow === 6) continue

      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      for (const sp of SALES_PERSONS) {
        const clockInMin = pickN(0, 15)
        const clockOutMin = pickN(0, 30)
        attendance.push({
          id: `ATT${attendance.length + 1}`,
          salesPersonId: sp.id,
          date: dateStr,
          clockIn: `09:${String(clockInMin).padStart(2, '0')}`,
          clockOut: `18:${String(clockOutMin).padStart(2, '0')}`,
          note: '',
        })

        const actCount = pickN(2, 4)
        const activities: DailyActivity[] = Array.from({length: actCount}, () => ({
          type: pick(ACTIVITY_TYPES),
          customerName: pick(customers).name,
          content: pick(['新車案内', '見積提示', 'フォローコール', '来店対応', '試乗対応', '契約手続き', 'アフターフォロー', '紹介依頼']),
        }))

        dailyReports.push({
          id: `DR${dailyReports.length + 1}`,
          salesPersonId: sp.id,
          date: dateStr,
          activities,
          summary: pick(['順調に進捗', '新規接触3件獲得', '成約1件達成', '試乗2件実施', 'フォロー中心の一日', '見積3件提出']),
          nextDayPlan: pick(['Aランク商談フォロー', '新規来店対応', '納車立ち会い', '見積作成', '電話フォロー5件', 'チームミーティング']),
        })
      }
    }
  }

  // 12ヶ月分の勤怠（日報がない月も）
  for (let month = 3; month <= 11; month++) {
    const daysInMonth = new Date(2026, month, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(2026, month - 1, day)
      const dow = dateObj.getDay()
      if (dow === 0 || dow === 6) continue
      const dateStr = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      for (const sp of SALES_PERSONS) {
        const clockInMin = pickN(0, 15)
        const clockOutMin = pickN(0, 30)
        attendance.push({
          id: `ATT${attendance.length + 1}`,
          salesPersonId: sp.id,
          date: dateStr,
          clockIn: `09:${String(clockInMin).padStart(2, '0')}`,
          clockOut: `18:${String(clockOutMin).padStart(2, '0')}`,
          note: '',
        })
      }
    }
  }

  const lastYearSales: MonthlySales[] = Array.from({length: 12}, (_, i) => {
    const baseAmount = pickN(15000000, 35000000)
    const count = pickN(5, 15)
    return {
      month: `2025-${String(i + 1).padStart(2, '0')}`,
      amount: baseAmount,
      count,
    }
  })

  return {customers, deals, estimates, invoices, deliveries, dailyReports, attendance, lastYearSales}
}

const INITIAL_DATA = generateInitialData()

// ==========================================
// ストレージキー
// ==========================================

const STORAGE_KEYS = {
  customers: 'mock-sales-auto-customers',
  deals: 'mock-sales-auto-deals',
  estimates: 'mock-sales-auto-estimates',
  invoices: 'mock-sales-auto-invoices',
  deliveries: 'mock-sales-auto-deliveries',
  dailyReports: 'mock-sales-auto-dailyReports',
  attendance: 'mock-sales-auto-attendance',
}

const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`

const getCustomerName = (customerId: string, customers: Customer[]) => customers.find((c) => c.id === customerId)?.name ?? '不明'
const getCarModelName = (carModelId: string) => CAR_MODELS.find((c) => c.id === carModelId)?.name ?? '不明'
const getSalesPersonName = (spId: string) => SALES_PERSONS.find((s) => s.id === spId)?.name ?? '不明'

// ==========================================
// タブ定義
// ==========================================

type TabId = 'dashboard' | 'deals' | 'daily' | 'estimates' | 'calendar' | 'analytics'

interface Tab {
  id: TabId
  label: string
  icon: LucideIcon
}

const TABS: Tab[] = [
  {id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard},
  {id: 'deals', label: '商談管理', icon: Handshake},
  {id: 'daily', label: '営業日報', icon: ClipboardList},
  {id: 'estimates', label: '見積・請求', icon: FileText},
  {id: 'calendar', label: 'カレンダー', icon: CalendarDays},
  {id: 'analytics', label: '売上分析', icon: BarChart3},
]

// ==========================================
// フォーム入力ヘルパー
// ==========================================

const FormField = ({label, children}: {label: string; children: React.ReactNode}) => (
  <div>
    <label className="text-xs text-stone-500 block mb-1">{label}</label>
    {children}
  </div>
)

const inputClass = 'w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const selectClass = inputClass

// ==========================================
// StatusBadge
// ==========================================

const StatusBadge = ({status, onClick}: {status: string; onClick?: () => void}) => {
  const config: Record<string, string> = {
    '初回接触': 'bg-slate-50 text-slate-600 border-slate-200',
    'ヒアリング': 'bg-sky-50 text-sky-700 border-sky-200',
    '試乗済': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    '見積提示': 'bg-violet-50 text-violet-700 border-violet-200',
    '商談中': 'bg-amber-50 text-amber-700 border-amber-200',
    '成約': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    '失注': 'bg-red-50 text-red-600 border-red-200',
    '未請求': 'bg-slate-50 text-slate-600 border-slate-200',
    '請求済': 'bg-blue-50 text-blue-700 border-blue-200',
    '入金済': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    '受注': 'bg-slate-50 text-slate-600 border-slate-200',
    '車両手配中': 'bg-sky-50 text-sky-700 border-sky-200',
    '登録手続中': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    '納車整備中': 'bg-amber-50 text-amber-700 border-amber-200',
    '納車準備完了': 'bg-violet-50 text-violet-700 border-violet-200',
    '納車済': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }
  return (
    <span
      onClick={onClick ? (e) => {e.stopPropagation(); onClick()} : undefined}
      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${config[status] ?? 'bg-slate-50 text-slate-600 border-slate-200'} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      {status}
    </span>
  )
}

const RankBadge = ({rank}: {rank: DealRank}) => {
  const config: Record<DealRank, string> = {
    A: 'bg-red-50 text-red-700 border-red-200',
    B: 'bg-amber-50 text-amber-700 border-amber-200',
    C: 'bg-slate-50 text-slate-600 border-slate-200',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${config[rank]}`}>{rank}</span>
}

// ==========================================
// 1. ダッシュボードビュー
// ==========================================

const DashboardView = ({
  deals,
  customers,
}: {
  deals: Deal[]
  customers: Customer[]
}) => {
  const now = new Date()
  const currentMonth = `2026-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonthDeals = deals.filter((d) => d.createdAt.startsWith('2026-02'))
  const closedDeals = thisMonthDeals.filter((d) => d.status === '成約')
  const closedRate = thisMonthDeals.length > 0 ? Math.round((closedDeals.length / thisMonthDeals.length) * 100) : 0
  const totalSales = closedDeals.reduce((s, d) => s + d.amount, 0)

  const today = '2026-02-22'
  const overdueTasks = deals.flatMap((d) =>
    d.tasks.filter((t) => !t.done && t.dueDate <= today).map((t) => ({...t, dealId: d.id, customerId: d.customerId}))
  )
  const tomorrowDeals = deals.filter((d) => d.nextActionDate === '2026-02-23')

  // 営業ランキング
  const spRanking = SALES_PERSONS.map((sp) => {
    const spClosedDeals = thisMonthDeals.filter((d) => d.salesPersonId === sp.id && d.status === '成約')
    return {sp, count: spClosedDeals.length, amount: spClosedDeals.reduce((s, d) => s + d.amount, 0)}
  }).sort((a, b) => b.count - a.count || b.amount - a.amount).slice(0, 3)

  // パイプライン
  const PIPELINE_STATUSES: DealStatus[] = ['初回接触', 'ヒアリング', '試乗済', '見積提示', '商談中', '成約', '失注']
  const pipelineData = PIPELINE_STATUSES.map((status) => ({
    status,
    count: thisMonthDeals.filter((d) => d.status === status).length,
  }))
  const maxPipelineCount = Math.max(...pipelineData.map((p) => p.count), 1)

  return (
    <div className="space-y-6">
      {/* KPIカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label: '当月商談数', value: String(thisMonthDeals.length), icon: Handshake, color: 'text-blue-600'},
          {label: '成約数', value: String(closedDeals.length), icon: CheckCircle2, color: 'text-emerald-600'},
          {label: '成約率', value: `${closedRate}%`, icon: Target, color: 'text-violet-600'},
          {label: '当月売上合計', value: formatCurrency(totalSales), icon: TrendingUp, color: 'text-sky-600'},
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              <span className="text-xs text-stone-500">{kpi.label}</span>
            </div>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* アラートリスト */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            アラート
          </h3>
          <div className="space-y-3">
            {overdueTasks.length === 0 && tomorrowDeals.length === 0 && (
              <p className="text-sm text-stone-400">アラートはありません</p>
            )}
            {overdueTasks.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-start gap-2 text-sm">
                <Clock className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-red-600 font-medium">期限切れ: </span>
                  <span className="text-stone-700">{t.title} ({getCustomerName(t.customerId, customers)}様) - {t.dueDate}</span>
                </div>
              </div>
            ))}
            {tomorrowDeals.slice(0, 5).map((d) => (
              <div key={d.id} className="flex items-start gap-2 text-sm">
                <Calendar className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-blue-600 font-medium">明日のアポ: </span>
                  <span className="text-stone-700">{getCustomerName(d.customerId, customers)}様 - {d.nextAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 営業ランキング */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            営業ランキング（当月成約）
          </h3>
          <div className="space-y-3">
            {spRanking.map((item, idx) => (
              <div key={item.sp.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-stone-100 text-stone-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-800">{item.sp.name}</p>
                  <p className="text-xs text-stone-500">チーム{item.sp.team}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-stone-800">{item.count}件</p>
                  <p className="text-xs text-stone-500">{formatCurrency(item.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* パイプライン */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          <CircleDot className="w-4 h-4 text-blue-500" />
          パイプラインステータス（当月）
        </h3>
        <div className="space-y-3">
          {pipelineData.map((p) => (
            <div key={p.status} className="flex items-center gap-3">
              <span className="text-sm text-stone-600 w-20 shrink-0">{p.status}</span>
              <div className="flex-1 bg-stone-100 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-end pr-2 transition-all"
                  style={{width: `${Math.max((p.count / maxPipelineCount) * 100, 8)}%`}}
                >
                  <span className="text-xs text-white font-bold">{p.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 2. 商談管理ビュー
// ==========================================

const DEAL_STATUSES: DealStatus[] = ['初回接触', 'ヒアリング', '試乗済', '見積提示', '商談中', '成約', '失注']

const DealsView = ({
  deals,
  setDeals,
  customers,
}: {
  deals: Deal[]
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>
  customers: Customer[]
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterRank, setFilterRank] = useState<string>('')
  const [filterSP, setFilterSP] = useState<string>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Deal | null>(null)

  const filtered = deals.filter((d) => {
    const customerName = getCustomerName(d.customerId, customers)
    const carName = getCarModelName(d.carModelId)
    const matchSearch = !searchTerm || customerName.includes(searchTerm) || carName.includes(searchTerm)
    const matchStatus = !filterStatus || d.status === filterStatus
    const matchRank = !filterRank || d.rank === filterRank
    const matchSP = !filterSP || d.salesPersonId === filterSP
    return matchSearch && matchStatus && matchRank && matchSP
  })

  const emptyDeal: Omit<Deal, 'id'> = {
    customerId: customers[0]?.id ?? '',
    salesPersonId: SALES_PERSONS[0].id,
    carModelId: CAR_MODELS[0].id,
    status: '初回接触',
    rank: 'C',
    amount: CAR_MODELS[0].basePrice,
    nextAction: '',
    nextActionDate: '2026-02-22',
    tasks: [],
    note: '',
    createdAt: '2026-02-22',
    updatedAt: '2026-02-22',
  }

  const [form, setForm] = useState(emptyDeal)

  const openNew = () => {
    setEditingItem(null)
    setForm(emptyDeal)
    setModalOpen(true)
  }

  const openEdit = (deal: Deal) => {
    setEditingItem(deal)
    setForm({
      customerId: deal.customerId,
      salesPersonId: deal.salesPersonId,
      carModelId: deal.carModelId,
      status: deal.status,
      rank: deal.rank,
      amount: deal.amount,
      nextAction: deal.nextAction,
      nextActionDate: deal.nextActionDate,
      tasks: [...deal.tasks],
      note: deal.note,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
    })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (editingItem) {
      setDeals((prev) => prev.map((d) => (d.id === editingItem.id ? {...d, ...form, updatedAt: '2026-02-22'} : d)))
    } else {
      setDeals((prev) => [...prev, {id: generateId('DEAL'), ...form} as Deal])
    }
    setModalOpen(false)
  }

  const handleDelete = () => {
    if (!editingItem) return
    setDeals((prev) => prev.filter((d) => d.id !== editingItem.id))
    setModalOpen(false)
  }

  const cycleDealStatus = (dealId: string) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== dealId) return d
        const idx = DEAL_STATUSES.indexOf(d.status)
        const nextStatus = DEAL_STATUSES[(idx + 1) % DEAL_STATUSES.length]
        return {...d, status: nextStatus}
      })
    )
  }

  const addTask = () => {
    setForm((prev) => ({
      ...prev,
      tasks: [...prev.tasks, {id: generateId('T'), title: '', dueDate: '2026-02-28', done: false}],
    }))
  }

  const removeTask = (taskId: string) => {
    setForm((prev) => ({...prev, tasks: prev.tasks.filter((t) => t.id !== taskId)}))
  }

  const updateTask = (taskId: string, updates: Partial<DealTask>) => {
    setForm((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? {...t, ...updates} : t)),
    }))
  }

  return (
    <div className="space-y-4">
      {/* 検索・フィルタ */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="顧客名・車種で検索..."
            className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="px-3 py-2 border border-stone-300 rounded-lg text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">全ステータス</option>
          {DEAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="px-3 py-2 border border-stone-300 rounded-lg text-sm" value={filterRank} onChange={(e) => setFilterRank(e.target.value)}>
          <option value="">全ランク</option>
          {(['A', 'B', 'C'] as DealRank[]).map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="px-3 py-2 border border-stone-300 rounded-lg text-sm" value={filterSP} onChange={(e) => setFilterSP(e.target.value)}>
          <option value="">全担当</option>
          {SALES_PERSONS.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
        </select>
        <button data-guidance="add-deal-button" onClick={openNew} className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
          <Plus size={14} />
          商談追加
        </button>
      </div>

      <p className="text-xs text-stone-500">{filtered.length}件の商談</p>

      {/* テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="text-left py-2 px-3 text-stone-500 font-medium">顧客</th>
              <th className="text-left py-2 px-3 text-stone-500 font-medium">車種</th>
              <th className="text-left py-2 px-3 text-stone-500 font-medium">担当</th>
              <th className="text-center py-2 px-3 text-stone-500 font-medium">ランク</th>
              <th className="text-center py-2 px-3 text-stone-500 font-medium">ステータス</th>
              <th className="text-right py-2 px-3 text-stone-500 font-medium">金額</th>
              <th className="text-left py-2 px-3 text-stone-500 font-medium">次アクション日</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((deal, idx) => (
              <tr key={deal.id} {...(idx === 0 ? {'data-guidance': 'deal-row'} : {})} className="border-b border-stone-100 hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => openEdit(deal)}>
                <td className="py-2 px-3 font-medium text-stone-800">{getCustomerName(deal.customerId, customers)}</td>
                <td className="py-2 px-3 text-stone-600">{getCarModelName(deal.carModelId)}</td>
                <td className="py-2 px-3 text-stone-600">{getSalesPersonName(deal.salesPersonId)}</td>
                <td className="py-2 px-3 text-center"><RankBadge rank={deal.rank} /></td>
                <td className="py-2 px-3 text-center"><StatusBadge status={deal.status} onClick={() => cycleDealStatus(deal.id)} /></td>
                <td className="py-2 px-3 text-right text-stone-800">{formatCurrency(deal.amount)}</td>
                <td className="py-2 px-3 text-stone-600">{deal.nextActionDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 商談モーダル */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? '商談編集' : '商談追加'} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="顧客">
              <select className={selectClass} value={form.customerId} onChange={(e) => setForm((p) => ({...p, customerId: e.target.value}))}>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="担当営業">
              <select className={selectClass} value={form.salesPersonId} onChange={(e) => setForm((p) => ({...p, salesPersonId: e.target.value}))}>
                {SALES_PERSONS.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="車種">
              <select className={selectClass} value={form.carModelId} onChange={(e) => {
                const car = CAR_MODELS.find((c) => c.id === e.target.value)
                setForm((p) => ({...p, carModelId: e.target.value, amount: car?.basePrice ?? p.amount}))
              }}>
                {CAR_MODELS.map((c) => <option key={c.id} value={c.id}>{c.name} ({formatCurrency(c.basePrice)})</option>)}
              </select>
            </FormField>
            <FormField label="金額">
              <input type="number" className={inputClass} value={form.amount} onChange={(e) => setForm((p) => ({...p, amount: Number(e.target.value)}))} />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="ステータス">
              <select className={selectClass} value={form.status} onChange={(e) => setForm((p) => ({...p, status: e.target.value as DealStatus}))}>
                {DEAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="ランク">
              <select className={selectClass} value={form.rank} onChange={(e) => setForm((p) => ({...p, rank: e.target.value as DealRank}))}>
                {(['A', 'B', 'C'] as DealRank[]).map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </FormField>
            <FormField label="次アクション日">
              <input type="date" className={inputClass} value={form.nextActionDate} onChange={(e) => setForm((p) => ({...p, nextActionDate: e.target.value}))} />
            </FormField>
          </div>
          <FormField label="次アクション内容">
            <input type="text" className={inputClass} value={form.nextAction} onChange={(e) => setForm((p) => ({...p, nextAction: e.target.value}))} />
          </FormField>
          <FormField label="備考">
            <textarea className={inputClass} rows={2} value={form.note} onChange={(e) => setForm((p) => ({...p, note: e.target.value}))} />
          </FormField>

          {/* タスクサブフォーム */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-stone-500 font-medium">タスク</label>
              <button onClick={addTask} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <Plus size={12} />タスク追加
              </button>
            </div>
            <div className="space-y-2">
              {form.tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2 bg-stone-50 rounded-lg p-2">
                  <button onClick={() => updateTask(task.id, {done: !task.done})} className="shrink-0">
                    {task.done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-stone-300" />}
                  </button>
                  <input
                    type="text"
                    className="flex-1 px-2 py-1 border border-stone-200 rounded text-sm"
                    placeholder="タスク内容"
                    value={task.title}
                    onChange={(e) => updateTask(task.id, {title: e.target.value})}
                  />
                  <input
                    type="date"
                    className="px-2 py-1 border border-stone-200 rounded text-sm"
                    value={task.dueDate}
                    onChange={(e) => updateTask(task.id, {dueDate: e.target.value})}
                  />
                  <button onClick={() => removeTask(task.id)} className="text-red-400 hover:text-red-600 shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            {editingItem ? (
              <button onClick={handleDelete} className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors">
                <Trash2 size={14} />削除
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">キャンセル</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">保存</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ==========================================
// 3. 営業日報ビュー
// ==========================================

const ACTIVITY_TYPES: DailyActivity['type'][] = ['電話', '来店', '訪問', '試乗', 'メール', 'その他']

const DailyReportView = ({
  dailyReports,
  setDailyReports,
  attendance,
  setAttendance,
}: {
  dailyReports: DailyReport[]
  setDailyReports: React.Dispatch<React.SetStateAction<DailyReport[]>>
  attendance: AttendanceRecord[]
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-02-22')
  const [selectedSP, setSelectedSP] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DailyReport | null>(null)

  const filteredReports = dailyReports.filter((r) => {
    const matchDate = r.date === selectedDate
    const matchSP = !selectedSP || r.salesPersonId === selectedSP
    return matchDate && matchSP
  })

  const dayAttendance = attendance.filter((a) => a.date === selectedDate)

  const emptyReport: Omit<DailyReport, 'id'> = {
    salesPersonId: SALES_PERSONS[0].id,
    date: selectedDate,
    activities: [{type: '電話', customerName: '', content: ''}],
    summary: '',
    nextDayPlan: '',
  }

  const [form, setForm] = useState(emptyReport)

  const openNew = () => {
    setEditingItem(null)
    setForm({...emptyReport, date: selectedDate})
    setModalOpen(true)
  }

  const openEdit = (report: DailyReport) => {
    setEditingItem(report)
    setForm({
      salesPersonId: report.salesPersonId,
      date: report.date,
      activities: [...report.activities],
      summary: report.summary,
      nextDayPlan: report.nextDayPlan,
    })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (editingItem) {
      setDailyReports((prev) => prev.map((r) => (r.id === editingItem.id ? {...r, ...form} : r)))
    } else {
      setDailyReports((prev) => [...prev, {id: generateId('DR'), ...form} as DailyReport])
    }
    setModalOpen(false)
  }

  const handleDelete = () => {
    if (!editingItem) return
    setDailyReports((prev) => prev.filter((r) => r.id !== editingItem.id))
    setModalOpen(false)
  }

  const addActivity = () => {
    setForm((prev) => ({
      ...prev,
      activities: [...prev.activities, {type: '電話' as const, customerName: '', content: ''}],
    }))
  }

  const removeActivity = (idx: number) => {
    setForm((prev) => ({...prev, activities: prev.activities.filter((_, i) => i !== idx)}))
  }

  const updateActivity = (idx: number, updates: Partial<DailyActivity>) => {
    setForm((prev) => ({
      ...prev,
      activities: prev.activities.map((a, i) => (i === idx ? {...a, ...updates} : a)),
    }))
  }

  const updateAttendance = (spId: string, field: 'clockIn' | 'clockOut', value: string) => {
    const existing = attendance.find((a) => a.date === selectedDate && a.salesPersonId === spId)
    if (existing) {
      setAttendance((prev) => prev.map((a) => (a.id === existing.id ? {...a, [field]: value} : a)))
    } else {
      setAttendance((prev) => [
        ...prev,
        {id: generateId('ATT'), salesPersonId: spId, date: selectedDate, clockIn: field === 'clockIn' ? value : '09:00', clockOut: field === 'clockOut' ? value : '18:00', note: ''},
      ])
    }
  }

  return (
    <div className="space-y-4">
      {/* 日付・フィルタ */}
      <div className="flex flex-wrap items-center gap-3">
        <FormField label="日付">
          <input type="date" className={inputClass} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </FormField>
        <FormField label="担当">
          <select className={selectClass} value={selectedSP} onChange={(e) => setSelectedSP(e.target.value)}>
            <option value="">全員</option>
            {SALES_PERSONS.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
          </select>
        </FormField>
        <div className="pt-5">
          <button data-guidance="add-daily-button" onClick={openNew} className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
            <Plus size={14} />日報作成
          </button>
        </div>
      </div>

      {/* 勤怠 */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <h4 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          勤怠状況 ({selectedDate})
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SALES_PERSONS.map((sp) => {
            const att = dayAttendance.find((a) => a.salesPersonId === sp.id)
            return (
              <div key={sp.id} className="flex items-center gap-2 text-sm">
                <span className="text-stone-700 w-20 shrink-0">{sp.name}</span>
                <input
                  type="time"
                  className="px-2 py-1 border border-stone-200 rounded text-xs w-24"
                  value={att?.clockIn ?? ''}
                  onChange={(e) => updateAttendance(sp.id, 'clockIn', e.target.value)}
                />
                <span className="text-stone-400">~</span>
                <input
                  type="time"
                  className="px-2 py-1 border border-stone-200 rounded text-xs w-24"
                  value={att?.clockOut ?? ''}
                  onChange={(e) => updateAttendance(sp.id, 'clockOut', e.target.value)}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* 日報リスト */}
      <div className="space-y-3">
        {filteredReports.length === 0 && <p className="text-sm text-stone-400 text-center py-4">この日の日報はありません</p>}
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-all cursor-pointer" onClick={() => openEdit(report)}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-stone-800">{getSalesPersonName(report.salesPersonId)}</span>
              </div>
              <span className="text-xs text-stone-500">{report.date}</span>
            </div>
            <div className="space-y-2 mb-3">
              {report.activities.map((act, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-200">{act.type}</span>
                  <span className="text-stone-700">{act.customerName} - {act.content}</span>
                </div>
              ))}
            </div>
            <div className="text-sm text-stone-600 border-t border-stone-100 pt-2">
              <p><span className="text-stone-500">まとめ: </span>{report.summary}</p>
              <p><span className="text-stone-500">明日の予定: </span>{report.nextDayPlan}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 日報モーダル */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? '日報編集' : '日報作成'} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="担当営業">
              <select className={selectClass} value={form.salesPersonId} onChange={(e) => setForm((p) => ({...p, salesPersonId: e.target.value}))}>
                {SALES_PERSONS.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
              </select>
            </FormField>
            <FormField label="日付">
              <input type="date" className={inputClass} value={form.date} onChange={(e) => setForm((p) => ({...p, date: e.target.value}))} />
            </FormField>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-stone-500 font-medium">活動記録</label>
              <button onClick={addActivity} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <Plus size={12} />活動追加
              </button>
            </div>
            <div className="space-y-2">
              {form.activities.map((act, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-stone-50 rounded-lg p-2">
                  <select
                    className="px-2 py-1 border border-stone-200 rounded text-sm w-20"
                    value={act.type}
                    onChange={(e) => updateActivity(idx, {type: e.target.value as DailyActivity['type']})}
                  >
                    {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    type="text"
                    className="px-2 py-1 border border-stone-200 rounded text-sm w-28"
                    placeholder="顧客名"
                    value={act.customerName}
                    onChange={(e) => updateActivity(idx, {customerName: e.target.value})}
                  />
                  <input
                    type="text"
                    className="flex-1 px-2 py-1 border border-stone-200 rounded text-sm"
                    placeholder="内容"
                    value={act.content}
                    onChange={(e) => updateActivity(idx, {content: e.target.value})}
                  />
                  <button onClick={() => removeActivity(idx)} className="text-red-400 hover:text-red-600 shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <FormField label="まとめ">
            <textarea className={inputClass} rows={2} value={form.summary} onChange={(e) => setForm((p) => ({...p, summary: e.target.value}))} />
          </FormField>
          <FormField label="明日の予定">
            <textarea className={inputClass} rows={2} value={form.nextDayPlan} onChange={(e) => setForm((p) => ({...p, nextDayPlan: e.target.value}))} />
          </FormField>

          <div className="flex justify-between pt-2">
            {editingItem ? (
              <button onClick={handleDelete} className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors">
                <Trash2 size={14} />削除
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">キャンセル</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">保存</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ==========================================
// 帳票プレビュー共通スタイル
// ==========================================

const paperStyle = 'bg-white shadow-2xl mx-auto relative'
const paperWidth = 'w-[210mm] min-h-[297mm]'

// 日本語日付フォーマット（帳票用）
const formatDateJP = (dateStr: string) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${y}年${m}月${d}日`
}

// ==========================================
// 見積書プレビューコンポーネント
// ==========================================

const EstimatePreview = ({
  estimate,
  customers,
  onClose,
}: {
  estimate: Estimate
  customers: Customer[]
  onClose: () => void
}) => {
  const customer = customers.find((c) => c.id === estimate.customerId)
  const car = CAR_MODELS.find((c) => c.id === estimate.carModelId)
  const dealerName = 'オートプラザ信頼モータース'
  const dealerAddress = '〒100-0001 東京都千代田区千代田1-1-1'
  const dealerTel = 'TEL: 03-1234-5678 / FAX: 03-1234-5679'

  const handlePrint = () => {
    window.print()
  }

  const basePrice = car?.basePrice ?? 0
  const optionTotal = estimate.options.reduce((s, o) => s + o.price, 0)

  return (
    <div className="fixed inset-0 z-[60] bg-stone-100 overflow-auto">
      {/* ツールバー */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex items-center gap-1 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg text-sm transition-colors">
            <ChevronLeft size={16} />戻る
          </button>
          <h2 className="font-bold text-stone-800">見積書プレビュー</h2>
        </div>
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
          <Printer size={16} />印刷
        </button>
      </div>

      {/* A4用紙 */}
      <div className="py-8 px-4 print:p-0 print:m-0">
        <div className={`${paperStyle} ${paperWidth} p-[15mm] print:shadow-none print:w-full`}>
          {/* ヘッダー: 見積書タイトル */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-[0.3em] text-stone-800 border-b-4 border-stone-800 inline-block pb-2 px-8">
              御 見 積 書
            </h1>
          </div>

          {/* 発行情報 */}
          <div className="flex justify-between mb-8">
            {/* 宛先（左） */}
            <div className="flex-1">
              <div className="border-b-2 border-stone-800 pb-1 mb-3 inline-block">
                <p className="text-lg font-bold text-stone-800">
                  {customer?.name ?? '不明'} 様
                </p>
              </div>
              <p className="text-sm text-stone-600 mt-1">{customer?.address ?? ''}</p>
              <p className="text-sm text-stone-600">{customer?.phone ? `TEL: ${customer.phone}` : ''}</p>
            </div>

            {/* 発行元（右） */}
            <div className="text-right text-sm">
              <p className="text-stone-600">見積番号: <span className="font-mono font-bold">{estimate.id}</span></p>
              <p className="text-stone-600">発行日: {formatDateJP(estimate.createdAt)}</p>
              <p className="text-stone-600">有効期限: {formatDateJP(estimate.validUntil)}</p>
              <div className="mt-4 text-stone-700">
                <p className="font-bold text-base">{dealerName}</p>
                <p>{dealerAddress}</p>
                <p>{dealerTel}</p>
              </div>
              {/* 角印エリア */}
              <div className="mt-2 inline-block border-2 border-red-400 rounded-sm w-16 h-16 flex items-center justify-center">
                <span className="text-red-400 text-[10px] font-bold leading-tight text-center">
                  信頼<br />モータース
                </span>
              </div>
            </div>
          </div>

          {/* 合計金額 */}
          <div className="bg-stone-50 border-2 border-stone-800 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm text-stone-600 mb-1">御見積金額（税込）</p>
            <p className="text-3xl font-bold text-stone-800">
              {formatCurrency(estimate.totalWithTax)}
              <span className="text-base font-normal ml-1">（税抜 {formatCurrency(estimate.totalBeforeTax)}）</span>
            </p>
          </div>

          {/* 車両情報 */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-stone-700 bg-stone-100 px-3 py-2 border-l-4 border-stone-800 mb-0">車両情報</h3>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b border-stone-200">
                  <td className="py-2 px-3 w-32 text-stone-500 bg-stone-50 font-medium">車種名</td>
                  <td className="py-2 px-3 text-stone-800 font-medium">{car?.name ?? '不明'}</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-2 px-3 text-stone-500 bg-stone-50 font-medium">メーカー</td>
                  <td className="py-2 px-3 text-stone-800">{car?.maker ?? ''}</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-2 px-3 text-stone-500 bg-stone-50 font-medium">カテゴリ</td>
                  <td className="py-2 px-3 text-stone-800">{car?.category ?? ''}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 明細テーブル */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-stone-700 bg-stone-100 px-3 py-2 border-l-4 border-stone-800 mb-0">御見積明細</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="py-2 px-3 text-left font-medium w-12">No</th>
                  <th className="py-2 px-3 text-left font-medium">品目</th>
                  <th className="py-2 px-3 text-right font-medium w-32">数量</th>
                  <th className="py-2 px-3 text-right font-medium w-40">金額（税抜）</th>
                </tr>
              </thead>
              <tbody>
                {/* 車両本体 */}
                <tr className="border-b border-stone-200">
                  <td className="py-2 px-3 text-stone-600">1</td>
                  <td className="py-2 px-3 text-stone-800 font-medium">{car?.name ?? ''} 車両本体</td>
                  <td className="py-2 px-3 text-right text-stone-600">1</td>
                  <td className="py-2 px-3 text-right text-stone-800">{formatCurrency(basePrice)}</td>
                </tr>
                {/* オプション */}
                {estimate.options.map((opt, idx) => (
                  <tr key={opt.name} className="border-b border-stone-200">
                    <td className="py-2 px-3 text-stone-600">{idx + 2}</td>
                    <td className="py-2 px-3 text-stone-800">{opt.name}</td>
                    <td className="py-2 px-3 text-right text-stone-600">1</td>
                    <td className="py-2 px-3 text-right text-stone-800">{formatCurrency(opt.price)}</td>
                  </tr>
                ))}
                {/* 小計行 */}
                <tr className="border-b border-stone-300 bg-stone-50">
                  <td colSpan={3} className="py-2 px-3 text-right font-medium text-stone-600">小計</td>
                  <td className="py-2 px-3 text-right font-medium text-stone-800">{formatCurrency(basePrice + optionTotal)}</td>
                </tr>
                {/* 値引き */}
                {estimate.discount > 0 && (
                  <tr className="border-b border-stone-300 bg-stone-50">
                    <td colSpan={3} className="py-2 px-3 text-right font-medium text-red-600">値引き</td>
                    <td className="py-2 px-3 text-right font-medium text-red-600">-{formatCurrency(estimate.discount)}</td>
                  </tr>
                )}
                {/* 税抜合計 */}
                <tr className="border-b border-stone-300 bg-stone-50">
                  <td colSpan={3} className="py-2 px-3 text-right font-medium text-stone-700">税抜合計</td>
                  <td className="py-2 px-3 text-right font-bold text-stone-800">{formatCurrency(estimate.totalBeforeTax)}</td>
                </tr>
                {/* 消費税 */}
                <tr className="border-b border-stone-300 bg-stone-50">
                  <td colSpan={3} className="py-2 px-3 text-right font-medium text-stone-600">消費税（{Math.round(estimate.taxRate * 100)}%）</td>
                  <td className="py-2 px-3 text-right text-stone-800">{formatCurrency(estimate.totalWithTax - estimate.totalBeforeTax)}</td>
                </tr>
                {/* 税込合計 */}
                <tr className="bg-stone-100">
                  <td colSpan={3} className="py-3 px-3 text-right font-bold text-stone-800 text-base">税込合計</td>
                  <td className="py-3 px-3 text-right font-bold text-stone-800 text-lg">{formatCurrency(estimate.totalWithTax)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 備考欄 */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-stone-700 bg-stone-100 px-3 py-2 border-l-4 border-stone-800 mb-0">備考</h3>
            <div className="border border-stone-200 p-3 min-h-[60px] text-sm text-stone-600">
              <p>・本見積書の有効期限は発行日より14日間です。</p>
              <p>・車両の在庫状況により納期が変動する場合がございます。</p>
              <p>・下取車がある場合は別途査定の上、お見積りいたします。</p>
            </div>
          </div>

          {/* フッター */}
          <div className="text-center text-xs text-stone-400 mt-auto pt-4 border-t border-stone-200">
            <p>このお見積書は{dealerName}が発行いたしました。ご不明点はお気軽にお問い合わせください。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 請求書プレビューコンポーネント
// ==========================================

const InvoicePreview = ({
  invoice,
  estimate,
  customers,
  onClose,
}: {
  invoice: Invoice
  estimate: Estimate | undefined
  customers: Customer[]
  onClose: () => void
}) => {
  const customer = customers.find((c) => c.id === invoice.customerId)
  const car = estimate ? CAR_MODELS.find((c) => c.id === estimate.carModelId) : undefined
  const dealerName = 'オートプラザ信頼モータース'
  const dealerAddress = '〒100-0001 東京都千代田区千代田1-1-1'
  const dealerTel = 'TEL: 03-1234-5678 / FAX: 03-1234-5679'
  const dealerBank = '三菱UFJ銀行 千代田支店 普通 1234567'

  const handlePrint = () => {
    window.print()
  }

  const taxRate = estimate?.taxRate ?? 0.1
  const amountBeforeTax = Math.round(invoice.amount / (1 + taxRate))
  const taxAmount = invoice.amount - amountBeforeTax

  return (
    <div className="fixed inset-0 z-[60] bg-stone-100 overflow-auto">
      {/* ツールバー */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex items-center gap-1 px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-lg text-sm transition-colors">
            <ChevronLeft size={16} />戻る
          </button>
          <h2 className="font-bold text-stone-800">請求書プレビュー</h2>
          <StatusBadge status={invoice.status} />
        </div>
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
          <Printer size={16} />印刷
        </button>
      </div>

      {/* A4用紙 */}
      <div className="py-8 px-4 print:p-0 print:m-0">
        <div className={`${paperStyle} ${paperWidth} p-[15mm] print:shadow-none print:w-full`}>
          {/* ヘッダー: 請求書タイトル */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-[0.3em] text-stone-800 border-b-4 border-stone-800 inline-block pb-2 px-8">
              請 求 書
            </h1>
          </div>

          {/* 発行情報 */}
          <div className="flex justify-between mb-8">
            {/* 宛先（左） */}
            <div className="flex-1">
              <div className="border-b-2 border-stone-800 pb-1 mb-3 inline-block">
                <p className="text-lg font-bold text-stone-800">
                  {customer?.name ?? '不明'} 様
                </p>
              </div>
              <p className="text-sm text-stone-600 mt-1">{customer?.address ?? ''}</p>
              <p className="text-sm text-stone-600">{customer?.phone ? `TEL: ${customer.phone}` : ''}</p>
            </div>

            {/* 発行元（右） */}
            <div className="text-right text-sm">
              <p className="text-stone-600">請求番号: <span className="font-mono font-bold">{invoice.id}</span></p>
              <p className="text-stone-600">発行日: {formatDateJP(invoice.issuedAt)}</p>
              <p className="text-stone-600">お支払期限: <span className="font-bold text-red-600">{formatDateJP(invoice.dueDate)}</span></p>
              <div className="mt-4 text-stone-700">
                <p className="font-bold text-base">{dealerName}</p>
                <p>{dealerAddress}</p>
                <p>{dealerTel}</p>
              </div>
              {/* 角印 */}
              <div className="mt-2 inline-block border-2 border-red-400 rounded-sm w-16 h-16 flex items-center justify-center">
                <span className="text-red-400 text-[10px] font-bold leading-tight text-center">
                  信頼<br />モータース
                </span>
              </div>
            </div>
          </div>

          {/* 請求金額 */}
          <div className="bg-stone-50 border-2 border-stone-800 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm text-stone-600 mb-1">ご請求金額（税込）</p>
            <p className="text-3xl font-bold text-stone-800">
              {formatCurrency(invoice.amount)}
            </p>
          </div>

          {/* ステータス表示 */}
          {invoice.status === '入金済' && invoice.paidAt && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
              <p className="text-emerald-700 font-bold text-sm">入金確認済み（{formatDateJP(invoice.paidAt)}）</p>
            </div>
          )}

          {/* 明細テーブル */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-stone-700 bg-stone-100 px-3 py-2 border-l-4 border-stone-800 mb-0">ご請求明細</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="py-2 px-3 text-left font-medium w-12">No</th>
                  <th className="py-2 px-3 text-left font-medium">品目</th>
                  <th className="py-2 px-3 text-right font-medium w-32">数量</th>
                  <th className="py-2 px-3 text-right font-medium w-40">金額（税抜）</th>
                </tr>
              </thead>
              <tbody>
                {estimate ? (
                  <>
                    {/* 車両本体 */}
                    <tr className="border-b border-stone-200">
                      <td className="py-2 px-3 text-stone-600">1</td>
                      <td className="py-2 px-3 text-stone-800 font-medium">{car?.name ?? ''} 車両本体</td>
                      <td className="py-2 px-3 text-right text-stone-600">1</td>
                      <td className="py-2 px-3 text-right text-stone-800">{formatCurrency(car?.basePrice ?? 0)}</td>
                    </tr>
                    {/* オプション */}
                    {estimate.options.map((opt, idx) => (
                      <tr key={opt.name} className="border-b border-stone-200">
                        <td className="py-2 px-3 text-stone-600">{idx + 2}</td>
                        <td className="py-2 px-3 text-stone-800">{opt.name}</td>
                        <td className="py-2 px-3 text-right text-stone-600">1</td>
                        <td className="py-2 px-3 text-right text-stone-800">{formatCurrency(opt.price)}</td>
                      </tr>
                    ))}
                    {/* 値引き */}
                    {estimate.discount > 0 && (
                      <tr className="border-b border-stone-300 bg-stone-50">
                        <td colSpan={3} className="py-2 px-3 text-right font-medium text-red-600">値引き</td>
                        <td className="py-2 px-3 text-right font-medium text-red-600">-{formatCurrency(estimate.discount)}</td>
                      </tr>
                    )}
                  </>
                ) : (
                  <tr className="border-b border-stone-200">
                    <td className="py-2 px-3 text-stone-600">1</td>
                    <td className="py-2 px-3 text-stone-800 font-medium">車両代金一式</td>
                    <td className="py-2 px-3 text-right text-stone-600">1</td>
                    <td className="py-2 px-3 text-right text-stone-800">{formatCurrency(amountBeforeTax)}</td>
                  </tr>
                )}
                {/* 税抜合計 */}
                <tr className="border-b border-stone-300 bg-stone-50">
                  <td colSpan={3} className="py-2 px-3 text-right font-medium text-stone-700">税抜合計</td>
                  <td className="py-2 px-3 text-right font-bold text-stone-800">{formatCurrency(amountBeforeTax)}</td>
                </tr>
                {/* 消費税 */}
                <tr className="border-b border-stone-300 bg-stone-50">
                  <td colSpan={3} className="py-2 px-3 text-right font-medium text-stone-600">消費税（{Math.round(taxRate * 100)}%）</td>
                  <td className="py-2 px-3 text-right text-stone-800">{formatCurrency(taxAmount)}</td>
                </tr>
                {/* 税込合計 */}
                <tr className="bg-stone-100">
                  <td colSpan={3} className="py-3 px-3 text-right font-bold text-stone-800 text-base">ご請求金額（税込）</td>
                  <td className="py-3 px-3 text-right font-bold text-stone-800 text-lg">{formatCurrency(invoice.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 振込先情報 */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-stone-700 bg-stone-100 px-3 py-2 border-l-4 border-stone-800 mb-0">お振込先</h3>
            <div className="border border-stone-200 p-4 text-sm">
              <table className="text-stone-700">
                <tbody>
                  <tr>
                    <td className="pr-4 py-1 text-stone-500 font-medium">金融機関</td>
                    <td className="py-1">{dealerBank}</td>
                  </tr>
                  <tr>
                    <td className="pr-4 py-1 text-stone-500 font-medium">口座名義</td>
                    <td className="py-1">オートプラザシンライモータース（カ</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-stone-500 mt-2">※ 恐れ入りますが、振込手数料はお客様のご負担にてお願い申し上げます。</p>
            </div>
          </div>

          {/* 備考欄 */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-stone-700 bg-stone-100 px-3 py-2 border-l-4 border-stone-800 mb-0">備考</h3>
            <div className="border border-stone-200 p-3 min-h-[40px] text-sm text-stone-600">
              <p>・お支払期限までにお振込みをお願いいたします。</p>
              <p>・ご不明な点がございましたら担当営業までお問い合わせください。</p>
            </div>
          </div>

          {/* フッター */}
          <div className="text-center text-xs text-stone-400 mt-auto pt-4 border-t border-stone-200">
            <p>この請求書は{dealerName}が発行いたしました。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 4. 見積・請求ビュー
// ==========================================

const EstimatesView = ({
  estimates,
  setEstimates,
  invoices,
  setInvoices,
  deals,
  customers,
}: {
  estimates: Estimate[]
  setEstimates: React.Dispatch<React.SetStateAction<Estimate[]>>
  invoices: Invoice[]
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>
  deals: Deal[]
  customers: Customer[]
}) => {
  const [subTab, setSubTab] = useState<'estimates' | 'invoices'>('estimates')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Estimate | null>(null)
  const [previewEstimate, setPreviewEstimate] = useState<Estimate | null>(null)
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)

  const emptyEstimate: Omit<Estimate, 'id'> = {
    dealId: deals[0]?.id ?? '',
    customerId: deals[0]?.customerId ?? '',
    carModelId: deals[0]?.carModelId ?? '',
    options: [],
    discount: 0,
    taxRate: 0.1,
    totalBeforeTax: 0,
    totalWithTax: 0,
    createdAt: '2026-02-22',
    validUntil: '2026-03-08',
  }

  const [form, setForm] = useState(emptyEstimate)

  const calcTotals = (carModelId: string, options: EstimateOption[], discount: number, taxRate: number) => {
    const car = CAR_MODELS.find((c) => c.id === carModelId)
    const base = car?.basePrice ?? 0
    const optTotal = options.reduce((s, o) => s + o.price, 0)
    const totalBeforeTax = base + optTotal - discount
    const totalWithTax = Math.round(totalBeforeTax * (1 + taxRate))
    return {totalBeforeTax, totalWithTax}
  }

  const openNew = () => {
    setEditingItem(null)
    const deal = deals[0]
    if (deal) {
      const totals = calcTotals(deal.carModelId, [], 0, 0.1)
      setForm({...emptyEstimate, dealId: deal.id, customerId: deal.customerId, carModelId: deal.carModelId, ...totals})
    } else {
      setForm(emptyEstimate)
    }
    setModalOpen(true)
  }

  const openEdit = (est: Estimate) => {
    setEditingItem(est)
    setForm({
      dealId: est.dealId,
      customerId: est.customerId,
      carModelId: est.carModelId,
      options: [...est.options],
      discount: est.discount,
      taxRate: est.taxRate,
      totalBeforeTax: est.totalBeforeTax,
      totalWithTax: est.totalWithTax,
      createdAt: est.createdAt,
      validUntil: est.validUntil,
    })
    setModalOpen(true)
  }

  const handleDealChange = (dealId: string) => {
    const deal = deals.find((d) => d.id === dealId)
    if (deal) {
      const totals = calcTotals(deal.carModelId, form.options, form.discount, form.taxRate)
      setForm((p) => ({...p, dealId, customerId: deal.customerId, carModelId: deal.carModelId, ...totals}))
    }
  }

  const toggleOption = (opt: EstimateOption) => {
    setForm((prev) => {
      const exists = prev.options.some((o) => o.name === opt.name)
      const newOptions = exists ? prev.options.filter((o) => o.name !== opt.name) : [...prev.options, opt]
      const totals = calcTotals(prev.carModelId, newOptions, prev.discount, prev.taxRate)
      return {...prev, options: newOptions, ...totals}
    })
  }

  const handleDiscountChange = (discount: number) => {
    setForm((prev) => {
      const totals = calcTotals(prev.carModelId, prev.options, discount, prev.taxRate)
      return {...prev, discount, ...totals}
    })
  }

  const handleSave = () => {
    if (editingItem) {
      setEstimates((prev) => prev.map((e) => (e.id === editingItem.id ? {...e, ...form} : e)))
    } else {
      setEstimates((prev) => [...prev, {id: generateId('EST'), ...form} as Estimate])
    }
    setModalOpen(false)
  }

  const handleDelete = () => {
    if (!editingItem) return
    setEstimates((prev) => prev.filter((e) => e.id !== editingItem.id))
    setModalOpen(false)
  }

  const cycleInvoiceStatus = (invId: string) => {
    const cycle: Record<string, Invoice['status']> = {'未請求': '請求済', '請求済': '入金済', '入金済': '未請求'}
    setInvoices((prev) => prev.map((inv) => {
      if (inv.id !== invId) return inv
      const newStatus = cycle[inv.status] ?? '未請求'
      return {...inv, status: newStatus, paidAt: newStatus === '入金済' ? '2026-02-22' : null}
    }))
  }

  return (
    <div className="space-y-4">
      {/* サブタブ */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        {[
          {id: 'estimates' as const, label: '見積一覧', icon: FileText},
          {id: 'invoices' as const, label: '請求一覧', icon: FileText},
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              subTab === tab.id ? 'bg-blue-500 text-white' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
        {subTab === 'estimates' && (
          <button data-guidance="add-estimate-button" onClick={openNew} className="ml-auto flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
            <Plus size={14} />見積作成
          </button>
        )}
      </div>

      {subTab === 'estimates' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-2 px-3 text-stone-500 font-medium">見積No</th>
                <th className="text-left py-2 px-3 text-stone-500 font-medium">顧客</th>
                <th className="text-left py-2 px-3 text-stone-500 font-medium">車種</th>
                <th className="text-center py-2 px-3 text-stone-500 font-medium">オプション数</th>
                <th className="text-right py-2 px-3 text-stone-500 font-medium">値引</th>
                <th className="text-right py-2 px-3 text-stone-500 font-medium">税込合計</th>
                <th className="text-left py-2 px-3 text-stone-500 font-medium">作成日</th>
                <th className="text-center py-2 px-3 text-stone-500 font-medium w-20">帳票</th>
              </tr>
            </thead>
            <tbody>
              {estimates.slice(0, 50).map((est) => (
                <tr key={est.id} className="border-b border-stone-100 hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => openEdit(est)}>
                  <td className="py-2 px-3 font-mono text-stone-600">{est.id}</td>
                  <td className="py-2 px-3 text-stone-800">{getCustomerName(est.customerId, customers)}</td>
                  <td className="py-2 px-3 text-stone-600">{getCarModelName(est.carModelId)}</td>
                  <td className="py-2 px-3 text-center text-stone-600">{est.options.length}</td>
                  <td className="py-2 px-3 text-right text-red-600">{est.discount > 0 ? `-${formatCurrency(est.discount)}` : '-'}</td>
                  <td className="py-2 px-3 text-right font-bold text-stone-800">{formatCurrency(est.totalWithTax)}</td>
                  <td className="py-2 px-3 text-stone-600">{est.createdAt}</td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewEstimate(est) }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition-colors"
                      title="見積書を閲覧"
                    >
                      <Eye size={13} />閲覧
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'invoices' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-2 px-3 text-stone-500 font-medium">請求No</th>
                <th className="text-left py-2 px-3 text-stone-500 font-medium">顧客</th>
                <th className="text-right py-2 px-3 text-stone-500 font-medium">金額</th>
                <th className="text-center py-2 px-3 text-stone-500 font-medium">ステータス</th>
                <th className="text-left py-2 px-3 text-stone-500 font-medium">発行日</th>
                <th className="text-left py-2 px-3 text-stone-500 font-medium">期限</th>
                <th className="text-left py-2 px-3 text-stone-500 font-medium">入金日</th>
                <th className="text-center py-2 px-3 text-stone-500 font-medium w-20">帳票</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 50).map((inv) => (
                <tr key={inv.id} className="border-b border-stone-100 hover:bg-blue-50/50 transition-colors">
                  <td className="py-2 px-3 font-mono text-stone-600">{inv.id}</td>
                  <td className="py-2 px-3 text-stone-800">{getCustomerName(inv.customerId, customers)}</td>
                  <td className="py-2 px-3 text-right font-bold text-stone-800">{formatCurrency(inv.amount)}</td>
                  <td className="py-2 px-3 text-center"><StatusBadge status={inv.status} onClick={() => cycleInvoiceStatus(inv.id)} /></td>
                  <td className="py-2 px-3 text-stone-600">{inv.issuedAt}</td>
                  <td className="py-2 px-3 text-stone-600">{inv.dueDate}</td>
                  <td className="py-2 px-3 text-stone-600">{inv.paidAt ?? '-'}</td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => setPreviewInvoice(inv)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition-colors"
                      title="請求書を閲覧"
                    >
                      <Eye size={13} />閲覧
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 見積モーダル */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? '見積編集' : '見積作成'} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <FormField label="商談">
            <select className={selectClass} value={form.dealId} onChange={(e) => handleDealChange(e.target.value)}>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.id} - {getCustomerName(d.customerId, customers)} / {getCarModelName(d.carModelId)}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm">
              <span className="text-stone-500">顧客: </span>
              <span className="font-medium text-stone-800">{getCustomerName(form.customerId, customers)}</span>
            </div>
            <div className="text-sm">
              <span className="text-stone-500">車種: </span>
              <span className="font-medium text-stone-800">{getCarModelName(form.carModelId)}</span>
              <span className="text-stone-500 ml-1">({formatCurrency(CAR_MODELS.find((c) => c.id === form.carModelId)?.basePrice ?? 0)})</span>
            </div>
          </div>

          {/* オプション選択 */}
          <div>
            <label className="text-xs text-stone-500 block mb-2">オプション選択</label>
            <div className="grid grid-cols-2 gap-2">
              {OPTION_CATALOG.map((opt) => {
                const isSelected = form.options.some((o) => o.name === opt.name)
                return (
                  <button
                    key={opt.name}
                    onClick={() => toggleOption(opt)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-stone-200 text-stone-600 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      <span>{opt.name}</span>
                    </div>
                    <span className="text-xs">{formatCurrency(opt.price)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <FormField label="値引き額">
            <input type="number" className={inputClass} value={form.discount} onChange={(e) => handleDiscountChange(Number(e.target.value))} />
          </FormField>

          <div className="bg-stone-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">車両本体</span>
              <span>{formatCurrency(CAR_MODELS.find((c) => c.id === form.carModelId)?.basePrice ?? 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">オプション合計</span>
              <span>{formatCurrency(form.options.reduce((s, o) => s + o.price, 0))}</span>
            </div>
            {form.discount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>値引き</span>
                <span>-{formatCurrency(form.discount)}</span>
              </div>
            )}
            <div className="border-t border-stone-200 pt-2 flex justify-between text-sm">
              <span className="text-stone-500">税抜合計</span>
              <span className="font-medium">{formatCurrency(form.totalBeforeTax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>税込合計</span>
              <span className="text-blue-600">{formatCurrency(form.totalWithTax)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="作成日">
              <input type="date" className={inputClass} value={form.createdAt} onChange={(e) => setForm((p) => ({...p, createdAt: e.target.value}))} />
            </FormField>
            <FormField label="有効期限">
              <input type="date" className={inputClass} value={form.validUntil} onChange={(e) => setForm((p) => ({...p, validUntil: e.target.value}))} />
            </FormField>
          </div>

          <div className="flex justify-between pt-2">
            {editingItem ? (
              <div className="flex items-center gap-2">
                <button onClick={handleDelete} className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors">
                  <Trash2 size={14} />削除
                </button>
                <button
                  onClick={() => { setModalOpen(false); setPreviewEstimate(editingItem) }}
                  className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm transition-colors"
                >
                  <Eye size={14} />見積書を閲覧
                </button>
              </div>
            ) : <div />}
            <div className="flex gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">キャンセル</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">保存</button>
            </div>
          </div>
        </div>
      </Modal>

      {/* 見積書プレビュー */}
      {previewEstimate && (
        <EstimatePreview
          estimate={previewEstimate}
          customers={customers}
          onClose={() => setPreviewEstimate(null)}
        />
      )}

      {/* 請求書プレビュー */}
      {previewInvoice && (
        <InvoicePreview
          invoice={previewInvoice}
          estimate={estimates.find((e) => e.id === previewInvoice.estimateId)}
          customers={customers}
          onClose={() => setPreviewInvoice(null)}
        />
      )}
    </div>
  )
}

// ==========================================
// 5. カレンダー（商談 + 納車統合）ビュー
// ==========================================

const DELIVERY_STATUSES: DeliveryStatus[] = ['受注', '車両手配中', '登録手続中', '納車整備中', '納車準備完了', '納車済']

type CalendarCategory = 'deals' | 'delivery'

const CalendarView = ({
  deals,
  deliveries,
  setDeliveries,
  customers,
}: {
  deals: Deal[]
  deliveries: DeliverySchedule[]
  setDeliveries: React.Dispatch<React.SetStateAction<DeliverySchedule[]>>
  customers: Customer[]
}) => {
  const [currentYear, setCurrentYear] = useState(2026)
  const [currentMonth, setCurrentMonth] = useState(2)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showCategories, setShowCategories] = useState<Record<CalendarCategory, boolean>>({deals: true, delivery: true})

  // 納車CRUD用ステート
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false)
  const [editingDelivery, setEditingDelivery] = useState<DeliverySchedule | null>(null)

  const emptyDelivery: Omit<DeliverySchedule, 'id'> = {
    dealId: '',
    customerId: customers[0]?.id ?? '',
    carModelId: CAR_MODELS[0].id,
    salesPersonId: SALES_PERSONS[0].id,
    status: '受注',
    scheduledDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(selectedDay ?? 15).padStart(2, '0')}`,
    documents: DELIVERY_REQUIRED_DOCS.map((name) => ({name, collected: false})),
    note: '',
  }

  const [deliveryForm, setDeliveryForm] = useState(emptyDelivery)

  const toggleCategory = (cat: CalendarCategory) => {
    setShowCategories((prev) => ({...prev, [cat]: !prev[cat]}))
  }

  const prevMonth = () => {
    if (currentMonth === 1) { setCurrentYear((y) => y - 1); setCurrentMonth(12) }
    else { setCurrentMonth((m) => m - 1) }
    setSelectedDay(null)
  }

  const nextMonth = () => {
    if (currentMonth === 12) { setCurrentYear((y) => y + 1); setCurrentMonth(1) }
    else { setCurrentMonth((m) => m + 1) }
    setSelectedDay(null)
  }

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay()
  const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

  const dayDeals = (day: number) => {
    const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`
    return deals.filter((d) => d.nextActionDate === dateStr || d.createdAt === dateStr)
  }

  const dayDeliveries = (day: number) => {
    const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`
    return deliveries.filter((d) => d.scheduledDate === dateStr)
  }

  const selectedDayDeals = selectedDay ? dayDeals(selectedDay) : []
  const selectedDayDeliveries = selectedDay ? dayDeliveries(selectedDay) : []

  // 納車CRUD
  const openNewDelivery = () => {
    setEditingDelivery(null)
    setDeliveryForm({
      ...emptyDelivery,
      scheduledDate: `${monthStr}-${String(selectedDay ?? 15).padStart(2, '0')}`,
    })
    setDeliveryModalOpen(true)
  }

  const openEditDelivery = (item: DeliverySchedule) => {
    setEditingDelivery(item)
    setDeliveryForm({
      dealId: item.dealId,
      customerId: item.customerId,
      carModelId: item.carModelId,
      salesPersonId: item.salesPersonId,
      status: item.status,
      scheduledDate: item.scheduledDate,
      documents: [...item.documents.map((d) => ({...d}))],
      note: item.note,
    })
    setDeliveryModalOpen(true)
  }

  const handleSaveDelivery = () => {
    if (editingDelivery) {
      setDeliveries((prev) => prev.map((d) => (d.id === editingDelivery.id ? {...d, ...deliveryForm} : d)))
    } else {
      setDeliveries((prev) => [...prev, {id: generateId('DEL'), ...deliveryForm} as DeliverySchedule])
    }
    setDeliveryModalOpen(false)
  }

  const handleDeleteDelivery = () => {
    if (!editingDelivery) return
    setDeliveries((prev) => prev.filter((d) => d.id !== editingDelivery.id))
    setDeliveryModalOpen(false)
  }

  const cycleDeliveryStatus = (itemId: string) => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id !== itemId) return d
        const idx = DELIVERY_STATUSES.indexOf(d.status)
        return {...d, status: DELIVERY_STATUSES[(idx + 1) % DELIVERY_STATUSES.length]}
      })
    )
  }

  const toggleDocument = (docName: string) => {
    setDeliveryForm((prev) => ({
      ...prev,
      documents: prev.documents.map((d) => (d.name === docName ? {...d, collected: !d.collected} : d)),
    }))
  }

  const DOW = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="space-y-4">
      {/* ヘッダー: 月ナビ + カテゴリフィルタ */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>
          <h3 className="font-bold text-stone-800 text-lg">{currentYear}年 {currentMonth}月</h3>
          <button onClick={nextMonth} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* カテゴリフィルタ */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showCategories.deals}
              onChange={() => toggleCategory('deals')}
              className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
            />
            <span className="flex items-center gap-1 text-sm text-stone-700">
              <Handshake size={14} className="text-amber-500" />
              商談
            </span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showCategories.delivery}
              onChange={() => toggleCategory('delivery')}
              className="w-4 h-4 rounded border-stone-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="flex items-center gap-1 text-sm text-stone-700">
              <Truck size={14} className="text-blue-500" />
              納車
            </span>
          </label>
          <button onClick={openNewDelivery} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
            <Plus size={14} />納車追加
          </button>
        </div>
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-4 text-xs text-stone-500">
        {showCategories.deals && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Aランク</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />Bランク</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-stone-300 inline-block" />Cランク</span>
          </div>
        )}
        {showCategories.delivery && (
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-400 inline-block" />納車予定
          </div>
        )}
      </div>

      {/* カレンダーグリッド */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="grid grid-cols-7">
          {DOW.map((d, i) => (
            <div key={d} className={`py-2 text-center text-xs font-medium border-b border-stone-200 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-stone-500'}`}>
              {d}
            </div>
          ))}
          {Array.from({length: firstDayOfWeek}, (_, i) => (
            <div key={`empty-${i}`} className="h-24 border-b border-r border-stone-100" />
          ))}
          {Array.from({length: daysInMonth}, (_, i) => {
            const day = i + 1
            const dd = showCategories.deals ? dayDeals(day) : []
            const dl = showCategories.delivery ? dayDeliveries(day) : []
            const isSelected = selectedDay === day
            const dow = (firstDayOfWeek + i) % 7
            const hasItems = dd.length > 0 || dl.length > 0
            return (
              <div
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`h-24 border-b border-r border-stone-100 p-1 cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50 ring-1 ring-inset ring-blue-300' : hasItems ? 'hover:bg-stone-50' : 'hover:bg-stone-50/50'
                }`}
              >
                <span className={`text-xs font-medium ${dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-stone-600'}`}>
                  {day}
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {/* 商談ドット */}
                  {dd.length > 0 && (
                    <div className="flex flex-wrap gap-0.5">
                      {dd.slice(0, 3).map((deal) => (
                        <span
                          key={deal.id}
                          className={`w-2 h-2 rounded-full ${
                            deal.rank === 'A' ? 'bg-red-400' : deal.rank === 'B' ? 'bg-amber-400' : 'bg-stone-300'
                          }`}
                          title={`商談: ${getCustomerName(deal.customerId, customers)} (${deal.rank})`}
                        />
                      ))}
                      {dd.length > 3 && <span className="text-[10px] text-stone-400">+{dd.length - 3}</span>}
                    </div>
                  )}
                  {/* 納車バッジ */}
                  {dl.length > 0 && (
                    <div className="flex flex-wrap gap-0.5">
                      {dl.slice(0, 2).map((del) => (
                        <span
                          key={del.id}
                          className="inline-flex items-center gap-0.5 px-1 py-0 rounded text-[9px] font-medium bg-blue-100 text-blue-700 leading-tight"
                          title={`納車: ${getCustomerName(del.customerId, customers)} - ${del.status}`}
                        >
                          <Truck size={8} />{getCustomerName(del.customerId, customers).slice(0, 3)}
                        </span>
                      ))}
                      {dl.length > 2 && <span className="text-[10px] text-stone-400">+{dl.length - 2}</span>}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 選択した日の詳細 */}
      {selectedDay && (
        <div className="space-y-4">
          {/* 商談リスト */}
          {showCategories.deals && (
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Handshake className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-stone-800">{currentMonth}/{selectedDay} の商談 ({selectedDayDeals.length}件)</h4>
              </div>
              {selectedDayDeals.length === 0 && <p className="text-sm text-stone-400">この日の商談はありません</p>}
              <div className="space-y-2">
                {selectedDayDeals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between text-sm p-2 bg-stone-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <RankBadge rank={deal.rank} />
                      <span className="font-medium text-stone-800">{getCustomerName(deal.customerId, customers)}</span>
                      <span className="text-stone-500">{getCarModelName(deal.carModelId)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={deal.status} />
                      <span className="text-stone-600">{getSalesPersonName(deal.salesPersonId)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 納車リスト */}
          {showCategories.delivery && (
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <h4 className="font-bold text-stone-800">{currentMonth}/{selectedDay} の納車 ({selectedDayDeliveries.length}件)</h4>
                </div>
              </div>
              {selectedDayDeliveries.length === 0 && <p className="text-sm text-stone-400">この日の納車予定はありません</p>}
              <div className="space-y-2">
                {selectedDayDeliveries.map((item) => {
                  const collectedCount = item.documents.filter((d) => d.collected).length
                  return (
                    <div key={item.id} className="flex items-center justify-between text-sm p-3 bg-blue-50/50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => openEditDelivery(item)}>
                      <div className="flex items-center gap-3">
                        <Car className="w-4 h-4 text-blue-500" />
                        <div>
                          <span className="font-medium text-stone-800">{getCustomerName(item.customerId, customers)}</span>
                          <span className="text-stone-500 ml-2">{getCarModelName(item.carModelId)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-stone-500">書類 <span className={`font-medium ${collectedCount === item.documents.length ? 'text-emerald-600' : 'text-amber-600'}`}>{collectedCount}/{item.documents.length}</span></span>
                        <StatusBadge status={item.status} onClick={() => cycleDeliveryStatus(item.id)} />
                        <span className="text-stone-600 text-xs">{getSalesPersonName(item.salesPersonId)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 納車モーダル */}
      <Modal isOpen={deliveryModalOpen} onClose={() => setDeliveryModalOpen(false)} title={editingDelivery ? '納車編集' : '納車追加'} maxWidth="max-w-lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="顧客">
              <select className={selectClass} value={deliveryForm.customerId} onChange={(e) => setDeliveryForm((p) => ({...p, customerId: e.target.value}))}>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="車種">
              <select className={selectClass} value={deliveryForm.carModelId} onChange={(e) => setDeliveryForm((p) => ({...p, carModelId: e.target.value}))}>
                {CAR_MODELS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="担当営業">
              <select className={selectClass} value={deliveryForm.salesPersonId} onChange={(e) => setDeliveryForm((p) => ({...p, salesPersonId: e.target.value}))}>
                {SALES_PERSONS.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
              </select>
            </FormField>
            <FormField label="納車予定日">
              <input type="date" className={inputClass} value={deliveryForm.scheduledDate} onChange={(e) => setDeliveryForm((p) => ({...p, scheduledDate: e.target.value}))} />
            </FormField>
          </div>
          <FormField label="ステータス">
            <select className={selectClass} value={deliveryForm.status} onChange={(e) => setDeliveryForm((p) => ({...p, status: e.target.value as DeliveryStatus}))}>
              {DELIVERY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>

          {/* 書類チェックリスト */}
          <div>
            <label className="text-xs text-stone-500 block mb-2">必要書類</label>
            <div className="space-y-1">
              {deliveryForm.documents.map((doc) => (
                <button
                  key={doc.name}
                  onClick={() => toggleDocument(doc.name)}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm border transition-colors ${
                    doc.collected ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-stone-200 text-stone-600 hover:border-blue-200'
                  }`}
                >
                  {doc.collected ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  <span>{doc.name}</span>
                </button>
              ))}
            </div>
          </div>

          <FormField label="備考">
            <textarea className={inputClass} rows={2} value={deliveryForm.note} onChange={(e) => setDeliveryForm((p) => ({...p, note: e.target.value}))} />
          </FormField>

          <div className="flex justify-between pt-2">
            {editingDelivery ? (
              <button onClick={handleDeleteDelivery} className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors">
                <Trash2 size={14} />削除
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button onClick={() => setDeliveryModalOpen(false)} className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">キャンセル</button>
              <button onClick={handleSaveDelivery} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">保存</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ==========================================
// 6. 売上分析ビュー
// ==========================================

const AnalyticsView = ({
  deals,
  customers,
  lastYearSales,
}: {
  deals: Deal[]
  customers: Customer[]
  lastYearSales: MonthlySales[]
}) => {
  // 当年月次集計
  const thisYearSales: MonthlySales[] = Array.from({length: 12}, (_, i) => {
    const month = i + 1
    const monthStr = `2026-${String(month).padStart(2, '0')}`
    const monthDeals = deals.filter((d) => d.status === '成約' && d.createdAt.startsWith(monthStr))
    return {
      month: monthStr,
      amount: monthDeals.reduce((s, d) => s + d.amount, 0),
      count: monthDeals.length,
    }
  })

  const maxAmount = Math.max(...thisYearSales.map((s) => s.amount), ...lastYearSales.map((s) => s.amount), 1)

  // 営業マン別実績
  const spPerformance = SALES_PERSONS.map((sp) => {
    const spDeals = deals.filter((d) => d.salesPersonId === sp.id && d.status === '成約')
    return {
      sp,
      count: spDeals.length,
      amount: spDeals.reduce((s, d) => s + d.amount, 0),
    }
  }).sort((a, b) => b.amount - a.amount)

  return (
    <div className="space-y-6">
      {/* 月次売上棒グラフ（2025年 vs 2026年） */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h3 className="font-bold text-stone-800 mb-2 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          月次売上推移
        </h3>
        {/* 凡例 */}
        <div className="flex items-center gap-4 mb-4 text-xs text-stone-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-stone-300 inline-block" />2025年</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gradient-to-t from-sky-400 to-blue-500 inline-block" />2026年</span>
        </div>
        {/* Y軸目盛り + グラフエリア */}
        <div className="flex">
          {/* Y軸ラベル */}
          <div className="flex flex-col justify-between h-56 pr-2 text-[10px] text-stone-400 text-right w-12 shrink-0">
            <span>{Math.round(maxAmount / 10000)}万</span>
            <span>{Math.round(maxAmount / 10000 * 0.75)}万</span>
            <span>{Math.round(maxAmount / 10000 * 0.5)}万</span>
            <span>{Math.round(maxAmount / 10000 * 0.25)}万</span>
            <span>0</span>
          </div>
          {/* グラフ本体 */}
          <div className="flex-1 relative">
            {/* 横グリッド線 */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="border-b border-stone-100 w-full" />
              ))}
            </div>
            {/* 棒グラフ */}
            <div className="relative flex items-end gap-1 h-56">
              {thisYearSales.map((s, i) => {
                const lastYear = lastYearSales[i]
                const thisHeight = maxAmount > 0 ? (s.amount / maxAmount) * 100 : 0
                const lastHeight = maxAmount > 0 && lastYear ? (lastYear.amount / maxAmount) * 100 : 0
                return (
                  <div key={s.month} className="flex-1 flex items-end justify-center gap-px h-full group relative">
                    {/* 2025年の棒 */}
                    <div
                      className="w-[40%] bg-stone-300 rounded-t transition-all duration-500 ease-out"
                      style={{height: `${Math.max(lastHeight, 0)}%`, minHeight: lastYear && lastYear.amount > 0 ? '2px' : '0px'}}
                    />
                    {/* 2026年の棒 */}
                    <div
                      className="w-[40%] bg-gradient-to-t from-sky-400 to-blue-500 rounded-t transition-all duration-500 ease-out"
                      style={{height: `${Math.max(thisHeight, 0)}%`, minHeight: s.amount > 0 ? '2px' : '0px'}}
                    />
                    {/* ツールチップ */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap pointer-events-none z-10">
                      <p>2025: {formatCurrency(lastYear?.amount ?? 0)}</p>
                      <p>2026: {formatCurrency(s.amount)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            {/* X軸ラベル */}
            <div className="flex gap-1 mt-1">
              {thisYearSales.map((_, i) => (
                <div key={i} className="flex-1 text-center text-[10px] text-stone-500">{i + 1}月</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 前年同月比テーブル */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          前年同月比較
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-2 px-3 text-stone-500 font-medium">月</th>
                <th className="text-right py-2 px-3 text-stone-500 font-medium">2025年</th>
                <th className="text-right py-2 px-3 text-stone-500 font-medium">2026年</th>
                <th className="text-right py-2 px-3 text-stone-500 font-medium">前年比</th>
              </tr>
            </thead>
            <tbody>
              {thisYearSales.map((s, i) => {
                const lastYear = lastYearSales[i]
                const ratio = lastYear && lastYear.amount > 0 ? Math.round((s.amount / lastYear.amount) * 100) : 0
                return (
                  <tr key={s.month} className="border-b border-stone-100">
                    <td className="py-2 px-3 text-stone-600">{i + 1}月</td>
                    <td className="py-2 px-3 text-right text-stone-600">{formatCurrency(lastYear?.amount ?? 0)}</td>
                    <td className="py-2 px-3 text-right font-medium text-stone-800">{formatCurrency(s.amount)}</td>
                    <td className="py-2 px-3 text-right">
                      {ratio > 0 ? (
                        <span className={`flex items-center justify-end gap-1 ${ratio >= 100 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {ratio >= 100 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {ratio}%
                        </span>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 営業マンランキング */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          営業マン別実績（年間）
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="text-left py-2 px-3 text-stone-500 font-medium">順位</th>
              <th className="text-left py-2 px-3 text-stone-500 font-medium">氏名</th>
              <th className="text-left py-2 px-3 text-stone-500 font-medium">チーム</th>
              <th className="text-right py-2 px-3 text-stone-500 font-medium">成約件数</th>
              <th className="text-right py-2 px-3 text-stone-500 font-medium">成約金額</th>
            </tr>
          </thead>
          <tbody>
            {spPerformance.map((item, idx) => (
              <tr key={item.sp.id} className="border-b border-stone-100">
                <td className="py-2 px-3">
                  <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-bold ${
                    idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-stone-100 text-stone-600' : idx === 2 ? 'bg-orange-50 text-orange-600' : 'text-stone-500'
                  }`}>
                    {idx + 1}
                  </span>
                </td>
                <td className="py-2 px-3 font-medium text-stone-800">{item.sp.name}</td>
                <td className="py-2 px-3 text-stone-600">チーム{item.sp.team}</td>
                <td className="py-2 px-3 text-right text-stone-800">{item.count}件</td>
                <td className="py-2 px-3 text-right font-bold text-stone-800">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==========================================
// メインコンポーネント
// ==========================================

export default function SalesAutoMockPage() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [showSplash, setShowSplash] = useState(true)
  const [showInfoSidebar, setShowInfoSidebar] = useState(false)
  const [showGuidance, setShowGuidance] = useState(false)

  const [customers, setCustomers] = usePersistedState<Customer[]>(STORAGE_KEYS.customers, INITIAL_DATA.customers)
  const [deals, setDeals] = usePersistedState<Deal[]>(STORAGE_KEYS.deals, INITIAL_DATA.deals)
  const [estimates, setEstimates] = usePersistedState<Estimate[]>(STORAGE_KEYS.estimates, INITIAL_DATA.estimates)
  const [invoices, setInvoices] = usePersistedState<Invoice[]>(STORAGE_KEYS.invoices, INITIAL_DATA.invoices)
  const [deliveries, setDeliveries] = usePersistedState<DeliverySchedule[]>(STORAGE_KEYS.deliveries, INITIAL_DATA.deliveries)
  const [dailyReports, setDailyReports] = usePersistedState<DailyReport[]>(STORAGE_KEYS.dailyReports, INITIAL_DATA.dailyReports)
  const [attendance, setAttendance] = usePersistedState<AttendanceRecord[]>('mock-sales-auto-attendance', INITIAL_DATA.attendance)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleReset = useCallback(() => {
    resetPersistedData(STORAGE_KEYS)
  }, [])

  if (showSplash) {
    return <SplashScreen theme="blue" systemName="自動車ディーラー営業管理システム" subtitle="Auto Dealer Sales Management" />
  }

  const TAB_VIEWS: Record<TabId, React.ReactNode> = {
    dashboard: <DashboardView deals={deals} customers={customers} />,
    deals: <DealsView deals={deals} setDeals={setDeals} customers={customers} />,
    daily: <DailyReportView dailyReports={dailyReports} setDailyReports={setDailyReports} attendance={attendance} setAttendance={setAttendance} />,
    estimates: <EstimatesView estimates={estimates} setEstimates={setEstimates} invoices={invoices} setInvoices={setInvoices} deals={deals} customers={customers} />,
    calendar: <CalendarView deals={deals} deliveries={deliveries} setDeliveries={setDeliveries} customers={customers} />,
    analytics: <AnalyticsView deals={deals} customers={customers} lastYearSales={INITIAL_DATA.lastYearSales} />,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-sky-50/30 font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
              <Car className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-600">
                自動車ディーラー営業管理
              </h1>
              <p className="text-xs text-stone-400 -mt-0.5">Auto Dealer Sales Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GuidanceStartButton onClick={() => setShowGuidance(true)} theme="blue" />
            <button
              onClick={handleReset}
              className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="データ初期化"
            >
              <RotateCcw size={16} />
            </button>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                data-guidance={`${tab.id}-tab`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-stone-600 hover:bg-stone-50 border border-transparent hover:border-blue-200'
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
            <button
              data-guidance="info-button"
              onClick={() => setShowInfoSidebar(true)}
              className="ml-2 p-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center gap-2"
              title="このシステムでできること"
            >
              <PanelRightOpen className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">機能説明</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {TAB_VIEWS[activeTab]}
      </main>

      <InfoSidebar
        isOpen={showInfoSidebar}
        onClose={() => setShowInfoSidebar(false)}
        theme="blue"
        systemIcon={Car}
        systemName="自動車ディーラー営業管理システム"
        systemDescription="自動車ディーラーの営業活動を一元管理するシステムです。商談・見積・納車・売上分析の全工程をデジタル管理し、成約率の向上と業務効率化を実現します。"
        features={FEATURES}
        timeEfficiency={TIME_EFFICIENCY}
        challenges={CHALLENGES}
        overview={OVERVIEW}
        operationSteps={OPERATION_STEPS}
      />

      <GuidanceOverlay
        steps={getGuidanceSteps(setActiveTab)}
        isActive={showGuidance}
        onClose={() => setShowGuidance(false)}
        theme="blue"
      />
    </div>
  )
}
