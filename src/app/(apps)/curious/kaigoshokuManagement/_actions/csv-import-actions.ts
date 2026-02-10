'use server'

import prisma from 'src/lib/prisma'
import {MEAL_TYPES, DIET_TYPES, type MealTypeCode} from '../lib/constants'

/**
 * 献立CSVの階層構造:
 *
 * 日付 (3行目: 2026年1月31日)
 * └─ Category (B列: 朝食、昼食、昼間食、夕食)
 *    └─ Menu (C列コード + D列名前: 11929 スクランブルエッグ【朝】)
 *       └─ Dish (D列コード + E列名前: 40224 ぶどうパン)
 *          └─ Ingredient (E列コード + F列名前 + G列重量: 41007 ぶどうパン 60g)
 *
 * CSV列マッピング（0-indexed）:
 * - A(0): 空
 * - B(1): Category（朝食、昼食、昼間食、夕食）
 * - C(2): Menu コード
 * - D(3): Menu 名前 または Dish コード
 * - E(4): Dish コード または Ingredient コード または Dish 名前
 * - F(5): Ingredient 名前
 * - G(6): 1人分可食量(g)
 * - H(7): エネルギー(kcal)
 * - I(8): たんぱく質(g)
 * - J(9): 脂質(g)
 * - K(10): 炭水化物(g)
 * - L(11): ナトリウム(mg)
 * - M(12): 食塩(g)
 * - N(13): 野菜量(g)
 */

// 材料データ
type IngredientData = {
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
}

// 料理データ（Dish）
type DishData = {
  code: string
  name: string
  ingredients: IngredientData[]
}

// メニューデータ（Menu）
type MenuData = {
  code: string
  name: string
  dishes: DishData[]
}

// カテゴリデータ（Category: 朝食、昼食等）
type CategoryData = {
  mealType: MealTypeCode
  mealTypeName: string
  menus: MenuData[]
}

// 献立CSV解析結果
type ParsedKondateData = {
  date: Date
  categories: CategoryData[]
}

// インポート結果の型
export type ImportResult = {
  success: boolean
  message: string
  logList: string[]
  importedDates?: string[]
  importedCount?: number
}

