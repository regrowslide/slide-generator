'use client'

import { useMemo, useState } from 'react'
import { useKakeiboMockData } from '../context/MockDataContext'
import { CATEGORY_TYPE_LABELS } from './constants'
import type { CategoryType, Satisfaction } from './types'

// 金額フォーマット
const fmt = (n: number) => `¥${n.toLocaleString()}`

// 満足度の表示色
const SATISFACTION_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  '〇': { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
  '△': { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  '✕': { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
}

// ソートキー
type SortKey = 'date' | 'amount'

// 区分フィルタ用
const FILTER_TYPES: CategoryType[] = [
  'income',
  'fixed_expense',
  'variable_expense',
  'special_expense',
  'savings_investment',
]

export default function SatisfactionReviewPage() {
  const {
    categories,
    paymentMethods,
    transactions,
    selectedYear,
    selectedMonth,
  } = useKakeiboMockData()

  // フィルタ状態
  const [filterCategoryIds, setFilterCategoryIds] = useState<Set<string>>(
    new Set()
  )
  const [filterTypes, setFilterTypes] = useState<Set<CategoryType>>(new Set())
  const [filterSatisfaction, setFilterSatisfaction] = useState<
    Set<Satisfaction>
  >(new Set())
  const [filterPaymentIds, setFilterPaymentIds] = useState<Set<string>>(
    new Set()
  )
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortAsc, setSortAsc] = useState(true)

  // カテゴリマップ
  const categoryMap = useMemo(() => {
    const map = new Map<string, (typeof categories)[0]>()
    for (const c of categories) map.set(c.id, c)
    return map
  }, [categories])

  // 支払方法マップ
  const paymentMap = useMemo(() => {
    const map = new Map<string, (typeof paymentMethods)[0]>()
    for (const p of paymentMethods) map.set(p.id, p)
    return map
  }, [paymentMethods])

  // 当月のトランザクション
  const monthTxs = useMemo(
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

  // フィルタ適用
  const filteredTxs = useMemo(() => {
    let result = [...monthTxs]

    // 区分フィルタ
    if (filterTypes.size > 0) {
      const typeCatIds = new Set(
        categories
          .filter((c) => filterTypes.has(c.type))
          .map((c) => c.id)
      )
      result = result.filter((tx) => typeCatIds.has(tx.categoryId))
    }

    // カテゴリフィルタ
    if (filterCategoryIds.size > 0) {
      result = result.filter((tx) => filterCategoryIds.has(tx.categoryId))
    }

    // 満足度フィルタ
    if (filterSatisfaction.size > 0) {
      result = result.filter((tx) => filterSatisfaction.has(tx.satisfaction))
    }

    // 支払方法フィルタ
    if (filterPaymentIds.size > 0) {
      result = result.filter((tx) =>
        filterPaymentIds.has(tx.paymentMethodId)
      )
    }

    // ソート
    result.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'date') {
        cmp = a.date.localeCompare(b.date)
      } else {
        cmp = a.amount - b.amount
      }
      return sortAsc ? cmp : -cmp
    })

    return result
  }, [
    monthTxs,
    filterTypes,
    filterCategoryIds,
    filterSatisfaction,
    filterPaymentIds,
    sortKey,
    sortAsc,
    categories,
  ])

  // 満足度別集計
  const satisfactionSummary = useMemo(() => {
    const summary: Record<string, { count: number; total: number }> = {
      '〇': { count: 0, total: 0 },
      '△': { count: 0, total: 0 },
      '✕': { count: 0, total: 0 },
    }
    for (const tx of filteredTxs) {
      if (tx.satisfaction && summary[tx.satisfaction]) {
        summary[tx.satisfaction].count++
        summary[tx.satisfaction].total += tx.amount
      }
    }
    return summary
  }, [filteredTxs])

  // トグルヘルパー
  const toggleSet = <T,>(
    set: Set<T>,
    setter: React.Dispatch<React.SetStateAction<Set<T>>>,
    value: T
  ) => {
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  // ソートハンドラ
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  // ソートアイコン
  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return '↕'
    return sortAsc ? '↑' : '↓'
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-emerald-800">
        満足度振り返り ({selectedYear}年{selectedMonth}月)
      </h2>

      {/* 満足度サマリー */}
      <div className="grid grid-cols-3 gap-2">
        {(['〇', '△', '✕'] as const).map((s) => {
          const data = satisfactionSummary[s]
          const colors = SATISFACTION_COLORS[s]
          return (
            <div
              key={s}
              className={`rounded-lg p-3 text-center ${colors.bg}`}
            >
              <span className={`text-2xl font-bold ${colors.text}`}>{s}</span>
              <p className="text-sm mt-1">
                <span className="font-bold">{data.count}</span>件
              </p>
              <p className={`text-sm font-bold ${colors.text}`}>
                {fmt(data.total)}
              </p>
            </div>
          )
        })}
      </div>

      {/* フィルタ */}
      <div className="space-y-3 bg-gray-50 rounded-lg p-3">
        <p className="text-sm font-bold text-gray-700">フィルタ</p>

        {/* 区分フィルタ */}
        <div>
          <p className="text-xs text-gray-500 mb-1">区分</p>
          <div className="flex flex-wrap gap-1">
            {FILTER_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => toggleSet(filterTypes, setFilterTypes, type)}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  filterTypes.has(type)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300'
                }`}
              >
                {CATEGORY_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* 満足度フィルタ */}
        <div>
          <p className="text-xs text-gray-500 mb-1">満足度</p>
          <div className="flex flex-wrap gap-1">
            {(['〇', '△', '✕', null] as Satisfaction[]).map((s) => {
              const label = s ?? '未設定'
              return (
                <button
                  key={label}
                  onClick={() =>
                    toggleSet(filterSatisfaction, setFilterSatisfaction, s)
                  }
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    filterSatisfaction.has(s)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 支払方法フィルタ */}
        <div>
          <p className="text-xs text-gray-500 mb-1">支払方法</p>
          <div className="flex flex-wrap gap-1">
            {paymentMethods.map((pm) => (
              <button
                key={pm.id}
                onClick={() =>
                  toggleSet(filterPaymentIds, setFilterPaymentIds, pm.id)
                }
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  filterPaymentIds.has(pm.id)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300'
                }`}
              >
                {pm.name}
              </button>
            ))}
          </div>
        </div>

        {/* フィルタクリア */}
        {(filterTypes.size > 0 ||
          filterCategoryIds.size > 0 ||
          filterSatisfaction.size > 0 ||
          filterPaymentIds.size > 0) && (
          <button
            onClick={() => {
              setFilterTypes(new Set())
              setFilterCategoryIds(new Set())
              setFilterSatisfaction(new Set())
              setFilterPaymentIds(new Set())
            }}
            className="text-xs text-red-500 hover:text-red-700 underline"
          >
            フィルタをクリア
          </button>
        )}
      </div>

      {/* 件数表示 */}
      <p className="text-sm text-gray-500">
        {filteredTxs.length}件 / {monthTxs.length}件
      </p>

      {/* テーブル */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-emerald-600 text-white">
              <th
                className="px-3 py-2 text-left cursor-pointer hover:bg-emerald-700"
                onClick={() => handleSort('date')}
              >
                日付 {sortIcon('date')}
              </th>
              <th className="px-3 py-2 text-left">カテゴリ</th>
              <th
                className="px-3 py-2 text-right cursor-pointer hover:bg-emerald-700"
                onClick={() => handleSort('amount')}
              >
                金額 {sortIcon('amount')}
              </th>
              <th className="px-3 py-2 text-center">満足度</th>
              <th className="px-3 py-2 text-left">支払方法</th>
              <th className="px-3 py-2 text-left">備考</th>
            </tr>
          </thead>
          <tbody>
            {filteredTxs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-gray-400"
                >
                  該当するデータがありません
                </td>
              </tr>
            ) : (
              filteredTxs.map((tx) => {
                const cat = categoryMap.get(tx.categoryId)
                const pm = paymentMap.get(tx.paymentMethodId)
                const satColors = tx.satisfaction
                  ? SATISFACTION_COLORS[tx.satisfaction]
                  : null

                return (
                  <tr
                    key={tx.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      satColors ? satColors.bg : ''
                    }`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      {tx.date.slice(5).replace('-', '/')}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {cat?.name ?? tx.categoryId}
                    </td>
                    <td className="px-3 py-2 text-right font-bold">
                      {fmt(tx.amount)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {tx.satisfaction ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${satColors?.badge ?? ''}`}
                        >
                          {tx.satisfaction}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                      {pm?.name ?? tx.paymentMethodId}
                    </td>
                    <td className="px-3 py-2 text-gray-500 max-w-[200px] truncate">
                      {tx.memo || '-'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
