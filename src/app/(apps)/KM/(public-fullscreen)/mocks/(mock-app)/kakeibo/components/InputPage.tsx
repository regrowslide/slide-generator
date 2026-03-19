'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useKakeiboMockData } from '../context/MockDataContext'
import { CATEGORY_TYPE_LABELS } from './constants'
import type { CategoryType, Satisfaction, Transaction } from './types'

// 収支タブの定義
const TABS = [
  { key: 'expense' as const, label: '支出' },
  { key: 'income' as const, label: '収入' },
  { key: 'savings' as const, label: '先取り' },
] as const

type TabKey = (typeof TABS)[number]['key']

// タブに対応するカテゴリ区分のマッピング
const TAB_TO_TYPES: Record<TabKey, CategoryType[]> = {
  expense: ['variable_expense', 'fixed_expense', 'special_expense'],
  income: ['income'],
  savings: ['savings_investment'],
}

// 満足度の選択肢
const SATISFACTION_OPTIONS: { value: Satisfaction; label: string }[] = [
  { value: '〇', label: '〇' },
  { value: '△', label: '△' },
  { value: '✕', label: '✕' },
]

export default function InputPage() {
  const {
    categories,
    paymentMethods,
    transactions,
    addTransaction,
  } = useKakeiboMockData()

  // フォーム状態
  const [activeTab, setActiveTab] = useState<TabKey>('expense')
  const [expenseSubTab, setExpenseSubTab] = useState<'variable' | 'fixed' | 'special'>('variable')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [categoryId, setCategoryId] = useState('')
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [amount, setAmount] = useState('')
  const [satisfaction, setSatisfaction] = useState<Satisfaction>(null)
  const [memo, setMemo] = useState('')

  // 予算残ポップアップ
  const [budgetPopup, setBudgetPopup] = useState<{
    categoryName: string
    weeklyRemain: number | null
    monthlyRemain: number | null
    weeklyBudget: number | null
    monthlyBudget: number | null
  } | null>(null)

  // 支払方法のデフォルト設定
  useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethodId) {
      setPaymentMethodId(paymentMethods[0].id)
    }
  }, [paymentMethods, paymentMethodId])

  // アクティブタブに対応するカテゴリリスト
  const filteredCategories = useMemo(() => {
    if (activeTab === 'expense') {
      // 支出タブではサブタブで絞り込み
      const typeMap: Record<string, CategoryType> = {
        variable: 'variable_expense',
        fixed: 'fixed_expense',
        special: 'special_expense',
      }
      return categories
        .filter((c) => c.type === typeMap[expenseSubTab])
        .sort((a, b) => a.order - b.order)
    }
    const types = TAB_TO_TYPES[activeTab]
    return categories
      .filter((c) => types.includes(c.type))
      .sort((a, b) => a.order - b.order)
  }, [categories, activeTab, expenseSubTab])

  // よく使うカテゴリ上位3件（取引数ベース）
  const topCategories = useMemo(() => {
    const typeIds = new Set(filteredCategories.map((c) => c.id))
    // 各カテゴリの取引数をカウント
    const countMap = new Map<string, number>()
    for (const tx of transactions) {
      if (typeIds.has(tx.categoryId)) {
        countMap.set(tx.categoryId, (countMap.get(tx.categoryId) || 0) + 1)
      }
    }
    // 取引数でソートして上位3件
    return filteredCategories
      .map((c) => ({ ...c, count: countMap.get(c.id) || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
  }, [filteredCategories, transactions])

  // 予算残を計算
  const calcBudgetRemaining = useCallback(
    (catId: string, newAmount: number) => {
      const cat = categories.find((c) => c.id === catId)
      if (!cat) return null

      const now = new Date(date)
      const year = now.getFullYear()
      const month = now.getMonth() // 0-11

      // 今月の該当カテゴリ合計
      const monthlyTotal = transactions
        .filter((tx) => {
          const d = new Date(tx.date)
          return tx.categoryId === catId && d.getFullYear() === year && d.getMonth() === month
        })
        .reduce((sum, tx) => sum + tx.amount, 0)

      // 今週の該当カテゴリ合計（月曜起算）
      const dayOfWeek = now.getDay()
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const weekStart = new Date(year, month, now.getDate() + mondayOffset)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const weeklyTotal = transactions
        .filter((tx) => {
          const d = new Date(tx.date)
          return tx.categoryId === catId && d >= weekStart && d <= weekEnd
        })
        .reduce((sum, tx) => sum + tx.amount, 0)

      return {
        categoryName: cat.name,
        weeklyBudget: cat.weeklyBudget,
        monthlyBudget: cat.monthlyBudget,
        weeklyRemain: cat.weeklyBudget != null ? cat.weeklyBudget - weeklyTotal - newAmount : null,
        monthlyRemain: cat.monthlyBudget != null ? cat.monthlyBudget - monthlyTotal - newAmount : null,
      }
    },
    [categories, transactions, date]
  )

  // 登録処理
  const handleSubmit = () => {
    if (!categoryId || !amount) return

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) return

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date,
      categoryId,
      paymentMethodId,
      amount: numAmount,
      satisfaction,
      memo,
    }

    addTransaction(newTx)

    // 予算残ポップアップ表示
    const budgetInfo = calcBudgetRemaining(categoryId, numAmount)
    if (budgetInfo && (budgetInfo.weeklyRemain != null || budgetInfo.monthlyRemain != null)) {
      setBudgetPopup(budgetInfo)
    }

    // フォームリセット（日付・支払方法・タブは維持）
    setCategoryId('')
    setAmount('')
    setSatisfaction(null)
    setMemo('')
    setShowAllCategories(false)
  }

  // ポップアップ自動非表示
  useEffect(() => {
    if (!budgetPopup) return
    const timer = setTimeout(() => setBudgetPopup(null), 3000)
    return () => clearTimeout(timer)
  }, [budgetPopup])

  // タブ切替時にカテゴリ選択をリセット
  useEffect(() => {
    setCategoryId('')
    setShowAllCategories(false)
  }, [activeTab, expenseSubTab])

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* 収支切替タブ */}
      <div className="flex rounded-xl bg-gray-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 支出サブタブ（支出タブ選択時のみ） */}
      {activeTab === 'expense' && (
        <div className="flex gap-2">
          {[
            { key: 'variable' as const, label: '変動費' },
            { key: 'fixed' as const, label: '固定費' },
            { key: 'special' as const, label: '特別費' },
          ].map((sub) => (
            <button
              key={sub.key}
              onClick={() => setExpenseSubTab(sub.key)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                expenseSubTab === sub.key
                  ? 'bg-teal-100 text-teal-700 border border-teal-300'
                  : 'bg-gray-50 text-gray-500 border border-gray-200'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {/* 日付 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label className="block text-xs text-gray-500 mb-1">日付</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>

      {/* カテゴリ選択 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label className="block text-xs text-gray-500 mb-2">カテゴリ</label>

        {/* よく使うカテゴリ（上位3件） */}
        {!showAllCategories && (
          <>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {topCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-3 rounded-xl text-center transition-colors border-2 ${
                    categoryId === cat.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-100 bg-gray-50 hover:border-emerald-200'
                  }`}
                >
                  <div className="text-xl">{cat.name.split(' ')[0]}</div>
                  <div className="text-xs mt-1 text-gray-600 truncate">
                    {cat.name.split(' ').slice(1).join(' ')}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAllCategories(true)}
              className="w-full py-2 text-xs text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
            >
              その他のカテゴリ...
            </button>
          </>
        )}

        {/* 全カテゴリ表示 */}
        {showAllCategories && (
          <>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 mb-2"
            >
              <option value="">選択してください</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowAllCategories(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              戻る
            </button>
          </>
        )}
      </div>

      {/* 支払方法 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label className="block text-xs text-gray-500 mb-1">支払方法</label>
        <select
          value={paymentMethodId}
          onChange={(e) => setPaymentMethodId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          {paymentMethods.map((pm) => (
            <option key={pm.id} value={pm.id}>
              {pm.name}
            </option>
          ))}
        </select>
      </div>

      {/* 金額 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label className="block text-xs text-gray-500 mb-1">金額</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            ¥
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-lg text-2xl font-bold text-right focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
      </div>

      {/* 満足度 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label className="block text-xs text-gray-500 mb-2">満足度（任意）</label>
        <div className="flex gap-3">
          {SATISFACTION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSatisfaction(satisfaction === opt.value ? null : opt.value)}
              className={`flex-1 py-2 text-xl rounded-lg transition-colors border-2 ${
                satisfaction === opt.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-100 bg-gray-50 hover:border-emerald-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 備考 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label className="block text-xs text-gray-500 mb-1">備考（任意）</label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="メモを入力..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>

      {/* 登録ボタン */}
      <button
        onClick={handleSubmit}
        disabled={!categoryId || !amount}
        className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-md hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg"
      >
        登録する
      </button>

      {/* 予算残ポップアップ */}
      {budgetPopup && (
        <div
          onClick={() => setBudgetPopup(null)}
          className="fixed inset-0 flex items-end justify-center pb-24 z-50 pointer-events-none"
        >
          <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 max-w-sm w-full mx-4 animate-slide-up">
            <div className="text-sm font-medium text-gray-700 mb-3">
              {budgetPopup.categoryName} の予算残
            </div>
            <div className="space-y-2">
              {budgetPopup.weeklyRemain != null && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">週予算残</span>
                  <span
                    className={`text-lg font-bold ${
                      budgetPopup.weeklyRemain >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    ¥{budgetPopup.weeklyRemain.toLocaleString()}
                    <span className="text-xs text-gray-400 ml-1">
                      / ¥{budgetPopup.weeklyBudget?.toLocaleString()}
                    </span>
                  </span>
                </div>
              )}
              {budgetPopup.monthlyRemain != null && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">月予算残</span>
                  <span
                    className={`text-lg font-bold ${
                      budgetPopup.monthlyRemain >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    ¥{budgetPopup.monthlyRemain.toLocaleString()}
                    <span className="text-xs text-gray-400 ml-1">
                      / ¥{budgetPopup.monthlyBudget?.toLocaleString()}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
