'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  UtensilsCrossed,
  ShoppingCart,
  BookOpen,
  Factory,
  Package,
  Building2,
  Search,
  Plus,
  Calendar,
  ChevronRight,
  Check,
  Clock,
  AlertTriangle,
  Truck,
  Users,
  RotateCcw,
  Trash2,
  LucideIcon,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react'
import {
  SplashScreen,
  InfoSidebar,
  Modal,
  GuidanceOverlay,
  GuidanceStartButton,
  MockHeader,
  MockHeaderTitle,
  MockHeaderTab,
  MockHeaderInfoButton,
  usePersistedState,
  useEditModal,
  useCsvImport,
  generateId,
  resetPersistedData,
  type Feature,
  type TimeEfficiencyItem,
  type OverviewInfo,
  type OperationStep,
  type GuidanceStep,
} from '../../_components'

// ==========================================
// 機能説明データ
// ==========================================

const FEATURES: Feature[] = [
  {
    icon: ShoppingCart,
    title: '受注管理',
    description:
      '施設ごとの発注内容を一覧管理。食数・食事形態・アレルギー対応を自動集計し、受注確認から納品まで一気通貫で管理します。',
    benefit: '受注処理時間を60%削減',
  },
  {
    icon: BookOpen,
    title: '献立管理',
    description:
      '栄養基準に基づいた献立作成を支援。食事形態（常食・刻み・ミキサー等）ごとの自動変換で、個別対応の手間を大幅に削減。',
    benefit: '献立作成時間を週3時間→30分に短縮',
  },
  {
    icon: Factory,
    title: '製造指示',
    description:
      '受注データと献立から製造指示書を自動生成。食材の必要量を自動計算し、製造ロットの最適化を支援します。',
    benefit: '食材ロスを30%削減',
  },
  {
    icon: Package,
    title: '梱包・配送管理',
    description:
      '施設別の梱包リスト自動生成と配送ルート管理。配送状況のリアルタイム追跡で誤配送を防止します。',
    benefit: '配送ミスをゼロに',
  },
]

const TIME_EFFICIENCY: TimeEfficiencyItem[] = [
  { task: '受注集計', before: '2時間', after: '自動集計', saved: '2時間/日' },
  { task: '献立作成', before: '3時間/週', after: '30分/週', saved: '2.5時間/週' },
  { task: '製造指示書作成', before: '1時間', after: '5分', saved: '55分/日' },
  { task: '配送伝票作成', before: '45分', after: '自動生成', saved: '45分/日' },
]

const CHALLENGES = [
  '施設ごとに食事形態が異なり管理が煩雑',
  '手作業の集計でミスが発生しやすい',
  '急な食数変更への対応が間に合わない',
  '食材の発注量が不安定でロスが多い',
  '配送先の間違いが時々起こる',
]

const OVERVIEW: OverviewInfo = {
  description: '介護施設向けの給食管理を一元化するシステムです。受注から献立作成、製造、配送まで全工程をデジタル管理し、安全で効率的な食事提供を実現します。',
  automationPoints: [
    '施設別の食数・食事形態を自動集計',
    '献立からの製造指示書自動生成',
    '配送リスト・伝票の自動作成',
    '栄養基準に基づく献立チェック',
  ],
  userBenefits: [
    '手作業の集計ミスを根絶し食の安全を確保',
    '急な食数変更にもリアルタイムで対応可能',
    '配送ミスゼロで施設との信頼関係を構築',
  ],
}

const OPERATION_STEPS: OperationStep[] = [
  { step: 1, action: '受注を確認・登録', detail: '施設ごとの注文内容（食数・食事形態・アレルギー）を登録' },
  { step: 2, action: '献立を管理', detail: '日別の献立と食事形態ごとのバリエーションを管理' },
  { step: 3, action: '製造指示を確認', detail: '受注データから製造指示書を自動生成、製造進捗を管理' },
  { step: 4, action: '配送を管理', detail: '配送リストの自動生成と配送ステータスの追跡' },
  { step: 5, action: '施設情報を管理', detail: '取引先施設の基本情報・連絡先・契約内容を管理' },
]

const getGuidanceSteps = (setActiveTab: (tab: TabId) => void): GuidanceStep[] => [
  { targetSelector: '[data-guidance="orders-tab"]', title: '受注管理', description: '施設ごとの発注内容を一覧管理。食数変更や特別対応もここから。', position: 'bottom', action: () => setActiveTab('orders') },
  { targetSelector: '[data-guidance="order-row"]', title: '受注の編集', description: '受注の行をクリックすると編集モーダルが開きます。食数・特別対応を変更可能。', position: 'bottom', action: () => setActiveTab('orders') },
  { targetSelector: '[data-guidance="menu-tab"]', title: '献立管理', description: '日別の献立作成と食事形態ごとの自動変換を管理します。', position: 'bottom', action: () => setActiveTab('orders') },
  { targetSelector: '[data-guidance="menu-row"]', title: '献立の編集', description: '献立の行をクリックすると編集画面が開きます。メニュー内容を変更可能。', position: 'bottom', action: () => setActiveTab('menu') },
  { targetSelector: '[data-guidance="production-tab"]', title: '製造管理', description: '受注データから製造指示書を自動生成。製造進捗を追跡。', position: 'bottom', action: () => setActiveTab('menu') },
  { targetSelector: '[data-guidance="add-production-button"]', title: '製造指示の追加', description: '「製造追加」ボタンで新しい製造指示を登録します。', position: 'bottom', action: () => setActiveTab('production') },
  { targetSelector: '[data-guidance="delivery-tab"]', title: '配送管理', description: '配送リストの自動生成と配送ステータスをリアルタイム追跡。', position: 'bottom', action: () => setActiveTab('production') },
  { targetSelector: '[data-guidance="add-delivery-button"]', title: '配送の追加', description: '「配送追加」ボタンで新しい配送を登録します。', position: 'bottom', action: () => setActiveTab('delivery') },
  { targetSelector: '[data-guidance="facilities-tab"]', title: '施設管理', description: '施設の基本情報・食事形態・連絡先を管理します。', position: 'bottom', action: () => setActiveTab('delivery') },
  { targetSelector: '[data-guidance="add-facility-button"]', title: '施設の追加', description: '「施設追加」ボタンで新しい施設を登録します。', position: 'bottom', action: () => setActiveTab('facilities') },
  { targetSelector: '[data-guidance="info-button"]', title: '機能説明', description: 'システムの概要や操作手順、時間削減効果を確認できます。右下のボタンからいつでも開けます。', position: 'top', action: () => setActiveTab('facilities') },
]

