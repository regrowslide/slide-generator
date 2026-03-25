'use client'

import { useState, useMemo } from 'react'
import { calculateStaffPl } from '../lib/mock-data'

type SortKey = 'grossProfit' | 'totalRevenue' | 'totalPayment' | 'grossMarginRate' | 'totalWorkDays'
type FilterType = '全員' | '自社' | '他社'

const formatYen = (value: number) => `¥${value.toLocaleString()}`

type Props = {
  year: number
  month: number
}

const PlTab = ({ year, month }: Props) => {
  const [filter, setFilter] = useState<FilterType>('全員')
  const [sortKey, setSortKey] = useState<SortKey>('grossProfit')
  const [sortAsc, setSortAsc] = useState(false)

  const allPl = useMemo(() => calculateStaffPl(), [])

  const filteredPl = useMemo(() => {
    let data = [...allPl]
    if (filter !== '全員') {
      data = data.filter((s) => s.employmentType === filter)
    }
    data.sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      return sortAsc ? aVal - bVal : bVal - aVal
    })
    return data
  }, [allPl, filter, sortKey, sortAsc])

  // 集計
  const totals = useMemo(() => {
    return filteredPl.reduce(
      (acc, s) => ({
        totalWorkDays: acc.totalWorkDays + s.totalWorkDays,
        totalRevenue: acc.totalRevenue + s.totalRevenue,
        totalPayment: acc.totalPayment + s.totalPayment,
        grossProfit: acc.grossProfit + s.grossProfit,
      }),
      { totalWorkDays: 0, totalRevenue: 0, totalPayment: 0, grossProfit: 0 }
    )
  }, [filteredPl])

  const totalMarginRate =
    totals.totalRevenue > 0
      ? (totals.grossProfit / totals.totalRevenue) * 100
      : 0

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <span className="text-gray-300 ml-0.5">↕</span>
    return <span className="ml-0.5">{sortAsc ? '↑' : '↓'}</span>
  }

  const getMarginColor = (rate: number) => {
    if (rate < 15) return 'text-red-600 bg-red-50'
    if (rate < 20) return 'text-orange-600 bg-orange-50'
    return 'text-gray-700'
  }

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <div className="flex gap-2">
        {(['全員', '自社', '他社'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="text-sm text-gray-400 self-center ml-2">
          {filteredPl.length}名
        </span>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-24">
                  名前
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 py-3 w-16">
                  区分
                </th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 py-3 w-24 hidden sm:table-cell">
                  所属
                </th>
                <th
                  className="text-right text-xs font-medium text-gray-500 px-3 py-3 w-16 cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('totalWorkDays')}
                >
                  稼働数<SortIcon columnKey="totalWorkDays" />
                </th>
                <th
                  className="text-right text-xs font-medium text-gray-500 px-3 py-3 w-24 cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('totalRevenue')}
                >
                  売上<SortIcon columnKey="totalRevenue" />
                </th>
                <th
                  className="text-right text-xs font-medium text-gray-500 px-3 py-3 w-24 cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('totalPayment')}
                >
                  支払<SortIcon columnKey="totalPayment" />
                </th>
                <th
                  className="text-right text-xs font-medium text-gray-500 px-3 py-3 w-24 cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('grossProfit')}
                >
                  粗利<SortIcon columnKey="grossProfit" />
                </th>
                <th
                  className="text-right text-xs font-medium text-gray-500 px-3 py-3 w-20 cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('grossMarginRate')}
                >
                  粗利率<SortIcon columnKey="grossMarginRate" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPl.map((s) => (
                <tr
                  key={s.staffId}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-2.5 text-sm font-medium text-gray-800">
                    {s.staffName}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        s.employmentType === '自社'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.employmentType}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 hidden sm:table-cell">
                    {s.companyName || '-'}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-right text-gray-700">
                    {s.totalWorkDays}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-right text-gray-700">
                    {formatYen(s.totalRevenue)}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-right text-gray-700">
                    {formatYen(s.totalPayment)}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-right font-medium text-gray-800">
                    {formatYen(s.grossProfit)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span
                      className={`text-sm font-bold px-1.5 py-0.5 rounded ${getMarginColor(
                        s.grossMarginRate
                      )}`}
                    >
                      {s.grossMarginRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}

              {/* 集計行 */}
              <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                <td className="px-4 py-3 text-sm text-gray-800">合計</td>
                <td className="px-3 py-3" />
                <td className="px-3 py-3 hidden sm:table-cell" />
                <td className="px-3 py-3 text-sm text-right text-gray-800">
                  {totals.totalWorkDays}
                </td>
                <td className="px-3 py-3 text-sm text-right text-gray-800">
                  {formatYen(totals.totalRevenue)}
                </td>
                <td className="px-3 py-3 text-sm text-right text-gray-800">
                  {formatYen(totals.totalPayment)}
                </td>
                <td className="px-3 py-3 text-sm text-right text-gray-800">
                  {formatYen(totals.grossProfit)}
                </td>
                <td className="px-3 py-3 text-sm text-right">
                  <span className={`font-bold ${getMarginColor(totalMarginRate)}`}>
                    {totalMarginRate.toFixed(1)}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PlTab
