'use client'

import {useState, useEffect} from 'react'
import {Save, Loader2, FileImage, Plus} from 'lucide-react'
import {Button} from '@shadcn/ui/button'
import type {RecipeWithIngredients, CostCalculationResult, IngredientMaster, RecipeSettings} from '../../types'
import {getRecipes} from '../../server-actions/recipe-actions'
import {getIngredientMasters} from '../../server-actions/ingredient-master-actions'
import {IngredientTable} from './IngredientTable'
import {ManufacturingParams} from './ManufacturingParams'
import {CostSummaryPanel} from './CostSummaryPanel'
import {AiAnalysisStatus} from './AiAnalysisStatus'
import {RecipeSelectView} from './RecipeSelectView'
import {RecipeInputPanel} from './RecipeInputPanel'
import {convertToKg} from '../../lib/unit-converter'
import {useRecipeAnalysis, useRecipeEditor, useProfitMarginAlert, type ViewMode} from '../../hooks'

export const RecipeManager = () => {
  const [recipe, setRecipe] = useState<RecipeWithIngredients | null>(null)
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [ingredientMasters, setIngredientMasters] = useState<IngredientMaster[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('select')

  // カスタムHooks
  const analysis = useRecipeAnalysis({
    recipe,
    setRecipe,
    setRecipes,
    setViewMode,
  })

  const editor = useRecipeEditor({
    recipe,
    ingredientMasters,
    setRecipe,
  })

  // 初回データ取得
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      const [recipesData, mastersData] = await Promise.all([getRecipes(), getIngredientMasters()])
      setRecipes(recipesData)
      setIngredientMasters(mastersData)
      if (recipesData.length > 0) {
        setRecipe(recipesData[0])
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  // レシピ合計量を計算（参考値）
  const totalRecipeWeightG = recipe
    ? recipe.RcRecipeIngredient.reduce((sum, ing) => sum + convertToKg(ing.amount, ing.unit) * 1000, 0)
    : 0

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
        totalRecipeWeightG,
        productionWeightKg: recipe.productionWeightKg ?? 0,
        packCount: recipe.packCount ?? 0,
        materialCostPerPack: recipe.materialCostPerPack ?? 0,
        totalCostPerPack: recipe.totalCostPerPack ?? 0,
        sellingPrice: recipe.sellingPrice ?? 0,
      }
    : null

  // レシピ設定を生成
  const settings: RecipeSettings | null = recipe
    ? {
        lossRate: recipe.lossRate,
        packWeightG: recipe.packWeightG,
        packagingCost: recipe.packagingCost,
        processingCost: recipe.processingCost,
        profitMargin: recipe.profitMargin,
        otherCost: recipe.otherCost,
        productionWeightG: recipe.productionWeightG,
        inputMode: (recipe.inputMode as 'fillAmount' | 'packCount') ?? 'fillAmount',
      }
    : null

  // 粗利アラート
  const {alert: profitAlert} = useProfitMarginAlert({
    packCount: recipe?.packCount ?? 0,
    profitMargin: recipe?.profitMargin ?? 0,
    sellingPrice: recipe?.sellingPrice ?? 0,
  })

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

  // レシピ選択画面
  if (viewMode === 'select') {
    return <RecipeSelectView recipes={recipes} onStartNew={analysis.handleStartNew} onSelectRecipe={analysis.handleSelectRecipe} />
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {/* 戻るボタン */}
        <button onClick={handleBackToSelect} className="text-sm text-slate-500 hover:text-slate-700 mb-3 flex items-center gap-1">
          ← レシピ選択に戻る
        </button>
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {recipe?.name ?? '新規レシピ'}
              {(editor.isPending || analysis.isAnalyzing) && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
            </h2>
            <div className="mt-2 text-sm">
              <AiAnalysisStatus
                isAnalyzing={analysis.isAnalyzing}
                aiLog={analysis.analysisProgress.message}
                scanProgress={analysis.analysisProgress.progress}
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
        <RecipeInputPanel
          inputMode={analysis.inputMode}
          recipeText={analysis.recipeText}
          selectedImageName={analysis.selectedImageName}
          selectedPdfName={analysis.selectedPdfName}
          pdfConversionStatus={analysis.pdfConversionStatus}
          aiProvider={analysis.aiProvider}
          analysisPhase={analysis.analysisPhase}
          hasIngredients={!!recipe && recipe.RcRecipeIngredient.length > 0}
          imageInputRef={analysis.imageInputRef}
          pdfInputRef={analysis.pdfInputRef}
          textAreaRef={analysis.textAreaRef}
          onInputModeChange={analysis.setInputMode}
          onRecipeTextChange={analysis.setRecipeText}
          onImageSelect={analysis.setSelectedImageName}
          onPdfSelect={analysis.setSelectedPdfName}
          onAiProviderChange={analysis.setAiProvider}
          onPdfConversionStatusChange={analysis.setPdfConversionStatus}
          onStep1Analysis={analysis.handleStep1Analysis}
          onStep2Matching={analysis.handleStep2Matching}
        />
      </div>

      {/* 取り込み元画像/PDFの表示 */}
      {analysis.sourceImageData && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <button
            onClick={() => analysis.setShowSourceImage(!analysis.showSourceImage)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
          >
            <FileImage className="w-4 h-4" />
            取り込み元の画像/PDF {analysis.showSourceImage ? '▲' : '▼'}
          </button>
          {analysis.showSourceImage && (
            <div className="mt-3 max-h-[400px] overflow-auto border rounded-lg">
              <img src={analysis.sourceImageData} alt="取り込み元" className="w-full" />
            </div>
          )}
        </div>
      )}

      {/* 原材料テーブル */}
      {recipe && calculatedData && (
        <>
          {/* 原材料追加ボタン */}
          <div className="flex justify-end">
            <Button onClick={editor.handleAddIngredient} variant="outline" size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              原材料を手動追加
            </Button>
          </div>

          <IngredientTable
            ingredients={calculatedData.detailedIngredients}
            ingredientMasters={ingredientMasters}
            onIngredientChange={editor.handleIngredientChange}
            onDeleteIngredient={editor.handleDeleteIngredient}
            onAiSearch={analysis.handleAiSearchIngredient}
            onMasterSelect={editor.handleMasterSelect}
            searchingIndex={analysis.searchingIngredientIndex}
          />

          {/* 計算結果パネル */}
          {recipe.RcRecipeIngredient.length > 0 && settings && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ManufacturingParams
                settings={settings}
                calculatedData={calculatedData}
                onRecalculate={editor.handleRecalculateParams}
                onInputModeChange={editor.handleInputModeChange}
              />
              <CostSummaryPanel
                settings={settings}
                calculatedData={calculatedData}
                profitAlert={profitAlert}
                onRecalculate={editor.handleRecalculateCosts}
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
              <Button key={r.id} variant={recipe?.id === r.id ? 'default' : 'outline'} size="sm" onClick={() => setRecipe(r)}>
                {r.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
