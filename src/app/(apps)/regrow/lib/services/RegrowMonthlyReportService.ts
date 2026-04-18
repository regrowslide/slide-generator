import prisma from 'src/lib/prisma'
import type {
  RgMonthlyReport,
  RgStaffRecord,
  RgStoreTotals as RgStoreTotalsModel,
  RgStoreKpi,
  RgStaffManualData,
  RgCustomerVoice,
  RgStore,
} from '@prisma/generated/prisma/client'

// トランザクション内で使用するPrismaクライアントの型
// $transaction のコールバック引数は一部メソッドが除外されるため、
// モデル操作に必要なプロパティのみを要求する
type TransactionClient = {
  rgStaffRecord: typeof prisma.rgStaffRecord
  rgStaffManualData: typeof prisma.rgStaffManualData
  rgStoreTotals: typeof prisma.rgStoreTotals
}
import type {
  MonthlyData,
  YearMonth,
  StaffRecord,
  StoreTotals,
  StoreName,
  StoreKpi,
  StaffManualData as StaffManualDataType,
  CustomerVoice,
  StaffMenuRecord,
  MenuCategory,
} from '../../types'
import type {RgStaffMenuRecord} from '@prisma/generated/prisma/client'

type RgMonthlyReportWithRelations = RgMonthlyReport & {
  RgStaffRecord: (RgStaffRecord & {RgStore: RgStore})[]
  RgStoreTotals: (RgStoreTotalsModel & {RgStore: RgStore})[]
  RgStoreKpi: (RgStoreKpi & {RgStore: RgStore})[]
  RgStaffManualData: (RgStaffManualData & {RgStore: RgStore})[]
  RgCustomerVoice: RgCustomerVoice[]
  RgStaffMenuRecord: (RgStaffMenuRecord & {RgStore: RgStore})[]
}

