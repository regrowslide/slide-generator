'use client'

// このファイルはモックであり、単一ファイルに収まるよう構築されています。
// 本番プロジェクトでは、プロジェクトの設計やルールに従ってページやコンポーネントを分割してください。

import React, {useState, useEffect, useMemo} from 'react'
import {
  Building2,
  Users,
  ClipboardList,
  Menu,
  X,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  MessageCircle,
  Send,
  Wrench,
  Volume2,
  Droplets,
  AlertOctagon,
  Zap,
  ChevronDown,
  Filter,
  Home,
  Shield,
} from 'lucide-react'

// =============================================================================
// モックデータ
// =============================================================================

type Owner = {
  id: string
  name: string
  category: '個人' | '法人'
  phone: string
  email: string
  contractType: '受託管理' | 'サブリース'
  propertyCount: number
}

type Property = {
  id: string
  ownerId: string
  name: string
  address: string
  type: string
  totalUnits: number
  vacantUnits: number
}

type Tenant = {
  id: string
  propertyId: string
  room: string
  name: string
  rent: number
  contractStart: string
  contractEnd: string
  status: '入居中' | '退去予定' | '空室'
}

type RequiredDocument = {
  id: string
  ownerPropertyKey: string
  name: string
  status: '提出済' | '未提出' | '期限切れ'
  submittedAt: string | null
  expiresAt: string | null
}

type Task = {
  id: string
  ownerPropertyKey: string
  title: string
  category: string
  status: '未着手' | '進行中' | '完了'
  priority: '高' | '中' | '低'
  dueDate: string
  assignee: string
}

type CommunicationCase = {
  id: string
  ownerPropertyKey: string
  date: string
  category: '設備故障' | '騒音苦情' | '漏水' | '害虫' | '電気トラブル' | 'その他'
  summary: string
  resolution: '未対応' | '対応中' | '解決済'
}

type ChatMessage = {
  id: string
  ownerPropertyKey: string
  sender: 'owner' | 'management'
  message: string
  timestamp: string
}

const OWNERS: Owner[] = [
  {id: 'O001', name: '山田太郎', category: '個人', phone: '090-1234-5678', email: 'yamada@example.com', contractType: '受託管理', propertyCount: 2},
  {id: 'O002', name: '(株)サンライズ不動産', category: '法人', phone: '03-1111-2222', email: 'sunrise@example.com', contractType: 'サブリース', propertyCount: 1},
  {id: 'O003', name: '佐藤花子', category: '個人', phone: '080-3333-4444', email: 'sato@example.com', contractType: '受託管理', propertyCount: 1},
  {id: 'O004', name: '(有)グリーンエステート', category: '法人', phone: '045-5555-6666', email: 'green@example.com', contractType: 'サブリース', propertyCount: 2},
  {id: 'O005', name: '田中一郎', category: '個人', phone: '070-7777-8888', email: 'tanaka@example.com', contractType: '受託管理', propertyCount: 1},
]

const PROPERTIES: Property[] = [
  {id: 'P001', ownerId: 'O001', name: 'サンプルマンションA', address: '東京都渋谷区神南1-1-1', type: 'マンション', totalUnits: 12, vacantUnits: 2},
  {id: 'P002', ownerId: 'O001', name: 'メゾン山田', address: '東京都世田谷区三軒茶屋2-2-2', type: 'アパート', totalUnits: 6, vacantUnits: 1},
  {id: 'P003', ownerId: 'O002', name: 'サンライズタワー', address: '横浜市西区みなとみらい3-3-3', type: 'マンション', totalUnits: 24, vacantUnits: 3},
  {id: 'P004', ownerId: 'O003', name: 'コーポ佐藤', address: '川崎市中原区小杉4-4-4', type: 'アパート', totalUnits: 8, vacantUnits: 0},
  {id: 'P005', ownerId: 'O004', name: 'グリーンハイツ', address: '東京都目黒区自由が丘5-5-5', type: 'マンション', totalUnits: 16, vacantUnits: 2},
  {id: 'P006', ownerId: 'O004', name: 'グリーンコート', address: '横浜市青葉区美しが丘6-6-6', type: 'アパート', totalUnits: 10, vacantUnits: 1},
  {id: 'P007', ownerId: 'O005', name: '田中ビル', address: '東京都新宿区西新宿7-7-7', type: 'ビル', totalUnits: 6, vacantUnits: 1},
]

