'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { useKakeiboMockData } from '../context/MockDataContext'
import { CATEGORY_TYPE_LABELS, MONTHS } from './constants'
import type { Category, CategoryType } from './types'

// 支出カテゴリ区分
const EXPENSE_TYPES: CategoryType[] = ['fixed_expense', 'variable_expense', 'special_expense']

// 金額フォーマット
const fmt = (n: number) => `¥${n.toLocaleString()}`

// 区分の表示順
const TYPE_ORDER: CategoryType[] = [
  'income',
  'fixed_expense',
  'variable_expense',
  'special_expense',
]

// 曜日ヘッダー（月曜始まり）
const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日']

export default function PdfExportButton() {
  const [isGenerating, setIsGenerating] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const {
    categories,
    paymentMethods,
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

  // 支出カテゴリIDセット
  const expenseCategoryIds = useMemo(() => {
    return new Set(
      categories.filter((c) => EXPENSE_TYPES.includes(c.type)).map((c) => c.id)
    )
  }, [categories])

  // 当月トランザクション
  const monthTxs = useMemo(
    () =>
      transactions.filter((tx) => {
        const d = new Date(tx.date)
        return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth
      }),
    [transactions, selectedYear, selectedMonth]
  )

  // 年間トランザクション
  const yearTxs = useMemo(
    () => transactions.filter((tx) => new Date(tx.date).getFullYear() === selectedYear),
    [transactions, selectedYear]
  )

  // アクティブ月数
  const activeMonths = useMemo(() => {
    const months = new Set<number>()
    for (const tx of yearTxs) months.add(new Date(tx.date).getMonth() + 1)
    return Math.max(months.size, 1)
  }, [yearTxs])

  // カテゴリをグループ化
  const groupedCategories = useMemo(() => {
    const map = new Map<CategoryType, Category[]>()
    for (const t of TYPE_ORDER) {
      map.set(t, categories.filter((c) => c.type === t).sort((a, b) => a.order - b.order))
    }
    return map
  }, [categories])

  // 月別×カテゴリ別実績
  const monthlyActuals = useMemo(() => {
    const result: Record<number, Record<string, number>> = {}
    for (let m = 1; m <= 12; m++) result[m] = {}
    for (const tx of yearTxs) {
      const d = new Date(tx.date)
      const month = d.getMonth() + 1
      if (!result[month][tx.categoryId]) result[month][tx.categoryId] = 0
      result[month][tx.categoryId] += tx.amount
    }
    return result
  }, [yearTxs])

  // 区分別月間小計
  const getTypeMonthlyTotal = useCallback(
    (type: CategoryType, month: number): number => {
      const cats = groupedCategories.get(type) ?? []
      return cats.reduce((sum, cat) => sum + (monthlyActuals[month]?.[cat.id] ?? 0), 0)
    },
    [groupedCategories, monthlyActuals]
  )

  // 支払方法別×月別集計
  const annualByPayment = useMemo(() => {
    const result: Record<string, Record<number, number>> = {}
    for (const pm of paymentMethods) {
      result[pm.id] = {}
      for (let m = 1; m <= 12; m++) result[pm.id][m] = 0
    }
    for (const tx of yearTxs) {
      const d = new Date(tx.date)
      const m = d.getMonth() + 1
      if (result[tx.paymentMethodId]) result[tx.paymentMethodId][m] += tx.amount
    }
    return result
  }, [yearTxs, paymentMethods])

  // 日別支出マップ（カレンダー用）
  const dailyExpenseMap = useMemo(() => {
    const map = new Map<number, number>()
    for (const tx of monthTxs) {
      if (!expenseCategoryIds.has(tx.categoryId)) continue
      const day = new Date(tx.date).getDate()
      map.set(day, (map.get(day) ?? 0) + tx.amount)
    }
    return map
  }, [monthTxs, expenseCategoryIds])

  // ノーマネーデー判定用
  const daysWithExpense = useMemo(() => {
    const set = new Set<number>()
    for (const tx of monthTxs) {
      if (expenseCategoryIds.has(tx.categoryId)) set.add(new Date(tx.date).getDate())
    }
    return set
  }, [monthTxs, expenseCategoryIds])

  // 満足度集計
  const satisfactionSummary = useMemo(() => {
    const summary: Record<string, { count: number; total: number }> = {
      '〇': { count: 0, total: 0 },
      '△': { count: 0, total: 0 },
      '✕': { count: 0, total: 0 },
    }
    for (const tx of monthTxs) {
      if (tx.satisfaction && summary[tx.satisfaction]) {
        summary[tx.satisfaction].count++
        summary[tx.satisfaction].total += tx.amount
      }
    }
    return summary
  }, [monthTxs])

  // BADハイライト（✕の取引上位5件）
  const badTransactions = useMemo(() => {
    return monthTxs
      .filter((tx) => tx.satisfaction === '✕')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  }, [monthTxs])

  // PDF生成
  const handleGeneratePdf = async () => {
    if (!printRef.current) return
    setIsGenerating(true)

    try {
      const html2canvas = (await import('html2canvas-pro')).default
      const { jsPDF } = await import('jspdf')

      const sections = printRef.current.querySelectorAll<HTMLElement>('[data-pdf-section]')
      if (sections.length === 0) {
        setIsGenerating(false)
        return
      }

      // A4横: 297mm × 210mm
      const pdfDoc = new jsPDF('l', 'mm', 'a4')
      const pdfWidth = pdfDoc.internal.pageSize.getWidth()
      const pdfHeight = pdfDoc.internal.pageSize.getHeight()

      for (let i = 0; i < sections.length; i++) {
        if (i > 0) pdfDoc.addPage()

        const canvas = await html2canvas(sections[i], {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        })

        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        const contentHeight = (canvas.height / canvas.width) * pdfWidth

        // コンテンツがA4に収まらない場合は縮小
        if (contentHeight > pdfHeight) {
          const scale = pdfHeight / contentHeight
          const scaledWidth = pdfWidth * scale
          const offsetX = (pdfWidth - scaledWidth) / 2
          pdfDoc.addImage(imgData, 'JPEG', offsetX, 0, scaledWidth, pdfHeight)
        } else {
          pdfDoc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, contentHeight)
        }
      }

      // ダウンロード
      const blob = pdfDoc.output('blob')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kakeibo-report-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF生成エラー:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  // カレンダーグリッド
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1)
    const lastDay = new Date(selectedYear, selectedMonth, 0)
    const daysInMonth = lastDay.getDate()
    let startDow = firstDay.getDay() - 1
    if (startDow < 0) startDow = 6
    const grid: (number | null)[] = []
    for (let i = 0; i < startDow; i++) grid.push(null)
    for (let d = 1; d <= daysInMonth; d++) grid.push(d)
    while (grid.length % 7 !== 0) grid.push(null)
    return grid
  }, [selectedYear, selectedMonth])

  // ノーマネーデー数
  const noMoneyDays = useMemo(() => {
    const today = new Date()
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate()
    let count = 0
    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(selectedYear, selectedMonth - 1, d)
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      if (date > todayStart) continue
      if (!daysWithExpense.has(d)) count++
    }
    return count
  }, [selectedYear, selectedMonth, daysWithExpense])

  // 週予算テーブルデータ
  const weekBudgetData = useMemo(() => {
    // 変動費カテゴリで weeklyBudget が設定されているもの
    const budgetCats = categories
      .filter((c) => c.type === 'variable_expense' && c.weeklyBudget && c.weeklyBudget > 0)
      .sort((a, b) => a.order - b.order)

    // 月の週を計算（月曜始まり）
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1)
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate()

    // 週の境界を計算
    const weeks: { start: number; end: number }[] = []
    let weekStart = 1
    for (let d = 1; d <= lastDay; d++) {
      const dow = new Date(selectedYear, selectedMonth - 1, d).getDay()
      // 日曜日で1週終了、または月末
      if (dow === 0 || d === lastDay) {
        weeks.push({ start: weekStart, end: d })
        weekStart = d + 1
      }
    }

    // 各週×カテゴリの実績集計
    const weeklyActuals: Record<string, number[]> = {}
    for (const cat of budgetCats) {
      weeklyActuals[cat.id] = weeks.map((week) => {
        return monthTxs
          .filter((tx) => {
            if (tx.categoryId !== cat.id) return false
            const day = new Date(tx.date).getDate()
            return day >= week.start && day <= week.end
          })
          .reduce((sum, tx) => sum + tx.amount, 0)
      })
    }

    return { budgetCats, weeks, weeklyActuals }
  }, [categories, monthTxs, selectedYear, selectedMonth])

  // 区分別月平均データ
  const getGroupItems = useCallback(
    (type: CategoryType) => {
      const cats = categories.filter((c) => c.type === type).sort((a, b) => a.order - b.order)
      return cats
        .map((cat) => {
          const total = yearTxs
            .filter((tx) => tx.categoryId === cat.id)
            .reduce((sum, tx) => sum + tx.amount, 0)
          return { name: cat.name, amount: Math.round(total / activeMonths) }
        })
        .filter((item) => item.amount > 0)
    },
    [categories, yearTxs, activeMonths]
  )

  // 収支サマリー
  const incomeSummary = useMemo(() => {
    const getTotal = (type: CategoryType) => {
      const catIds = new Set(categories.filter((c) => c.type === type).map((c) => c.id))
      return monthTxs.filter((tx) => catIds.has(tx.categoryId)).reduce((sum, tx) => sum + tx.amount, 0)
    }
    const income = getTotal('income')
    const savings = getTotal('savings_investment')
    const fixed = getTotal('fixed_expense')
    const variable = getTotal('variable_expense')
    const expense = fixed + variable
    const surplus = income - savings - expense
    return { income, savings, fixed, variable, expense, surplus }
  }, [categories, monthTxs])

  return (
    <>
      <button
        onClick={handleGeneratePdf}
        disabled={isGenerating}
        className="p-2 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
        title="PDF出力"
      >
        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
      </button>

      {/* 印刷用レイアウト（非表示） */}
      <div ref={printRef} style={{ position: 'fixed', left: '-9999px', top: 0, width: '1200px' }}>
        {/* セクション1: カレンダー */}
        <div data-pdf-section="calendar" style={{ padding: '24px', background: '#fff' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#065f46', marginBottom: '16px' }}>
            カレンダー ({selectedYear}年{selectedMonth}月)
          </h2>
          <div style={{ background: '#ecfdf5', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🌸</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#047857' }}>
              今月のノーマネーデー: {noMoneyDays}日
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr>
                {WEEKDAYS.map((w, i) => (
                  <th
                    key={w}
                    style={{
                      background: '#059669',
                      color: i === 5 ? '#bfdbfe' : i === 6 ? '#fecaca' : '#fff',
                      padding: '8px',
                      textAlign: 'center',
                      fontSize: '12px',
                    }}
                  >
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: calendarGrid.length / 7 }, (_, rowIdx) => (
                <tr key={rowIdx}>
                  {calendarGrid.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, colIdx) => {
                    const dow = colIdx // 0=月, ..., 5=土, 6=日
                    const expense = day ? dailyExpenseMap.get(day) : undefined
                    const isNoMoney = day ? !daysWithExpense.has(day) : false
                    const today = new Date()
                    const isFuture = day
                      ? new Date(selectedYear, selectedMonth - 1, day) > new Date(today.getFullYear(), today.getMonth(), today.getDate())
                      : false

                    return (
                      <td
                        key={colIdx}
                        style={{
                          border: '1px solid #e5e7eb',
                          height: '60px',
                          padding: '4px',
                          verticalAlign: 'top',
                          background: day && !isFuture && isNoMoney ? '#f0fdf4' : '#fff',
                          color: isFuture ? '#d1d5db' : dow === 5 ? '#2563eb' : dow === 6 ? '#ef4444' : '#374151',
                          fontSize: '11px',
                        }}
                      >
                        {day && (
                          <>
                            <div style={{ fontWeight: 500 }}>{day}</div>
                            <div style={{ textAlign: 'center', marginTop: '2px' }}>
                              {isFuture ? null : isNoMoney ? (
                                <span style={{ fontSize: '18px' }}>🌸</span>
                              ) : expense ? (
                                <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '10px' }}>
                                  {fmt(expense)}
                                </span>
                              ) : null}
                            </div>
                          </>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* セクション2: 週予算管理表 */}
        <div data-pdf-section="weekly-budget" style={{ padding: '24px', background: '#fff' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#065f46', marginBottom: '16px' }}>
            週予算管理表 ({selectedYear}年{selectedMonth}月)
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#059669', color: '#fff' }}>
                <th style={{ padding: '8px', textAlign: 'left', minWidth: '120px' }}>カテゴリ</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>週予算</th>
                {weekBudgetData.weeks.map((w, i) => (
                  <th key={i} style={{ padding: '8px', textAlign: 'right' }}>
                    {i + 1}週 ({w.start}〜{w.end}日)
                  </th>
                ))}
                <th style={{ padding: '8px', textAlign: 'right', background: '#047857' }}>月合計</th>
                <th style={{ padding: '8px', textAlign: 'right', background: '#047857' }}>月予算</th>
              </tr>
            </thead>
            <tbody>
              {weekBudgetData.budgetCats.map((cat) => {
                const actuals = weekBudgetData.weeklyActuals[cat.id] ?? []
                const monthTotal = actuals.reduce((s, v) => s + v, 0)
                return (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 500 }}>{cat.name}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: '#6b7280' }}>
                      {cat.weeklyBudget ? fmt(cat.weeklyBudget) : '-'}
                    </td>
                    {actuals.map((actual, i) => (
                      <td
                        key={i}
                        style={{
                          padding: '6px 8px',
                          textAlign: 'right',
                          fontWeight: 'bold',
                          background: cat.weeklyBudget && actual > cat.weeklyBudget ? '#fef2f2' : actual > 0 ? '#ecfdf5' : '',
                          color: cat.weeklyBudget && actual > cat.weeklyBudget ? '#b91c1c' : '#065f46',
                        }}
                      >
                        {actual > 0 ? fmt(actual) : '-'}
                      </td>
                    ))}
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 'bold', background: '#f9fafb' }}>
                      {monthTotal > 0 ? fmt(monthTotal) : '-'}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: '#6b7280', background: '#f9fafb' }}>
                      {cat.monthlyBudget ? fmt(cat.monthlyBudget) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {weekBudgetData.budgetCats.length === 0 && (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '24px' }}>
              週予算が設定されているカテゴリがありません
            </p>
          )}
        </div>

        {/* セクション3: 年間推移表 */}
        <div data-pdf-section="annual-transition" style={{ padding: '24px', background: '#fff' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#065f46', marginBottom: '16px' }}>
            年間推移シート ({selectedYear}年)
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#059669', color: '#fff' }}>
                <th style={{ padding: '6px', textAlign: 'left', minWidth: '100px' }}>費目</th>
                {MONTHS.map((m) => (
                  <th key={m} style={{ padding: '4px', textAlign: 'right', minWidth: '65px' }}>{m}</th>
                ))}
                <th style={{ padding: '4px', textAlign: 'right', minWidth: '65px', background: '#047857' }}>平均</th>
                <th style={{ padding: '4px', textAlign: 'right', minWidth: '70px', background: '#047857' }}>年間合計</th>
              </tr>
            </thead>
            <tbody>
              {TYPE_ORDER.map((type) => {
                const cats = groupedCategories.get(type) ?? []
                return (
                  <React.Fragment key={type}>
                    <tr style={{ background: '#d1fae5' }}>
                      <td colSpan={15} style={{ padding: '4px 6px', fontWeight: 'bold', color: '#065f46', fontSize: '11px' }}>
                        {CATEGORY_TYPE_LABELS[type]}
                      </td>
                    </tr>
                    {cats.map((cat) => {
                      let annual = 0
                      let cnt = 0
                      return (
                        <tr key={cat.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{cat.name}</td>
                          {Array.from({ length: 12 }, (_, i) => {
                            const m = i + 1
                            const actual = monthlyActuals[m]?.[cat.id] ?? 0
                            annual += actual
                            if (actual > 0) cnt++
                            return (
                              <td key={m} style={{ padding: '3px 4px', textAlign: 'right', fontWeight: 'bold' }}>
                                {actual > 0 ? fmt(actual) : '-'}
                              </td>
                            )
                          })}
                          <td style={{ padding: '3px 4px', textAlign: 'right', fontWeight: 'bold', background: '#f9fafb' }}>
                            {cnt > 0 ? fmt(Math.round(annual / cnt)) : '-'}
                          </td>
                          <td style={{ padding: '3px 4px', textAlign: 'right', fontWeight: 'bold', background: '#f9fafb' }}>
                            {annual > 0 ? fmt(annual) : '-'}
                          </td>
                        </tr>
                      )
                    })}
                    {/* 小計行 */}
                    <tr style={{ background: '#ecfdf5', fontWeight: 'bold', borderBottom: '2px solid #a7f3d0' }}>
                      <td style={{ padding: '4px 6px' }}>小計</td>
                      {Array.from({ length: 12 }, (_, i) => {
                        const total = getTypeMonthlyTotal(type, i + 1)
                        return (
                          <td key={i} style={{ padding: '3px 4px', textAlign: 'right' }}>
                            {total > 0 ? fmt(total) : '-'}
                          </td>
                        )
                      })}
                      <td style={{ padding: '3px 4px', textAlign: 'right', background: '#f3f4f6' }}>
                        {(() => {
                          let total = 0, cnt = 0
                          for (let m = 1; m <= 12; m++) {
                            const v = getTypeMonthlyTotal(type, m)
                            total += v
                            if (v > 0) cnt++
                          }
                          return cnt > 0 ? fmt(Math.round(total / cnt)) : '-'
                        })()}
                      </td>
                      <td style={{ padding: '3px 4px', textAlign: 'right', background: '#f3f4f6' }}>
                        {(() => {
                          let total = 0
                          for (let m = 1; m <= 12; m++) total += getTypeMonthlyTotal(type, m)
                          return total > 0 ? fmt(total) : '-'
                        })()}
                      </td>
                    </tr>
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* セクション4: 収支可視化 */}
        <div data-pdf-section="income-expense" style={{ padding: '24px', background: '#fff' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#065f46', marginBottom: '16px' }}>
            収支可視化 ({selectedYear}年{selectedMonth}月)
          </h2>
          {/* 月平均サマリー */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: '収入', items: getGroupItems('income'), bg: '#eff6ff' },
              { label: '先取り貯金・投資', items: getGroupItems('savings_investment'), bg: '#ecfdf5' },
              { label: '支出（固定費）', items: getGroupItems('fixed_expense'), bg: '#fff7ed' },
              { label: '支出（変動費）', items: getGroupItems('variable_expense'), bg: '#fdf2f8' },
            ].map((group) => (
              <div key={group.label} style={{ background: group.bg, borderRadius: '8px', padding: '12px' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>{group.label}</h4>
                {group.items.map((item) => (
                  <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                    <span>{item.name}</span>
                    <span style={{ fontWeight: 500 }}>{fmt(item.amount)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #d1d5db', marginTop: '6px', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px' }}>
                  <span>合計</span>
                  <span>{fmt(group.items.reduce((s, i) => s + i.amount, 0))}</span>
                </div>
              </div>
            ))}
          </div>
          {/* 今月の収支サマリー */}
          <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb' }}>
            <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '12px' }}>今月の収支サマリー</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div><span style={{ color: '#6b7280' }}>収入 (a)</span><br /><strong style={{ color: '#1d4ed8' }}>{fmt(incomeSummary.income)}</strong></div>
              <div><span style={{ color: '#6b7280' }}>先取り (b)</span><br /><strong style={{ color: '#047857' }}>{fmt(incomeSummary.savings)}</strong></div>
              <div><span style={{ color: '#6b7280' }}>支出 (c)</span><br /><strong style={{ color: '#dc2626' }}>{fmt(incomeSummary.expense)}</strong></div>
              <div><span style={{ color: '#6b7280' }}>余り (d=a-b-c)</span><br /><strong style={{ color: incomeSummary.surplus >= 0 ? '#047857' : '#dc2626' }}>{fmt(incomeSummary.surplus)}</strong></div>
              <div>
                <span style={{ color: '#6b7280' }}>支出率</span><br />
                <strong style={{ color: incomeSummary.income > 0 && (incomeSummary.expense / incomeSummary.income) * 100 <= 80 ? '#047857' : '#dc2626' }}>
                  {incomeSummary.income > 0 ? `${((incomeSummary.expense / incomeSummary.income) * 100).toFixed(1)}%` : '-'}
                </strong>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>貯蓄率</span><br />
                <strong style={{ color: '#047857' }}>
                  {incomeSummary.income > 0 ? `${(((incomeSummary.savings + Math.max(incomeSummary.surplus, 0)) / incomeSummary.income) * 100).toFixed(1)}%` : '-'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* セクション5: 支払管理 */}
        <div data-pdf-section="payment-management" style={{ padding: '24px', background: '#fff' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#065f46', marginBottom: '16px' }}>
            支払管理シート ({selectedYear}年)
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#0d9488', color: '#fff' }}>
                <th style={{ padding: '6px', textAlign: 'left', minWidth: '80px' }}>支払方法</th>
                {MONTHS.map((m) => (
                  <th key={m} style={{ padding: '4px', textAlign: 'right', minWidth: '65px' }}>{m}</th>
                ))}
                <th style={{ padding: '4px', textAlign: 'right', minWidth: '70px', background: '#0f766e' }}>年間合計</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map((pm) => {
                let annualTotal = 0
                return (
                  <tr key={pm.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '4px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {pm.name}
                      {pm.dueDate && <span style={{ fontSize: '9px', color: '#9ca3af' }}> ({pm.dueDate}日)</span>}
                    </td>
                    {Array.from({ length: 12 }, (_, i) => {
                      const amount = annualByPayment[pm.id]?.[i + 1] ?? 0
                      annualTotal += amount
                      return (
                        <td key={i} style={{ padding: '3px 4px', textAlign: 'right', fontWeight: amount > 0 ? 'bold' : 'normal' }}>
                          {amount > 0 ? fmt(amount) : '-'}
                        </td>
                      )
                    })}
                    <td style={{ padding: '3px 4px', textAlign: 'right', fontWeight: 'bold', background: '#f9fafb' }}>
                      {annualTotal > 0 ? fmt(annualTotal) : '-'}
                    </td>
                  </tr>
                )
              })}
              {/* 合計行 */}
              <tr style={{ background: '#f0fdfa', fontWeight: 'bold', borderTop: '2px solid #5eead4' }}>
                <td style={{ padding: '4px 6px' }}>合計</td>
                {Array.from({ length: 12 }, (_, i) => {
                  let total = 0
                  for (const pm of paymentMethods) total += annualByPayment[pm.id]?.[i + 1] ?? 0
                  return (
                    <td key={i} style={{ padding: '3px 4px', textAlign: 'right' }}>{total > 0 ? fmt(total) : '-'}</td>
                  )
                })}
                <td style={{ padding: '3px 4px', textAlign: 'right', background: '#f3f4f6' }}>
                  {(() => {
                    let grand = 0
                    for (const pm of paymentMethods) {
                      for (let m = 1; m <= 12; m++) grand += annualByPayment[pm.id]?.[m] ?? 0
                    }
                    return grand > 0 ? fmt(grand) : '-'
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* セクション6: 満足度振り返り */}
        <div data-pdf-section="satisfaction" style={{ padding: '24px', background: '#fff' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#065f46', marginBottom: '16px' }}>
            満足度振り返り ({selectedYear}年{selectedMonth}月)
          </h2>
          {/* 満足度サマリー */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: '〇', bg: '#ecfdf5', color: '#047857' },
              { label: '△', bg: '#fffbeb', color: '#b45309' },
              { label: '✕', bg: '#fef2f2', color: '#b91c1c' },
            ].map((s) => {
              const data = satisfactionSummary[s.label]
              return (
                <div key={s.label} style={{ background: s.bg, borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '28px', fontWeight: 'bold', color: s.color }}>{s.label}</span>
                  <p style={{ fontSize: '14px', marginTop: '4px' }}>
                    <strong>{data.count}</strong>件
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: s.color }}>{fmt(data.total)}</p>
                </div>
              )
            })}
          </div>
          {/* BADハイライト */}
          {badTransactions.length > 0 && (
            <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '16px' }}>
              <h4 style={{ fontWeight: 'bold', fontSize: '14px', color: '#b91c1c', marginBottom: '12px' }}>
                ✕ BADハイライト（上位{badTransactions.length}件）
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #fca5a5' }}>
                    <th style={{ padding: '4px 8px', textAlign: 'left' }}>日付</th>
                    <th style={{ padding: '4px 8px', textAlign: 'left' }}>カテゴリ</th>
                    <th style={{ padding: '4px 8px', textAlign: 'right' }}>金額</th>
                    <th style={{ padding: '4px 8px', textAlign: 'left' }}>支払方法</th>
                    <th style={{ padding: '4px 8px', textAlign: 'left' }}>備考</th>
                  </tr>
                </thead>
                <tbody>
                  {badTransactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #fecaca' }}>
                      <td style={{ padding: '4px 8px' }}>{tx.date.slice(5).replace('-', '/')}</td>
                      <td style={{ padding: '4px 8px' }}>{categoryMap.get(tx.categoryId)?.name ?? tx.categoryId}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 'bold' }}>{fmt(tx.amount)}</td>
                      <td style={{ padding: '4px 8px' }}>{paymentMethods.find((p) => p.id === tx.paymentMethodId)?.name ?? ''}</td>
                      <td style={{ padding: '4px 8px', color: '#6b7280' }}>{tx.memo || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// React import（JSX.Fragment用）
import React from 'react'
