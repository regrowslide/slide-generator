'use client'

import React, {createContext, useContext, useState, useCallback} from 'react'

// ============================================================
// 型定義
// ============================================================

export type StoreMonthlyInput = {
  id: string
  month: string // YYYY-MM
  storeName: string
  sales: number | null
  utilizationRate: number | null
  avgUnitPrice: number | null
  returnRate: number | null
  churnRate: number | null
}

export type StaffMonthlyInput = {
  id: string
  month: string // YYYY-MM
  storeName: string
  staffName: string
  sales: number | null
  utilizationRate: number | null
  customerCount: number | null
  nominationCount: number | null
  unitPrice: number | null
  returnRate: number | null
  csRegistrationCount: number | null
}

export type LowReviewInput = {
  id: string
  date: string
  storeName: string
  content: string
  responseStatus: string
}

export type CommentInput = {
  id: string
  page: string
  target: string
  comment: string
}

export type StaffMaster = {
  name: string
  storeName: string
}

// ============================================================
// 定数・マスタ
// ============================================================

export const STORE_NAMES = ['新潟西店', '三条店', '新潟中央店'] as const

export const STAFF_MASTER: StaffMaster[] = [
  {name: '池端', storeName: '新潟西店'},
  {name: '渡部', storeName: '新潟西店'},
  {name: '小川', storeName: '新潟西店'},
  {name: '涌井', storeName: '新潟西店'},
  {name: '灰野', storeName: '新潟西店'},
  {name: '安中', storeName: '三条店'},
  {name: '和田', storeName: '三条店'},
  {name: '高柳', storeName: '三条店'},
  {name: '田中', storeName: '新潟西店'},
  {name: '齋藤', storeName: '新潟西店'},
  {name: '内山', storeName: '新潟西店'},
  {name: '石田', storeName: '新潟西店'},
]

// ============================================================
// ユーティリティ
// ============================================================

export const generateId = (): string => Math.random().toString(36).slice(2, 9)

