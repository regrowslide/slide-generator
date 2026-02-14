'use client'

import {useState, useCallback, useRef} from 'react'
import type {RecipeWithIngredients, AnalysisProgress} from '../types'
import {
  updateRecipe,
  updateRecipeIngredient,
  recalculateRecipeCosts,
  addRecipeIngredient,
  createRecipe,
} from '../server-actions/recipe-actions'
import {
  analyzeRecipeText,
  analyzeRecipeImage,
  searchIngredientPrice,
  type AiProvider,
  type AiAnalysisResult,
} from '../server-actions/ai-analysis-actions'
import {findIngredientByFuzzyName} from '../server-actions/ingredient-master-actions'
import {convertPdfToImages, mergeImages} from '../lib/pdf-to-image'

// 表示モードの型
export type ViewMode = 'select' | 'new' | 'edit'

// 分析フェーズの型
export type AnalysisPhase = 'idle' | 'step1_ready' | 'step1_running' | 'step1_done' | 'step2_running' | 'step2_done'

// 入力モードの型
export type InputMode = 'text' | 'image' | 'pdf'

interface UseRecipeAnalysisProps {
  recipe: RecipeWithIngredients | null
  setRecipe: (recipe: RecipeWithIngredients | null) => void
  setRecipes: React.Dispatch<React.SetStateAction<RecipeWithIngredients[]>>
  setViewMode: (mode: ViewMode) => void
}

