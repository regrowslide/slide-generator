'use server'

import type { Prisma } from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'
import type {
  KgProductionBatch,
  KgProductionBatchWithRelations,
  KgProductionItem,
  KgRequiredIngredient,
  ProductionFilter,
} from '../types'

// 製造バッチ一覧取得
export const getProductionBatches = async (params?: {
  where?: Prisma.KgProductionBatchWhereInput
  orderBy?: Prisma.KgProductionBatchOrderByWithRelationInput
  take?: number
  skip?: number
}): Promise<KgProductionBatchWithRelations[]> => {
  const { where, orderBy, take, skip } = params ?? {}

  return await prisma.kgProductionBatch.findMany({
    where,
    orderBy: orderBy ?? { productionDate: 'desc' },
    take,
    skip,
    include: {
      KgProductionItem: {
        orderBy: { sortOrder: 'asc' },
        include: {
          KgMenuRecipe: true,
          KgDietTypeMaster: true,
        },
      },
      KgRequiredIngredient: {
        orderBy: { sortOrder: 'asc' },
        include: {
          RcIngredientMaster: true,
        },
      },
    },
  }) as KgProductionBatchWithRelations[]
}

// フィルター条件で製造バッチ一覧取得
export const getProductionBatchesByFilter = async (
  filter: ProductionFilter
): Promise<KgProductionBatchWithRelations[]> => {
  const where: Prisma.KgProductionBatchWhereInput = {}

  if (filter.productionDateFrom || filter.productionDateTo) {
    where.productionDate = {
      gte: filter.productionDateFrom,
      lte: filter.productionDateTo,
    }
  }
  if (filter.status) {
    where.status = filter.status
  }
  if (filter.mealType) {
    where.mealType = filter.mealType
  }

  return await getProductionBatches({ where })
}

// 製造バッチ詳細取得
export const getProductionBatch = async (
  id: number
): Promise<KgProductionBatchWithRelations | null> => {
  return await prisma.kgProductionBatch.findUnique({
    where: { id },
    include: {
      KgProductionItem: {
        orderBy: { sortOrder: 'asc' },
        include: {
          KgMenuRecipe: true,
          KgDietTypeMaster: true,
        },
      },
      KgRequiredIngredient: {
        orderBy: { sortOrder: 'asc' },
        include: {
          RcIngredientMaster: true,
        },
      },
    },
  }) as KgProductionBatchWithRelations | null
}

// 日付と食事区分で製造バッチ取得
export const getProductionBatchByDateAndMeal = async (
  productionDate: Date,
  mealType: string
): Promise<KgProductionBatchWithRelations | null> => {
  return await prisma.kgProductionBatch.findUnique({
    where: {
      productionDate_mealType: {
        productionDate,
        mealType,
      },
    },
    include: {
      KgProductionItem: {
        orderBy: { sortOrder: 'asc' },
        include: {
          KgMenuRecipe: true,
          KgDietTypeMaster: true,
        },
      },
      KgRequiredIngredient: {
        orderBy: { sortOrder: 'asc' },
        include: {
          RcIngredientMaster: true,
        },
      },
    },
  }) as KgProductionBatchWithRelations | null
}

// 製造バッチ作成
export const createProductionBatch = async (data: {
  productionDate: Date
  mealType: string
}): Promise<KgProductionBatch> => {
  return await prisma.kgProductionBatch.create({
    data: {
      productionDate: data.productionDate,
      mealType: data.mealType,
      status: 'planned',
    },
  })
}

// 製造バッチまたは取得
export const getOrCreateProductionBatch = async (data: {
  productionDate: Date
  mealType: string
}): Promise<KgProductionBatch> => {
  const existing = await prisma.kgProductionBatch.findUnique({
    where: {
      productionDate_mealType: {
        productionDate: data.productionDate,
        mealType: data.mealType,
      },
    },
  })

  if (existing) {
    return existing
  }

  return await createProductionBatch(data)
}

// 製造バッチステータス更新
export const updateProductionBatchStatus = async (
  id: number,
  status: string
): Promise<KgProductionBatch> => {
  return await prisma.kgProductionBatch.update({
    where: { id },
    data: { status },
  })
}

// 製造バッチ削除
export const deleteProductionBatch = async (id: number): Promise<void> => {
  await prisma.kgProductionBatch.delete({
    where: { id },
  })
}

