'use client'

/**
 * Regrow データコンテキスト
 * YYYY-MM単位のデータ管理
 * initialData有り → Server Actions経由でDB操作
 * initialData無し → localStorage経由（モック用フォールバック）
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import type { MonthlyData, YearMonth, ExcelParseResult, StoreKpi, StaffManualData, StaffMaster, StaffRole, StoreName, RegrowScopes } from '../types'
import type { RgStore } from '@prisma/generated/prisma/client'
import {
  loadMonthlyData,
  saveMonthlyData,
  getAllMonths,
  createEmptyMonthlyData,
  getCurrentYearMonth,
  getPreviousMonth,
  getNextMonth,
  loadStaffMaster,
  upsertStaff,
} from '../lib/storage'
import {
  getMonthlyReport,
  getAvailableMonths,
  saveImportedData,
  saveStoreKpi,
  saveStaffManualData,
  saveCustomerVoice,
  upsertMonthlyReport,
} from '../_actions/monthly-report-actions'
import { getStaffMaster } from '../_actions/staff-actions'

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

  // インポートデータ更新（targetYearMonth: 保存先の年月。省略時はcurrentYearMonth）
  addImportedData: (parseResult: ExcelParseResult, targetYearMonth?: YearMonth) => void
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

type DataContextProviderProps = {
  children: React.ReactNode
  initialMonths?: YearMonth[]
  initialYearMonth?: YearMonth
  initialData?: MonthlyData | null
  initialStaffMaster?: StaffMaster[]
  initialStores?: RgStore[]
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
  currentUserRole = 'viewer',
  initialScopes,
}: DataContextProviderProps) => {
  const scopes = initialScopes
  // DB版かlocalStorage版かを判定（initialYearMonthがあればDB版）
  const useDb = initialYearMonth !== undefined

  const [currentYearMonth, setCurrentYearMonth] = useState<YearMonth>(initialYearMonth ?? '')
  const [availableMonths, setAvailableMonths] = useState<YearMonth[]>(initialMonths ?? [])
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(initialData ?? null)
  const [staffMaster, setStaffMaster] = useState<StaffMaster[]>(initialStaffMaster ?? [])
  const [stores, setStores] = useState<RgStore[]>(initialStores ?? [])

  // ============================================================
  // DB版のスタッフマスタ再読み込み
  // ============================================================
  const refreshStaffMasterFromDb = useCallback(async () => {
    const staffMaster = await getStaffMaster()
    setStaffMaster(staffMaster)
  }, [])

  // ============================================================
  // localStorage版（モック用フォールバック）
  // ============================================================
  const refreshStaffMasterLocal = useCallback(() => {
    setStaffMaster(loadStaffMaster())
  }, [])

  const refreshStaffMaster = useCallback(() => {
    if (useDb) {
      refreshStaffMasterFromDb()
    } else {
      refreshStaffMasterLocal()
    }
  }, [useDb, refreshStaffMasterFromDb, refreshStaffMasterLocal])

  // localStorage版の初期化
  useEffect(() => {
    if (useDb) return
    const months = getAllMonths()
    setAvailableMonths(months)
    setStaffMaster(loadStaffMaster())

    if (months.length > 0) {
      setCurrentYearMonth(months[0])
    } else {
      setCurrentYearMonth(getCurrentYearMonth())
    }
  }, [useDb])

  // currentYearMonth変更時のデータロード
  useEffect(() => {
    if (!currentYearMonth) return

    if (useDb) {
      // DB版: Server Actionで取得
      const load = async () => {
        let data = await getMonthlyReport(currentYearMonth)
        if (!data) {
          await upsertMonthlyReport(currentYearMonth)
          data = createEmptyMonthlyData(currentYearMonth)
        }
        setMonthlyData(data)
      }
      // initialDataがある最初のロードはスキップ
      if (initialData && currentYearMonth === initialYearMonth) return
      load()
    } else {
      // localStorage版
      let data = loadMonthlyData(currentYearMonth)
      if (!data) {
        data = createEmptyMonthlyData(currentYearMonth)
        saveMonthlyData(currentYearMonth, data)
      }
      setMonthlyData(data)
    }
  }, [currentYearMonth, useDb])

  // 利用可能な月リストを再取得
  const refreshAvailableMonths = useCallback(async () => {
    if (useDb) {
      const months = await getAvailableMonths()
      setAvailableMonths(months)
    } else {
      setAvailableMonths(getAllMonths())
    }
  }, [useDb])

  // データを再読み込み
  const refreshData = useCallback(async () => {
    if (useDb) {
      const months = await getAvailableMonths()
      setAvailableMonths(months)
      if (currentYearMonth) {
        const data = await getMonthlyReport(currentYearMonth)
        if (data) setMonthlyData(data)
      }
    } else {
      setAvailableMonths(getAllMonths())
      if (currentYearMonth) {
        let data = loadMonthlyData(currentYearMonth)
        if (!data) {
          data = createEmptyMonthlyData(currentYearMonth)
          saveMonthlyData(currentYearMonth, data)
        }
        setMonthlyData(data)
      }
    }
  }, [currentYearMonth, useDb])

  // 月次データ更新（楽観的更新用、localStorage版では保存も行う）
  const updateMonthlyData = useCallback(
    (updater: (prev: MonthlyData) => MonthlyData) => {
      if (!monthlyData) return
      const updated = updater(monthlyData)
      setMonthlyData(updated)
      if (!useDb) {
        saveMonthlyData(currentYearMonth, updated)
      }
    },
    [monthlyData, currentYearMonth, useDb]
  )

  // インポートデータ追加
  const addImportedData = useCallback(
    async (parseResult: ExcelParseResult, targetYearMonth?: YearMonth) => {
      const saveYearMonth = targetYearMonth ?? currentYearMonth
      if (useDb) {
        // DB版: Server Action経由で保存
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

        await saveImportedData(saveYearMonth, staffRecords, storeTotals as any)

        // DB再取得で最新データを反映（対象月に移動してから取得）
        setCurrentYearMonth(saveYearMonth)
        const updated = await getMonthlyReport(saveYearMonth)
        if (updated) setMonthlyData(updated)

        // スタッフマスタも再取得
        await refreshStaffMasterFromDb()
      } else {
        // localStorage版
        parseResult.staffList.forEach((staff) => {
          upsertStaff(staff.staffName, parseResult.storeShortName)
        })
        refreshStaffMasterLocal()

        updateMonthlyData((prev) => {
          const existingRecords = prev.importedData?.staffRecords || []
          const existingTotals = prev.importedData?.storeTotals || []
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
      }
    },
    [currentYearMonth, useDb, updateMonthlyData, refreshStaffMasterFromDb, refreshStaffMasterLocal]
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
          newKpis[index] = { ...newKpis[index], ...updates }
          return {
            ...prev,
            manualData: { ...prev.manualData, storeKpis: newKpis },
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

      // DB版: Server Actionで保存
      if (useDb) {
        await saveStoreKpi(currentYearMonth, storeName, updates)
      }
    },
    [updateMonthlyData, currentYearMonth, useDb]
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
          newList[index] = { ...newList[index], ...updates }
          return {
            ...prev,
            manualData: { ...prev.manualData, staffManualData: newList },
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

      // DB版: Server Actionで保存（storeIdベース）
      if (useDb) {
        await saveStaffManualData(currentYearMonth, staffName, storeId, updates)
      }
    },
    [updateMonthlyData, currentYearMonth, useDb]
  )

  // お客様の声更新
  const updateCustomerVoice = useCallback(
    async (content: string) => {
      // 楽観的にState更新
      updateMonthlyData((prev) => ({
        ...prev,
        manualData: { ...prev.manualData, customerVoice: { content } },
      }))

      // DB版: Server Actionで保存
      if (useDb) {
        await saveCustomerVoice(currentYearMonth, content)
      }
    },
    [updateMonthlyData, currentYearMonth, useDb]
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
      if (useDb) {
        await upsertMonthlyReport(yearMonth)
        const months = await getAvailableMonths()
        setAvailableMonths(months)
      } else {
        const newData = createEmptyMonthlyData(yearMonth)
        saveMonthlyData(yearMonth, newData)
        setAvailableMonths(getAllMonths())
      }
      setCurrentYearMonth(yearMonth)
    },
    [useDb]
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
        goToPreviousMonth,
        goToNextMonth,
        createNewMonth,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
