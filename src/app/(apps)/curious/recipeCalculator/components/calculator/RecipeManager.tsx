'use client'

import { useState, useEffect, useTransition, useCallback, useRef } from 'react'
import { Bot, Save, Loader2, FileText, FileImage, FileType, Plus, History, ChevronRight } from 'lucide-react'
import { Button } from '@shadcn/ui/button'
import type { RecipeWithIngredients, AnalysisProgress, CostCalculationResult, IngredientMaster } from '../../types'
import {
  getRecipes,
  updateRecipe,
  updateRecipeIngredient,
  deleteRecipeIngredient,
  recalculateRecipeCosts,
} from '../../server-actions/recipe-actions'
import { analyzeRecipeText, analyzeRecipeImage, type AiProvider, type AiAnalysisResult } from '../../server-actions/ai-analysis-actions'
import { findIngredientByFuzzyName, getIngredientMasters } from '../../server-actions/ingredient-master-actions'
import { searchIngredientPrice } from '../../server-actions/ai-analysis-actions'
import { addRecipeIngredient, createRecipe } from '../../server-actions/recipe-actions'
import { IngredientTable } from './IngredientTable'
import { ManufacturingParams } from './ManufacturingParams'
import { CostSummaryPanel } from './CostSummaryPanel'
import { AiAnalysisStatus } from './AiAnalysisStatus'
import { convertToKg } from '../../lib/unit-converter'
import { convertPdfToImages, mergeImages } from '../../lib/pdf-to-image'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

// 表示モードの型
type ViewMode = 'select' | 'new' | 'edit'

// 分析フェーズの型
type AnalysisPhase = 'idle' | 'step1_ready' | 'step1_running' | 'step1_done' | 'step2_running' | 'step2_done'