const TENANTS: Tenant[] = [
  {id: 'T001', propertyId: 'P001', room: '101', name: '鈴木健太', rent: 85000, contractStart: '2024-04-01', contractEnd: '2026-03-31', status: '入居中'},
  {id: 'T002', propertyId: 'P001', room: '102', name: '', rent: 80000, contractStart: '', contractEnd: '', status: '空室'},
  {id: 'T003', propertyId: 'P001', room: '201', name: '高橋美咲', rent: 90000, contractStart: '2023-10-01', contractEnd: '2025-09-30', status: '入居中'},
  {id: 'T004', propertyId: 'P001', room: '202', name: '佐々木健', rent: 88000, contractStart: '2025-01-01', contractEnd: '2027-01-31', status: '入居中'},
  {id: 'T005', propertyId: 'P001', room: '301', name: '松本大輔', rent: 92000, contractStart: '2024-07-01', contractEnd: '2026-06-30', status: '退去予定'},
  {id: 'T006', propertyId: 'P001', room: '302', name: '', rent: 90000, contractStart: '', contractEnd: '', status: '空室'},
  {id: 'T007', propertyId: 'P002', room: '101', name: '中村優子', rent: 65000, contractStart: '2024-03-01', contractEnd: '2026-02-28', status: '入居中'},
  {id: 'T008', propertyId: 'P002', room: '102', name: '小林裕太', rent: 63000, contractStart: '2025-05-01', contractEnd: '2027-04-30', status: '入居中'},
  {id: 'T009', propertyId: 'P002', room: '201', name: '', rent: 67000, contractStart: '', contractEnd: '', status: '空室'},
  {id: 'T010', propertyId: 'P003', room: '501', name: '加藤真一', rent: 120000, contractStart: '2024-01-01', contractEnd: '2025-12-31', status: '入居中'},
  {id: 'T011', propertyId: 'P003', room: '502', name: '伊藤裕美', rent: 115000, contractStart: '2025-03-01', contractEnd: '2027-02-28', status: '入居中'},
  {id: 'T012', propertyId: 'P004', room: '101', name: '渡辺拓也', rent: 72000, contractStart: '2023-08-01', contractEnd: '2025-07-31', status: '入居中'},
  {id: 'T013', propertyId: 'P005', room: '301', name: '木村隆', rent: 105000, contractStart: '2024-06-01', contractEnd: '2026-05-31', status: '入居中'},
  {id: 'T014', propertyId: 'P005', room: '302', name: '', rent: 100000, contractStart: '', contractEnd: '', status: '空室'},
  {id: 'T015', propertyId: 'P007', room: '3F', name: '(株)テクノワークス', rent: 180000, contractStart: '2024-04-01', contractEnd: '2027-03-31', status: '入居中'},
]

const REQUIRED_DOCUMENTS: RequiredDocument[] = [
  {id: 'D001', ownerPropertyKey: 'O001-P001', name: '管理委託契約書', status: '提出済', submittedAt: '2024-04-01', expiresAt: '2026-03-31'},
  {id: 'D002', ownerPropertyKey: 'O001-P001', name: '火災保険証書', status: '提出済', submittedAt: '2024-04-10', expiresAt: '2027-04-09'},
  {id: 'D003', ownerPropertyKey: 'O001-P001', name: '固定資産税納税証明書', status: '未提出', submittedAt: null, expiresAt: '2026-03-31'},
  {id: 'D004', ownerPropertyKey: 'O001-P001', name: '建物登記簿謄本', status: '期限切れ', submittedAt: '2023-05-15', expiresAt: '2025-05-14'},
  {id: 'D005', ownerPropertyKey: 'O001-P002', name: '管理委託契約書', status: '提出済', submittedAt: '2024-03-01', expiresAt: '2026-02-28'},
  {id: 'D006', ownerPropertyKey: 'O001-P002', name: '火災保険証書', status: '未提出', submittedAt: null, expiresAt: '2026-06-30'},
  {id: 'D007', ownerPropertyKey: 'O002-P003', name: 'サブリース契約書', status: '提出済', submittedAt: '2024-01-15', expiresAt: '2029-01-14'},
  {id: 'D008', ownerPropertyKey: 'O002-P003', name: '火災保険証書', status: '提出済', submittedAt: '2024-02-01', expiresAt: '2027-01-31'},
  {id: 'D009', ownerPropertyKey: 'O003-P004', name: '管理委託契約書', status: '提出済', submittedAt: '2023-08-01', expiresAt: '2025-07-31'},
  {id: 'D010', ownerPropertyKey: 'O003-P004', name: '確定申告書（写し）', status: '期限切れ', submittedAt: '2024-03-15', expiresAt: '2025-03-14'},
  {id: 'D011', ownerPropertyKey: 'O004-P005', name: 'サブリース契約書', status: '提出済', submittedAt: '2024-06-01', expiresAt: '2029-05-31'},
  {id: 'D012', ownerPropertyKey: 'O004-P005', name: '法人登記簿謄本', status: '未提出', submittedAt: null, expiresAt: '2026-06-30'},
  {id: 'D013', ownerPropertyKey: 'O005-P007', name: '管理委託契約書', status: '提出済', submittedAt: '2024-04-01', expiresAt: '2026-03-31'},
  {id: 'D014', ownerPropertyKey: 'O005-P007', name: '火災保険証書', status: '提出済', submittedAt: '2024-04-15', expiresAt: '2027-04-14'},
]

