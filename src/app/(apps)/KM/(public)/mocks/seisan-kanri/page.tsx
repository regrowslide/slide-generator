'use client'

// 💡
// 「こちらはモックであり、単一ファイルに収まるよう構築されています。このページは最終的に削除するため、本番プロジェクトでは、プロジェクトの設計やルールに従ってページやコンポーネントを分割してください」。

import React, {useState, useEffect, useMemo, useCallback} from 'react'
import {
  AlertTriangle,
  CheckCircle,
  Wrench,
  Calendar,
  Home,
  Box,
  ClipboardList,
  Factory,
  Menu,
  X,
  Plus,
  Pencil,
  Trash2,
  History,
  Loader2,
  BarChart3,
  Package,
  PanelRightOpen,
  Info,
} from 'lucide-react'
import { SplashScreen, InfoSidebar, Feature, TimeEfficiencyItem } from '../_components'

// --- Sample Data --------------------------------------------------
// 製品名・原材料名を一般化

const initialProducts = [
  // 危険水域になるように調整 (余裕在庫を多く設定)
  {
    id: 'PD001',
    name: '製品A',
    color: 'タイプ1',
    recipe: [
      {rawMaterialId: 'RM001', amount: 2},
      {rawMaterialId: 'RM002', amount: 5},
    ],
    cost: 1200,
    productionCapacity: 10,
    allowanceStock: 3000,
  },
  // 安全水域になるように調整
  {
    id: 'PD002',
    name: '製品A',
    color: 'タイプ2',
    recipe: [
      {rawMaterialId: 'RM001', amount: 2},
      {rawMaterialId: 'RM003', amount: 3},
    ],
    cost: 800,
    productionCapacity: 15,
    allowanceStock: 100,
  },
  {
    id: 'PD003',
    name: '製品B',
    color: 'タイプ1',
    recipe: [{rawMaterialId: 'RM004', amount: 10}],
    cost: 500,
    productionCapacity: 20,
    allowanceStock: 80,
  },
  {id: 'PD004', name: '製品C', color: 'タイプ1', recipe: [], cost: 2000, productionCapacity: 5, allowanceStock: 20},
  {
    id: 'PD005',
    name: '製品D',
    color: 'タイプ1',
    recipe: [
      {rawMaterialId: 'RM001', amount: 3},
      {rawMaterialId: 'RM004', amount: 8},
    ],
    cost: 950,
    productionCapacity: 12,
    allowanceStock: 70,
  },
]
const initialRawMaterials = [
  // 安全水域
  {id: 'RM001', category: '基礎素材', name: '素材A', unit: 'g', cost: 50, safetyStock: 1000},
  // 危険水域になるように調整
  {id: 'RM002', category: '部品', name: '素材B', unit: '個', cost: 200, safetyStock: 200},
  {id: 'RM003', category: '部品', name: '素材C', unit: '個', cost: 120, safetyStock: 500},
  {id: 'RM004', category: '基材', name: '素材D', unit: 'g', cost: 20, safetyStock: 5000},
]
const initialOrders = [
  {id: 'SO001', orderDate: '2025-09-10', productId: 'PD001', quantity: 30, amount: 36000},
  {id: 'SO002', orderDate: '2024-09-15', productId: 'PD001', quantity: 25, amount: 30000},
  {id: 'SO003', orderDate: '2023-09-12', productId: 'PD001', quantity: 28, amount: 33600},
  {id: 'SO004', orderDate: '2025-09-05', productId: 'PD002', quantity: 50, amount: 40000},
  {id: 'SO005', orderDate: '2024-09-08', productId: 'PD002', quantity: 60, amount: 48000},
  {id: 'SO006', orderDate: '2023-09-20', productId: 'PD002', quantity: 55, amount: 44000},
  {
    id: 'SO007',
    orderDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-02`,
    productId: 'PD001',
    quantity: 10,
    amount: 12000,
  },
  {
    id: 'SO008',
    orderDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-05`,
    productId: 'PD002',
    quantity: 20,
    amount: 16000,
  },
]
const initialProductions = [
  {
    id: 'PR001',
    productionDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
    productId: 'PD001',
    quantity: 15,
    type: 'タイプ1',
  },
  {
    id: 'PR002',
    productionDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
    productId: 'PD002',
    quantity: 20,
    type: 'タイプ1',
  },
  {
    id: 'PR003',
    productionDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-03`,
    productId: 'PD001',
    quantity: 10,
    type: 'タイプ1',
  },
  {
    id: 'PR004',
    productionDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-04`,
    productId: 'PD004',
    quantity: 5,
    type: 'タイプ2',
  },
]
const initialStockAdjustments = [
  {id: 'SA001', rawMaterialId: 'RM001', date: '2025-08-20', reason: '入荷', quantity: 10000},
  // 危険水域になるように入荷数を調整
  {id: 'SA002', rawMaterialId: 'RM002', date: '2025-08-20', reason: '入荷', quantity: 300},
  {id: 'SA003', rawMaterialId: 'RM003', date: '2025-08-20', reason: '入荷', quantity: 2000},
  {id: 'SA004', rawMaterialId: 'RM004', date: '2025-08-20', reason: '入荷', quantity: 20000},
  {id: 'SA005', rawMaterialId: 'RM001', date: '2025-09-05', reason: '廃棄', quantity: -50},
]
const companyHolidays = [
  `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-16`,
  `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-23`,
]
const PRODUCTION_SETTINGS = {
  staffCount: 3,
  workHours: 8,
}

// --- Types --------------------------------------------------------
interface RecipeItem {
  rawMaterialId: string
  amount: number
}

interface Product {
  id: string
  name: string
  color: string
  recipe: RecipeItem[]
  cost: number
  productionCapacity: number
  allowanceStock: number
}