export class RegrowMonthlyReportService {
  private static convertToMonthlyData(report: RgMonthlyReportWithRelations): MonthlyData {
    // staffNameは直接レコードに保存されているため、RgStaff結合不要
    const staffRecords: StaffRecord[] = report.RgStaffRecord.map((r) => ({
      rank: r.rank,
      staffName: r.staffName,
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
      googleReviewCount: k.googleReviewCount,
      comment: k.comment,
    }))

    const staffManualData: StaffManualDataType[] = report.RgStaffManualData.map((m) => ({
      staffName: m.staffName,
      storeName: m.RgStore.name as StoreName,
      utilizationRate: m.utilizationRate,
      proposalRate: m.proposalRate,
      csRegistrationCount: m.csRegistrationCount,
      googleReviewCount: m.googleReviewCount,
      targetSales: m.targetSales,
    }))

    const customerVoice: CustomerVoice = {
      content: report.RgCustomerVoice[0]?.content ?? '',
    }

    const staffMenuRecords: StaffMenuRecord[] = report.RgStaffMenuRecord.map((m) => ({
      staffName: m.staffName,
      storeName: m.RgStore.name as StoreName,
      menuCategory: m.menuCategory as MenuCategory,
      sales: m.sales,
      customerCount: m.customerCount,
      ratio: m.ratio,
      unitPrice: m.unitPrice,
    }))

    return {
      yearMonth: report.yearMonth,
      importedData:
        staffRecords.length > 0
          ? {
              staffRecords,
              storeTotals,
              staffMenuRecords,
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
      reportUpdatedAt: report.reportUpdatedAt ?? null,
    }
  }

  static async getMonthlyReport(yearMonth: string): Promise<MonthlyData | null> {
    const report = await prisma.rgMonthlyReport.findUnique({
      where: {yearMonth},
      include: {
        RgStaffRecord: {
          include: {RgStore: true},
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
          include: {RgStore: true},
          orderBy: {sortOrder: 'asc'},
        },
        RgCustomerVoice: true,
        RgStaffMenuRecord: {
          include: {RgStore: true},
        },
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
    storeTotals: StoreTotals[],
    staffMenuRecords: StaffMenuRecord[],
    nameToUserIdOverrides?: Record<string, string>
  ): Promise<void> {
    const report = await RegrowMonthlyReportService.upsertMonthlyReport(yearMonth)

    // 店舗名→IDマップを構築
    const storeMap = new Map<string, number>()
    const stores = await prisma.rgStore.findMany()
    for (const store of stores) {
      storeMap.set(store.name, store.id)
    }

    // regrow Userを全件取得し、staffName → userId マップ構築（名前のみでマッチング）
    const rgUsers = await prisma.user.findMany({
      where: {apps: {has: 'regrow'}, banned: {not: true}},
    })
    const userMap = new Map<string, string>()
    const duplicateNames = new Set<string>()
    for (const u of rgUsers) {
      if (userMap.has(u.name)) {
        // 同名ユーザーが複数いる場合はduplicateNamesに追加
        duplicateNames.add(u.name)
      } else {
        userMap.set(u.name, u.id)
      }
    }
    // 重複した名前は自動マッチから除外（overridesで解決する）
    for (const name of duplicateNames) {
      userMap.delete(name)
    }

    // overridesマップ
    const overrides = nameToUserIdOverrides ? new Map(Object.entries(nameToUserIdOverrides)) : null

    // 未登録スタッフチェック（マッチしないスタッフがいたらエラー）
    const unmatchedStaff: string[] = []
    for (const r of staffRecords) {
      const storeId = storeMap.get(r.storeName)
      if (!storeId) throw new Error(`店舗が見つかりません: ${r.storeName}`)
      const userId = overrides?.get(r.staffName) ?? userMap.get(r.staffName)
      if (!userId) unmatchedStaff.push(r.staffName)
    }
    if (unmatchedStaff.length > 0) {
      throw new Error(`未登録スタッフがいるためインポートできません: ${unmatchedStaff.join(', ')}`)
    }

    // 取り込み対象の店舗のみ既存レコードを削除して再作成
    const importStoreIds = [...new Set(staffRecords.map((r) => storeMap.get(r.storeName)!))]
    await prisma.rgStaffRecord.deleteMany({
      where: {monthlyReportId: report.id, storeId: {in: importStoreIds}},
    })
    await prisma.rgStoreTotals.deleteMany({
      where: {monthlyReportId: report.id, storeId: {in: importStoreIds}},
    })
    await prisma.rgStaffMenuRecord.deleteMany({
      where: {monthlyReportId: report.id, storeId: {in: importStoreIds}},
    })

    await prisma.rgStaffRecord.createMany({
      data: staffRecords.map((r) => {
        const storeId = storeMap.get(r.storeName)!
        const userId = (overrides?.get(r.staffName) ?? userMap.get(r.staffName))!
        return {
          monthlyReportId: report.id,
          staffName: r.staffName,
          storeId,
          userId,
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

    if (staffMenuRecords.length > 0) {
      await prisma.rgStaffMenuRecord.createMany({
        data: staffMenuRecords.map((m) => {
          const storeId = storeMap.get(m.storeName)!
          return {
            monthlyReportId: report.id,
            staffName: m.staffName,
            storeId,
            menuCategory: m.menuCategory,
            sales: m.sales,
            customerCount: m.customerCount,
            ratio: m.ratio,
            unitPrice: m.unitPrice,
          }
        }),
      })
    }

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
        googleReviewCount: data.googleReviewCount ?? null,
        comment: data.comment ?? '',
      },
      update: {
        ...(data.utilizationRate !== undefined && {utilizationRate: data.utilizationRate}),
        ...(data.returnRate !== undefined && {returnRate: data.returnRate}),
        ...(data.csRegistrationCount !== undefined && {csRegistrationCount: data.csRegistrationCount}),
        ...(data.googleReviewCount !== undefined && {googleReviewCount: data.googleReviewCount}),
        ...(data.comment !== undefined && {comment: data.comment}),
      },
    })
  }

  static async saveStaffManualData(
    yearMonth: string,
    staffName: string,
    storeId: number,
    data: Partial<StaffManualDataType>
  ): Promise<void> {
    const report = await RegrowMonthlyReportService.upsertMonthlyReport(yearMonth)

    // User マッチングして userId セット
    const user = await prisma.user.findFirst({
      where: {apps: {has: 'regrow'}, name: staffName, rgStoreId: storeId},
    })

    await prisma.rgStaffManualData.upsert({
      where: {
        monthlyReportId_staffName_storeId: {
          monthlyReportId: report.id,
          staffName,
          storeId,
        },
      },
      create: {
        monthlyReportId: report.id,
        staffName,
        storeId,
        userId: user?.id ?? null,
        utilizationRate: data.utilizationRate ?? null,
        proposalRate: data.proposalRate ?? null,
        csRegistrationCount: data.csRegistrationCount ?? null,
        googleReviewCount: data.googleReviewCount ?? null,
        targetSales: data.targetSales ?? null,
      },
      update: {
        ...(data.utilizationRate !== undefined && {utilizationRate: data.utilizationRate}),
        ...(data.proposalRate !== undefined && {proposalRate: data.proposalRate}),
        ...(data.csRegistrationCount !== undefined && {csRegistrationCount: data.csRegistrationCount}),
        ...(data.googleReviewCount !== undefined && {googleReviewCount: data.googleReviewCount}),
        ...(data.targetSales !== undefined && {targetSales: data.targetSales}),
      },
    })
  }

  /**
   * スタッフの売上レコードを別店舗に振り替え、両店舗の合計を再計算する
   * 全操作をトランザクションで実行し、途中失敗時はロールバックする
   */
  static async transferStaffStore(
    yearMonth: string,
    staffName: string,
    fromStoreId: number,
    toStoreId: number
  ): Promise<void> {
    const report = await prisma.rgMonthlyReport.findUnique({where: {yearMonth}})
    if (!report) throw new Error(`月次レポートが見つかりません: ${yearMonth}`)

    await prisma.$transaction(async (tx) => {
      // 振替元のスタッフレコードを取得
      const fromRecords = await tx.rgStaffRecord.findMany({
        where: {monthlyReportId: report.id, staffName, storeId: fromStoreId},
      })
      if (fromRecords.length === 0) {
        throw new Error(`対象のスタッフレコードが見つかりません: ${staffName}（${yearMonth}）`)
      }

      // 振替先に同じスタッフのレコードがあるか確認
      const toRecords = await tx.rgStaffRecord.findMany({
        where: {monthlyReportId: report.id, staffName, storeId: toStoreId},
      })

      if (toRecords.length > 0) {
        // 振替先に既存データがある場合 → 加算して統合
        const toRecord = toRecords[0]
        const fromRecord = fromRecords[0]
        const mergedCustomerCount = toRecord.customerCount + fromRecord.customerCount
        await tx.rgStaffRecord.update({
          where: {id: toRecord.id},
          data: {
            sales: toRecord.sales + fromRecord.sales,
            customerCount: mergedCustomerCount,
            newCustomerCount: toRecord.newCustomerCount + fromRecord.newCustomerCount,
            nominationCount: toRecord.nominationCount + fromRecord.nominationCount,
            unitPrice: mergedCustomerCount > 0
              ? Math.round((toRecord.sales + fromRecord.sales) / mergedCustomerCount)
              : 0,
          },
        })
        // 振替元のレコードを削除
        await tx.rgStaffRecord.deleteMany({
          where: {monthlyReportId: report.id, staffName, storeId: fromStoreId},
        })
      } else {
        // 振替先にデータがない場合 → storeId を変更するだけ
        await tx.rgStaffRecord.updateMany({
          where: {monthlyReportId: report.id, staffName, storeId: fromStoreId},
          data: {storeId: toStoreId},
        })
      }

      // RgStaffManualData の振替
      const fromManualData = await tx.rgStaffManualData.findUnique({
        where: {
          monthlyReportId_staffName_storeId: {
            monthlyReportId: report.id,
            staffName,
            storeId: fromStoreId,
          },
        },
      })
      if (fromManualData) {
        const toManualData = await tx.rgStaffManualData.findUnique({
          where: {
            monthlyReportId_staffName_storeId: {
              monthlyReportId: report.id,
              staffName,
              storeId: toStoreId,
            },
          },
        })

        if (toManualData) {
          // 振替先に既存データがある場合 → 加算して統合、振替元を削除
          await tx.rgStaffManualData.update({
            where: {id: toManualData.id},
            data: {
              utilizationRate: toManualData.utilizationRate ?? fromManualData.utilizationRate,
              proposalRate: toManualData.proposalRate ?? fromManualData.proposalRate,
              csRegistrationCount: (toManualData.csRegistrationCount ?? 0) + (fromManualData.csRegistrationCount ?? 0) || null,
              googleReviewCount: (toManualData.googleReviewCount ?? 0) + (fromManualData.googleReviewCount ?? 0) || null,
              targetSales: (toManualData.targetSales ?? 0) + (fromManualData.targetSales ?? 0) || null,
            },
          })
          await tx.rgStaffManualData.delete({where: {id: fromManualData.id}})
        } else {
          // 振替先にデータがない場合 → delete + create で移動
          await tx.rgStaffManualData.delete({where: {id: fromManualData.id}})
          await tx.rgStaffManualData.create({
            data: {
              monthlyReportId: report.id,
              staffName,
              storeId: toStoreId,
              userId: fromManualData.userId,
              utilizationRate: fromManualData.utilizationRate,
              proposalRate: fromManualData.proposalRate,
              csRegistrationCount: fromManualData.csRegistrationCount,
              googleReviewCount: fromManualData.googleReviewCount,
              targetSales: fromManualData.targetSales,
            },
          })
        }
      }

      // 影響を受ける両店舗の RgStoreTotals を再計算
      await RegrowMonthlyReportService.recalcStoreTotals(tx, report.id, fromStoreId)
      await RegrowMonthlyReportService.recalcStoreTotals(tx, report.id, toStoreId)
    })
  }

  /**
   * 指定店舗の RgStoreTotals を RgStaffRecord から再計算する
   */
  private static async recalcStoreTotals(
    tx: TransactionClient,
    monthlyReportId: number,
    storeId: number
  ): Promise<void> {
    const records = await tx.rgStaffRecord.findMany({
      where: {monthlyReportId, storeId},
    })

    const sales = records.reduce((sum, r) => sum + r.sales, 0)
    const customerCount = records.reduce((sum, r) => sum + r.customerCount, 0)
    const nominationCount = records.reduce((sum, r) => sum + r.nominationCount, 0)
    const unitPrice = customerCount > 0 ? Math.round(sales / customerCount) : 0

    const existing = await tx.rgStoreTotals.findFirst({
      where: {monthlyReportId, storeId},
    })

    if (existing) {
      await tx.rgStoreTotals.update({
        where: {id: existing.id},
        data: {sales, customerCount, nominationCount, unitPrice},
      })
    } else if (records.length > 0) {
      // 振替先に StoreTotals がなければ新規作成
      const maxSortOrder = await tx.rgStoreTotals.aggregate({
        where: {monthlyReportId},
        _max: {sortOrder: true},
      })
      await tx.rgStoreTotals.create({
        data: {
          monthlyReportId,
          storeId,
          sales,
          customerCount,
          nominationCount,
          unitPrice,
          sortOrder: (maxSortOrder._max.sortOrder ?? 0) + 1,
        },
      })
    }
  }

  static async saveCustomerVoice(yearMonth: string, content: string): Promise<void> {
    const report = await RegrowMonthlyReportService.upsertMonthlyReport(yearMonth)

    await prisma.rgCustomerVoice.upsert({
      where: {monthlyReportId: report.id},
      create: {monthlyReportId: report.id, content},
      update: {content},
    })
  }

  /**
   * 手動設定の最終更新日時を保存する（null でクリア）
   */
  static async saveReportUpdatedAt(yearMonth: string, date: Date | null): Promise<void> {
    const report = await RegrowMonthlyReportService.upsertMonthlyReport(yearMonth)
    await prisma.rgMonthlyReport.update({
      where: {id: report.id},
      data: {reportUpdatedAt: date},
    })
  }
}
