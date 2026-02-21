'use client'

import React, {useState, useEffect} from 'react'
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
  PanelRightOpen,
  Truck,
  Users,
  ClipboardList,
  LucideIcon,
} from 'lucide-react'
import {SplashScreen, InfoSidebar, type Feature, type TimeEfficiencyItem} from '../_components'

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
  {task: '受注集計', before: '2時間', after: '自動集計', saved: '2時間/日'},
  {task: '献立作成', before: '3時間/週', after: '30分/週', saved: '2.5時間/週'},
  {task: '製造指示書作成', before: '1時間', after: '5分', saved: '55分/日'},
  {task: '配送伝票作成', before: '45分', after: '自動生成', saved: '45分/日'},
]

const CHALLENGES = [
  '施設ごとに食事形態が異なり管理が煩雑',
  '手作業の集計でミスが発生しやすい',
  '急な食数変更への対応が間に合わない',
  '食材の発注量が不安定でロスが多い',
  '配送先の間違いが時々起こる',
]

// ==========================================
// ダミーデータ
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

const FACILITIES: Facility[] = [
  {id: 'F001', name: 'グループホームA', type: 'グループホーム', mealCount: 18, contact: '担当者A', address: 'XX県XX市1-2-3'},
  {id: 'F002', name: '老人ホームB', type: '特別養護老人ホーム', mealCount: 60, contact: '担当者B', address: 'XX県XX市4-5-6'},
  {id: 'F003', name: 'デイサービスC', type: 'デイサービス', mealCount: 25, contact: '担当者C', address: 'XX県XX市7-8-9'},
  {id: 'F004', name: '介護付き有料D', type: '介護付き有料老人ホーム', mealCount: 45, contact: '担当者D', address: 'XX県XX市10-11-12'},
]

const ORDERS: Order[] = [
  {id: 'ORD001', facilityId: 'F001', facilityName: 'グループホームA', date: '2026-02-23', mealType: '昼食', normalCount: 12, softCount: 4, mixerCount: 2, status: '確認済', note: ''},
  {id: 'ORD002', facilityId: 'F002', facilityName: '老人ホームB', date: '2026-02-23', mealType: '昼食', normalCount: 35, softCount: 15, mixerCount: 10, status: '確認済', note: ''},
  {id: 'ORD003', facilityId: 'F003', facilityName: 'デイサービスC', date: '2026-02-23', mealType: '昼食', normalCount: 18, softCount: 5, mixerCount: 2, status: '変更あり', note: '2名追加'},
  {id: 'ORD004', facilityId: 'F004', facilityName: '介護付き有料D', date: '2026-02-23', mealType: '昼食', normalCount: 25, softCount: 12, mixerCount: 8, status: '未確認', note: ''},
  {id: 'ORD005', facilityId: 'F001', facilityName: 'グループホームA', date: '2026-02-23', mealType: '夕食', normalCount: 12, softCount: 4, mixerCount: 2, status: '確認済', note: ''},
  {id: 'ORD006', facilityId: 'F002', facilityName: '老人ホームB', date: '2026-02-23', mealType: '夕食', normalCount: 34, softCount: 16, mixerCount: 10, status: '確認済', note: '1名欠食'},
]

