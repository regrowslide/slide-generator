'use client'

import {useState, useEffect} from 'react'
import {Calculator, AlertTriangle, BarChart3, RefreshCw, RotateCcw} from 'lucide-react'
import type {CostCalculationResult, RecipeSettings, ProfitMarginAlert} from '../../types'

interface CostSummaryPanelProps {
  settings: RecipeSettings
  calculatedData: CostCalculationResult
  profitAlert: ProfitMarginAlert | null
  onRecalculate: (params: {packagingCost: number; processingCost: number; otherCost: number; profitMargin: number}) => void
  onAutoSetProfitMargin?: (amount: number) => void
}

export const CostSummaryPanel = ({settings, calculatedData, profitAlert, onRecalculate, onAutoSetProfitMargin}: CostSummaryPanelProps) => {
  // ローカル state で入力値を管理
  const [localPackagingCost, setLocalPackagingCost] = useState(settings.packagingCost)
  const [localProcessingCost, setLocalProcessingCost] = useState(settings.processingCost)
  const [localOtherCost, setLocalOtherCost] = useState(settings.otherCost)
  const [localProfitMargin, setLocalProfitMargin] = useState(settings.profitMargin)

  // 親から settings が更新された場合にローカル state を同期
  useEffect(() => {
    setLocalPackagingCost(settings.packagingCost)
    setLocalProcessingCost(settings.processingCost)
    setLocalOtherCost(settings.otherCost)
    setLocalProfitMargin(settings.profitMargin)
  }, [settings.packagingCost, settings.processingCost, settings.otherCost, settings.profitMargin])

  // ローカル値が親の値と異なるか判定
  const hasChanges =
    localPackagingCost !== settings.packagingCost ||
    localProcessingCost !== settings.processingCost ||
    localOtherCost !== settings.otherCost ||
    localProfitMargin !== settings.profitMargin

  const handleRecalculate = () => {
    onRecalculate({
      packagingCost: localPackagingCost,
      processingCost: localProcessingCost,
      otherCost: localOtherCost,
      profitMargin: localProfitMargin,
    })
  }

  // 粗利率を計算
  const profitRate =
    calculatedData.sellingPrice > 0 ? (settings.profitMargin / calculatedData.sellingPrice) * 100 : 0

  return (
    <section className="bg-white rounded-xl p-6 border-2 border-indigo-100 shadow-lg relative">
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-indigo-50 rounded-full opacity-50" />
      <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2 relative">
        <Calculator className="w-5 h-5 text-green-500" />
        原価見積
      </h3>
      <div className="space-y-3 relative z-10">
        <div className="flex justify-between text-sm border-b border-dashed pb-2">
          <span className="text-slate-600">原材料費 / パック</span>
          <span className="font-medium">¥{Math.round(calculatedData.materialCostPerPack).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <label>包材費</label>
          <input
            type="number"
            value={localPackagingCost}
            onChange={(e) => setLocalPackagingCost(Number(e.target.value))}
            className="w-20 text-right border rounded"
          />
        </div>
        <div className="flex justify-between items-center text-sm">
          <label>加工費</label>
          <input
            type="number"
            value={localProcessingCost}
            onChange={(e) => setLocalProcessingCost(Number(e.target.value))}
            className="w-20 text-right border rounded"
          />
        </div>
        {/* その他費用 */}
        <div className="flex justify-between items-center text-sm">
          <label>その他費用</label>
          <input
            type="number"
            value={localOtherCost}
            onChange={(e) => setLocalOtherCost(Number(e.target.value))}
            className="w-20 text-right border rounded"
          />
        </div>
        <div className="bg-slate-100 p-2 rounded flex justify-between font-bold text-slate-700">
          <span>製造原価計</span>
          <span>¥{Math.round(calculatedData.totalCostPerPack).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <label>粗利（額）</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={localProfitMargin}
              onChange={(e) => setLocalProfitMargin(Number(e.target.value))}
              className="w-24 text-right border border-blue-300 text-blue-700 font-bold rounded"
            />
            {profitAlert?.isWarning && onAutoSetProfitMargin && (
              <button
                type="button"
                onClick={() => {
                  setLocalProfitMargin(profitAlert.minProfitAmount)
                  onAutoSetProfitMargin(profitAlert.minProfitAmount)
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-100 text-amber-700 border border-amber-300 rounded hover:bg-amber-200 transition-colors whitespace-nowrap"
                title={`¥${profitAlert.minProfitAmount}に自動設定`}
              >
                <RotateCcw className="w-3 h-3" />
                自動セット
              </button>
            )}
          </div>
        </div>
        {/* 粗利率表示 */}
        <div className="flex justify-between text-sm text-slate-500">
          <span>粗利率</span>
          <span>{profitRate.toFixed(1)}%</span>
        </div>

        {/* 再計算ボタン */}
        <button
          type="button"
          onClick={handleRecalculate}
          disabled={!hasChanges}
          className="w-full flex items-center justify-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          再計算
        </button>

        {/* 粗利基準・アラート */}
        {profitAlert && (
          <>
            {profitAlert.isWarning ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-amber-700 font-medium">{profitAlert.message}</p>
                    <p className="text-amber-600 mt-1">
                      推奨: ¥{profitAlert.minProfitAmount}以上 / {profitAlert.minProfitRate}%以上
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <div className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    基準（{profitAlert.minPackCount}〜{profitAlert.maxPackCount ?? ''}食）: ¥
                    {profitAlert.minProfitAmount}以上 / {profitAlert.minProfitRate}%以上
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="border-t-2 border-slate-800 pt-3 flex justify-between items-baseline">
          <span className="font-bold text-lg">見積提示価格</span>
          <span className="text-3xl font-black text-indigo-600">
            ¥{Math.round(calculatedData.sellingPrice).toLocaleString()}
          </span>
        </div>
      </div>
    </section>
  )
}
