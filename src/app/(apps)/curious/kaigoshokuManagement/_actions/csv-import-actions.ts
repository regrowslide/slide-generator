'use server'

import prisma from 'src/lib/prisma'
import { MEAL_TYPES, DIET_TYPES, type MealTypeCode } from '../lib/constants'

// 献立CSV解析結果
type ParsedKondateData = {
  date: Date
  meals: {
    mealType: MealTypeCode
    mealTypeName: string
    recipes: {
      code: string
      name: string
      subRecipes: {
        code: string
        name: string
        ingredients: {
          code: string
          name: string
          amount: number
          unit: string
          energy: number
          protein: number
          fat: number
          carb: number
          sodium: number
          salt: number
          vegetable: number
        }[]
      }[]
    }[]
  }[]
}

// CSVテキストを行に分割
const parseCsvLines = (csvText: string): string[][] => {
  const lines = csvText.split('\n').filter((line) => line.trim())
  return lines.map((line) => {
    // CSVの各フィールドを解析（ダブルクォート対応）
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  })
}

// 日付文字列をDateに変換
const parseDate = (dateStr: string): Date => {
  // "2026年1月31日" または "2026/01/31" 形式に対応
  const match1 = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
  if (match1) {
    return new Date(
      parseInt(match1[1]),
      parseInt(match1[2]) - 1,
      parseInt(match1[3])
    )
  }

  const match2 = dateStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/)
  if (match2) {
    return new Date(
      parseInt(match2[1]),
      parseInt(match2[2]) - 1,
      parseInt(match2[3])
    )
  }

  throw new Error(`日付の解析に失敗: ${dateStr}`)
}

// 食事区分名からコードに変換
const getMealTypeCode = (mealTypeName: string): MealTypeCode => {
  const normalized = mealTypeName.replace(/\s/g, '')
  for (const [code, data] of Object.entries(MEAL_TYPES)) {
    if (data.name === normalized || normalized.includes(data.name)) {
      return code as MealTypeCode
    }
  }
  // デフォルトは昼食
  return 'lunch'
}

// 献立CSVをインポート
export const importKondateCsv = async (
  csvText: string
): Promise<{ success: boolean; message: string; importedDates: string[] }> => {
  try {
    const lines = parseCsvLines(csvText)
    if (lines.length < 2) {
      return { success: false, message: 'CSVデータが不足しています', importedDates: [] }
    }

    // ヘッダーをスキップして解析
    const dataLines = lines.slice(1)

    // 日付ごとにグループ化
    const dateGroups = new Map<string, ParsedKondateData>()

    for (const row of dataLines) {
      if (row.length < 17) continue

      const dateStr = row[0]
      if (!dateStr) continue

      const date = parseDate(dateStr)
      const dateKey = date.toISOString().split('T')[0]

      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, {
          date,
          meals: [],
        })
      }

      const parsed = dateGroups.get(dateKey)!
      const mealTypeName = row[1]
      const mealTypeCode = getMealTypeCode(mealTypeName)

      // 食事区分を取得または作成
      let meal = parsed.meals.find((m) => m.mealType === mealTypeCode)
      if (!meal) {
        meal = {
          mealType: mealTypeCode,
          mealTypeName: MEAL_TYPES[mealTypeCode].name,
          recipes: [],
        }
        parsed.meals.push(meal)
      }

      const recipeCode = row[2]
      const recipeName = row[3]
      const subRecipeCode = row[4]
      const subRecipeName = row[5]
      const ingredientCode = row[6]
      const ingredientName = row[7]
      const amount = parseFloat(row[8]) || 0
      const unit = row[9] || 'g'
      const energy = parseFloat(row[10]) || 0
      const protein = parseFloat(row[11]) || 0
      const fat = parseFloat(row[12]) || 0
      const carb = parseFloat(row[13]) || 0
      const sodium = parseFloat(row[14]) || 0
      const salt = parseFloat(row[15]) || 0
      const vegetable = parseFloat(row[16]) || 0

      // レシピを取得または作成
      let recipe = meal.recipes.find((r) => r.code === recipeCode)
      if (!recipe) {
        recipe = { code: recipeCode, name: recipeName, subRecipes: [] }
        meal.recipes.push(recipe)
      }

      // サブレシピを取得または作成
      let subRecipe = recipe.subRecipes.find((s) => s.code === subRecipeCode)
      if (!subRecipe) {
        subRecipe = { code: subRecipeCode, name: subRecipeName, ingredients: [] }
        recipe.subRecipes.push(subRecipe)
      }

      // 食材を追加
      if (ingredientCode) {
        subRecipe.ingredients.push({
          code: ingredientCode,
          name: ingredientName,
          amount,
          unit,
          energy,
          protein,
          fat,
          carb,
          sodium,
          salt,
          vegetable,
        })
      }
    }

    const importedDates: string[] = []

    // データベースに保存
    for (const [dateKey, data] of dateGroups) {
      // 既存の献立を削除
      await prisma.kgDailyMenu.deleteMany({
        where: { menuDate: data.date },
      })

      // 新しい献立を作成
      const dailyMenu = await prisma.kgDailyMenu.create({
        data: { menuDate: data.date },
      })

      for (const meal of data.meals) {
        // 食事区分を作成
        const mealSlot = await prisma.kgMealSlot.create({
          data: {
            dailyMenuId: dailyMenu.id,
            mealType: meal.mealType,
            mealTypeName: meal.mealTypeName,
            sortOrder: MEAL_TYPES[meal.mealType].sortOrder,
          },
        })

        let recipeOrder = 0
        for (const recipe of meal.recipes) {
          // レシピを作成
          const menuRecipe = await prisma.kgMenuRecipe.create({
            data: {
              mealSlotId: mealSlot.id,
              code: recipe.code,
              name: recipe.name,
              sortOrder: recipeOrder++,
            },
          })

          let subRecipeOrder = 0
          for (const subRecipe of recipe.subRecipes) {
            // サブレシピを作成
            const subMenuRecipe = await prisma.kgMenuRecipe.create({
              data: {
                mealSlotId: mealSlot.id,
                parentRecipeId: menuRecipe.id,
                code: subRecipe.code,
                name: subRecipe.name,
                sortOrder: subRecipeOrder++,
              },
            })

            // 食材を作成
            let ingredientOrder = 0
            for (const ing of subRecipe.ingredients) {
              await prisma.kgRecipeIngredient.create({
                data: {
                  menuRecipeId: subMenuRecipe.id,
                  ingredientCode: ing.code,
                  ingredientName: ing.name,
                  amountPerServing: ing.amount,
                  unit: ing.unit,
                  energy: ing.energy,
                  protein: ing.protein,
                  fat: ing.fat,
                  carb: ing.carb,
                  sodium: ing.sodium,
                  salt: ing.salt,
                  vegetableG: ing.vegetable,
                  sortOrder: ingredientOrder++,
                },
              })
            }
          }
        }
      }

      importedDates.push(dateKey)
    }

    return {
      success: true,
      message: `${importedDates.length}日分の献立をインポートしました`,
      importedDates,
    }
  } catch (error) {
    console.error('献立CSVインポートエラー:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'インポートに失敗しました',
      importedDates: [],
    }
  }
}

