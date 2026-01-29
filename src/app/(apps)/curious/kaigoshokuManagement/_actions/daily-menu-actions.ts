'use server'

import type { Prisma } from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'
import type {
  KgDailyMenu,
  KgDailyMenuWithRelations,
  KgMealSlotWithRelations,
} from '../types'

// 献立一覧取得
export const getDailyMenus = async (params?: {
  where?: Prisma.KgDailyMenuWhereInput
  orderBy?: Prisma.KgDailyMenuOrderByWithRelationInput
  take?: number
  skip?: number
}): Promise<KgDailyMenu[]> => {
  const { where, orderBy, take, skip } = params ?? {}

  return await prisma.kgDailyMenu.findMany({
    where,
    orderBy: orderBy ?? { menuDate: 'desc' },
    take,
    skip,
  })
}

// 献立詳細取得（リレーション含む）
export const getDailyMenuWithRelations = async (
  id: number
): Promise<KgDailyMenuWithRelations | null> => {
  return await prisma.kgDailyMenu.findUnique({
    where: { id },
    include: {
      KgMealSlot: {
        orderBy: { sortOrder: 'asc' },
        include: {
          KgMenuRecipe: {
            where: { parentRecipeId: null }, // トップレベルのレシピのみ
            orderBy: { sortOrder: 'asc' },
            include: {
              ChildRecipes: {
                orderBy: { sortOrder: 'asc' },
                include: {
                  KgRecipeIngredient: {
                    orderBy: { sortOrder: 'asc' },
                    include: { RcIngredientMaster: true },
                  },
                  ChildRecipes: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                      KgRecipeIngredient: {
                        orderBy: { sortOrder: 'asc' },
                        include: { RcIngredientMaster: true },
                      },
                    },
                  },
                },
              },
              KgRecipeIngredient: {
                orderBy: { sortOrder: 'asc' },
                include: { RcIngredientMaster: true },
              },
            },
          },
        },
      },
    },
  }) as KgDailyMenuWithRelations | null
}

// 日付で献立取得
export const getDailyMenuByDate = async (
  menuDate: Date
): Promise<KgDailyMenuWithRelations | null> => {
  const menu = await prisma.kgDailyMenu.findUnique({
    where: { menuDate },
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
                  KgRecipeIngredient: {
                    orderBy: { sortOrder: 'asc' },
                    include: { RcIngredientMaster: true },
                  },
                  ChildRecipes: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                      KgRecipeIngredient: {
                        orderBy: { sortOrder: 'asc' },
                        include: { RcIngredientMaster: true },
                      },
                    },
                  },
                },
              },
              KgRecipeIngredient: {
                orderBy: { sortOrder: 'asc' },
                include: { RcIngredientMaster: true },
              },
            },
          },
        },
      },
    },
  })
  return menu as KgDailyMenuWithRelations | null
}

// 献立作成
export const createDailyMenu = async (data: {
  menuDate: Date
  note?: string
}): Promise<KgDailyMenu> => {
  return await prisma.kgDailyMenu.create({
    data: {
      menuDate: data.menuDate,
      note: data.note,
    },
  })
}

// 献立更新
export const updateDailyMenu = async (
  id: number,
  data: Partial<{
    totalVegetableG: number
    pfc: string
    note: string
  }>
): Promise<KgDailyMenu> => {
  return await prisma.kgDailyMenu.update({
    where: { id },
    data,
  })
}

// 献立削除
export const deleteDailyMenu = async (id: number): Promise<void> => {
  await prisma.kgDailyMenu.delete({
    where: { id },
  })
}

// 食事区分を取得または作成
export const getOrCreateMealSlot = async (data: {
  dailyMenuId: number
  mealType: string
  mealTypeName: string
  sortOrder: number
}): Promise<KgMealSlotWithRelations> => {
  const existing = await prisma.kgMealSlot.findUnique({
    where: {
      dailyMenuId_mealType: {
        dailyMenuId: data.dailyMenuId,
        mealType: data.mealType,
      },
    },
    include: {
      KgMenuRecipe: {
        where: { parentRecipeId: null },
        orderBy: { sortOrder: 'asc' },
        include: {
          ChildRecipes: {
            orderBy: { sortOrder: 'asc' },
            include: {
              KgRecipeIngredient: {
                orderBy: { sortOrder: 'asc' },
                include: { RcIngredientMaster: true },
              },
            },
          },
          KgRecipeIngredient: {
            orderBy: { sortOrder: 'asc' },
            include: { RcIngredientMaster: true },
          },
        },
      },
    },
  })

  if (existing) {
    return existing as KgMealSlotWithRelations
  }

  const created = await prisma.kgMealSlot.create({
    data: {
      dailyMenuId: data.dailyMenuId,
      mealType: data.mealType,
      mealTypeName: data.mealTypeName,
      sortOrder: data.sortOrder,
    },
    include: {
      KgMenuRecipe: {
        where: { parentRecipeId: null },
        orderBy: { sortOrder: 'asc' },
        include: {
          ChildRecipes: {
            orderBy: { sortOrder: 'asc' },
            include: {
              KgRecipeIngredient: {
                orderBy: { sortOrder: 'asc' },
                include: { RcIngredientMaster: true },
              },
            },
          },
          KgRecipeIngredient: {
            orderBy: { sortOrder: 'asc' },
            include: { RcIngredientMaster: true },
          },
        },
      },
    },
  })

  return created as KgMealSlotWithRelations
}

// 食事区分の栄養素を更新
export const updateMealSlotNutrients = async (
  id: number,
  data: {
    totalEnergy?: number
    totalProtein?: number
    totalFat?: number
    totalCarb?: number
    totalSodium?: number
    totalSalt?: number
    totalVegetableG?: number
  }
): Promise<void> => {
  await prisma.kgMealSlot.update({
    where: { id },
    data,
  })
}
