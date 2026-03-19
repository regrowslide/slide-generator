'use client'

import { useMemo } from 'react'
import { useKakeiboMockData } from '../context/MockDataContext'
import { CATEGORY_TYPE_LABELS } from './constants'
import type { Category, CategoryType } from './types'

// 金額フォーマット
const fmt = (n: number) => `¥${n.toLocaleString()}`

// プログレスバーコンポーネント
const ProgressBar = ({
  value,
  max,
  label,
  color,
  targetLabel,
}: {
  value: number
  max: number
  label: string
  color: string
  targetLabel?: string
}) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-bold">{value.toFixed(1)}%</span>
      </div>
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
        {targetLabel && (
          <span className="absolute right-2 top-0 text-[10px] text-gray-500 leading-4">
            {targetLabel}
          </span>
        )}
      </div>
    </div>
  )
}

// グループリストコンポーネント
const GroupList = ({
  title,
  items,
  bgColor,
}: {
  title: string
  items: { name: string; amount: number }[]
  bgColor: string
}) => {
  const total = items.reduce((sum, i) => sum + i.amount, 0)
  return (
    <div className={`rounded-lg p-3 ${bgColor}`}>
      <h4 className="font-bold text-sm mb-2">{title}</h4>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.name} className="flex justify-between text-sm">
            <span>{item.name}</span>
            <span className="font-medium">{fmt(item.amount)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-300 mt-2 pt-1 flex justify-between font-bold text-sm">
        <span>合計</span>
        <span>{fmt(total)}</span>
      </div>
    </div>
  )
}

