'use server'

import {RegrowMonthlyReportService} from '../lib/services/RegrowMonthlyReportService'
import type {MonthlyData, YearMonth, StaffRecord, StoreTotals, StoreKpi, StaffManualData, StoreName, StaffMenuRecord} from '../types'
import {sessionOnServer, fetchUserRole} from 'src/non-common/serverSideFunction'
import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {isDev} from '@cm/lib/methods/common'

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
  // 管理者のみ新規作成可能
  const {session} = await sessionOnServer()
  const {roles} = await fetchUserRole({session})
  const scopes = getScopes(session ?? {}, {roles})
  const {isAdmin} = scopes.getRegrowScopes()
  if (!isAdmin) {
    throw new Error('管理者のみ年月データを新規作成できます')
  }
  await RegrowMonthlyReportService.upsertMonthlyReport(yearMonth)
}

export const saveImportedData = async (
  yearMonth: string,
  staffRecords: StaffRecord[],
  storeTotals: StoreTotals[],
  staffMenuRecords: StaffMenuRecord[],
  nameToUserIdOverrides?: Record<string, string>
): Promise<void> => RegrowMonthlyReportService.saveImportedData(yearMonth, staffRecords, storeTotals, staffMenuRecords, nameToUserIdOverrides)

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

export const saveReportUpdatedAt = async (yearMonth: string, date: Date | null): Promise<void> => {
  const {session} = await sessionOnServer()
  const {roles} = await fetchUserRole({session})
  const scopes = getScopes(session ?? {}, {roles})
  const {isAdmin} = scopes.getRegrowScopes()
  if (!isAdmin) throw new Error('管理者のみ最終更新日時を変更できます')
  await RegrowMonthlyReportService.saveReportUpdatedAt(yearMonth, date)
}

// ============================================================
// 売上振替（isDev限定）
// ============================================================

export const transferStaffToStore = async (
  yearMonth: string,
  staffName: string,
  fromStoreId: number,
  toStoreId: number
): Promise<void> => {
  if (!isDev) {
    throw new Error('この機能は開発環境でのみ使用できます')
  }
  await RegrowMonthlyReportService.transferStaffStore(yearMonth, staffName, fromStoreId, toStoreId)
}
