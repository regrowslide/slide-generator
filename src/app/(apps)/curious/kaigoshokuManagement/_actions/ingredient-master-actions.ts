'use server'

import prisma from 'src/lib/prisma'

// 材料マスタの型
export type IngredientMasterItem = {
  id: number
  name: string
  standardCode: string | null
  price: number
  yield: number
  category: string
  supplier: string
  energyPer100g: number | null
  proteinPer100g: number | null
  fatPer100g: number | null
  carbPer100g: number | null
  sodiumPer100g: number | null
  linkedKondateCount: number // 献立で使用されている数
}

// 材料マスタ一覧を取得
export const getIngredientMasters = async (filter: {
  search?: string
  category?: string
}): Promise<{
  masters: IngredientMasterItem[]
  categories: string[]
}> => {
  const { search, category } = filter

  const masters = await prisma.rcIngredientMaster.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { standardCode: { contains: search } },
            ],
          }
        : {}),
      ...(category ? { category } : {}),
    },
    include: {
      _count: {
        select: { KgRecipeIngredient: true },
      },
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })

  // カテゴリ一覧を取得
  const categoryList = await prisma.rcIngredientMaster.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  })

  return {
    masters: masters.map((m) => ({
      id: m.id,
      name: m.name,
      standardCode: m.standardCode,
      price: m.price,
      yield: m.yield,
      category: m.category,
      supplier: m.supplier,
      energyPer100g: m.energyPer100g,
      proteinPer100g: m.proteinPer100g,
      fatPer100g: m.fatPer100g,
      carbPer100g: m.carbPer100g,
      sodiumPer100g: m.sodiumPer100g,
      linkedKondateCount: m._count.KgRecipeIngredient,
    })),
    categories: categoryList.map((c) => c.category),
  }
}

// 材料マスタを作成
export const createIngredientMaster = async (data: {
  name: string
  standardCode?: string
  price: number
  yield: number
  category: string
  supplier: string
  energyPer100g?: number
  proteinPer100g?: number
  fatPer100g?: number
  carbPer100g?: number
  sodiumPer100g?: number
}): Promise<{ success: boolean; message: string; id?: number }> => {
  try {
    const master = await prisma.rcIngredientMaster.create({
      data: {
        name: data.name,
        standardCode: data.standardCode ?? null,
        price: data.price,
        yield: data.yield,
        category: data.category,
        supplier: data.supplier,
        energyPer100g: data.energyPer100g ?? null,
        proteinPer100g: data.proteinPer100g ?? null,
        fatPer100g: data.fatPer100g ?? null,
        carbPer100g: data.carbPer100g ?? null,
        sodiumPer100g: data.sodiumPer100g ?? null,
      },
    })
    return { success: true, message: '材料マスタを登録しました', id: master.id }
  } catch (error) {
    console.error('材料マスタ作成エラー:', error)
    return { success: false, message: '登録に失敗しました' }
  }
}

// 材料マスタを更新
export const updateIngredientMaster = async (
  id: number,
  data: {
    name?: string
    standardCode?: string | null
    price?: number
    yield?: number
    category?: string
    supplier?: string
    energyPer100g?: number | null
    proteinPer100g?: number | null
    fatPer100g?: number | null
    carbPer100g?: number | null
    sodiumPer100g?: number | null
  }
): Promise<{ success: boolean; message: string }> => {
  try {
    await prisma.rcIngredientMaster.update({
      where: { id },
      data,
    })
    return { success: true, message: '材料マスタを更新しました' }
  } catch (error) {
    console.error('材料マスタ更新エラー:', error)
    return { success: false, message: '更新に失敗しました' }
  }
}

// 材料マスタを削除
export const deleteIngredientMaster = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  try {
    // 献立で使用されているか確認
    const usageCount = await prisma.kgRecipeIngredient.count({
      where: { ingredientMasterId: id },
    })
    if (usageCount > 0) {
      return {
        success: false,
        message: `この材料は${usageCount}件の献立で使用されているため削除できません`,
      }
    }

    await prisma.rcIngredientMaster.delete({
      where: { id },
    })
    return { success: true, message: '材料マスタを削除しました' }
  } catch (error) {
    console.error('材料マスタ削除エラー:', error)
    return { success: false, message: '削除に失敗しました' }
  }
}

// 未リンク材料の一覧を取得（献立に登録されているがマスタ未登録のもの）
export const getUnlinkedIngredients = async (): Promise<
  {
    ingredientCode: string
    ingredientName: string
    usageCount: number
  }[]
> => {
  const unlinked = await prisma.kgRecipeIngredient.groupBy({
    by: ['ingredientCode', 'ingredientName'],
    where: {
      ingredientMasterId: null,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  })

  return unlinked.map((item) => ({
    ingredientCode: item.ingredientCode,
    ingredientName: item.ingredientName,
    usageCount: item._count.id,
  }))
}

// 一括でマスタを作成（未リンク材料から）
export const createMasterFromUnlinked = async (
  ingredientCode: string,
  ingredientName: string,
  data: {
    price: number
    yield: number
    category: string
    supplier: string
  }
): Promise<{ success: boolean; message: string; linkedCount?: number }> => {
  try {
    // マスタを作成
    const master = await prisma.rcIngredientMaster.create({
      data: {
        name: ingredientName,
        standardCode: ingredientCode,
        price: data.price,
        yield: data.yield,
        category: data.category,
        supplier: data.supplier,
      },
    })

    // 既存の材料をリンク
    const result = await prisma.kgRecipeIngredient.updateMany({
      where: {
        ingredientCode,
        ingredientMasterId: null,
      },
      data: {
        ingredientMasterId: master.id,
      },
    })

    return {
      success: true,
      message: `マスタを登録し、${result.count}件の材料をリンクしました`,
      linkedCount: result.count,
    }
  } catch (error) {
    console.error('マスタ作成エラー:', error)
    return { success: false, message: '登録に失敗しました' }
  }
}