// 製造品目追加
export const createProductionItem = async (data: {
  productionBatchId: number
  menuRecipeId: number
  dietTypeId: number
  totalQuantity: number
  sortOrder?: number
}): Promise<KgProductionItem> => {
  return await prisma.kgProductionItem.create({
    data: {
      productionBatchId: data.productionBatchId,
      menuRecipeId: data.menuRecipeId,
      dietTypeId: data.dietTypeId,
      totalQuantity: data.totalQuantity,
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

// 製造品目更新
export const updateProductionItem = async (
  id: number,
  data: Partial<{
    totalQuantity: number
    completedQuantity: number
    status: string
  }>
): Promise<KgProductionItem> => {
  return await prisma.kgProductionItem.update({
    where: { id },
    data,
  })
}

// 製造品目の完了数更新
export const updateProductionItemCompleted = async (
  id: number,
  completedQuantity: number
): Promise<KgProductionItem> => {
  const item = await prisma.kgProductionItem.update({
    where: { id },
    data: {
      completedQuantity,
      status: completedQuantity > 0 ? 'in_progress' : 'pending',
    },
  })

  // 全数完了の場合はステータスを完了に
  if (item.completedQuantity >= item.totalQuantity) {
    return await prisma.kgProductionItem.update({
      where: { id },
      data: { status: 'completed' },
    })
  }

  return item
}

// 製造品目削除
export const deleteProductionItem = async (id: number): Promise<void> => {
  await prisma.kgProductionItem.delete({
    where: { id },
  })
}

// 必要食材追加
export const createRequiredIngredient = async (data: {
  productionBatchId: number
  ingredientMasterId?: number
  ingredientCode: string
  ingredientName: string
  totalAmount: number
  unit: string
  estimatedCost?: number
  sortOrder?: number
}): Promise<KgRequiredIngredient> => {
  return await prisma.kgRequiredIngredient.create({
    data: {
      productionBatchId: data.productionBatchId,
      ingredientMasterId: data.ingredientMasterId,
      ingredientCode: data.ingredientCode,
      ingredientName: data.ingredientName,
      totalAmount: data.totalAmount,
      unit: data.unit,
      estimatedCost: data.estimatedCost,
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

// 必要食材を一括作成（既存を削除してから）
export const replaceRequiredIngredients = async (
  productionBatchId: number,
  ingredients: {
    ingredientMasterId?: number
    ingredientCode: string
    ingredientName: string
    totalAmount: number
    unit: string
    estimatedCost?: number
  }[]
): Promise<void> => {
  await prisma.$transaction([
    prisma.kgRequiredIngredient.deleteMany({
      where: { productionBatchId },
    }),
    prisma.kgRequiredIngredient.createMany({
      data: ingredients.map((ing, index) => ({
        productionBatchId,
        ingredientMasterId: ing.ingredientMasterId,
        ingredientCode: ing.ingredientCode,
        ingredientName: ing.ingredientName,
        totalAmount: ing.totalAmount,
        unit: ing.unit,
        estimatedCost: ing.estimatedCost,
        sortOrder: index,
      })),
    }),
  ])
}

// 受注から製造バッチを生成
export const generateProductionBatchFromOrders = async (
  deliveryDate: Date,
  mealType: string
): Promise<KgProductionBatchWithRelations> => {
  // 受注を集計
  const orders = await prisma.kgOrder.findMany({
    where: { deliveryDate, status: { in: ['confirmed', 'processing'] } },
    include: {
      KgOrderLine: {
        where: { mealType },
        include: {
          KgDietTypeMaster: true,
          KgMenuRecipe: {
            include: {
              ChildRecipes: {
                include: {
                  KgRecipeIngredient: true,
                },
              },
              KgRecipeIngredient: true,
            },
          },
        },
      },
    },
  })

  // 製造バッチを作成または取得
  const batch = await getOrCreateProductionBatch({
    productionDate: deliveryDate,
    mealType,
  })

  // 製造品目の集計
  const itemMap = new Map<
    string,
    { menuRecipeId: number; dietTypeId: number; totalQuantity: number }
  >()

  // 必要食材の集計
  const ingredientMap = new Map<
    string,
    {
      ingredientCode: string
      ingredientName: string
      totalAmount: number
      unit: string
    }
  >()

  orders.forEach((order) => {
    order.KgOrderLine.forEach((line) => {
      if (!line.menuRecipeId || !line.KgMenuRecipe) return

      // 製造品目を集計
      const itemKey = `${line.menuRecipeId}-${line.dietTypeId}`
      const existingItem = itemMap.get(itemKey)
      if (existingItem) {
        existingItem.totalQuantity += line.quantity
      } else {
        itemMap.set(itemKey, {
          menuRecipeId: line.menuRecipeId,
          dietTypeId: line.dietTypeId,
          totalQuantity: line.quantity,
        })
      }

      // 食材を集計（レシピと子レシピの食材を含む）
      const collectIngredients = (recipe: typeof line.KgMenuRecipe) => {
        if (!recipe) return
        recipe.KgRecipeIngredient.forEach((ing) => {
          const key = ing.ingredientCode
          const amount = ing.amountPerServing * line.quantity
          const existing = ingredientMap.get(key)
          if (existing) {
            existing.totalAmount += amount
          } else {
            ingredientMap.set(key, {
              ingredientCode: ing.ingredientCode,
              ingredientName: ing.ingredientName,
              totalAmount: amount,
              unit: ing.unit,
            })
          }
        })
        recipe.ChildRecipes?.forEach(collectIngredients)
      }
      collectIngredients(line.KgMenuRecipe)
    })
  })

  // 既存の製造品目を削除して新規作成
  await prisma.kgProductionItem.deleteMany({
    where: { productionBatchId: batch.id },
  })

  let sortOrder = 0
  for (const item of itemMap.values()) {
    await createProductionItem({
      productionBatchId: batch.id,
      menuRecipeId: item.menuRecipeId,
      dietTypeId: item.dietTypeId,
      totalQuantity: item.totalQuantity,
      sortOrder: sortOrder++,
    })
  }

  // 必要食材を更新
  await replaceRequiredIngredients(
    batch.id,
    Array.from(ingredientMap.values())
  )

  // 更新後のバッチを返す
  return (await getProductionBatch(batch.id))!
}
