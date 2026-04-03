'use client'

/**
 * Regrow データコンテキスト（本番DB専用）
 * YYYY-MM単位のデータ管理
 * Server Actions経由でDB操作
 */

import React, {createContext, useContext, useState, useCallback, useEffect} from 'react'
import type {MonthlyData, YearMonth, ExcelParseResult, StoreKpi, StaffManualData, StaffMaster, StaffRole, StoreName, RegrowScopes} from '../types'
import type {RgStore} from '@prisma/generated/prisma/client'
import {createEmptyMonthlyData, getPreviousMonth, getNextMonth} from '../lib/storage'
import {
  getMonthlyReport,
  getAvailableMonths,
  saveImportedData,
  saveStoreKpi,
  saveStaffManualData,
  saveCustomerVoice,
  upsertMonthlyReport,
  transferStaffToStore,
} from '../_actions/monthly-report-actions'
import {getStaffMaster} from '../_actions/staff-actions'

// ============================================================
// コンテキスト型定義
// ============================================================

export type DataContextType = {
  // 現在選択中のYYYY-MM
  currentYearMonth: YearMonth
  setCurrentYearMonth: (yearMonth: YearMonth) => void

  // 利用可能な全YYYY-MMリスト
  availableMonths: YearMonth[]
  refreshAvailableMonths: () => void

  // 現在の月次データ
  monthlyData: MonthlyData
  updateMonthlyData: (updater: (prev: MonthlyData) => MonthlyData) => void

  // 全月次データ（年間キャッシュ）
  allMonthlyData: Record<YearMonth, MonthlyData>

  // データ再読み込み
  refreshData: () => Promise<void>

  // インポートデータ更新（targetYearMonth: 保存先の年月。省略時はcurrentYearMonth）
  addImportedData: (parseResult: ExcelParseResult, targetYearMonth?: YearMonth, nameToUserIdMap?: Record<string, string>) => void
  clearImportedData: () => void

  // 手動入力データ更新
  updateStoreKpi: (storeName: StoreName, updates: Partial<StoreKpi>) => void
  updateStaffManualData: (staffName: string, storeName: StoreName, storeId: number, updates: Partial<StaffManualData>) => void
  updateCustomerVoice: (content: string) => void

  // スタッフマスタ
  staffMaster: StaffMaster[]
  refreshStaffMaster: () => void

  // 店舗マスタ
  stores: RgStore[]

  // 現在のユーザーロール
  currentUserRole: StaffRole

  // 権限スコープ
  scopes: RegrowScopes

  // 売上振替（isDev限定）
  transferStaff: (staffName: string, fromStoreId: number, toStoreId: number) => Promise<void>

  // ナビゲーション
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  createNewMonth: (yearMonth: YearMonth) => void
}

export const DataContext = createContext<DataContextType | null>(null)

export const useDataContext = () => {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useDataContext must be used within DataContextProvider')
  return ctx
}

// ============================================================
// プロバイダー（本番DB専用）
// ============================================================

type DataContextProviderProps = {
  children: React.ReactNode
  initialMonths: YearMonth[]
  initialYearMonth: YearMonth
  initialData?: MonthlyData | null
  initialStaffMaster?: StaffMaster[]
  initialStores?: RgStore[]
  initialAllMonthlyData?: Record<YearMonth, MonthlyData>
  currentUserRole?: StaffRole
  initialScopes: RegrowScopes
}