const WEEKLY_MENU: MenuItem[] = [
  {day: '月', date: '2/23', breakfast: 'ご飯・味噌汁・焼鮭・ほうれん草のお浸し', lunch: '親子丼・小松菜の煮浸し・フルーツ', dinner: 'ハンバーグ・ポテトサラダ・コンソメスープ'},
  {day: '火', date: '2/24', breakfast: 'パン・コーンスープ・スクランブルエッグ', lunch: '焼きそば・春雨サラダ・杏仁豆腐', dinner: 'さばの味噌煮・きんぴらごぼう・けんちん汁'},
  {day: '水', date: '2/25', breakfast: 'ご飯・わかめスープ・卵焼き・漬物', lunch: 'カレーライス・福神漬け・サラダ', dinner: '豚の生姜焼き・ひじきの煮物・味噌汁'},
  {day: '木', date: '2/26', breakfast: 'ご飯・味噌汁・納豆・切り干し大根', lunch: 'うどん・天ぷら・フルーツゼリー', dinner: '鶏の照り焼き・おかか和え・すまし汁'},
  {day: '金', date: '2/27', breakfast: 'パン・ミネストローネ・ヨーグルト', lunch: '五目ちらし寿司・茶碗蒸し・吸い物', dinner: 'えびフライ・コールスロー・味噌汁'},
  {day: '土', date: '2/28', breakfast: 'ご飯・豚汁・焼きのり・おひたし', lunch: 'チャーハン・餃子・中華スープ', dinner: '肉じゃが・酢の物・味噌汁'},
  {day: '日', date: '3/1', breakfast: 'パン・ポタージュ・フルーツ', lunch: 'オムライス・グリーンサラダ・デザート', dinner: '刺身定食・茶碗蒸し・味噌汁'},
]

const PRODUCTION_ITEMS: ProductionItem[] = [
  {id: 'P001', menuName: '親子丼', totalServings: 148, normalServings: 90, softServings: 36, mixerServings: 22, status: '製造中', startTime: '08:00'},
  {id: 'P002', menuName: '小松菜の煮浸し', totalServings: 148, normalServings: 90, softServings: 36, mixerServings: 22, status: '完了', startTime: '07:30'},
  {id: 'P003', menuName: 'フルーツ盛り合わせ', totalServings: 148, normalServings: 90, softServings: 36, mixerServings: 22, status: '未着手', startTime: '09:00'},
]

const DELIVERY_ITEMS: DeliveryItem[] = [
  {id: 'D001', facilityName: 'グループホームA', itemCount: 18, departureTime: '10:30', status: '配送完了', driver: 'ドライバーA'},
  {id: 'D002', facilityName: '老人ホームB', itemCount: 60, departureTime: '10:45', status: '配送中', driver: 'ドライバーB'},
  {id: 'D003', facilityName: 'デイサービスC', itemCount: 25, departureTime: '11:00', status: '準備中', driver: 'ドライバーA'},
  {id: 'D004', facilityName: '介護付き有料D', itemCount: 45, departureTime: '11:15', status: '準備中', driver: 'ドライバーB'},
]

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
  {id: 'orders', label: '受注管理', icon: ShoppingCart},
  {id: 'menu', label: '献立管理', icon: BookOpen},
  {id: 'production', label: '製造指示', icon: Factory},
  {id: 'delivery', label: '梱包・配送', icon: Package},
  {id: 'facilities', label: '施設マスタ', icon: Building2},
]

// ==========================================
// サブコンポーネント
// ==========================================

const StatusBadge = ({status}: {status: string}) => {
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
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${config[status] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  )
}

// ==========================================
// タブビュー
// ==========================================

