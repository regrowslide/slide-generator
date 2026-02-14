'use server'

import type {RcRecipeIngredient} from '@prisma/generated/prisma/client'
import type {RecipeWithIngredients} from '../types'
import {convertToKg} from '../lib/unit-converter'
import {getProfitMarginStandards} from './profit-margin-actions'
import prisma from 'src/lib/prisma'

// Prismaデフォルトの粗利額（schema.prisma の @default(200) と一致）
const DEFAULT_PROFIT_MARGIN = 200

export type RecipeInput = {
  name: string
  status?: string
  lossRate?: number
  packWeightG?: number
  packagingCost?: number
  processingCost?: number
  profitMargin?: number
  otherCost?: number
  productionWeightG?: number | null
  inputMode?: string
  packCount?: number
  sourceType?: string
  sourceFileName?: string
  sourceFileUrl?: string
}

export type RecipeIngredientInput = {
  recipeId: number
  ingredientMasterId?: number | null
  name: string
  originalName?: string
  amount: number
  unit: string
  pricePerKg: number
  yieldRate: number
  isExternal: boolean
  source: string
  status: string
  matchReason?: string | null
  // 外部検索結果の詳細
  externalProductName?: string | null
  externalProductId?: string | null
  externalProductUrl?: string | null
  externalPrice?: number | null
  externalWeight?: number | null
  externalWeightText?: string | null
}

// レシピ一覧取得
export const getRecipes = async (): Promise<RecipeWithIngredients[]> => {
  const result = await prisma.rcRecipe.findMany({
    include: {RcRecipeIngredient: {orderBy: {createdAt: 'asc'}}},
    orderBy: {createdAt: 'desc'},
  })
  return result
}

// レシピ取得（ID指定）
export const getRecipe = async (id: number): Promise<RecipeWithIngredients | null> => {
  const result = await prisma.rcRecipe.findUnique({
    where: {id},
    include: {RcRecipeIngredient: {orderBy: {createdAt: 'asc'}}},
  })
  return result
}

// レシピ作成
export const createRecipe = async (data: RecipeInput): Promise<RecipeWithIngredients> => {
  const result = await prisma.rcRecipe.create({
    data: {
      name: data.name,
      status: data.status ?? 'draft',
      lossRate: data.lossRate ?? 5,
      packWeightG: data.packWeightG ?? 200,
      packagingCost: data.packagingCost ?? 30,
      processingCost: data.processingCost ?? 50,
      profitMargin: data.profitMargin ?? 200,
      otherCost: data.otherCost ?? 0,
      productionWeightG: data.productionWeightG,
      inputMode: data.inputMode ?? 'fillAmount',
      sourceType: data.sourceType,
      sourceFileName: data.sourceFileName,
      sourceFileUrl: data.sourceFileUrl,
    },
    include: {RcRecipeIngredient: {orderBy: {createdAt: 'asc'}}},
  })
  return result as unknown as RecipeWithIngredients
}

// レシピ更新
export const updateRecipe = async (id: number, data: Partial<RecipeInput>): Promise<RecipeWithIngredients> => {
  const result = await prisma.rcRecipe.update({
    where: {id},
    data,
    include: {RcRecipeIngredient: {orderBy: {createdAt: 'asc'}}},
  })
  return result
}

// レシピ削除
export const deleteRecipe = async (id: number) => {
  return await prisma.rcRecipe.delete({
    where: {id},
  })
}

// レシピ食材追加
export const addRecipeIngredient = async (data: RecipeIngredientInput): Promise<RcRecipeIngredient> => {
  const weightKg = convertToKg(data.amount, data.unit)
  const adjustedPricePerKg = data.yieldRate > 0 ? data.pricePerKg / (data.yieldRate / 100) : 0
  const cost = adjustedPricePerKg * weightKg

  // Prismaリレーション形式でデータを構築
  const createData: {
    RcRecipe: {connect: {id: number}}
    name: string
    originalName?: string
    amount: number
    unit: string
    weightKg: number
    pricePerKg: number
    yieldRate: number
    cost: number
    isExternal: boolean
    source: string
    status: string
    matchReason?: string | null
    externalProductName?: string | null
    externalProductId?: string | null
    externalProductUrl?: string | null
    externalPrice?: number | null
    externalWeight?: number | null
    externalWeightText?: string | null
    RcIngredientMaster?: {connect: {id: number}}
  } = {
    RcRecipe: {connect: {id: data.recipeId}},
    name: data.name,
    originalName: data.originalName,
    amount: data.amount,
    unit: data.unit,
    weightKg,
    pricePerKg: data.pricePerKg,
    yieldRate: data.yieldRate,
    cost,
    isExternal: data.isExternal,
    source: data.source,
    status: data.status,
    matchReason: data.matchReason,
    // 外部検索結果の詳細
    externalProductName: data.externalProductName,
    externalProductId: data.externalProductId,
    externalProductUrl: data.externalProductUrl,
    externalPrice: data.externalPrice,
    externalWeight: data.externalWeight,
    externalWeightText: data.externalWeightText,
  }

  // マスタへの紐付けがある場合
  if (data.ingredientMasterId) {
    createData.RcIngredientMaster = {connect: {id: data.ingredientMasterId}}
  }

  const result = await prisma.rcRecipeIngredient.create({
    data: createData,
  })
  return result
}

