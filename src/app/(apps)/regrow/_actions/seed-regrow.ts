import 'dotenv/config'
import {PrismaClient} from '@prisma/generated/prisma/client'
import {PrismaPg} from '@prisma/adapter-pg'
import {
  STAFF_BY_STORE,
  STORE_COMMENTS,
  CUSTOMER_VOICES,
  randomInt,
  randomFloat,
  getMonthMultiplier,
} from '../lib/seed-constants'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({adapter})

// ============================================================
// メイン処理
// ============================================================

const main = async () => {
  console.log('Seeding regrow data...')

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
  console.log('  RoleMaster upsert 完了')

  // 1. 店舗作成
  const stores = await Promise.all([
    prisma.rgStore.create({data: {name: '港北店', fullName: 'asian relaxation villa港北店', sortOrder: 1}}),
    prisma.rgStore.create({data: {name: '青葉店', fullName: 'asian relaxation villa青葉店', sortOrder: 2}}),
    prisma.rgStore.create({data: {name: '中央店', fullName: 'asian relaxation villa中央店', sortOrder: 3}}),
  ])
  console.log(`  店舗作成: ${stores.length}件`)

  const storeMap = new Map(stores.map((s) => [s.name, s]))

  // 2. スタッフリスト（RgStaffテーブルは廃止、staffNameを直接使用）
  const allStaff: Array<{staffName: string; storeId: number; storeName: string}> = []
  for (const [storeName, staffNames] of Object.entries(STAFF_BY_STORE)) {
    const store = storeMap.get(storeName)!
    for (const staffName of staffNames) {
      allStaff.push({staffName, storeId: store.id, storeName})
    }
  }
  console.log(`  スタッフリスト: ${allStaff.length}名`)

  // 3. 12ヶ月分のデータ作成
  for (let m = 1; m <= 12; m++) {
    const yearMonth = `2026-${String(m).padStart(2, '0')}`
    const multiplier = getMonthMultiplier(m)

    // 月次レポート作成
    const report = await prisma.rgMonthlyReport.create({
      data: {
        yearMonth,
        importedAt: new Date(`2026-${String(m).padStart(2, '0')}-15`),
        importedFileName: `担当者別分析表_${yearMonth}.xlsx`,
      },
    })

    // スタッフレコード生成（staffNameを直接保存）
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

    // 売上順にソートしてランク付与
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

    // 店舗合計作成
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

    // 店舗KPI作成
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

    // スタッフ手動データ作成（staffName + storeId FK）
    for (const staff of allStaff) {
      await prisma.rgStaffManualData.create({
        data: {
          monthlyReportId: report.id,
          staffName: staff.staffName,
          storeId: staff.storeId,
          utilizationRate: randomFloat(70, 100),
          csRegistrationCount: randomInt(2, 8),
        },
      })
    }

    // お客様の声作成
    await prisma.rgCustomerVoice.create({
      data: {
        monthlyReportId: report.id,
        content: CUSTOMER_VOICES[m] || '',
      },
    })

    console.log(`  ${yearMonth} データ作成完了`)
  }

  console.log('Regrow seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
