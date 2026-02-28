'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  UtensilsCrossed,
  ShoppingBasket,
  BookOpen,
  BarChart3,
  TrendingUp,
  Plus,
  Trash2,
  Edit3,
  Calculator,
  DollarSign,
  Package,
  type LucideIcon,
} from 'lucide-react'
import {
  SplashScreen,
  InfoSidebar,
  Modal,
  GuidanceOverlay,
  GuidanceStartButton,
  MockHeader,
  MockHeaderTitle,
  MockHeaderTab,
  MockHeaderInfoButton,
  ResetButton,
  usePersistedState,
  useEditModal,
  generateId,
  resetPersistedData,
  type Feature,
  type TimeEfficiencyItem,
  type OverviewInfo,
  type OperationStep,
  type GuidanceStep,
} from '../_components'

// ==========================================
// 機能説明データ
// ==========================================

const FEATURES: Feature[] = [
  {
    icon: ShoppingBasket,
    title: '材料マスタ管理',
    description: '材料ごとにロット価格ティアを設定。仕入れ量に応じた単価の自動切替でリアルな原価計算を実現。',
    benefit: '仕入れコストの最適化',
  },
  {
    icon: BookOpen,
    title: 'メニュー設計',
    description: 'メニューごとの材料構成と提供価格を管理。原価率をリアルタイム表示し、適正価格の設定を支援。',
    benefit: '原価率の可視化',
  },
  {
    icon: BarChart3,
    title: '販売計画シミュレーション',
    description: '販売数を変更すると材料の月間調達量が変わり、ロット単価が自動で切り替わる連動を体感。',
    benefit: '仕入れ量と原価の連動把握',
  },
  {
    icon: TrendingUp,
    title: '損益シミュレーション',
    description: '固定費と売上から営業利益を自動計算。黒字/赤字判定で経営判断をサポート。',
    benefit: '採算判定の即時化',
  },
]

const TIME_EFFICIENCY: TimeEfficiencyItem[] = [
  { task: '原価計算', before: '2時間/メニュー', after: '即時自動計算', saved: '2時間/メニュー' },
  { task: '仕入れ量見積', before: '1時間', after: '自動集計', saved: '1時間' },
  { task: '損益シミュレーション', before: '半日', after: '即時', saved: '半日' },
  { task: '値付け検討会議', before: '2時間', after: '30分', saved: '1.5時間' },
]

const CHALLENGES = [
  '根拠のない値付けで利益が出ているか不明',
  '仕入れ量による単価変動を考慮できていない',
  '原価率の把握に時間がかかる',
  '固定費を含めた採算判定ができていない',
  'メニュー変更時の影響が見えない',
]

const OVERVIEW: OverviewInfo = {
  description: '居酒屋の値付けを「なんとなく」から「データに基づく判断」に変えるシミュレーターです。刺身・焼き物・ドリンクまで、材料のロット単価・販売数・固定費を連動させ、元がとれるかを即座に判定します。',
  automationPoints: [
    '販売数→材料調達量→ロット単価の自動連動',
    'メニューごとの原価・原価率のリアルタイム計算',
    '月次損益の自動算出と黒字/赤字判定',
  ],
  userBenefits: [
    '根拠のある値付けで利益を確保',
    '仕入れ量とロット単価の関係を直感的に理解',
    '固定費を含めた正確な採算判定が可能',
  ],
}

const OPERATION_STEPS: OperationStep[] = [
  { step: 1, action: '材料を登録', detail: '材料名・単位・ロット価格ティアを設定' },
  { step: 2, action: 'メニューを設計', detail: '材料を選択し提供価格を設定。原価率を確認' },
  { step: 3, action: '販売計画を立てる', detail: '週間販売数を入力し月間調達量・ロット単価の変動を確認' },
  { step: 4, action: '損益を確認', detail: '固定費を入力し営業利益・黒字/赤字を判定' },
]

// ==========================================
// 型定義
// ==========================================

interface LotPrice {
  minQuantity: number
  unitPrice: number
}

interface Ingredient {
  id: string
  name: string
  unit: string
  lotPrices: LotPrice[]
}

interface MenuIngredient {
  ingredientId: string
  quantity: number
}

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  ingredients: MenuIngredient[]
}

interface SalesPlan {
  menuItemId: string
  weeklyQuantity: number
}

interface ShopSettings {
  fixedCosts: {
    rent: number
    labor: number
    utilities: number
    other: number
  }
  targetCostRate: number
}

type TabId = 'ingredients' | 'menu' | 'sales' | 'pnl'

// ==========================================
// 定数
// ==========================================

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'ingredients', label: '材料マスタ', icon: ShoppingBasket },
  { id: 'menu', label: 'メニュー設計', icon: BookOpen },
  { id: 'sales', label: '販売計画', icon: BarChart3 },
  { id: 'pnl', label: '損益', icon: TrendingUp },
]

const STORAGE_KEYS = {
  ingredients: 'mock-inshoku-ingredients',
  menuItems: 'mock-inshoku-menu-items',
  salesPlans: 'mock-inshoku-sales-plans',
  shopSettings: 'mock-inshoku-shop-settings',
}

const CATEGORIES = ['刺身・海鮮', '焼き物', '揚げ物', 'サラダ・前菜', '〆・ご飯', '一品・おつまみ', 'ドリンク']

// ==========================================
// 初期データ（居酒屋テーマ）
// ==========================================

