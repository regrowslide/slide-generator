'use server'

import type {RcCategoryYieldMaster} from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'

export type CategoryYieldInput = {
  categoryName: string
  yieldRate: number
  isFallback?: boolean
}

// 作成
export const createCategoryYield = async (data: CategoryYieldInput): Promise<RcCategoryYieldMaster> => {
  return await prisma.rcCategoryYieldMaster.create({
    data: {
      categoryName: data.categoryName,
      yieldRate: data.yieldRate,
      isFallback: data.isFallback ?? false,
    },
  })
}

// 一覧取得
export const getCategoryYields = async (): Promise<RcCategoryYieldMaster[]> => {
  return await prisma.rcCategoryYieldMaster.findMany({
    orderBy: {sortOrder: 'asc'},
  })
}

// カテゴリ名から歩留率を取得（完全一致 → fallback → 100%）
export const getYieldRateByCategoryName = async (categoryName: string): Promise<number> => {
  // 完全一致
  const exact = await prisma.rcCategoryYieldMaster.findUnique({
    where: {categoryName},
  })
  if (exact) return exact.yieldRate

  // フォールバック
  const fallback = await prisma.rcCategoryYieldMaster.findFirst({
    where: {isFallback: true},
  })
  if (fallback) return fallback.yieldRate

  return 100
}

// 更新
export const updateCategoryYield = async (
  id: number,
  data: Partial<CategoryYieldInput>
): Promise<RcCategoryYieldMaster> => {
  return await prisma.rcCategoryYieldMaster.update({
    where: {id},
    data,
  })
}

// 削除
export const deleteCategoryYield = async (id: number) => {
  return await prisma.rcCategoryYieldMaster.delete({
    where: {id},
  })
}
