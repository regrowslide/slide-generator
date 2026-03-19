'use client'

import { Fragment, useCallback, useMemo, useState } from 'react'
import { useKakeiboMockData } from '../context/MockDataContext'
import { CATEGORY_TYPE_LABELS } from './constants'
import type { CategoryType, FamilyMember, LifePlanItem } from './types'

// ── 定数 ──

const BASE_YEAR = 2025
const DISPLAY_YEARS = 30
const YEARS = Array.from({ length: DISPLAY_YEARS }, (_, i) => BASE_YEAR + i)

// 区分の表示順（ライフプラン用）
const TYPE_ORDER: CategoryType[] = [
  'income',
  'savings_investment',
  'fixed_expense',
  'variable_expense',
  'special_expense',
]

// 金額フォーマット（万円、小数1桁）
const fmtMan = (n: number) => {
  if (n === 0) return '-'
  return n.toFixed(1)
}

// ── ヘルパー関数 ──

/** 指定年における項目の値を計算 */
function calcValue(item: LifePlanItem, year: number): number {
  // 算定期間内かチェック
  const inPeriod = item.periods.some(
    (p) => year >= p.startYear && year <= p.endYear
  )
  if (!inPeriod) return 0

  // 最も早い開始年からの経過年数
  const earliestStart = Math.min(...item.periods.map((p) => p.startYear))
  const elapsed = year - earliestStart
  return item.initialValue * Math.pow(1 + item.growthRate, elapsed)
}

// ── メインコンポーネント ──