// CSVテキストを行に分割
const parseCsvLines = (csvText: string): string[][] => {
  const lines = csvText.split('\n').filter(line => line.trim())
  return lines.map(line => {
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
    return new Date(parseInt(match1[1]), parseInt(match1[2]) - 1, parseInt(match1[3]))
  }

  const match2 = dateStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/)
  if (match2) {
    return new Date(parseInt(match2[1]), parseInt(match2[2]) - 1, parseInt(match2[3]))
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

/**
 * 献立CSVをインポート
 *
 * 階層構造:
 * - 日付 has many Category（朝食、昼食、昼間食、夕食）
 * - Category has many Menu（献立: C列コード + D列名前）
 * - Menu has many Dish（料理: D列コード + E列名前）
 * - Dish has many Ingredient（材料: E列コード + F列名前）
 *
 * @param csvText CSVテキスト
 * @param targetDate 取り込み対象の日付（指定しない場合はCSVから読み取る）
 */
export const importKondateCsv = async (csvText: string, targetDate?: Date): Promise<ImportResult & {importedDates: string[]}> => {
  const logList: string[] = []
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ja-JP')
    logList.push(`[${timestamp}] ${message}`)
    console.log(`[献立CSV] ${message}`)
  }

  try {
    addLog('📂 CSVファイルの読み込みを開始')
    const lines = parseCsvLines(csvText)
    addLog(`📊 ${lines.length}行のデータを検出`)

    if (lines.length < 8) {
      addLog('❌ CSVデータが不足しています（8行未満）')
      return {success: false, message: 'CSVデータが不足しています', logList, importedDates: []}
    }

    // 日付の決定: 引数で指定された場合はそれを使用、なければCSVから読み取る
    let date: Date
    if (targetDate) {
      date = targetDate
      addLog(`📅 指定された日付を使用: ${date.toLocaleDateString('ja-JP')}`)
    } else {
      // 3行目（index 2）から日付を取得 "2026年1月31日"
      const dateLine = lines[2]
      const dateStr = dateLine[1]
      if (!dateStr) {
        addLog('❌ CSVから日付が見つかりません')
        return {success: false, message: '日付が見つかりません', logList, importedDates: []}
      }
      date = parseDate(dateStr)
      addLog(`📅 CSVから日付を検出: ${dateStr}`)
    }
    const dateKey = date.toISOString().split('T')[0]

    addLog('🔍 データ解析を開始')

    // データ解析
    const parsed: ParsedKondateData = {
      date,
      categories: [],
    }

    let currentCategory: CategoryData | null = null
    let currentMenu: MenuData | null = null
    let currentDish: DishData | null = null

    // 8行目（index 7）からデータ開始
    for (let i = 7; i < lines.length; i++) {
      const row = lines[i]
      if (row.length < 7) continue

      const colB = row[1]?.trim() // Category（朝食、昼食等）
      const colC = row[2]?.trim() // Menu コード
      const colD = row[3]?.trim() // Menu 名前 or Dish コード
      const colE = row[4]?.trim() // Dish コード/名前 or Ingredient コード
      const colF = row[5]?.trim() // Ingredient 名前
      const colG = row[6]?.trim() // 重量(g)

      // 合計行はスキップ
      if (colD?.includes('合計') || colF?.includes('合計')) {
        continue
      }

      // Category の検出（B列: 朝食、昼食、昼間食、夕食）
      if (colB && ['朝食', '昼食', '昼間食', '夕食'].includes(colB)) {
        const mealType = getMealTypeCode(colB)
        currentCategory = {
          mealType,
          mealTypeName: MEAL_TYPES[mealType].name,
          menus: [],
        }
        parsed.categories.push(currentCategory)
        currentMenu = null
        currentDish = null
        addLog(`  🍽️ Category検出: ${colB}`)

        // 同じ行に Menu がある場合（C列にコード、D列に名前）
        if (colC && /^\d+$/.test(colC) && colD) {
          currentMenu = {code: colC, name: colD, dishes: []}
          currentCategory.menus.push(currentMenu)
          addLog(`    📋 Menu検出: [${colC}] ${colD}`)
        }
        continue
      }

      // Menu の検出（C列にコード、D列に名前）
      // B列が空で、C列に数値コードがあり、D列に名前がある
      if (!colB && colC && /^\d+$/.test(colC) && colD && !colE) {
        if (currentCategory) {
          currentMenu = {code: colC, name: colD, dishes: []}
          currentCategory.menus.push(currentMenu)
          currentDish = null
          addLog(`    📋 Menu検出: [${colC}] ${colD}`)
        }
        continue
      }

      // Dish の検出（D列にコード、E列に名前）
      // C列が空で、D列に数値コードがあり、E列に名前があり、G列（重量）が空
      if (!colC && colD && /^\d+$/.test(colD) && colE && !colG) {
        if (currentMenu) {
          currentDish = {code: colD, name: colE, ingredients: []}
          currentMenu.dishes.push(currentDish)
          addLog(`      🍳 Dish検出: [${colD}] ${colE}`)
        }
        continue
      }

      // Ingredient の検出（E列にコード、F列に名前、G列に重量）
      // D列が空で、E列に数値コードがあり、F列に名前があり、G列に重量がある
      if (!colD && colE && /^\d+$/.test(colE) && colF && colG) {
        const amount = parseFloat(colG.replace(/,/g, '')) || 0
        const energy = parseFloat(row[7]?.replace(/,/g, '').replace(/\s/g, '')) || 0
        const protein = parseFloat(row[8]?.replace(/,/g, '')) || 0
        const fat = parseFloat(row[9]?.replace(/,/g, '')) || 0
        const carb = parseFloat(row[10]?.replace(/,/g, '')) || 0
        const sodium = parseFloat(row[11]?.replace(/,/g, '').replace(/\s/g, '')) || 0
        const salt = parseFloat(row[12]?.replace(/,/g, '')) || 0
        const vegetable = parseFloat(row[13]?.replace(/,/g, '')) || 0

        const ingredient: IngredientData = {
          code: colE,
          name: colF,
          amount,
          unit: 'g',
          energy,
          protein,
          fat,
          carb,
          sodium,
          salt,
          vegetable,
        }

        // Dish がない場合は、Menu に直接 Dish を作成
        if (!currentDish && currentMenu) {
          currentDish = {code: '', name: currentMenu.name, ingredients: []}
          currentMenu.dishes.push(currentDish)
        }

        if (currentDish) {
          currentDish.ingredients.push(ingredient)
        }
        continue
      }

      // Dish がないまま Ingredient が来た場合のフォールバック
      // E列にコード、F列に名前、G列に重量がある（D列にコードがある場合）
      if (colD && /^\d+$/.test(colD) && colE && colF && parseFloat(colF.replace(/,/g, ''))) {
        // D列がコード、E列が名前、F列が重量のパターン
        const amount = parseFloat(colF.replace(/,/g, '')) || 0
        const energy = parseFloat(row[7]?.replace(/,/g, '').replace(/\s/g, '')) || 0
        const protein = parseFloat(row[8]?.replace(/,/g, '')) || 0
        const fat = parseFloat(row[9]?.replace(/,/g, '')) || 0
        const carb = parseFloat(row[10]?.replace(/,/g, '')) || 0
        const sodium = parseFloat(row[11]?.replace(/,/g, '').replace(/\s/g, '')) || 0
        const salt = parseFloat(row[12]?.replace(/,/g, '')) || 0
        const vegetable = parseFloat(row[13]?.replace(/,/g, '')) || 0

        const ingredient: IngredientData = {
          code: colD,
          name: colE,
          amount,
          unit: 'g',
          energy,
          protein,
          fat,
          carb,
          sodium,
          salt,
          vegetable,
        }

        if (!currentDish && currentMenu) {
          currentDish = {code: '', name: currentMenu.name, ingredients: []}
          currentMenu.dishes.push(currentDish)
        }

        if (currentDish) {
          currentDish.ingredients.push(ingredient)
        }
      }
    }

    // 解析結果のサマリー
    const totalMenus = parsed.categories.reduce((sum, c) => sum + c.menus.length, 0)
    const totalDishes = parsed.categories.reduce((sum, c) => sum + c.menus.reduce((s, m) => s + m.dishes.length, 0), 0)
    const totalIngredients = parsed.categories.reduce(
      (sum, c) => sum + c.menus.reduce((s, m) => s + m.dishes.reduce((ss, d) => ss + d.ingredients.length, 0), 0),
      0
    )
    addLog(`📊 解析完了: ${parsed.categories.length}カテゴリ, ${totalMenus}メニュー, ${totalDishes}料理, ${totalIngredients}材料`)

    const importedDates: string[] = []

    // データベースに保存
    addLog('💾 データベース保存を開始')

    // 既存の献立を削除（カスケードで関連データも削除）
    addLog(`🗑️ 既存データを削除: ${dateKey}`)
    await prisma.kgDailyMenu.deleteMany({
      where: {menuDate: date},
    })

    // 新しい献立を作成
    addLog('📝 日付献立を作成')
    const dailyMenu = await prisma.kgDailyMenu.create({
      data: {menuDate: date},
    })

    let savedCategories = 0
    let savedMenus = 0
    let savedDishes = 0
    let savedIngredients = 0

    for (const category of parsed.categories) {
      // Category（MealSlot）を作成
      const mealSlot = await prisma.kgMealSlot.create({
        data: {
          dailyMenuId: dailyMenu.id,
          mealType: category.mealType,
          mealTypeName: category.mealTypeName,
          sortOrder: MEAL_TYPES[category.mealType].sortOrder,
        },
      })
      savedCategories++
      addLog(`  ✅ Category保存: ${category.mealTypeName}`)

      let menuOrder = 0
      for (const menu of category.menus) {
        // Menu（KgMenuRecipe: parentRecipeId = null）を作成
        const menuRecipe = await prisma.kgMenuRecipe.create({
          data: {
            mealSlotId: mealSlot.id,
            code: menu.code,
            name: menu.name,
            sortOrder: menuOrder++,
          },
        })
        savedMenus++

        let dishOrder = 0
        for (const dish of menu.dishes) {
          // Dish（KgMenuRecipe: parentRecipeId = menuRecipe.id）を作成
          const dishRecipe = await prisma.kgMenuRecipe.create({
            data: {
              mealSlotId: mealSlot.id,
              parentRecipeId: menuRecipe.id,
              code: dish.code,
              name: dish.name,
              sortOrder: dishOrder++,
            },
          })
          savedDishes++

          // Ingredient（KgRecipeIngredient）を作成
          let ingredientOrder = 0
          for (const ing of dish.ingredients) {
            await prisma.kgRecipeIngredient.create({
              data: {
                menuRecipeId: dishRecipe.id,
                ingredientMasterId: null, // マスタ連携なし
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
            savedIngredients++
          }
        }
      }
    }

    importedDates.push(dateKey)

    addLog(`✅ 保存完了: ${savedCategories}カテゴリ, ${savedMenus}メニュー, ${savedDishes}料理, ${savedIngredients}材料`)
    addLog(`🎉 インポート完了: ${dateKey}`)

    return {
      success: true,
      message: `${importedDates.length}日分の献立をインポートしました`,
      logList,
      importedDates,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'インポートに失敗しました'
    logList.push(`[${new Date().toLocaleTimeString('ja-JP')}] ❌ エラー発生: ${errorMessage}`)
    console.error('献立CSVインポートエラー:', error)
    return {
      success: false,
      message: errorMessage,
      logList,
      importedDates: [],
    }
  }
}

// 受注CSVをインポート
// 形式: 日付,単位,（常食）朝,（常食）昼,（常食）夜,（刻み食）朝,...
export const importOrderCsv = async (csvText: string, facilityId?: number): Promise<ImportResult & {importedCount: number}> => {
  const logList: string[] = []
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ja-JP')
    logList.push(`[${timestamp}] ${message}`)
    console.log(`[受注CSV] ${message}`)
  }

  try {
    addLog('📂 CSVファイルの読み込みを開始')
    const lines = parseCsvLines(csvText)
    addLog(`📊 ${lines.length}行のデータを検出`)

    if (lines.length < 2) {
      addLog('❌ CSVデータが不足しています（2行未満）')
      return {success: false, message: 'CSVデータが不足しています', logList, importedCount: 0}
    }

    // ヘッダー解析
    addLog('🔍 ヘッダー解析を開始')
    const header = lines[0]
    // "日付", "単位", "（常食）朝", "（常食）昼", "（常食）夜", "（刻み食）朝", ...

    // 食事形態マスタを取得（なければ初期データ投入）
    let dietTypes = await prisma.kgDietTypeMaster.findMany()
    if (dietTypes.length === 0) {
      addLog('📝 食事形態マスタを初期化')
      await seedDietTypeMaster()
      dietTypes = await prisma.kgDietTypeMaster.findMany()
    }
    addLog(`  ✅ 食事形態マスタ: ${dietTypes.length}件読み込み`)
    const dietTypeMap = new Map(dietTypes.map(dt => [dt.name, dt]))

    // カラムインデックスを解析
    type ColumnInfo = {dietTypeId: number; mealType: MealTypeCode}
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
          const mealType = mealName === '朝' ? 'breakfast' : mealName === '昼' ? 'lunch' : 'dinner'
          columnMap.set(i, {dietTypeId: dietType.id, mealType})
        }
      }
    }

    if (columnMap.size === 0) {
      addLog('❌ CSVヘッダーの形式が正しくありません')
      return {success: false, message: 'CSVヘッダーの形式が正しくありません', logList, importedCount: 0}
    }
    addLog(`  ✅ ${columnMap.size}列のデータ列を検出`)

    const dataLines = lines.slice(1)
    let importedCount = 0
    let skippedCount = 0

    addLog('💾 データベース保存を開始')
    for (const row of dataLines) {
      const dateStr = row[0]
      if (!dateStr) continue

      // 合計行をスキップ
      if (dateStr === '合計' || dateStr.includes('合計')) {
        skippedCount++
        continue
      }

      let date: Date
      try {
        date = parseDate(dateStr)
      } catch {
        skippedCount++
        continue // 日付として解析できない行はスキップ
      }

      // 全てのカラムが0の場合はスキップ
      let hasData = false
      for (const [colIndex] of columnMap) {
        const quantity = parseInt(row[colIndex]) || 0
        if (quantity > 0) {
          hasData = true
          break
        }
      }
      if (!hasData) {
        skippedCount++
        continue
      }

      // 同じ日付の既存受注を削除
      await prisma.kgOrder.deleteMany({
        where: {
          deliveryDate: date,
          facilityId: facilityId ?? null,
          sourceType: 'CSV',
        },
      })

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
      let totalQuantity = 0
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
          totalQuantity += quantity
        }
      }

      addLog(`  📅 ${date.toLocaleDateString('ja-JP')}: ${totalQuantity}食`)
      importedCount++
    }

    addLog(`✅ 保存完了: ${importedCount}件の受注 (${skippedCount}行スキップ)`)
    addLog('🎉 インポート完了')

    return {
      success: true,
      message: `${importedCount}件の受注をインポートしました`,
      logList,
      importedCount,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'インポートに失敗しました'
    logList.push(`[${new Date().toLocaleTimeString('ja-JP')}] ❌ エラー発生: ${errorMessage}`)
    console.error('受注CSVインポートエラー:', error)
    return {
      success: false,
      message: errorMessage,
      logList,
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
      where: {code: dt.code},
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
