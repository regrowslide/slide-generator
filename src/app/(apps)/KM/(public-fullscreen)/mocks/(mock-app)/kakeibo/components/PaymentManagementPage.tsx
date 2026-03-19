'use client'

import { useMemo, useState } from 'react'
import { useKakeiboMockData } from '../context/MockDataContext'
import { MONTHS } from './constants'

// 金額フォーマット
const fmt = (n: number) => `¥${n.toLocaleString()}`

export default function PaymentManagementPage() {
  const { paymentMethods, transactions, selectedYear } =
    useKakeiboMockData()

  // 表示月（1-12）
  const [viewMonth, setViewMonth] = useState(1)

  // 当月のトランザクション
  const monthTxs = useMemo(
    () =>
      transactions.filter((tx) => {
        const d = new Date(tx.date)
        return (
          d.getFullYear() === selectedYear && d.getMonth() + 1 === viewMonth
        )
      }),
    [transactions, selectedYear, viewMonth]
  )

  // 支払方法別の集計
  const paymentSummary = useMemo(() => {
    const map = new Map<string, number>()
    for (const pm of paymentMethods) {
      map.set(pm.id, 0)
    }
    for (const tx of monthTxs) {
      const current = map.get(tx.paymentMethodId) ?? 0
      map.set(tx.paymentMethodId, current + tx.amount)
    }
    return map
  }, [monthTxs, paymentMethods])

  // 月全体の合計
  const monthTotal = useMemo(
    () => monthTxs.reduce((sum, tx) => sum + tx.amount, 0),
    [monthTxs]
  )

  // 年間×支払方法別の集計（全月一覧表示用）
  const annualByPayment = useMemo(() => {
    // result[paymentMethodId][month] = amount
    const result: Record<string, Record<number, number>> = {}
    for (const pm of paymentMethods) {
      result[pm.id] = {}
      for (let m = 1; m <= 12; m++) result[pm.id][m] = 0
    }
    for (const tx of transactions) {
      const d = new Date(tx.date)
      if (d.getFullYear() !== selectedYear) continue
      const m = d.getMonth() + 1
      if (result[tx.paymentMethodId]) {
        result[tx.paymentMethodId][m] += tx.amount
      }
    }
    return result
  }, [transactions, selectedYear, paymentMethods])

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-bold text-emerald-800">
        支払管理シート ({selectedYear}年)
      </h2>

      {/* 月選択タブ */}
      <div className="flex flex-wrap gap-1">
        {MONTHS.map((label, i) => {
          const month = i + 1
          const isActive = viewMonth === month
          return (
            <button
              key={month}
              onClick={() => setViewMonth(month)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* 月別詳細テーブル */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-emerald-600 text-white">
              <th className="px-4 py-2 text-left">支払方法</th>
              <th className="px-4 py-2 text-right">金額</th>
              <th className="px-4 py-2 text-center">引落日</th>
              <th className="px-4 py-2 text-left">引落口座</th>
            </tr>
          </thead>
          <tbody>
            {paymentMethods.map((pm) => {
              const amount = paymentSummary.get(pm.id) ?? 0
              return (
                <tr
                  key={pm.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-2 font-medium">{pm.name}</td>
                  <td className="px-4 py-2 text-right font-bold">
                    {amount > 0 ? fmt(amount) : '-'}
                  </td>
                  <td className="px-4 py-2 text-center text-gray-600">
                    {pm.dueDate ? `${pm.dueDate}日` : '-'}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {pm.account ?? '-'}
                  </td>
                </tr>
              )
            })}
            {/* 合計行 */}
            <tr className="bg-emerald-50 font-bold border-t-2 border-emerald-300">
              <td className="px-4 py-2">合計</td>
              <td className="px-4 py-2 text-right text-emerald-800">
                {fmt(monthTotal)}
              </td>
              <td className="px-4 py-2" />
              <td className="px-4 py-2" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* 年間一覧テーブル */}
      <div>
        <h3 className="text-base font-bold text-teal-700 mb-2">
          年間一覧
        </h3>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="text-xs min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="bg-teal-600 text-white">
                <th className="sticky left-0 z-10 bg-teal-600 px-3 py-2 text-left min-w-[100px]">
                  支払方法
                </th>
                {MONTHS.map((m) => (
                  <th key={m} className="px-2 py-2 text-right min-w-[80px]">
                    {m}
                  </th>
                ))}
                <th className="px-2 py-2 text-right min-w-[90px] bg-teal-700">
                  年間合計
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map((pm) => {
                let annualTotal = 0
                return (
                  <tr
                    key={pm.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="sticky left-0 z-10 bg-white px-3 py-1.5 font-medium whitespace-nowrap">
                      {pm.name}
                    </td>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1
                      const amount = annualByPayment[pm.id]?.[month] ?? 0
                      annualTotal += amount
                      return (
                        <td
                          key={month}
                          className={`px-2 py-1.5 text-right ${
                            viewMonth === month ? 'bg-emerald-50 font-bold' : ''
                          }`}
                        >
                          {amount > 0 ? fmt(amount) : '-'}
                        </td>
                      )
                    })}
                    <td className="px-2 py-1.5 text-right bg-gray-50 font-bold">
                      {annualTotal > 0 ? fmt(annualTotal) : '-'}
                    </td>
                  </tr>
                )
              })}
              {/* 月合計行 */}
              <tr className="bg-teal-50 font-bold border-t-2 border-teal-300">
                <td className="sticky left-0 z-10 bg-teal-50 px-3 py-1.5">
                  合計
                </td>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1
                  let total = 0
                  for (const pm of paymentMethods) {
                    total += annualByPayment[pm.id]?.[month] ?? 0
                  }
                  return (
                    <td key={month} className="px-2 py-1.5 text-right">
                      {total > 0 ? fmt(total) : '-'}
                    </td>
                  )
                })}
                <td className="px-2 py-1.5 text-right bg-gray-100">
                  {(() => {
                    let grand = 0
                    for (const pm of paymentMethods) {
                      for (let m = 1; m <= 12; m++) {
                        grand += annualByPayment[pm.id]?.[m] ?? 0
                      }
                    }
                    return grand > 0 ? fmt(grand) : '-'
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