export const RecipeManager = () => {
  const [recipe, setRecipe] = useState<RecipeWithIngredients | null>(null)
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    phase: 'idle',
    message: '',
    progress: 0,
  })
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [inputMode, setInputMode] = useState<'text' | 'image' | 'pdf'>('text')
  const [recipeText, setRecipeText] = useState('')
  const [pdfConversionStatus, setPdfConversionStatus] = useState<string>('')
  const [selectedImageName, setSelectedImageName] = useState<string>('')
  const [selectedPdfName, setSelectedPdfName] = useState<string>('')
  const [aiProvider, setAiProvider] = useState<AiProvider>('gemini')
  const [viewMode, setViewMode] = useState<ViewMode>('select')
  const [searchingIngredientIndex, setSearchingIngredientIndex] = useState<number | null>(null)
  const [analysisPhase, setAnalysisPhase] = useState<AnalysisPhase>('idle')
  const [sourceImageData, setSourceImageData] = useState<string | null>(null) // 取り込み時の画像データ
  const [showSourceImage, setShowSourceImage] = useState(false)
  const [ingredientMasters, setIngredientMasters] = useState<IngredientMaster[]>([])

  // 初回データ取得
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      const [recipesData, mastersData] = await Promise.all([
        getRecipes(),
        getIngredientMasters(),
      ])
      setRecipes(recipesData)
      setIngredientMasters(mastersData)
      if (recipesData.length > 0) {
        setRecipe(recipesData[0])
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  // 原価計算結果を生成
  const calculatedData: CostCalculationResult | null = recipe
    ? {
      detailedIngredients: recipe.RcRecipeIngredient.map((ing) => ({
        ...ing,
        weightKg: convertToKg(ing.amount, ing.unit),
        cost: ing.cost,
      })),
      totalMaterialCost: recipe.totalMaterialCost ?? 0,
      totalWeightKg: recipe.totalWeightKg ?? 0,
      productionWeightKg: recipe.productionWeightKg ?? 0,
      packCount: recipe.packCount ?? 0,
      materialCostPerPack: recipe.materialCostPerPack ?? 0,
      totalCostPerPack: recipe.totalCostPerPack ?? 0,
      sellingPrice: recipe.sellingPrice ?? 0,
    }
    : null

  // Step 1: 画像/PDF/テキストから材料一覧を分析（OCR）
  const handleStep1Analysis = useCallback(async () => {
    if (analysisPhase !== 'idle' && analysisPhase !== 'step1_done' && analysisPhase !== 'step2_done') return

    try {
      setAnalysisPhase('step1_running')
      setAnalysisProgress({ phase: 'ocr', message: 'レシピを解析中...', progress: 10 })

      let analysisResult: AiAnalysisResult
      let sourceType: 'text' | 'image' | 'pdf' = inputMode
      let imageData: string | null = null

      if (inputMode === 'image' && imageInputRef.current?.files?.[0]) {
        const file = imageInputRef.current.files[0]
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        imageData = base64
        setSourceImageData(base64)
        setAnalysisProgress({ phase: 'ocr', message: `${aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'}で解析中...`, progress: 10 })
        analysisResult = await analyzeRecipeImage(base64, aiProvider)
      } else if (inputMode === 'pdf' && pdfInputRef.current?.files?.[0]) {
        const file = pdfInputRef.current.files[0]
        setAnalysisProgress({ phase: 'ocr', message: 'PDFを高精細画像に変換中...', progress: 5 })
        setPdfConversionStatus('変換中...')

        const { images, pageCount } = await convertPdfToImages(file)
        setPdfConversionStatus(`${pageCount}ページを変換しました`)

        const mergedImage = await mergeImages(images)
        imageData = mergedImage
        setSourceImageData(mergedImage)
        setAnalysisProgress({ phase: 'ocr', message: `${aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'}でPDF画像を解析中...`, progress: 10 })

        analysisResult = await analyzeRecipeImage(mergedImage, aiProvider)
        sourceType = 'pdf'
      } else if (inputMode === 'text' && recipeText) {
        analysisResult = await analyzeRecipeText(recipeText)
      } else {
        throw new Error('レシピテキスト、画像、またはPDFを入力してください')
      }

      // レシピ作成（材料は「pending」状態で追加）
      const newRecipe = await createRecipe({
        name: analysisResult.recipeName || '解析レシピ',
        sourceType,
      })

      if (!newRecipe || !newRecipe.id) {
        throw new Error('レシピの作成に失敗しました')
      }

      // 全材料を「pending」状態で追加
      for (const parsed of analysisResult.ingredients) {
        await addRecipeIngredient({
          recipeId: newRecipe.id,
          ingredientMasterId: null,
          name: parsed.name,
          originalName: parsed.name,
          amount: parsed.amount,
          unit: parsed.unit,
          pricePerKg: 0,
          yieldRate: 100,
          isExternal: false,
          source: '未照合',
          status: 'pending',
        })
      }

      // 原価計算（この時点では0円）
      const createdRecipe = await recalculateRecipeCosts(newRecipe.id)
      setRecipe(createdRecipe)
      setRecipes((prev) => [createdRecipe!, ...prev])

      setAnalysisProgress({
        phase: 'ocr',
        message: `解析完了: ${analysisResult.ingredients.length}件の材料を検出`,
        progress: 100,
      })
      setAnalysisPhase('step1_done')
      setViewMode('edit')
    } catch (error) {
      console.error('AI解析エラー:', error)
      setAnalysisProgress({
        phase: 'error',
        message: error instanceof Error ? error.message : '解析中にエラーが発生しました',
        progress: 0,
      })
      setAnalysisPhase('idle')
    }
  }, [inputMode, recipeText, analysisPhase, aiProvider])

  // Step 2: 材料一覧の一括照合（DB or WEB）- 並行処理 + リアルタイムUI更新
  // いつでもやり直し可能（全材料をリセットして再照合）
  const handleStep2Matching = useCallback(async () => {
    if (!recipe || analysisPhase === 'step2_running') return

    const allIngredients = recipe.RcRecipeIngredient
    if (allIngredients.length === 0) return

    try {
      setAnalysisPhase('step2_running')
      setAnalysisProgress({ phase: 'matching', message: '全材料をリセット中...', progress: 0 })

      // Step 0: 全材料の既存紐付けをリセット（並行処理）
      await Promise.all(
        allIngredients.map(ing =>
          updateRecipeIngredient(ing.id, {
            ingredientMasterId: null,
            name: ing.originalName || ing.name,
            pricePerKg: 0,
            yieldRate: 100,
            isExternal: false,
            source: '照合待ち',
            status: 'pending',
            matchReason: null,
            externalProductName: null,
            externalProductId: null,
            externalProductUrl: null,
            externalPrice: null,
            externalWeight: null,
            externalWeightText: null,
          })
        )
      )

      // UIを更新
      const resetRecipe = await recalculateRecipeCosts(recipe.id)
      if (resetRecipe) {
        setRecipe(resetRecipe)
        setRecipes((prev) => prev.map(r => r.id === resetRecipe.id ? resetRecipe : r))
      }

      setAnalysisProgress({ phase: 'matching', message: '照合開始（並行処理）...', progress: 5 })

      const total = allIngredients.length
      let completed = 0
      const completedNames: string[] = []

      // UIを定期的に更新する関数
      const refreshUI = async () => {
        const updated = await recalculateRecipeCosts(recipe.id)
        if (updated) {
          setRecipe(updated)
          setRecipes((prev) => prev.map(r => r.id === updated.id ? updated : r))
        }
      }

      // 各材料を並行処理（DB照合→WEB検索を1件ずつ即座に保存 + UI更新）
      const processIngredient = async (ing: typeof allIngredients[0]) => {
        const searchName = ing.originalName || ing.name

        // 処理中ステータスを表示
        setAnalysisProgress({
          phase: 'matching',
          message: `照合中: ${searchName}... (${completed}/${total} 完了)`,
          progress: 5 + Math.round((90 * completed) / total),
        })

        try {
          // Step 1: まずDBマスタ照合を試みる
          const masterMatch = await findIngredientByFuzzyName(searchName)

          if (masterMatch) {
            // DBマスタにヒット → 即座に保存
            await updateRecipeIngredient(ing.id, {
              ingredientMasterId: masterMatch.id,
              name: masterMatch.name,
              pricePerKg: masterMatch.price,
              yieldRate: masterMatch.yield,
              isExternal: false,
              source: '社内マスタ',
              status: 'done',
              matchReason: masterMatch.name === searchName ? '完全一致' : '表記揺れ照合',
            })
            completedNames.push(`✓ ${searchName} → マスタ`)
          } else {
            // Step 2: DBにない場合はWEB検索 → 即座に保存
            const priceResult = await searchIngredientPrice(searchName)

            if (priceResult) {
              await updateRecipeIngredient(ing.id, {
                pricePerKg: priceResult.pricePerKg,
                isExternal: true,
                source: priceResult.source,
                status: 'done',
                externalProductName: priceResult.productName,
                externalProductId: priceResult.productId,
                externalProductUrl: priceResult.productUrl,
                externalPrice: priceResult.price,
                externalWeight: priceResult.weight,
                externalWeightText: priceResult.weightText,
              })
              completedNames.push(`✓ ${searchName} → ${priceResult.source}`)
            } else {
              await updateRecipeIngredient(ing.id, {
                status: 'error',
                source: '価格未取得',
              })
              completedNames.push(`✗ ${searchName} → 未取得`)
            }
          }
        } catch (err) {
          console.error(`照合エラー: ${searchName}`, err)
          await updateRecipeIngredient(ing.id, {
            status: 'error',
            source: 'エラー',
          })
          completedNames.push(`✗ ${searchName} → エラー`)
        }

        // 進捗更新
        completed++
        const lastResults = completedNames.slice(-3).join(' | ')
        setAnalysisProgress({
          phase: 'matching',
          message: `${completed}/${total} 完了 | ${lastResults}`,
          progress: 5 + Math.round((90 * completed) / total),
        })

        // 1件処理完了ごとにUIを更新
        await refreshUI()
      }

      // 全材料を並行処理で実行
      await Promise.all(allIngredients.map(processIngredient))

      // 最終原価計算
      setAnalysisProgress({ phase: 'calculating', message: '原価計算中...', progress: 98 })
      const finalRecipe = await recalculateRecipeCosts(recipe.id)
      await updateRecipe(recipe.id, { status: 'completed' })

      setRecipe(finalRecipe)
      setRecipes((prev) => prev.map(r => r.id === finalRecipe!.id ? finalRecipe! : r))

      setAnalysisProgress({ phase: 'done', message: '照合完了', progress: 100 })
      setAnalysisPhase('step2_done')
    } catch (error) {
      console.error('照合エラー:', error)
      setAnalysisProgress({
        phase: 'error',
        message: error instanceof Error ? error.message : '照合中にエラーが発生しました',
        progress: 0,
      })
      // エラーでも途中まで保存されているので、最新のレシピを取得
      const latestRecipe = await recalculateRecipeCosts(recipe.id)
      if (latestRecipe) {
        setRecipe(latestRecipe)
        setRecipes((prev) => prev.map(r => r.id === latestRecipe.id ? latestRecipe : r))
      }
      setAnalysisPhase('step1_done')
    }
  }, [recipe, analysisPhase])

  // 個別食材のAI照合（DB優先→WEB検索）+ リアルタイムフィードバック
  const handleAiSearchIngredient = useCallback(async (index: number) => {

    if (!recipe || searchingIngredientIndex !== null) return

    const ingredient = recipe.RcRecipeIngredient[index]
    if (!ingredient) return

    const searchName = ingredient.originalName || ingredient.name
    setSearchingIngredientIndex(index)

    try {
      // Step 0: 既存の検索結果・紐付けをリセット
      setAnalysisProgress({ phase: 'matching', message: `リセット中: ${searchName}`, progress: 10 })
      await updateRecipeIngredient(ingredient.id, {
        ingredientMasterId: null,
        name: searchName,
        pricePerKg: 0,
        yieldRate: 100,
        isExternal: false,
        source: '検索中...',
        status: 'searching',
        matchReason: null,
        externalProductName: null,
        externalProductId: null,
        externalProductUrl: null,
        externalPrice: null,
        externalWeight: null,
        externalWeightText: null,
      })

      // UIを即座に更新
      const resetRecipe = await recalculateRecipeCosts(recipe.id)
      if (resetRecipe) {
        setRecipe(resetRecipe)
        setRecipes((prev) => prev.map(r => r.id === resetRecipe.id ? resetRecipe : r))
      }

      // Step 1: まずAIでDBマスタ照合を試みる
      setAnalysisProgress({ phase: 'matching', message: `DBマスタ照合中: ${searchName}`, progress: 30 })
      const masterMatch = await findIngredientByFuzzyName(searchName)

      if (masterMatch) {
        setAnalysisProgress({ phase: 'matching', message: `マスタにヒット: ${masterMatch.name}`, progress: 80 })
        await updateRecipeIngredient(ingredient.id, {
          ingredientMasterId: masterMatch.id,
          name: masterMatch.name,
          pricePerKg: masterMatch.price,
          yieldRate: masterMatch.yield,
          isExternal: false,
          source: '社内マスタ',
          status: 'done',
          matchReason: masterMatch.name === searchName ? '完全一致' : 'AI類似照合',
        })
        setAnalysisProgress({ phase: 'done', message: `✓ ${searchName} → マスタ (¥${masterMatch.price}/kg)`, progress: 100 })
      } else {
        // Step 2: DBにない場合のみWeb検索を実行
        setAnalysisProgress({ phase: 'searching', message: `Web検索中: ${searchName}`, progress: 50 })
        const priceResult = await searchIngredientPrice(searchName)

        if (priceResult) {
          setAnalysisProgress({ phase: 'matching', message: `価格取得: ${priceResult.productName}`, progress: 80 })
          await updateRecipeIngredient(ingredient.id, {
            pricePerKg: priceResult.pricePerKg,
            isExternal: true,
            source: priceResult.source,
            status: 'done',
            externalProductName: priceResult.productName,
            externalProductId: priceResult.productId,
            externalProductUrl: priceResult.productUrl,
            externalPrice: priceResult.price,
            externalWeight: priceResult.weight,
            externalWeightText: priceResult.weightText,
          })
          setAnalysisProgress({ phase: 'done', message: `✓ ${searchName} → ${priceResult.source} (¥${priceResult.pricePerKg}/kg)`, progress: 100 })
        } else {
          await updateRecipeIngredient(ingredient.id, {
            status: 'error',
            source: '価格未取得',
          })
          setAnalysisProgress({ phase: 'error', message: `✗ ${searchName} → 価格未取得`, progress: 0 })
        }
      }

      // レシピを再計算して更新
      const updated = await recalculateRecipeCosts(recipe.id)
      if (updated) {
        setRecipe(updated)
        setRecipes((prev) => prev.map(r => r.id === updated.id ? updated : r))
      }
    } catch (error) {
      console.error('AI検索エラー:', error)
      setAnalysisProgress({ phase: 'error', message: `エラー: ${searchName}`, progress: 0 })
    } finally {
      setSearchingIngredientIndex(null)
    }
  }, [recipe, searchingIngredientIndex])

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
  }, [recipe])

  // マスタ選択ハンドラ
  const handleMasterSelect = useCallback(async (index: number, masterId: number | null) => {
    if (!recipe) return

    const ingredient = recipe.RcRecipeIngredient[index]
    if (!ingredient) return

    startTransition(async () => {
      if (masterId) {
        // マスタから情報を取得して更新
        const master = ingredientMasters.find(m => m.id === masterId)
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
        // マスタ割当を解除
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
  }, [recipe, ingredientMasters])

  // 食材変更ハンドラ
  const handleIngredientChange = (index: number, field: string, value: string | number) => {
    if (!recipe) return

    const ingredient = recipe.RcRecipeIngredient[index]
    if (!ingredient) return

    startTransition(async () => {
      const updateData: Record<string, unknown> = {}
      const numericFields = ['amount', 'pricePerKg', 'yieldRate']

      if (numericFields.includes(field)) {
        updateData[field] = Number(value)
      } else {
        updateData[field] = value
      }

      await updateRecipeIngredient(ingredient.id, updateData)
      const updated = await recalculateRecipeCosts(recipe.id)
      if (updated) setRecipe(updated)
    })
  }

  // 食材削除ハンドラ
  const handleDeleteIngredient = (index: number) => {
    if (!recipe) return

    const ingredient = recipe.RcRecipeIngredient[index]
    if (!ingredient) return

    startTransition(async () => {
      await deleteRecipeIngredient(ingredient.id)
      const updated = await recalculateRecipeCosts(recipe.id)
      if (updated) setRecipe(updated)
    })
  }

  // 設定変更ハンドラ
  const handleSettingChange = (key: string, value: number) => {
    if (!recipe) return

    startTransition(async () => {
      await updateRecipe(recipe.id, { [key]: value })
      const updated = await recalculateRecipeCosts(recipe.id)
      if (updated) setRecipe(updated)
    })
  }

  // レシピ選択ハンドラ
  const handleSelectRecipe = (selectedRecipe: RecipeWithIngredients) => {
    setRecipe(selectedRecipe)
    setViewMode('edit')
    // 既存レシピの状態に応じてanalysisPhaseを設定
    const hasPending = selectedRecipe.RcRecipeIngredient.some(ing => ing.status === 'pending')
    if (selectedRecipe.status === 'completed') {
      setAnalysisPhase('step2_done')
    } else if (hasPending) {
      setAnalysisPhase('step1_done')
    } else {
      setAnalysisPhase('idle')
    }
    setSourceImageData(null)
    setShowSourceImage(false)
  }

  // 新規作成モードへ切り替え
  const handleStartNew = () => {
    setRecipe(null)
    setViewMode('new')
    setAnalysisProgress({ phase: 'idle', message: '', progress: 0 })
    setAnalysisPhase('idle')
    setRecipeText('')
    setSelectedImageName('')
    setSelectedPdfName('')
    setSourceImageData(null)
    setShowSourceImage(false)
  }

  // 選択画面に戻る
  const handleBackToSelect = () => {
    setViewMode('select')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const isAnalyzing = !['idle', 'done', 'error'].includes(analysisProgress.phase)

  // レシピ選択画面
  if (viewMode === 'select') {
    return (
      <div className="h-full flex flex-col gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">AI原価計算</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 新規作成カード */}
            <button
              onClick={handleStartNew}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors group"
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">新規作成</h3>
              <p className="text-sm text-slate-500 text-center">
                テキスト・画像・PDFからレシピを解析し、<br />原価計算を行います
              </p>
            </button>

            {/* 過去のレシピカード */}
            <div className="flex flex-col p-6 border-2 border-slate-200 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <History className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">過去のレシピから選択</h3>
              </div>

              {recipes.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 py-8">
                  <p>まだレシピがありません</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2">
                  {recipes.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSelectRecipe(r)}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{r.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : r.status === 'analyzing'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                            }`}>
                            {r.status === 'completed' ? '完了' : r.status === 'analyzing' ? '解析中' : '下書き'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {r.RcRecipeIngredient.length}材料
                          </span>
                          {r.sellingPrice && (
                            <span className="text-xs text-slate-500">
                              ¥{Math.round(r.sellingPrice).toLocaleString()}/パック
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {/* 戻るボタン */}
        <button
          onClick={handleBackToSelect}
          className="text-sm text-slate-500 hover:text-slate-700 mb-3 flex items-center gap-1"
        >
          ← レシピ選択に戻る
        </button>
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {recipe?.name ?? '新規レシピ'}
              {(isPending || isAnalyzing) && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
            </h2>
            <div className="mt-2 text-sm">
              <AiAnalysisStatus
                isAnalyzing={isAnalyzing}
                aiLog={analysisProgress.message}
                scanProgress={analysisProgress.progress}
                ingredientCount={recipe?.RcRecipeIngredient?.length ?? 0}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2" disabled>
              <Save className="w-4 h-4" />
              保存済
            </Button>
          </div>
        </div>

        {/* レシピ入力エリア */}
        <div className="mt-4 border-t pt-4">
          <div className="flex flex-wrap gap-2 mb-3 items-center">
            <Button
              variant={inputMode === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInputMode('text')}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              テキスト入力
            </Button>
            <Button
              variant={inputMode === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInputMode('image')}
              className="flex items-center gap-2"
            >
              <FileImage className="w-4 h-4" />
              画像
            </Button>
            <Button
              variant={inputMode === 'pdf' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInputMode('pdf')}
              className="flex items-center gap-2"
            >
              <FileType className="w-4 h-4" />
              PDF
            </Button>

            {/* AIプロバイダー選択（画像/PDFモードのみ） */}
            {(inputMode === 'image' || inputMode === 'pdf') && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-300">
                <span className="text-xs text-slate-500">AI:</span>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value as AiProvider)}
                  className="text-sm border rounded px-2 py-1 bg-white"
                >
                  <option value="gemini">Gemini（推奨）</option>
                  <option value="openai">OpenAI GPT-4o</option>
                </select>
              </div>
            )}
          </div>

          {inputMode === 'text' && (
            <textarea
              ref={textAreaRef}
              className="w-full h-32 p-3 border rounded-lg text-sm"
              placeholder="レシピテキストを貼り付けてください（材料名、分量、単位を含むテキスト）"
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
            />
          )}

          {inputMode === 'image' && (
            <div className="border-2 border-dashed rounded-lg p-6 text-center border-blue-300 bg-blue-50">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                id="recipe-image"
                onChange={(e) => setSelectedImageName(e.target.files?.[0]?.name ?? '')}
              />
              <label htmlFor="recipe-image" className="cursor-pointer">
                <FileImage className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                <p className="text-sm text-blue-600">クリックしてレシピ画像をアップロード</p>
                <p className="text-xs text-blue-400 mt-1">JPG, PNG, WEBP対応</p>
              </label>
              {selectedImageName && (
                <p className="mt-2 text-sm text-blue-700 font-medium">{selectedImageName}</p>
              )}
            </div>
          )}

          {inputMode === 'pdf' && (
            <div className="border-2 border-dashed rounded-lg p-6 text-center border-orange-300 bg-orange-50">
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                id="recipe-pdf"
                onChange={(e) => {
                  setSelectedPdfName(e.target.files?.[0]?.name ?? '')
                  setPdfConversionStatus('')
                }}
              />
              <label htmlFor="recipe-pdf" className="cursor-pointer">
                <FileType className="w-8 h-8 mx-auto text-orange-400 mb-2" />
                <p className="text-sm text-orange-600">クリックしてPDFをアップロード</p>
                <p className="text-xs text-orange-400 mt-1">PDF形式のレシピを画像化して解析します</p>
              </label>
              {selectedPdfName && (
                <p className="mt-2 text-sm text-orange-700 font-medium">{selectedPdfName}</p>
              )}
              {pdfConversionStatus && (
                <p className="mt-1 text-xs text-orange-600">{pdfConversionStatus}</p>
              )}
            </div>
          )}

          {/* Step 1 ボタン */}
          <div className="flex flex-wrap gap-3 mt-3">
            <Button
              onClick={handleStep1Analysis}
              disabled={
                analysisPhase === 'step1_running' ||
                analysisPhase === 'step2_running' ||
                (inputMode === 'text' && !recipeText) ||
                (inputMode === 'image' && !selectedImageName) ||
                (inputMode === 'pdf' && !selectedPdfName)
              }
              className={`flex items-center gap-2 ${analysisPhase === 'step1_running'
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                }`}
            >
              {analysisPhase === 'step1_running' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
              <span>Step 1: 材料を抽出</span>
            </Button>

            {/* Step 2 ボタン（材料がある場合は常に表示、いつでもやり直し可能） */}
            {recipe && recipe.RcRecipeIngredient.length > 0 && (
              <Button
                onClick={handleStep2Matching}
                disabled={analysisPhase === 'step2_running' || analysisPhase === 'step1_running'}
                className={`flex items-center gap-2 ${analysisPhase === 'step2_running' || analysisPhase === 'step1_running'
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  }`}
              >
                {analysisPhase === 'step2_running' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
                <span>全材料を一括照合（やり直し可）</span>
              </Button>
            )}
          </div>

          {/* 分析ステップの説明 */}
          <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
            <p className="font-medium mb-1">分析の流れ:</p>
            <div className="flex items-center gap-4">
              <span className={analysisPhase === 'step1_done' || analysisPhase === 'step2_done' || analysisPhase === 'step2_running' ? 'text-green-600' : ''}>
                ① 材料抽出（OCR解析）
              </span>
              <span>→</span>
              <span className={analysisPhase === 'step2_done' ? 'text-green-600' : ''}>
                ② 一括照合（DBマスタ優先 → Web検索）
              </span>
            </div>
            <p className="mt-1 text-slate-400">※ 個別の材料は後から「AI照合」ボタンで再検索できます</p>
          </div>
        </div>
      </div>

      {/* 取り込み元画像/PDFの表示 */}
      {sourceImageData && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <button
            onClick={() => setShowSourceImage(!showSourceImage)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
          >
            <FileImage className="w-4 h-4" />
            取り込み元の画像/PDF {showSourceImage ? '▲' : '▼'}
          </button>
          {showSourceImage && (
            <div className="mt-3 max-h-[400px] overflow-auto border rounded-lg">
              <img src={sourceImageData} alt="取り込み元" className="w-full" />
            </div>
          )}
        </div>
      )}

      {/* 原材料テーブル */}
      {recipe && calculatedData && (
        <>
          {/* 原材料追加ボタン */}
          <div className="flex justify-end">
            <Button
              onClick={handleAddIngredient}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              原材料を手動追加
            </Button>
          </div>

          <IngredientTable
            ingredients={calculatedData.detailedIngredients}
            ingredientMasters={ingredientMasters}
            onIngredientChange={handleIngredientChange}
            onDeleteIngredient={handleDeleteIngredient}
            onAiSearch={handleAiSearchIngredient}
            onMasterSelect={handleMasterSelect}
            searchingIndex={searchingIngredientIndex}
          />

          {/* 計算結果パネル */}
          {recipe.RcRecipeIngredient.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ManufacturingParams
                settings={{
                  lossRate: recipe.lossRate,
                  packWeightG: recipe.packWeightG,
                  packagingCost: recipe.packagingCost,
                  processingCost: recipe.processingCost,
                  profitMargin: recipe.profitMargin,
                }}
                calculatedData={calculatedData}
                onSettingChange={handleSettingChange}
              />
              <CostSummaryPanel
                settings={{
                  lossRate: recipe.lossRate,
                  packWeightG: recipe.packWeightG,
                  packagingCost: recipe.packagingCost,
                  processingCost: recipe.processingCost,
                  profitMargin: recipe.profitMargin,
                }}
                calculatedData={calculatedData}
                onSettingChange={handleSettingChange}
              />
            </div>
          )}
        </>
      )}

      {/* 過去のレシピ一覧 */}
      {recipes.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-700 mb-3">過去のレシピ</h3>
          <div className="flex flex-wrap gap-2">
            {recipes.map((r) => (
              <Button
                key={r.id}
                variant={recipe?.id === r.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRecipe(r)}
              >
                {r.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
