'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { Category, PaymentMethod, Transaction, FamilyMember, LifePlanItem, AssetItem, SpecialBudget } from '../components/types'
import { DEFAULT_CATEGORIES, DEFAULT_PAYMENT_METHODS, DEFAULT_FAMILY_MEMBERS } from '../components/constants'
import { generateMockTransactions, generateDemoTransactions, DEFAULT_LIFE_PLAN_ITEMS, DEFAULT_ASSET_ITEMS, DEFAULT_SPECIAL_BUDGET } from '../components/mock-data'

// ── 型定義 ──

type MockDataState = {
  // マスタ
  categories: Category[]
  paymentMethods: PaymentMethod[]
  // 入力データ
  transactions: Transaction[]
  // 家族
  familyMembers: FamilyMember[]
  // ライフプラン
  lifePlanItems: LifePlanItem[]
  // 資産
  assetItems: AssetItem[]
  // 特別費
  specialBudget: SpecialBudget
  // 選択中の年・月
  selectedYear: number
  selectedMonth: number // 1-12
}

type MockDataActions = {
  // カテゴリ CRUD
  addCategory: (cat: Category) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
  // 支払方法 CRUD
  addPaymentMethod: (pm: PaymentMethod) => void
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => void
  deletePaymentMethod: (id: string) => void
  // 収支入力
  addTransaction: (tx: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  // 家族メンバー
  addFamilyMember: (fm: FamilyMember) => void
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void
  deleteFamilyMember: (id: string) => void
  // ライフプラン
  updateLifePlanItem: (id: string, updates: Partial<LifePlanItem>) => void
  addLifePlanItem: (item: LifePlanItem) => void
  deleteLifePlanItem: (id: string) => void
  // 資産
  updateAssetItem: (id: string, updates: Partial<AssetItem>) => void
  addAssetItem: (item: AssetItem) => void
  deleteAssetItem: (id: string) => void
  // 特別費
  updateSpecialBudget: (updates: Partial<SpecialBudget>) => void
  // 年月選択
  setSelectedYear: (year: number) => void
  setSelectedMonth: (month: number) => void
  // デモデータ投入
  seedDemoData: () => void
  // リセット
  resetAll: () => void
}

type MockDataContextValue = MockDataState & MockDataActions

// ── 定数 ──

const STORAGE_KEY = 'kakeibo-mock-data'

// ── 初期値生成 ──

function createInitialState(): MockDataState {
  return {
    categories: DEFAULT_CATEGORIES,
    paymentMethods: DEFAULT_PAYMENT_METHODS,
    transactions: generateMockTransactions(),
    familyMembers: DEFAULT_FAMILY_MEMBERS,
    lifePlanItems: DEFAULT_LIFE_PLAN_ITEMS,
    assetItems: DEFAULT_ASSET_ITEMS,
    specialBudget: DEFAULT_SPECIAL_BUDGET,
    selectedYear: 2025,
    selectedMonth: 1,
  }
}

// ── localStorage からの復元 ──

function loadFromStorage(): MockDataState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as MockDataState
  } catch {
    return null
  }
}

function saveToStorage(state: MockDataState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage が使えない場合は無視
  }
}

// ── Context ──

const MockDataContext = createContext<MockDataContextValue | null>(null)

// ── Provider ──