interface RawMaterial {
  id: string
  category: string
  name: string
  unit: string
  cost: number
  safetyStock: number
}

interface Order {
  id: string
  orderDate: string
  productId: string
  quantity: number
  amount: number
}

interface Production {
  id: string
  productionDate: string
  productId: string
  quantity: number
  type: string
}

interface StockAdjustment {
  id: string
  rawMaterialId: string
  date: string
  reason: string
  quantity: number
}

interface CalendarDay {
  day: number | null
  dateString?: string
  isCurrentMonth?: boolean
  isToday?: boolean
  isHoliday?: boolean
  isPast?: boolean
  plans?: DailyPlan[]
}

interface DailyPlan extends Product {
  dailyTarget: number
  dailyCapacity: number
  isRisky: boolean
  monthlyProductionTarget: number
  cumulativeProduction: number
  businessDaysRemaining: number
  staffCount: number
  actualProduction: number
}

interface AppData {
  products: Product[]
  rawMaterials: RawMaterial[]
  orders: Order[]
  productions: Production[]
  stockAdjustments: StockAdjustment[]
  dailyStaffAssignments: Record<string, Record<string, number>>
  productHandlers: {
    add: (item: Partial<Product>) => void
    update: (item: Product) => void
    delete: (id: string) => void
  }
  materialHandlers: {
    add: (item: Partial<RawMaterial>) => void
    update: (item: RawMaterial) => void
    delete: (id: string) => void
  }
  orderHandlers: {
    add: (item: Partial<Order>) => void
    update: (item: Order) => void
    delete: (id: string) => void
  }
  productionHandlers: {
    add: (item: Partial<Production>) => void
    update: (item: Production) => void
    delete: (id: string) => void
  }
  adjustmentHandlers: {
    add: (item: Partial<StockAdjustment>) => void
    update: (item: StockAdjustment) => void
    delete: (id: string) => void
  }
}

// --- Common UI Components ----------------------------------------
const Spinner = () => (
  <div className="flex items-center justify-center">
    <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
  </div>
)

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const Button: React.FC<ButtonProps> = ({children, onClick, variant = 'primary', className = '', type = 'button'}) => {
  const baseClasses = 'px-3 py-1.5 text-sm font-semibold rounded-lg flex items-center justify-center transition-all duration-300'
  const variantClasses = {
    primary: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25',
  }
  return (
    <button onClick={onClick} type={type} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </button>
  )
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'lg' | 'xl' | '2xl' | '4xl'
}

