'use server'

import type {RcProfitMarginStandard} from '@prisma/generated/prisma/client'
import type {ProfitMarginAlert} from '../types'
import prisma from 'src/lib/prisma'

export type ProfitMarginStandardInput = {
  minPackCount: number
  maxPackCount?: number | null
  minProfitAmount: number
  minProfitRate: number
}

// 粗利基準一覧取得
export const getProfitMarginStandards = async (): Promise<RcProfitMarginStandard[]> => {
  const result = await prisma.rcProfitMarginStandard.findMany({
    orderBy: {minPackCount: 'asc'},
  })
  return result
}

// 粗利基準取得（ID指定）
export const getProfitMarginStandard = async (id: number): Promise<RcProfitMarginStandard | null> => {
  const result = await prisma.rcProfitMarginStandard.findUnique({
    where: {id},
  })
  return result
}

// 粗利基準作成
export const createProfitMarginStandard = async (data: ProfitMarginStandardInput): Promise<RcProfitMarginStandard> => {
  const result = await prisma.rcProfitMarginStandard.create({
    data: {
      minPackCount: data.minPackCount,
      maxPackCount: data.maxPackCount,
      minProfitAmount: data.minProfitAmount,
      minProfitRate: data.minProfitRate,
    },
  })
  return result
}

// 粗利基準更新
export const updateProfitMarginStandard = async (
  id: number,
  data: Partial<ProfitMarginStandardInput>
): Promise<RcProfitMarginStandard> => {
  const result = await prisma.rcProfitMarginStandard.update({
    where: {id},
    data,
  })
  return result
}

// 粗利基準削除
export const deleteProfitMarginStandard = async (id: number) => {
  return await prisma.rcProfitMarginStandard.delete({
    where: {id},
  })
}

// パック数に該当する粗利基準を取得
export const getApplicableStandard = async (packCount: number): Promise<RcProfitMarginStandard | null> => {
  const standards = await getProfitMarginStandards()

  for (const standard of standards) {
    const isAboveMin = packCount >= standard.minPackCount
    const isBelowMax = standard.maxPackCount === null || packCount <= standard.maxPackCount

    if (isAboveMin && isBelowMax) {
      return standard
    }
  }

  return null
}

// 粗利アラート判定
export const checkProfitMarginAlert = async (
  packCount: number,
  profitMargin: number,
  sellingPrice: number
): Promise<ProfitMarginAlert | null> => {
  // 基本チェック
  if (packCount <= 0 || sellingPrice <= 0) {
    return null
  }

  const standard = await getApplicableStandard(packCount)
  if (!standard) {
    return null
  }

  // 現在の粗利率を計算
  const currentProfitRate = (profitMargin / sellingPrice) * 100

  // アラート判定
  const isBelowAmount = profitMargin < standard.minProfitAmount
  const isBelowRate = currentProfitRate < standard.minProfitRate
  const isWarning = isBelowAmount || isBelowRate

  let message = ''
  if (isBelowAmount && isBelowRate) {
    message = `粗利額と粗利率が基準を下回っています（基準: ¥${standard.minProfitAmount}以上、${standard.minProfitRate}%以上）`
  } else if (isBelowAmount) {
    message = `粗利額が基準を下回っています（基準: ¥${standard.minProfitAmount}以上）`
  } else if (isBelowRate) {
    message = `粗利率が基準を下回っています（基準: ${standard.minProfitRate}%以上）`
  }

  return {
    isWarning,
    currentProfitRate,
    minProfitAmount: standard.minProfitAmount,
    minProfitRate: standard.minProfitRate,
    message,
  }
}
