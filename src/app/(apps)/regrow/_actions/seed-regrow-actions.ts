'use server'

import path from 'path'
import prisma from 'src/lib/prisma'
import {AuthService} from 'src/lib/services/AuthService'
import {STAFF_BY_STORE, STORE_COMMENTS, CUSTOMER_VOICES, randomInt, randomFloat, getMonthMultiplier} from '../lib/seed-constants'
import {parseAllExcelFiles} from '../lib/excel-parser-server'

// ============================================================
// シード実行（既存データをリセットして再投入）
// ============================================================

export const seedRegrowData = async (): Promise<{message: string}> => {
  // 既存データを削除（依存関係順）
  await resetRegrowData()

  // RoleMaster に regrowロールをupsert
  await Promise.all([
    prisma.roleMaster.upsert({
      where: {name: '管理者'},
      create: {name: '管理者', apps: ['regrow'], description: '管理者'},
      update: {apps: ['regrow'], description: '管理者'},
    }),
  ])

  // 1. 店舗作成
  const stores = await Promise.all([
    prisma.rgStore.create({data: {name: '港北店', sortOrder: 1}}),
    prisma.rgStore.create({data: {name: '青葉店', sortOrder: 2}}),
    prisma.rgStore.create({data: {name: '中央店', sortOrder: 3}}),
  ])

  const storeMap = new Map(stores.map(s => [s.name, s]))

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
    const staffRecordsRaw = allStaff.map(staff => {
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
      const storeStaff = staffRecordsRaw.filter(r => r.storeName === storeName)
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

    // スタッフ手動データ（staffName + storeId FK）
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
// Excelファイルからシード投入
// ============================================================

export const seedFromExcelFiles = async (): Promise<{message: string}> => {
  // 既存データを削除（依存関係順）
  await resetRegrowData()

  // RoleMaster に regrowロールをupsert
  await Promise.all([
    prisma.roleMaster.upsert({
      where: {name: '管理者'},
      create: {name: '管理者', apps: ['regrow'], description: '管理者'},
      update: {apps: ['regrow'], description: '管理者'},
    }),
  ])

  // ① Excelディレクトリからファイルをパース
  const excelDir = path.join(process.cwd(), 'src/app/(apps)/regrow/regrow-doc/excel')

  const parsedFiles = await parseAllExcelFiles(excelDir)

  if (parsedFiles.length === 0) {
    return {message: 'Excelファイルが見つかりませんでした'}
  }

  // ② 店舗名を重複排除して作成
  const storeNames = new Set<string>()
  for (const file of parsedFiles) {
    storeNames.add(file.storeShortName)
  }

  let sortOrder = 1
  const storeMap = new Map<string, {id: number; sortOrder: number}>()
  for (const shortName of storeNames) {
    const store = await prisma.rgStore.create({
      data: {name: shortName, sortOrder},
    })
    storeMap.set(shortName, {id: store.id, sortOrder: store.sortOrder})
    sortOrder++
  }

  // ③ スタッフ名を収集して重複排除 → User作成 + 担当店舗設定
  // スタッフ名 → 最も出現回数が多い店舗を担当店舗とする
  const staffStoreCount = new Map<string, Map<string, number>>() // staffName → (storeName → count)
  for (const file of parsedFiles) {
    for (const staff of file.result.staffList) {
      if (!staffStoreCount.has(staff.staffName)) {
        staffStoreCount.set(staff.staffName, new Map())
      }
      const countMap = staffStoreCount.get(staff.staffName)!
      countMap.set(file.storeShortName, (countMap.get(file.storeShortName) ?? 0) + 1)
    }
  }

  const userMap = new Map<string, string>() // staffName → userId
  for (const [staffName, countMap] of staffStoreCount) {
    // 最も出現回数が多い店舗を担当店舗とする
    let primaryStore = ''
    let maxCount = 0
    for (const [storeName, count] of countMap) {
      if (count > maxCount) {
        primaryStore = storeName
        maxCount = count
      }
    }

    const storeInfo = storeMap.get(primaryStore)
    const user = await AuthService.createUserDirect({
      prismaData: {
        name: staffName,
        apps: ['regrow'],
        rgStoreId: storeInfo?.id ?? null,
      },
    })
    userMap.set(staffName, user.id)
  }

  // ④ 月次データを保存
  // yearMonthごとにグルーピング
  const byYearMonth = new Map<string, typeof parsedFiles>()
  for (const file of parsedFiles) {
    if (!byYearMonth.has(file.yearMonth)) {
      byYearMonth.set(file.yearMonth, [])
    }
    byYearMonth.get(file.yearMonth)!.push(file)
  }

  let totalMonths = 0
  for (const [yearMonth, files] of byYearMonth) {
    const report = await prisma.rgMonthlyReport.create({
      data: {
        yearMonth,
        importedAt: new Date(),
        importedFileName: files.map(f => `${f.yearMonth}_${f.storeShortName}.xlsx`).join(', '),
      },
    })

    // 全店舗のスタッフレコードを集約してランク付け
    const allStaffRecords: Array<{
      staffName: string
      storeId: number
      userId: string | null
      sales: number
      customerCount: number
      newCustomerCount: number
      nominationCount: number
      unitPrice: number
    }> = []

    for (const file of files) {
      const storeInfo = storeMap.get(file.storeShortName)!
      for (const staff of file.result.staffList) {
        allStaffRecords.push({
          staffName: staff.staffName,
          storeId: storeInfo.id,
          userId: userMap.get(staff.staffName) ?? null,
          sales: staff.sales,
          customerCount: staff.customerCount,
          newCustomerCount: staff.newCustomerCount,
          nominationCount: staff.nominationCount,
          unitPrice: staff.unitPrice,
        })
      }
    }

    // 売上順でランク付け
    allStaffRecords.sort((a, b) => b.sales - a.sales)

    await prisma.rgStaffRecord.createMany({
      data: allStaffRecords.map((r, i) => ({
        monthlyReportId: report.id,
        staffName: r.staffName,
        storeId: r.storeId,
        userId: r.userId,
        rank: i + 1,
        sales: r.sales,
        customerCount: r.customerCount,
        newCustomerCount: r.newCustomerCount,
        nominationCount: r.nominationCount,
        unitPrice: r.unitPrice,
      })),
    })

    // 店舗合計（Excelの総合計データを使用）
    for (const file of files) {
      const storeInfo = storeMap.get(file.storeShortName)!
      await prisma.rgStoreTotals.create({
        data: {
          monthlyReportId: report.id,
          storeId: storeInfo.id,
          sales: file.result.total.sales,
          customerCount: file.result.total.customerCount,
          nominationCount: file.result.total.nominationCount,
          unitPrice: file.result.total.unitPrice,
          sortOrder: storeInfo.sortOrder,
        },
      })
    }

    totalMonths++
  }

  return {
    message: `Excelからシード投入完了: 店舗${storeMap.size}件、スタッフ${userMap.size}名、${totalMonths}ヶ月分のデータ（${parsedFiles.length}ファイル）`,
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

  // regrowシードユーザーを削除（admin以外）
  const seedUsers = await prisma.user.findMany({
    where: {role: {not: 'admin'}, apps: {has: 'regrow'}},
    select: {id: true},
  })
  const seedUserIds = seedUsers.map(u => u.id)
  if (seedUserIds.length > 0) {
    await prisma.session.deleteMany({where: {userId: {in: seedUserIds}}})
    await prisma.account.deleteMany({where: {userId: {in: seedUserIds}}})
    await prisma.user.deleteMany({where: {id: {in: seedUserIds}}})
  }

  await prisma.rgStore.deleteMany()

  return {message: '全データをリセットしました'}
}