// レシピ食材一括追加
export const addRecipeIngredients = async (ingredients: RecipeIngredientInput[]): Promise<RcRecipeIngredient[]> => {
  const results: RcRecipeIngredient[] = []
  for (const ing of ingredients) {
    const result = await addRecipeIngredient(ing)
    results.push(result)
  }
  return results
}

// レシピ食材更新
export const updateRecipeIngredient = async (id: number, data: Partial<RecipeIngredientInput>): Promise<RcRecipeIngredient> => {
  const updateData = {...data} as Record<string, unknown>

  // amount/unit/pricePerKg/yieldRate の変更時に weightKg と cost を再計算
  const needsRecalculation =
    data.amount !== undefined || data.unit !== undefined ||
    data.pricePerKg !== undefined || data.yieldRate !== undefined

  if (needsRecalculation) {
    const current = await prisma.rcRecipeIngredient.findUnique({where: {id}})

    if (current) {
      const amount = data.amount ?? current.amount
      const unit = data.unit ?? current.unit
      const weightKg = convertToKg(amount, unit)
      updateData.weightKg = weightKg

      const pricePerKg = data.pricePerKg ?? current.pricePerKg
      const yieldRate = data.yieldRate ?? current.yieldRate
      const adjustedPricePerKg = yieldRate > 0 ? pricePerKg / (yieldRate / 100) : 0
      updateData.cost = adjustedPricePerKg * weightKg
    }
  }

  const result = await prisma.rcRecipeIngredient.update({
    where: {id},
    data: updateData,
  })
  return result
}

// レシピ食材削除
export const deleteRecipeIngredient = async (id: number) => {
  return await prisma.rcRecipeIngredient.delete({
    where: {id},
  })
}

// レシピの原価計算結果を更新
export const recalculateRecipeCosts = async (recipeId: number): Promise<RecipeWithIngredients | null> => {
  const recipe = await getRecipe(recipeId)
  if (!recipe) return null

  let totalMaterialCost = 0
  let totalWeightKg = 0

  // 各食材のコストを再計算してバッチ更新
  const ingredientUpdates: {id: number; weightKg: number; cost: number}[] = []
  for (const ing of recipe.RcRecipeIngredient) {
    const weightKg = convertToKg(ing.amount, ing.unit)
    const adjustedPricePerKg = ing.yieldRate > 0 ? ing.pricePerKg / (ing.yieldRate / 100) : 0
    const cost = adjustedPricePerKg * weightKg

    ingredientUpdates.push({id: ing.id, weightKg, cost})
    totalMaterialCost += cost
    totalWeightKg += weightKg
  }

  // トランザクション内で一括更新
  if (ingredientUpdates.length > 0) {
    await prisma.$transaction(
      ingredientUpdates.map(({id, weightKg, cost}) =>
        prisma.rcRecipeIngredient.update({
          where: {id},
          data: {weightKg, cost},
        })
      )
    )
  }

  // 製造可能重量の決定
  let productionWeightKg: number
  if (recipe.productionWeightG !== null && recipe.productionWeightG > 0) {
    productionWeightKg = recipe.productionWeightG / 1000
  } else {
    productionWeightKg = totalWeightKg * (1 - recipe.lossRate / 100)
  }

  // 入力モードに応じてパック数と充填量を計算
  let packCount: number
  let packWeightG = recipe.packWeightG

  if (recipe.inputMode === 'packCount') {
    packCount = recipe.packCount ?? 0
    // packCount が 0 の場合は充填量を計算しない（Infinity防止）
    if (packCount > 0) {
      packWeightG = (productionWeightKg * 1000) / packCount
    }
  } else {
    const packWeightKg = recipe.packWeightG / 1000
    packCount = packWeightKg > 0 ? Math.floor(productionWeightKg / packWeightKg) : 0
  }

  // パック数に応じた粗利額の自動提案（standard を1回取得してキャッシュ）
  let profitMargin = recipe.profitMargin
  if (packCount > 0) {
    const standards = await getProfitMarginStandards()
    const findStandard = (count: number) =>
      standards.find(s => count >= s.minPackCount && (s.maxPackCount === null || count <= s.maxPackCount)) ?? null

    const currentStandard = findStandard(packCount)
    if (currentStandard) {
      const isDefault = profitMargin === DEFAULT_PROFIT_MARGIN
      const previousStandard = findStandard(recipe.packCount ?? 0)
      const isPreviousStandardValue = previousStandard && profitMargin === previousStandard.minProfitAmount

      if (isDefault || isPreviousStandardValue) {
        profitMargin = currentStandard.minProfitAmount
      }
    }
  }

  const materialCostPerPack = packCount > 0 ? totalMaterialCost / packCount : 0
  const totalCostPerPack = materialCostPerPack + recipe.packagingCost + recipe.processingCost + recipe.otherCost
  const sellingPrice = totalCostPerPack + profitMargin

  const result = await prisma.rcRecipe.update({
    where: {id: recipeId},
    data: {
      totalMaterialCost,
      totalWeightKg,
      productionWeightKg,
      packCount,
      packWeightG,
      profitMargin,
      materialCostPerPack,
      totalCostPerPack,
      sellingPrice,
    },
    include: {RcRecipeIngredient: {orderBy: {createdAt: 'asc'}}},
  })
  return result
}

