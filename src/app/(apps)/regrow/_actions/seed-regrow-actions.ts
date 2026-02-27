'use server'

import prisma from 'src/lib/prisma'
import {
  STAFF_BY_STORE,
  STORE_COMMENTS,
  CUSTOMER_VOICES,
  randomInt,
  randomFloat,
  getMonthMultiplier,
} from '../lib/seed-constants'

// ============================================================
// シード実行（既存データをリセットして再投入）
// ============================================================

export const seedRegrowData = async (): Promise<{message: string}> => {
  // 既存データを削除（依存関係順）
  await prisma.rgCustomerVoice.deleteMany()
  await prisma.rgStaffManualData.deleteMany()
  await prisma.rgStoreKpi.deleteMany()
  await prisma.rgStoreTotals.deleteMany()
  await prisma.rgStaffRecord.deleteMany()
  await prisma.rgMonthlyReport.deleteMany()
  await prisma.rgStore.deleteMany()

  // RoleMaster に regrowロールをupsert
  await Promise.all([
    prisma.roleMaster.upsert({
      where: {name: 'regrow-admin'},
      create: {name: 'regrow-admin', apps: ['regrow'], description: '管理者'},
      update: {apps: ['regrow'], description: '管理者'},
    }),
    prisma.roleMaster.upsert({
      where: {name: 'regrow-manager'},
      create: {name: 'regrow-manager', apps: ['regrow'], description: '店舗責任者'},
      update: {apps: ['regrow'], description: '店舗責任者'},
    }),
    prisma.roleMaster.upsert({
      where: {name: 'regrow-viewer'},
      create: {name: 'regrow-viewer', apps: ['regrow'], description: '閲覧者'},
      update: {apps: ['regrow'], description: '閲覧者'},
    }),
  ])

  // 1. 店舗作成
  const stores = await Promise.all([
    prisma.rgStore.create({data: {name: '港北店', fullName: 'asian relaxation villa港北店', sortOrder: 1}}),
    prisma.rgStore.create({data: {name: '青葉店', fullName: 'asian relaxation villa青葉店', sortOrder: 2}}),
    prisma.rgStore.create({data: {name: '中央店', fullName: 'asian relaxation villa中央店', sortOrder: 3}}),
  ])

  const storeMap = new Map(stores.map((s) => [s.name, s]))

  // 2. スタッフリスト（RgStaffテーブルは廃止、staffNameを直接使用）
  const allStaff: Array<{staffName: string; storeId: number; storeName: string}> = []
  for (const [storeName, staffNames] of Object.entries(STAFF_BY_STORE)) {
    const store = storeMap.get(storeName)!
    for (const staffName of staffNames) {
      allStaff.push({staffName, storeId: store.id, storeName})
    }
  }

  // 3. 12ヶ月分のデータ作成
  for (let m = 1; m <= 12; m++) {
    const yearMonth = `2026-${String(m).padStart(2, '0')}`
    const multiplier = getMonthMultiplier(m)

    const report = await prisma.rgMonthlyReport.create({
      data: {
        yearMonth,
        importedAt: new Date(`2026-${String(m).padStart(2, '0')}-15`),
        importedFileName: `担当者別分析表_${yearMonth}.xlsx`,
      },
    })

    // スタッフレコード（staffNameを直接保存）
    const staffRecordsRaw = allStaff.map((staff) => {
      const customerCount = randomInt(20, 50)
      const newCustomerCount = randomInt(5, Math.floor(customerCount * 0.3))
      const nominationCount = randomInt(Math.floor(customerCount * 0.3), Math.floor(customerCount * 0.7))
      const baseSales = customerCount * randomInt(6000, 9000)
      const sales = Math.floor(baseSales * multiplier)
      return {
        staffName: staff.staffName,
        storeId: staff.storeId,
        storeName: staff.storeName,
        sales,
        customerCount,
        newCustomerCount,
        nominationCount,
        unitPrice: Math.floor(sales / customerCount),
      }
    })

    staffRecordsRaw.sort((a, b) => b.sales - a.sales)

    await prisma.rgStaffRecord.createMany({
      data: staffRecordsRaw.map((r, i) => ({
        monthlyReportId: report.id,
        staffName: r.staffName,
        storeId: r.storeId,
        rank: i + 1,
        sales: r.sales,
        customerCount: r.customerCount,
        newCustomerCount: r.newCustomerCount,
        nominationCount: r.nominationCount,
        unitPrice: r.unitPrice,
      })),
    })

    // 店舗合計
    for (const [storeName, store] of storeMap.entries()) {
      const storeStaff = staffRecordsRaw.filter((r) => r.storeName === storeName)
      const sales = storeStaff.reduce((sum, r) => sum + r.sales, 0)
      const customerCount = storeStaff.reduce((sum, r) => sum + r.customerCount, 0)
      const nominationCount = storeStaff.reduce((sum, r) => sum + r.nominationCount, 0)

      await prisma.rgStoreTotals.create({
        data: {
          monthlyReportId: report.id,
          storeId: store.id,
          sales,
          customerCount,
          nominationCount,
          unitPrice: customerCount > 0 ? Math.floor(sales / customerCount) : 0,
          sortOrder: store.sortOrder,
        },
      })
    }

    // 店舗KPI
    const comments = STORE_COMMENTS[m] || {}
    for (const [storeName, store] of storeMap.entries()) {
      await prisma.rgStoreKpi.create({
        data: {
          monthlyReportId: report.id,
          storeId: store.id,
          utilizationRate: randomFloat(75, 95),
          returnRate: null,
          csRegistrationCount: randomInt(10, 30),
          comment: comments[storeName] || '',
          sortOrder: store.sortOrder,
        },
      })
    }

    // スタッフ手動データ（staffName + storeNameを直接保存）
    for (const staff of allStaff) {
      await prisma.rgStaffManualData.create({
        data: {
          monthlyReportId: report.id,
          staffName: staff.staffName,
          storeName: staff.storeName,
          utilizationRate: randomFloat(70, 100),
          csRegistrationCount: randomInt(2, 8),
        },
      })
    }

    // お客様の声
    await prisma.rgCustomerVoice.create({
      data: {
        monthlyReportId: report.id,
        content: CUSTOMER_VOICES[m] || '',
      },
    })
  }

  return {
    message: `シードデータを投入しました: 店舗${stores.length}件、スタッフ${allStaff.length}名、12ヶ月分のデータ`,
  }
}

// ============================================================
// リセット（全データ削除のみ）
// ============================================================

export const resetRegrowData = async (): Promise<{message: string}> => {
  await prisma.rgCustomerVoice.deleteMany()
  await prisma.rgStaffManualData.deleteMany()
  await prisma.rgStoreKpi.deleteMany()
  await prisma.rgStoreTotals.deleteMany()
  await prisma.rgStaffRecord.deleteMany()
  await prisma.rgMonthlyReport.deleteMany()
  await prisma.rgStore.deleteMany()

  return {message: '全データをリセットしました'}
}