const TASKS_DATA: Task[] = [
  {id: 'TK001', ownerPropertyKey: 'O001-P001', title: '外壁塗装の見積依頼', category: '修繕', status: '進行中', priority: '高', dueDate: '2026-03-15', assignee: '佐藤'},
  {id: 'TK002', ownerPropertyKey: 'O001-P001', title: '空室101号室の募集広告作成', category: '募集', status: '未着手', priority: '高', dueDate: '2026-02-28', assignee: '田中'},
  {id: 'TK003', ownerPropertyKey: 'O001-P001', title: '定期清掃業者との契約更新', category: '管理', status: '完了', priority: '中', dueDate: '2026-01-31', assignee: '佐藤'},
  {id: 'TK004', ownerPropertyKey: 'O001-P002', title: '給湯器交換の手配', category: '修繕', status: '進行中', priority: '中', dueDate: '2026-03-10', assignee: '高橋'},
  {id: 'TK005', ownerPropertyKey: 'O002-P003', title: '共用部LED化工事の見積', category: '修繕', status: '未着手', priority: '低', dueDate: '2026-04-30', assignee: '田中'},
  {id: 'TK006', ownerPropertyKey: 'O002-P003', title: '月次収支報告書の送付', category: '報告', status: '進行中', priority: '高', dueDate: '2026-02-25', assignee: '佐藤'},
  {id: 'TK007', ownerPropertyKey: 'O003-P004', title: '退去者の原状回復確認', category: '退去', status: '完了', priority: '中', dueDate: '2026-01-20', assignee: '高橋'},
  {id: 'TK008', ownerPropertyKey: 'O004-P005', title: '消防設備点検の手配', category: '管理', status: '未着手', priority: '中', dueDate: '2026-04-15', assignee: '佐藤'},
  {id: 'TK009', ownerPropertyKey: 'O004-P006', title: '駐車場ライン引き直し', category: '修繕', status: '完了', priority: '低', dueDate: '2026-01-15', assignee: '田中'},
  {id: 'TK010', ownerPropertyKey: 'O005-P007', title: 'テナント契約更新交渉', category: '契約', status: '進行中', priority: '高', dueDate: '2026-03-01', assignee: '佐藤'},
]

const COMMUNICATION_CASES: CommunicationCase[] = [
  {id: 'CC001', ownerPropertyKey: 'O001-P001', date: '2026-02-18', category: '設備故障', summary: '301号室エアコン故障。修理業者手配済み、2/20訪問予定。', resolution: '対応中'},
  {id: 'CC002', ownerPropertyKey: 'O001-P001', date: '2026-02-10', category: '騒音苦情', summary: '201号室から上階（301号室）の深夜騒音についてクレーム。注意文書を配布。', resolution: '解決済'},
  {id: 'CC003', ownerPropertyKey: 'O001-P001', date: '2026-01-25', category: '漏水', summary: '302号室天井からの漏水報告。上階排水管の劣化が原因。修繕完了。', resolution: '解決済'},
  {id: 'CC004', ownerPropertyKey: 'O001-P002', date: '2026-02-15', category: '設備故障', summary: '201号室の給湯器が故障。交換手配中。', resolution: '対応中'},
  {id: 'CC005', ownerPropertyKey: 'O002-P003', date: '2026-02-20', category: '害虫', summary: '共用部でゴキブリ発生の報告多数。害虫駆除業者に依頼予定。', resolution: '未対応'},
  {id: 'CC006', ownerPropertyKey: 'O003-P004', date: '2026-02-05', category: '騒音苦情', summary: '102号室住人のペット鳴き声について隣室からクレーム。飼い主に注意済み。', resolution: '解決済'},
  {id: 'CC007', ownerPropertyKey: 'O004-P005', date: '2026-02-12', category: '電気トラブル', summary: '共用部の照明が頻繁にちらつく。電気業者に点検依頼。', resolution: '対応中'},
  {id: 'CC008', ownerPropertyKey: 'O005-P007', date: '2026-01-30', category: 'その他', summary: '3Fテナントから看板設置の要望。ビルオーナーと協議中。', resolution: '対応中'},
]