export const DataContextProvider = ({
  children,
  initialMonths,
  initialYearMonth,
  initialData,
  initialStaffMaster,
  initialStores,
  initialAllMonthlyData,
  currentUserRole = 'viewer',
  initialScopes,
}: DataContextProviderProps) => {
  const scopes = initialScopes || {isAdmin: true, isManager: false}

  const [currentYearMonth, setCurrentYearMonth] = useState<YearMonth>(initialYearMonth)
  const [availableMonths, setAvailableMonths] = useState<YearMonth[]>(initialMonths)
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(initialData ?? null)
  const [staffMaster, setStaffMaster] = useState<StaffMaster[]>(initialStaffMaster ?? [])
  const [stores] = useState<RgStore[]>(initialStores ?? [])
  const [allMonthlyData, setAllMonthlyData] = useState<Record<YearMonth, MonthlyData>>(initialAllMonthlyData ?? {})

  // ============================================================
  // スタッフマスタ再読み込み
  // ============================================================
  const refreshStaffMaster = useCallback(async () => {
    const data = await getStaffMaster()
    setStaffMaster(data)
  }, [])

  // 該当年の全月データを一括取得（年間推移グラフ用）
  const loadYearData = useCallback(
    async (year: string) => {
      const yearMonths = availableMonths.filter((m) => m.startsWith(year))
      // キャッシュにない月だけ取得
      const missing = yearMonths.filter((ym) => !allMonthlyData[ym])
      if (missing.length === 0) return

      const results = await Promise.all(
        missing.map(async (ym) => {
          const data = await getMonthlyReport(ym)
          return {ym, data}
        })
      )

      const newEntries: Record<YearMonth, MonthlyData> = {}
      for (const {ym, data} of results) {
        if (data) newEntries[ym] = data
      }
      if (Object.keys(newEntries).length > 0) {
        setAllMonthlyData((prev) => ({...prev, ...newEntries}))
      }
    },
    [availableMonths, allMonthlyData]
  )

  // currentYearMonth変更時のデータロード
  useEffect(() => {
    if (!currentYearMonth) return

    // initialDataがある最初のロードはスキップ
    if (initialData && currentYearMonth === initialYearMonth) return

    const load = async () => {
      // 選択月のデータ取得
      let data: MonthlyData | null = allMonthlyData[currentYearMonth] ?? null
      if (!data) {
        data = await getMonthlyReport(currentYearMonth)
        if (!data) {
          await upsertMonthlyReport(currentYearMonth)
          data = createEmptyMonthlyData(currentYearMonth)
        }
        setAllMonthlyData((prev) => ({...prev, [currentYearMonth]: data!}))
      }
      setMonthlyData(data)

      // 該当年の全月データも一括取得（年間推移グラフ用）
      const year = currentYearMonth.split('-')[0]
      await loadYearData(year)
    }
    load()
  }, [currentYearMonth])

  // 利用可能な月リストを再取得
  const refreshAvailableMonths = useCallback(async () => {
    const months = await getAvailableMonths()
    setAvailableMonths(months)
  }, [])

  // データを再読み込み
  const refreshData = useCallback(async () => {
    const months = await getAvailableMonths()
    setAvailableMonths(months)
    if (currentYearMonth) {
      const data = await getMonthlyReport(currentYearMonth)
      if (data) {
        setMonthlyData(data)
        setAllMonthlyData((prev) => ({...prev, [currentYearMonth]: data}))
      }
    }
  }, [currentYearMonth])

  // 月次データ更新（楽観的更新用）
  const updateMonthlyData = useCallback(
    (updater: (prev: MonthlyData) => MonthlyData) => {
      if (!monthlyData) return
      const updated = updater(monthlyData)
      setMonthlyData(updated)
      setAllMonthlyData((prev) => ({...prev, [currentYearMonth]: updated}))
    },
    [monthlyData, currentYearMonth]
  )

  // インポートデータ追加
  const addImportedData = useCallback(
    async (parseResult: ExcelParseResult, targetYearMonth?: YearMonth, nameToUserIdMap?: Record<string, string>) => {
      const saveYearMonth = targetYearMonth ?? currentYearMonth
      const staffRecords = parseResult.staffList.map((s) => ({
        ...s,
        storeName: parseResult.storeShortName,
      }))
      const storeTotals = [
        {
          storeName: parseResult.storeShortName,
          ...parseResult.total,
        },
      ]

      await saveImportedData(saveYearMonth, staffRecords, storeTotals as any, nameToUserIdMap)

      // DB再取得で最新データを反映
      setCurrentYearMonth(saveYearMonth)
      const updated = await getMonthlyReport(saveYearMonth)
      if (updated) {
        setMonthlyData(updated)
        setAllMonthlyData((prev) => ({...prev, [saveYearMonth]: updated}))
      }

      // スタッフマスタも再取得
      await refreshStaffMaster()
    },
    [currentYearMonth, refreshStaffMaster]
  )

  // インポートデータクリア
  const clearImportedData = useCallback(() => {
    updateMonthlyData((prev) => ({
      ...prev,
      importedData: null,
    }))
  }, [updateMonthlyData])

  // 店舗KPI更新
  const updateStoreKpi = useCallback(
    async (storeName: StoreName, updates: Partial<StoreKpi>) => {
      // 楽観的にState更新
      updateMonthlyData((prev) => {
        const existingKpis = prev.manualData.storeKpis || []
        const index = existingKpis.findIndex((k) => k.storeName === storeName)

        if (index >= 0) {
          const newKpis = [...existingKpis]
          newKpis[index] = {...newKpis[index], ...updates}
          return {
            ...prev,
            manualData: {...prev.manualData, storeKpis: newKpis},
          }
        } else {
          return {
            ...prev,
            manualData: {
              ...prev.manualData,
              storeKpis: [
                ...existingKpis,
                {
                  storeName,
                  utilizationRate: null,
                  returnRate: null,
                  csRegistrationCount: null,
                  googleReviewCount: null,
                  comment: '',
                  ...updates,
                },
              ],
            },
          }
        }
      })

      await saveStoreKpi(currentYearMonth, storeName, updates)
    },
    [updateMonthlyData, currentYearMonth]
  )

  // スタッフ手動入力データ更新
  const updateStaffManualData = useCallback(
    async (staffName: string, storeName: StoreName, storeId: number, updates: Partial<StaffManualData>) => {
      // 楽観的にState更新
      updateMonthlyData((prev) => {
        const existing = prev.manualData.staffManualData || []
        const index = existing.findIndex((s) => s.staffName === staffName && s.storeName === storeName)

        if (index >= 0) {
          const newList = [...existing]
          newList[index] = {...newList[index], ...updates}
          return {
            ...prev,
            manualData: {...prev.manualData, staffManualData: newList},
          }
        } else {
          return {
            ...prev,
            manualData: {
              ...prev.manualData,
              staffManualData: [
                ...existing,
                {
                  staffName,
                  storeName,
                  utilizationRate: null,
                  csRegistrationCount: null,
                  googleReviewCount: null,
                  targetSales: null,
                  ...updates,
                },
              ],
            },
          }
        }
      })

      await saveStaffManualData(currentYearMonth, staffName, storeId, updates)
    },
    [updateMonthlyData, currentYearMonth]
  )

  // お客様の声更新
  const updateCustomerVoice = useCallback(
    async (content: string) => {
      updateMonthlyData((prev) => ({
        ...prev,
        manualData: {...prev.manualData, customerVoice: {content}},
      }))

      await saveCustomerVoice(currentYearMonth, content)
    },
    [updateMonthlyData, currentYearMonth]
  )

  // 売上振替（isDev限定）
  const transferStaff = useCallback(
    async (staffName: string, fromStoreId: number, toStoreId: number) => {
      await transferStaffToStore(currentYearMonth, staffName, fromStoreId, toStoreId)
      await refreshData()
    },
    [currentYearMonth, refreshData]
  )

  // 前月へ移動
  const goToPreviousMonth = useCallback(() => {
    setCurrentYearMonth(getPreviousMonth(currentYearMonth))
  }, [currentYearMonth])

  // 翌月へ移動
  const goToNextMonth = useCallback(() => {
    setCurrentYearMonth(getNextMonth(currentYearMonth))
  }, [currentYearMonth])

  // 新しい月を作成
  const createNewMonth = useCallback(
    async (yearMonth: YearMonth) => {
      await upsertMonthlyReport(yearMonth)
      const months = await getAvailableMonths()
      setAvailableMonths(months)
      setCurrentYearMonth(yearMonth)
    },
    []
  )

  // monthlyDataがnullの場合はローディング表示
  if (!monthlyData) {
    return <div>Loading...</div>
  }

  return (
    <DataContext.Provider
      value={{
        currentYearMonth,
        setCurrentYearMonth,
        availableMonths,
        refreshAvailableMonths,
        monthlyData,
        updateMonthlyData,
        allMonthlyData,
        refreshData,
        addImportedData,
        clearImportedData,
        updateStoreKpi,
        updateStaffManualData,
        updateCustomerVoice,
        staffMaster,
        refreshStaffMaster,
        stores,
        currentUserRole,
        scopes,
        transferStaff,
        goToPreviousMonth,
        goToNextMonth,
        createNewMonth,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
