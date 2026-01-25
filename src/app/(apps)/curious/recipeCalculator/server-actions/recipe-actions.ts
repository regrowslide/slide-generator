'use server'

import type {RcRecipe, RcRecipeIngredient} from '@prisma/generated/prisma/client'
import {convertToKg} from '../lib/unit-converter'
import prisma from 'src/lib/prisma'

export type RecipeWithIngredients = RcRecipe & {
  RcRecipeIngredient: RcRecipeIngredient[]
}

export type RecipeInput = {
  name: string
  status?: string
  lossRate?: number
  packWeightG?: number
  packagingCost?: number
  processingCost?: number
  profitMargin?: number
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

  const createData: any = {
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
  const updateData: Record<string, unknown> = {...data}

  // amount/unitが変更された場合、weightKgを再計算
  if (data.amount !== undefined || data.unit !== undefined) {
    const current = await prisma.rcRecipeIngredient.findUnique({
      where: {id},
    })

    if (current) {
      const amount = data.amount ?? current.amount
      const unit = data.unit ?? current.unit
      updateData.weightKg = convertToKg(amount, unit)
    }
  }

  // pricePerKg/yieldRateが変更された場合、costを再計算
  if (data.pricePerKg !== undefined || data.yieldRate !== undefined) {
    const current = await prisma.rcRecipeIngredient.findUnique({
      where: {id},
    })

    if (current) {
      const pricePerKg = data.pricePerKg ?? current.pricePerKg
      const yieldRate = data.yieldRate ?? current.yieldRate
      const weightKg = (updateData.weightKg as number) ?? current.weightKg
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

  // 各食材のコストを再計算して更新
  for (const ing of recipe.RcRecipeIngredient) {
    const weightKg = convertToKg(ing.amount, ing.unit)
    const adjustedPricePerKg = ing.yieldRate > 0 ? ing.pricePerKg / (ing.yieldRate / 100) : 0
    const cost = adjustedPricePerKg * weightKg

    await prisma.rcRecipeIngredient.update({
      where: {id: ing.id},
      data: {weightKg, cost},
    })

    totalMaterialCost += cost
    totalWeightKg += weightKg
  }

  // 製造パラメータから計算
  const productionWeightKg = totalWeightKg * (1 - recipe.lossRate / 100)
  const packWeightKg = recipe.packWeightG / 1000
  const packCount = packWeightKg > 0 ? Math.floor(productionWeightKg / packWeightKg) : 0
  const materialCostPerPack = packCount > 0 ? totalMaterialCost / packCount : 0
  const totalCostPerPack = materialCostPerPack + recipe.packagingCost + recipe.processingCost
  const sellingPrice = totalCostPerPack + recipe.profitMargin

  // レシピの計算結果を更新
  const result = await prisma.rcRecipe.update({
    where: {id: recipeId},
    data: {
      totalMaterialCost,
      totalWeightKg,
      productionWeightKg,
      packCount,
      materialCostPerPack,
      totalCostPerPack,
      sellingPrice,
    },
    include: {RcRecipeIngredient: {orderBy: {createdAt: 'asc'}}},
  })
  return result
}