const INITIAL_INGREDIENTS: Ingredient[] = [
  // 肉類
  { id: 'ING01', name: '鶏もも肉', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 1.5 }, { minQuantity: 5000, unitPrice: 1.2 }, { minQuantity: 20000, unitPrice: 0.9 }] },
  { id: 'ING02', name: '豚バラ肉', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 1.8 }, { minQuantity: 5000, unitPrice: 1.4 }, { minQuantity: 15000, unitPrice: 1.1 }] },
  { id: 'ING03', name: '牛すじ', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 1.2 }, { minQuantity: 3000, unitPrice: 0.9 }, { minQuantity: 10000, unitPrice: 0.7 }] },
  { id: 'ING04', name: '手羽先', unit: '本', lotPrices: [{ minQuantity: 0, unitPrice: 45 }, { minQuantity: 100, unitPrice: 35 }, { minQuantity: 500, unitPrice: 28 }] },
  // 魚介類
  { id: 'ING05', name: 'サーモン（刺身用）', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 4.5 }, { minQuantity: 3000, unitPrice: 3.5 }, { minQuantity: 10000, unitPrice: 2.8 }] },
  { id: 'ING06', name: 'マグロ赤身', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 6.0 }, { minQuantity: 2000, unitPrice: 4.8 }, { minQuantity: 8000, unitPrice: 3.8 }] },
  { id: 'ING07', name: 'イカ', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 2.5 }, { minQuantity: 3000, unitPrice: 2.0 }, { minQuantity: 10000, unitPrice: 1.5 }] },
  { id: 'ING08', name: 'エビ（むき）', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 4.0 }, { minQuantity: 2000, unitPrice: 3.2 }, { minQuantity: 8000, unitPrice: 2.5 }] },
  { id: 'ING09', name: 'ホタテ', unit: '個', lotPrices: [{ minQuantity: 0, unitPrice: 120 }, { minQuantity: 50, unitPrice: 90 }, { minQuantity: 200, unitPrice: 70 }] },
  { id: 'ING10', name: 'タコ（ボイル）', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 3.5 }, { minQuantity: 2000, unitPrice: 2.8 }, { minQuantity: 8000, unitPrice: 2.2 }] },
  // 野菜・薬味
  { id: 'ING11', name: 'キャベツ', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 0.25 }, { minQuantity: 5000, unitPrice: 0.18 }, { minQuantity: 20000, unitPrice: 0.12 }] },
  { id: 'ING12', name: '大根', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 0.2 }, { minQuantity: 5000, unitPrice: 0.15 }, { minQuantity: 15000, unitPrice: 0.1 }] },
  { id: 'ING13', name: '長ねぎ', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 0.5 }, { minQuantity: 3000, unitPrice: 0.35 }, { minQuantity: 10000, unitPrice: 0.25 }] },
  { id: 'ING14', name: '玉ねぎ', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 0.3 }, { minQuantity: 10000, unitPrice: 0.2 }, { minQuantity: 30000, unitPrice: 0.15 }] },
  { id: 'ING15', name: 'にんにく', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 2.0 }, { minQuantity: 1000, unitPrice: 1.5 }, { minQuantity: 5000, unitPrice: 1.0 }] },
  { id: 'ING16', name: '生姜', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 1.0 }, { minQuantity: 2000, unitPrice: 0.7 }, { minQuantity: 8000, unitPrice: 0.5 }] },
  { id: 'ING17', name: 'レタス', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 0.4 }, { minQuantity: 3000, unitPrice: 0.3 }, { minQuantity: 10000, unitPrice: 0.2 }] },
  { id: 'ING18', name: 'トマト', unit: '個', lotPrices: [{ minQuantity: 0, unitPrice: 80 }, { minQuantity: 50, unitPrice: 60 }, { minQuantity: 200, unitPrice: 45 }] },
  // 主食・加工品
  { id: 'ING19', name: '米', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 0.4 }, { minQuantity: 10000, unitPrice: 0.3 }, { minQuantity: 50000, unitPrice: 0.25 }] },
  { id: 'ING20', name: '卵', unit: '個', lotPrices: [{ minQuantity: 0, unitPrice: 25 }, { minQuantity: 100, unitPrice: 20 }, { minQuantity: 500, unitPrice: 15 }] },
  { id: 'ING21', name: '豆腐', unit: '個', lotPrices: [{ minQuantity: 0, unitPrice: 40 }, { minQuantity: 50, unitPrice: 30 }, { minQuantity: 200, unitPrice: 22 }] },
  { id: 'ING22', name: '小麦粉', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 0.2 }, { minQuantity: 5000, unitPrice: 0.15 }, { minQuantity: 20000, unitPrice: 0.1 }] },
  { id: 'ING23', name: 'パン粉', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 0.3 }, { minQuantity: 3000, unitPrice: 0.22 }, { minQuantity: 10000, unitPrice: 0.15 }] },
  // 調味料
  { id: 'ING24', name: '味噌', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 0.8 }, { minQuantity: 5000, unitPrice: 0.6 }, { minQuantity: 15000, unitPrice: 0.45 }] },
  { id: 'ING25', name: '醤油', unit: 'ml', lotPrices: [{ minQuantity: 0, unitPrice: 0.3 }, { minQuantity: 5000, unitPrice: 0.2 }, { minQuantity: 20000, unitPrice: 0.12 }] },
  { id: 'ING26', name: 'ポン酢', unit: 'ml', lotPrices: [{ minQuantity: 0, unitPrice: 0.5 }, { minQuantity: 3000, unitPrice: 0.35 }, { minQuantity: 10000, unitPrice: 0.25 }] },
  { id: 'ING27', name: 'マヨネーズ', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 0.4 }, { minQuantity: 3000, unitPrice: 0.3 }, { minQuantity: 10000, unitPrice: 0.2 }] },
  // ドリンク原価
  { id: 'ING28', name: '生ビール（樽）', unit: 'ml', lotPrices: [{ minQuantity: 0, unitPrice: 0.8 }, { minQuantity: 20000, unitPrice: 0.6 }, { minQuantity: 100000, unitPrice: 0.45 }] },
  { id: 'ING29', name: 'ハイボール原酒', unit: 'ml', lotPrices: [{ minQuantity: 0, unitPrice: 1.2 }, { minQuantity: 10000, unitPrice: 0.9 }, { minQuantity: 50000, unitPrice: 0.7 }] },
  { id: 'ING30', name: '焼酎', unit: 'ml', lotPrices: [{ minQuantity: 0, unitPrice: 0.6 }, { minQuantity: 10000, unitPrice: 0.45 }, { minQuantity: 50000, unitPrice: 0.35 }] },
  { id: 'ING31', name: '炭酸水', unit: 'ml', lotPrices: [{ minQuantity: 0, unitPrice: 0.1 }, { minQuantity: 20000, unitPrice: 0.07 }, { minQuantity: 100000, unitPrice: 0.05 }] },
  { id: 'ING32', name: 'レモン', unit: '個', lotPrices: [{ minQuantity: 0, unitPrice: 30 }, { minQuantity: 100, unitPrice: 22 }, { minQuantity: 500, unitPrice: 15 }] },
]

