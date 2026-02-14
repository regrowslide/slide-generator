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
import { MEAL_TYPES } from '../lib/constants'

// === 製造指示の動的計算 ===

// 製造計算結果の型
export type ProductionDishData = {
  dishId: number
  dishName: string
  menuName: string
  totalServings: number
  dietBreakdown: {
    dietTypeId: number
    dietTypeName: string
    colorClass: string
    servings: number
  }[]
  ingredients: {
    code: string
    name: string
    totalAmount: number
    unit: string
  }[]
}

export type ProductionMealData = {
  mealType: string
  mealTypeName: string
  dishes: ProductionDishData[]
}

// 献立 × 受注から製造データを動的に計算
export const calculateProductionData = async (
  date: Date
): Promise<ProductionMealData[]> => {
  // 日付範囲（指定日の0:00〜翌日0:00）
  const dateFrom = new Date(date)
  dateFrom.setHours(0, 0, 0, 0)
  const dateTo = new Date(dateFrom)
  dateTo.setDate(dateTo.getDate() + 1)

  // 1. 指定日の献立を取得（Menu → Dish → Ingredient 含む）
  const dailyMenu = await prisma.kgDailyMenu.findFirst({
    where: { menuDate: { gte: dateFrom, lt: dateTo } },
    include: {
      KgMealSlot: {
        orderBy: { sortOrder: 'asc' },
        include: {
          KgMenuRecipe: {
            where: { parentRecipeId: null }, // Menuレベルのみ
            orderBy: { sortOrder: 'asc' },
            include: {
              ChildRecipes: {
                orderBy: { sortOrder: 'asc' },
                include: {
                  KgRecipeIngredient: { orderBy: { sortOrder: 'asc' } },
                },
              },
              KgRecipeIngredient: { orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      },
    },
  })

  if (!dailyMenu) return []

  // 2. 指定日の受注を mealType × dietTypeId で集計
  const orderAggregation = await prisma.kgOrderLine.groupBy({
    by: ['mealType', 'dietTypeId'],
    where: {
      KgOrder: { deliveryDate: { gte: dateFrom, lt: dateTo } },
    },
    _sum: { quantity: true },
  })

  // 受注集計をMapに変換（mealType → dietTypeId → quantity）
  const orderMap = new Map<string, Map<number, number>>()
  for (const row of orderAggregation) {
    if (!orderMap.has(row.mealType)) {
      orderMap.set(row.mealType, new Map())
    }
    orderMap.get(row.mealType)!.set(row.dietTypeId, row._sum.quantity ?? 0)
  }

  // 3. 形態マスタを取得
  const dietTypes = await prisma.kgDietTypeMaster.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  // 4. 食事区分ごとに計算
  const result: ProductionMealData[] = []

  for (const slot of dailyMenu.KgMealSlot) {
    const mealTypeInfo = MEAL_TYPES[slot.mealType as keyof typeof MEAL_TYPES]
    if (!mealTypeInfo) continue

    const mealOrderMap = orderMap.get(slot.mealType)
    // この食事区分の全形態合計食数
    const totalMealServings = mealOrderMap
      ? Array.from(mealOrderMap.values()).reduce((sum, qty) => sum + qty, 0)
      : 0

    const dishes: ProductionDishData[] = []

    for (const menu of slot.KgMenuRecipe) {
      // Menuに子レシピ（Dish）がある場合は、各Dishごとにカードを作成
      const dishSources = menu.ChildRecipes.length > 0 ? menu.ChildRecipes : [menu]

      for (const dish of dishSources) {
        // 形態別内訳
        const dietBreakdown = dietTypes
          .map((dt) => ({
            dietTypeId: dt.id,
            dietTypeName: dt.name,
            colorClass: dt.colorClass ?? 'bg-gray-100 text-gray-800',
            servings: mealOrderMap?.get(dt.id) ?? 0,
          }))
          .filter((d) => d.servings > 0)

        // 必要食材（totalServings で計算）
        const ingredientMap = new Map<
          string,
          { code: string; name: string; totalAmount: number; unit: string }
        >()

        for (const ing of dish.KgRecipeIngredient) {
          const amount = ing.amountPerServing * totalMealServings
          const existing = ingredientMap.get(ing.ingredientCode)
          if (existing) {
            existing.totalAmount += amount
          } else {
            ingredientMap.set(ing.ingredientCode, {
              code: ing.ingredientCode,
              name: ing.ingredientName,
              totalAmount: amount,
              unit: ing.unit,
            })
          }
        }

        dishes.push({
          dishId: dish.id,
          dishName: dish.name,
          menuName: menu.name,
          totalServings: totalMealServings,
          dietBreakdown,
          ingredients: Array.from(ingredientMap.values()),
        })
      }
    }

    result.push({
      mealType: slot.mealType,
      mealTypeName: mealTypeInfo.name,
      dishes,
    })
  }

  return result
}

// === 梱包・配送データ（施設別） ===

// 梱包データの型
export type PackingDishData = {
  dishName: string
  dietBreakdown: {
    dietTypeId: number
    dietTypeName: string
    quantity: number
  }[]
  totalQuantity: number
}

export type PackingMealData = {
  mealType: string
  mealTypeName: string
  dishes: PackingDishData[]
  totalQuantity: number
}

export type PackingFacilityData = {
  facilityId: number | null
  facilityName: string
  meals: PackingMealData[]
  grandTotal: number
}

// 献立 × 受注から施設別の梱包データを計算
export const calculatePackingData = async (
  date: Date
): Promise<PackingFacilityData[]> => {
  const dateFrom = new Date(date)
  dateFrom.setHours(0, 0, 0, 0)
  const dateTo = new Date(dateFrom)
  dateTo.setDate(dateTo.getDate() + 1)

  // 1. 指定日の献立を取得（料理名を参照するため）
  const dailyMenu = await prisma.kgDailyMenu.findFirst({
    where: { menuDate: { gte: dateFrom, lt: dateTo } },
    include: {
      KgMealSlot: {
        orderBy: { sortOrder: 'asc' },
        include: {
          KgMenuRecipe: {
            where: { parentRecipeId: null },
            orderBy: { sortOrder: 'asc' },
            include: {
              ChildRecipes: { orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      },
    },
  })

  // 献立から食事区分ごとの料理名リストを抽出
  const dishNamesByMeal = new Map<string, string[]>()
  if (dailyMenu) {
    for (const slot of dailyMenu.KgMealSlot) {
      const names: string[] = []
      for (const menu of slot.KgMenuRecipe) {
        if (menu.ChildRecipes.length > 0) {
          names.push(...menu.ChildRecipes.map((c) => c.name))
        } else {
          names.push(menu.name)
        }
      }
      dishNamesByMeal.set(slot.mealType, names)
    }
  }

  // 2. 受注明細を施設 × mealType × dietType で取得
  const orderLines = await prisma.kgOrderLine.findMany({
    where: {
      KgOrder: { deliveryDate: { gte: dateFrom, lt: dateTo } },
    },
    include: {
      KgOrder: { include: { KgFacilityMaster: true } },
      KgDietTypeMaster: true,
    },
    orderBy: { sortOrder: 'asc' },
  })

  if (orderLines.length === 0) return []

  // 3. 施設ごとにグループ化
  const facilityMap = new Map<
    number | null,
    {
      facilityName: string
      // mealType → dietTypeId → quantity
      mealDietMap: Map<string, Map<number, { dietTypeName: string; quantity: number }>>
    }
  >()

  for (const line of orderLines) {
    const fId = line.KgOrder.facilityId
    const fName = line.KgOrder.KgFacilityMaster?.name ?? '未登録施設'

    if (!facilityMap.has(fId)) {
      facilityMap.set(fId, { facilityName: fName, mealDietMap: new Map() })
    }
    const facility = facilityMap.get(fId)!

    if (!facility.mealDietMap.has(line.mealType)) {
      facility.mealDietMap.set(line.mealType, new Map())
    }
    const dietMap = facility.mealDietMap.get(line.mealType)!

    const existing = dietMap.get(line.dietTypeId)
    if (existing) {
      existing.quantity += line.quantity
    } else {
      dietMap.set(line.dietTypeId, {
        dietTypeName: line.KgDietTypeMaster.name,
        quantity: line.quantity,
      })
    }
  }

  // 4. 結果を組み立て
  const mealTypeOrder = ['breakfast', 'lunch', 'snack', 'dinner']

  const result: PackingFacilityData[] = []
  for (const [facilityId, data] of facilityMap) {
    const meals: PackingMealData[] = []
    let grandTotal = 0

    // 食事区分を順序通りに
    const sortedMealTypes = Array.from(data.mealDietMap.keys()).sort(
      (a, b) => mealTypeOrder.indexOf(a) - mealTypeOrder.indexOf(b)
    )

    for (const mealType of sortedMealTypes) {
      const mealTypeInfo = MEAL_TYPES[mealType as keyof typeof MEAL_TYPES]
      if (!mealTypeInfo) continue

      const dietMap = data.mealDietMap.get(mealType)!
      const dietBreakdown = Array.from(dietMap.entries()).map(
        ([dietTypeId, d]) => ({
          dietTypeId,
          dietTypeName: d.dietTypeName,
          quantity: d.quantity,
        })
      )
      const mealTotal = dietBreakdown.reduce((s, d) => s + d.quantity, 0)

      // 料理ごとに形態別食数を展開
      const dishNames = dishNamesByMeal.get(mealType) ?? []
      const dishes: PackingDishData[] = dishNames.map((name) => ({
        dishName: name,
        dietBreakdown,
        totalQuantity: mealTotal,
      }))

      // 献立データがない場合は食事区分単位で1行
      if (dishes.length === 0) {
        dishes.push({
          dishName: mealTypeInfo.name,
          dietBreakdown,
          totalQuantity: mealTotal,
        })
      }

      grandTotal += mealTotal

      meals.push({
        mealType,
        mealTypeName: mealTypeInfo.name,
        dishes,
        totalQuantity: mealTotal,
      })
    }

    result.push({
      facilityId,
      facilityName: data.facilityName,
      meals,
      grandTotal,
    })
  }

  // 施設名順でソート
  return result.sort((a, b) => a.facilityName.localeCompare(b.facilityName, 'ja'))
}

// === 原材料集計（材料別） ===

// 原材料集計結果の型
export type IngredientSummaryItem = {
  code: string
  name: string
  totalAmount: number
  unit: string
  // どの料理で使われているかの内訳
  usedIn: {
    mealTypeName: string
    dishName: string
    amount: number
  }[]
}

// 献立 × 受注から材料別に必要量を集計
export const calculateIngredientSummary = async (
  date: Date
): Promise<IngredientSummaryItem[]> => {
  // 日付範囲
  const dateFrom = new Date(date)
  dateFrom.setHours(0, 0, 0, 0)
  const dateTo = new Date(dateFrom)
  dateTo.setDate(dateTo.getDate() + 1)

  // 1. 指定日の献立を取得
  const dailyMenu = await prisma.kgDailyMenu.findFirst({
    where: { menuDate: { gte: dateFrom, lt: dateTo } },
    include: {
      KgMealSlot: {
        orderBy: { sortOrder: 'asc' },
        include: {
          KgMenuRecipe: {
            where: { parentRecipeId: null },
            orderBy: { sortOrder: 'asc' },
            include: {
              ChildRecipes: {
                orderBy: { sortOrder: 'asc' },
                include: {
                  KgRecipeIngredient: { orderBy: { sortOrder: 'asc' } },
                },
              },
              KgRecipeIngredient: { orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      },
    },
  })

  if (!dailyMenu) return []

  // 2. 受注を mealType で集計（形態横断の合計食数）
  const orderAggregation = await prisma.kgOrderLine.groupBy({
    by: ['mealType'],
    where: {
      KgOrder: { deliveryDate: { gte: dateFrom, lt: dateTo } },
    },
    _sum: { quantity: true },
  })

  const mealServingsMap = new Map<string, number>()
  for (const row of orderAggregation) {
    mealServingsMap.set(row.mealType, row._sum.quantity ?? 0)
  }

  // 3. 全食材を材料コード別に集計
  const ingredientMap = new Map<string, IngredientSummaryItem>()

  for (const slot of dailyMenu.KgMealSlot) {
    const mealTypeInfo = MEAL_TYPES[slot.mealType as keyof typeof MEAL_TYPES]
    if (!mealTypeInfo) continue

    const totalServings = mealServingsMap.get(slot.mealType) ?? 0

    for (const menu of slot.KgMenuRecipe) {
      const dishSources = menu.ChildRecipes.length > 0 ? menu.ChildRecipes : [menu]

      for (const dish of dishSources) {
        for (const ing of dish.KgRecipeIngredient) {
          const amount = ing.amountPerServing * totalServings
          const existing = ingredientMap.get(ing.ingredientCode)

          if (existing) {
            existing.totalAmount += amount
            existing.usedIn.push({
              mealTypeName: mealTypeInfo.name,
              dishName: dish.name,
              amount,
            })
          } else {
            ingredientMap.set(ing.ingredientCode, {
              code: ing.ingredientCode,
              name: ing.ingredientName,
              totalAmount: amount,
              unit: ing.unit,
              usedIn: [
                {
                  mealTypeName: mealTypeInfo.name,
                  dishName: dish.name,
                  amount,
                },
              ],
            })
          }
        }
      }
    }
  }

  // 名前順でソート
  return Array.from(ingredientMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'ja')
  )
}

// レシピ食材込みの共通 include
const menuRecipeWithIngredients = {
  include: {
    ChildRecipes: {
      include: { KgRecipeIngredient: true },
    },
    KgRecipeIngredient: true,
  },
}

// 製造バッチ共通 include
const batchInclude = {
  KgProductionItem: {
    orderBy: { sortOrder: 'asc' } as const,
    include: {
      KgMenuRecipe: menuRecipeWithIngredients,
      KgDietTypeMaster: true,
    },
  },
  KgRequiredIngredient: {
    orderBy: { sortOrder: 'asc' } as const,
  },
}

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
    include: batchInclude,
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
    include: batchInclude,
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
    include: batchInclude,
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

  // 既存の製造品目を削除して一括作成
  await prisma.kgProductionItem.deleteMany({
    where: { productionBatchId: batch.id },
  })

  const itemsData = Array.from(itemMap.values()).map((item, idx) => ({
    productionBatchId: batch.id,
    menuRecipeId: item.menuRecipeId,
    dietTypeId: item.dietTypeId,
    totalQuantity: item.totalQuantity,
    sortOrder: idx,
  }))

  if (itemsData.length > 0) {
    await prisma.kgProductionItem.createMany({ data: itemsData })
  }

  // 必要食材を更新
  await replaceRequiredIngredients(
    batch.id,
    Array.from(ingredientMap.values())
  )

  // 更新後のバッチを返す
  return (await getProductionBatch(batch.id))!
}
