'use server'

import prisma from 'src/lib/prisma'
import type {
  KgMenuRecipeWithRelations,
} from '../types'

/**
 * 献立の階層構造:
 * - 日付 has many Category（朝食、昼食、昼間食、夕食）
 * - Category has many Menu（献立）
 * - Menu has many Dish（料理）
 * - Dish has many Ingredient（材料）
 */

// 献立一覧を取得するための型（Dish レベル）
export type KondateListItem = {
  id: number // dailyMenuId
  menuDate: Date
  mealSlotId: number
  mealType: string
  mealTypeName: string
  menuId: number // Menu の ID
  menuCode: string
  menuName: string
  dishId: number // Dish の ID
  dishCode: string
  dishName: string
  ingredientCount: number // 材料数
  unlinkedIngredientCount: number // 未リンク材料数
  createdAt: Date
}

// 献立フィルター
export type KondateFilter = {
  year?: number
  month?: number
  day?: number
  mealType?: string
  recipeName?: string
}

// 献立一覧を取得（Dish レベルで取得）
export const getKondateList = async (
  filter: KondateFilter
): Promise<KondateListItem[]> => {
  const { year, month, day, mealType, recipeName } = filter

  // 年月が指定されている場合は日付範囲を作成
  let dateFrom: Date | undefined
  let dateTo: Date | undefined

  if (year && month) {
    dateFrom = new Date(year, month - 1, day ?? 1)
    if (day) {
      dateTo = new Date(year, month - 1, day + 1)
    } else {
      dateTo = new Date(year, month, 1)
    }
  }

  // MealSlot（Category）を取得
  const mealSlots = await prisma.kgMealSlot.findMany({
    where: {
      ...(dateFrom && dateTo
        ? {
            KgDailyMenu: {
              menuDate: {
                gte: dateFrom,
                lt: dateTo,
              },
            },
          }
        : {}),
      ...(mealType ? { mealType } : {}),
    },
    include: {
      KgDailyMenu: true,
      KgMenuRecipe: {
        where: {
          parentRecipeId: null, // Menu のみ
        },
        include: {
          // Dish（子レシピ）
          ChildRecipes: {
            where: recipeName
              ? {
                  name: {
                    contains: recipeName,
                  },
                }
              : {},
            include: {
              KgRecipeIngredient: {
                select: {
                  id: true,
                  ingredientMasterId: true,
                },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: [
      { KgDailyMenu: { menuDate: 'asc' } },
      { sortOrder: 'asc' },
      { createdAt: 'asc' },
    ],
  })

  // リストに展開（Dish レベル）
  const result: KondateListItem[] = []
  for (const slot of mealSlots) {
    for (const menu of slot.KgMenuRecipe) {
      for (const dish of menu.ChildRecipes) {
        const ingredientCount = dish.KgRecipeIngredient.length
        const unlinkedCount = dish.KgRecipeIngredient.filter(
          (ing) => ing.ingredientMasterId === null
        ).length

        result.push({
          id: slot.KgDailyMenu.id,
          menuDate: slot.KgDailyMenu.menuDate,
          mealSlotId: slot.id,
          mealType: slot.mealType,
          mealTypeName: slot.mealTypeName,
          menuId: menu.id,
          menuCode: menu.code,
          menuName: menu.name,
          dishId: dish.id,
          dishCode: dish.code,
          dishName: dish.name,
          ingredientCount,
          unlinkedIngredientCount: unlinkedCount,
          createdAt: dish.createdAt,
        })
      }
    }
  }

  return result
}

// Menu の詳細を取得（Dish と Ingredient を含む）
export const getMenuDetail = async (
  menuId: number
): Promise<KgMenuRecipeWithRelations | null> => {
  const menu = await prisma.kgMenuRecipe.findUnique({
    where: { id: menuId },
    include: {
      // Menu 自体の材料（通常は空）
      KgRecipeIngredient: {
        include: {
          RcIngredientMaster: true,
        },
        orderBy: { sortOrder: 'asc' },
      },
      // Dish（子レシピ）
      ChildRecipes: {
        include: {
          // Dish の材料
          KgRecipeIngredient: {
            include: {
              RcIngredientMaster: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
          // さらに深い階層（通常は使わない）
          ChildRecipes: {
            include: {
              KgRecipeIngredient: {
                include: {
                  RcIngredientMaster: true,
                },
                orderBy: { sortOrder: 'asc' },
              },
              ChildRecipes: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  return menu as KgMenuRecipeWithRelations | null
}

// 後方互換性のためのエイリアス
export const getRecipeDetail = getMenuDetail

// Dish の詳細を取得（Ingredient を含む）
export const getDishDetail = async (
  dishId: number
): Promise<KgMenuRecipeWithRelations | null> => {
  const dish = await prisma.kgMenuRecipe.findUnique({
    where: { id: dishId },
    include: {
      // Dish の材料
      KgRecipeIngredient: {
        include: {
          RcIngredientMaster: true,
        },
        orderBy: { sortOrder: 'asc' },
      },
      // 親 Menu の情報
      ParentRecipe: true,
      // 子レシピ（通常は空）
      ChildRecipes: {
        include: {
          KgRecipeIngredient: {
            include: {
              RcIngredientMaster: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
          ChildRecipes: true,
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  return dish as KgMenuRecipeWithRelations | null
}

// 材料マスタを検索
export const searchIngredientMasters = async (
  query: string
): Promise<{ id: number; name: string; standardCode: string | null; category: string }[]> => {
  if (!query || query.length < 2) return []

  const masters = await prisma.rcIngredientMaster.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { standardCode: { contains: query } },
      ],
    },
    select: {
      id: true,
      name: true,
      standardCode: true,
      category: true,
    },
    take: 20,
    orderBy: { name: 'asc' },
  })

  return masters
}

// 材料とマスタをリンク
export const linkIngredientToMaster = async (
  ingredientId: number,
  masterId: number | null
): Promise<{ success: boolean; message: string }> => {
  try {
    await prisma.kgRecipeIngredient.update({
      where: { id: ingredientId },
      data: { ingredientMasterId: masterId },
    })
    return { success: true, message: 'リンクを更新しました' }
  } catch (error) {
    console.error('材料リンクエラー:', error)
    return { success: false, message: 'リンクの更新に失敗しました' }
  }
}

// 年月リストを取得（データが存在する年月のみ）
export const getAvailableYearMonths = async (): Promise<
  { year: number; month: number }[]
> => {
  const menus = await prisma.kgDailyMenu.findMany({
    select: { menuDate: true },
    orderBy: { menuDate: 'desc' },
  })

  const yearMonthSet = new Set<string>()
  for (const menu of menus) {
    const date = new Date(menu.menuDate)
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`
    yearMonthSet.add(key)
  }

  return Array.from(yearMonthSet).map((key) => {
    const [year, month] = key.split('-').map(Number)
    return { year, month }
  })
}
