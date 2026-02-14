'use client'

import {useCallback, useTransition} from 'react'
import type {RecipeWithIngredients, IngredientMaster, InputMode} from '../types'
import type {RecipeIngredientInput} from '../server-actions/recipe-actions'
import {
  updateRecipe,
  updateRecipeIngredient,
  deleteRecipeIngredient,
  recalculateRecipeCosts,
  addRecipeIngredient,
} from '../server-actions/recipe-actions'

interface UseRecipeEditorProps {
  recipe: RecipeWithIngredients | null
  ingredientMasters: IngredientMaster[]
  setRecipe: (recipe: RecipeWithIngredients | null) => void
}

export const useRecipeEditor = ({recipe, ingredientMasters, setRecipe}: UseRecipeEditorProps) => {
  const [isPending, startTransition] = useTransition()

  // 原材料手動追加
  const handleAddIngredient = useCallback(async () => {
    if (!recipe) return

    startTransition(async () => {
      await addRecipeIngredient({
        recipeId: recipe.id,
        ingredientMasterId: null,
        name: '新規原材料',
        originalName: '',
        amount: 0,
        unit: 'g',
        pricePerKg: 0,
        yieldRate: 100,
        isExternal: false,
        source: '手動入力',
        status: 'pending',
      })
      const updated = await recalculateRecipeCosts(recipe.id)
      if (updated) setRecipe(updated)
    })
  }, [recipe, setRecipe])

  // マスタ選択ハンドラ
  const handleMasterSelect = useCallback(
    async (index: number, masterId: number | null) => {
      if (!recipe) return

      const ingredient = recipe.RcRecipeIngredient[index]
      if (!ingredient) return

      startTransition(async () => {
        if (masterId) {
          const master = ingredientMasters.find((m) => m.id === masterId)
          if (master) {
            await updateRecipeIngredient(ingredient.id, {
              ingredientMasterId: master.id,
              name: master.name,
              pricePerKg: master.price,
              yieldRate: master.yield,
              isExternal: false,
              source: '社内マスタ',
              status: 'done',
            })
          }
        } else {
          await updateRecipeIngredient(ingredient.id, {
            ingredientMasterId: null,
            pricePerKg: 0,
            isExternal: false,
            source: '未割当',
            status: 'pending',
          })
        }
        const updated = await recalculateRecipeCosts(recipe.id)
        if (updated) setRecipe(updated)
      })
    },
    [recipe, ingredientMasters, setRecipe]
  )

  // 食材変更ハンドラ
  const handleIngredientChange = useCallback(
    (index: number, field: string, value: string | number) => {
      if (!recipe) return

      const ingredient = recipe.RcRecipeIngredient[index]
      if (!ingredient) return

      startTransition(async () => {
        const numericFields = ['amount', 'pricePerKg', 'yieldRate']
        const parsedValue = numericFields.includes(field) ? Number(value) : value
        const updateData: Partial<RecipeIngredientInput> = {[field]: parsedValue}

        await updateRecipeIngredient(ingredient.id, updateData)
        const updated = await recalculateRecipeCosts(recipe.id)
        if (updated) setRecipe(updated)
      })
    },
    [recipe, setRecipe]
  )

  // 食材削除ハンドラ
  const handleDeleteIngredient = useCallback(
    (index: number) => {
      if (!recipe) return

      const ingredient = recipe.RcRecipeIngredient[index]
      if (!ingredient) return

      startTransition(async () => {
        await deleteRecipeIngredient(ingredient.id)
        const updated = await recalculateRecipeCosts(recipe.id)
        if (updated) setRecipe(updated)
      })
    },
    [recipe, setRecipe]
  )

  // 設定変更ハンドラ（数値用）
  const handleSettingChange = useCallback(
    (key: string, value: number | null) => {
      if (!recipe) return

      startTransition(async () => {
        await updateRecipe(recipe.id, {[key]: value})
        const updated = await recalculateRecipeCosts(recipe.id)
        if (updated) setRecipe(updated)
      })
    },
    [recipe, setRecipe]
  )

  // 製造パラメータ一括再計算ハンドラ
  const handleRecalculateParams = useCallback(
    (params: {lossRate: number; packWeightG: number; productionWeightG: number | null; packCount?: number}) => {
      if (!recipe) return

      startTransition(async () => {
        const updateData: Record<string, unknown> = {
          lossRate: params.lossRate,
          packWeightG: params.packWeightG,
          productionWeightG: params.productionWeightG,
        }
        if (params.packCount !== undefined) {
          updateData.packCount = params.packCount
        }
        await updateRecipe(recipe.id, updateData as Parameters<typeof updateRecipe>[1])
        const updated = await recalculateRecipeCosts(recipe.id)
        if (updated) setRecipe(updated)
      })
    },
    [recipe, setRecipe]
  )

  // 原価見積一括再計算ハンドラ
  const handleRecalculateCosts = useCallback(
    (params: {packagingCost: number; processingCost: number; otherCost: number; profitMargin: number}) => {
      if (!recipe) return

      startTransition(async () => {
        await updateRecipe(recipe.id, params)
        const updated = await recalculateRecipeCosts(recipe.id)
        if (updated) setRecipe(updated)
      })
    },
    [recipe, setRecipe]
  )

  // 入力モード切替ハンドラ
  const handleInputModeChange = useCallback(
    (mode: InputMode) => {
      if (!recipe) return

      startTransition(async () => {
        await updateRecipe(recipe.id, {inputMode: mode})
        const updated = await recalculateRecipeCosts(recipe.id)
        if (updated) setRecipe(updated)
      })
    },
    [recipe, setRecipe]
  )

  // 粗利自動セットハンドラ
  const handleAutoSetProfitMargin = useCallback(
    (amount: number) => {
      if (!recipe) return

      startTransition(async () => {
        await updateRecipe(recipe.id, {profitMargin: amount})
        const updated = await recalculateRecipeCosts(recipe.id)
        if (updated) setRecipe(updated)
      })
    },
    [recipe, setRecipe]
  )

  return {
    isPending,
    handleAddIngredient,
    handleMasterSelect,
    handleIngredientChange,
    handleDeleteIngredient,
    handleSettingChange,
    handleRecalculateParams,
    handleRecalculateCosts,
    handleInputModeChange,
    handleAutoSetProfitMargin,
  }
}
