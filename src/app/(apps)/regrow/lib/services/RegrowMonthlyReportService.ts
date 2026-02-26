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
} from '../../types'
import {RegrowStaffService} from './RegrowStaffService'

type RgMonthlyReportWithRelations = RgMonthlyReport & {
  RgStaffRecord: (RgStaffRecord & {RgStaff: RgStaff; RgStore: RgStore})[]
  RgStoreTotals: (RgStoreTotalsModel & {RgStore: RgStore})[]
  RgStoreKpi: (RgStoreKpi & {RgStore: RgStore})[]
  RgStaffManualData: (RgStaffManualData & {RgStaff: RgStaff & {RgStore: RgStore}})[]
  RgCustomerVoice: RgCustomerVoice[]
}

export class RegrowMonthlyReportService {
  private static convertToMonthlyData(report: RgMonthlyReportWithRelations): MonthlyData {
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

    const storeTotals: StoreTotals[] = report.RgStoreTotals.map((t) => ({
      storeName: t.RgStore.name as StoreName,
      sales: t.sales,
      customerCount: t.customerCount,
      nominationCount: t.nominationCount,
      unitPrice: t.unitPrice,
    }))

    const storeKpis: StoreKpi[] = report.RgStoreKpi.map((k) => ({
      storeName: k.RgStore.name as StoreName,
      utilizationRate: k.utilizationRate,
      returnRate: k.returnRate,
      csRegistrationCount: k.csRegistrationCount,
      comment: k.comment,
    }))

    const staffManualData: StaffManualDataType[] = report.RgStaffManualData.map((m) => ({
      staffName: m.RgStaff.staffName,
      storeName: m.RgStaff.RgStore.name as StoreName,
      utilizationRate: m.utilizationRate,
      csRegistrationCount: m.csRegistrationCount,
    }))

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

  static async getMonthlyReport(yearMonth: string): Promise<MonthlyData | null> {
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

    return RegrowMonthlyReportService.convertToMonthlyData(report as RgMonthlyReportWithRelations)
  }

  static async getAvailableMonths(): Promise<YearMonth[]> {
    const reports = await prisma.rgMonthlyReport.findMany({
      select: {yearMonth: true},
      orderBy: {yearMonth: 'desc'},
    })
    return reports.map((r) => r.yearMonth)
  }

  static async upsertMonthlyReport(yearMonth: string): Promise<RgMonthlyReport> {
    const existing = await prisma.rgMonthlyReport.findUnique({where: {yearMonth}})
    if (existing) return existing

    return prisma.rgMonthlyReport.create({data: {yearMonth}})
  }

  static async saveImportedData(
    yearMonth: string,
    staffRecords: StaffRecord[],
    storeTotals: StoreTotals[]
  ): Promise<void> {
    const report = await RegrowMonthlyReportService.upsertMonthlyReport(yearMonth)

    // スタッフとストアを名前で解決
    const staffMap = new Map<string, {staffId: number; storeId: number}>()
    for (const record of staffRecords) {
      const key = `${record.staffName}_${record.storeName}`
      if (!staffMap.has(key)) {
        const staff = await RegrowStaffService.upsertStaffByName(record.staffName, record.storeName)
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

    await prisma.rgMonthlyReport.update({
      where: {id: report.id},
      data: {
        importedAt: new Date(),
        importedFileName: `担当者別分析表_${yearMonth}.xlsx`,
      },
    })
  }

  static async saveStoreKpi(yearMonth: string, storeName: StoreName, data: Partial<StoreKpi>): Promise<void> {
    const report = await RegrowMonthlyReportService.upsertMonthlyReport(yearMonth)
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

  static async saveStaffManualData(
    yearMonth: string,
    staffName: string,
    storeName: StoreName,
    data: Partial<StaffManualDataType>
  ): Promise<void> {
    const report = await RegrowMonthlyReportService.upsertMonthlyReport(yearMonth)
    const staff = await RegrowStaffService.upsertStaffByName(staffName, storeName)

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

  static async saveCustomerVoice(yearMonth: string, content: string): Promise<void> {
    const report = await RegrowMonthlyReportService.upsertMonthlyReport(yearMonth)

    await prisma.rgCustomerVoice.upsert({
      where: {monthlyReportId: report.id},
      create: {monthlyReportId: report.id, content},
      update: {content},
    })
  }
}
