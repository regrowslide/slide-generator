'use client'

import { useMemo, useState } from 'react'
import { useKakeiboMockData } from '../context/MockDataContext'
import type { AssetItem } from './types'

// ── 定数 ──

const BASE_YEAR = 2025
const DISPLAY_YEARS = 30
const YEARS = Array.from({ length: DISPLAY_YEARS }, (_, i) => BASE_YEAR + i)

// 金額フォーマット（万円、整数）
const fmtMan = (n: number) => {
  if (n === 0) return '0'
  return Math.floor(n).toLocaleString()
}

// ── メインコンポーネント ──

export default function AssetProjectionPage() {
  const {
    assetItems,
    updateAssetItem,
    addAssetItem,
    deleteAssetItem,
  } = useKakeiboMockData()

  // 項目追加フォーム
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCurrentValue, setNewCurrentValue] = useState(0)
  const [newAnnualContribution, setNewAnnualContribution] = useState(0)
  const [newGrowthRate, setNewGrowthRate] = useState(0)

  // 表示中の項目のみ
  const visibleItems = useMemo(
    () => assetItems.filter((a) => a.visible),
    [assetItems]
  )

  // 各項目×年の資産額を計算
  const projections = useMemo(() => {
    // result[itemId][yearIndex] = 資産額（万円）
    const result = new Map<string, number[]>()

    for (const item of assetItems) {
      const values: number[] = []
      for (let i = 0; i < YEARS.length; i++) {
        if (i === 0) {
          // 初年度
          values.push(item.currentValue + item.annualContribution)
        } else {
          // 前年 × (1 + 上昇率) + 年間積立
          values.push(values[i - 1] * (1 + item.growthRate) + item.annualContribution)
        }
      }
      result.set(item.id, values)
    }

    return result
  }, [assetItems])

  // 年ごとの合計
  const yearlyTotals = useMemo(() => {
    return YEARS.map((_, yi) => {
      let total = 0
      for (const item of visibleItems) {
        const vals = projections.get(item.id)
        if (vals) total += vals[yi]
      }
      return total
    })
  }, [visibleItems, projections])

  // バーチャート用: 最大値を取得
  const maxTotal = useMemo(
    () => Math.max(...yearlyTotals.map((t) => Math.abs(t)), 1),
    [yearlyTotals]
  )

  // 項目追加
  const handleAddItem = () => {
    if (!newName.trim()) return
    addAssetItem({
      id: `asset-${Date.now()}`,
      name: newName.trim(),
      currentValue: newCurrentValue,
      annualContribution: newAnnualContribution,
      growthRate: newGrowthRate / 100,
      isDefault: false,
      visible: true,
    })
    setNewName('')
    setNewCurrentValue(0)
    setNewAnnualContribution(0)
    setNewGrowthRate(0)
    setShowAddForm(false)
  }

  return (
    <div className="p-2 sm:p-4 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">資産推移</h2>

      {/* ── 資産項目設定カード ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {assetItems.map((item) => (
          <div
            key={item.id}
            className={`border rounded-lg p-3 space-y-2 ${
              item.visible ? 'bg-white' : 'bg-gray-50 opacity-60'
            }`}
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 truncate">
                {item.name}
              </h3>
              <div className="flex items-center gap-1">
                {/* 表示/非表示トグル */}
                <button
                  onClick={() =>
                    updateAssetItem(item.id, { visible: !item.visible })
                  }
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    item.visible
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  title={item.visible ? '非表示にする' : '表示する'}
                >
                  {item.visible ? '表示中' : '非表示'}
                </button>
                {/* 削除ボタン（デフォルト項目は削除不可） */}
                {!item.isDefault && (
                  <button
                    onClick={() => deleteAssetItem(item.id)}
                    className="text-red-400 hover:text-red-600 text-xs"
                    title="削除"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* 入力フィールド */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500">現在資産（万円）</label>
                <input
                  type="number"
                  className="border rounded px-1.5 py-0.5 text-xs w-full"
                  value={item.currentValue}
                  onChange={(e) =>
                    updateAssetItem(item.id, {
                      currentValue: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500">年間積立（万円）</label>
                <input
                  type="number"
                  className="border rounded px-1.5 py-0.5 text-xs w-full"
                  value={item.annualContribution}
                  onChange={(e) =>
                    updateAssetItem(item.id, {
                      annualContribution: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500">上昇率（%）</label>
                <input
                  type="number"
                  className="border rounded px-1.5 py-0.5 text-xs w-full"
                  value={Math.round(item.growthRate * 10000) / 100}
                  onChange={(e) =>
                    updateAssetItem(item.id, {
                      growthRate: Number(e.target.value) / 100,
                    })
                  }
                  step={0.1}
                />
              </div>
            </div>
          </div>
        ))}

        {/* 項目追加カード */}
        {showAddForm ? (
          <div className="border-2 border-dashed border-teal-300 rounded-lg p-3 space-y-2 bg-teal-50/50">
            <h3 className="text-sm font-semibold text-teal-700">項目追加</h3>
            <div>
              <label className="block text-[10px] text-gray-500">項目名</label>
              <input
                className="border rounded px-1.5 py-0.5 text-xs w-full"
                placeholder="例: 学資保険"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500">現在資産（万円）</label>
                <input
                  type="number"
                  className="border rounded px-1.5 py-0.5 text-xs w-full"
                  value={newCurrentValue}
                  onChange={(e) => setNewCurrentValue(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500">年間積立（万円）</label>
                <input
                  type="number"
                  className="border rounded px-1.5 py-0.5 text-xs w-full"
                  value={newAnnualContribution}
                  onChange={(e) => setNewAnnualContribution(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500">上昇率（%）</label>
                <input
                  type="number"
                  className="border rounded px-1.5 py-0.5 text-xs w-full"
                  value={newGrowthRate}
                  onChange={(e) => setNewGrowthRate(Number(e.target.value))}
                  step={0.1}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                className="bg-teal-500 text-white px-3 py-1 rounded text-xs hover:bg-teal-600"
              >
                追加
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="border-2 border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-center text-gray-400 hover:text-teal-600 hover:border-teal-300 transition-colors"
          >
            <span className="text-sm">+ 項目追加</span>
          </button>
        )}
      </div>

      {/* ── 推移テーブル ── */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-max min-w-full text-xs border-collapse">
            {/* ヘッダー */}
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="sticky left-0 z-20 bg-gray-100 min-w-[160px] px-2 py-1.5 text-left border-r font-medium">
                  項目
                </th>
                {YEARS.map((y) => (
                  <th
                    key={y}
                    className="px-2 py-1.5 text-center border-r min-w-[70px] font-medium"
                  >
                    {y}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* 各資産項目行 */}
              {visibleItems.map((item) => {
                const vals = projections.get(item.id) ?? []
                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="sticky left-0 z-20 bg-white px-2 py-1 border-r font-medium text-gray-700">
                      {item.name}
                    </td>
                    {vals.map((val, i) => (
                      <td
                        key={YEARS[i]}
                        className={`px-1 py-0.5 text-right border-r tabular-nums ${
                          val < 0
                            ? 'text-red-600'
                            : 'text-gray-700'
                        }`}
                      >
                        {fmtMan(val)}
                      </td>
                    ))}
                  </tr>
                )
              })}

              {/* 合計行 */}
              <tr className="bg-emerald-50 border-b font-bold">
                <td className="sticky left-0 z-20 bg-emerald-50 px-2 py-1.5 border-r text-emerald-800">
                  総資産合計
                </td>
                {yearlyTotals.map((total, i) => (
                  <td
                    key={YEARS[i]}
                    className={`px-1 py-1 text-right border-r tabular-nums ${
                      total < 0
                        ? 'text-red-700 bg-red-50'
                        : 'text-emerald-800'
                    }`}
                  >
                    {fmtMan(total)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 簡易バーチャート ── */}
      <div className="border rounded-lg p-3 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">
          総資産推移（万円）
        </h3>
        <div className="flex items-end gap-[2px] h-40 overflow-x-auto">
          {yearlyTotals.map((total, i) => {
            const heightPercent = Math.min(Math.abs(total) / maxTotal * 100, 100)
            const isNegative = total < 0
            return (
              <div
                key={YEARS[i]}
                className="flex flex-col items-center flex-shrink-0"
                style={{ width: '28px' }}
              >
                {/* バー */}
                <div className="w-full flex flex-col justify-end h-32">
                  <div
                    className={`w-full rounded-t transition-all ${
                      isNegative ? 'bg-red-400' : 'bg-emerald-400'
                    }`}
                    style={{ height: `${heightPercent}%`, minHeight: total !== 0 ? '2px' : '0' }}
                    title={`${YEARS[i]}年: ${fmtMan(total)}万円`}
                  />
                </div>
                {/* 年ラベル */}
                <span className="text-[8px] text-gray-400 mt-0.5 -rotate-45 origin-top-left whitespace-nowrap">
                  {YEARS[i]}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
