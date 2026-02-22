'use client'

// このファイルはモックであり、単一ファイルに収まるよう構築されています。
// 本番プロジェクトでは、プロジェクトの設計やルールに従ってページやコンポーネントを分割してください。

import React, {useState, useEffect, useMemo} from 'react'
import {
  Home,
  Building2,
  Users,
  KeyRound,
  HardHat,
  Handshake,
  Menu,
  X,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Search,
  PanelRightOpen,
  Info,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  CircleDot,
  FileText,
  Wrench,
  Eye,
} from 'lucide-react'
import {SplashScreen, InfoSidebar, type Feature, type TimeEfficiencyItem} from '../_components'

// --- モックデータ -------------------------------------------------

const PROPERTIES = [
  {id: 'P001', name: 'サンプルマンションA', type: 'マンション', address: '東京都渋谷区神南1-1-1', structure: 'RC', builtAt: '2005-03', totalUnits: 24, status: '管理中', ownerName: '山田不動産'},
  {id: 'P002', name: 'アースビル', type: 'ビル', address: '横浜市西区みなとみらい2-2-2', structure: 'SRC', builtAt: '2010-06', totalUnits: 8, status: '管理中', ownerName: '鈴木商事'},
  {id: 'P003', name: '田中邸', type: '戸建', address: '川崎市中原区小杉3-3-3', structure: '木造', builtAt: '1998-09', totalUnits: 1, status: '施工中', ownerName: '田中太郎'},
  {id: 'P004', name: 'グリーンハイツB', type: 'アパート', address: '東京都世田谷区三軒茶屋4-4-4', structure: '木造', builtAt: '2000-11', totalUnits: 12, status: '募集中', ownerName: '佐藤花子'},
  {id: 'P005', name: 'アースレジデンス', type: 'マンション', address: '東京都目黒区自由が丘5-5-5', structure: 'RC', builtAt: '2018-04', totalUnits: 36, status: '管理中', ownerName: '(株)アース'},
  {id: 'P006', name: '鈴木邸', type: '戸建', address: '横浜市青葉区美しが丘6-6-6', structure: '木造', builtAt: '2020-08', totalUnits: 1, status: '売出中', ownerName: '鈴木一郎'},
]

const CUSTOMERS = [
  {id: 'C001', name: '山田太郎', type: '個人', phone: '090-1234-5678', email: 'yamada@example.com', status: '商談中', interest: ['売買', 'リフォーム'], assignee: '佐藤'},
  {id: 'C002', name: '(株)サンプル不動産', type: '法人', phone: '03-1234-5678', email: 'info@sample.com', status: '管理中', interest: ['管理'], assignee: '田中'},
  {id: 'C003', name: '鈴木花子', type: '個人', phone: '080-9876-5432', email: 'suzuki@example.com', status: 'リード', interest: ['賃貸'], assignee: '佐藤'},
  {id: 'C004', name: '田中一郎', type: '個人', phone: '070-1111-2222', email: 'tanaka@example.com', status: '契約準備', interest: ['売買'], assignee: '高橋'},
  {id: 'C005', name: '(株)グリーンホーム', type: '法人', phone: '045-3333-4444', email: 'green@example.com', status: '契約済', interest: ['建築'], assignee: '田中'},
  {id: 'C006', name: '高橋美咲', type: '個人', phone: '090-5555-6666', email: 'takahashi@example.com', status: '休眠', interest: ['リフォーム'], assignee: '佐藤'},
]

const RENTALS = [
  {id: 'R001', property: 'サンプルマンションA', room: '101', tenant: '山田太郎', rent: 85000, contractEnd: '2026-03-31', status: '入居中', paymentStatus: '入金済'},
  {id: 'R002', property: 'サンプルマンションA', room: '102', tenant: '', rent: 80000, contractEnd: '', status: '空室', paymentStatus: '-'},
  {id: 'R003', property: 'サンプルマンションA', room: '201', tenant: '鈴木花子', rent: 90000, contractEnd: '2026-08-15', status: '入居中', paymentStatus: '未入金'},
  {id: 'R004', property: 'サンプルマンションA', room: '202', tenant: '佐々木健', rent: 88000, contractEnd: '2026-05-20', status: '入居中', paymentStatus: '入金済'},
  {id: 'R005', property: 'アースビル', room: '301', tenant: '田中一郎', rent: 120000, contractEnd: '2027-01-31', status: '入居中', paymentStatus: '入金済'},
  {id: 'R006', property: 'アースビル', room: '302', tenant: '', rent: 115000, contractEnd: '', status: '空室', paymentStatus: '-'},
  {id: 'R007', property: 'グリーンハイツB', room: '101', tenant: '松本大輔', rent: 65000, contractEnd: '2026-06-30', status: '入居中', paymentStatus: '入金済'},
  {id: 'R008', property: 'グリーンハイツB', room: '102', tenant: '', rent: 63000, contractEnd: '', status: '空室', paymentStatus: '-'},
]