// 受注CSVをインポート
export const importOrderCsv = async (
  csvText: string,
  facilityId?: number
): Promise<{ success: boolean; message: string; importedCount: number }> => {
  try {
    const lines = parseCsvLines(csvText)
    if (lines.length < 2) {
      return { success: false, message: 'CSVデータが不足しています', importedCount: 0 }
    }

    // ヘッダー解析
    const header = lines[0]
    // "日付", "単位", "（常食）朝", "（常食）昼", "（常食）夜", "（刻み食）朝", ...

    // 食事形態マスタを取得
    const dietTypes = await prisma.kgDietTypeMaster.findMany()
    const dietTypeMap = new Map(dietTypes.map((dt) => [dt.name, dt]))

    // カラムインデックスを解析
    type ColumnInfo = { dietTypeId: number; mealType: MealTypeCode }
    const columnMap = new Map<number, ColumnInfo>()

    for (let i = 2; i < header.length; i++) {
      const colName = header[i]
      // "（常食）朝" のような形式を解析
      const match = colName.match(/（(.+?)）(朝|昼|夜)/)
      if (match) {
        const dietTypeName = match[1]
        const mealName = match[2]
        const dietType = dietTypeMap.get(dietTypeName)
        if (dietType) {
          const mealType =
            mealName === '朝'
              ? 'breakfast'
              : mealName === '昼'
                ? 'lunch'
                : 'dinner'
          columnMap.set(i, { dietTypeId: dietType.id, mealType })
        }
      }
    }

    const dataLines = lines.slice(1)
    let importedCount = 0

    for (const row of dataLines) {
      const dateStr = row[0]
      if (!dateStr) continue

      const date = parseDate(dateStr)

      // 受注を作成
      const order = await prisma.kgOrder.create({
        data: {
          facilityId,
          orderDate: new Date(),
          deliveryDate: date,
          status: 'pending',
          sourceType: 'CSV',
        },
      })

      let lineOrder = 0
      for (const [colIndex, info] of columnMap) {
        const quantity = parseInt(row[colIndex]) || 0
        if (quantity > 0) {
          await prisma.kgOrderLine.create({
            data: {
              orderId: order.id,
              mealType: info.mealType,
              dietTypeId: info.dietTypeId,
              quantity,
              sortOrder: lineOrder++,
            },
          })
        }
      }

      importedCount++
    }

    return {
      success: true,
      message: `${importedCount}件の受注をインポートしました`,
      importedCount,
    }
  } catch (error) {
    console.error('受注CSVインポートエラー:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'インポートに失敗しました',
      importedCount: 0,
    }
  }
}

// 食事形態マスタの初期データを投入
export const seedDietTypeMaster = async (): Promise<void> => {
  const dietTypes = Object.values(DIET_TYPES)

  for (let i = 0; i < dietTypes.length; i++) {
    const dt = dietTypes[i]
    await prisma.kgDietTypeMaster.upsert({
      where: { code: dt.code },
      update: {
        name: dt.name,
        colorClass: dt.colorClass,
        sortOrder: i,
      },
      create: {
        code: dt.code,
        name: dt.name,
        colorClass: dt.colorClass,
        sortOrder: i,
      },
    })
  }
}
