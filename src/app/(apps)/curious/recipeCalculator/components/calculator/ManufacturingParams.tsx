'use client'

import {useState, useEffect} from 'react'
import {Factory, ToggleLeft, ToggleRight, RefreshCw} from 'lucide-react'
import type {CostCalculationResult, RecipeSettings, InputMode} from '../../types'

interface ManufacturingParamsProps {
  settings: RecipeSettings
  calculatedData: CostCalculationResult
  onRecalculate: (params: {lossRate: number; packWeightG: number; productionWeightG: number | null; packCount?: number}) => void
  onInputModeChange: (mode: InputMode) => void
}

export const ManufacturingParams = ({
  settings,
  calculatedData,
  onRecalculate,
  onInputModeChange,
}: ManufacturingParamsProps) => {
  const isFillAmountMode = settings.inputMode === 'fillAmount'

  // ローカル state で入力値を管理
  const [localProductionWeightG, setLocalProductionWeightG] = useState<number | null>(settings.productionWeightG)
  const [localLossRate, setLocalLossRate] = useState(settings.lossRate)
  const [localPackWeightG, setLocalPackWeightG] = useState(settings.packWeightG)
  const [localPackCount, setLocalPackCount] = useState(settings.packCount)

  // 親から settings が更新された場合にローカル state を同期
  useEffect(() => {
    setLocalProductionWeightG(settings.productionWeightG)
    setLocalLossRate(settings.lossRate)
    setLocalPackWeightG(settings.packWeightG)
    setLocalPackCount(settings.packCount)
  }, [settings.productionWeightG, settings.lossRate, settings.packWeightG, settings.packCount])

  // ローカル値が親の値と異なるか判定
  const hasChanges =
    localProductionWeightG !== settings.productionWeightG ||
    localLossRate !== settings.lossRate ||
    localPackWeightG !== settings.packWeightG ||
    localPackCount !== settings.packCount

  // ロス率適用後重量（表示用）
  const lossAppliedWeightG = settings.productionWeightG !== null && settings.productionWeightG > 0
    ? settings.productionWeightG
    : calculatedData.totalRecipeWeightG * (1 - localLossRate / 100)
  const isManualProductionWeight = settings.productionWeightG !== null && settings.productionWeightG > 0

  const handleRecalculate = () => {
    onRecalculate({
      lossRate: localLossRate,
      packWeightG: localPackWeightG,
      productionWeightG: localProductionWeightG,
      ...(!isFillAmountMode ? {packCount: localPackCount} : {}),
    })
  }

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
            value={localProductionWeightG ?? ''}
            onChange={(e) => {
              const value = e.target.value === '' ? null : Number(e.target.value)
              setLocalProductionWeightG(value)
            }}
            placeholder={`${(calculatedData.productionWeightKg * 1000).toFixed(0)}`}
            className="w-28 text-right border rounded px-2 py-1"
          />
        </div>

        {/* 製造ロス率（手動指定時は無効） */}
        <div className="flex justify-between items-center">
          <label className={`text-sm ${isManualProductionWeight ? 'text-slate-400' : 'text-slate-600'}`}>
            製造ロス率 (%)
            {isManualProductionWeight && <span className="ml-1 text-xs">※手動指定時は無効</span>}
          </label>
          <input
            type="number"
            value={localLossRate}
            onChange={(e) => setLocalLossRate(Number(e.target.value))}
            disabled={isManualProductionWeight}
            className={`w-24 text-right border rounded px-2 py-1 ${isManualProductionWeight ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* ロス適用後重量 */}
        <div className="flex justify-between items-center text-sm bg-orange-50 p-2 rounded">
          <span className="text-slate-500">
            ロス適用後重量{isManualProductionWeight ? '（手動）' : ` (${localLossRate}%減)`}
          </span>
          <span className="font-medium text-orange-600">{lossAppliedWeightG.toFixed(0)} g</span>
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
                  value={localPackWeightG}
                  onChange={(e) => setLocalPackWeightG(Number(e.target.value))}
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
                  value={localPackCount}
                  onChange={(e) => setLocalPackCount(Number(e.target.value))}
                  className="w-24 text-right border rounded px-2 py-1"
                />
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-slate-500">1パック充填量（自動計算）</span>
                <span className="font-bold text-orange-600">{settings.packWeightG.toFixed(1)} g</span>
              </div>
            </>
          )}
        </div>

        {/* 再計算ボタン */}
        <div className="border-t pt-3 mt-3">
          <button
            type="button"
            onClick={handleRecalculate}
            disabled={!hasChanges}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            再計算
          </button>
        </div>
      </div>
    </section>
  )
}
