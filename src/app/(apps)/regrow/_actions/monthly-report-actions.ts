'use server'

import prisma from 'src/lib/prisma'
import type {
  RgMonthlyReport,
  RgStaffRecord,
  RgStoreTotals as RgStoreTotalsModel,
  RgStoreKpi,
  RgStaffManualData,
  RgCustomerVoice,
  RgStaff,
  RgStore,
} from '@prisma/generated/prisma/client'
import type {
  MonthlyData,
  YearMonth,
  StaffRecord,
  StoreTotals,
  StoreName,
  StoreKpi,
  StaffManualData as StaffManualDataType,
  CustomerVoice,
} from '../types'
import {upsertStaffByName} from './staff-actions'

// ============================================================
// DB型（リレーション含む）
// ============================================================

type RgMonthlyReportWithRelations = RgMonthlyReport & {
  RgStaffRecord: (RgStaffRecord & {RgStaff: RgStaff; RgStore: RgStore})[]
  RgStoreTotals: (RgStoreTotalsModel & {RgStore: RgStore})[]
  RgStoreKpi: (RgStoreKpi & {RgStore: RgStore})[]
  RgStaffManualData: (RgStaffManualData & {RgStaff: RgStaff & {RgStore: RgStore}})[]
  RgCustomerVoice: RgCustomerVoice[]
}

// ============================================================
// 変換ヘルパー
// ============================================================

const convertToMonthlyData = (report: RgMonthlyReportWithRelations): MonthlyData => {
  // スタッフレコード変換
  const staffRecords: StaffRecord[] = report.RgStaffRecord.map((r) => ({
    rank: r.rank,
    staffName: r.RgStaff.staffName,
    storeName: r.RgStore.name as StoreName,
    sales: r.sales,
    customerCount: r.customerCount,
    newCustomerCount: r.newCustomerCount,
    nominationCount: r.nominationCount,
    unitPrice: r.unitPrice,
  }))

  // 店舗合計変換
  const storeTotals: StoreTotals[] = report.RgStoreTotals.map((t) => ({
    storeName: t.RgStore.name as StoreName,
    sales: t.sales,
    customerCount: t.customerCount,
    nominationCount: t.nominationCount,
    unitPrice: t.unitPrice,
  }))

  // 店舗KPI変換
  const storeKpis: StoreKpi[] = report.RgStoreKpi.map((k) => ({
    storeName: k.RgStore.name as StoreName,
    utilizationRate: k.utilizationRate,
    returnRate: k.returnRate,
    csRegistrationCount: k.csRegistrationCount,
    comment: k.comment,
  }))

  // スタッフ手動データ変換
  const staffManualData: StaffManualDataType[] = report.RgStaffManualData.map((m) => ({
    staffName: m.RgStaff.staffName,
    storeName: m.RgStaff.RgStore.name as StoreName,
    utilizationRate: m.utilizationRate,
    csRegistrationCount: m.csRegistrationCount,
  }))

  // お客様の声変換
  const customerVoice: CustomerVoice = {
    content: report.RgCustomerVoice[0]?.content ?? '',
  }

  return {
    yearMonth: report.yearMonth,
    importedData:
      staffRecords.length > 0
        ? {
            staffRecords,
            storeTotals,
            importedAt: report.importedAt ?? new Date(),
            fileName: report.importedFileName ?? '',
          }
        : null,
    manualData: {
      storeKpis,
      staffManualData,
      customerVoice,
    },
    createdAt: report.createdAt,
    updatedAt: report.updatedAt ?? report.createdAt,
  }
}

// ============================================================
// Read
// ============================================================

export const getMonthlyReport = async (yearMonth: string): Promise<MonthlyData | null> => {
  const report = await prisma.rgMonthlyReport.findUnique({
    where: {yearMonth},
    include: {
      RgStaffRecord: {
        include: {RgStaff: true, RgStore: true},
        orderBy: {rank: 'asc'},
      },
      RgStoreTotals: {
        include: {RgStore: true},
        orderBy: {sortOrder: 'asc'},
      },
      RgStoreKpi: {
        include: {RgStore: true},
        orderBy: {sortOrder: 'asc'},
      },
      RgStaffManualData: {
        include: {RgStaff: {include: {RgStore: true}}},
        orderBy: {sortOrder: 'asc'},
      },
      RgCustomerVoice: true,
    },
  })

  if (!report) return null

  return convertToMonthlyData(report as RgMonthlyReportWithRelations)
}

export const getAvailableMonths = async (): Promise<YearMonth[]> => {
  const reports = await prisma.rgMonthlyReport.findMany({
    select: {yearMonth: true},
    orderBy: {yearMonth: 'desc'},
  })
  return reports.map((r) => r.yearMonth)
}

// ============================================================
// Create / Upsert
// ============================================================

export const upsertMonthlyReport = async (yearMonth: string): Promise<RgMonthlyReport> => {
  const existing = await prisma.rgMonthlyReport.findUnique({where: {yearMonth}})
  if (existing) return existing

  return prisma.rgMonthlyReport.create({
    data: {yearMonth},
  })
}