export const useRecipeAnalysis = ({recipe, setRecipe, setRecipes, setViewMode}: UseRecipeAnalysisProps) => {
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    phase: 'idle',
    message: '',
    progress: 0,
  })
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [recipeText, setRecipeText] = useState('')
  const [pdfConversionStatus, setPdfConversionStatus] = useState('')
  const [selectedImageName, setSelectedImageName] = useState('')
  const [selectedPdfName, setSelectedPdfName] = useState('')
  const [aiProvider, setAiProvider] = useState<AiProvider>('gemini')
  const [analysisPhase, setAnalysisPhase] = useState<AnalysisPhase>('idle')
  const [sourceImageData, setSourceImageData] = useState<string | null>(null)
  const [showSourceImage, setShowSourceImage] = useState(false)
  const [searchingIngredientIndex, setSearchingIngredientIndex] = useState<number | null>(null)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const isAnalyzing = !['idle', 'done', 'error'].includes(analysisProgress.phase)

  // Step 1: 画像/PDF/テキストから材料一覧を分析（OCR）
  const handleStep1Analysis = useCallback(async () => {
    if (analysisPhase !== 'idle' && analysisPhase !== 'step1_done' && analysisPhase !== 'step2_done') return

    try {
      setAnalysisPhase('step1_running')
      setAnalysisProgress({phase: 'ocr', message: 'レシピを解析中...', progress: 10})

      let analysisResult: AiAnalysisResult
      let sourceType: 'text' | 'image' | 'pdf' = inputMode

      if (inputMode === 'image' && imageInputRef.current?.files?.[0]) {
        const file = imageInputRef.current.files[0]
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        setSourceImageData(base64)
        setAnalysisProgress({
          phase: 'ocr',
          message: `${aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'}で解析中...`,
          progress: 10,
        })
        analysisResult = await analyzeRecipeImage(base64, aiProvider)
      } else if (inputMode === 'pdf' && pdfInputRef.current?.files?.[0]) {
        const file = pdfInputRef.current.files[0]
        setAnalysisProgress({phase: 'ocr', message: 'PDFを高精細画像に変換中...', progress: 5})
        setPdfConversionStatus('変換中...')

        const {images, pageCount} = await convertPdfToImages(file)
        setPdfConversionStatus(`${pageCount}ページを変換しました`)

        const mergedImage = await mergeImages(images)
        setSourceImageData(mergedImage)
        setAnalysisProgress({
          phase: 'ocr',
          message: `${aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'}でPDF画像を解析中...`,
          progress: 10,
        })

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
      if (createdRecipe) {
        setRecipe(createdRecipe)
        setRecipes((prev) => [createdRecipe, ...prev])
      }

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
  }, [inputMode, recipeText, analysisPhase, aiProvider, setRecipe, setRecipes, setViewMode])

  // Step 2: 材料一覧の一括照合（DB or WEB）
  const handleStep2Matching = useCallback(async () => {
    if (!recipe || analysisPhase === 'step2_running') return

    const allIngredients = recipe.RcRecipeIngredient
    if (allIngredients.length === 0) return

    try {
      setAnalysisPhase('step2_running')

      const total = allIngredients.length
      const progressState = {
        completed: 0,
        processing: 0,
        errors: 0,
        results: [] as string[],
      }

      const updateProgress = (currentItem?: string) => {
        const {completed, errors, results} = progressState
        const lastResults = results.slice(-3).join(' | ')
        const statusText = currentItem
          ? `処理中: ${currentItem} | 完了: ${completed}/${total} | エラー: ${errors}`
          : `完了: ${completed}/${total} | エラー: ${errors}`

        setAnalysisProgress({
          phase: 'matching',
          message: lastResults ? `${statusText}\n${lastResults}` : statusText,
          progress: 5 + Math.round((90 * completed) / total),
        })
      }

      const refreshUIAsync = () => {
        recalculateRecipeCosts(recipe.id).then((updated) => {
          if (updated) {
            setRecipe(updated)
            setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
          }
        })
      }

      // 全材料を「searching」ステータスに変更
      setAnalysisProgress({phase: 'matching', message: '全材料をリセット中...', progress: 0})
      await Promise.all(
        allIngredients.map((ing) =>
          updateRecipeIngredient(ing.id, {
            ingredientMasterId: null,
            name: ing.originalName || ing.name,
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
        )
      )

      refreshUIAsync()
      setAnalysisProgress({phase: 'matching', message: '照合開始（並行処理）...', progress: 5})

      const processIngredient = async (ing: (typeof allIngredients)[0]) => {
        const searchName = ing.originalName || ing.name
        progressState.processing++
        updateProgress(searchName)

        try {
          const masterMatch = await findIngredientByFuzzyName(searchName)

          if (masterMatch) {
            await updateRecipeIngredient(ing.id, {
              ingredientMasterId: masterMatch.id,
              name: masterMatch.name,
              pricePerKg: masterMatch.price,
              yieldRate: masterMatch.yield,
              isExternal: false,
              source: '社内マスタ',
              status: 'done',
              matchReason: masterMatch.name === searchName ? '完全一致' : 'AI類似照合',
            })
            progressState.results.push(`✓ ${searchName} → マスタ (¥${masterMatch.price}/kg)`)
          } else {
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
              progressState.results.push(`✓ ${searchName} → ${priceResult.source} (¥${priceResult.pricePerKg}/kg)`)
            } else {
              await updateRecipeIngredient(ing.id, {
                status: 'error',
                source: '価格未取得',
              })
              progressState.errors++
              progressState.results.push(`✗ ${searchName} → 未取得`)
            }
          }
        } catch (err) {
          console.error(`照合エラー: ${searchName}`, err)
          await updateRecipeIngredient(ing.id, {
            status: 'error',
            source: 'エラー',
          })
          progressState.errors++
          progressState.results.push(`✗ ${searchName} → エラー`)
        }

        progressState.completed++
        progressState.processing--
        updateProgress()
        refreshUIAsync()
      }

      await Promise.all(allIngredients.map(processIngredient))

      setAnalysisProgress({phase: 'calculating', message: '原価計算中...', progress: 98})
      const finalRecipe = await recalculateRecipeCosts(recipe.id)
      await updateRecipe(recipe.id, {status: 'completed'})

      if (finalRecipe) {
        setRecipe(finalRecipe)
        setRecipes((prev) => prev.map((r) => (r.id === finalRecipe.id ? finalRecipe : r)))
      }

      const errorCount = progressState.errors
      const successCount = total - errorCount
      setAnalysisProgress({
        phase: 'done',
        message: `照合完了: 成功 ${successCount}件 / エラー ${errorCount}件`,
        progress: 100,
      })
      setAnalysisPhase('step2_done')
    } catch (error) {
      console.error('照合エラー:', error)
      setAnalysisProgress({
        phase: 'error',
        message: error instanceof Error ? error.message : '照合中にエラーが発生しました',
        progress: 0,
      })
      const latestRecipe = await recalculateRecipeCosts(recipe.id)
      if (latestRecipe) {
        setRecipe(latestRecipe)
        setRecipes((prev) => prev.map((r) => (r.id === latestRecipe.id ? latestRecipe : r)))
      }
      setAnalysisPhase('step1_done')
    }
  }, [recipe, analysisPhase, setRecipe, setRecipes])

  // 個別食材のAI照合
  const handleAiSearchIngredient = useCallback(
    async (index: number) => {
      if (!recipe || searchingIngredientIndex !== null) return

      const ingredient = recipe.RcRecipeIngredient[index]
      if (!ingredient) return

      const searchName = ingredient.originalName || ingredient.name
      setSearchingIngredientIndex(index)

      try {
        setAnalysisProgress({phase: 'matching', message: `リセット中: ${searchName}`, progress: 10})
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

        const resetRecipe = await recalculateRecipeCosts(recipe.id)
        if (resetRecipe) {
          setRecipe(resetRecipe)
          setRecipes((prev) => prev.map((r) => (r.id === resetRecipe.id ? resetRecipe : r)))
        }

        setAnalysisProgress({phase: 'matching', message: `DBマスタ照合中: ${searchName}`, progress: 30})
        const masterMatch = await findIngredientByFuzzyName(searchName)

        if (masterMatch) {
          setAnalysisProgress({phase: 'matching', message: `マスタにヒット: ${masterMatch.name}`, progress: 80})
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
          setAnalysisProgress({
            phase: 'done',
            message: `✓ ${searchName} → マスタ (¥${masterMatch.price}/kg)`,
            progress: 100,
          })
        } else {
          setAnalysisProgress({phase: 'searching', message: `Web検索中: ${searchName}`, progress: 50})
          const priceResult = await searchIngredientPrice(searchName)

          if (priceResult) {
            setAnalysisProgress({phase: 'matching', message: `価格取得: ${priceResult.productName}`, progress: 80})
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
            setAnalysisProgress({
              phase: 'done',
              message: `✓ ${searchName} → ${priceResult.source} (¥${priceResult.pricePerKg}/kg)`,
              progress: 100,
            })
          } else {
            await updateRecipeIngredient(ingredient.id, {
              status: 'error',
              source: '価格未取得',
            })
            setAnalysisProgress({phase: 'error', message: `✗ ${searchName} → 価格未取得`, progress: 0})
          }
        }

        const updated = await recalculateRecipeCosts(recipe.id)
        if (updated) {
          setRecipe(updated)
          setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
        }
      } catch (error) {
        console.error('AI検索エラー:', error)
        setAnalysisProgress({phase: 'error', message: `エラー: ${searchName}`, progress: 0})
      } finally {
        setSearchingIngredientIndex(null)
      }
    },
    [recipe, searchingIngredientIndex, setRecipe, setRecipes]
  )

  // 新規作成モードへ切り替え
  const handleStartNew = useCallback(() => {
    setRecipe(null)
    setViewMode('new')
    setAnalysisProgress({phase: 'idle', message: '', progress: 0})
    setAnalysisPhase('idle')
    setRecipeText('')
    setSelectedImageName('')
    setSelectedPdfName('')
    setSourceImageData(null)
    setShowSourceImage(false)
  }, [setRecipe, setViewMode])

  // レシピ選択ハンドラ
  const handleSelectRecipe = useCallback(
    (selectedRecipe: RecipeWithIngredients) => {
      setRecipe(selectedRecipe)
      setViewMode('edit')
      const hasPending = selectedRecipe.RcRecipeIngredient.some((ing) => ing.status === 'pending')
      if (selectedRecipe.status === 'completed') {
        setAnalysisPhase('step2_done')
      } else if (hasPending) {
        setAnalysisPhase('step1_done')
      } else {
        setAnalysisPhase('idle')
      }
      setSourceImageData(null)
      setShowSourceImage(false)
    },
    [setRecipe, setViewMode]
  )

  return {
    // 状態
    analysisProgress,
    inputMode,
    recipeText,
    pdfConversionStatus,
    selectedImageName,
    selectedPdfName,
    aiProvider,
    analysisPhase,
    sourceImageData,
    showSourceImage,
    searchingIngredientIndex,
    isAnalyzing,
    // Refs
    imageInputRef,
    pdfInputRef,
    textAreaRef,
    // セッター
    setInputMode,
    setRecipeText,
    setSelectedImageName,
    setSelectedPdfName,
    setAiProvider,
    setShowSourceImage,
    setPdfConversionStatus,
    // ハンドラ
    handleStep1Analysis,
    handleStep2Matching,
    handleAiSearchIngredient,
    handleStartNew,
    handleSelectRecipe,
  }
}