const INITIAL_MENU_ITEMS: MenuItem[] = [
  // 刺身・海鮮
  { id: 'MNU01', name: '刺身盛り合わせ（3点）', price: 1280, category: '刺身・海鮮', ingredients: [
    { ingredientId: 'ING05', quantity: 60 }, { ingredientId: 'ING06', quantity: 50 }, { ingredientId: 'ING10', quantity: 40 }, { ingredientId: 'ING12', quantity: 30 },
  ]},
  { id: 'MNU02', name: 'サーモンユッケ', price: 680, category: '刺身・海鮮', ingredients: [
    { ingredientId: 'ING05', quantity: 80 }, { ingredientId: 'ING20', quantity: 1 }, { ingredientId: 'ING13', quantity: 10 }, { ingredientId: 'ING25', quantity: 10 },
  ]},
  { id: 'MNU03', name: 'タコわさび', price: 480, category: '刺身・海鮮', ingredients: [
    { ingredientId: 'ING10', quantity: 60 }, { ingredientId: 'ING25', quantity: 5 },
  ]},
  // 焼き物
  { id: 'MNU04', name: '手羽先唐揚げ（5本）', price: 580, category: '焼き物', ingredients: [
    { ingredientId: 'ING04', quantity: 5 }, { ingredientId: 'ING22', quantity: 15 }, { ingredientId: 'ING15', quantity: 5 },
  ]},
  { id: 'MNU05', name: '豚バラ串焼き（3本）', price: 480, category: '焼き物', ingredients: [
    { ingredientId: 'ING02', quantity: 120 }, { ingredientId: 'ING13', quantity: 20 }, { ingredientId: 'ING25', quantity: 5 },
  ]},
  { id: 'MNU06', name: 'ホタテバター焼き', price: 780, category: '焼き物', ingredients: [
    { ingredientId: 'ING09', quantity: 3 }, { ingredientId: 'ING25', quantity: 5 }, { ingredientId: 'ING13', quantity: 10 },
  ]},
  // 揚げ物
  { id: 'MNU07', name: '鶏の唐揚げ', price: 580, category: '揚げ物', ingredients: [
    { ingredientId: 'ING01', quantity: 150 }, { ingredientId: 'ING22', quantity: 20 }, { ingredientId: 'ING16', quantity: 5 }, { ingredientId: 'ING15', quantity: 3 }, { ingredientId: 'ING17', quantity: 20 },
  ]},
  { id: 'MNU08', name: 'エビフライ（3尾）', price: 780, category: '揚げ物', ingredients: [
    { ingredientId: 'ING08', quantity: 90 }, { ingredientId: 'ING22', quantity: 15 }, { ingredientId: 'ING20', quantity: 1 }, { ingredientId: 'ING23', quantity: 20 }, { ingredientId: 'ING11', quantity: 30 },
  ]},
  // サラダ・前菜
  { id: 'MNU09', name: 'シーザーサラダ', price: 580, category: 'サラダ・前菜', ingredients: [
    { ingredientId: 'ING17', quantity: 80 }, { ingredientId: 'ING18', quantity: 0.5 }, { ingredientId: 'ING20', quantity: 1 }, { ingredientId: 'ING27', quantity: 15 },
  ]},
  { id: 'MNU10', name: '冷奴', price: 380, category: 'サラダ・前菜', ingredients: [
    { ingredientId: 'ING21', quantity: 1 }, { ingredientId: 'ING16', quantity: 3 }, { ingredientId: 'ING13', quantity: 5 }, { ingredientId: 'ING25', quantity: 10 },
  ]},
  { id: 'MNU11', name: 'もつ煮込み', price: 480, category: '一品・おつまみ', ingredients: [
    { ingredientId: 'ING03', quantity: 100 }, { ingredientId: 'ING12', quantity: 40 }, { ingredientId: 'ING14', quantity: 30 }, { ingredientId: 'ING24', quantity: 20 }, { ingredientId: 'ING21', quantity: 0.5 }, { ingredientId: 'ING13', quantity: 10 },
  ]},
  { id: 'MNU12', name: 'だし巻き卵', price: 480, category: '一品・おつまみ', ingredients: [
    { ingredientId: 'ING20', quantity: 3 }, { ingredientId: 'ING25', quantity: 5 }, { ingredientId: 'ING12', quantity: 20 },
  ]},
  // 〆・ご飯
  { id: 'MNU13', name: '焼きおにぎり（2個）', price: 380, category: '〆・ご飯', ingredients: [
    { ingredientId: 'ING19', quantity: 200 }, { ingredientId: 'ING25', quantity: 10 },
  ]},
  { id: 'MNU14', name: '海鮮丼', price: 980, category: '〆・ご飯', ingredients: [
    { ingredientId: 'ING05', quantity: 50 }, { ingredientId: 'ING06', quantity: 40 }, { ingredientId: 'ING08', quantity: 30 }, { ingredientId: 'ING20', quantity: 1 }, { ingredientId: 'ING19', quantity: 200 }, { ingredientId: 'ING25', quantity: 10 },
  ]},
  // ドリンク
  { id: 'MNU15', name: '生ビール（中）', price: 550, category: 'ドリンク', ingredients: [
    { ingredientId: 'ING28', quantity: 350 },
  ]},
  { id: 'MNU16', name: 'ハイボール', price: 450, category: 'ドリンク', ingredients: [
    { ingredientId: 'ING29', quantity: 45 }, { ingredientId: 'ING31', quantity: 200 }, { ingredientId: 'ING32', quantity: 0.25 },
  ]},
  { id: 'MNU17', name: 'レモンサワー', price: 450, category: 'ドリンク', ingredients: [
    { ingredientId: 'ING30', quantity: 60 }, { ingredientId: 'ING31', quantity: 180 }, { ingredientId: 'ING32', quantity: 0.5 },
  ]},
]