// ============================================================
// Update（インポートデータ保存）
// ============================================================

export const saveImportedData = async (
  yearMonth: string,
  staffRecords: StaffRecord[],
  storeTotals: StoreTotals[]
): Promise<void> => {
  const report = await upsertMonthlyReport(yearMonth)

  // スタッフとストアを名前で解決
  const staffMap = new Map<string, {staffId: number; storeId: number}>()
  for (const record of staffRecords) {
    const key = `${record.staffName}_${record.storeName}`
    if (!staffMap.has(key)) {
      const staff = await upsertStaffByName(record.staffName, record.storeName)
      staffMap.set(key, {staffId: staff.id, storeId: staff.storeId})
    }
  }

  const storeMap = new Map<string, number>()
  const stores = await prisma.rgStore.findMany()
  for (const store of stores) {
    storeMap.set(store.name, store.id)
  }

  // 既存レコードを削除して再作成
  await prisma.rgStaffRecord.deleteMany({where: {monthlyReportId: report.id}})
  await prisma.rgStoreTotals.deleteMany({where: {monthlyReportId: report.id}})

  // スタッフレコード作成
  await prisma.rgStaffRecord.createMany({
    data: staffRecords.map((r) => {
      const resolved = staffMap.get(`${r.staffName}_${r.storeName}`)!
      return {
        monthlyReportId: report.id,
        staffId: resolved.staffId,
        storeId: resolved.storeId,
        rank: r.rank,
        sales: r.sales,
        customerCount: r.customerCount,
        newCustomerCount: r.newCustomerCount,
        nominationCount: r.nominationCount,
        unitPrice: r.unitPrice,
      }
    }),
  })

  // 店舗合計作成
  await prisma.rgStoreTotals.createMany({
    data: storeTotals.map((t, i) => {
      const storeId = storeMap.get(t.storeName)
      if (!storeId) throw new Error(`店舗が見つかりません: ${t.storeName}`)
      return {
        monthlyReportId: report.id,
        storeId,
        sales: t.sales,
        customerCount: t.customerCount,
        nominationCount: t.nominationCount,
        unitPrice: t.unitPrice,
        sortOrder: i + 1,
      }
    }),
  })

  // インポート情報を更新
  await prisma.rgMonthlyReport.update({
    where: {id: report.id},
    data: {
      importedAt: new Date(),
      importedFileName: `担当者別分析表_${yearMonth}.xlsx`,
    },
  })
}

// ============================================================
// Update（手動入力データ保存）
// ============================================================

export const saveStoreKpi = async (
  yearMonth: string,
  storeName: StoreName,
  data: Partial<StoreKpi>
): Promise<void> => {
  const report = await upsertMonthlyReport(yearMonth)
  const store = await prisma.rgStore.findFirst({where: {name: storeName}})
  if (!store) throw new Error(`店舗が見つかりません: ${storeName}`)

  await prisma.rgStoreKpi.upsert({
    where: {
      monthlyReportId_storeId: {
        monthlyReportId: report.id,
        storeId: store.id,
      },
    },
    create: {
      monthlyReportId: report.id,
      storeId: store.id,
      utilizationRate: data.utilizationRate ?? null,
      returnRate: data.returnRate ?? null,
      csRegistrationCount: data.csRegistrationCount ?? null,
      comment: data.comment ?? '',
    },
    update: {
      ...(data.utilizationRate !== undefined && {utilizationRate: data.utilizationRate}),
      ...(data.returnRate !== undefined && {returnRate: data.returnRate}),
      ...(data.csRegistrationCount !== undefined && {csRegistrationCount: data.csRegistrationCount}),
      ...(data.comment !== undefined && {comment: data.comment}),
    },
  })
}

export const saveStaffManualData = async (
  yearMonth: string,
  staffName: string,
  storeName: StoreName,
  data: Partial<StaffManualDataType>
): Promise<void> => {
  const report = await upsertMonthlyReport(yearMonth)
  const staff = await upsertStaffByName(staffName, storeName)

  await prisma.rgStaffManualData.upsert({
    where: {
      monthlyReportId_staffId: {
        monthlyReportId: report.id,
        staffId: staff.id,
      },
    },
    create: {
      monthlyReportId: report.id,
      staffId: staff.id,
      utilizationRate: data.utilizationRate ?? null,
      csRegistrationCount: data.csRegistrationCount ?? null,
    },
    update: {
      ...(data.utilizationRate !== undefined && {utilizationRate: data.utilizationRate}),
      ...(data.csRegistrationCount !== undefined && {csRegistrationCount: data.csRegistrationCount}),
    },
  })
}

export const saveCustomerVoice = async (yearMonth: string, content: string): Promise<void> => {
  const report = await upsertMonthlyReport(yearMonth)

  await prisma.rgCustomerVoice.upsert({
    where: {monthlyReportId: report.id},
    create: {
      monthlyReportId: report.id,
      content,
    },
    update: {content},
  })
}