const CONSTRUCTIONS = [
  {id: 'W001', name: '田中邸新築工事', type: '新築', property: '田中邸', customer: '田中太郎', amount: 28000000, startAt: '2026-01-15', endAt: '2026-07-31', status: '施工中', progress: 35, assignee: '高橋'},
  {id: 'W002', name: 'サンプルマンションA 外壁塗装', type: '修繕', property: 'サンプルマンションA', customer: '山田不動産', amount: 4500000, startAt: '2026-03-01', endAt: '2026-04-15', status: '施工準備', progress: 0, assignee: '田中'},
  {id: 'W003', name: 'アースビル 3F内装リフォーム', type: 'リフォーム', property: 'アースビル', customer: '鈴木商事', amount: 3200000, startAt: '2026-02-01', endAt: '2026-03-15', status: '施工中', progress: 60, assignee: '佐藤'},
  {id: 'W004', name: 'グリーンハイツB 屋根修繕', type: '修繕', property: 'グリーンハイツB', customer: '佐藤花子', amount: 1800000, startAt: '2025-12-01', endAt: '2026-02-28', status: '完了検査', progress: 95, assignee: '高橋'},
  {id: 'W005', name: '鈴木邸リノベーション', type: 'リフォーム', property: '鈴木邸', customer: '鈴木一郎', amount: 8500000, startAt: '2026-04-01', endAt: '2026-06-30', status: '見積中', progress: 0, assignee: '佐藤'},
]

const BROKERAGES = [
  {id: 'B001', name: 'サンプルマンションA 501売却', type: '売買', property: 'サンプルマンションA', seller: '山田太郎', buyer: '田中一郎', price: 42000000, commission: 1386000, status: '契約準備', assignee: '佐藤'},
  {id: 'B002', name: 'グリーンハイツB 103賃貸', type: '賃貸', property: 'グリーンハイツB', seller: '佐藤花子', buyer: '', price: 63000, commission: 63000, status: '募集中', assignee: '田中'},
  {id: 'B003', name: '鈴木邸売却', type: '売買', property: '鈴木邸', seller: '鈴木一郎', buyer: '', price: 35000000, commission: 1155000, status: '媒介契約中', assignee: '高橋'},
  {id: 'B004', name: 'アースレジデンス 1201賃貸', type: '賃貸', property: 'アースレジデンス', seller: '(株)アース', buyer: '高橋美咲', price: 150000, commission: 150000, status: '申込', assignee: '佐藤'},
]

const ALERTS = [
  {type: 'warning', message: '鈴木花子様 - 家賃未入金（3日超過）', category: '家賃滞納'},
  {type: 'info', message: 'サンプルマンションA 101 - 契約更新まで残り28日', category: '契約更新'},
  {type: 'danger', message: 'グリーンハイツB 屋根修繕 - 工期超過（2日）', category: '工事遅延'},
  {type: 'warning', message: 'サンプルマンションA 102 - 空室65日経過', category: '長期空室'},
  {type: 'info', message: '高橋美咲様 - 最終連絡から16日経過', category: 'フォロー'},
]

const TASKS = [
  {time: '10:00', task: '田中一郎様 - サンプルマンションA 501 内見', type: '仲介'},
  {time: '13:00', task: 'アースビル 3F内装 - 現場確認', type: '現場'},
  {time: '14:30', task: '鈴木邸売却 - 媒介契約書作成', type: '仲介'},
  {time: '16:00', task: '山田不動産様 - 外壁塗装見積説明', type: '現場'},
]