const INITIAL_SALES_PLANS: SalesPlan[] = [
  // 刺身・海鮮（人気高め）
  { menuItemId: 'MNU01', weeklyQuantity: 40 },
  { menuItemId: 'MNU02', weeklyQuantity: 25 },
  { menuItemId: 'MNU03', weeklyQuantity: 20 },
  // 焼き物
  { menuItemId: 'MNU04', weeklyQuantity: 35 },
  { menuItemId: 'MNU05', weeklyQuantity: 30 },
  { menuItemId: 'MNU06', weeklyQuantity: 15 },
  // 揚げ物（定番人気）
  { menuItemId: 'MNU07', weeklyQuantity: 50 },
  { menuItemId: 'MNU08', weeklyQuantity: 20 },
  // サラダ・前菜
  { menuItemId: 'MNU09', weeklyQuantity: 25 },
  { menuItemId: 'MNU10', weeklyQuantity: 30 },
  // 一品・おつまみ
  { menuItemId: 'MNU11', weeklyQuantity: 25 },
  { menuItemId: 'MNU12', weeklyQuantity: 30 },
  // 〆・ご飯
  { menuItemId: 'MNU13', weeklyQuantity: 20 },
  { menuItemId: 'MNU14', weeklyQuantity: 15 },
  // ドリンク（高回転）
  { menuItemId: 'MNU15', weeklyQuantity: 120 },
  { menuItemId: 'MNU16', weeklyQuantity: 80 },
  { menuItemId: 'MNU17', weeklyQuantity: 60 },
]

const INITIAL_SHOP_SETTINGS: ShopSettings = {
  fixedCosts: { rent: 350000, labor: 1200000, utilities: 120000, other: 80000 },
  targetCostRate: 30,
}

// ==========================================
// 計算ロジック（純粋関数）
// ==========================================

/** 調達量に応じた適用ロット単価を返す */
const getApplicableUnitPrice = (lotPrices: LotPrice[], totalQuantity: number): number => {
  const sorted = [...lotPrices].sort((a, b) => b.minQuantity - a.minQuantity)
  const tier = sorted.find((lp) => totalQuantity >= lp.minQuantity)
  return tier?.unitPrice ?? lotPrices[0]?.unitPrice ?? 0
}

/** 適用ロットティア名を返す */
const getApplicableTierLabel = (lotPrices: LotPrice[], totalQuantity: number): string => {
  const sorted = [...lotPrices].sort((a, b) => b.minQuantity - a.minQuantity)
  const tierIndex = sorted.findIndex((lp) => totalQuantity >= lp.minQuantity)
  if (tierIndex === -1) return 'ティア1'
  return `ティア${lotPrices.length - tierIndex}`
}

/** 全メニュー×販売計画から材料ごとの月間調達量を集計 */
const calcMonthlyProcurement = (
  menuItems: MenuItem[],
  salesPlans: SalesPlan[],
): Map<string, number> => {
  const procurement = new Map<string, number>()
  for (const plan of salesPlans) {
    const menu = menuItems.find((m) => m.id === plan.menuItemId)
    if (!menu) continue
    const monthlyQty = plan.weeklyQuantity * 4
    for (const ing of menu.ingredients) {
      const current = procurement.get(ing.ingredientId) || 0
      procurement.set(ing.ingredientId, current + ing.quantity * monthlyQty)
    }
  }
  return procurement
}

/** メニュー1食の原価（ロット調整済み） */
const calcMenuCost = (
  menu: MenuItem,
  ingredients: Ingredient[],
  procurement: Map<string, number>,
): number => {
  let cost = 0
  for (const mi of menu.ingredients) {
    const ing = ingredients.find((i) => i.id === mi.ingredientId)
    if (!ing) continue
    const totalQty = procurement.get(mi.ingredientId) || 0
    const unitPrice = getApplicableUnitPrice(ing.lotPrices, totalQty)
    cost += mi.quantity * unitPrice
  }
  return cost
}

/** 月次損益計算 */
const calcPnl = (
  menuItems: MenuItem[],
  salesPlans: SalesPlan[],
  ingredients: Ingredient[],
  shopSettings: ShopSettings,
) => {
  const procurement = calcMonthlyProcurement(menuItems, salesPlans)
  let totalRevenue = 0
  let totalCost = 0

  for (const plan of salesPlans) {
    const menu = menuItems.find((m) => m.id === plan.menuItemId)
    if (!menu) continue
    const monthlyQty = plan.weeklyQuantity * 4
    totalRevenue += menu.price * monthlyQty
    totalCost += calcMenuCost(menu, ingredients, procurement) * monthlyQty
  }

  const { rent, labor, utilities, other } = shopSettings.fixedCosts
  const totalFixedCosts = rent + labor + utilities + other
  const grossProfit = totalRevenue - totalCost
  const costRate = totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0
  const operatingProfit = grossProfit - totalFixedCosts

  return { totalRevenue, totalCost, costRate, grossProfit, totalFixedCosts, operatingProfit }
}

// ==========================================
// ヘルパー
// ==========================================

const formatCurrency = (n: number) => `¥${Math.round(n).toLocaleString()}`
const formatPercent = (n: number) => `${n.toFixed(1)}%`

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
    {children}
  </div>
)

const inputClass = 'w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400'
const selectClass = inputClass

// ==========================================
// ガイダンス
// ==========================================

