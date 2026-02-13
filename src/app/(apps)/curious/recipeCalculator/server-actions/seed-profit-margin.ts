'use server'

import prisma from 'src/lib/prisma'

// 粗利基準マスタの初期データ投入
export const seedProfitMarginStandards = async () => {
  // 既存データを削除
  await prisma.rcProfitMarginStandard.deleteMany()

  const standards = [
    {minPackCount: 100, maxPackCount: 299, minProfitAmount: 300, minProfitRate: 50, sortOrder: 1},
    {minPackCount: 300, maxPackCount: 499, minProfitAmount: 250, minProfitRate: 45, sortOrder: 2},
    {minPackCount: 500, maxPackCount: 999, minProfitAmount: 150, minProfitRate: 40, sortOrder: 3},
    {minPackCount: 1000, maxPackCount: 1999, minProfitAmount: 100, minProfitRate: 35, sortOrder: 4},
    {minPackCount: 2000, maxPackCount: 2999, minProfitAmount: 80, minProfitRate: 32, sortOrder: 5},
    {minPackCount: 3000, maxPackCount: 6999, minProfitAmount: 80, minProfitRate: 30, sortOrder: 6},
    {minPackCount: 7000, maxPackCount: 9999, minProfitAmount: 60, minProfitRate: 30, sortOrder: 7},
    {minPackCount: 10000, maxPackCount: null, minProfitAmount: 50, minProfitRate: 30, sortOrder: 8},
  ]

  const result = await prisma.rcProfitMarginStandard.createMany({
    data: standards,
  })

  return result
}