// --- 共通UIコンポーネント -----------------------------------------

const Button = ({children, onClick, variant = 'primary', className = '', type = 'button'}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
  type?: 'button' | 'submit'
}) => {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 shadow-lg shadow-indigo-500/25',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700',
  }
  return (
    <button onClick={onClick} type={type} className={`px-3 py-1.5 text-sm font-semibold rounded-lg flex items-center justify-center transition-all duration-300 ${variantClasses[variant]} ${className}`}>
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
    '管理中': 'bg-green-100 text-green-700',
    '入居中': 'bg-green-100 text-green-700',
    '入金済': 'bg-green-100 text-green-700',
    '契約済': 'bg-green-100 text-green-700',
    '完了': 'bg-green-100 text-green-700',
    '引渡完了': 'bg-green-100 text-green-700',
    '商談中': 'bg-blue-100 text-blue-700',
    '募集中': 'bg-blue-100 text-blue-700',
    '媒介契約中': 'bg-blue-100 text-blue-700',
    '施工中': 'bg-amber-100 text-amber-700',
    '施工準備': 'bg-amber-100 text-amber-700',
    '見積中': 'bg-amber-100 text-amber-700',
    '契約準備': 'bg-violet-100 text-violet-700',
    '申込': 'bg-violet-100 text-violet-700',
    '完了検査': 'bg-cyan-100 text-cyan-700',
    '売出中': 'bg-orange-100 text-orange-700',
    '空室': 'bg-red-100 text-red-700',
    '未入金': 'bg-red-100 text-red-700',
    'リード': 'bg-slate-100 text-slate-700',
    '休眠': 'bg-slate-100 text-slate-500',
  }
  const colors = colorMap[status] || 'bg-slate-100 text-slate-700'
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors}`}>{status}</span>
}

const PageHeader = ({title, actions}: {title: string; actions?: React.ReactNode}) => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-xl md:text-2xl font-bold text-slate-800">{title}</h1>
    {actions && <div className="flex space-x-2">{actions}</div>}
  </div>
)

const DashboardCard = ({title, children, className = ''}: {title: string; children: React.ReactNode; className?: string}) => (
  <div className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-indigo-200 ${className}`}>
    <div className="flex items-center mb-3">
      <h2 className="text-sm md:text-base font-bold text-slate-700">{title}</h2>
    </div>
    <div className="text-slate-600">{children}</div>
  </div>
)

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

// --- ダッシュボードページ -----------------------------------------

const KPICard = ({icon: Icon, label, value, unit, trend, trendValue}: {
  icon: React.ElementType
  label: string
  value: string
  unit: string
  trend: 'up' | 'down'
  trendValue: string
}) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trendValue}
      </div>
    </div>
    <p className="text-xs text-slate-500 mb-1">{label}</p>
    <p className="text-2xl font-bold text-slate-800">{value}<span className="text-sm text-slate-500 ml-1">{unit}</span></p>
  </div>
)

