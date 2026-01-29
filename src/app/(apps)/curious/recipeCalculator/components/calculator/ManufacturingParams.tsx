'use client'

import {Factory, ToggleLeft, ToggleRight} from 'lucide-react'
import type {CostCalculationResult, RecipeSettings, InputMode} from '../../types'

interface ManufacturingParamsProps {
  settings: RecipeSettings
  calculatedData: CostCalculationResult
  onSettingChange: (key: keyof RecipeSettings, value: number | null) => void
  onInputModeChange: (mode: InputMode) => void
}

export const ManufacturingParams = ({
  settings,
  calculatedData,
  onSettingChange,
  onInputModeChange,
}: ManufacturingParamsProps) => {
  const isFillAmountMode = settings.inputMode === 'fillAmount'

  return (
    <section className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
        <Factory className="w-5 h-5 text-orange-500" />
        製造パラメータ
      </h3>
      <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
        {/* レシピ合計量（参考値） */}
        <div className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded">
          <span className="text-slate-500">レシピ合計量（参考）</span>
          <span className="font-medium text-slate-600">{calculatedData.totalRecipeWeightG.toFixed(0)} g</span>
        </div>

        {/* 製造可能重量（手動入力） */}
        <div className="flex justify-between items-center">
          <label className="text-sm text-slate-600">製造可能重量 (g)</label>
          <input
            type="number"
            value={settings.productionWeightG ?? ''}
            onChange={(e) => {
              const value = e.target.value === '' ? null : Number(e.target.value)
              onSettingChange('productionWeightG', value)
            }}
            placeholder={`${(calculatedData.productionWeightKg * 1000).toFixed(0)}`}
            className="w-28 text-right border rounded px-2 py-1"
          />
        </div>

        {/* 製造ロス率 */}
        <div className="flex justify-between items-center">
          <label className="text-sm text-slate-600">製造ロス率 (%)</label>
          <input
            type="number"
            value={settings.lossRate}
            onChange={(e) => onSettingChange('lossRate', Number(e.target.value))}
            className="w-24 text-right border rounded px-2 py-1"
          />
        </div>

        {/* 入力モード切替トグル */}
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-600">入力モード</span>
            <button
              type="button"
              onClick={() => onInputModeChange(isFillAmountMode ? 'packCount' : 'fillAmount')}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {isFillAmountMode ? (
                <>
                  <ToggleLeft className="w-6 h-6" />
                  <span>充填量入力</span>
                </>
              ) : (
                <>
                  <ToggleRight className="w-6 h-6" />
                  <span>パック数入力</span>
                </>
              )}
            </button>
          </div>

          {/* 充填量入力モード */}
          {isFillAmountMode ? (
            <>
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600">1パック充填量 (g)</label>
                <input
                  type="number"
                  value={settings.packWeightG}
                  onChange={(e) => onSettingChange('packWeightG', Number(e.target.value))}
                  className="w-24 text-right border rounded px-2 py-1"
                />
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-slate-500">製造パック数（自動計算）</span>
                <span className="font-bold text-lg text-orange-600">{calculatedData.packCount} パック</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-600">製造パック数</label>
                <input
                  type="number"
                  value={calculatedData.packCount}
                  onChange={(e) => onSettingChange('packWeightG', Number(e.target.value))}
                  className="w-24 text-right border rounded px-2 py-1"
                  disabled
                />
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-slate-500">1パック充填量（自動計算）</span>
                <span className="font-bold text-orange-600">{settings.packWeightG.toFixed(1)} g</span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