// ==========================================
// 型定義
// ==========================================

interface Facility {
  id: string
  name: string
  type: string
  mealCount: number
  contact: string
  address: string
}

interface Order {
  id: string
  facilityId: string
  facilityName: string
  date: string
  mealType: string
  normalCount: number
  softCount: number
  mixerCount: number
  status: '確認済' | '未確認' | '変更あり'
  note: string
}

interface MenuItem {
  id: string
  day: string
  date: string
  breakfast: string
  lunch: string
  dinner: string
}

interface ProductionItem {
  id: string
  menuName: string
  totalServings: number
  normalServings: number
  softServings: number
  mixerServings: number
  status: '製造中' | '完了' | '未着手'
  startTime: string
}

interface DeliveryItem {
  id: string
  facilityName: string
  itemCount: number
  departureTime: string
  status: '配送完了' | '配送中' | '準備中'
  driver: string
}

// ==========================================
// 初期データ
// ==========================================

const INITIAL_FACILITIES: Facility[] = [
  { id: 'F001', name: 'グループホームA', type: 'グループホーム', mealCount: 18, contact: '担当者A', address: 'XX県XX市1-2-3' },
  { id: 'F002', name: '老人ホームB', type: '特別養護老人ホーム', mealCount: 60, contact: '担当者B', address: 'XX県XX市4-5-6' },
  { id: 'F003', name: 'デイサービスC', type: 'デイサービス', mealCount: 25, contact: '担当者C', address: 'XX県XX市7-8-9' },
  { id: 'F004', name: '介護付き有料D', type: '介護付き有料老人ホーム', mealCount: 45, contact: '担当者D', address: 'XX県XX市10-11-12' },
]

const INITIAL_ORDERS: Order[] = [
  { id: 'ORD001', facilityId: 'F001', facilityName: 'グループホームA', date: '2026-02-23', mealType: '昼食', normalCount: 12, softCount: 4, mixerCount: 2, status: '確認済', note: '' },
  { id: 'ORD002', facilityId: 'F002', facilityName: '老人ホームB', date: '2026-02-23', mealType: '昼食', normalCount: 35, softCount: 15, mixerCount: 10, status: '確認済', note: '' },
  { id: 'ORD003', facilityId: 'F003', facilityName: 'デイサービスC', date: '2026-02-23', mealType: '昼食', normalCount: 18, softCount: 5, mixerCount: 2, status: '変更あり', note: '2名追加' },
  { id: 'ORD004', facilityId: 'F004', facilityName: '介護付き有料D', date: '2026-02-23', mealType: '昼食', normalCount: 25, softCount: 12, mixerCount: 8, status: '未確認', note: '' },
  { id: 'ORD005', facilityId: 'F001', facilityName: 'グループホームA', date: '2026-02-23', mealType: '夕食', normalCount: 12, softCount: 4, mixerCount: 2, status: '確認済', note: '' },
  { id: 'ORD006', facilityId: 'F002', facilityName: '老人ホームB', date: '2026-02-23', mealType: '夕食', normalCount: 34, softCount: 16, mixerCount: 10, status: '確認済', note: '1名欠食' },
]

const INITIAL_MENU: MenuItem[] = [
  { id: 'M001', day: '月', date: '2/23', breakfast: 'ご飯・味噌汁・焼鮭・ほうれん草のお浸し', lunch: '親子丼・小松菜の煮浸し・フルーツ', dinner: 'ハンバーグ・ポテトサラダ・コンソメスープ' },
  { id: 'M002', day: '火', date: '2/24', breakfast: 'パン・コーンスープ・スクランブルエッグ', lunch: '焼きそば・春雨サラダ・杏仁豆腐', dinner: 'さばの味噌煮・きんぴらごぼう・けんちん汁' },
  { id: 'M003', day: '水', date: '2/25', breakfast: 'ご飯・わかめスープ・卵焼き・漬物', lunch: 'カレーライス・福神漬け・サラダ', dinner: '豚の生姜焼き・ひじきの煮物・味噌汁' },
  { id: 'M004', day: '木', date: '2/26', breakfast: 'ご飯・味噌汁・納豆・切り干し大根', lunch: 'うどん・天ぷら・フルーツゼリー', dinner: '鶏の照り焼き・おかか和え・すまし汁' },
  { id: 'M005', day: '金', date: '2/27', breakfast: 'パン・ミネストローネ・ヨーグルト', lunch: '五目ちらし寿司・茶碗蒸し・吸い物', dinner: 'えびフライ・コールスロー・味噌汁' },
  { id: 'M006', day: '土', date: '2/28', breakfast: 'ご飯・豚汁・焼きのり・おひたし', lunch: 'チャーハン・餃子・中華スープ', dinner: '肉じゃが・酢の物・味噌汁' },
  { id: 'M007', day: '日', date: '3/1', breakfast: 'パン・ポタージュ・フルーツ', lunch: 'オムライス・グリーンサラダ・デザート', dinner: '刺身定食・茶碗蒸し・味噌汁' },
]

