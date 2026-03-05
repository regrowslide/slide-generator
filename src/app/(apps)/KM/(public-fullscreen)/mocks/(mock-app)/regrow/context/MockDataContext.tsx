'use client'

/**
 * Regrow モック用データコンテキストプロバイダー
 * localStorage + MOCK_DATA ベースで動作
 */

import React, {useState, useCallback, useEffect} from 'react'
import {DataContext} from '@app/(apps)/regrow/context/DataContext'
import type {DataContextType} from '@app/(apps)/regrow/context/DataContext'
import type {MonthlyData, YearMonth, ExcelParseResult, StoreKpi, StaffManualData, StaffMaster, StoreName, RegrowScopes} from '@app/(apps)/regrow/types'
import type {RgStore} from '@prisma/generated/prisma/client'
import {createEmptyMonthlyData, getCurrentYearMonth, getPreviousMonth, getNextMonth} from '@app/(apps)/regrow/lib/storage'
import {
  loadMonthlyData,
  saveMonthlyData,
  getAllMonths,
  loadStaffMaster,
  upsertStaff,
} from '../lib/mock-storage'
import {MOCK_DATA} from '../lib/mockData'

// モック用店舗データ（RgStore型に合わせる）
const MOCK_STORES = [
  {id: 1, name: '港北店', fullName: '港北店', sortOrder: 0, isActive: true, createdAt: new Date(), updatedAt: new Date()},
  {id: 2, name: '青葉店', fullName: '青葉店', sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date()},
  {id: 3, name: '中央店', fullName: '中央店', sortOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date()},
] as unknown as RgStore[]

type MockDataContextProviderProps = {
  children: React.ReactNode
  initialScopes?: RegrowScopes
}

export const MockDataContextProvider = ({
  children,
  initialScopes,
}: MockDataContextProviderProps) => {
  const scopes = initialScopes || {isAdmin: true, isManager: true}
  const [currentYearMonth, setCurrentYearMonth] = useState<YearMonth>('')
  const [availableMonths, setAvailableMonths] = useState<YearMonth[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null)
  const [staffMaster, setStaffMaster] = useState<StaffMaster[]>([])

  // allMonthlyData: MOCK_DATA をベースに生成
  const allMonthlyData: Record<YearMonth, MonthlyData> = MOCK_DATA

  // スタッフマスタ再読み込み
  const refreshStaffMaster = useCallback(() => {
    setStaffMaster(loadStaffMaster())
  }, [])

  // 初期化
  useEffect(() => {
    const months = getAllMonths()
    setAvailableMonths(months)
    setStaffMaster(loadStaffMaster())

    if (months.length > 0) {
      setCurrentYearMonth(months[0])
    } else {
      setCurrentYearMonth(getCurrentYearMonth())
    }
  }, [])

  // currentYearMonth変更時のデータロード
  useEffect(() => {
    if (!currentYearMonth) return

    // まずlocalStorageから読み込み、なければMOCK_DATAを使用
    let data = loadMonthlyData(currentYearMonth)
    if (!data) {
      data = MOCK_DATA[currentYearMonth] || createEmptyMonthlyData(currentYearMonth)
    }
    setMonthlyData(data)
  }, [currentYearMonth])

  // 利用可能な月リストを再取得
  const refreshAvailableMonths = useCallback(() => {
    setAvailableMonths(getAllMonths())
  }, [])

  // データを再読み込み
  const refreshData = useCallback(async () => {
    setAvailableMonths(getAllMonths())
    if (currentYearMonth) {
      let data = loadMonthlyData(currentYearMonth)
      if (!data) {
        data = MOCK_DATA[currentYearMonth] || createEmptyMonthlyData(currentYearMonth)
      }
      setMonthlyData(data)
    }
  }, [currentYearMonth])

  // 月次データ更新（localStorage保存も行う）
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
    async (parseResult: ExcelParseResult, targetYearMonth?: YearMonth) => {
      const _currentYm = targetYearMonth ?? currentYearMonth

      parseResult.staffList.forEach((staff) => {
        upsertStaff(staff.staffName, parseResult.storeShortName)
      })
      refreshStaffMaster()

      // 対象月に移動
      setCurrentYearMonth(_currentYm)

      // updateMonthlyData 相当の処理を直接実行
      const currentData = loadMonthlyData(_currentYm) || MOCK_DATA[_currentYm] || createEmptyMonthlyData(_currentYm)
      const existingRecords = currentData.importedData?.staffRecords || []
      const existingTotals = currentData.importedData?.storeTotals || []
      const newRecords = existingRecords.filter((r) => r.storeName !== parseResult.storeShortName)
      const newTotals = existingTotals.filter((t) => t.storeName !== parseResult.storeShortName)

      const updated: MonthlyData = {
        ...currentData,
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
      setMonthlyData(updated)
      saveMonthlyData(_currentYm, updated)
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
    async (staffName: string, storeName: StoreName, _storeId: number, updates: Partial<StaffManualData>) => {
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
    async (content: string) => {
      updateMonthlyData((prev) => ({
        ...prev,
        manualData: {...prev.manualData, customerVoice: {content}},
      }))
    },
    [updateMonthlyData]
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
    (yearMonth: YearMonth) => {
      const newData = createEmptyMonthlyData(yearMonth)
      saveMonthlyData(yearMonth, newData)
      setAvailableMonths(getAllMonths())
      setCurrentYearMonth(yearMonth)
    },
    []
  )

  if (!monthlyData) {
    return <div>Loading...</div>
  }

  const value: DataContextType = {
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
    stores: MOCK_STORES,
    currentUserRole: 'admin',
    scopes,
    goToPreviousMonth,
    goToNextMonth,
    createNewMonth,
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