const OrdersView = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const filtered = ORDERS.filter(
    (o) => !searchTerm || o.facilityName.includes(searchTerm) || o.mealType.includes(searchTerm)
  )
  const totalMeals = filtered.reduce((sum, o) => sum + o.normalCount + o.softCount + o.mixerCount, 0)

  return (
    <div className="space-y-4">
      {/* サマリーカード */}
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

      {/* 検索 */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
        <input
          type="text"
          placeholder="施設名・食事タイプで検索..."
          className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* テーブル */}
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
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-stone-800">{order.facilityName}</td>
                  <td className="px-4 py-3 text-stone-600">{order.mealType}</td>
                  <td className="px-4 py-3 text-right text-stone-700">{order.normalCount}</td>
                  <td className="px-4 py-3 text-right text-stone-700">{order.softCount}</td>
                  <td className="px-4 py-3 text-right text-stone-700">{order.mixerCount}</td>
                  <td className="px-4 py-3 text-right font-bold text-stone-800">{order.normalCount + order.softCount + order.mixerCount}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 text-stone-500">{order.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const MenuView = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-stone-800">2026年2月 第4週</h3>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">
          <Plus size={14} />
          献立追加
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
              {WEEKLY_MENU.map((item) => (
                <tr
                  key={item.day}
                  className={`cursor-pointer transition-colors ${selectedDay === item.day ? 'bg-amber-50' : 'hover:bg-amber-50/30'}`}
                  onClick={() => setSelectedDay(selectedDay === item.day ? null : item.day)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        item.day === '土' ? 'bg-blue-100 text-blue-700' : item.day === '日' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
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
    </div>
  )
}

const ProductionView = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-amber-600" />
        <h3 className="font-bold text-stone-800">本日の製造指示 — 2026/02/23 昼食</h3>
      </div>
    </div>

    {/* 進捗サマリー */}
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
        <Check className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
        <p className="text-2xl font-bold text-emerald-700">{PRODUCTION_ITEMS.filter((p) => p.status === '完了').length}</p>
        <p className="text-xs text-emerald-600">完了</p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
        <Factory className="w-6 h-6 text-blue-600 mx-auto mb-1" />
        <p className="text-2xl font-bold text-blue-700">{PRODUCTION_ITEMS.filter((p) => p.status === '製造中').length}</p>
        <p className="text-xs text-blue-600">製造中</p>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
        <AlertTriangle className="w-6 h-6 text-slate-500 mx-auto mb-1" />
        <p className="text-2xl font-bold text-slate-700">{PRODUCTION_ITEMS.filter((p) => p.status === '未着手').length}</p>
        <p className="text-xs text-slate-500">未着手</p>
      </div>
    </div>

    {/* 製造リスト */}
    <div className="space-y-3">
      {PRODUCTION_ITEMS.map((item) => (
        <div key={item.id} className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h4 className="font-bold text-stone-800">{item.menuName}</h4>
              <StatusBadge status={item.status} />
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
  </div>
)

const DeliveryView = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <Truck className="w-5 h-5 text-amber-600" />
      <h3 className="font-bold text-stone-800">本日の配送状況</h3>
    </div>

    {/* 配送タイムライン */}
    <div className="space-y-3">
      {DELIVERY_ITEMS.map((item, idx) => (
        <div key={item.id} className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                item.status === '配送完了' ? 'bg-emerald-100 text-emerald-700' :
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
              <StatusBadge status={item.status} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const FacilitiesView = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-amber-600" />
        <h3 className="font-bold text-stone-800">登録施設一覧</h3>
      </div>
      <button className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">
        <Plus size={14} />
        施設追加
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {FACILITIES.map((facility) => (
        <div key={facility.id} className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md hover:border-amber-200 transition-all group cursor-pointer">
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
  </div>
)

// ==========================================
// メインコンポーネント
// ==========================================

export default function KaigoshokuMockPage() {
  const [activeTab, setActiveTab] = useState<TabId>('orders')
  const [showSplash, setShowSplash] = useState(true)
  const [showInfoSidebar, setShowInfoSidebar] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen theme="amber" systemName="介護食管理システム" subtitle="Care Meal Management" />
  }

  const TAB_VIEWS: Record<TabId, React.ReactNode> = {
    orders: <OrdersView />,
    menu: <MenuView />,
    production: <ProductionView />,
    delivery: <DeliveryView />,
    facilities: <FacilitiesView />,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/30 font-sans">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/20">
              <UtensilsCrossed className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">
                介護食管理システム
              </h1>
              <p className="text-xs text-stone-400 -mt-0.5">Care Meal Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                    : 'text-stone-600 hover:bg-stone-50 border border-transparent hover:border-amber-200'
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {TAB_VIEWS[activeTab]}
      </main>

      {/* フローティング「機能説明」ボタン */}
      <button
        onClick={() => setShowInfoSidebar(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-lg shadow-amber-500/30 hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
      >
        <PanelRightOpen className="w-4 h-4" />
        <span className="text-sm font-medium">機能説明</span>
      </button>

      {/* 機能説明サイドバー */}
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
      />
    </div>
  )
}