export default function IncomeExpenseVisualization() {
  const {
    categories,
    transactions,
    selectedYear,
    selectedMonth,
    specialBudget,
  } = useKakeiboMockData()

  // カテゴリマップ
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>()
    for (const c of categories) map.set(c.id, c)
    return map
  }, [categories])

  // 当月のトランザクション
  const currentMonthTxs = useMemo(
    () =>
      transactions.filter((tx) => {
        const d = new Date(tx.date)
        return (
          d.getFullYear() === selectedYear &&
          d.getMonth() + 1 === selectedMonth
        )
      }),
    [transactions, selectedYear, selectedMonth]
  )

  // 年間のトランザクション
  const yearTxs = useMemo(
    () =>
      transactions.filter(
        (tx) => new Date(tx.date).getFullYear() === selectedYear
      ),
    [transactions, selectedYear]
  )

  // データのある月数を計算
  const activeMonths = useMemo(() => {
    const months = new Set<number>()
    for (const tx of yearTxs) {
      months.add(new Date(tx.date).getMonth() + 1)
    }
    return Math.max(months.size, 1)
  }, [yearTxs])

  // 区分別にカテゴリと月平均金額を集計
  const getGroupItems = (type: CategoryType) => {
    const cats = categories
      .filter((c) => c.type === type)
      .sort((a, b) => a.order - b.order)

    return cats.map((cat) => {
      const total = yearTxs
        .filter((tx) => tx.categoryId === cat.id)
        .reduce((sum, tx) => sum + tx.amount, 0)
      return { name: cat.name, amount: Math.round(total / activeMonths) }
    }).filter((item) => item.amount > 0)
  }

  // 区分別の当月合計
  const getMonthlyTypeTotal = (type: CategoryType): number => {
    const catIds = new Set(
      categories.filter((c) => c.type === type).map((c) => c.id)
    )
    return currentMonthTxs
      .filter((tx) => catIds.has(tx.categoryId))
      .reduce((sum, tx) => sum + tx.amount, 0)
  }

  // 月平均のグループ
  const incomeItems = getGroupItems('income')
  const savingsItems = getGroupItems('savings_investment')
  const fixedItems = getGroupItems('fixed_expense')
  const variableItems = getGroupItems('variable_expense')

  // 今月の収支サマリー
  const incomeA = getMonthlyTypeTotal('income')
  const savingsB = getMonthlyTypeTotal('savings_investment')
  const fixedC = getMonthlyTypeTotal('fixed_expense')
  const variableC = getMonthlyTypeTotal('variable_expense')
  const expenseC = fixedC + variableC
  const surplusD = incomeA - savingsB - expenseC
  const totalSavingsE = savingsB + Math.max(surplusD, 0)
  const expenseRatio = incomeA > 0 ? (expenseC / incomeA) * 100 : 0
  const savingsRatio = incomeA > 0 ? (totalSavingsE / incomeA) * 100 : 0

  // 特別費の年計
  const specialItems = getGroupItems('special_expense')
  const specialTotal = specialItems.reduce((sum, i) => sum + i.amount, 0) * activeMonths
  const specialBudgetTotal =
    specialBudget.carryOver + specialBudget.monthlyReserve * 12

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-bold text-emerald-800">
        収支可視化シート ({selectedYear}年{selectedMonth}月)
      </h2>

      {/* 月平均セクション */}
      <div>
        <h3 className="text-base font-bold text-teal-700 mb-3 border-b border-teal-200 pb-1">
          月平均（{selectedYear}年 / {activeMonths}ヶ月平均）
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <GroupList
            title={CATEGORY_TYPE_LABELS['income']}
            items={incomeItems}
            bgColor="bg-blue-50"
          />
          <GroupList
            title={CATEGORY_TYPE_LABELS['savings_investment']}
            items={savingsItems}
            bgColor="bg-emerald-50"
          />
          <GroupList
            title={CATEGORY_TYPE_LABELS['fixed_expense']}
            items={fixedItems}
            bgColor="bg-orange-50"
          />
          <GroupList
            title={CATEGORY_TYPE_LABELS['variable_expense']}
            items={variableItems}
            bgColor="bg-pink-50"
          />
        </div>
      </div>

      {/* 今月の収支サマリー */}
      <div>
        <h3 className="text-base font-bold text-teal-700 mb-3 border-b border-teal-200 pb-1">
          今月の収支サマリー ({selectedMonth}月)
        </h3>
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          {/* 各項目 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SummaryRow label="収入 (a)" value={incomeA} color="text-blue-700" />
            <SummaryRow
              label="先取り貯金・投資 (b)"
              value={savingsB}
              color="text-emerald-700"
            />
            <SummaryRow
              label="支出 (c) = 固定費 + 変動費"
              value={expenseC}
              color="text-red-600"
              sub={`固定費: ${fmt(fixedC)} + 変動費: ${fmt(variableC)}`}
            />
            <SummaryRow
              label="余り貯金 (d) = a - b - c"
              value={surplusD}
              color={surplusD >= 0 ? 'text-emerald-700' : 'text-red-700'}
            />
            <SummaryRow
              label="貯蓄合計 (e) = b + d"
              value={totalSavingsE}
              color="text-teal-700"
            />
          </div>

          {/* 比率バー */}
          <div className="mt-4 space-y-3">
            <ProgressBar
              value={expenseRatio}
              max={100}
              label="支出割合 (c/a)"
              color={
                expenseRatio <= 80 ? 'bg-emerald-500' : 'bg-red-500'
              }
              targetLabel="目標: 80%以下"
            />
            <ProgressBar
              value={savingsRatio}
              max={100}
              label="貯蓄率 (e/a)"
              color={
                savingsRatio >= 20 ? 'bg-teal-500' : 'bg-amber-500'
              }
              targetLabel="目標: 20%以上"
            />
          </div>
        </div>
      </div>

      {/* 年計: 特別費 */}
      <div>
        <h3 className="text-base font-bold text-teal-700 mb-3 border-b border-teal-200 pb-1">
          年計: 特別費
        </h3>
        <div className="bg-amber-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>前年繰越</span>
            <span className="font-bold">{fmt(specialBudget.carryOver)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>月額積立 × 12</span>
            <span className="font-bold">
              {fmt(specialBudget.monthlyReserve * 12)}
            </span>
          </div>
          <div className="border-t border-amber-300 pt-1 flex justify-between text-sm font-bold">
            <span>特別費予算合計</span>
            <span>{fmt(specialBudgetTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>実績合計</span>
            <span className="font-bold text-red-600">
              {fmt(specialTotal)}
            </span>
          </div>
          <div className="border-t border-amber-300 pt-1 flex justify-between font-bold">
            <span>残り予算</span>
            <span
              className={
                specialBudgetTotal - specialTotal >= 0
                  ? 'text-emerald-700'
                  : 'text-red-700'
              }
            >
              {fmt(specialBudgetTotal - specialTotal)}
            </span>
          </div>

          {/* 内訳 */}
          {specialItems.length > 0 && (
            <div className="mt-3 pt-2 border-t border-amber-200">
              <p className="text-xs text-gray-500 mb-1">内訳（月平均 × {activeMonths}ヶ月）</p>
              {specialItems.map((item) => (
                <div
                  key={item.name}
                  className="flex justify-between text-sm"
                >
                  <span>{item.name}</span>
                  <span>{fmt(item.amount * activeMonths)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// サマリー行コンポーネント
function SummaryRow({
  label,
  value,
  color,
  sub,
}: {
  label: string
  value: number
  color: string
  sub?: string
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{fmt(value)}</p>
      {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
    </div>
  )
}
