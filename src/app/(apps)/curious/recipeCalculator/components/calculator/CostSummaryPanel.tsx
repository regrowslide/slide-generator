'use client'

import {Calculator, AlertTriangle} from 'lucide-react'
import type {CostCalculationResult, RecipeSettings, ProfitMarginAlert} from '../../types'

interface CostSummaryPanelProps {
  settings: RecipeSettings
  calculatedData: CostCalculationResult
  profitAlert: ProfitMarginAlert | null
  onSettingChange: (key: keyof RecipeSettings, value: number | null) => void
}

export const CostSummaryPanel = ({settings, calculatedData, profitAlert, onSettingChange}: CostSummaryPanelProps) => {
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
            value={settings.packagingCost}
            onChange={(e) => onSettingChange('packagingCost', Number(e.target.value))}
            className="w-20 text-right border rounded"
          />
        </div>
        <div className="flex justify-between items-center text-sm">
          <label>加工費</label>
          <input
            type="number"
            value={settings.processingCost}
            onChange={(e) => onSettingChange('processingCost', Number(e.target.value))}
            className="w-20 text-right border rounded"
          />
        </div>
        {/* その他費用（新規） */}
        <div className="flex justify-between items-center text-sm">
          <label>その他費用</label>
          <input
            type="number"
            value={settings.otherCost}
            onChange={(e) => onSettingChange('otherCost', Number(e.target.value))}
            className="w-20 text-right border rounded"
          />
        </div>
        <div className="bg-slate-100 p-2 rounded flex justify-between font-bold text-slate-700">
          <span>製造原価計</span>
          <span>¥{Math.round(calculatedData.totalCostPerPack).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <label>粗利（額）</label>
          <input
            type="number"
            value={settings.profitMargin}
            onChange={(e) => onSettingChange('profitMargin', Number(e.target.value))}
            className="w-24 text-right border border-blue-300 text-blue-700 font-bold rounded"
          />
        </div>
        {/* 粗利率表示 */}
        <div className="flex justify-between text-sm text-slate-500">
          <span>粗利率</span>
          <span>{profitRate.toFixed(1)}%</span>
        </div>

        {/* 粗利アラート */}
        {profitAlert?.isWarning && (
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
