import type {
  KgFacilityMaster,
  KgDietTypeMaster,
  KgDailyMenu,
  KgMealSlot,
  KgMenuRecipe,
  KgRecipeIngredient,
  KgOrder,
  KgOrderLine,
  KgProductionBatch,
  KgProductionItem,
  KgRequiredIngredient,
} from '@prisma/generated/prisma/client'

// 基本的なPrisma型の再エクスポート
export type {
  KgFacilityMaster,
  KgDietTypeMaster,
  KgDailyMenu,
  KgMealSlot,
  KgMenuRecipe,
  KgRecipeIngredient,
  KgOrder,
  KgOrderLine,
  KgProductionBatch,
  KgProductionItem,
  KgRequiredIngredient,
}

// リレーション付きの拡張型

// 献立関連
// 階層構造: 日付 → Category → Menu → Dish → Ingredient
export type KgDailyMenuWithRelations = KgDailyMenu & {
  KgMealSlot: KgMealSlotWithRelations[]
}

// Category（朝食、昼食、昼間食、夕食）
export type KgMealSlotWithRelations = KgMealSlot & {
  KgMenuRecipe: KgMenuRecipeWithRelations[]
}

// Menu（献立）/ Dish（料理） - parentRecipeId で階層化
// parentRecipeId = null → Menu
// parentRecipeId = menuId → Dish
export type KgMenuRecipeWithRelations = KgMenuRecipe & {
  ParentRecipe?: KgMenuRecipe | null // 親Menu（Dishの場合）
  ChildRecipes: KgMenuRecipeWithRelations[] // Dishes
  KgRecipeIngredient: KgRecipeIngredientWithMaster[] // Ingredients
}

// Ingredient（材料）
// 型名は互換性のため残す（マスタリレーションは削除）
export type KgRecipeIngredientWithMaster = KgRecipeIngredient

// 受注関連
export type KgOrderWithRelations = KgOrder & {
  KgFacilityMaster: KgFacilityMaster | null
  KgOrderLine: KgOrderLineWithRelations[]
}

export type KgOrderLineWithRelations = KgOrderLine & {
  KgDietTypeMaster: KgDietTypeMaster
  KgMenuRecipe: KgMenuRecipe | null
}

// 製造関連
export type KgProductionBatchWithRelations = KgProductionBatch & {
  KgProductionItem: KgProductionItemWithRelations[]
  KgRequiredIngredient: KgRequiredIngredientWithMaster[]
}

export type KgProductionItemWithRelations = KgProductionItem & {
  KgMenuRecipe: KgMenuRecipe
  KgDietTypeMaster: KgDietTypeMaster
}

// 型名は互換性のため残す（マスタリレーションは削除）
export type KgRequiredIngredientWithMaster = KgRequiredIngredient

// CSVインポート用の型

// 献立CSV行
export type KondateCsvRow = {
  date: string
  mealType: string
  recipeCode: string
  recipeName: string
  subRecipeCode: string
  subRecipeName: string
  ingredientCode: string
  ingredientName: string
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

// 受注CSV行
export type OrderCsvRow = {
  date: string
  mealType: string
  dietType: string
  quantity: number
}

// 集計用の型

// 製造サマリー
export type ProductionSummary = {
  menuRecipeId: number
  menuRecipeName: string
  dietTypeId: number
  dietTypeName: string
  totalQuantity: number
  facilities: {
    facilityId: number
    facilityName: string
    quantity: number
  }[]
}

// 必要食材サマリー
export type RequiredIngredientSummary = {
  ingredientCode: string
  ingredientName: string
  totalAmount: number
  unit: string
  estimatedCost: number | null
  recipes: {
    recipeId: number
    recipeName: string
    amount: number
  }[]
}

// フォーム入力用の型

export type KgFacilityFormData = {
  code: string
  name: string
  contactMethod: string
  address?: string
  phone?: string
  email?: string
  isActive: boolean
}

export type KgOrderFormData = {
  facilityId?: number
  orderDate: Date
  deliveryDate: Date
  status: string
  sourceType: string
  note?: string
  lines: KgOrderLineFormData[]
}

export type KgOrderLineFormData = {
  mealType: string
  dietTypeId: number
  menuRecipeId?: number
  rawName?: string
  quantity: number
}

// フィルター用の型

export type OrderFilter = {
  facilityId?: number
  deliveryDateFrom?: Date
  deliveryDateTo?: Date
  status?: string
  mealType?: string
}

export type ProductionFilter = {
  productionDateFrom?: Date
  productionDateTo?: Date
  status?: string
  mealType?: string
}