const Modal: React.FC<ModalProps> = ({isOpen, onClose, title, children, size = 'lg'}) => {
  if (!isOpen) return null
  const sizeClasses = {
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  }
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start p-4 pt-16 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col animate-in slide-in-from-top-4 duration-300`}
        onClick={e => e.stopPropagation()}
      >
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

interface FormFieldProps {
  label: string
  children: React.ReactNode
}

const FormField: React.FC<FormFieldProps> = ({label, children}) => (
  <div className="mb-3">
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    {children}
  </div>
)

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = props => (
  <input
    {...props}
    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all"
  />
)

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

const Select: React.FC<SelectProps> = ({children, ...props}) => (
  <select
    {...props}
    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition-all"
  >
    {children}
  </select>
)

interface PageHeaderProps {
  title: string
  actions?: React.ReactNode
}

const PageHeader: React.FC<PageHeaderProps> = ({title, actions}) => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-xl md:text-2xl font-bold text-slate-800">{title}</h1>
    {actions && <div className="flex space-x-2">{actions}</div>}
  </div>
)

// --- Data Management Custom Hooks --------------------------------
function useCrudManager<T extends { id: string }>(initialData: T[]) {
  const [items, setItems] = useState(initialData)
  const addItem = (item: Partial<T>) => setItems(prev => [...prev, {...item, id: `NEW_${Date.now()}`} as T])
  const updateItem = (updatedItem: T) => setItems(prev => prev.map(item => (item.id === updatedItem.id ? updatedItem : item)))
  const deleteItem = (id: string) => {
    if (typeof window !== 'undefined' && window.confirm('本当に削除しますか？')) {
      setItems(prev => prev.filter(item => item.id !== id))
    }
  }
  return {items, addItem, updateItem, deleteItem}
}

const useStockCalculator = (products: Product[], productions: Production[], stockAdjustments: StockAdjustment[]) => {
  const calculateUsedStock = useCallback(
    (rawMaterialId: string) => {
      return productions
        .filter(p => p.type === 'タイプ1')
        .reduce((sum, p) => {
          const product = products.find(prod => prod.id === p.productId)
          const recipeItem = product?.recipe.find(r => r.rawMaterialId === rawMaterialId)
          return sum + (recipeItem ? recipeItem.amount * p.quantity : 0)
        }, 0)
    },
    [products, productions]
  )

  const calculateAdjustedStock = useCallback(
    (rawMaterialId: string) => {
      return stockAdjustments.filter(adj => adj.rawMaterialId === rawMaterialId).reduce((sum, adj) => sum + adj.quantity, 0)
    },
    [stockAdjustments]
  )

  const calculateCurrentStock = useCallback(
    (rawMaterialId: string) => {
      const totalAdjusted = calculateAdjustedStock(rawMaterialId)
      const totalUsed = calculateUsedStock(rawMaterialId)
      return totalAdjusted - totalUsed
    },
    [calculateAdjustedStock, calculateUsedStock]
  )

  return {calculateCurrentStock, calculateUsedStock, calculateAdjustedStock}
}

// --- Dashboard Page Components -----------------------------------
const useProductionDashboard = (
  products: Product[],
  rawMaterials: RawMaterial[],
  orders: Order[],
  productions: Production[],
  stockAdjustments: StockAdjustment[],
  dailyStaffAssignments: Record<string, Record<string, number>>
) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {calculateCurrentStock} = useStockCalculator(products, productions, stockAdjustments)
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const currentDate = today.getDate()
  const todayString = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDate).padStart(2, '0')}`

  const dashboardData = useMemo(() => {
    try {
      const productStockStatus = products.map(product => {
        const totalProduction = productions.filter(p => p.productId === product.id).reduce((sum, p) => sum + p.quantity, 0)
        const totalOrders = orders.filter(o => o.productId === product.id).reduce((sum, o) => sum + o.quantity, 0)
        const currentStock = totalProduction - totalOrders
        return {...product, currentStock, isAlert: currentStock < product.allowanceStock}
      })

      const rawMaterialStockStatus = rawMaterials.map(rm => {
        const currentStock = calculateCurrentStock(rm.id)
        return {...rm, currentStock, isAlert: currentStock < rm.safetyStock}
      })

      const monthlyPlans = products.map(product => {
        const pastOrders = orders.filter(
          o =>
            o.productId === product.id &&
            new Date(o.orderDate).getMonth() + 1 === currentMonth &&
            new Date(o.orderDate).getFullYear() < currentYear
        )
        const demandForecast = pastOrders.length > 0 ? Math.ceil(pastOrders.reduce((sum, o) => sum + o.quantity, 0) / 3) : 30
        return {
          ...product,
          monthlyProductionTarget: demandForecast + product.allowanceStock,
        }
      })

      const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay()
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
      const calendarDays: CalendarDay[] = []
      for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push({day: null})

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth - 1, day)
        const dateString = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const dayOfWeek = date.getDay()
        const isHoliday = dayOfWeek === 0 || dayOfWeek === 6 || companyHolidays.includes(dateString)
        const isPast = day < currentDate

        let dailyPlans: DailyPlan[] = []
        if (!isHoliday) {
          const businessDaysRemaining = Array.from({length: daysInMonth - day + 1}, (_, i) => day + i).filter(d => {
            const dt = new Date(currentYear, currentMonth - 1, d)
            const dStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const dw = dt.getDay()
            return dw !== 0 && dw !== 6 && !companyHolidays.includes(dStr)
          }).length

          dailyPlans = monthlyPlans.map(product => {
            const productionsUpToDay = productions
              .filter(p => p.productId === product.id && new Date(p.productionDate) < date)
              .reduce((sum, p) => sum + p.quantity, 0)

            const remainingTarget = product.monthlyProductionTarget - productionsUpToDay
            const dailyTarget = businessDaysRemaining > 0 ? Math.max(0, Math.ceil(remainingTarget / businessDaysRemaining)) : 0

            const staffCountForDay = dailyStaffAssignments[dateString]?.[product.id] || PRODUCTION_SETTINGS.staffCount
            const dailyCapacity = staffCountForDay * PRODUCTION_SETTINGS.workHours * product.productionCapacity

            const productionsOnDate = productions
              .filter(p => p.productId === product.id && p.productionDate === dateString)
              .reduce((sum, p) => sum + p.quantity, 0)

            return {
              ...product,
              dailyTarget,
              dailyCapacity,
              isRisky: dailyTarget > dailyCapacity,
              monthlyProductionTarget: product.monthlyProductionTarget,
              cumulativeProduction: productionsUpToDay,
              businessDaysRemaining,
              staffCount: staffCountForDay,
              actualProduction: productionsOnDate,
            }
          })
        }

        calendarDays.push({
          day,
          dateString,
          isCurrentMonth: true,
          isToday: day === currentDate,
          isHoliday,
          isPast,
          plans: dailyPlans,
        })
      }

      return {
        todayPlan: calendarDays.find(d => d.dateString === todayString)?.plans || [],
        productStockStatus,
        rawMaterialStockStatus,
        calendarData: {year: currentYear, month: currentMonth, days: calendarDays},
      }
    } catch (e) {
      console.error(e)
      setError('データの計算中にエラーが発生しました。')
      return {
        todayPlan: [],
        productStockStatus: [],
        rawMaterialStockStatus: [],
        calendarData: {year: currentYear, month: currentMonth, days: []},
      }
    }
  }, [
    products,
    rawMaterials,
    orders,
    productions,
    calculateCurrentStock,
    currentYear,
    currentMonth,
    currentDate,
    dailyStaffAssignments,
    todayString,
  ])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])
  return {loading, error, ...dashboardData}
}

