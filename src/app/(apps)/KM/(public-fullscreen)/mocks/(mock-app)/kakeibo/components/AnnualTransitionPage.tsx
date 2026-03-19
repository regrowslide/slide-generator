'use client'

import { Fragment, useMemo } from 'react'
import { useKakeiboMockData } from '../context/MockDataContext'
import { CATEGORY_TYPE_LABELS, MONTHS } from './constants'
import type { Category, CategoryType } from './types'

// 区分の表示順
const TYPE_ORDER: CategoryType[] = [
  'income',
  'fixed_expense',
  'variable_expense',
  'special_expense',
]

// 金額フォーマット
const fmt = (n: number) => `¥${n.toLocaleString()}`

export default function AnnualTransitionPage() {
  const { categories, transactions, selectedYear, specialBudget } =
    useKakeiboMockData()

  // カテゴリを区分ごとにグループ化
  const groupedCategories = useMemo(() => {
    const map = new Map<CategoryType, Category[]>()
    for (const t of TYPE_ORDER) {
      map.set(
        t,
        categories
          .filter((c) => c.type === t)
          .sort((a, b) => a.order - b.order)
      )
    }
    return map
  }, [categories])

  // 月別 × カテゴリ別の実績集計
  const monthlyActuals = useMemo(() => {
    // result[month(1-12)][categoryId] = 合計金額
    const result: Record<number, Record<string, number>> = {}
    for (let m = 1; m <= 12; m++) result[m] = {}

    for (const tx of transactions) {
      const d = new Date(tx.date)
      if (d.getFullYear() !== selectedYear) continue
      const month = d.getMonth() + 1
      if (!result[month][tx.categoryId]) result[month][tx.categoryId] = 0
      result[month][tx.categoryId] += tx.amount
    }
    return result
  }, [transactions, selectedYear])

  // カテゴリの予算を取得
  const getBudget = (cat: Category): number => cat.monthlyBudget ?? 0

  // セルの背景色判定
  const getCellBg = (actual: number, budget: number): string => {
    if (budget === 0) return ''
    return actual <= budget
      ? 'bg-emerald-50 text-emerald-800'
      : 'bg-red-50 text-red-800'
  }

  // 区分別の月間小計を計算
  const getTypeMonthlyTotal = (type: CategoryType, month: number): number => {
    const cats = groupedCategories.get(type) ?? []
    return cats.reduce((sum, cat) => sum + (monthlyActuals[month][cat.id] ?? 0), 0)
  }

  // 区分別の月間予算小計
  const getTypeBudgetTotal = (type: CategoryType): number => {
    const cats = groupedCategories.get(type) ?? []
    return cats.reduce((sum, cat) => sum + getBudget(cat), 0)
  }

  // 特別費の年間実績合計
  const specialExpenseTotal = useMemo(() => {
    const cats = groupedCategories.get('special_expense') ?? []
    const catIds = new Set(cats.map((c) => c.id))
    return transactions
      .filter(
        (tx) =>
          new Date(tx.date).getFullYear() === selectedYear &&
          catIds.has(tx.categoryId)
      )
      .reduce((sum, tx) => sum + tx.amount, 0)
  }, [transactions, selectedYear, groupedCategories])

  // 特別費の残り予算
  const specialBudgetRemaining =
    specialBudget.carryOver +
    specialBudget.monthlyReserve * 12 -
    specialExpenseTotal

  // 支出率の計算（月別）
  const getExpenseRatio = (month: number): number => {
    const incomeTotal = getTypeMonthlyTotal('income', month)
    if (incomeTotal === 0) return 0
    const expenseTotal =
      getTypeMonthlyTotal('fixed_expense', month) +
      getTypeMonthlyTotal('variable_expense', month) +
      getTypeMonthlyTotal('special_expense', month)
    return (expenseTotal / incomeTotal) * 100
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-emerald-800">
        年間推移シート ({selectedYear}年)
      </h2>

      {/* 横スクロール対応テーブル */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="text-xs min-w-[1200px] w-full border-collapse">
          <thead>
            <tr className="bg-emerald-600 text-white">
              <th className="sticky left-0 z-10 bg-emerald-600 px-3 py-2 text-left min-w-[140px]">
                費目
              </th>
              {MONTHS.map((m) => (
                <th key={m} className="px-2 py-2 text-right min-w-[90px]">
                  {m}
                </th>
              ))}
              <th className="px-2 py-2 text-right min-w-[90px] bg-emerald-700">
                平均
              </th>
              <th className="px-2 py-2 text-right min-w-[100px] bg-emerald-700">
                年間合計
              </th>
            </tr>
          </thead>
          <tbody>
            {TYPE_ORDER.map((type) => {
              const cats = groupedCategories.get(type) ?? []
              const budgetTotal = getTypeBudgetTotal(type)

              return (
                <Fragment key={type}>
                  {/* 区分ヘッダー行 */}
                  <tr className="bg-emerald-100">
                    <td
                      colSpan={15}
                      className="sticky left-0 z-10 bg-emerald-100 px-3 py-1.5 font-bold text-emerald-800 text-sm"
                    >
                      {CATEGORY_TYPE_LABELS[type]}
                    </td>
                  </tr>

                  {/* カテゴリ行 */}
                  {cats.map((cat) => {
                    const budget = getBudget(cat)
                    // 年間合計
                    let annualTotal = 0
                    let monthCount = 0

                    return (
                      <tr
                        key={cat.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="sticky left-0 z-10 bg-white px-3 py-1.5 font-medium whitespace-nowrap">
                          {cat.name}
                        </td>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = i + 1
                          const actual =
                            monthlyActuals[month][cat.id] ?? 0
                          annualTotal += actual
                          if (actual > 0) monthCount++
                          const bg =
                            budget > 0 ? getCellBg(actual, budget) : ''

                          return (
                            <td
                              key={month}
                              className={`px-2 py-1.5 text-right ${bg}`}
                            >
                              <span className="font-bold">
                                {actual > 0 ? fmt(actual) : '-'}
                              </span>
                              {budget > 0 && (
                                <span className="block text-[10px] text-gray-400">
                                  {fmt(budget)}
                                </span>
                              )}
                            </td>
                          )
                        })}
                        {/* 平均 */}
                        <td className="px-2 py-1.5 text-right bg-gray-50 font-bold">
                          {monthCount > 0
                            ? fmt(Math.round(annualTotal / monthCount))
                            : '-'}
                          {budget > 0 && (
                            <span className="block text-[10px] text-gray-400">
                              {fmt(budget)}
                            </span>
                          )}
                        </td>
                        {/* 年間合計 */}
                        <td className="px-2 py-1.5 text-right bg-gray-50 font-bold">
                          {annualTotal > 0 ? fmt(annualTotal) : '-'}
                          {budget > 0 && (
                            <span className="block text-[10px] text-gray-400">
                              {fmt(budget * 12)}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}

                  {/* 小計行 */}
                  <tr className="bg-emerald-50 font-bold border-b-2 border-emerald-200">
                    <td className="sticky left-0 z-10 bg-emerald-50 px-3 py-1.5">
                      小計
                    </td>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1
                      const total = getTypeMonthlyTotal(type, month)
                      return (
                        <td key={month} className="px-2 py-1.5 text-right">
                          {total > 0 ? fmt(total) : '-'}
                          {budgetTotal > 0 && (
                            <span className="block text-[10px] text-gray-500">
                              {fmt(budgetTotal)}
                            </span>
                          )}
                        </td>
                      )
                    })}
                    {/* 平均 */}
                    <td className="px-2 py-1.5 text-right bg-gray-100">
                      {(() => {
                        let total = 0
                        let cnt = 0
                        for (let m = 1; m <= 12; m++) {
                          const v = getTypeMonthlyTotal(type, m)
                          total += v
                          if (v > 0) cnt++
                        }
                        return cnt > 0 ? fmt(Math.round(total / cnt)) : '-'
                      })()}
                    </td>
                    {/* 年間合計 */}
                    <td className="px-2 py-1.5 text-right bg-gray-100">
                      {(() => {
                        let total = 0
                        for (let m = 1; m <= 12; m++) {
                          total += getTypeMonthlyTotal(type, m)
                        }
                        return total > 0 ? fmt(total) : '-'
                      })()}
                    </td>
                  </tr>
                </Fragment>
              )
            })}

            {/* 特別費情報行 */}
            <tr className="bg-amber-50 border-b border-amber-200">
              <td
                colSpan={15}
                className="sticky left-0 z-10 bg-amber-50 px-3 py-2 text-sm"
              >
                <span className="font-bold text-amber-800">
                  前年繰越: {fmt(specialBudget.carryOver)}
                </span>
                <span className="mx-4 text-gray-400">|</span>
                <span className="font-bold text-amber-800">
                  月額積立: {fmt(specialBudget.monthlyReserve)}
                </span>
                <span className="mx-4 text-gray-400">|</span>
                <span
                  className={`font-bold ${specialBudgetRemaining >= 0 ? 'text-emerald-700' : 'text-red-700'}`}
                >
                  特別費残り予算: {fmt(specialBudgetRemaining)}
                </span>
              </td>
            </tr>

            {/* 支出率行 */}
            <tr className="bg-teal-50 font-bold border-t-2 border-teal-300">
              <td className="sticky left-0 z-10 bg-teal-50 px-3 py-2 text-teal-800">
                支出率
              </td>
              {Array.from({ length: 12 }, (_, i) => {
                const month = i + 1
                const ratio = getExpenseRatio(month)
                const color =
                  ratio === 0
                    ? 'text-gray-400'
                    : ratio <= 80
                      ? 'text-emerald-700'
                      : 'text-red-700'
                return (
                  <td key={month} className={`px-2 py-2 text-right ${color}`}>
                    {ratio > 0 ? `${ratio.toFixed(1)}%` : '-'}
                  </td>
                )
              })}
              {/* 平均支出率 */}
              <td className="px-2 py-2 text-right bg-gray-100">
                {(() => {
                  let totalIncome = 0
                  let totalExpense = 0
                  for (let m = 1; m <= 12; m++) {
                    totalIncome += getTypeMonthlyTotal('income', m)
                    totalExpense +=
                      getTypeMonthlyTotal('fixed_expense', m) +
                      getTypeMonthlyTotal('variable_expense', m) +
                      getTypeMonthlyTotal('special_expense', m)
                  }
                  if (totalIncome === 0) return '-'
                  const r = (totalExpense / totalIncome) * 100
                  return (
                    <span
                      className={r <= 80 ? 'text-emerald-700' : 'text-red-700'}
                    >
                      {r.toFixed(1)}%
                    </span>
                  )
                })()}
              </td>
              {/* 年間支出率 */}
              <td className="px-2 py-2 text-right bg-gray-100">-</td>
            </tr>

            {/* 目標ライン */}
            <tr className="text-[10px] text-gray-400">
              <td className="sticky left-0 z-10 bg-white px-3 py-1">
                ※ 目標: 80%以下
              </td>
              <td colSpan={14} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