const getGuidanceSteps = (setActiveTab: (tab: TabId) => void): GuidanceStep[] => [
  { targetSelector: '[data-guidance="tab-ingredients"]', title: '材料マスタ', description: '材料と仕入れロット価格を管理します。仕入れ量に応じた単価ティアを設定可能。', position: 'bottom', action: () => setActiveTab('ingredients') },
  { targetSelector: '[data-guidance="add-ingredient-button"]', title: '材料の追加', description: '「材料追加」ボタンで新しい材料とロット価格を登録します。', position: 'bottom', action: () => setActiveTab('ingredients') },
  { targetSelector: '[data-guidance="tab-menu"]', title: 'メニュー設計', description: 'メニューごとに材料構成と提供価格を設定。原価率がリアルタイムで表示されます。', position: 'bottom', action: () => setActiveTab('ingredients') },
  { targetSelector: '[data-guidance="add-menu-button"]', title: 'メニューの追加', description: '「メニュー追加」ボタンでメニューを作成し、材料を選択します。', position: 'bottom', action: () => setActiveTab('menu') },
  { targetSelector: '[data-guidance="tab-sales"]', title: '販売計画', description: '週間販売数を変更すると調達量が変わり、ロット単価が自動で切り替わります。', position: 'bottom', action: () => setActiveTab('menu') },
  { targetSelector: '[data-guidance="sales-table"]', title: '販売数の編集', description: '週間販売数を直接編集できます。下の調達量テーブルでロット単価の変動を確認。', position: 'top', action: () => setActiveTab('sales') },
  { targetSelector: '[data-guidance="procurement-table"]', title: '材料別調達量', description: '全メニューの販売計画から月間調達量を自動集計。適用ロットティアと単価が表示されます。', position: 'top', action: () => setActiveTab('sales') },
  { targetSelector: '[data-guidance="tab-pnl"]', title: '損益シミュレーション', description: '固定費を入力して営業利益を確認。黒字か赤字かを一目で判定。', position: 'bottom', action: () => setActiveTab('sales') },
  { targetSelector: '[data-guidance="pnl-result"]', title: '損益結果', description: '売上・原価・粗利・固定費・営業利益を一覧表示。黒字/赤字が大きく表示されます。', position: 'top', action: () => setActiveTab('pnl') },
  { targetSelector: '[data-guidance="info-button"]', title: '機能説明', description: 'システムの概要や操作手順、時間削減効果を確認できます。', position: 'top', action: () => setActiveTab('pnl') },
]

// ==========================================
// IngredientsView
// ==========================================

interface IngredientForm {
  name: string
  unit: string
  lotPrices: LotPrice[]
}

const emptyIngredientForm: IngredientForm = { name: '', unit: 'g', lotPrices: [{ minQuantity: 0, unitPrice: 0 }] }

const toIngredientForm = (item: Ingredient): IngredientForm => ({
  name: item.name,
  unit: item.unit,
  lotPrices: [...item.lotPrices],
})