export function KakeiboMockDataProvider({ children }: { children: React.ReactNode }) {
  // SSR対応: マウント前は初期値で表示し、hydration mismatch を回避
  const [state, setState] = useState<MockDataState>(createInitialState)
  const [mounted, setMounted] = useState(false)
  const initializedRef = useRef(false)

  // マウント時に localStorage から復元
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    const saved = loadFromStorage()
    if (saved) {
      setState(saved)
    }
    setMounted(true)
  }, [])

  // state 変更時に localStorage へ保存（マウント後のみ）
  useEffect(() => {
    if (!mounted) return
    saveToStorage(state)
  }, [state, mounted])

  // ── カテゴリ CRUD ──

  const addCategory = useCallback((cat: Category) => {
    setState((prev) => ({ ...prev, categories: [...prev.categories, cat] }))
  }, [])

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }))
  }, [])

  const deleteCategory = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
    }))
  }, [])

  // ── 支払方法 CRUD ──

  const addPaymentMethod = useCallback((pm: PaymentMethod) => {
    setState((prev) => ({ ...prev, paymentMethods: [...prev.paymentMethods, pm] }))
  }, [])

  const updatePaymentMethod = useCallback((id: string, updates: Partial<PaymentMethod>) => {
    setState((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }))
  }, [])

  const deletePaymentMethod = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter((p) => p.id !== id),
    }))
  }, [])

  // ── 収支入力 ──

  const addTransaction = useCallback((tx: Transaction) => {
    setState((prev) => ({
      ...prev,
      transactions: [...prev.transactions, tx].sort((a, b) => a.date.localeCompare(b.date)),
    }))
  }, [])

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions
        .map((t) => (t.id === id ? { ...t, ...updates } : t))
        .sort((a, b) => a.date.localeCompare(b.date)),
    }))
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }))
  }, [])

  // ── 家族メンバー ──

  const addFamilyMember = useCallback((fm: FamilyMember) => {
    setState((prev) => ({ ...prev, familyMembers: [...prev.familyMembers, fm] }))
  }, [])

  const updateFamilyMember = useCallback((id: string, updates: Partial<FamilyMember>) => {
    setState((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }))
  }, [])

  const deleteFamilyMember = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((f) => f.id !== id),
    }))
  }, [])

  // ── ライフプラン ──

  const addLifePlanItem = useCallback((item: LifePlanItem) => {
    setState((prev) => ({ ...prev, lifePlanItems: [...prev.lifePlanItems, item] }))
  }, [])

  const updateLifePlanItem = useCallback((id: string, updates: Partial<LifePlanItem>) => {
    setState((prev) => ({
      ...prev,
      lifePlanItems: prev.lifePlanItems.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    }))
  }, [])

  const deleteLifePlanItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      lifePlanItems: prev.lifePlanItems.filter((i) => i.id !== id),
    }))
  }, [])

  // ── 資産 ──

  const addAssetItem = useCallback((item: AssetItem) => {
    setState((prev) => ({ ...prev, assetItems: [...prev.assetItems, item] }))
  }, [])

  const updateAssetItem = useCallback((id: string, updates: Partial<AssetItem>) => {
    setState((prev) => ({
      ...prev,
      assetItems: prev.assetItems.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }))
  }, [])

  const deleteAssetItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      assetItems: prev.assetItems.filter((a) => a.id !== id),
    }))
  }, [])

  // ── 特別費 ──

  const updateSpecialBudget = useCallback((updates: Partial<SpecialBudget>) => {
    setState((prev) => ({
      ...prev,
      specialBudget: { ...prev.specialBudget, ...updates },
    }))
  }, [])

  // ── 年月選択 ──

  const setSelectedYear = useCallback((year: number) => {
    setState((prev) => ({ ...prev, selectedYear: year }))
  }, [])

  const setSelectedMonth = useCallback((month: number) => {
    setState((prev) => ({ ...prev, selectedMonth: month }))
  }, [])

  // ── デモデータ投入 ──

  const seedDemoData = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transactions: generateDemoTransactions(),
      selectedYear: 2026,
      selectedMonth: 1,
    }))
  }, [])

  // ── リセット ──

  const resetAll = useCallback(() => {
    const initial = createInitialState()
    setState(initial)
    // localStorage も即時クリア
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 無視
    }
  }, [])

  // ── Context Value（メモ化） ──

  const value = useMemo<MockDataContextValue>(
    () => ({
      ...state,
      addCategory,
      updateCategory,
      deleteCategory,
      addPaymentMethod,
      updatePaymentMethod,
      deletePaymentMethod,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addFamilyMember,
      updateFamilyMember,
      deleteFamilyMember,
      addLifePlanItem,
      updateLifePlanItem,
      deleteLifePlanItem,
      addAssetItem,
      updateAssetItem,
      deleteAssetItem,
      updateSpecialBudget,
      setSelectedYear,
      setSelectedMonth,
      seedDemoData,
      resetAll,
    }),
    [
      state,
      addCategory,
      updateCategory,
      deleteCategory,
      addPaymentMethod,
      updatePaymentMethod,
      deletePaymentMethod,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addFamilyMember,
      updateFamilyMember,
      deleteFamilyMember,
      addLifePlanItem,
      updateLifePlanItem,
      deleteLifePlanItem,
      addAssetItem,
      updateAssetItem,
      deleteAssetItem,
      updateSpecialBudget,
      setSelectedYear,
      setSelectedMonth,
      seedDemoData,
      resetAll,
    ]
  )

  return <MockDataContext.Provider value={value}>{children}</MockDataContext.Provider>
}

// ── カスタムフック ──

export function useKakeiboMockData(): MockDataContextValue {
  const ctx = useContext(MockDataContext)
  if (!ctx) {
    throw new Error('useKakeiboMockData は KakeiboMockDataProvider 内で使用してください')
  }
  return ctx
}