const CHAT_MESSAGES: ChatMessage[] = [
  {id: 'CM001', ownerPropertyKey: 'O001-P001', sender: 'owner', message: 'お世話になっております。外壁塗装の見積もり、進捗はいかがでしょうか？', timestamp: '2026-02-20 10:30'},
  {id: 'CM002', ownerPropertyKey: 'O001-P001', sender: 'management', message: '山田様、ご連絡ありがとうございます。現在3社から見積もりを取得中です。来週中にはご報告できる見込みです。', timestamp: '2026-02-20 11:15'},
  {id: 'CM003', ownerPropertyKey: 'O001-P001', sender: 'owner', message: 'ありがとうございます。よろしくお願いいたします。あと、301号室のエアコンの件はどうなりましたか？', timestamp: '2026-02-20 11:20'},
  {id: 'CM004', ownerPropertyKey: 'O001-P001', sender: 'management', message: '301号室のエアコンは修理業者を手配済みで、2/20（本日）午後に訪問予定です。結果はまたご報告いたします。', timestamp: '2026-02-20 11:25'},
  {id: 'CM005', ownerPropertyKey: 'O001-P001', sender: 'owner', message: '了解しました。早めのご対応、感謝します。', timestamp: '2026-02-20 11:30'},
  {id: 'CM006', ownerPropertyKey: 'O001-P002', sender: 'management', message: '山田様、メゾン山田201号室の給湯器交換について、メーカーに在庫確認中です。最短で3/5に交換可能とのことです。', timestamp: '2026-02-15 14:00'},
  {id: 'CM007', ownerPropertyKey: 'O001-P002', sender: 'owner', message: '承知しました。入居者様にはご不便をおかけしますが、よろしくお願いします。', timestamp: '2026-02-15 15:30'},
  {id: 'CM008', ownerPropertyKey: 'O002-P003', sender: 'management', message: 'サンライズ不動産様、2月度の月次収支報告書を25日までにお送りいたします。', timestamp: '2026-02-20 09:00'},
  {id: 'CM009', ownerPropertyKey: 'O002-P003', sender: 'owner', message: 'ありがとうございます。共用部の害虫の件も気になっているので、対応状況を教えてください。', timestamp: '2026-02-20 10:00'},
  {id: 'CM010', ownerPropertyKey: 'O002-P003', sender: 'management', message: '害虫の件、来週月曜に駆除業者が現地調査に入ります。調査後にお見積もりをお送りいたします。', timestamp: '2026-02-20 10:30'},
  {id: 'CM011', ownerPropertyKey: 'O005-P007', sender: 'owner', message: '3Fテナントの看板の件、どうなりましたか？', timestamp: '2026-02-18 16:00'},
  {id: 'CM012', ownerPropertyKey: 'O005-P007', sender: 'management', message: '田中様、テナント様のご希望を確認し、デザイン案を作成中です。今週末にはご相談の場を設けたいと考えております。', timestamp: '2026-02-18 17:00'},
]

// =============================================================================
// 共通UIコンポーネント
// =============================================================================

const Button = ({children, onClick, variant = 'primary', className = '', size = 'sm'}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  className?: string
  size?: 'sm' | 'md'
}) => {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 shadow-lg shadow-indigo-500/25',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
  }
  const sizeClasses = {sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm'}
  return (
    <button onClick={onClick} type="button" className={`font-semibold rounded-lg flex items-center justify-center transition-all duration-300 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </button>
  )
}

const Modal = ({isOpen, onClose, title, children}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start p-4 pt-16 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-top-4 duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

const StatusBadge = ({status}: {status: string}) => {
  const colorMap: Record<string, string> = {
    '提出済': 'bg-green-100 text-green-700',
    '入居中': 'bg-green-100 text-green-700',
    '完了': 'bg-green-100 text-green-700',
    '解決済': 'bg-green-100 text-green-700',
    '進行中': 'bg-blue-100 text-blue-700',
    '対応中': 'bg-blue-100 text-blue-700',
    '未提出': 'bg-amber-100 text-amber-700',
    '未着手': 'bg-amber-100 text-amber-700',
    '未対応': 'bg-amber-100 text-amber-700',
    '期限切れ': 'bg-red-100 text-red-700',
    '退去予定': 'bg-orange-100 text-orange-700',
    '空室': 'bg-slate-100 text-slate-500',
    '受託管理': 'bg-indigo-100 text-indigo-700',
    'サブリース': 'bg-violet-100 text-violet-700',
    '個人': 'bg-sky-100 text-sky-700',
    '法人': 'bg-emerald-100 text-emerald-700',
  }
  const colors = colorMap[status] || 'bg-slate-100 text-slate-700'
  return <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${colors}`}>{status}</span>
}

const PriorityBadge = ({priority}: {priority: '高' | '中' | '低'}) => {
  const colorMap = {
    '高': 'bg-red-100 text-red-700 border-red-200',
    '中': 'bg-amber-100 text-amber-700 border-amber-200',
    '低': 'bg-blue-100 text-blue-700 border-blue-200',
  }
  return <span className={`px-2 py-0.5 text-xs font-bold rounded border ${colorMap[priority]}`}>{priority}</span>
}

const SearchBar = ({value, onChange, placeholder = '検索...'}: {value: string; onChange: (v: string) => void; placeholder?: string}) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
    />
  </div>
)

const SelectBox = ({value, onChange, options, placeholder, className = ''}: {
  value: string
  onChange: (v: string) => void
  options: {value: string; label: string}[]
  placeholder?: string
  className?: string
}) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
  </div>
)