const IngredientsView = ({
  ingredients,
  setIngredients,
}: {
  ingredients: Ingredient[]
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>
}) => {
  const { modalOpen, editingItem, form, setForm, openNew, openEdit, close, save, remove } =
    useEditModal<Ingredient, IngredientForm>(emptyIngredientForm, toIngredientForm)

  const addLotPrice = () => {
    setForm((f) => ({ ...f, lotPrices: [...f.lotPrices, { minQuantity: 0, unitPrice: 0 }] }))
  }

  const removeLotPrice = (index: number) => {
    setForm((f) => ({ ...f, lotPrices: f.lotPrices.filter((_, i) => i !== index) }))
  }

  const updateLotPrice = (index: number, field: keyof LotPrice, value: number) => {
    setForm((f) => ({
      ...f,
      lotPrices: f.lotPrices.map((lp, i) => (i === index ? { ...lp, [field]: value } : lp)),
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-stone-800">材料マスタ</h2>
        <button
          data-guidance="add-ingredient-button"
          onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/25"
        >
          <Plus size={16} />
          材料追加
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-stone-600">材料名</th>
              <th className="px-4 py-3 text-left font-medium text-stone-600">単位</th>
              <th className="px-4 py-3 text-left font-medium text-stone-600">ロット価格</th>
              <th className="px-4 py-3 text-right font-medium text-stone-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {ingredients.map((ing) => (
              <tr key={ing.id} className="hover:bg-amber-50/30 transition-colors cursor-pointer" onClick={() => openEdit(ing)}>
                <td className="px-4 py-3 font-medium text-stone-800">{ing.name}</td>
                <td className="px-4 py-3 text-stone-600">{ing.unit}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {[...ing.lotPrices].sort((a, b) => a.minQuantity - b.minQuantity).map((lp, i) => (
                      <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-md border border-amber-200">
                        {lp.minQuantity}{ing.unit}〜 → ¥{lp.unitPrice}/{ing.unit}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(ing) }} className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors text-stone-400 hover:text-amber-600">
                    <Edit3 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={close} title={editingItem ? '材料を編集' : '材料を追加'}>
        <div className="space-y-4">
          <FormField label="材料名">
            <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="例: 鶏もも肉" />
          </FormField>
          <FormField label="単位">
            <select className={selectClass} value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}>
              <option value="g">g</option>
              <option value="個">個</option>
              <option value="ml">ml</option>
              <option value="本">本</option>
              <option value="袋">袋</option>
            </select>
          </FormField>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-stone-600">ロット価格ティア</label>
              <button onClick={addLotPrice} className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                <Plus size={12} />ティア追加
              </button>
            </div>
            <div className="space-y-2">
              {form.lotPrices.map((lp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="number" className={`${inputClass} w-28`} value={lp.minQuantity} onChange={(e) => updateLotPrice(i, 'minQuantity', Number(e.target.value))} placeholder="最小数量" />
                  <span className="text-xs text-stone-400">{form.unit}〜</span>
                  <input type="number" step="0.01" className={`${inputClass} w-24`} value={lp.unitPrice} onChange={(e) => updateLotPrice(i, 'unitPrice', Number(e.target.value))} placeholder="単価" />
                  <span className="text-xs text-stone-400">円/{form.unit}</span>
                  {form.lotPrices.length > 1 && (
                    <button onClick={() => removeLotPrice(i)} className="p-1 text-stone-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            {editingItem && (
              <button onClick={() => remove(setIngredients)} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                削除
              </button>
            )}
            <div className="flex-1" />
            <button onClick={close} className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
              キャンセル
            </button>
            <button
              onClick={() => save(setIngredients, 'ING')}
              disabled={!form.name}
              className="px-4 py-2 text-sm text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {editingItem ? '更新' : '追加'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ==========================================
// MenuDesignView
// ==========================================

interface MenuForm {
  name: string
  price: number
  category: string
  ingredients: MenuIngredient[]
}

const emptyMenuForm: MenuForm = { name: '', price: 0, category: '丼もの', ingredients: [] }

const toMenuForm = (item: MenuItem): MenuForm => ({
  name: item.name,
  price: item.price,
  category: item.category,
  ingredients: [...item.ingredients],
})

const MenuDesignView = ({
  menuItems,
  setMenuItems,
  ingredients,
  salesPlans,
}: {
  menuItems: MenuItem[]
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>
  ingredients: Ingredient[]
  salesPlans: SalesPlan[]
}) => {
  const { modalOpen, editingItem, form, setForm, openNew, openEdit, close, save, remove } =
    useEditModal<MenuItem, MenuForm>(emptyMenuForm, toMenuForm)

  const procurement = useMemo(() => calcMonthlyProcurement(menuItems, salesPlans), [menuItems, salesPlans])

  const addMenuIngredient = () => {
    if (ingredients.length === 0) return
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, { ingredientId: ingredients[0].id, quantity: 0 }] }))
  }

  const removeMenuIngredient = (index: number) => {
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== index) }))
  }

  const updateMenuIngredient = (index: number, field: keyof MenuIngredient, value: string | number) => {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((mi, i) => (i === index ? { ...mi, [field]: value } : mi)),
    }))
  }

  const targetCostRate = 30 // デフォルト目標原価率

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-stone-800">メニュー設計</h2>
        <button
          data-guidance="add-menu-button"
          onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/25"
        >
          <Plus size={16} />
          メニュー追加
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-stone-600">メニュー名</th>
              <th className="px-4 py-3 text-left font-medium text-stone-600">カテゴリ</th>
              <th className="px-4 py-3 text-right font-medium text-stone-600">提供価格</th>
              <th className="px-4 py-3 text-left font-medium text-stone-600">材料</th>
              <th className="px-4 py-3 text-right font-medium text-stone-600">原価</th>
              <th className="px-4 py-3 text-right font-medium text-stone-600">原価率</th>
              <th className="px-4 py-3 text-right font-medium text-stone-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {menuItems.map((menu) => {
              const cost = calcMenuCost(menu, ingredients, procurement)
              const costRate = menu.price > 0 ? (cost / menu.price) * 100 : 0
              const isOverTarget = costRate > targetCostRate
              return (
                <tr key={menu.id} className="hover:bg-amber-50/30 transition-colors cursor-pointer" onClick={() => openEdit(menu)}>
                  <td className="px-4 py-3 font-medium text-stone-800">{menu.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-md">{menu.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-stone-800">{formatCurrency(menu.price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {menu.ingredients.map((mi, i) => {
                        const ing = ingredients.find((ig) => ig.id === mi.ingredientId)
                        return (
                          <span key={i} className="text-xs text-stone-500">
                            {ing?.name || '不明'}({mi.quantity}{ing?.unit})
                          </span>
                        )
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-stone-800">{formatCurrency(cost)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${isOverTarget ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatPercent(costRate)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(menu) }} className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors text-stone-400 hover:text-amber-600">
                      <Edit3 size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={close} title={editingItem ? 'メニューを編集' : 'メニューを追加'} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <FormField label="メニュー名">
              <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="例: 親子丼" />
            </FormField>
            <FormField label="カテゴリ">
              <select className={selectClass} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="提供価格 (円)">
              <input type="number" className={inputClass} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
            </FormField>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-stone-600">材料構成</label>
              <button onClick={addMenuIngredient} className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                <Plus size={12} />材料追加
              </button>
            </div>
            <div className="space-y-2">
              {form.ingredients.map((mi, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select className={`${selectClass} flex-1`} value={mi.ingredientId} onChange={(e) => updateMenuIngredient(i, 'ingredientId', e.target.value)}>
                    {ingredients.map((ing) => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
                  </select>
                  <input type="number" step="0.1" className={`${inputClass} w-24`} value={mi.quantity} onChange={(e) => updateMenuIngredient(i, 'quantity', Number(e.target.value))} placeholder="数量" />
                  <span className="text-xs text-stone-400 w-8">{ingredients.find((ig) => ig.id === mi.ingredientId)?.unit}</span>
                  <button onClick={() => removeMenuIngredient(i)} className="p-1 text-stone-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {form.ingredients.length === 0 && (
                <p className="text-xs text-stone-400 py-2">材料を追加してください</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {editingItem && (
              <button onClick={() => remove(setMenuItems)} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                削除
              </button>
            )}
            <div className="flex-1" />
            <button onClick={close} className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
              キャンセル
            </button>
            <button
              onClick={() => save(setMenuItems, 'MNU')}
              disabled={!form.name || form.price <= 0}
              className="px-4 py-2 text-sm text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {editingItem ? '更新' : '追加'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ==========================================
// SalesPlanView
// ==========================================

const SalesPlanView = ({
  menuItems,
  ingredients,
  salesPlans,
  setSalesPlans,
}: {
  menuItems: MenuItem[]
  ingredients: Ingredient[]
  salesPlans: SalesPlan[]
  setSalesPlans: React.Dispatch<React.SetStateAction<SalesPlan[]>>
}) => {
  const procurement = useMemo(() => calcMonthlyProcurement(menuItems, salesPlans), [menuItems, salesPlans])

  const updateWeeklyQty = (menuItemId: string, qty: number) => {
    setSalesPlans((prev) =>
      prev.map((p) => (p.menuItemId === menuItemId ? { ...p, weeklyQuantity: qty } : p)),
    )
  }

  // 材料別調達量テーブル用データ
  const procurementData = useMemo(() => {
    return ingredients
      .map((ing) => {
        const totalQty = procurement.get(ing.id) || 0
        if (totalQty === 0) return null
        const unitPrice = getApplicableUnitPrice(ing.lotPrices, totalQty)
        const tierLabel = getApplicableTierLabel(ing.lotPrices, totalQty)
        return { ingredient: ing, totalQty, unitPrice, tierLabel }
      })
      .filter(Boolean) as { ingredient: Ingredient; totalQty: number; unitPrice: number; tierLabel: string }[]
  }, [ingredients, procurement])

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-stone-800">販売計画</h2>

      {/* 販売計画テーブル */}
      <div data-guidance="sales-table" className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-stone-600">メニュー名</th>
              <th className="px-4 py-3 text-right font-medium text-stone-600">週間販売数</th>
              <th className="px-4 py-3 text-right font-medium text-stone-600">月間数</th>
              <th className="px-4 py-3 text-right font-medium text-stone-600">月間売上</th>
              <th className="px-4 py-3 text-right font-medium text-stone-600">1食原価</th>
              <th className="px-4 py-3 text-right font-medium text-stone-600">月間原価</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {salesPlans.map((plan) => {
              const menu = menuItems.find((m) => m.id === plan.menuItemId)
              if (!menu) return null
              const monthlyQty = plan.weeklyQuantity * 4
              const menuCost = calcMenuCost(menu, ingredients, procurement)
              return (
                <tr key={plan.menuItemId} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-stone-800">{menu.name}</td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      className="w-20 px-2 py-1 border border-stone-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                      value={plan.weeklyQuantity}
                      onChange={(e) => updateWeeklyQty(plan.menuItemId, Math.max(0, Number(e.target.value)))}
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-stone-600">{monthlyQty}</td>
                  <td className="px-4 py-3 text-right font-medium text-stone-800">{formatCurrency(menu.price * monthlyQty)}</td>
                  <td className="px-4 py-3 text-right text-stone-600">{formatCurrency(menuCost)}</td>
                  <td className="px-4 py-3 text-right font-medium text-stone-800">{formatCurrency(menuCost * monthlyQty)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 材料別月間調達量サブテーブル */}
      <div data-guidance="procurement-table">
        <h3 className="text-sm font-bold text-stone-700 mb-2 flex items-center gap-2">
          <Package size={16} className="text-amber-600" />
          材料別 月間調達量
        </h3>
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-amber-50/50 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-600">材料名</th>
                <th className="px-4 py-3 text-right font-medium text-stone-600">月間調達量</th>
                <th className="px-4 py-3 text-center font-medium text-stone-600">適用ティア</th>
                <th className="px-4 py-3 text-right font-medium text-stone-600">適用単価</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {procurementData.map(({ ingredient, totalQty, unitPrice, tierLabel }) => (
                <tr key={ingredient.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-stone-800">{ingredient.name}</td>
                  <td className="px-4 py-3 text-right text-stone-600">{totalQty.toLocaleString()} {ingredient.unit}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-md font-medium">{tierLabel}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-stone-800">¥{unitPrice}/{ingredient.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// PnlView
// ==========================================

const PnlView = ({
  menuItems,
  ingredients,
  salesPlans,
  shopSettings,
  setShopSettings,
}: {
  menuItems: MenuItem[]
  ingredients: Ingredient[]
  salesPlans: SalesPlan[]
  shopSettings: ShopSettings
  setShopSettings: React.Dispatch<React.SetStateAction<ShopSettings>>
}) => {
  const pnl = useMemo(
    () => calcPnl(menuItems, salesPlans, ingredients, shopSettings),
    [menuItems, salesPlans, ingredients, shopSettings],
  )

  const isProfit = pnl.operatingProfit >= 0

  const updateFixedCost = (key: keyof ShopSettings['fixedCosts'], value: number) => {
    setShopSettings((s) => ({ ...s, fixedCosts: { ...s.fixedCosts, [key]: value } }))
  }

  // 簡易バーチャート用データ
  const maxVal = Math.max(pnl.totalRevenue, pnl.totalCost + pnl.totalFixedCosts, 1)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-stone-800">損益シミュレーション</h2>

      {/* 固定費入力 */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h3 className="text-sm font-bold text-stone-700 mb-4 flex items-center gap-2">
          <Calculator size={16} className="text-amber-600" />
          固定費・設定
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <FormField label="家賃 (円/月)">
            <input type="number" className={inputClass} value={shopSettings.fixedCosts.rent} onChange={(e) => updateFixedCost('rent', Number(e.target.value))} />
          </FormField>
          <FormField label="人件費 (円/月)">
            <input type="number" className={inputClass} value={shopSettings.fixedCosts.labor} onChange={(e) => updateFixedCost('labor', Number(e.target.value))} />
          </FormField>
          <FormField label="光熱費 (円/月)">
            <input type="number" className={inputClass} value={shopSettings.fixedCosts.utilities} onChange={(e) => updateFixedCost('utilities', Number(e.target.value))} />
          </FormField>
          <FormField label="その他 (円/月)">
            <input type="number" className={inputClass} value={shopSettings.fixedCosts.other} onChange={(e) => updateFixedCost('other', Number(e.target.value))} />
          </FormField>
          <FormField label="目標原価率 (%)">
            <input type="number" className={inputClass} value={shopSettings.targetCostRate} onChange={(e) => setShopSettings((s) => ({ ...s, targetCostRate: Number(e.target.value) }))} />
          </FormField>
        </div>
      </div>

      {/* 損益結果 */}
      <div data-guidance="pnl-result" className="bg-white rounded-xl border border-stone-200 p-6">
        <h3 className="text-sm font-bold text-stone-700 mb-4 flex items-center gap-2">
          <DollarSign size={16} className="text-amber-600" />
          月次損益
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="text-xs text-stone-500 mb-1">月間売上</p>
            <p className="text-xl font-bold text-stone-800">{formatCurrency(pnl.totalRevenue)}</p>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="text-xs text-stone-500 mb-1">原価合計</p>
            <p className="text-xl font-bold text-stone-800">{formatCurrency(pnl.totalCost)}</p>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="text-xs text-stone-500 mb-1">原価率</p>
            <p className={`text-xl font-bold ${pnl.costRate > shopSettings.targetCostRate ? 'text-red-600' : 'text-emerald-600'}`}>
              {formatPercent(pnl.costRate)}
            </p>
            <p className="text-xs text-stone-400">目標: {shopSettings.targetCostRate}%</p>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="text-xs text-stone-500 mb-1">粗利</p>
            <p className="text-xl font-bold text-stone-800">{formatCurrency(pnl.grossProfit)}</p>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="text-xs text-stone-500 mb-1">固定費合計</p>
            <p className="text-xl font-bold text-stone-800">{formatCurrency(pnl.totalFixedCosts)}</p>
          </div>
          <div className={`p-4 rounded-xl ${isProfit ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-red-50 border-2 border-red-200'}`}>
            <p className="text-xs text-stone-500 mb-1">営業利益</p>
            <p className={`text-xl font-bold ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(pnl.operatingProfit)}</p>
          </div>
        </div>

        {/* 黒字/赤字判定 */}
        <div className={`text-center py-6 rounded-xl ${isProfit ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <p className={`text-4xl font-black ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
            {isProfit ? '✅ 黒字' : '❌ 赤字'}
          </p>
          <p className={`text-sm mt-1 ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
            {isProfit
              ? `月間 ${formatCurrency(pnl.operatingProfit)} の利益`
              : `月間 ${formatCurrency(Math.abs(pnl.operatingProfit))} の赤字`}
          </p>
        </div>

        {/* 簡易バーチャート */}
        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-medium text-stone-500">収支バランス</h4>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
                <span>売上</span>
                <span>{formatCurrency(pnl.totalRevenue)}</span>
              </div>
              <div className="h-6 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(pnl.totalRevenue / maxVal) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
                <span>原価</span>
                <span>{formatCurrency(pnl.totalCost)}</span>
              </div>
              <div className="h-6 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${(pnl.totalCost / maxVal) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
                <span>固定費</span>
                <span>{formatCurrency(pnl.totalFixedCosts)}</span>
              </div>
              <div className="h-6 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-stone-400 to-stone-500 rounded-full transition-all duration-500"
                  style={{ width: `${(pnl.totalFixedCosts / maxVal) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
                <span>営業利益</span>
                <span className={isProfit ? 'text-emerald-600' : 'text-red-600'}>{formatCurrency(pnl.operatingProfit)}</span>
              </div>
              <div className="h-6 bg-stone-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${isProfit ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
                  style={{ width: `${(Math.abs(pnl.operatingProfit) / maxVal) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// メインコンポーネント
// ==========================================

export default function InshokuPricingPage() {
  const [showSplash, setShowSplash] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('ingredients')
  const [showInfo, setShowInfo] = useState(false)
  const [guidanceActive, setGuidanceActive] = useState(false)

  const [ingredients, setIngredients] = usePersistedState<Ingredient[]>(STORAGE_KEYS.ingredients, INITIAL_INGREDIENTS)
  const [menuItems, setMenuItems] = usePersistedState<MenuItem[]>(STORAGE_KEYS.menuItems, INITIAL_MENU_ITEMS)
  const [salesPlans, setSalesPlans] = usePersistedState<SalesPlan[]>(STORAGE_KEYS.salesPlans, INITIAL_SALES_PLANS)
  const [shopSettings, setShopSettings] = usePersistedState<ShopSettings>(STORAGE_KEYS.shopSettings, INITIAL_SHOP_SETTINGS)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const guidanceSteps = useMemo(() => getGuidanceSteps(setActiveTab), [])

  if (showSplash) {
    return <SplashScreen theme="amber" systemName="居酒屋値付けシミュレーター" subtitle="原価と利益を可視化" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* ヘッダー */}
      <MockHeader>
        <MockHeaderTitle icon={UtensilsCrossed} title="値付けシミュレーター" subtitle="飲食店の原価・損益分析" theme="amber" />
        <div className="flex items-center gap-2">
          <GuidanceStartButton onClick={() => setGuidanceActive(true)} theme="amber" />
          <ResetButton storageKeys={STORAGE_KEYS} theme="amber" />
          {TABS.map((tab) => (
            <MockHeaderTab
              key={tab.id}
              data-guidance={`tab-${tab.id}`}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
              theme="amber"
            />
          ))}
          <MockHeaderInfoButton onClick={() => setShowInfo(true)} theme="amber" />
        </div>
      </MockHeader>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'ingredients' && (
          <IngredientsView ingredients={ingredients} setIngredients={setIngredients} />
        )}
        {activeTab === 'menu' && (
          <MenuDesignView menuItems={menuItems} setMenuItems={setMenuItems} ingredients={ingredients} salesPlans={salesPlans} />
        )}
        {activeTab === 'sales' && (
          <SalesPlanView menuItems={menuItems} ingredients={ingredients} salesPlans={salesPlans} setSalesPlans={setSalesPlans} />
        )}
        {activeTab === 'pnl' && (
          <PnlView menuItems={menuItems} ingredients={ingredients} salesPlans={salesPlans} shopSettings={shopSettings} setShopSettings={setShopSettings} />
        )}
      </main>

      {/* InfoSidebar */}
      <InfoSidebar
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        theme="amber"
        systemIcon={UtensilsCrossed}
        systemName="居酒屋値付けシミュレーター"
        systemDescription="刺身・焼き物・ドリンクの原価から損益までを一気通貫シミュレーション"
        features={FEATURES}
        timeEfficiency={TIME_EFFICIENCY}
        challenges={CHALLENGES}
        overview={OVERVIEW}
        operationSteps={OPERATION_STEPS}
      />

      {/* GuidanceOverlay */}
      <GuidanceOverlay
        steps={guidanceSteps}
        isActive={guidanceActive}
        onClose={() => setGuidanceActive(false)}
        theme="amber"
      />
    </div>
  )
}