export default function LifePlanPage() {
  const {
    categories,
    transactions,
    familyMembers,
    lifePlanItems,
    addFamilyMember,
    deleteFamilyMember,
    updateLifePlanItem,
    addLifePlanItem,
    deleteLifePlanItem,
  } = useKakeiboMockData()

  // 家族追加フォーム
  const [showFamilyForm, setShowFamilyForm] = useState(false)
  const [newFamilyName, setNewFamilyName] = useState('')
  const [newFamilyBirthYear, setNewFamilyBirthYear] = useState(2000)
  const [newFamilyRole, setNewFamilyRole] = useState('子ども')

  // 項目追加フォーム
  const [showItemForm, setShowItemForm] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemType, setNewItemType] = useState<CategoryType>('fixed_expense')

  // 期間追加用の編集中項目ID
  const [editingPeriodItemId, setEditingPeriodItemId] = useState<string | null>(null)
  const [newPeriodStart, setNewPeriodStart] = useState(BASE_YEAR)
  const [newPeriodEnd, setNewPeriodEnd] = useState(BASE_YEAR + 20)

  // カテゴリIDから名前を取得
  const getCategoryName = useCallback(
    (categoryId: string | null, customName: string | null): string => {
      if (customName) return customName
      if (!categoryId) return '不明'
      const cat = categories.find((c) => c.id === categoryId)
      return cat?.name ?? '不明'
    },
    [categories]
  )

  // 表示中の項目をグループ化
  const visibleGroups = useMemo(() => {
    const map = new Map<CategoryType, LifePlanItem[]>()
    for (const type of TYPE_ORDER) {
      map.set(
        type,
        lifePlanItems.filter((i) => i.type === type && i.visible)
      )
    }
    return map
  }, [lifePlanItems])

  // 非表示項目
  const hiddenItems = useMemo(
    () => lifePlanItems.filter((i) => !i.visible),
    [lifePlanItems]
  )

  // 年別の収入合計・支出合計・年間貯金額を計算
  const yearlyTotals = useMemo(() => {
    return YEARS.map((year) => {
      let incomeTotal = 0
      let expenseTotal = 0

      for (const item of lifePlanItems) {
        if (!item.visible) continue
        const val = calcValue(item, year)
        if (item.type === 'income') {
          incomeTotal += val
        } else {
          expenseTotal += val
        }
      }

      return {
        year,
        incomeTotal,
        expenseTotal,
        savings: incomeTotal - expenseTotal,
      }
    })
  }, [lifePlanItems])

  // グループ小計の計算
  const groupSubtotals = useMemo(() => {
    const result = new Map<CategoryType, number[]>()
    for (const type of TYPE_ORDER) {
      const items = visibleGroups.get(type) ?? []
      const totals = YEARS.map((year) =>
        items.reduce((sum, item) => sum + calcValue(item, year), 0)
      )
      result.set(type, totals)
    }
    return result
  }, [visibleGroups])

  // トランザクションから年間平均を自動算出（万円単位）
  const calcAutoAverage = useCallback(
    (categoryId: string | null): number => {
      if (!categoryId) return 0
      const relevantTxs = transactions.filter((t) => t.categoryId === categoryId)
      if (relevantTxs.length === 0) return 0
      const total = relevantTxs.reduce((sum, t) => sum + t.amount, 0)
      // データ月数を推定（最小1ヶ月）
      const months = new Set(relevantTxs.map((t) => t.date.slice(0, 7))).size || 1
      const monthlyAvg = total / months
      return Math.round((monthlyAvg * 12) / 10000 * 10) / 10 // 万円、小数1桁
    },
    [transactions]
  )

  // 家族メンバー追加
  const handleAddFamily = () => {
    if (!newFamilyName.trim()) return
    addFamilyMember({
      id: `fam-${Date.now()}`,
      name: newFamilyName.trim(),
      birthYear: newFamilyBirthYear,
      role: newFamilyRole,
    })
    setNewFamilyName('')
    setNewFamilyBirthYear(2000)
    setShowFamilyForm(false)
  }

  // ライフプラン項目追加
  const handleAddItem = () => {
    if (!newItemName.trim()) return
    addLifePlanItem({
      id: `lp-${Date.now()}`,
      categoryId: null,
      customName: newItemName.trim(),
      type: newItemType,
      initialValue: 0,
      growthRate: 0,
      periods: [{ startYear: BASE_YEAR, endYear: BASE_YEAR + 30 }],
      visible: true,
      useAverage: false,
    })
    setNewItemName('')
    setShowItemForm(false)
  }

  // 期間追加
  const handleAddPeriod = (itemId: string) => {
    const item = lifePlanItems.find((i) => i.id === itemId)
    if (!item) return
    updateLifePlanItem(itemId, {
      periods: [...item.periods, { startYear: newPeriodStart, endYear: newPeriodEnd }],
    })
    setEditingPeriodItemId(null)
  }

  // 期間削除
  const handleDeletePeriod = (itemId: string, periodIndex: number) => {
    const item = lifePlanItems.find((i) => i.id === itemId)
    if (!item || item.periods.length <= 1) return
    updateLifePlanItem(itemId, {
      periods: item.periods.filter((_, i) => i !== periodIndex),
    })
  }

  return (
    <div className="p-2 sm:p-4 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">ライフプラン</h2>

      {/* ── テーブル ── */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-max min-w-full text-xs border-collapse">
            {/* ── ヘッダー: 年 ── */}
            <thead>
              {/* 年行 */}
              <tr className="bg-gray-100 border-b">
                <th className="sticky left-0 z-20 bg-gray-100 min-w-[200px] px-2 py-1 text-left border-r font-medium">
                  年度
                </th>
                {YEARS.map((y) => (
                  <th
                    key={y}
                    className="px-2 py-1 text-center border-r min-w-[60px] font-medium"
                  >
                    {y}
                  </th>
                ))}
              </tr>

              {/* 経過年数行 */}
              <tr className="bg-gray-50 border-b">
                <th className="sticky left-0 z-20 bg-gray-50 px-2 py-1 text-left border-r text-gray-500">
                  経過年数
                </th>
                {YEARS.map((y, i) => (
                  <td
                    key={y}
                    className="px-2 py-0.5 text-center border-r text-gray-400"
                  >
                    {i}
                  </td>
                ))}
              </tr>

              {/* 家族年齢行 */}
              {familyMembers.map((fm) => (
                <tr key={fm.id} className="bg-blue-50 border-b">
                  <th className="sticky left-0 z-20 bg-blue-50 px-2 py-1 text-left border-r">
                    <div className="flex items-center gap-1">
                      <span className="text-blue-700">
                        {fm.role} ({fm.name})
                      </span>
                      <button
                        onClick={() => deleteFamilyMember(fm.id)}
                        className="ml-auto text-red-400 hover:text-red-600 text-[10px]"
                        title="削除"
                      >
                        ✕
                      </button>
                    </div>
                  </th>
                  {YEARS.map((y) => {
                    const age = y - fm.birthYear
                    return (
                      <td
                        key={y}
                        className="px-2 py-0.5 text-center border-r text-blue-600"
                      >
                        {age >= 0 ? `${age}歳` : '-'}
                      </td>
                    )
                  })}
                </tr>
              ))}

              {/* 家族追加 */}
              <tr className="bg-blue-50/50 border-b">
                <th className="sticky left-0 z-20 bg-blue-50/50 px-2 py-1 text-left border-r" colSpan={1}>
                  {showFamilyForm ? (
                    <div className="flex flex-col gap-1">
                      <input
                        className="border rounded px-1 py-0.5 text-xs w-full"
                        placeholder="名前"
                        value={newFamilyName}
                        onChange={(e) => setNewFamilyName(e.target.value)}
                      />
                      <div className="flex gap-1">
                        <select
                          className="border rounded px-1 py-0.5 text-xs flex-1"
                          value={newFamilyRole}
                          onChange={(e) => setNewFamilyRole(e.target.value)}
                        >
                          <option value="夫">夫</option>
                          <option value="妻">妻</option>
                          <option value="子ども">子ども</option>
                          <option value="その他">その他</option>
                        </select>
                        <input
                          type="number"
                          className="border rounded px-1 py-0.5 text-xs w-16"
                          placeholder="生年"
                          value={newFamilyBirthYear}
                          onChange={(e) => setNewFamilyBirthYear(Number(e.target.value))}
                        />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={handleAddFamily}
                          className="bg-blue-500 text-white px-2 py-0.5 rounded text-[10px]"
                        >
                          追加
                        </button>
                        <button
                          onClick={() => setShowFamilyForm(false)}
                          className="bg-gray-300 text-gray-700 px-2 py-0.5 rounded text-[10px]"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowFamilyForm(true)}
                      className="text-blue-500 hover:text-blue-700 text-[10px]"
                    >
                      + 家族追加
                    </button>
                  )}
                </th>
                <td colSpan={YEARS.length} className="border-r" />
              </tr>
            </thead>

            <tbody>
              {/* ── 区分ごとのグループ ── */}
              {TYPE_ORDER.map((type) => {
                const items = visibleGroups.get(type) ?? []
                const subtotals = groupSubtotals.get(type) ?? []

                return (
                  <Fragment key={type}>
                    {/* グループヘッダー */}
                    <tr className="bg-gray-200 border-b">
                      <td
                        className="sticky left-0 z-20 bg-gray-200 px-2 py-1 font-bold border-r text-gray-700"
                      >
                        {CATEGORY_TYPE_LABELS[type]}
                      </td>
                      <td colSpan={YEARS.length} className="border-r" />
                    </tr>

                    {/* 各項目行 */}
                    {items.map((item) => (
                      <Fragment key={item.id}>
                        <tr className="border-b hover:bg-gray-50">
                          {/* 左の項目設定列 */}
                          <td className="sticky left-0 z-20 bg-white px-2 py-1 border-r">
                            <div className="space-y-1">
                              {/* 項目名 + 表示/非表示 + 削除 */}
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-800 truncate max-w-[100px]">
                                  {getCategoryName(item.categoryId, item.customName)}
                                </span>
                                <button
                                  onClick={() =>
                                    updateLifePlanItem(item.id, { visible: false })
                                  }
                                  className="ml-auto text-gray-400 hover:text-gray-600 text-[10px]"
                                  title="非表示にする"
                                >
                                  👁
                                </button>
                              </div>

                              {/* 初期値 + 上昇率 */}
                              <div className="flex gap-1 items-center">
                                <input
                                  type="number"
                                  className="border rounded px-1 py-0 text-[10px] w-14"
                                  value={item.initialValue}
                                  onChange={(e) =>
                                    updateLifePlanItem(item.id, {
                                      initialValue: Number(e.target.value),
                                    })
                                  }
                                  step={0.1}
                                  title="初期値（万円/年）"
                                />
                                <span className="text-[9px] text-gray-400">万</span>
                                <input
                                  type="number"
                                  className="border rounded px-1 py-0 text-[10px] w-12"
                                  value={Math.round(item.growthRate * 1000) / 10}
                                  onChange={(e) =>
                                    updateLifePlanItem(item.id, {
                                      growthRate: Number(e.target.value) / 100,
                                    })
                                  }
                                  step={0.1}
                                  title="上昇率（%）"
                                />
                                <span className="text-[9px] text-gray-400">%</span>
                              </div>

                              {/* 自動計算ボタン */}
                              {item.categoryId && (
                                <button
                                  onClick={() => {
                                    const avg = calcAutoAverage(item.categoryId)
                                    if (avg > 0) {
                                      updateLifePlanItem(item.id, { initialValue: avg })
                                    }
                                  }}
                                  className="text-[9px] text-teal-600 hover:text-teal-800 underline"
                                >
                                  自動計算
                                </button>
                              )}

                              {/* 算定期間 */}
                              <div className="text-[9px] text-gray-500 space-y-0.5">
                                {item.periods.map((p, pi) => (
                                  <div key={pi} className="flex items-center gap-0.5">
                                    <span>
                                      {p.startYear}-{p.endYear}
                                    </span>
                                    {item.periods.length > 1 && (
                                      <button
                                        onClick={() => handleDeletePeriod(item.id, pi)}
                                        className="text-red-400 hover:text-red-600"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                ))}
                                {editingPeriodItemId === item.id ? (
                                  <div className="flex items-center gap-0.5">
                                    <input
                                      type="number"
                                      className="border rounded px-0.5 w-12 text-[9px]"
                                      value={newPeriodStart}
                                      onChange={(e) => setNewPeriodStart(Number(e.target.value))}
                                    />
                                    <span>-</span>
                                    <input
                                      type="number"
                                      className="border rounded px-0.5 w-12 text-[9px]"
                                      value={newPeriodEnd}
                                      onChange={(e) => setNewPeriodEnd(Number(e.target.value))}
                                    />
                                    <button
                                      onClick={() => handleAddPeriod(item.id)}
                                      className="text-teal-600"
                                    >
                                      +
                                    </button>
                                    <button
                                      onClick={() => setEditingPeriodItemId(null)}
                                      className="text-gray-400"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setEditingPeriodItemId(item.id)
                                      setNewPeriodStart(BASE_YEAR)
                                      setNewPeriodEnd(BASE_YEAR + 20)
                                    }}
                                    className="text-teal-500 hover:text-teal-700"
                                  >
                                    + 期間追加
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 年ごとの値 */}
                          {YEARS.map((y) => {
                            const val = calcValue(item, y)
                            return (
                              <td
                                key={y}
                                className="px-1 py-0.5 text-right border-r text-gray-700 tabular-nums"
                              >
                                {val > 0 ? fmtMan(val) : '-'}
                              </td>
                            )
                          })}
                        </tr>
                      </Fragment>
                    ))}

                    {/* グループ小計行 */}
                    <tr className="bg-gray-100 border-b font-semibold">
                      <td className="sticky left-0 z-20 bg-gray-100 px-2 py-1 border-r text-gray-600">
                        {CATEGORY_TYPE_LABELS[type]} 小計
                      </td>
                      {subtotals.map((total, i) => (
                        <td
                          key={YEARS[i]}
                          className="px-1 py-0.5 text-right border-r text-gray-700 tabular-nums"
                        >
                          {total > 0 ? fmtMan(total) : '-'}
                        </td>
                      ))}
                    </tr>
                  </Fragment>
                )
              })}

              {/* ── 年間貯金額行 ── */}
              <tr className="bg-emerald-100 border-b font-bold">
                <td className="sticky left-0 z-20 bg-emerald-100 px-2 py-1.5 border-r text-emerald-800">
                  年間貯金額
                </td>
                {yearlyTotals.map(({ year, savings }) => (
                  <td
                    key={year}
                    className={`px-1 py-1 text-right border-r tabular-nums ${
                      savings < 0
                        ? 'bg-red-100 text-red-700'
                        : 'text-emerald-800'
                    }`}
                  >
                    {fmtMan(savings)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 非表示項目一覧 ── */}
      {hiddenItems.length > 0 && (
        <div className="border rounded-lg p-3 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            非表示の項目
          </h3>
          <div className="flex flex-wrap gap-2">
            {hiddenItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-1 bg-white border rounded px-2 py-1 text-xs"
              >
                <span className="text-gray-600">
                  {getCategoryName(item.categoryId, item.customName)}
                </span>
                <button
                  onClick={() => updateLifePlanItem(item.id, { visible: true })}
                  className="text-teal-500 hover:text-teal-700 text-[10px] font-medium"
                >
                  戻す
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 項目追加フォーム ── */}
      <div className="border rounded-lg p-3 bg-gray-50">
        {showItemForm ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-600">項目を追加</h3>
            <div className="flex flex-wrap gap-2 items-end">
              <div>
                <label className="block text-[10px] text-gray-500">項目名</label>
                <input
                  className="border rounded px-2 py-1 text-xs w-40"
                  placeholder="例: 退職金"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500">区分</label>
                <select
                  className="border rounded px-2 py-1 text-xs"
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value as CategoryType)}
                >
                  {TYPE_ORDER.map((t) => (
                    <option key={t} value={t}>
                      {CATEGORY_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddItem}
                className="bg-teal-500 text-white px-3 py-1 rounded text-xs hover:bg-teal-600"
              >
                追加
              </button>
              <button
                onClick={() => setShowItemForm(false)}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowItemForm(true)}
            className="text-teal-600 hover:text-teal-800 text-sm font-medium"
          >
            + 項目を追加
          </button>
        )}
      </div>
    </div>
  )
}