// =============================================================================
// スプラッシュスクリーン
// =============================================================================

const SplashScreen = ({onComplete}: {onComplete: () => void}) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500)
    return () => clearTimeout(timer)
  }, [onComplete])
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 flex items-center justify-center z-[9999]">
      <div className="text-center animate-pulse">
        <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Earth Design</h1>
        <p className="text-indigo-200 text-sm">賃貸オーナー管理システム</p>
      </div>
    </div>
  )
}

// =============================================================================
// タブ1: オーナー一覧
// =============================================================================

const OwnerListTab = () => {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)

  const filtered = useMemo(() =>
    OWNERS.filter(o =>
      (o.name.includes(search) || o.phone.includes(search) || o.email.includes(search)) &&
      (!filterType || o.contractType === filterType)
    ), [search, filterType])

  const ownerProperties = useMemo(() =>
    selectedOwner ? PROPERTIES.filter(p => p.ownerId === selectedOwner.id) : [],
    [selectedOwner])

  return (
    <div>
      {/* フィルタ */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="オーナー名・電話番号で検索..." />
        </div>
        <SelectBox
          value={filterType}
          onChange={setFilterType}
          options={[{value: '受託管理', label: '受託管理'}, {value: 'サブリース', label: 'サブリース'}]}
          placeholder="契約タイプ"
          className="w-full sm:w-44"
        />
      </div>

      {/* テーブル */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">オーナー名</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">区分</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">電話番号</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">契約タイプ</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">物件数</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(owner => (
                <tr key={owner.id} onClick={() => setSelectedOwner(owner)} className="border-b border-slate-100 hover:bg-indigo-50/50 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{owner.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell"><StatusBadge status={owner.category} /></td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{owner.phone}</td>
                  <td className="px-4 py-3"><StatusBadge status={owner.contractType} /></td>
                  <td className="px-4 py-3 text-center text-slate-700 font-medium">{owner.propertyCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* オーナー詳細モーダル */}
      <Modal isOpen={!!selectedOwner} onClose={() => setSelectedOwner(null)} title={selectedOwner?.name ?? ''}>
        {selectedOwner && (
          <div className="space-y-6">
            {/* 基本情報 */}
            <div>
              <h4 className="text-sm font-bold text-slate-500 mb-3">基本情報</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">区分:</span>
                  <StatusBadge status={selectedOwner.category} />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">契約:</span>
                  <StatusBadge status={selectedOwner.contractType} />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">{selectedOwner.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">{selectedOwner.email}</span>
                </div>
              </div>
            </div>

            {/* 紐づく物件一覧 */}
            <div>
              <h4 className="text-sm font-bold text-slate-500 mb-3">所有物件（{ownerProperties.length}件）</h4>
              <div className="space-y-2">
                {ownerProperties.map(prop => (
                  <div key={prop.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800">{prop.name}</span>
                      <span className="text-xs text-slate-500">{prop.type}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                      <MapPin className="w-3 h-3" />
                      {prop.address}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-600">総戸数: <b>{prop.totalUnits}</b></span>
                      <span className={prop.vacantUnits > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                        空室: {prop.vacantUnits}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// =============================================================================
// タブ2: 物件管理
// =============================================================================

const PropertyTab = () => {
  const [ownerFilter, setOwnerFilter] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const ownerOptions = OWNERS.map(o => ({value: o.id, label: o.name}))

  const filtered = useMemo(() =>
    PROPERTIES.filter(p => !ownerFilter || p.ownerId === ownerFilter),
    [ownerFilter])

  const propertyTenants = useMemo(() =>
    selectedProperty ? TENANTS.filter(t => t.propertyId === selectedProperty.id) : [],
    [selectedProperty])

  return (
    <div>
      {/* フィルタ */}
      <div className="mb-4">
        <SelectBox
          value={ownerFilter}
          onChange={setOwnerFilter}
          options={ownerOptions}
          placeholder="すべてのオーナー"
          className="w-full sm:w-64"
        />
      </div>

      {/* テーブル */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">物件名</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">住所</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">種別</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">総戸数</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">空室</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(prop => {
                const owner = OWNERS.find(o => o.id === prop.ownerId)
                return (
                  <tr key={prop.id} onClick={() => setSelectedProperty(prop)} className="border-b border-slate-100 hover:bg-indigo-50/50 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{prop.name}</div>
                      <div className="text-xs text-slate-500 md:hidden">{prop.address}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{owner?.name}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{prop.address}</td>
                    <td className="px-4 py-3 hidden sm:table-cell"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{prop.type}</span></td>
                    <td className="px-4 py-3 text-center text-slate-700">{prop.totalUnits}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-medium ${prop.vacantUnits > 0 ? 'text-red-600' : 'text-green-600'}`}>{prop.vacantUnits}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 物件詳細モーダル */}
      <Modal isOpen={!!selectedProperty} onClose={() => setSelectedProperty(null)} title={selectedProperty?.name ?? ''}>
        {selectedProperty && (
          <div className="space-y-6">
            {/* 基本情報 */}
            <div>
              <h4 className="text-sm font-bold text-slate-500 mb-3">物件情報</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{selectedProperty.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{selectedProperty.type} / 全{selectedProperty.totalUnits}戸</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">オーナー: {OWNERS.find(o => o.id === selectedProperty.ownerId)?.name}</span>
                </div>
              </div>
            </div>

            {/* 部屋一覧 */}
            <div>
              <h4 className="text-sm font-bold text-slate-500 mb-3">部屋一覧</h4>
              <div className="space-y-2">
                {propertyTenants.map(tenant => (
                  <div key={tenant.id} className={`p-3 rounded-lg border ${tenant.status === '空室' ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800">{tenant.room}号室</span>
                      <StatusBadge status={tenant.status} />
                    </div>
                    {tenant.status !== '空室' ? (
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mt-1">
                        <span>入居者: {tenant.name}</span>
                        <span>家賃: ¥{tenant.rent.toLocaleString()}</span>
                        <span>契約開始: {tenant.contractStart}</span>
                        <span>契約終了: {tenant.contractEnd}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 mt-1">
                        募集家賃: ¥{tenant.rent.toLocaleString()}/月
                      </div>
                    )}
                  </div>
                ))}
                {propertyTenants.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">部屋データがありません</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// =============================================================================
// タブ3: 管理ページ（サブタブ4つ） - 全件表示 + 絞り込み対応
// =============================================================================

// ownerPropertyKeyからオーナー名・物件名を解決するヘルパー
const resolveOwnerProperty = (key: string) => {
  const [ownerId, propertyId] = key.split('-')
  const owner = OWNERS.find(o => o.id === ownerId)
  const property = PROPERTIES.find(p => p.id === propertyId)
  return {ownerName: owner?.name ?? '', propertyName: property?.name ?? ''}
}

// 共通フィルタバー
const ManagementFilterBar = ({ownerId, onOwnerChange, propertyId, onPropertyChange, search, onSearchChange, searchPlaceholder}: {
  ownerId: string
  onOwnerChange: (v: string) => void
  propertyId: string
  onPropertyChange: (v: string) => void
  search?: string
  onSearchChange?: (v: string) => void
  searchPlaceholder?: string
}) => {
  const availableProperties = useMemo(() =>
    ownerId ? PROPERTIES.filter(p => p.ownerId === ownerId) : PROPERTIES,
    [ownerId])

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      {onSearchChange && (
        <div className="flex-1">
          <SearchBar value={search ?? ''} onChange={onSearchChange} placeholder={searchPlaceholder ?? '検索...'} />
        </div>
      )}
      <SelectBox
        value={ownerId}
        onChange={(v) => {onOwnerChange(v); onPropertyChange('')}}
        options={OWNERS.map(o => ({value: o.id, label: o.name}))}
        placeholder="すべてのオーナー"
        className="w-full sm:w-48"
      />
      <SelectBox
        value={propertyId}
        onChange={onPropertyChange}
        options={availableProperties.map(p => ({value: p.id, label: p.name}))}
        placeholder="すべての物件"
        className="w-full sm:w-48"
      />
    </div>
  )
}

// ownerPropertyKeyのフィルタリング
const matchesOwnerProperty = (key: string, ownerId: string, propertyId: string) => {
  if (!ownerId && !propertyId) return true
  const [oId, pId] = key.split('-')
  if (ownerId && oId !== ownerId) return false
  if (propertyId && pId !== propertyId) return false
  return true
}

// オーナー・物件ラベル
const OwnerPropertyLabel = ({ownerPropertyKey}: {ownerPropertyKey: string}) => {
  const {ownerName, propertyName} = resolveOwnerProperty(ownerPropertyKey)
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
      <Users className="w-3 h-3" />
      <span>{ownerName}</span>
      <span className="text-slate-300">/</span>
      <Building2 className="w-3 h-3" />
      <span>{propertyName}</span>
    </div>
  )
}

// --- サブタブ1: 必要書類 ---
const DocumentSubTab = ({ownerId, propertyId}: {ownerId: string; propertyId: string}) => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const docs = useMemo(() =>
    REQUIRED_DOCUMENTS.filter(d =>
      matchesOwnerProperty(d.ownerPropertyKey, ownerId, propertyId) &&
      (!search || d.name.includes(search)) &&
      (!statusFilter || d.status === statusFilter)
    ), [ownerId, propertyId, search, statusFilter])

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="書類名で検索..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', '提出済', '未提出', '期限切れ'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              statusFilter === s ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-300'
            }`}>{s || 'すべて'}</button>
          ))}
        </div>
      </div>

      {docs.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">書類データがありません</p>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.id} className={`flex items-center justify-between p-3 rounded-lg border ${
              doc.status === '提出済' ? 'bg-green-50 border-green-200' :
              doc.status === '未提出' ? 'bg-amber-50 border-amber-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                <FileText className={`w-4 h-4 shrink-0 ${
                  doc.status === '提出済' ? 'text-green-500' :
                  doc.status === '未提出' ? 'text-amber-500' :
                  'text-red-500'
                }`} />
                <div>
                  <div className="text-sm font-medium text-slate-800">{doc.name}</div>
                  <div className="text-xs text-slate-500">
                    {doc.submittedAt && `提出日: ${doc.submittedAt}`}
                    {doc.expiresAt && ` / 有効期限: ${doc.expiresAt}`}
                  </div>
                  <OwnerPropertyLabel ownerPropertyKey={doc.ownerPropertyKey} />
                </div>
              </div>
              <StatusBadge status={doc.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- サブタブ2: タスク管理 ---
const TaskSubTab = ({ownerId, propertyId}: {ownerId: string; propertyId: string}) => {
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const tasks = useMemo(() =>
    TASKS_DATA.filter(t =>
      matchesOwnerProperty(t.ownerPropertyKey, ownerId, propertyId) &&
      (!statusFilter || t.status === statusFilter) &&
      (!search || t.title.includes(search) || t.category.includes(search) || t.assignee.includes(search))
    ), [ownerId, propertyId, statusFilter, search])

  const isOverdue = (dueDate: string, status: string) => {
    if (status === '完了') return false
    return new Date(dueDate) < new Date('2026-02-22')
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="タスク名・カテゴリ・担当者で検索..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', '未着手', '進行中', '完了'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              statusFilter === s ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-300'
            }`}>{s || 'すべて'}</button>
          ))}
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">タスクがありません</p>
      ) : (
        <div className="grid gap-3">
          {tasks.map(task => (
            <div key={task.id} className={`p-4 bg-white rounded-xl border shadow-sm ${isOverdue(task.dueDate, task.status) ? 'border-red-300 bg-red-50/50' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between mb-2">
                <h5 className="text-sm font-medium text-slate-800">{task.title}</h5>
                <PriorityBadge priority={task.priority} />
              </div>
              <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded">{task.category}</span>
                <StatusBadge status={task.status} />
                <span className={isOverdue(task.dueDate, task.status) ? 'text-red-600 font-medium' : ''}>
                  期限: {task.dueDate}
                </span>
                <span>担当: {task.assignee}</span>
              </div>
              <OwnerPropertyLabel ownerPropertyKey={task.ownerPropertyKey} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- サブタブ3: トラブル・連絡事例 ---
const CommunicationSubTab = ({ownerId, propertyId}: {ownerId: string; propertyId: string}) => {
  const [search, setSearch] = useState('')
  const [resolutionFilter, setResolutionFilter] = useState('')

  const cases = useMemo(() =>
    COMMUNICATION_CASES.filter(c =>
      matchesOwnerProperty(c.ownerPropertyKey, ownerId, propertyId) &&
      (!search || c.summary.includes(search) || c.category.includes(search)) &&
      (!resolutionFilter || c.resolution === resolutionFilter)
    ), [ownerId, propertyId, search, resolutionFilter])

  const categoryIcon = (category: string) => {
    const map: Record<string, React.ReactNode> = {
      '設備故障': <Wrench className="w-4 h-4 text-orange-500" />,
      '騒音苦情': <Volume2 className="w-4 h-4 text-purple-500" />,
      '漏水': <Droplets className="w-4 h-4 text-blue-500" />,
      '害虫': <AlertOctagon className="w-4 h-4 text-red-500" />,
      '電気トラブル': <Zap className="w-4 h-4 text-yellow-500" />,
      'その他': <AlertTriangle className="w-4 h-4 text-slate-400" />,
    }
    return map[category] || map['その他']
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="内容・カテゴリで検索..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', '未対応', '対応中', '解決済'].map(s => (
            <button key={s} onClick={() => setResolutionFilter(s)} className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              resolutionFilter === s ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-300'
            }`}>{s || 'すべて'}</button>
          ))}
        </div>
      </div>

      {cases.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">連絡事例がありません</p>
      ) : (
        <div className="relative pl-6 space-y-4">
          <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-200" />
          {cases.map(c => (
            <div key={c.id} className="relative">
              <div className="absolute -left-6 top-3 w-5 h-5 bg-white border-2 border-indigo-300 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {categoryIcon(c.category)}
                    <span className="text-xs font-medium text-slate-500">{c.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.resolution} />
                    <span className="text-xs text-slate-400">{c.date}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-700">{c.summary}</p>
                <OwnerPropertyLabel ownerPropertyKey={c.ownerPropertyKey} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- サブタブ4: チャットルーム ---
const ChatSubTab = ({ownerId, propertyId}: {ownerId: string; propertyId: string}) => {
  const [inputMessage, setInputMessage] = useState('')

  const messages = useMemo(() =>
    CHAT_MESSAGES.filter(m => matchesOwnerProperty(m.ownerPropertyKey, ownerId, propertyId)),
    [ownerId, propertyId])

  // メッセージをownerPropertyKeyでグルーピング
  const groupedMessages = useMemo(() => {
    const groups: Record<string, ChatMessage[]> = {}
    messages.forEach(m => {
      if (!groups[m.ownerPropertyKey]) groups[m.ownerPropertyKey] = []
      groups[m.ownerPropertyKey].push(m)
    })
    return groups
  }, [messages])

  const groupKeys = Object.keys(groupedMessages)

  if (groupKeys.length === 0) return <p className="text-sm text-slate-400 text-center py-8">チャット履歴がありません</p>

  return (
    <div className="space-y-6">
      {groupKeys.map(key => {
        const {ownerName, propertyName} = resolveOwnerProperty(key)
        const msgs = groupedMessages[key]
        return (
          <div key={key} className="border border-slate-200 rounded-xl overflow-hidden">
            {/* スレッドヘッダー */}
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2 text-xs text-slate-600">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">{ownerName}</span>
              <span className="text-slate-300">/</span>
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{propertyName}</span>
            </div>

            {/* メッセージ */}
            <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
              {msgs.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'management' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.sender === 'management'
                      ? 'bg-indigo-500 text-white rounded-br-md'
                      : 'bg-slate-100 text-slate-800 rounded-bl-md'
                  }`}>
                    <p>{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'management' ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* 入力欄（UI表示のみ） */}
      <div className="flex gap-2 pt-3 border-t border-slate-200">
        <input
          type="text"
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 px-4 py-2 border border-slate-300 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 transition-all shadow-lg shadow-indigo-500/25">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// --- 管理ページ本体 ---
const ManagementTab = () => {
  const [filterOwnerId, setFilterOwnerId] = useState('')
  const [filterPropertyId, setFilterPropertyId] = useState('')
  const [activeSubTab, setActiveSubTab] = useState(0)

  const subTabs = [
    {label: '必要書類', icon: <FileText className="w-4 h-4" />},
    {label: 'タスク管理', icon: <ClipboardList className="w-4 h-4" />},
    {label: 'トラブル・連絡事例', icon: <AlertTriangle className="w-4 h-4" />},
    {label: 'チャットルーム', icon: <MessageCircle className="w-4 h-4" />},
  ]

  return (
    <div>
      {/* オーナー・物件フィルタ（オプション） */}
      <ManagementFilterBar
        ownerId={filterOwnerId}
        onOwnerChange={setFilterOwnerId}
        propertyId={filterPropertyId}
        onPropertyChange={setFilterPropertyId}
      />

      {/* サブタブ */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {subTabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveSubTab(i)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeSubTab === i
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* サブタブコンテンツ */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-h-[300px]">
        {activeSubTab === 0 && <DocumentSubTab ownerId={filterOwnerId} propertyId={filterPropertyId} />}
        {activeSubTab === 1 && <TaskSubTab ownerId={filterOwnerId} propertyId={filterPropertyId} />}
        {activeSubTab === 2 && <CommunicationSubTab ownerId={filterOwnerId} propertyId={filterPropertyId} />}
        {activeSubTab === 3 && <ChatSubTab ownerId={filterOwnerId} propertyId={filterPropertyId} />}
      </div>
    </div>
  )
}

// =============================================================================
// メインページ
// =============================================================================

const MAIN_TABS = [
  {label: 'オーナー一覧', icon: <Users className="w-4 h-4" />},
  {label: '物件管理', icon: <Building2 className="w-4 h-4" />},
  {label: '管理ページ', icon: <ClipboardList className="w-4 h-4" />},
]

const EarthOwnerManagementPage = () => {
  const [showSplash, setShowSplash] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* ロゴ */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">Earth Design</h1>
                <p className="text-[10px] text-indigo-200 leading-tight">賃貸オーナー管理</p>
              </div>
            </div>

            {/* デスクトップタブ */}
            <nav className="hidden md:flex items-center gap-1">
              {MAIN_TABS.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === i
                      ? 'bg-white/20 text-white'
                      : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* モバイルメニュー */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-white/10 rounded-lg">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* モバイルメニュードロップダウン */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 px-4 py-2 bg-indigo-700/50 backdrop-blur-sm">
            {MAIN_TABS.map((tab, i) => (
              <button
                key={i}
                onClick={() => {setActiveTab(i); setMobileMenuOpen(false)}}
                className={`flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg mb-1 transition-colors ${
                  activeTab === i ? 'bg-white/20 text-white' : 'text-indigo-200 hover:bg-white/10'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 0 && <OwnerListTab />}
        {activeTab === 1 && <PropertyTab />}
        {activeTab === 2 && <ManagementTab />}
      </main>
    </div>
  )
}

export default EarthOwnerManagementPage
