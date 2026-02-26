/**
 * 食品製造原価計算システム 型定義
 */

import type {RcIngredientMaster, RcRecipe, RcRecipeIngredient, RcProfitMarginStandard, RcCategoryYieldMaster} from '@prisma/generated/prisma/client'

// Prisma型のre-export
export type {RcIngredientMaster, RcRecipe, RcRecipeIngredient, RcProfitMarginStandard, RcCategoryYieldMaster}

// エイリアス
export type IngredientMaster = RcIngredientMaster
export type ProfitMarginStandard = RcProfitMarginStandard

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
  totalRecipeWeightG: number // レシピ合計量（g）- 参考値
  productionWeightKg: number
  packCount: number
  materialCostPerPack: number
  totalCostPerPack: number
  sellingPrice: number
}

// 入力モード
export type InputMode = 'fillAmount' | 'packCount'

// レシピ設定（フロントエンド用）
export interface RecipeSettings {
  lossRate: number
  packWeightG: number
  packagingCost: number
  processingCost: number
  profitMargin: number
  // 新規フィールド
  otherCost: number
  productionWeightG: number | null
  inputMode: InputMode
  packCount: number
}

// AI解析進捗
export interface AnalysisProgress {
  phase: 'idle' | 'ocr' | 'matching' | 'searching' | 'calculating' | 'done' | 'error'
  message: string
  progress: number
}

// 粗利アラート
export interface ProfitMarginAlert {
  isWarning: boolean
  currentProfitRate: number
  minProfitAmount: number
  minProfitRate: number
  minPackCount: number
  maxPackCount: number | null
  message: string
}

// メニュー項目
export interface MenuItem {
  id: string
  label: string
  href: string
  icon: 'calculator' | 'database' | 'settings' | 'percent'
  adminOnly?: boolean
}
