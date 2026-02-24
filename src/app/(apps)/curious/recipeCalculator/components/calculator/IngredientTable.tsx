'use client'

import { useMemo } from 'react'
import { Trash2, Loader2, Database, Globe, Search, ChevronDown, ExternalLink, Package } from 'lucide-react'

import type { RcRecipeIngredient, IngredientMaster } from '../../types'
import { UNIT_OPTIONS } from '../../constants/unit-options'
import { Button } from '@cm/components/styles/common-components/Button'

interface IngredientTableProps {
  ingredients: RcRecipeIngredient[]
  ingredientMasters: IngredientMaster[]
  onIngredientChange: (index: number, field: string, value: string | number) => void
  onDeleteIngredient: (index: number) => void
  onAiSearch?: (index: number) => void
  onMasterSelect?: (index: number, masterId: number | null) => void
  searchingIndex?: number | null
}

export const IngredientTable = ({
  ingredients,
  ingredientMasters,
  onIngredientChange,
  onDeleteIngredient,
  onAiSearch,
  onMasterSelect,
  searchingIndex,
}: IngredientTableProps) => {
  // マスタをカテゴリ別にグループ化（メモ化）
  const mastersByCategory = useMemo(() =>
    ingredientMasters.reduce((acc, master) => {
      const category = master.category || 'その他'
      if (!acc[category]) acc[category] = []
      acc[category].push(master)
      return acc
    }, {} as Record<string, IngredientMaster[]>),
    [ingredientMasters]
  )

  return (
    <section className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-500" />
          原材料リスト
        </h3>
        <span className="text-xs text-slate-500">※単位は自動でkgに換算されます</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 min-w-[140px]">解析された名前</th>
              <th className="px-4 py-3 min-w-[180px]">マスタ割当</th>
              <th className="px-4 py-3 min-w-[200px]">取得元詳細</th>
              <th className="px-4 py-3 w-32 text-right">分量 / 単位</th>
              <th className="px-4 py-3 w-24 text-right bg-blue-50/50 text-blue-800">換算重量</th>
              <th className="px-4 py-3 w-40 text-right">キロ単価</th>
              <th className="px-4 py-3 w-20 text-center">AI照合</th>
              <th className="px-4 py-3 w-24 text-right">歩留(%)</th>
              <th className="px-4 py-3 w-28 text-right bg-amber-50/50 text-amber-800">調整後単価</th>
              <th className="px-4 py-3 w-32 text-right">原価小計</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ingredients.length === 0 && (
              <tr>
                <td colSpan={11} className="p-12 text-center text-slate-400">
                  データなし
                </td>
              </tr>
            )}
            {ingredients.map((ing, idx) => {

              return <tr key={ing.id} className={ing.status === 'searching' ? 'bg-blue-50' : ''}>
                {/* 解析された名前（元表記） */}
                <td className="px-4 py-3">
                  <div className="text-sm text-slate-700">
                    {ing.originalName || ing.name}
                  </div>
                </td>

                {/* マスタ割当 */}
                <td className="px-4 py-3">
                  <div className="relative">
                    <select
                      value={ing.ingredientMasterId || ''}
                      onChange={(e) => {
                        const masterId = e.target.value ? Number(e.target.value) : null
                        onMasterSelect?.(idx, masterId)
                      }}
                      className={`w-full text-sm border rounded px-2 py-1 pr-6 appearance-none ${ing.ingredientMasterId
                        ? 'bg-green-50 border-green-300 text-green-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                    >
                      <option value="">-- 未割当 --</option>
                      {Object.entries(mastersByCategory).map(([category, masters]) => (
                        <optgroup key={category} label={category}>
                          {masters.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name} (¥{m.price}/kg)
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  {ing.ingredientMasterId && (
                    <div className="text-[10px] text-green-600 mt-0.5">
                      マスタから取得
                    </div>
                  )}
                </td>

                {/* 取得元詳細 */}
                <td className="px-4 py-3">
                  {ing.isExternal && ing.externalProductName ? (
                    <div className="text-xs space-y-0.5">
                      <div className="font-medium text-orange-700 flex items-center gap-1">
                        <Package className="w-3 h-3" />

                        <a
                          href={
                            ing.source === 'A-Price' ? `https://a-price.jp/search?q=${ing.externalProductName}` :
                              ing.source === '楽天市場' ? `https://search.rakuten.co.jp/search/mall/${ing.externalProductName}` :
                                ing.externalProductUrl ?? ""
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate max-w-[140px] hover:underline flex items-center gap-0.5"
                          title={ing.externalProductName}
                        >
                          {ing.externalProductName}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>

                      </div>
                      <div className="text-slate-500 flex items-center gap-2">
                        {ing.externalPrice && (
                          <span>¥{ing.externalPrice.toLocaleString()}</span>
                        )}
                        {ing.externalWeightText && (
                          <span className="text-slate-400">/ {ing.externalWeightText}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-orange-500 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {ing.source}
                      </div>
                    </div>
                  ) : ing.ingredientMasterId ? (
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      社内マスタ
                    </div>
                  ) : ing.status === 'pending' || ing.status === 'error' ? (
                    <div className="text-xs text-slate-400">
                      未取得
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">
                      手動入力
                    </div>
                  )}
                </td>

                {/* 分量/単位 */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <input
                      type="number"
                      value={ing.amount}
                      onChange={(e) => onIngredientChange(idx, 'amount', e.target.value)}
                      className="w-16 text-right border rounded px-1"
                    />
                    <select
                      value={ing.unit}
                      onChange={(e) => onIngredientChange(idx, 'unit', e.target.value)}
                      className="w-14 text-xs border rounded bg-slate-50"
                    >
                      {UNIT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>

                {/* 換算重量 */}
                <td className="px-4 py-3 text-right bg-blue-50/30 font-mono text-slate-600">
                  {ing.weightKg.toFixed(3)}
                  <span className="text-[10px] ml-0.5">kg</span>
                </td>

                {/* キロ単価 */}
                <td className="px-4 py-3 text-right">
                  {ing.status === 'searching' ? (
                    <span className="text-blue-500">
                      <Loader2 className="w-4 h-4 animate-spin inline" />
                    </span>
                  ) : (
                    <div>
                      < input
                        type="number"
                        value={ing.pricePerKg}
                        onChange={(e) => onIngredientChange(idx, 'pricePerKg', e.target.value)}
                        className={`w-full min-w-[80px] text-right border rounded px-1 font-bold ${ing.isExternal ? 'text-orange-600 bg-orange-50 border-orange-200' : ''
                          }`}
                      />
                    </div>
                  )}
                </td>

                {/* AI照合ボタン */}
                <td className="px-4 py-3 text-center">
                  {searchingIndex === idx ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500 mx-auto" />
                  ) : (
                    <Button

                      size="sm"
                      onClick={() => onAiSearch?.(idx)}
                      className={`text-xs px-2 py-1 h-7 ${ing.status === 'pending' || ing.status === 'error' || ing.pricePerKg === 0
                        ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                        : 'text-slate-400 hover:text-slate-500'
                        }`}

                    >
                      <Search className="w-3 h-3 mr-1" />
                      照合
                    </Button>
                  )}
                </td>

                {/* 歩留まり */}
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    value={ing.yieldRate}
                    onChange={(e) => onIngredientChange(idx, 'yieldRate', e.target.value)}
                    className="w-12 text-right border rounded"
                  />
                </td>

                {/* 調整後単価 */}
                <td className="px-4 py-3 text-right bg-amber-50/30 font-mono text-slate-600">
                  {ing.yieldRate > 0
                    ? `¥${Math.round(ing.pricePerKg / (ing.yieldRate / 100)).toLocaleString()}`
                    : '-'}
                  <span className="text-[10px] ml-0.5 text-slate-400">/kg</span>
                </td>

                {/* 原価小計 */}
                <td className="px-4 py-3 text-right font-bold">
                  {ing.status === 'done' ? `¥${Math.round(ing.cost).toLocaleString()}` : '-'}
                </td>

                {/* 削除ボタン */}
                <td className="px-4 py-3 text-center">
                  <Button
                    color="red"
                    size="sm"
                    onClick={() => onDeleteIngredient(idx)}
                    className="text-slate-300 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            })}
            {ingredients.length > 0 && (
              <tr className="bg-slate-50 border-t-2 border-slate-300">
                <td colSpan={4} className="px-4 py-3 text-right font-bold text-slate-700">合計</td>
                <td className="px-4 py-3 text-right bg-blue-50/30 font-mono font-bold text-slate-700">
                  {ingredients.reduce((sum, ing) => sum + ing.weightKg, 0).toFixed(3)}
                  <span className="text-[10px] ml-0.5">kg</span>
                </td>
                <td colSpan={4}></td>
                <td className="px-4 py-3 text-right font-bold text-slate-700">
                  ¥{Math.round(ingredients.reduce((sum, ing) => sum + ing.cost, 0)).toLocaleString()}
                </td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
