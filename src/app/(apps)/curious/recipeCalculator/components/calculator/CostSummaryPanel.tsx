'use client'

import {Calculator} from 'lucide-react'
import type {CostCalculationResult, RecipeSettings} from '../../types'

interface CostSummaryPanelProps {
  settings: RecipeSettings
  calculatedData: CostCalculationResult
  onSettingChange: (key: keyof RecipeSettings, value: number) => void
}

export const CostSummaryPanel = ({settings, calculatedData, onSettingChange}: CostSummaryPanelProps) => {
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
        <div className="border-t-2 border-slate-800 pt-3 flex justify-between items-baseline">
          <span className="font-bold text-lg">見積提示価格</span>
          <span className="text-3xl font-black text-indigo-600">¥{Math.round(calculatedData.sellingPrice).toLocaleString()}</span>
        </div>
      </div>
    </section>
  )
}
