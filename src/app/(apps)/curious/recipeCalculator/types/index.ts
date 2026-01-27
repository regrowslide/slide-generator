/**
 * 食品製造原価計算システム 型定義
 */

import type {RcIngredientMaster, RcRecipe, RcRecipeIngredient} from '@prisma/generated/prisma/client'

// Prisma型のre-export
export type {RcIngredientMaster, RcRecipe, RcRecipeIngredient}

// エイリアス
export type IngredientMaster = RcIngredientMaster

// 解析ステータス
export type AnalysisStatus = 'pending' | 'searching' | 'done' | 'error'

// レシピとその食材を含む型
export type RecipeWithIngredients = RcRecipe & {
  RcRecipeIngredient: RcRecipeIngredient[]
}

// 原価計算結果（フロントエンド用）
export interface CostCalculationResult {
  detailedIngredients: RcRecipeIngredient[]
  totalMaterialCost: number
  totalWeightKg: number
  productionWeightKg: number
  packCount: number
  materialCostPerPack: number
  totalCostPerPack: number
  sellingPrice: number
}

// レシピ設定（フロントエンド用）
export interface RecipeSettings {
  lossRate: number
  packWeightG: number
  packagingCost: number
  processingCost: number
  profitMargin: number
}

// AI解析進捗
export interface AnalysisProgress {
  phase: 'idle' | 'ocr' | 'matching' | 'searching' | 'calculating' | 'done' | 'error'
  message: string
  progress: number
}

// メニュー項目
export interface MenuItem {
  id: string
  label: string
  href: string
  icon: 'calculator' | 'database'
}
