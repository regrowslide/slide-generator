'use client'

/**
 * Regrow データコンテキスト
 * YYYY-MM単位のデータ管理とlocalStorageとの連携
 */

import React, {createContext, useContext, useState, useCallback, useEffect} from 'react'
import type {MonthlyData, YearMonth, ExcelParseResult, StoreName, StoreKpi, StaffManualData} from '../types'
import {
  loadMonthlyData,
  saveMonthlyData,
  getAllMonths,
  createEmptyMonthlyData,
  getCurrentYearMonth,
  getPreviousMonth,
  getNextMonth,
} from '../lib/storage'

// ============================================================
// コンテキスト型定義
// ============================================================

type DataContextType = {
  // 現在選択中のYYYY-MM
  currentYearMonth: YearMonth
  setCurrentYearMonth: (yearMonth: YearMonth) => void

  // 利用可能な全YYYY-MMリスト
  availableMonths: YearMonth[]
  refreshAvailableMonths: () => void

  // 現在の月次データ
  monthlyData: MonthlyData
  updateMonthlyData: (updater: (prev: MonthlyData) => MonthlyData) => void

  // データ再読み込み
  refreshData: () => Promise<void>

  // インポートデータ更新
  addImportedData: (parseResult: ExcelParseResult) => void
  clearImportedData: () => void

  // 手動入力データ更新
  updateStoreKpi: (storeName: StoreName, updates: Partial<StoreKpi>) => void
  updateStaffManualData: (staffName: string, storeName: StoreName, updates: Partial<StaffManualData>) => void
  updateCustomerVoice: (content: string) => void

  // ナビゲーション
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  createNewMonth: (yearMonth: YearMonth) => void
}

const DataContext = createContext<DataContextType | null>(null)

export const useDataContext = () => {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useDataContext must be used within DataContextProvider')
  return ctx
}

// ============================================================
// プロバイダー
// ============================================================

