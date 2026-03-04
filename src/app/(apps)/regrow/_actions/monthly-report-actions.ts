'use server'

import {RegrowMonthlyReportService} from '../lib/services/RegrowMonthlyReportService'
import type {MonthlyData, YearMonth, StaffRecord, StoreTotals, StoreKpi, StaffManualData, StoreName} from '../types'

// ============================================================
// Read
// ============================================================

export const getMonthlyReport = async (yearMonth: string): Promise<MonthlyData | null> =>
  RegrowMonthlyReportService.getMonthlyReport(yearMonth)

export const getAvailableMonths = async (): Promise<YearMonth[]> =>
  RegrowMonthlyReportService.getAvailableMonths()

// ============================================================
// Create / Upsert
// ============================================================

export const upsertMonthlyReport = async (yearMonth: string): Promise<void> => {
  await RegrowMonthlyReportService.upsertMonthlyReport(yearMonth)
}

export const saveImportedData = async (
  yearMonth: string,
  staffRecords: StaffRecord[],
  storeTotals: StoreTotals[],
  nameToUserIdOverrides?: Record<string, number>
): Promise<void> => RegrowMonthlyReportService.saveImportedData(yearMonth, staffRecords, storeTotals, nameToUserIdOverrides)

// ============================================================
// Update（手動入力データ保存）
// ============================================================

export const saveStoreKpi = async (
  yearMonth: string,
  storeName: StoreName,
  data: Partial<StoreKpi>
): Promise<void> => RegrowMonthlyReportService.saveStoreKpi(yearMonth, storeName, data)

export const saveStaffManualData = async (
  yearMonth: string,
  staffName: string,
  storeId: number,
  data: Partial<StaffManualData>
): Promise<void> => RegrowMonthlyReportService.saveStaffManualData(yearMonth, staffName, storeId, data)

export const saveCustomerVoice = async (yearMonth: string, content: string): Promise<void> =>
  RegrowMonthlyReportService.saveCustomerVoice(yearMonth, content)