const DashboardCard = ({title, children, className = ''}) => (
  <div className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-teal-200 ${className}`}>
    <div className="flex items-center mb-3">
      <h2 className="text-sm md:text-base font-bold text-slate-700">{title}</h2>
    </div>
    <div className="text-slate-600">{children}</div>
  </div>
)

const InventoryStatus = ({items, title, thresholdKey}) => (
  <DashboardCard title={title}>
    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
      {items.map(item => {
        const percentage = Math.min(100, (item.currentStock / item[thresholdKey]) * 100)
        const isAlert = item.isAlert
        return (
          <div
            key={item.id}
            className={`p-3 rounded-lg text-xs md:text-sm transition-all duration-300 ${isAlert ? 'bg-red-50 border border-red-200' : 'bg-slate-50 hover:bg-teal-50'}`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-slate-700">
                {item.name}
                {item.color ? ` (${item.color})` : ''}
              </span>
              <div className="text-right">
                <span className={`font-bold ${isAlert ? 'text-red-600' : 'text-slate-800'}`}>
                  {item.currentStock.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">
                  {' '} / {item[thresholdKey].toLocaleString()}
                  {item.unit || '枚'}
                </span>
              </div>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isAlert ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-teal-400 to-teal-500'}`}
                style={{ width: `${Math.max(5, percentage)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  </DashboardCard>
)

const DailyDetailModal = ({isOpen, onClose, dateString, plans, onUpdateStaff}) => {
  const [localStaffCounts, setLocalStaffCounts] = useState({})

  useEffect(() => {
    if (isOpen && plans) {
      const counts = {}
      plans.forEach(p => {
        counts[p.id] = p.staffCount
      })
      setLocalStaffCounts(counts)
    }
  }, [isOpen, plans])

  if (!isOpen) return null

  const handleStaffChange = (productId, count) => {
    const newCount = parseInt(count, 10)
    if (isNaN(newCount) || newCount < 0) return
    setLocalStaffCounts(prev => ({...prev, [productId]: newCount}))
    onUpdateStaff(dateString, productId, newCount)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${dateString} 生産計画詳細`} size="4xl">
      <div className="space-y-4">
        {plans.map(plan => (
          <div key={plan.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-md text-slate-800 mb-3">
              {plan.name} ({plan.color})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">月間生産目標</p>
                <p className="font-bold text-slate-800">{plan.monthlyProductionTarget.toLocaleString()} 枚</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">累計生産実績</p>
                <p className="font-bold text-slate-800">{plan.cumulativeProduction.toLocaleString()} 枚</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">残稼働日</p>
                <p className="font-bold text-slate-800">{plan.businessDaysRemaining} 日</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-teal-200 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">日次生産目標</p>
                <p className="font-bold text-teal-600">{plan.dailyTarget.toLocaleString()} 枚</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">日次生産能力</p>
                <p className="font-bold text-slate-800">{plan.dailyCapacity.toLocaleString()} 枚</p>
              </div>
              <div className={`p-3 rounded-lg border shadow-sm ${plan.isRisky ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <p className="text-xs text-slate-500 mb-1">安全度</p>
                <p className={`font-bold flex items-center gap-1 ${plan.isRisky ? 'text-red-600' : 'text-green-600'}`}>
                  {plan.isRisky ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {plan.isRisky ? '危険' : '安全'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <FormField label="稼働人数設定">
                <Input
                  type="number"
                  value={localStaffCounts[plan.id] || ''}
                  onChange={e => handleStaffChange(plan.id, e.target.value)}
                  className="w-24"
                />
              </FormField>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}

const ProductionCalendar = ({calendarData, onDayClick}) => (
  <DashboardCard title="月間生産スケジュール" className="col-span-1 lg:col-span-2">
    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
      <Calendar className="w-5 h-5 text-teal-500" />
      {calendarData.year}年 {calendarData.month}月
    </h3>
    <div className="grid grid-cols-7 gap-1 text-center text-xs">
      {['日', '月', '火', '水', '木', '金', '土'].map((day, idx) => (
        <div key={day} className={`font-semibold p-2 ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-500'}`}>
          {day}
        </div>
      ))}
      {calendarData.days.map((day, index) => (
        <div
          key={index}
          onClick={() => day.day && !day.isHoliday && onDayClick(day.dateString, day.plans)}
          className={`rounded-lg p-1 min-h-[100px] flex flex-col transition-all duration-200
            ${!day.isCurrentMonth ? 'opacity-30' : ''}
            ${day.isToday ? 'bg-teal-100 border-2 border-teal-500 shadow-md' : day.isHoliday ? 'bg-slate-100' : 'bg-white hover:bg-teal-50 cursor-pointer border border-slate-200 hover:border-teal-300'}
          `}
        >
          <span className={`font-semibold text-sm ${day.isToday ? 'text-teal-700' : 'text-slate-700'}`}>{day.day}</span>
          {!day.isHoliday && day.day && (
            <div className="text-xxs flex-grow overflow-y-auto space-y-0.5 mt-1 text-left">
              {day.isPast
                ? day.plans
                    .filter(p => p.actualProduction > 0)
                    .map(plan => (
                      <div key={plan.id} className="flex items-center bg-slate-200 px-1 py-0.5 rounded text-xs">
                        <span className="truncate flex-1 text-slate-600">
                          {plan.name}({plan.color})
                        </span>{' '}
                        <span className="font-bold text-slate-800 ml-1">{plan.actualProduction}</span>
                      </div>
                    ))
                : day.plans.map(plan => (
                    <div key={plan.id} className={`flex items-center text-xs px-1 py-0.5 rounded ${plan.isRisky ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                      {plan.isRisky && <AlertTriangle className="w-3 h-3 text-red-500 mr-1 flex-shrink-0" />}
                      <span className="truncate">
                        {plan.name}({plan.color})
                      </span>
                    </div>
                  ))}
            </div>
          )}
        </div>
      ))}
    </div>
  </DashboardCard>
)

const ProductionDashboardPage = ({appData, onUpdateStaff}) => {
  const {products, rawMaterials, orders, productions, stockAdjustments, dailyStaffAssignments} = appData
  const {loading, error, rawMaterialStockStatus, calendarData} = useProductionDashboard(
    products,
    rawMaterials,
    orders,
    productions,
    stockAdjustments,
    dailyStaffAssignments
  )

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedPlans, setSelectedPlans] = useState([])

  const handleDayClick = (dateString, plans) => {
    setSelectedDate(dateString)
    setSelectedPlans(plans)
    setIsDetailModalOpen(true)
  }
  const handleCloseDetailModal = () => setIsDetailModalOpen(false)

  if (loading)
    return (
      <div className="w-full flex items-center justify-center p-12">
        <Spinner />
      </div>
    )
  if (error)
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 text-red-600">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <h2 className="text-lg font-bold">エラー発生</h2>
        <p>{error}</p>
      </div>
    )

  return (
    <>
      <PageHeader title="生産管理ダッシュボード" />
      <div className="grid grid-cols-1 gap-6">
        <ProductionCalendar calendarData={calendarData} onDayClick={handleDayClick} />
        <InventoryStatus items={rawMaterialStockStatus} title="原材料在庫状況" thresholdKey="safetyStock" />
      </div>
      <DailyDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        dateString={selectedDate}
        plans={selectedPlans}
        onUpdateStaff={onUpdateStaff}
      />
    </>
  )
}

// --- Product Master Page Components ------------------------------
const ProductForm = ({product, onSave, onCancel, rawMaterials}) => {
  const [formData, setFormData] = useState(
    product || {name: '', color: '', cost: 0, productionCapacity: 0, allowanceStock: 0, recipe: []}
  )
  const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value})
  const handleRecipeChange = (index, field, value) => {
    const newRecipe = [...formData.recipe]
    newRecipe[index][field] = value
    setFormData({...formData, recipe: newRecipe})
  }
  const addRecipeItem = () => setFormData({...formData, recipe: [...formData.recipe, {rawMaterialId: '', amount: 0}]})
  const removeRecipeItem = index => setFormData({...formData, recipe: formData.recipe.filter((_, i) => i !== index)})
  const handleSubmit = e => {
    e.preventDefault()
    onSave(formData)
  }
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="商品名">
          <Input name="name" value={formData.name} onChange={handleChange} required />
        </FormField>
        <FormField label="タイプ">
          <Input name="color" value={formData.color} onChange={handleChange} />
        </FormField>
        <FormField label="コスト（税抜）">
          <Input type="number" name="cost" value={formData.cost} onChange={handleChange} required />
        </FormField>
        <FormField label="生産能力(枚/人·時)">
          <Input type="number" name="productionCapacity" value={formData.productionCapacity} onChange={handleChange} required />
        </FormField>
        <FormField label="余裕在庫数(枚)">
          <Input type="number" name="allowanceStock" value={formData.allowanceStock} onChange={handleChange} required />
        </FormField>
      </div>
      <div className="mt-6">
        <h4 className="text-md font-bold text-slate-700 mb-3">原材料レシピ</h4>
        {formData.recipe.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <Select
              value={item.rawMaterialId}
              onChange={e => handleRecipeChange(index, 'rawMaterialId', e.target.value)}
              className="flex-1"
            >
              <option value="">原材料を選択</option>
              {rawMaterials.map(rm => (
                <option key={rm.id} value={rm.id}>
                  {rm.name}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              value={item.amount}
              onChange={e => handleRecipeChange(index, 'amount', e.target.value)}
              className="w-24"
              placeholder="使用量"
            />
            <Button variant="danger" onClick={() => removeRecipeItem(index)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button variant="secondary" onClick={addRecipeItem}>
          <Plus className="w-4 h-4 mr-1" />
          レシピ追加
        </Button>
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" variant="primary">
          保存
        </Button>
      </div>
    </form>
  )
}

const ProductMasterPage = ({appData}) => {
  const {products, rawMaterials, productHandlers} = appData
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const handleOpenModal = (product = null) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }
  const handleSave = product => {
    if (product.id) {
      productHandlers.update(product)
    } else {
      productHandlers.add(product)
    }
    handleCloseModal()
  }
  return (
    <>
      <PageHeader
        title="商品マスター"
        actions={
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-1" />
            新規登録
          </Button>
        }
      />
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
            <tr>
              {['商品名', 'タイプ', 'コスト', '生産能力', '余裕在庫', '操作'].map(h => (
                <th key={h} className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-teal-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-3">{p.color}</td>
                <td className="px-4 py-3">¥{p.cost.toLocaleString()}</td>
                <td className="px-4 py-3">{p.productionCapacity}枚</td>
                <td className="px-4 py-3">{p.allowanceStock}枚</td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button onClick={() => handleOpenModal(p)} className="p-1.5 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => productHandlers.delete(p.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? '商品編集' : '商品登録'}>
        <ProductForm product={editingProduct} onSave={handleSave} onCancel={handleCloseModal} rawMaterials={rawMaterials} />
      </Modal>
    </>
  )
}

// --- Raw Material Master Page Components -------------------------
const StockHistoryModal = ({isOpen, onClose, material, history, onAddHistory, used}) => {
  const [formData, setFormData] = useState({date: new Date().toISOString().slice(0, 10), reason: '入荷', quantity: ''})
  if (!isOpen) return null

  const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value})
  const handleSubmit = e => {
    e.preventDefault()
    const quantity = parseInt(formData.quantity, 10)
    if (isNaN(quantity) || quantity === 0) return
    onAddHistory({
      rawMaterialId: material.id,
      date: formData.date,
      reason: formData.reason,
      quantity: formData.reason === '入荷' ? quantity : -quantity,
    })
    setFormData({date: new Date().toISOString().slice(0, 10), reason: '入荷', quantity: ''})
  }

  const combinedHistory = [
    ...history.map(h => ({...h, type: 'adjustment'})),
    {date: '期間中合計', reason: '生産消費', quantity: -used, type: 'production'},
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`在庫増減履歴: ${material.name}`} size="2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h4 className="font-bold text-slate-700 mb-3">履歴一覧</h4>
          <div className="border border-slate-200 rounded-lg max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  {['日付', '理由', '変動量'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-slate-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {combinedHistory.map((item, i) => (
                  <tr key={item.id || `prod-${i}`} className="border-b border-slate-100">
                    <td className="px-3 py-2 text-slate-700">{item.date}</td>
                    <td className="px-3 py-2 text-slate-700">{item.reason}</td>
                    <td className={`px-3 py-2 font-bold ${item.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.quantity > 0 ? `+${item.quantity.toLocaleString()}` : item.quantity.toLocaleString()} {material.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-slate-700 mb-3">在庫の手動登録</h4>
          <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <FormField label="日付">
              <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </FormField>
            <FormField label="理由">
              <Select name="reason" value={formData.reason} onChange={handleChange}>
                <option>入荷</option>
                <option>廃棄</option>
                <option>サンプル使用</option>
                <option>棚卸差異</option>
              </Select>
            </FormField>
            <FormField label="数量">
              <Input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                placeholder="入荷は正、その他は負で入力"
              />
            </FormField>
            <Button type="submit" variant="primary" className="w-full mt-2">
              履歴を登録
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  )
}

const RawMaterialForm = ({material, onSave, onCancel}) => {
  const [formData, setFormData] = useState(material || {name: '', category: '', unit: 'g', cost: 0, safetyStock: 0})
  const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value})
  const handleSubmit = e => {
    e.preventDefault()
    onSave(formData)
  }
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="名称">
          <Input name="name" value={formData.name} onChange={handleChange} required />
        </FormField>
        <FormField label="カテゴリ">
          <Input name="category" value={formData.category} onChange={handleChange} />
        </FormField>
        <FormField label="単位">
          <Select name="unit" value={formData.unit} onChange={handleChange}>
            <option>g</option>
            <option>個</option>
          </Select>
        </FormField>
        <FormField label="コスト（税抜）">
          <Input type="number" name="cost" value={formData.cost} onChange={handleChange} required />
        </FormField>
        <FormField label="安全在庫数">
          <Input type="number" name="safetyStock" value={formData.safetyStock} onChange={handleChange} required />
        </FormField>
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" variant="primary">
          保存
        </Button>
      </div>
    </form>
  )
}

const RawMaterialMasterPage = ({appData}: {appData: AppData}) => {
  const {products, productions, rawMaterials, stockAdjustments, materialHandlers, adjustmentHandlers} = appData
  const {calculateCurrentStock, calculateUsedStock} = useStockCalculator(products, productions, stockAdjustments)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null)

  const handleOpenFormModal = (material: RawMaterial | null = null) => {
    setSelectedMaterial(material)
    setIsFormModalOpen(true)
  }
  const handleCloseFormModal = () => {
    setSelectedMaterial(null)
    setIsFormModalOpen(false)
  }
  const handleOpenHistoryModal = material => {
    setSelectedMaterial(material)
    setIsHistoryModalOpen(true)
  }
  const handleCloseHistoryModal = () => {
    setSelectedMaterial(null)
    setIsHistoryModalOpen(false)
  }

  const handleSave = material => {
    if (material.id) {
      materialHandlers.update(material)
    } else {
      materialHandlers.add(material)
    }
    handleCloseFormModal()
  }

  return (
    <>
      <PageHeader
        title="原材料マスター"
        actions={
          <Button onClick={() => handleOpenFormModal()}>
            <Plus className="w-4 h-4 mr-1" />
            新規登録
          </Button>
        }
      />
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
            <tr>
              {['名称', 'カテゴリ', '安全在庫', '現在庫', '危険度', '操作'].map(h => (
                <th key={h} className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rawMaterials.map(m => {
              const currentStock = calculateCurrentStock(m.id)
              const isAlert = currentStock < m.safetyStock
              return (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-teal-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{m.name}</td>
                  <td className="px-4 py-3">{m.category}</td>
                  <td className="px-4 py-3">
                    {m.safetyStock.toLocaleString()} {m.unit}
                  </td>
                  <td className={`px-4 py-3 font-bold ${isAlert ? 'text-red-600' : 'text-slate-800'}`}>
                    {currentStock.toLocaleString()} {m.unit}
                  </td>
                  <td className="px-4 py-3">
                    {isAlert ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        危険
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        安全
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleOpenHistoryModal(m)}
                        className="p-1.5 text-slate-500 hover:bg-teal-100 hover:text-teal-600 rounded-lg transition-colors"
                        title="在庫増減履歴"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleOpenFormModal(m)} className="p-1.5 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors" title="編集">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => materialHandlers.delete(m.id)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={selectedMaterial ? '原材料編集' : '原材料登録'}>
        <RawMaterialForm material={selectedMaterial} onSave={handleSave} onCancel={handleCloseFormModal} />
      </Modal>
      {selectedMaterial && (
        <StockHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={handleCloseHistoryModal}
          material={selectedMaterial}
          history={stockAdjustments.filter(h => h.rawMaterialId === selectedMaterial.id)}
          onAddHistory={adjustmentHandlers.add}
          used={calculateUsedStock(selectedMaterial.id)}
        />
      )}
    </>
  )
}

// --- Order Data Page Components ----------------------------------
const OrderForm = ({order, onSave, onCancel, products}) => {
  const [formData, setFormData] = useState(
    order || {orderDate: new Date().toISOString().slice(0, 10), productId: '', quantity: 0}
  )
  const amount = useMemo(() => {
    const product = products.find(p => p.id === formData.productId)
    return product ? product.cost * formData.quantity : 0
  }, [formData.productId, formData.quantity, products])
  const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value})
  const handleSubmit = e => {
    e.preventDefault()
    onSave({...formData, amount})
  }
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="受注日">
          <Input type="date" name="orderDate" value={formData.orderDate} onChange={handleChange} required />
        </FormField>
        <FormField label="商品">
          <Select name="productId" value={formData.productId} onChange={handleChange} required>
            <option value="">商品を選択</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.color})
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="受注枚数">
          <Input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" />
        </FormField>
        <FormField label="売上金額">
          <div className="px-3 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium">¥{amount.toLocaleString()}</div>
        </FormField>
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" variant="primary">
          保存
        </Button>
      </div>
    </form>
  )
}

const OrderDataPage = ({appData}) => {
  const {orders, products, orderHandlers} = appData
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const handleOpenModal = (order = null) => {
    setEditingOrder(order)
    setIsModalOpen(true)
  }
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingOrder(null)
  }
  const handleSave = order => {
    if (order.id) {
      orderHandlers.update(order)
    } else {
      orderHandlers.add(order)
    }
    handleCloseModal()
  }
  const getProductDisplayName = id => {
    const product = products.find(p => p.id === id)
    return product ? `${product.name} (${product.color})` : 'N/A'
  }
  return (
    <>
      <PageHeader
        title="受注データ"
        actions={
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-1" />
            新規登録
          </Button>
        }
      />
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
            <tr>
              {['受注日', '商品名', '枚数', '金額', '操作'].map(h => (
                <th key={h} className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b border-slate-100 hover:bg-teal-50/50 transition-colors">
                <td className="px-4 py-3">{o.orderDate}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{getProductDisplayName(o.productId)}</td>
                <td className="px-4 py-3">{o.quantity.toLocaleString()}枚</td>
                <td className="px-4 py-3 font-medium">¥{o.amount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button onClick={() => handleOpenModal(o)} className="p-1.5 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => orderHandlers.delete(o.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingOrder ? '受注編集' : '受注登録'}>
        <OrderForm order={editingOrder} onSave={handleSave} onCancel={handleCloseModal} products={products} />
      </Modal>
    </>
  )
}

// --- Production Data Page Components -----------------------------
const ProductionForm = ({production, onSave, onCancel, products}) => {
  const [formData, setFormData] = useState(
    production || {productionDate: new Date().toISOString().slice(0, 10), productId: '', quantity: 0, type: 'タイプ1'}
  )
  const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value})
  const handleSubmit = e => {
    e.preventDefault()
    onSave(formData)
  }
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <FormField label="生産日">
          <Input type="date" name="productionDate" value={formData.productionDate} onChange={handleChange} required />
        </FormField>
        <FormField label="商品">
          <Select name="productId" value={formData.productId} onChange={handleChange} required>
            <option value="">商品を選択</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.color})
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="生産枚数">
          <Input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" />
        </FormField>
        <FormField label="生産区分">
          <div className="flex space-x-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="タイプ1"
                checked={formData.type === 'タイプ1'}
                onChange={handleChange}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-700">タイプ1</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="タイプ2"
                checked={formData.type === 'タイプ2'}
                onChange={handleChange}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-700">タイプ2</span>
            </label>
          </div>
        </FormField>
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" variant="primary">
          保存
        </Button>
      </div>
    </form>
  )
}

const ProductionDataPage = ({appData}) => {
  const {productions, products, productionHandlers} = appData
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduction, setEditingProduction] = useState(null)
  const handleOpenModal = (prod = null) => {
    setEditingProduction(prod)
    setIsModalOpen(true)
  }
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduction(null)
  }
  const handleSave = prod => {
    if (prod.id) {
      productionHandlers.update(prod)
    } else {
      productionHandlers.add(prod)
    }
    handleCloseModal()
  }
  const getProductDisplayName = id => {
    const product = products.find(p => p.id === id)
    return product ? `${product.name} (${product.color})` : 'N/A'
  }
  return (
    <>
      <PageHeader
        title="生産データ"
        actions={
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-1" />
            新規登録
          </Button>
        }
      />
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
            <tr>
              {['生産日', '商品名', '枚数', '区分', '操作'].map(h => (
                <th key={h} className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productions.map(p => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-teal-50/50 transition-colors">
                <td className="px-4 py-3">{p.productionDate}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{getProductDisplayName(p.productId)}</td>
                <td className="px-4 py-3">{p.quantity.toLocaleString()}枚</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${p.type === 'タイプ1' ? 'bg-teal-100 text-teal-700' : 'bg-orange-100 text-orange-700'}`}
                  >
                    {p.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button onClick={() => handleOpenModal(p)} className="p-1.5 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => productionHandlers.delete(p.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduction ? '生産実績編集' : '生産実績登録'}>
        <ProductionForm production={editingProduction} onSave={handleSave} onCancel={handleCloseModal} products={products} />
      </Modal>
    </>
  )
}

// --- Navigation and Layout Components ----------------------------
const navItems = [
  {name: 'ダッシュボード', icon: Home, page: 'dashboard'},
  {name: '商品マスター', icon: Box, page: 'products'},
  {name: '原材料マスター', icon: Wrench, page: 'materials'},
  {name: '受注データ', icon: ClipboardList, page: 'orders'},
  {name: '生産データ', icon: Factory, page: 'productions'},
]

// ==========================================
// Info Sidebar Component
// ==========================================

// Info Sidebar Configuration
const PRODUCTION_FEATURES: Feature[] = [
  {
    icon: Calendar,
    title: '生産スケジュール管理',
    description: 'カレンダー形式で生産計画を可視化。日別の生産予定と実績を一目で把握できます。',
    benefit: '生産計画の立案時間を70%短縮',
  },
  {
    icon: Package,
    title: '原材料在庫管理',
    description: '原材料の在庫数を自動計算し、安全在庫を下回ると警告表示。発注漏れを防止します。',
    benefit: '在庫切れによる生産停止ゼロを実現',
  },
  {
    icon: ClipboardList,
    title: '受注管理',
    description: '受注データを一元管理。過去の受注傾向から需要予測のヒントを得られます。',
    benefit: '受注処理時間を1件あたり5分短縮',
  },
  {
    icon: BarChart3,
    title: '生産実績分析',
    description: '日別・製品別の生産実績を集計。生産効率の改善ポイントが見つかります。',
    benefit: '生産効率15%向上の実績',
  },
]

const PRODUCTION_TIME_EFFICIENCY: TimeEfficiencyItem[] = [
  { task: '生産計画の作成', before: '2時間', after: '30分', saved: '90分/日' },
  { task: '在庫数の確認', before: '30分', after: '即時表示', saved: '30分/日' },
  { task: '原材料の発注判断', before: '45分', after: '5分', saved: '40分/日' },
  { task: '月次生産レポート', before: '4時間', after: '自動生成', saved: '4時間/月' },
]

const PRODUCTION_CHALLENGES = [
  'Excelでの生産管理に限界を感じている',
  '原材料の在庫切れで生産が止まることがある',
  '生産計画の作成に時間がかかりすぎる',
  '現場の状況をリアルタイムで把握したい',
  '過去の生産データを活用できていない',
]

interface HeaderProps {
  activePage: string
  setActivePage: (page: string) => void
  onOpenInfo: () => void
}

const Header: React.FC<HeaderProps> = ({activePage, setActivePage, onOpenInfo}) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-lg shadow-teal-500/20">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">
                Production Manager
              </h1>
              <p className="text-xs text-slate-400 -mt-0.5">生産管理システム</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-1 items-center">
            {navItems.map(item => (
              <button
                key={item.name}
                onClick={() => setActivePage(item.page)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${activePage === item.page
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                <span>{item.name}</span>
              </button>
            ))}
            <button
              onClick={onOpenInfo}
              className="ml-2 p-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 flex items-center gap-2"
              title="このシステムでできること"
            >
              <PanelRightOpen className="w-4 h-4" />
              <span className="text-sm font-medium">機能説明</span>
            </button>
          </nav>
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onOpenInfo}
              className="p-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg"
              title="機能説明"
            >
              <Info className="w-5 h-5" />
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu className="w-6 h-6 text-slate-700" />
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white animate-in slide-in-from-top-2 duration-200">
          <nav className="p-2 flex flex-col space-y-1">
            {navItems.map(item => (
              <button
                key={item.name}
                onClick={() => {
                  setActivePage(item.page)
                  setIsOpen(false)
                }}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300
                  ${activePage === item.page
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white'
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

// --- Main App Component ------------------------------------------
export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [showSplash, setShowSplash] = useState(true)
  const [showInfoSidebar, setShowInfoSidebar] = useState(false)

  const {
    items: products,
    addItem: addProduct,
    updateItem: updateProduct,
    deleteItem: deleteProduct,
  } = useCrudManager(initialProducts)
  const {
    items: rawMaterials,
    addItem: addMaterial,
    updateItem: updateMaterial,
    deleteItem: deleteMaterial,
  } = useCrudManager(initialRawMaterials)
  const {items: orders, addItem: addOrder, updateItem: updateOrder, deleteItem: deleteOrder} = useCrudManager(initialOrders)
  const {
    items: productions,
    addItem: addProduction,
    updateItem: updateProduction,
    deleteItem: deleteProduction,
  } = useCrudManager(initialProductions)
  const {
    items: stockAdjustments,
    addItem: addAdjustment,
    updateItem: updateAdjustment,
    deleteItem: deleteAdjustment,
  } = useCrudManager(initialStockAdjustments)
  const [dailyStaffAssignments, setDailyStaffAssignments] = useState<Record<string, Record<string, number>>>({})

  const handleUpdateStaff = (dateString: string, productId: string, count: number) => {
    setDailyStaffAssignments(prev => {
      const newAssignments = {...prev}
      if (!newAssignments[dateString]) {
        newAssignments[dateString] = {}
      }
      newAssignments[dateString][productId] = count
      return newAssignments
    })
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const appData = {
    products,
    rawMaterials,
    orders,
    productions,
    stockAdjustments,
    dailyStaffAssignments,
    productHandlers: {add: addProduct, update: updateProduct, delete: deleteProduct},
    materialHandlers: {add: addMaterial, update: updateMaterial, delete: deleteMaterial},
    orderHandlers: {add: addOrder, update: updateOrder, delete: deleteOrder},
    productionHandlers: {add: addProduction, update: updateProduction, delete: deleteProduction},
    adjustmentHandlers: {add: addAdjustment, update: updateAdjustment, delete: deleteAdjustment},
  }

  // スプラッシュ画面
  if (showSplash) {
    return <SplashScreen theme="teal" systemName="Production Manager" />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <ProductionDashboardPage appData={appData} onUpdateStaff={handleUpdateStaff} />
      case 'products':
        return <ProductMasterPage appData={appData} />
      case 'materials':
        return <RawMaterialMasterPage appData={appData} />
      case 'orders':
        return <OrderDataPage appData={appData} />
      case 'productions':
        return <ProductionDataPage appData={appData} />
      default:
        return <ProductionDashboardPage appData={appData} onUpdateStaff={handleUpdateStaff} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 font-sans text-slate-800">
      <Header activePage={activePage} setActivePage={setActivePage} onOpenInfo={() => setShowInfoSidebar(true)} />
      <InfoSidebar
        isOpen={showInfoSidebar}
        onClose={() => setShowInfoSidebar(false)}
        theme="teal"
        systemIcon={Factory}
        systemName="製造業向け生産管理"
        systemDescription="中小製造業の現場に最適化された生産管理システムです。Excelでの管理から脱却し、リアルタイムな情報共有を実現します。"
        features={PRODUCTION_FEATURES}
        timeEfficiency={PRODUCTION_TIME_EFFICIENCY}
        challenges={PRODUCTION_CHALLENGES}
      />
      <main className="p-4 md:p-6 container mx-auto">{renderPage()}</main>
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200 py-4 mt-8">
        <div className="container mx-auto text-center text-xs text-slate-400">
          <p>Production Manager - Demo System</p>
        </div>
      </footer>
    </div>
  )
}
