'use server'

import prisma from 'src/lib/prisma'

// カテゴリ歩留率マスタの初期データ投入
export const seedCategoryYields = async () => {
  await prisma.rcCategoryYieldMaster.deleteMany()

  const categories = [
    {categoryName: 'お肉', yieldRate: 70, isFallback: false, sortOrder: 1},
    {categoryName: '葉物野菜', yieldRate: 50, isFallback: false, sortOrder: 2},
    {categoryName: 'その他野菜', yieldRate: 80, isFallback: false, sortOrder: 3},
    {categoryName: 'その他', yieldRate: 95, isFallback: true, sortOrder: 4},
  ]

  return await prisma.rcCategoryYieldMaster.createMany({
    data: categories,
  })
}
