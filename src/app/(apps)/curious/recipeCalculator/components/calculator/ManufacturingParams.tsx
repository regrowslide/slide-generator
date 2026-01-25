'use client'

import {Factory} from 'lucide-react'
import type {CostCalculationResult, RecipeSettings} from '../../types'

interface ManufacturingParamsProps {
  settings: RecipeSettings
  calculatedData: CostCalculationResult
  onSettingChange: (key: keyof RecipeSettings, value: number) => void
}

export const ManufacturingParams = ({settings, calculatedData, onSettingChange}: ManufacturingParamsProps) => {
  return (
    <section className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
        <Factory className="w-5 h-5 text-orange-500" />
        製造パラメータ
      </h3>
      <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex justify-between items-center">
          <label className="text-sm text-slate-600">製造ロス率 (%)</label>
          <input
            type="number"
            value={settings.lossRate}
            onChange={(e) => onSettingChange('lossRate', Number(e.target.value))}
            className="w-24 text-right border rounded px-2 py-1"
          />
        </div>
        <div className="flex justify-between items-center">
          <label className="text-sm text-slate-600">1パック充填量 (g)</label>
          <input
            type="number"
            value={settings.packWeightG}
            onChange={(e) => onSettingChange('packWeightG', Number(e.target.value))}
            className="w-24 text-right border rounded px-2 py-1"
          />
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between text-sm">
            <span>製造可能重量</span>
            <span className="font-bold">{calculatedData.productionWeightKg.toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>製造パック数</span>
            <span className="font-bold text-lg text-orange-600">{calculatedData.packCount} パック</span>
          </div>
        </div>
      </div>
    </section>
  )
}
