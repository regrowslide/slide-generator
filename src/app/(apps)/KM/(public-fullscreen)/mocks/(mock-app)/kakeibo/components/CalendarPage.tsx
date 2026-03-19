'use client'

import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useKakeiboMockData } from '../context/MockDataContext'
import type { CategoryType, Transaction } from './types'

// 支出カテゴリ区分
const EXPENSE_TYPES: CategoryType[] = ['fixed_expense', 'variable_expense', 'special_expense']

// 金額フォーマット
const fmt = (n: number) => `¥${n.toLocaleString()}`

// 曜日ヘッダー（月曜始まり）
const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日']

// 満足度の表示色
const SATISFACTION_COLORS: Record<string, string> = {
  '〇': 'bg-green-50 text-green-600',
  '△': 'bg-yellow-50 text-yellow-600',
  '✕': 'bg-red-50 text-red-600',
}

export default function CalendarPage() {
  const {
    categories,
    paymentMethods,
    transactions,
    selectedYear,
    selectedMonth,
  } = useKakeiboMockData()

  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // 支出カテゴリIDセット
  const expenseCategoryIds = useMemo(() => {
    return new Set(
      categories.filter((c) => EXPENSE_TYPES.includes(c.type)).map((c) => c.id)
    )
  }, [categories])

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

  // 日別の支出合計マップ
  const dailyExpenseMap = useMemo(() => {
    const map = new Map<number, number>()
    for (const tx of monthTxs) {
      if (!expenseCategoryIds.has(tx.categoryId)) continue
      const day = new Date(tx.date).getDate()
      map.set(day, (map.get(day) ?? 0) + tx.amount)
    }
    return map
  }, [monthTxs, expenseCategoryIds])

  // 日別の支出トランザクション有無（ノーマネーデー判定用）
  const daysWithExpense = useMemo(() => {
    const set = new Set<number>()
    for (const tx of monthTxs) {
      if (expenseCategoryIds.has(tx.categoryId)) {
        set.add(new Date(tx.date).getDate())
      }
    }
    return set
  }, [monthTxs, expenseCategoryIds])

  // カレンダーのグリッド構築
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1)
    const lastDay = new Date(selectedYear, selectedMonth, 0)
    const daysInMonth = lastDay.getDate()

    // 月曜始まり: 0=月, 1=火, ..., 6=日
    let startDow = firstDay.getDay() - 1
    if (startDow < 0) startDow = 6

    const grid: (number | null)[] = []
    // 前月の空白
    for (let i = 0; i < startDow; i++) grid.push(null)
    // 当月の日
    for (let d = 1; d <= daysInMonth; d++) grid.push(d)
    // 末尾を7の倍数に
    while (grid.length % 7 !== 0) grid.push(null)

    return grid
  }, [selectedYear, selectedMonth])

  // 今日の判定
  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === selectedYear &&
    today.getMonth() + 1 === selectedMonth &&
    today.getDate() === day

  // 未来の日付判定
  const isFuture = (day: number) => {
    const d = new Date(selectedYear, selectedMonth - 1, day)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return d > todayStart
  }

  // 曜日判定（0=月, ..., 5=土, 6=日）
  const getDow = (day: number) => {
    const d = new Date(selectedYear, selectedMonth - 1, day).getDay()
    return d === 0 ? 6 : d - 1 // 月曜始まりに変換
  }

  // ノーマネーデー数
  const noMoneyDays = useMemo(() => {
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate()
    let count = 0
    for (let d = 1; d <= lastDay; d++) {
      if (isFuture(d)) continue
      if (!daysWithExpense.has(d)) count++
    }
    return count
  }, [selectedYear, selectedMonth, daysWithExpense])

  // 連続ノーマネーデー最長記録
  const maxConsecutive = useMemo(() => {
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate()
    let max = 0
    let current = 0
    for (let d = 1; d <= lastDay; d++) {
      if (isFuture(d)) break
      if (!daysWithExpense.has(d)) {
        current++
        if (current > max) max = current
      } else {
        current = 0
      }
    }
    return max
  }, [selectedYear, selectedMonth, daysWithExpense])

  // 選択日のトランザクション
  const selectedDayTxs = useMemo(() => {
    if (!selectedDate) return []
    return monthTxs.filter((tx) => tx.date === selectedDate)
  }, [selectedDate, monthTxs])

  // カテゴリ名取得
  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? id

  // 支払方法名取得
  const getPaymentName = (id: string) =>
    paymentMethods.find((p) => p.id === id)?.name ?? id

  // 日付クリック
  const handleDayClick = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h2 className="text-lg font-bold text-emerald-800">
        カレンダー ({selectedYear}年{selectedMonth}月)
      </h2>

      {/* ノーマネーデーサマリー */}
      <div className="bg-emerald-50 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌸</span>
          <div>
            <p className="text-sm text-emerald-700 font-bold">
              今月のノーマネーデー: {noMoneyDays}日
            </p>
            {maxConsecutive >= 2 && (
              <p className="text-xs text-emerald-600 mt-0.5">
                最長連続: {maxConsecutive}日
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-emerald-500">
          お金を使わなかった日 = ノーマネーデー
        </p>
      </div>

      {/* カレンダーグリッド */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 bg-emerald-600 text-white text-center text-sm font-medium">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={`py-2 ${i === 5 ? 'text-blue-200' : i === 6 ? 'text-red-200' : ''}`}
            >
              {w}
            </div>
          ))}
        </div>

        {/* 日付セル */}
        <div className="grid grid-cols-7">
          {calendarGrid.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="border-b border-r border-gray-100 h-20" />
            }

            const future = isFuture(day)
            const expense = dailyExpenseMap.get(day)
            const isNoMoneyDay = !future && !daysWithExpense.has(day)
            const dow = getDow(day)
            const todayFlag = isToday(day)

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`border-b border-r border-gray-100 h-20 p-1 text-left transition-colors hover:bg-gray-50 relative ${
                  isNoMoneyDay ? 'bg-green-50/50' : ''
                } ${todayFlag ? 'ring-2 ring-inset ring-emerald-400' : ''}`}
              >
                {/* 日付 */}
                <span
                  className={`text-xs font-medium ${
                    future
                      ? 'text-gray-300'
                      : dow === 5
                        ? 'text-blue-600'
                        : dow === 6
                          ? 'text-red-500'
                          : 'text-gray-700'
                  }`}
                >
                  {day}
                </span>

                {/* コンテンツ */}
                <div className="flex items-center justify-center mt-1">
                  {future ? null : isNoMoneyDay ? (
                    <span className="text-2xl leading-none">🌸</span>
                  ) : expense ? (
                    <span className="text-xs font-bold text-red-600 truncate">
                      {fmt(expense)}
                    </span>
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 凡例 */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 bg-green-50 border border-green-200 rounded" />
          🌸 ノーマネーデー
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 border-2 border-emerald-400 rounded" />
          今日
        </span>
        <span className="flex items-center gap-1">
          <span className="text-red-600 font-bold">¥</span>
          支出あり
        </span>
      </div>

      {/* 日付タップモーダル */}
      {selectedDate && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full max-h-[70vh] overflow-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800">
                {selectedDate.replace(/-/g, '/')} の明細
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              {selectedDayTxs.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  この日の記録はありません
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDayTxs.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="space-y-0.5">
                        <p className="font-medium text-sm">
                          {getCategoryName(tx.categoryId)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getPaymentName(tx.paymentMethodId)}
                          {tx.satisfaction && (
                            <span
                              className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                SATISFACTION_COLORS[tx.satisfaction] ?? ''
                              }`}
                            >
                              {tx.satisfaction}
                            </span>
                          )}
                        </p>
                        {tx.memo && (
                          <p className="text-[10px] text-gray-400">{tx.memo}</p>
                        )}
                      </div>
                      <span className="font-bold text-sm">
                        {fmt(tx.amount)}
                      </span>
                    </div>
                  ))}
                  {/* 合計 */}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm">
                    <span>合計</span>
                    <span>
                      {fmt(selectedDayTxs.reduce((sum, tx) => sum + tx.amount, 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