/** Excel日付シリアル → YYYY-MM */
export const excelSerialToMonth = (serial: number): string => {
  const date = new Date((serial - 25569) * 86400 * 1000)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** YYYY-MM → 表示用 "YYYY年M月" */
export const formatMonthLabel = (month: string): string => {
  const [y, m] = month.split('-')
  return `${y}年${Number(m)}月`
}

export const formatNumber = (n: number | null | undefined): string => {
  if (n == null) return '-'
  return n.toLocaleString('ja-JP')
}

export const formatYen = (n: number | null | undefined): string => {
  if (n == null) return '-'
  return `¥${n.toLocaleString('ja-JP')}`
}

export const formatPercent = (n: number | null | undefined): string => {
  if (n == null) return '-'
  if (n <= 1 && n >= 0) return `${(n * 100).toFixed(1)}%`
  return `${n.toFixed(1)}%`
}

// ============================================================
// 初期サンプルデータ（MTG資料作成Excelから抽出）
// ============================================================

const INITIAL_STORE_MONTHLY: StoreMonthlyInput[] = [
  {id: generateId(), month: '2025-02', storeName: '新潟西店', sales: 1629517, utilizationRate: 0.85, avgUnitPrice: 4629, returnRate: null, churnRate: null},
  {id: generateId(), month: '2025-02', storeName: '三条店', sales: null, utilizationRate: null, avgUnitPrice: null, returnRate: null, churnRate: null},
  {id: generateId(), month: '2025-02', storeName: '新潟中央店', sales: null, utilizationRate: null, avgUnitPrice: null, returnRate: null, churnRate: null},
  {id: generateId(), month: '2025-03', storeName: '新潟西店', sales: 1765321, utilizationRate: 0.91, avgUnitPrice: 4986, returnRate: 0.694, churnRate: null},
  {id: generateId(), month: '2025-03', storeName: '三条店', sales: null, utilizationRate: null, avgUnitPrice: null, returnRate: null, churnRate: null},
  {id: generateId(), month: '2025-03', storeName: '新潟中央店', sales: null, utilizationRate: null, avgUnitPrice: null, returnRate: null, churnRate: null},
  {id: generateId(), month: '2025-04', storeName: '新潟西店', sales: 997194, utilizationRate: 0.89, avgUnitPrice: 5184, returnRate: 0.694, churnRate: 0.215},
  {id: generateId(), month: '2025-04', storeName: '三条店', sales: 1279890, utilizationRate: 0.85, avgUnitPrice: 5765, returnRate: 0.609, churnRate: 0.15},
  {id: generateId(), month: '2025-04', storeName: '新潟中央店', sales: null, utilizationRate: null, avgUnitPrice: null, returnRate: null, churnRate: null},
  {id: generateId(), month: '2025-05', storeName: '新潟西店', sales: 997194, utilizationRate: 0.85, avgUnitPrice: 5184, returnRate: 0.694, churnRate: 0.215},
  {id: generateId(), month: '2025-05', storeName: '三条店', sales: 1279890, utilizationRate: 0.95, avgUnitPrice: 5765, returnRate: 0.609, churnRate: 0.15},
  {id: generateId(), month: '2025-05', storeName: '新潟中央店', sales: null, utilizationRate: null, avgUnitPrice: null, returnRate: null, churnRate: null},
  {id: generateId(), month: '2025-09', storeName: '新潟西店', sales: 997194, utilizationRate: 0.85, avgUnitPrice: 5184, returnRate: 0.694, churnRate: 0.215},
  {id: generateId(), month: '2025-09', storeName: '三条店', sales: 1279890, utilizationRate: 0.95, avgUnitPrice: 5765, returnRate: 0.609, churnRate: 0.15},
  {id: generateId(), month: '2025-09', storeName: '新潟中央店', sales: null, utilizationRate: null, avgUnitPrice: null, returnRate: null, churnRate: null},
  {id: generateId(), month: '2025-10', storeName: '新潟西店', sales: 997194, utilizationRate: 0.85, avgUnitPrice: 5184, returnRate: 0.694, churnRate: 0.215},
  {id: generateId(), month: '2025-10', storeName: '三条店', sales: 1279890, utilizationRate: 0.95, avgUnitPrice: 5765, returnRate: 0.609, churnRate: 0.15},
  {id: generateId(), month: '2025-10', storeName: '新潟中央店', sales: null, utilizationRate: null, avgUnitPrice: null, returnRate: null, churnRate: null},
  {id: generateId(), month: '2025-11', storeName: '新潟西店', sales: 997194, utilizationRate: 0.85, avgUnitPrice: 5184, returnRate: 0.694, churnRate: 0.215},
  {id: generateId(), month: '2025-11', storeName: '三条店', sales: 12, utilizationRate: 0.95, avgUnitPrice: 5765, returnRate: 0.609, churnRate: 0.15},
  {id: generateId(), month: '2025-11', storeName: '新潟中央店', sales: null, utilizationRate: null, avgUnitPrice: null, returnRate: null, churnRate: null},
]

const INITIAL_STAFF_MONTHLY: StaffMonthlyInput[] = [
  {id: generateId(), month: '2025-10', storeName: '新潟西店', staffName: '池端', sales: 110566, utilizationRate: 0.762, customerCount: 24, nominationCount: 8, unitPrice: 4606, returnRate: 0.667, csRegistrationCount: 1},
  {id: generateId(), month: '2025-10', storeName: '新潟西店', staffName: '渡部', sales: 96557, utilizationRate: 0.907, customerCount: 18, nominationCount: 10, unitPrice: 6187, returnRate: 0.5, csRegistrationCount: 0},
  {id: generateId(), month: '2025-10', storeName: '新潟西店', staffName: '小川', sales: 0, utilizationRate: null, customerCount: 0, nominationCount: 0, unitPrice: 0, returnRate: null, csRegistrationCount: 0},
  {id: generateId(), month: '2025-10', storeName: '新潟西店', staffName: '涌井', sales: 234460, utilizationRate: 0.771, customerCount: 55, nominationCount: 27, unitPrice: 4262, returnRate: 0.728, csRegistrationCount: 0},
  {id: generateId(), month: '2025-10', storeName: '新潟西店', staffName: '灰野', sales: 169422, utilizationRate: 0.732, customerCount: 51, nominationCount: 16, unitPrice: 3322, returnRate: 0.706, csRegistrationCount: 0},
  {id: generateId(), month: '2025-10', storeName: '三条店', staffName: '安中', sales: 675811, utilizationRate: 0.965, customerCount: 108, nominationCount: 70, unitPrice: 6257, returnRate: 0.602, csRegistrationCount: 13},
  {id: generateId(), month: '2025-10', storeName: '三条店', staffName: '和田', sales: 604079, utilizationRate: 0.948, customerCount: 114, nominationCount: 49, unitPrice: 5298, returnRate: 0.614, csRegistrationCount: 18},
  {id: generateId(), month: '2025-10', storeName: '三条店', staffName: '高柳', sales: 0, utilizationRate: null, customerCount: 0, nominationCount: 0, unitPrice: 0, returnRate: null, csRegistrationCount: 0},
  {id: generateId(), month: '2025-11', storeName: '新潟西店', staffName: '池端', sales: 91537, utilizationRate: null, customerCount: 18, nominationCount: 8, unitPrice: 5085, returnRate: 0.777, csRegistrationCount: 3},
  {id: generateId(), month: '2025-11', storeName: '新潟西店', staffName: '渡部', sales: 106383, utilizationRate: null, customerCount: 22, nominationCount: 3, unitPrice: 4835, returnRate: 0.545, csRegistrationCount: 0},
  {id: generateId(), month: '2025-11', storeName: '新潟西店', staffName: '小川', sales: 0, utilizationRate: null, customerCount: 0, nominationCount: 0, unitPrice: 0, returnRate: null, csRegistrationCount: 0},
  {id: generateId(), month: '2025-11', storeName: '新潟西店', staffName: '涌井', sales: 199657, utilizationRate: null, customerCount: 47, nominationCount: 28, unitPrice: 4248, returnRate: 0.659, csRegistrationCount: 0},
  {id: generateId(), month: '2025-11', storeName: '新潟西店', staffName: '灰野', sales: 164422, utilizationRate: null, customerCount: 38, nominationCount: 9, unitPrice: 4326, returnRate: 0.706, csRegistrationCount: 0},
  {id: generateId(), month: '2025-11', storeName: '三条店', staffName: '安中', sales: 571791, utilizationRate: null, customerCount: 90, nominationCount: 64, unitPrice: 6353, returnRate: 0.755, csRegistrationCount: 8},
  {id: generateId(), month: '2025-11', storeName: '三条店', staffName: '和田', sales: 529963, utilizationRate: null, customerCount: 95, nominationCount: 47, unitPrice: 5578, returnRate: 0.61, csRegistrationCount: 7},
  {id: generateId(), month: '2025-11', storeName: '三条店', staffName: '高柳', sales: 0, utilizationRate: null, customerCount: 0, nominationCount: 0, unitPrice: 0, returnRate: null, csRegistrationCount: 0},
]

// ============================================================
// コンテキスト
// ============================================================

type RegrowDataContextType = {
  // データ
  storeMonthly: StoreMonthlyInput[]
  staffMonthly: StaffMonthlyInput[]
  lowReviews: LowReviewInput[]
  comments: CommentInput[]

  // 店舗月次 CRUD
  addStoreMonthly: (data: Omit<StoreMonthlyInput, 'id'>) => void
  updateStoreMonthly: (id: string, data: Partial<StoreMonthlyInput>) => void
  deleteStoreMonthly: (id: string) => void

  // スタッフ月次 CRUD
  addStaffMonthly: (data: Omit<StaffMonthlyInput, 'id'>) => void
  updateStaffMonthly: (id: string, data: Partial<StaffMonthlyInput>) => void
  deleteStaffMonthly: (id: string) => void

  // 口コミ低評価 CRUD
  addLowReview: (data: Omit<LowReviewInput, 'id'>) => void
  updateLowReview: (id: string, data: Partial<LowReviewInput>) => void
  deleteLowReview: (id: string) => void

  // コメント CRUD
  addComment: (data: Omit<CommentInput, 'id'>) => void
  updateComment: (id: string, data: Partial<CommentInput>) => void
  deleteComment: (id: string) => void
}

const RegrowDataContext = createContext<RegrowDataContextType | null>(null)

export const useRegrowData = () => {
  const ctx = useContext(RegrowDataContext)
  if (!ctx) throw new Error('useRegrowData must be used within RegrowDataProvider')
  return ctx
}

// ============================================================
// プロバイダー
// ============================================================

export const RegrowDataProvider = ({children}: {children: React.ReactNode}) => {
  const [storeMonthly, setStoreMonthly] = useState<StoreMonthlyInput[]>(INITIAL_STORE_MONTHLY)
  const [staffMonthly, setStaffMonthly] = useState<StaffMonthlyInput[]>(INITIAL_STAFF_MONTHLY)
  const [lowReviews, setLowReviews] = useState<LowReviewInput[]>([])
  const [comments, setComments] = useState<CommentInput[]>([])

  // 店舗月次
  const addStoreMonthly = useCallback((data: Omit<StoreMonthlyInput, 'id'>) => {
    setStoreMonthly((prev) => [...prev, {id: generateId(), ...data}])
  }, [])
  const updateStoreMonthly = useCallback((id: string, data: Partial<StoreMonthlyInput>) => {
    setStoreMonthly((prev) => prev.map((r) => (r.id === id ? {...r, ...data} : r)))
  }, [])
  const deleteStoreMonthly = useCallback((id: string) => {
    setStoreMonthly((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // スタッフ月次
  const addStaffMonthly = useCallback((data: Omit<StaffMonthlyInput, 'id'>) => {
    setStaffMonthly((prev) => [...prev, {id: generateId(), ...data}])
  }, [])
  const updateStaffMonthly = useCallback((id: string, data: Partial<StaffMonthlyInput>) => {
    setStaffMonthly((prev) => prev.map((r) => (r.id === id ? {...r, ...data} : r)))
  }, [])
  const deleteStaffMonthly = useCallback((id: string) => {
    setStaffMonthly((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // 口コミ低評価
  const addLowReview = useCallback((data: Omit<LowReviewInput, 'id'>) => {
    setLowReviews((prev) => [...prev, {id: generateId(), ...data}])
  }, [])
  const updateLowReview = useCallback((id: string, data: Partial<LowReviewInput>) => {
    setLowReviews((prev) => prev.map((r) => (r.id === id ? {...r, ...data} : r)))
  }, [])
  const deleteLowReview = useCallback((id: string) => {
    setLowReviews((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // コメント
  const addComment = useCallback((data: Omit<CommentInput, 'id'>) => {
    setComments((prev) => [...prev, {id: generateId(), ...data}])
  }, [])
  const updateComment = useCallback((id: string, data: Partial<CommentInput>) => {
    setComments((prev) => prev.map((r) => (r.id === id ? {...r, ...data} : r)))
  }, [])
  const deleteComment = useCallback((id: string) => {
    setComments((prev) => prev.filter((r) => r.id !== id))
  }, [])

  return (
    <RegrowDataContext.Provider
      value={{
        storeMonthly,
        staffMonthly,
        lowReviews,
        comments,
        addStoreMonthly,
        updateStoreMonthly,
        deleteStoreMonthly,
        addStaffMonthly,
        updateStaffMonthly,
        deleteStaffMonthly,
        addLowReview,
        updateLowReview,
        deleteLowReview,
        addComment,
        updateComment,
        deleteComment,
      }}
    >
      {children}
    </RegrowDataContext.Provider>
  )
}
