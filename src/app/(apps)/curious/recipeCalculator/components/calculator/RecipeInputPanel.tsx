'use client'

import { Bot, Loader2, FileText, FileImage, FileType } from 'lucide-react'
import { Button } from '@cm/components/styles/common-components/Button'
import type { AiProvider } from '../../server-actions/ai-analysis-actions'
import type { AnalysisPhase, InputMode } from '../../hooks'

interface RecipeInputPanelProps {
  inputMode: InputMode
  recipeText: string
  selectedImageName: string
  selectedPdfName: string
  pdfConversionStatus: string
  aiProvider: AiProvider
  analysisPhase: AnalysisPhase
  hasIngredients: boolean
  imageInputRef: React.RefObject<HTMLInputElement | null>
  pdfInputRef: React.RefObject<HTMLInputElement | null>
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>
  onInputModeChange: (mode: InputMode) => void
  onRecipeTextChange: (text: string) => void
  onImageSelect: (name: string) => void
  onPdfSelect: (name: string) => void
  onAiProviderChange: (provider: AiProvider) => void
  onPdfConversionStatusChange: (status: string) => void
  onStep1Analysis: () => void
  onStep2Matching: () => void
}

export const RecipeInputPanel = ({
  inputMode,
  recipeText,
  selectedImageName,
  selectedPdfName,
  pdfConversionStatus,
  aiProvider,
  analysisPhase,
  hasIngredients,
  imageInputRef,
  pdfInputRef,
  textAreaRef,
  onInputModeChange,
  onRecipeTextChange,
  onImageSelect,
  onPdfSelect,
  onAiProviderChange,
  onPdfConversionStatusChange,
  onStep1Analysis,
  onStep2Matching,
}: RecipeInputPanelProps) => {
  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <Button

          size="sm"
          onClick={() => onInputModeChange('text')}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          テキスト入力
        </Button>
        <Button

          size="sm"
          onClick={() => onInputModeChange('image')}
          className="flex items-center gap-2"
        >
          <FileImage className="w-4 h-4" />
          画像
        </Button>
        <Button

          size="sm"
          onClick={() => onInputModeChange('pdf')}
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
              onChange={(e) => onAiProviderChange(e.target.value as AiProvider)}
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
          onChange={(e) => onRecipeTextChange(e.target.value)}
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
            onChange={(e) => onImageSelect(e.target.files?.[0]?.name ?? '')}
          />
          <label htmlFor="recipe-image" className="cursor-pointer">
            <FileImage className="w-8 h-8 mx-auto text-blue-400 mb-2" />
            <p className="text-sm text-blue-600">クリックしてレシピ画像をアップロード</p>
            <p className="text-xs text-blue-400 mt-1">JPG, PNG, WEBP対応</p>
          </label>
          {selectedImageName && <p className="mt-2 text-sm text-blue-700 font-medium">{selectedImageName}</p>}
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
              onPdfSelect(e.target.files?.[0]?.name ?? '')
              onPdfConversionStatusChange('')
            }}
          />
          <label htmlFor="recipe-pdf" className="cursor-pointer">
            <FileType className="w-8 h-8 mx-auto text-orange-400 mb-2" />
            <p className="text-sm text-orange-600">クリックしてPDFをアップロード</p>
            <p className="text-xs text-orange-400 mt-1">PDF形式のレシピを画像化して解析します</p>
          </label>
          {selectedPdfName && <p className="mt-2 text-sm text-orange-700 font-medium">{selectedPdfName}</p>}
          {pdfConversionStatus && <p className="mt-1 text-xs text-orange-600">{pdfConversionStatus}</p>}
        </div>
      )}

      {/* Step 1 ボタン */}
      <div className="flex flex-wrap gap-3 mt-3">
        <Button
          onClick={onStep1Analysis}
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
          {analysisPhase === 'step1_running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
          <span>Step 1: 材料を抽出</span>
        </Button>

        {/* Step 2 ボタン（材料がある場合は常に表示） */}
        {hasIngredients && (
          <Button
            onClick={onStep2Matching}
            disabled={analysisPhase === 'step2_running' || analysisPhase === 'step1_running'}
            className={`flex items-center gap-2 ${analysisPhase === 'step2_running' || analysisPhase === 'step1_running'
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
              }`}
          >
            {analysisPhase === 'step2_running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            <span>全材料を一括照合（やり直し可）</span>
          </Button>
        )}
      </div>

      {/* 分析ステップの説明 */}
      <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
        <p className="font-medium mb-1">分析の流れ:</p>
        <div className="flex items-center gap-4">
          <span
            className={
              analysisPhase === 'step1_done' || analysisPhase === 'step2_done' || analysisPhase === 'step2_running'
                ? 'text-green-600'
                : ''
            }
          >
            ① 材料抽出（OCR解析）
          </span>
          <span>→</span>
          <span className={analysisPhase === 'step2_done' ? 'text-green-600' : ''}>② 一括照合（DBマスタ優先 → Web検索）</span>
        </div>
        <p className="mt-1 text-slate-400">※ 個別の材料は後から「AI照合」ボタンで再検索できます</p>
      </div>
    </div>
  )
}