const INITIAL_PRODUCTION: ProductionItem[] = [
  { id: 'P001', menuName: '親子丼', totalServings: 148, normalServings: 90, softServings: 36, mixerServings: 22, status: '製造中', startTime: '08:00' },
  { id: 'P002', menuName: '小松菜の煮浸し', totalServings: 148, normalServings: 90, softServings: 36, mixerServings: 22, status: '完了', startTime: '07:30' },
  { id: 'P003', menuName: 'フルーツ盛り合わせ', totalServings: 148, normalServings: 90, softServings: 36, mixerServings: 22, status: '未着手', startTime: '09:00' },
]

const INITIAL_DELIVERY: DeliveryItem[] = [
  { id: 'D001', facilityName: 'グループホームA', itemCount: 18, departureTime: '10:30', status: '配送完了', driver: 'ドライバーA' },
  { id: 'D002', facilityName: '老人ホームB', itemCount: 60, departureTime: '10:45', status: '配送中', driver: 'ドライバーB' },
  { id: 'D003', facilityName: 'デイサービスC', itemCount: 25, departureTime: '11:00', status: '準備中', driver: 'ドライバーA' },
  { id: 'D004', facilityName: '介護付き有料D', itemCount: 45, departureTime: '11:15', status: '準備中', driver: 'ドライバーB' },
]

// ==========================================
// ストレージキー
// ==========================================

const STORAGE_KEYS = {
  facilities: 'mock-kaigoshoku-facilities',
  orders: 'mock-kaigoshoku-orders',
  menu: 'mock-kaigoshoku-menu',
  production: 'mock-kaigoshoku-production',
  delivery: 'mock-kaigoshoku-delivery',
}

// ==========================================
// タブ定義
// ==========================================

type TabId = 'orders' | 'menu' | 'production' | 'delivery' | 'facilities'

interface Tab {
  id: TabId
  label: string
  icon: LucideIcon
}

const TABS: Tab[] = [
  { id: 'orders', label: '受注管理', icon: ShoppingCart },
  { id: 'menu', label: '献立管理', icon: BookOpen },
  { id: 'production', label: '製造指示', icon: Factory },
  { id: 'delivery', label: '梱包・配送', icon: Package },
  { id: 'facilities', label: '施設マスタ', icon: Building2 },
]

// ==========================================
// フォーム入力ヘルパー
// ==========================================

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs text-stone-500 block mb-1">{label}</label>
    {children}
  </div>
)

const inputClass = 'w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
const selectClass = inputClass

// ==========================================
// StatusBadge（クリック可能版）
// ==========================================

const StatusBadge = ({ status, onClick }: { status: string; onClick?: () => void }) => {
  const config: Record<string, string> = {
    '確認済': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    '未確認': 'bg-slate-50 text-slate-600 border-slate-200',
    '変更あり': 'bg-amber-50 text-amber-700 border-amber-200',
    '製造中': 'bg-blue-50 text-blue-700 border-blue-200',
    '完了': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    '未着手': 'bg-slate-50 text-slate-600 border-slate-200',
    '配送完了': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    '配送中': 'bg-blue-50 text-blue-700 border-blue-200',
    '準備中': 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span
      onClick={onClick ? (e) => { e.stopPropagation(); onClick() } : undefined}
      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${config[status] ?? 'bg-slate-50 text-slate-600 border-slate-200'} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      {status}
    </span>
  )
}

// ==========================================
// 受注管理ビュー
// ==========================================

type OrderForm = Omit<Order, 'id'>

const EMPTY_ORDER_FORM: OrderForm = { facilityId: '', facilityName: '', date: '2026-02-23', mealType: '昼食', normalCount: 0, softCount: 0, mixerCount: 0, status: '未確認', note: '' }
const toOrderForm = (o: Order): OrderForm => ({ facilityId: o.facilityId, facilityName: o.facilityName, date: o.date, mealType: o.mealType, normalCount: o.normalCount, softCount: o.softCount, mixerCount: o.mixerCount, status: o.status, note: o.note })