export const DataContextProvider = ({children}: {children: React.ReactNode}) => {
  const [currentYearMonth, setCurrentYearMonth] = useState<YearMonth>('')
  const [availableMonths, setAvailableMonths] = useState<YearMonth[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null)

  // 初期化: 利用可能な月リストを取得し、最新月を選択
  useEffect(() => {
    const months = getAllMonths()
    setAvailableMonths(months)

    if (months.length > 0) {
      // 最新月を選択
      setCurrentYearMonth(months[0])
    } else {
      // データがない場合、当月を選択
      const current = getCurrentYearMonth()
      setCurrentYearMonth(current)
    }
  }, [])

  // currentYearMonth変更時にデータをロード
  useEffect(() => {
    if (!currentYearMonth) return

    let data = loadMonthlyData(currentYearMonth)
    if (!data) {
      // データがない場合、空データを作成
      data = createEmptyMonthlyData(currentYearMonth)
      saveMonthlyData(currentYearMonth, data)
    }
    setMonthlyData(data)
  }, [currentYearMonth])

  // 利用可能な月リストを再取得
  const refreshAvailableMonths = useCallback(() => {
    const months = getAllMonths()
    setAvailableMonths(months)
  }, [])

  // データを再読み込み（月リスト + 現在の月データ）
  const refreshData = useCallback(async () => {
    // 月リストを更新
    const months = getAllMonths()
    setAvailableMonths(months)

    // 現在の月データを再読み込み
    if (currentYearMonth) {
      let data = loadMonthlyData(currentYearMonth)
      if (!data) {
        data = createEmptyMonthlyData(currentYearMonth)
        saveMonthlyData(currentYearMonth, data)
      }
      setMonthlyData(data)
    }
  }, [currentYearMonth])

  // 月次データを更新し、localStorageに保存
  const updateMonthlyData = useCallback(
    (updater: (prev: MonthlyData) => MonthlyData) => {
      if (!monthlyData) return

      const updated = updater(monthlyData)
      setMonthlyData(updated)
      saveMonthlyData(currentYearMonth, updated)
    },
    [monthlyData, currentYearMonth]
  )

  // インポートデータ追加
  const addImportedData = useCallback(
    (parseResult: ExcelParseResult) => {
      updateMonthlyData((prev) => {
        const existingRecords = prev.importedData?.staffRecords || []
        const existingTotals = prev.importedData?.storeTotals || []

        // 同じ店舗のデータがあれば上書き
        const newRecords = existingRecords.filter((r) => r.storeName !== parseResult.storeShortName)
        const newTotals = existingTotals.filter((t) => t.storeName !== parseResult.storeShortName)

        return {
          ...prev,
          importedData: {
            staffRecords: [
              ...newRecords,
              ...parseResult.staffList.map((s) => ({
                ...s,
                storeName: parseResult.storeShortName,
              })),
            ],
            storeTotals: [
              ...newTotals,
              {
                storeName: parseResult.storeShortName,
                ...parseResult.total,
              },
            ],
            importedAt: new Date(),
            fileName: parseResult.storeName,
          },
        }
      })
    },
    [updateMonthlyData]
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
    (storeName: StoreName, updates: Partial<StoreKpi>) => {
      updateMonthlyData((prev) => {
        const existingKpis = prev.manualData.storeKpis || []
        const index = existingKpis.findIndex((k) => k.storeName === storeName)

        if (index >= 0) {
          // 既存データ更新
          const newKpis = [...existingKpis]
          newKpis[index] = {...newKpis[index], ...updates}
          return {
            ...prev,
            manualData: {
              ...prev.manualData,
              storeKpis: newKpis,
            },
          }
        } else {
          // 新規追加
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
                  churnRate: null,
                  csRegistrationCount: null,
                  comment: '',
                  ...updates,
                },
              ],
            },
          }
        }
      })
    },
    [updateMonthlyData]
  )

  // スタッフ手動入力データ更新
  const updateStaffManualData = useCallback(
    (staffName: string, storeName: StoreName, updates: Partial<StaffManualData>) => {
      updateMonthlyData((prev) => {
        const existing = prev.manualData.staffManualData || []
        const index = existing.findIndex((s) => s.staffName === staffName && s.storeName === storeName)

        if (index >= 0) {
          const newList = [...existing]
          newList[index] = {...newList[index], ...updates}
          return {
            ...prev,
            manualData: {
              ...prev.manualData,
              staffManualData: newList,
            },
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
                  ...updates,
                },
              ],
            },
          }
        }
      })
    },
    [updateMonthlyData]
  )

  // お客様の声更新
  const updateCustomerVoice = useCallback(
    (content: string) => {
      updateMonthlyData((prev) => ({
        ...prev,
        manualData: {
          ...prev.manualData,
          customerVoice: {content},
        },
      }))
    },
    [updateMonthlyData]
  )

  // 前月へ移動
  const goToPreviousMonth = useCallback(() => {
    const prevMonth = getPreviousMonth(currentYearMonth)
    setCurrentYearMonth(prevMonth)
  }, [currentYearMonth])

  // 翌月へ移動
  const goToNextMonth = useCallback(() => {
    const nextMonth = getNextMonth(currentYearMonth)
    setCurrentYearMonth(nextMonth)
  }, [currentYearMonth])

  // 新しい月を作成
  const createNewMonth = useCallback(
    (yearMonth: YearMonth) => {
      const newData = createEmptyMonthlyData(yearMonth)
      saveMonthlyData(yearMonth, newData)
      refreshAvailableMonths()
      setCurrentYearMonth(yearMonth)
    },
    [refreshAvailableMonths]
  )

  // monthlyDataがnullの場合は何も表示しない
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
        refreshData,
        addImportedData,
        clearImportedData,
        updateStoreKpi,
        updateStaffManualData,
        updateCustomerVoice,
        goToPreviousMonth,
        goToNextMonth,
        createNewMonth,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