const DashboardPage = () => {
  const totalRent = RENTALS.filter(r => r.status === '入居中').reduce((sum, r) => sum + r.rent, 0)
  const paidRent = RENTALS.filter(r => r.paymentStatus === '入金済').reduce((sum, r) => sum + r.rent, 0)
  const occupancyRate = Math.round((RENTALS.filter(r => r.status === '入居中').length / RENTALS.length) * 100)
  const collectionRate = totalRent > 0 ? Math.round((paidRent / totalRent) * 100) : 0

  return (
    <>
      <PageHeader title="ダッシュボード" />

      {/* KPIカード */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KPICard icon={DollarSign} label="月間売上" value="1,280" unit="万円" trend="up" trendValue="+12%" />
        <KPICard icon={Users} label="商談中案件" value={String(CUSTOMERS.filter(c => c.status === '商談中').length)} unit="件" trend="up" trendValue="+2件" />
        <KPICard icon={Building2} label="入居率" value={String(occupancyRate)} unit="%" trend="down" trendValue="-3%" />
        <KPICard icon={KeyRound} label="家賃回収率" value={String(collectionRate)} unit="%" trend="up" trendValue="+5%" />
        <KPICard icon={HardHat} label="施工中" value={String(CONSTRUCTIONS.filter(c => c.status === '施工中').length)} unit="件" trend="up" trendValue="+1件" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* アラート */}
        <DashboardCard title="アラート">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {ALERTS.map((alert, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                alert.type === 'danger' ? 'bg-red-50 border border-red-200' :
                alert.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                  alert.type === 'danger' ? 'text-red-500' :
                  alert.type === 'warning' ? 'text-amber-500' :
                  'text-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-slate-700">{alert.message}</p>
                  <span className="text-xs text-slate-500">{alert.category}</span>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* 本日のタスク */}
        <DashboardCard title="本日のタスク">
          <div className="space-y-2">
            {TASKS.map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-indigo-50 transition-colors">
                <div className="text-sm font-mono font-bold text-indigo-600 w-14">{task.time}</div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{task.task}</p>
                </div>
                <StatusBadge status={task.type === '仲介' ? '媒介契約中' : '施工中'} />
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* 売上推移 */}
        <DashboardCard title="月間売上推移" className="lg:col-span-2">
          <div className="flex items-end gap-2 h-40 px-2">
            {[
              {month: '9月', value: 980},
              {month: '10月', value: 1120},
              {month: '11月', value: 850},
              {month: '12月', value: 1350},
              {month: '1月', value: 1180},
              {month: '2月', value: 1280},
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-slate-700">{d.value}</span>
                <div
                  className="w-full bg-gradient-to-t from-indigo-500 to-blue-400 rounded-t-lg transition-all duration-500"
                  style={{height: `${(d.value / 1400) * 100}%`}}
                />
                <span className="text-xs text-slate-500">{d.month}</span>
              </div>
            ))}
          </div>
          <p className="text-right text-xs text-slate-400 mt-2">単位: 万円</p>
        </DashboardCard>
      </div>
    </>
  )
}

// --- 物件管理ページ -----------------------------------------------

const PropertyDetailModal = ({isOpen, onClose, property}: {isOpen: boolean; onClose: () => void; property: typeof PROPERTIES[0] | null}) => {
  if (!isOpen || !property) return null
  const relatedRentals = RENTALS.filter(r => r.property === property.name)
  const relatedConstructions = CONSTRUCTIONS.filter(c => c.property === property.name)
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={property.name}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">種別</p>
            <p className="font-bold text-slate-800">{property.type}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">構造</p>
            <p className="font-bold text-slate-800">{property.structure}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">築年月</p>
            <p className="font-bold text-slate-800">{property.builtAt}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">総戸数</p>
            <p className="font-bold text-slate-800">{property.totalUnits}戸</p>
          </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500">住所</p>
          <p className="font-bold text-slate-800 flex items-center gap-1"><MapPin className="w-4 h-4 text-indigo-500" />{property.address}</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500">オーナー</p>
          <p className="font-bold text-slate-800">{property.ownerName}</p>
        </div>

        {relatedRentals.length > 0 && (
          <div>
            <h4 className="font-bold text-slate-700 mb-2 text-sm">部屋一覧</h4>
            <div className="space-y-1">
              {relatedRentals.map(r => (
                <div key={r.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                  <span className="font-medium text-slate-700">{r.room}号室</span>
                  <span className="text-slate-600">{r.tenant || '-'}</span>
                  <span className="text-slate-600">¥{r.rent.toLocaleString()}</span>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedConstructions.length > 0 && (
          <div>
            <h4 className="font-bold text-slate-700 mb-2 text-sm">工事履歴</h4>
            <div className="space-y-1">
              {relatedConstructions.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                  <span className="font-medium text-slate-700">{c.name}</span>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

const PropertyPage = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProperty, setSelectedProperty] = useState<typeof PROPERTIES[0] | null>(null)

  const filtered = useMemo(() => {
    return PROPERTIES.filter(p => {
      const matchesSearch = p.name.includes(search) || p.address.includes(search)
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  return (
    <>
      <PageHeader title="物件管理" actions={<Button><Plus className="w-4 h-4 mr-1" />物件登録</Button>} />
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="物件名・住所で検索..." />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
          <option value="all">すべて</option>
          <option value="管理中">管理中</option>
          <option value="募集中">募集中</option>
          <option value="施工中">施工中</option>
          <option value="売出中">売出中</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
            <tr>
              {['物件名', '種別', '住所', '構造', '総戸数', '状態', '操作'].map(h => (
                <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-indigo-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-3">{p.type}</td>
                <td className="px-4 py-3 text-xs">{p.address}</td>
                <td className="px-4 py-3">{p.structure}</td>
                <td className="px-4 py-3">{p.totalUnits}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex space-x-1">
                    <button onClick={() => setSelectedProperty(p)} className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors" title="詳細"><Eye className="w-4 h-4" /></button>
                    <button className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors" title="編集"><Pencil className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PropertyDetailModal isOpen={!!selectedProperty} onClose={() => setSelectedProperty(null)} property={selectedProperty} />
    </>
  )
}

// --- 顧客管理ページ -----------------------------------------------

const CustomerDetailModal = ({isOpen, onClose, customer}: {isOpen: boolean; onClose: () => void; customer: typeof CUSTOMERS[0] | null}) => {
  if (!isOpen || !customer) return null
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={customer.name}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">区分</p>
            <p className="font-bold text-slate-800">{customer.type}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">ステータス</p>
            <StatusBadge status={customer.status} />
          </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-2">
          <Phone className="w-4 h-4 text-indigo-500" />
          <span className="text-slate-800">{customer.phone}</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-2">
          <Mail className="w-4 h-4 text-indigo-500" />
          <span className="text-slate-800">{customer.email}</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500 mb-1">関心分野</p>
          <div className="flex flex-wrap gap-1">
            {customer.interest.map(i => (
              <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">{i}</span>
            ))}
          </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500">担当者</p>
          <p className="font-bold text-slate-800">{customer.assignee}</p>
        </div>

        {/* 対応履歴（モック） */}
        <div>
          <h4 className="font-bold text-slate-700 mb-2 text-sm">対応履歴</h4>
          <div className="space-y-2">
            {[
              {date: '2026-02-20', action: '電話', note: '物件の条件について確認'},
              {date: '2026-02-15', action: 'メール', note: '物件資料を送付'},
              {date: '2026-02-10', action: '来店', note: '初回ヒアリング実施'},
            ].map((h, i) => (
              <div key={i} className="flex items-start gap-3 p-2 bg-slate-50 rounded-lg text-sm">
                <span className="text-xs text-slate-500 whitespace-nowrap mt-0.5">{h.date}</span>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">{h.action}</span>
                <span className="text-slate-700">{h.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

const CustomerPage = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState<typeof CUSTOMERS[0] | null>(null)

  const filtered = useMemo(() => {
    return CUSTOMERS.filter(c => {
      const matchesSearch = c.name.includes(search) || c.email.includes(search)
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  return (
    <>
      <PageHeader title="顧客管理" actions={<Button><Plus className="w-4 h-4 mr-1" />顧客登録</Button>} />
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="氏名・メールで検索..." />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
          <option value="all">すべて</option>
          <option value="リード">リード</option>
          <option value="商談中">商談中</option>
          <option value="契約準備">契約準備</option>
          <option value="契約済">契約済</option>
          <option value="管理中">管理中</option>
          <option value="休眠">休眠</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
            <tr>
              {['氏名/法人名', '区分', '電話', 'ステータス', '関心分野', '担当', '操作'].map(h => (
                <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-indigo-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                <td className="px-4 py-3">{c.type}</td>
                <td className="px-4 py-3 text-xs">{c.phone}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.interest.map(i => (
                      <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded">{i}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">{c.assignee}</td>
                <td className="px-4 py-3">
                  <div className="flex space-x-1">
                    <button onClick={() => setSelectedCustomer(c)} className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors" title="詳細"><Eye className="w-4 h-4" /></button>
                    <button className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors" title="編集"><Pencil className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CustomerDetailModal isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} customer={selectedCustomer} />
    </>
  )
}

// --- 賃貸管理ページ -----------------------------------------------

const RentalPage = () => {
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const properties = [...new Set(RENTALS.map(r => r.property))]

  const filtered = useMemo(() => {
    return RENTALS.filter(r => {
      const matchesProperty = propertyFilter === 'all' || r.property === propertyFilter
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      return matchesProperty && matchesStatus
    })
  }, [propertyFilter, statusFilter])

  const totalRent = filtered.filter(r => r.status === '入居中').reduce((sum, r) => sum + r.rent, 0)
  const paidRent = filtered.filter(r => r.paymentStatus === '入金済').reduce((sum, r) => sum + r.rent, 0)
  const occupiedCount = filtered.filter(r => r.status === '入居中').length
  const vacantCount = filtered.filter(r => r.status === '空室').length

  return (
    <>
      <PageHeader title="賃貸管理" />

      {/* サマリーカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500">入居中</p>
          <p className="text-2xl font-bold text-green-600">{occupiedCount}<span className="text-sm text-slate-500 ml-1">室</span></p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500">空室</p>
          <p className="text-2xl font-bold text-red-600">{vacantCount}<span className="text-sm text-slate-500 ml-1">室</span></p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500">当月請求額</p>
          <p className="text-2xl font-bold text-slate-800">¥{totalRent.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500">回収済</p>
          <p className="text-2xl font-bold text-indigo-600">¥{paidRent.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={propertyFilter} onChange={e => setPropertyFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
          <option value="all">全物件</option>
          {properties.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
          <option value="all">すべて</option>
          <option value="入居中">入居中</option>
          <option value="空室">空室</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
            <tr>
              {['物件', '部屋', '入居者', '家賃', '契約期限', '状態', '入金'].map(h => (
                <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className={`border-b border-slate-100 transition-colors ${r.status === '空室' ? 'bg-red-50/30' : 'hover:bg-indigo-50/50'}`}>
                <td className="px-4 py-3 font-medium text-slate-800">{r.property}</td>
                <td className="px-4 py-3">{r.room}</td>
                <td className="px-4 py-3">{r.tenant || <span className="text-slate-400">-</span>}</td>
                <td className="px-4 py-3 font-medium">¥{r.rent.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs">{r.contractEnd || '-'}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3">
                  {r.paymentStatus === '-' ? <span className="text-slate-400">-</span> : <StatusBadge status={r.paymentStatus} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// --- 現場管理ページ -----------------------------------------------

const ConstructionDetailModal = ({isOpen, onClose, construction}: {isOpen: boolean; onClose: () => void; construction: typeof CONSTRUCTIONS[0] | null}) => {
  if (!isOpen || !construction) return null
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={construction.name}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">種別</p>
            <p className="font-bold text-slate-800">{construction.type}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">ステータス</p>
            <StatusBadge status={construction.status} />
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">受注金額</p>
            <p className="font-bold text-slate-800">¥{construction.amount.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">担当者</p>
            <p className="font-bold text-slate-800">{construction.assignee}</p>
          </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500 mb-1">工期</p>
          <p className="font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            {construction.startAt} 〜 {construction.endAt}
          </p>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500 mb-2">進捗率</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  construction.progress >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                  construction.progress >= 50 ? 'bg-gradient-to-r from-indigo-400 to-indigo-500' :
                  'bg-gradient-to-r from-amber-400 to-amber-500'
                }`}
                style={{width: `${construction.progress}%`}}
              />
            </div>
            <span className="font-bold text-slate-800 text-lg">{construction.progress}%</span>
          </div>
        </div>

        {/* 工程（モック） */}
        <div>
          <h4 className="font-bold text-slate-700 mb-2 text-sm">工程</h4>
          <div className="space-y-2">
            {[
              {name: '基礎工事', done: construction.progress >= 20},
              {name: '構造体工事', done: construction.progress >= 40},
              {name: '屋根・外壁工事', done: construction.progress >= 60},
              {name: '内装工事', done: construction.progress >= 80},
              {name: '仕上げ・検査', done: construction.progress >= 100},
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg text-sm">
                {step.done
                  ? <CheckCircle className="w-5 h-5 text-green-500" />
                  : <CircleDot className="w-5 h-5 text-slate-300" />
                }
                <span className={step.done ? 'text-slate-700' : 'text-slate-400'}>{step.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

const ConstructionPage = () => {
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedConstruction, setSelectedConstruction] = useState<typeof CONSTRUCTIONS[0] | null>(null)

  const filtered = useMemo(() => {
    return CONSTRUCTIONS.filter(c => {
      const matchesType = typeFilter === 'all' || c.type === typeFilter
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      return matchesType && matchesStatus
    })
  }, [typeFilter, statusFilter])

  return (
    <>
      <PageHeader title="現場管理" actions={<Button><Plus className="w-4 h-4 mr-1" />案件登録</Button>} />
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
          <option value="all">全種別</option>
          <option value="新築">新築</option>
          <option value="リフォーム">リフォーム</option>
          <option value="修繕">修繕</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
          <option value="all">すべて</option>
          <option value="見積中">見積中</option>
          <option value="施工準備">施工準備</option>
          <option value="施工中">施工中</option>
          <option value="完了検査">完了検査</option>
          <option value="完了">完了</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
            <tr>
              {['案件名', '種別', '物件', '受注金額', '工期', '進捗', '状態', '操作'].map(h => (
                <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-indigo-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                <td className="px-4 py-3">{c.type}</td>
                <td className="px-4 py-3">{c.property}</td>
                <td className="px-4 py-3 font-medium">¥{c.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">{c.startAt} 〜 {c.endAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          c.progress >= 80 ? 'bg-green-500' : c.progress >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                        }`}
                        style={{width: `${c.progress}%`}}
                      />
                    </div>
                    <span className="text-xs font-medium">{c.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelectedConstruction(c)} className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors" title="詳細"><Eye className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConstructionDetailModal isOpen={!!selectedConstruction} onClose={() => setSelectedConstruction(null)} construction={selectedConstruction} />
    </>
  )
}

// --- 仲介管理ページ -----------------------------------------------

const BrokeragePage = () => {
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    return BROKERAGES.filter(b => {
      const matchesType = typeFilter === 'all' || b.type === typeFilter
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter
      return matchesType && matchesStatus
    })
  }, [typeFilter, statusFilter])

  return (
    <>
      <PageHeader title="仲介管理" actions={<Button><Plus className="w-4 h-4 mr-1" />案件登録</Button>} />
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
          <option value="all">全種別</option>
          <option value="売買">売買</option>
          <option value="賃貸">賃貸</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
          <option value="all">すべて</option>
          <option value="媒介契約中">媒介契約中</option>
          <option value="募集中">募集中</option>
          <option value="申込">申込</option>
          <option value="契約準備">契約準備</option>
          <option value="契約済">契約済</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
            <tr>
              {['案件名', '種別', '物件', '売主/貸主', '買主/借主', '取引価格', '手数料', 'ステータス', '担当'].map(h => (
                <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id} className="border-b border-slate-100 hover:bg-indigo-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{b.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${b.type === '売買' ? 'bg-violet-100 text-violet-700' : 'bg-cyan-100 text-cyan-700'}`}>{b.type}</span>
                </td>
                <td className="px-4 py-3">{b.property}</td>
                <td className="px-4 py-3">{b.seller}</td>
                <td className="px-4 py-3">{b.buyer || <span className="text-slate-400">未定</span>}</td>
                <td className="px-4 py-3 font-medium">
                  {b.type === '売買' ? `¥${(b.price / 10000).toLocaleString()}万` : `¥${b.price.toLocaleString()}/月`}
                </td>
                <td className="px-4 py-3 text-indigo-600 font-medium">¥{b.commission.toLocaleString()}</td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3">{b.assignee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// --- ナビゲーション・レイアウト ------------------------------------

const navItems = [
  {name: 'ダッシュボード', icon: Home, page: 'dashboard'},
  {name: '物件管理', icon: Building2, page: 'properties'},
  {name: '顧客管理', icon: Users, page: 'customers'},
  {name: '賃貸管理', icon: KeyRound, page: 'rentals'},
  {name: '現場管理', icon: HardHat, page: 'constructions'},
  {name: '仲介管理', icon: Handshake, page: 'brokerages'},
]

// InfoSidebar設定
const EARTH_FEATURES: Feature[] = [
  {
    icon: Building2,
    title: '物件情報の一元管理',
    description: '売買・賃貸・建築すべての物件情報を一つのシステムで管理。物件ごとの工事履歴や入居状況も即座に確認できます。',
    benefit: '物件情報の検索時間を80%短縮',
  },
  {
    icon: Users,
    title: '顧客・商談管理',
    description: '顧客のステータス管理と対応履歴の記録。フォロー漏れを防止し、商談の進捗を可視化します。',
    benefit: '成約率15%向上の実績',
  },
  {
    icon: KeyRound,
    title: '賃貸管理・家賃管理',
    description: '入居者管理から家賃の入金消込、オーナー送金まで一気通貫。滞納の早期検知と契約更新管理を自動化します。',
    benefit: '家賃回収率98%を実現',
  },
  {
    icon: HardHat,
    title: '現場・工事管理',
    description: '新築・リフォーム・修繕の工事案件を工程レベルで管理。進捗の可視化と工期遅延の早期検知を実現します。',
    benefit: '工期遵守率を20%改善',
  },
]

const EARTH_TIME_EFFICIENCY: TimeEfficiencyItem[] = [
  {task: '物件情報の確認', before: '15分', after: '即時表示', saved: '15分/回'},
  {task: '家賃入金の消込', before: '2時間', after: '30分', saved: '90分/月'},
  {task: '月次報告書作成', before: '4時間', after: '自動生成', saved: '4時間/月'},
  {task: '商談進捗の共有', before: '30分', after: '即時共有', saved: '30分/日'},
]

const EARTH_CHALLENGES = [
  'Excel・紙での物件管理に限界を感じている',
  '仲介・管理・建築の情報が分断されている',
  '家賃の入金確認・滞納管理に手間がかかる',
  '工事の進捗が現場に行かないとわからない',
  '顧客へのフォロー漏れが発生している',
]

const Header = ({activePage, setActivePage, onOpenInfo}: {
  activePage: string
  setActivePage: (page: string) => void
  onOpenInfo: () => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                Earth Design
              </h1>
              <p className="text-xs text-slate-400 -mt-0.5">不動産業務管理システム</p>
            </div>
          </div>
          <nav className="hidden lg:flex space-x-1 items-center">
            {navItems.map(item => (
              <button
                key={item.name}
                onClick={() => setActivePage(item.page)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${activePage === item.page
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <item.icon className="w-4 h-4 mr-1.5" />
                <span>{item.name}</span>
              </button>
            ))}
            <button
              onClick={onOpenInfo}
              className="ml-2 p-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
              title="このシステムでできること"
            >
              <PanelRightOpen className="w-4 h-4" />
              <span className="text-sm font-medium">機能説明</span>
            </button>
          </nav>
          <div className="lg:hidden flex items-center gap-2">
            <button onClick={onOpenInfo} className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg" title="機能説明">
              <Info className="w-5 h-5" />
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu className="w-6 h-6 text-slate-700" />
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white animate-in slide-in-from-top-2 duration-200">
          <nav className="p-2 flex flex-col space-y-1">
            {navItems.map(item => (
              <button
                key={item.name}
                onClick={() => { setActivePage(item.page); setIsOpen(false) }}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300
                  ${activePage === item.page
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <item.icon className="w-5 h-5 mr-2" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

// --- メインアプリ -------------------------------------------------

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [showSplash, setShowSplash] = useState(true)
  const [showInfoSidebar, setShowInfoSidebar] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen theme="blue" systemName="Earth Design" subtitle="不動産業務管理システム" />
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage />
      case 'properties': return <PropertyPage />
      case 'customers': return <CustomerPage />
      case 'rentals': return <RentalPage />
      case 'constructions': return <ConstructionPage />
      case 'brokerages': return <BrokeragePage />
      default: return <DashboardPage />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 font-sans text-slate-800">
      <Header activePage={activePage} setActivePage={setActivePage} onOpenInfo={() => setShowInfoSidebar(true)} />
      <InfoSidebar
        isOpen={showInfoSidebar}
        onClose={() => setShowInfoSidebar(false)}
        theme="blue"
        systemIcon={Building2}
        systemName="不動産業務管理"
        systemDescription="不動産仲介・賃貸管理・建築工事を一元管理するシステムです。業務間の情報連携で、効率的な不動産経営を実現します。"
        features={EARTH_FEATURES}
        timeEfficiency={EARTH_TIME_EFFICIENCY}
        challenges={EARTH_CHALLENGES}
      />
      <main className="p-4 md:p-6 container mx-auto">{renderPage()}</main>
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200 py-4 mt-8">
        <div className="container mx-auto text-center text-xs text-slate-400">
          <p>Earth Design - Demo System</p>
        </div>
      </footer>
    </div>
  )
}