const OrdersView = ({
  orders,
  setOrders,
  facilities,
}: {
  orders: Order[]
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>
  facilities: Facility[]
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const modal = useEditModal<Order, OrderForm>(EMPTY_ORDER_FORM, toOrderForm)

  const generateOrderCsvData = useCallback((): Order[] => {
    const mealTypes = ['朝食', '昼食', '夕食']
    const statuses: Order['status'][] = ['確認済', '未確認', '変更あり']
    const notes = ['', '', '', '1名追加', '2名欠食', 'アレルギー対応あり', '食事形態変更']
    const count = Math.floor(Math.random() * 4) + 3
    const newOrders: Order[] = []
    for (let i = 0; i < count; i++) {
      const facility = facilities[Math.floor(Math.random() * facilities.length)]
      const normalCount = Math.floor(Math.random() * 30) + 5
      const softCount = Math.floor(Math.random() * 15) + 1
      const mixerCount = Math.floor(Math.random() * 10) + 1
      newOrders.push({
        id: generateId('ORD'),
        facilityId: facility.id,
        facilityName: facility.name,
        date: '2026-02-23',
        mealType: mealTypes[Math.floor(Math.random() * mealTypes.length)],
        normalCount,
        softCount,
        mixerCount,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        note: notes[Math.floor(Math.random() * notes.length)],
      })
    }
    return newOrders
  }, [facilities])

  const csv = useCsvImport<Order>(generateOrderCsvData, setOrders)

  const filtered = orders.filter(
    (o) => !searchTerm || o.facilityName.includes(searchTerm) || o.mealType.includes(searchTerm)
  )
  const totalMeals = filtered.reduce((sum, o) => sum + o.normalCount + o.softCount + o.mixerCount, 0)

  const cycleOrderStatus = (orderId: string) => {
    const cycle: Record<string, Order['status']> = { '未確認': '確認済', '確認済': '変更あり', '変更あり': '未確認' }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: cycle[o.status] ?? '未確認' } : o)))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-amber-100 p-4">
          <p className="text-xs text-stone-500">本日の受注数</p>
          <p className="text-2xl font-bold text-stone-800">{filtered.length}<span className="text-sm font-normal text-stone-500 ml-1">件</span></p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-4">
          <p className="text-xs text-stone-500">合計食数</p>
          <p className="text-2xl font-bold text-stone-800">{totalMeals}<span className="text-sm font-normal text-stone-500 ml-1">食</span></p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-4">
          <p className="text-xs text-stone-500">未確認</p>
          <p className="text-2xl font-bold text-amber-600">{filtered.filter((o) => o.status === '未確認').length}<span className="text-sm font-normal ml-1">件</span></p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-4">
          <p className="text-xs text-stone-500">変更あり</p>
          <p className="text-2xl font-bold text-orange-600">{filtered.filter((o) => o.status === '変更あり').length}<span className="text-sm font-normal ml-1">件</span></p>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
          <input
            type="text"
            placeholder="施設名・食事タイプで検索..."
            className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={csv.open} className="flex items-center gap-1 px-3 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors whitespace-nowrap">
          <Upload size={14} />
          CSV取り込み
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3 text-left">施設名</th>
                <th className="px-4 py-3 text-left">食事</th>
                <th className="px-4 py-3 text-right">常食</th>
                <th className="px-4 py-3 text-right">刻み</th>
                <th className="px-4 py-3 text-right">ミキサー</th>
                <th className="px-4 py-3 text-right">合計</th>
                <th className="px-4 py-3 text-center">ステータス</th>
                <th className="px-4 py-3 text-left">備考</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((order, idx) => (
                <tr key={idx} {...(idx === 0 ? { 'data-guidance': 'order-row' } : {})} className="hover:bg-amber-50/30 transition-colors cursor-pointer" onClick={() => modal.openEdit(order)}>
                  <td className="px-4 py-3 font-medium text-stone-800">{order.facilityName}</td>
                  <td className="px-4 py-3 text-stone-600">{order.mealType}</td>
                  <td className="px-4 py-3 text-right text-stone-700">{order.normalCount}</td>
                  <td className="px-4 py-3 text-right text-stone-700">{order.softCount}</td>
                  <td className="px-4 py-3 text-right text-stone-700">{order.mixerCount}</td>
                  <td className="px-4 py-3 text-right font-bold text-stone-800">{order.normalCount + order.softCount + order.mixerCount}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={order.status} onClick={() => cycleOrderStatus(order.id)} />
                  </td>
                  <td className="px-4 py-3 text-stone-500">{order.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modal.modalOpen} onClose={modal.close} title="受注編集">
        <div className="space-y-4">
          <FormField label="施設">
            <select className={selectClass} value={modal.form.facilityId} onChange={(e) => {
              const facility = facilities.find((f) => f.id === e.target.value)
              modal.setForm((prev) => ({ ...prev, facilityId: e.target.value, facilityName: facility?.name ?? '' }))
            }}>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="日付">
              <input type="date" className={inputClass} value={modal.form.date} onChange={(e) => modal.setForm((p) => ({ ...p, date: e.target.value }))} />
            </FormField>
            <FormField label="食事タイプ">
              <select className={selectClass} value={modal.form.mealType} onChange={(e) => modal.setForm((p) => ({ ...p, mealType: e.target.value }))}>
                {['朝食', '昼食', '夕食'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="常食">
              <input type="number" className={inputClass} value={modal.form.normalCount} onChange={(e) => modal.setForm((p) => ({ ...p, normalCount: Number(e.target.value) }))} />
            </FormField>
            <FormField label="刻み食">
              <input type="number" className={inputClass} value={modal.form.softCount} onChange={(e) => modal.setForm((p) => ({ ...p, softCount: Number(e.target.value) }))} />
            </FormField>
            <FormField label="ミキサー食">
              <input type="number" className={inputClass} value={modal.form.mixerCount} onChange={(e) => modal.setForm((p) => ({ ...p, mixerCount: Number(e.target.value) }))} />
            </FormField>
          </div>
          <FormField label="備考">
            <input type="text" className={inputClass} value={modal.form.note} onChange={(e) => modal.setForm((p) => ({ ...p, note: e.target.value }))} placeholder="任意" />
          </FormField>
          <div className="flex justify-between pt-2">
            <button onClick={() => modal.remove(setOrders)} className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors">
              <Trash2 size={14} />
              削除
            </button>
            <div className="flex gap-2">
              <button onClick={modal.close} className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">キャンセル</button>
              <button onClick={() => modal.save(setOrders, 'ORD')} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">保存</button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={csv.confirmOpen} onClose={() => !csv.importing && csv.cancel()} title="CSV取り込み">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <FileSpreadsheet className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">受注データCSV取り込み</p>
              <p className="text-xs text-amber-600 mt-1">デモのため、自動でデータをランダムに追加します。</p>
            </div>
          </div>
          {csv.done ? (
            <div className="flex items-center gap-2 justify-center py-4 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">取り込み完了</span>
            </div>
          ) : csv.importing ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
              <span className="text-sm text-stone-500">CSVデータを読み込み中...</span>
            </div>
          ) : (
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={csv.cancel} className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">キャンセル</button>
              <button onClick={csv.execute} className="flex items-center gap-1 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">
                <Upload size={14} />
                取り込み開始
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

// ==========================================
// 献立管理ビュー
// ==========================================

type MenuForm = Omit<MenuItem, 'id'>

const EMPTY_MENU_FORM: MenuForm = { day: '', date: '', breakfast: '', lunch: '', dinner: '' }
const toMenuForm = (m: MenuItem): MenuForm => ({ day: m.day, date: m.date, breakfast: m.breakfast, lunch: m.lunch, dinner: m.dinner })

const MenuView = ({
  menu,
  setMenu,
}: {
  menu: MenuItem[]
  setMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>
}) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const modal = useEditModal<MenuItem, MenuForm>(EMPTY_MENU_FORM, toMenuForm)

  const generateMenuCsvData = useCallback((): MenuItem[] => {
    const breakfasts = [
      'ご飯・味噌汁・焼き魚・おひたし', 'パン・コーンスープ・目玉焼き', 'おかゆ・梅干し・卵焼き・漬物',
      'ご飯・豚汁・納豆・のり', 'トースト・ミネストローネ・サラダ', 'ご飯・味噌汁・肉じゃが',
    ]
    const lunches = [
      '天ぷらうどん・おにぎり・フルーツ', 'ビーフシチュー・パン・サラダ', '五目炊き込みご飯・豚汁・漬物',
      'ナポリタン・コンソメスープ・ゼリー', '鯖の塩焼き定食・けんちん汁', 'チキンカツ・キャベツ・味噌汁',
    ]
    const dinners = [
      '鶏の唐揚げ・ポテトサラダ・味噌汁', '麻婆豆腐・春雨サラダ・ご飯', '煮魚・ひじき煮・お吸い物',
      'ロールキャベツ・コンソメスープ・ご飯', 'すき焼き風煮物・酢の物・ご飯', '豚しゃぶサラダ・味噌汁・ご飯',
    ]
    const days = ['月', '火', '水', '木', '金', '土', '日']
    const baseDate = menu.length + 1
    const count = Math.floor(Math.random() * 3) + 3
    const newMenus: MenuItem[] = []
    for (let i = 0; i < count; i++) {
      const dayIdx = (baseDate + i) % 7
      newMenus.push({
        id: generateId('M'),
        day: days[dayIdx],
        date: `3/${baseDate + i}`,
        breakfast: breakfasts[Math.floor(Math.random() * breakfasts.length)],
        lunch: lunches[Math.floor(Math.random() * lunches.length)],
        dinner: dinners[Math.floor(Math.random() * dinners.length)],
      })
    }
    return newMenus
  }, [menu.length])

  const csv = useCsvImport<MenuItem>(generateMenuCsvData, setMenu)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-stone-800">2026年2月 第4週</h3>
        </div>
        <button onClick={csv.open} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">
          <Upload size={14} />
          CSV取り込み
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3 text-left w-20">曜日</th>
                <th className="px-4 py-3 text-left">朝食</th>
                <th className="px-4 py-3 text-left">昼食</th>
                <th className="px-4 py-3 text-left">夕食</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {menu.map((item, idx) => (
                <tr
                  key={idx}
                  {...(idx === 0 ? { 'data-guidance': 'menu-row' } : {})}
                  className={`cursor-pointer transition-colors ${selectedDay === item.day ? 'bg-amber-50' : 'hover:bg-amber-50/30'}`}
                  onClick={() => modal.openEdit(item)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${item.day === '土' ? 'bg-blue-100 text-blue-700' : item.day === '日' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                        {item.day}
                      </span>
                      <span className="text-xs text-stone-400">{item.date}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{item.breakfast}</td>
                  <td className="px-4 py-3 text-stone-700">{item.lunch}</td>
                  <td className="px-4 py-3 text-stone-700">{item.dinner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDay && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="font-semibold text-amber-800 mb-2">食事形態別対応</h4>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3 border border-amber-100">
              <p className="text-xs text-stone-500 mb-1">常食</p>
              <p className="text-stone-700">通常調理</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-amber-100">
              <p className="text-xs text-stone-500 mb-1">刻み食</p>
              <p className="text-stone-700">5mm〜1cm角カット</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-amber-100">
              <p className="text-xs text-stone-500 mb-1">ミキサー食</p>
              <p className="text-stone-700">ペースト状に加工</p>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={modal.modalOpen} onClose={modal.close} title="献立編集">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="曜日">
              <input type="text" className={inputClass} value={modal.form.day} onChange={(e) => modal.setForm((p) => ({ ...p, day: e.target.value }))} placeholder="月" />
            </FormField>
            <FormField label="日付">
              <input type="text" className={inputClass} value={modal.form.date} onChange={(e) => modal.setForm((p) => ({ ...p, date: e.target.value }))} placeholder="2/23" />
            </FormField>
          </div>
          <FormField label="朝食">
            <input type="text" className={inputClass} value={modal.form.breakfast} onChange={(e) => modal.setForm((p) => ({ ...p, breakfast: e.target.value }))} />
          </FormField>
          <FormField label="昼食">
            <input type="text" className={inputClass} value={modal.form.lunch} onChange={(e) => modal.setForm((p) => ({ ...p, lunch: e.target.value }))} />
          </FormField>
          <FormField label="夕食">
            <input type="text" className={inputClass} value={modal.form.dinner} onChange={(e) => modal.setForm((p) => ({ ...p, dinner: e.target.value }))} />
          </FormField>
          <div className="flex justify-between pt-2">
            <button onClick={() => modal.remove(setMenu)} className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors">
              <Trash2 size={14} />
              削除
            </button>
            <div className="flex gap-2">
              <button onClick={modal.close} className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">キャンセル</button>
              <button onClick={() => modal.save(setMenu, 'M')} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">保存</button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={csv.confirmOpen} onClose={() => !csv.importing && csv.cancel()} title="CSV取り込み">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <FileSpreadsheet className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">献立データCSV取り込み</p>
              <p className="text-xs text-amber-600 mt-1">デモのため、自動でデータをランダムに追加します。</p>
            </div>
          </div>
          {csv.done ? (
            <div className="flex items-center gap-2 justify-center py-4 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">取り込み完了</span>
            </div>
          ) : csv.importing ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
              <span className="text-sm text-stone-500">CSVデータを読み込み中...</span>
            </div>
          ) : (
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={csv.cancel} className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">キャンセル</button>
              <button onClick={csv.execute} className="flex items-center gap-1 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">
                <Upload size={14} />
                取り込み開始
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

// ==========================================
// 製造指示ビュー
// ==========================================

type ProductionForm = { menuName: string; normalServings: number; softServings: number; mixerServings: number; startTime: string }

const EMPTY_PRODUCTION_FORM: ProductionForm = { menuName: '', normalServings: 0, softServings: 0, mixerServings: 0, startTime: '08:00' }
const toProductionForm = (p: ProductionItem): ProductionForm => ({ menuName: p.menuName, normalServings: p.normalServings, softServings: p.softServings, mixerServings: p.mixerServings, startTime: p.startTime })

const ProductionView = ({
  production,
  setProduction,
}: {
  production: ProductionItem[]
  setProduction: React.Dispatch<React.SetStateAction<ProductionItem[]>>
}) => {
  const modal = useEditModal<ProductionItem, ProductionForm>(EMPTY_PRODUCTION_FORM, toProductionForm)

  // save時にtotalServingsを計算して付加する
  const handleSave = () => {
    const totalServings = (modal.form.normalServings || 0) + (modal.form.softServings || 0) + (modal.form.mixerServings || 0)
    if (modal.editingItem) {
      setProduction((prev) => prev.map((p) => (p.id === modal.editingItem!.id ? { ...p, ...modal.form, totalServings } : p)))
    } else {
      setProduction((prev) => [...prev, { id: generateId('P'), ...modal.form, totalServings, status: '未着手' as const }])
    }
    modal.close()
  }

  const cycleProductionStatus = (itemId: string) => {
    const cycle: Record<string, ProductionItem['status']> = { '未着手': '製造中', '製造中': '完了', '完了': '未着手' }
    setProduction((prev) => prev.map((p) => (p.id === itemId ? { ...p, status: cycle[p.status] ?? '未着手' } : p)))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-stone-800">本日の製造指示 — 2026/02/23 昼食</h3>
        </div>
        <button data-guidance="add-production-button" onClick={modal.openNew} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">
          <Plus size={14} />
          製造追加
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <Check className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-emerald-700">{production.filter((p) => p.status === '完了').length}</p>
          <p className="text-xs text-emerald-600">完了</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <Factory className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-blue-700">{production.filter((p) => p.status === '製造中').length}</p>
          <p className="text-xs text-blue-600">製造中</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
          <AlertTriangle className="w-6 h-6 text-slate-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-slate-700">{production.filter((p) => p.status === '未着手').length}</p>
          <p className="text-xs text-slate-500">未着手</p>
        </div>
      </div>

      <div className="space-y-3">
        {production.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-all cursor-pointer" onClick={() => modal.openEdit(item)}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-stone-800">{item.menuName}</h4>
                <StatusBadge status={item.status} onClick={() => cycleProductionStatus(item.id)} />
              </div>
              <span className="text-sm text-stone-500">開始: {item.startTime}</span>
            </div>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div className="bg-stone-50 rounded-lg p-2 text-center">
                <p className="text-xs text-stone-500">合計</p>
                <p className="font-bold text-stone-800">{item.totalServings}食</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2 text-center">
                <p className="text-xs text-stone-500">常食</p>
                <p className="font-bold text-amber-700">{item.normalServings}食</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-2 text-center">
                <p className="text-xs text-stone-500">刻み</p>
                <p className="font-bold text-orange-700">{item.softServings}食</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <p className="text-xs text-stone-500">ミキサー</p>
                <p className="font-bold text-red-700">{item.mixerServings}食</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modal.modalOpen} onClose={modal.close} title={modal.editingItem ? '製造指示編集' : '製造指示追加'}>
        <div className="space-y-4">
          <FormField label="メニュー名">
            <input type="text" className={inputClass} value={modal.form.menuName} onChange={(e) => modal.setForm((p) => ({ ...p, menuName: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="常食（食数）">
              <input type="number" className={inputClass} value={modal.form.normalServings} onChange={(e) => modal.setForm((p) => ({ ...p, normalServings: Number(e.target.value) }))} />
            </FormField>
            <FormField label="刻み食（食数）">
              <input type="number" className={inputClass} value={modal.form.softServings} onChange={(e) => modal.setForm((p) => ({ ...p, softServings: Number(e.target.value) }))} />
            </FormField>
            <FormField label="ミキサー食（食数）">
              <input type="number" className={inputClass} value={modal.form.mixerServings} onChange={(e) => modal.setForm((p) => ({ ...p, mixerServings: Number(e.target.value) }))} />
            </FormField>
          </div>
          <div className="text-sm text-stone-500">
            合計: <span className="font-bold text-stone-800">{(modal.form.normalServings || 0) + (modal.form.softServings || 0) + (modal.form.mixerServings || 0)}食</span>
          </div>
          <FormField label="開始時間">
            <input type="time" className={inputClass} value={modal.form.startTime} onChange={(e) => modal.setForm((p) => ({ ...p, startTime: e.target.value }))} />
          </FormField>
          <div className="flex justify-between pt-2">
            {modal.editingItem ? (
              <button onClick={() => modal.remove(setProduction)} className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors">
                <Trash2 size={14} />
                削除
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button onClick={modal.close} className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">キャンセル</button>
              <button onClick={handleSave} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">保存</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ==========================================
// 梱包・配送ビュー
// ==========================================

type DeliveryForm = { facilityName: string; itemCount: number; departureTime: string; driver: string }

const EMPTY_DELIVERY_FORM: DeliveryForm = { facilityName: '', itemCount: 0, departureTime: '10:00', driver: '' }
const toDeliveryForm = (d: DeliveryItem): DeliveryForm => ({ facilityName: d.facilityName, itemCount: d.itemCount, departureTime: d.departureTime, driver: d.driver })

const DeliveryView = ({
  delivery,
  setDelivery,
}: {
  delivery: DeliveryItem[]
  setDelivery: React.Dispatch<React.SetStateAction<DeliveryItem[]>>
}) => {
  const modal = useEditModal<DeliveryItem, DeliveryForm>(EMPTY_DELIVERY_FORM, toDeliveryForm)

  // save時にstatusのデフォルト値を付加する
  const handleSave = () => {
    if (modal.editingItem) {
      setDelivery((prev) => prev.map((d) => (d.id === modal.editingItem!.id ? { ...d, ...modal.form } : d)))
    } else {
      setDelivery((prev) => [...prev, { id: generateId('D'), ...modal.form, status: '準備中' as const }])
    }
    modal.close()
  }

  const cycleDeliveryStatus = (itemId: string) => {
    const cycle: Record<string, DeliveryItem['status']> = { '準備中': '配送中', '配送中': '配送完了', '配送完了': '準備中' }
    setDelivery((prev) => prev.map((d) => (d.id === itemId ? { ...d, status: cycle[d.status] ?? '準備中' } : d)))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-stone-800">本日の配送状況</h3>
        </div>
        <button data-guidance="add-delivery-button" onClick={modal.openNew} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">
          <Plus size={14} />
          配送追加
        </button>
      </div>

      <div className="space-y-3">
        {delivery.map((item, idx) => (
          <div key={item.id} className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-all cursor-pointer" onClick={() => modal.openEdit(item)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${item.status === '配送完了' ? 'bg-emerald-100 text-emerald-700' :
                  item.status === '配送中' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-stone-800">{item.facilityName}</h4>
                  <p className="text-xs text-stone-500">{item.itemCount}食 / ドライバー: {item.driver}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-stone-500">{item.departureTime} 出発</span>
                <StatusBadge status={item.status} onClick={() => cycleDeliveryStatus(item.id)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modal.modalOpen} onClose={modal.close} title={modal.editingItem ? '配送編集' : '配送追加'}>
        <div className="space-y-4">
          <FormField label="施設名">
            <input type="text" className={inputClass} value={modal.form.facilityName} onChange={(e) => modal.setForm((p) => ({ ...p, facilityName: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="食数">
              <input type="number" className={inputClass} value={modal.form.itemCount} onChange={(e) => modal.setForm((p) => ({ ...p, itemCount: Number(e.target.value) }))} />
            </FormField>
            <FormField label="出発時間">
              <input type="time" className={inputClass} value={modal.form.departureTime} onChange={(e) => modal.setForm((p) => ({ ...p, departureTime: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="ドライバー">
            <input type="text" className={inputClass} value={modal.form.driver} onChange={(e) => modal.setForm((p) => ({ ...p, driver: e.target.value }))} />
          </FormField>
          <div className="flex justify-between pt-2">
            {modal.editingItem ? (
              <button onClick={() => modal.remove(setDelivery)} className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors">
                <Trash2 size={14} />
                削除
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button onClick={modal.close} className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">キャンセル</button>
              <button onClick={handleSave} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">保存</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ==========================================
// 施設マスタビュー
// ==========================================

const FACILITY_TYPES = ['グループホーム', '特別養護老人ホーム', 'デイサービス', '介護付き有料老人ホーム', 'サービス付き高齢者向け住宅']

type FacilityForm = { name: string; type: string; mealCount: number; contact: string; address: string }

const EMPTY_FACILITY_FORM: FacilityForm = { name: '', type: FACILITY_TYPES[0], mealCount: 0, contact: '', address: '' }
const toFacilityForm = (f: Facility): FacilityForm => ({ name: f.name, type: f.type, mealCount: f.mealCount, contact: f.contact, address: f.address })

const FacilitiesView = ({
  facilities,
  setFacilities,
}: {
  facilities: Facility[]
  setFacilities: React.Dispatch<React.SetStateAction<Facility[]>>
}) => {
  const modal = useEditModal<Facility, FacilityForm>(EMPTY_FACILITY_FORM, toFacilityForm)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-stone-800">登録施設一覧</h3>
        </div>
        <button data-guidance="add-facility-button" onClick={modal.openNew} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">
          <Plus size={14} />
          施設追加
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facilities.map((facility) => (
          <div key={facility.id} className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md hover:border-amber-200 transition-all group cursor-pointer" onClick={() => modal.openEdit(facility)}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-stone-800 group-hover:text-amber-700 transition-colors">{facility.name}</h4>
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">{facility.type}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">契約食数</span>
                <span className="font-medium text-stone-800">{facility.mealCount}食/日</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">担当者</span>
                <span className="text-stone-700">{facility.contact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">住所</span>
                <span className="text-stone-700 text-xs">{facility.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modal.modalOpen} onClose={modal.close} title={modal.editingItem ? '施設編集' : '施設追加'}>
        <div className="space-y-4">
          <FormField label="施設名">
            <input type="text" className={inputClass} value={modal.form.name} onChange={(e) => modal.setForm((p) => ({ ...p, name: e.target.value }))} />
          </FormField>
          <FormField label="施設タイプ">
            <select className={selectClass} value={modal.form.type} onChange={(e) => modal.setForm((p) => ({ ...p, type: e.target.value }))}>
              {FACILITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="契約食数（食/日）">
              <input type="number" className={inputClass} value={modal.form.mealCount} onChange={(e) => modal.setForm((p) => ({ ...p, mealCount: Number(e.target.value) }))} />
            </FormField>
            <FormField label="担当者">
              <input type="text" className={inputClass} value={modal.form.contact} onChange={(e) => modal.setForm((p) => ({ ...p, contact: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="住所">
            <input type="text" className={inputClass} value={modal.form.address} onChange={(e) => modal.setForm((p) => ({ ...p, address: e.target.value }))} />
          </FormField>
          <div className="flex justify-between pt-2">
            {modal.editingItem ? (
              <button onClick={() => modal.remove(setFacilities)} className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors">
                <Trash2 size={14} />
                削除
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button onClick={modal.close} className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">キャンセル</button>
              <button onClick={() => modal.save(setFacilities, 'F')} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">保存</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ==========================================
// メインコンポーネント
// ==========================================

export default function KaigoshokuMockPage() {
  const [activeTab, setActiveTab] = useState<TabId>('orders')
  const [showSplash, setShowSplash] = useState(true)
  const [showInfoSidebar, setShowInfoSidebar] = useState(false)
  const [showGuidance, setShowGuidance] = useState(false)

  const [facilities, setFacilities] = usePersistedState<Facility[]>(STORAGE_KEYS.facilities, INITIAL_FACILITIES)
  const [orders, setOrders] = usePersistedState<Order[]>(STORAGE_KEYS.orders, INITIAL_ORDERS)
  const [menu, setMenu] = usePersistedState<MenuItem[]>(STORAGE_KEYS.menu, INITIAL_MENU)
  const [production, setProduction] = usePersistedState<ProductionItem[]>(STORAGE_KEYS.production, INITIAL_PRODUCTION)
  const [delivery, setDelivery] = usePersistedState<DeliveryItem[]>(STORAGE_KEYS.delivery, INITIAL_DELIVERY)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleReset = useCallback(() => {
    resetPersistedData(STORAGE_KEYS)
  }, [])

  if (showSplash) {
    return <SplashScreen theme="amber" systemName="介護食管理システム" subtitle="Care Meal Management" />
  }

  const TAB_VIEWS: Record<TabId, React.ReactNode> = {
    orders: <OrdersView orders={orders} setOrders={setOrders} facilities={facilities} />,
    menu: <MenuView menu={menu} setMenu={setMenu} />,
    production: <ProductionView production={production} setProduction={setProduction} />,
    delivery: <DeliveryView delivery={delivery} setDelivery={setDelivery} />,
    facilities: <FacilitiesView facilities={facilities} setFacilities={setFacilities} />,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/30 font-sans">
      <MockHeader>
        <MockHeaderTitle icon={UtensilsCrossed} title="介護食管理システム" subtitle="Care Meal Management" theme="amber" />

        <div className="flex items-center gap-2">
          <GuidanceStartButton onClick={() => setShowGuidance(true)} theme="amber" />
          <button
            onClick={handleReset}
            className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="データ初期化"
          >
            <RotateCcw size={16} />
          </button>
          {TABS.map((tab) => (
            <MockHeaderTab
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
              theme="amber"
              data-guidance={`${tab.id}-tab`}
            />
          ))}
          <MockHeaderInfoButton onClick={() => setShowInfoSidebar(true)} theme="amber" />
        </div>
      </MockHeader>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {TAB_VIEWS[activeTab]}
      </main>

      <InfoSidebar
        isOpen={showInfoSidebar}
        onClose={() => setShowInfoSidebar(false)}
        theme="amber"
        systemIcon={UtensilsCrossed}
        systemName="介護食管理システム"
        systemDescription="介護施設向けの給食管理を一元化するシステムです。受注・献立・製造・配送の全工程をデジタル管理し、安全で効率的な食事提供を実現します。"
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
        theme="amber"
      />
    </div>
  )
}
