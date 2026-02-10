'use client'

/**
 * スライド資料閲覧ビュー
 * 15スライド構成で表示
 */

import React, { useState } from 'react'
import { useDataContext } from '../../context/DataContext'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  ComposedChart,
  Line,
} from 'recharts'
import type { StoreName, YearMonth, StaffRecord } from '../../types'
import { loadMonthlyData, getPreviousMonth, formatYearMonth } from '../../lib/storage'
import { MOCK_DATA } from '../../lib/mockData'

const TOTAL_SLIDES = 16

// ============================================================
// ヘルパー関数
// ============================================================

/**
 * 指定された月データから店舗の指標値を取得
 */
const getStoreMetricFromMonthlyData = (
  monthData: any,
  storeName: StoreName,
  metric: '客単価' | '稼働率' | '再来率' | '失客率'
): number => {
  if (!monthData) return 0

  if (metric === '客単価') {
    const storeTotal = monthData.importedData?.storeTotals.find((t: any) => t.storeName === storeName)
    return storeTotal?.unitPrice || 0
  } else if (metric === '稼働率' || metric === '失客率') {
    const storeKpi = monthData.manualData.storeKpis?.find((k: any) => k.storeName === storeName)
    return metric === '稼働率' ? storeKpi?.utilizationRate || 0 : storeKpi?.churnRate || 0
  } else if (metric === '再来率') {
    // 再来率を計算
    const storeRecords = monthData.importedData?.staffRecords.filter((r: any) => r.storeName === storeName) || []
    if (storeRecords.length === 0) return 0
    const totalCustomers = storeRecords.reduce((sum: number, r: any) => sum + r.customerCount, 0)
    const totalNewCustomers = storeRecords.reduce((sum: number, r: any) => sum + r.newCustomerCount, 0)
    if (totalCustomers === 0) return 0
    const returningCustomers = totalCustomers - totalNewCustomers
    return Math.round((returningCustomers / totalCustomers) * 100 * 10) / 10
  }

  return 0
}

/**
 * スタッフレコードから再来率を計算
 */
const calculateStaffReturnRate = (staff: StaffRecord): number => {
  if (staff.customerCount === 0) return 0
  const returningCustomers = staff.customerCount - staff.newCustomerCount
  return Number(((returningCustomers / staff.customerCount) * 100).toFixed(1))
}

/**
 * 月次データを取得（モックデータ優先）
 */
const getMonthlyData = (yearMonth: YearMonth) => {
  // モックデータを優先的に使用
  return MOCK_DATA[yearMonth] || loadMonthlyData(yearMonth)
}

export const SlidesView = () => {
  // グローバルな店舗フィルタ状態
  const allStores: StoreName[] = ['新潟西店', '三条店', '新潟中央店']
  const [selectedStores, setSelectedStores] = useState<StoreName[]>(allStores)

  // 店舗チェックボックスの切り替え
  const toggleStore = (storeName: StoreName) => {
    if (selectedStores.includes(storeName)) {
      setSelectedStores(selectedStores.filter((s) => s !== storeName))
    } else {
      setSelectedStores([...selectedStores, storeName])
    }
  }

  return (
    <div className="w-full bg-gray-100 py-8 pb-24">
      {/* グローバル店舗フィルタ（画面下部固定） */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-purple-600 p-4 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-4">
          <span className="text-sm font-bold text-gray-700">店舗フィルタ:</span>
          <div className="flex gap-4 items-center">
            {allStores.map((storeName) => (
              <label key={storeName} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedStores.includes(storeName)}
                  onChange={() => toggleStore(storeName)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">{storeName}</span>
              </label>
            ))}
          </div>
          {selectedStores.length === 0 && (
            <span className="text-sm text-red-500 font-medium">※ 店舗を選択してください</span>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* スライド1 */}
        <SlideContainer slideNumber={1}>
          <Slide1TitleSlide />
        </SlideContainer>

        {/* スライド2 */}
        <SlideContainer slideNumber={2}>
          <Slide2TableOfContents />
        </SlideContainer>

        {/* スライド3 */}
        <SlideContainer slideNumber={3}>
          <Slide3OverallSummary selectedStores={selectedStores} />
        </SlideContainer>

        {/* スライド4-7: 指標別比較 */}
        <SlideContainer slideNumber={4}>
          <Slide4MetricComparison metric="客単価" selectedStores={selectedStores} />
        </SlideContainer>

        <SlideContainer slideNumber={5}>
          <Slide5MetricComparison metric="稼働率" selectedStores={selectedStores} />
        </SlideContainer>

        <SlideContainer slideNumber={6}>
          <Slide6MetricComparison metric="再来率" selectedStores={selectedStores} />
        </SlideContainer>

        <SlideContainer slideNumber={7}>
          <Slide7MetricComparison metric="失客率" selectedStores={selectedStores} />
        </SlideContainer>

        {/* スライド8: 全指標統合 */}
        <SlideContainer slideNumber={8}>
          <Slide7_1AllMetricsComparison selectedStores={selectedStores} />
        </SlideContainer>

        {/* スライド9 */}
        <SlideContainer slideNumber={9}>
          <Slide8StaffPerformanceTable selectedStores={selectedStores} />
        </SlideContainer>

        {/* スライド10 */}
        <SlideContainer slideNumber={10}>
          <Slide9StaffUtilizationChart selectedStores={selectedStores} />
        </SlideContainer>

        {/* スライド11-14: 先月比 */}
        <SlideContainer slideNumber={11}>
          <Slide10PreviousMonthComparison1Table selectedStores={selectedStores} />
        </SlideContainer>

        <SlideContainer slideNumber={12}>
          <Slide11PreviousMonthComparison1Chart selectedStores={selectedStores} />
        </SlideContainer>

        <SlideContainer slideNumber={13}>
          <Slide12PreviousMonthComparison2Table selectedStores={selectedStores} />
        </SlideContainer>

        <SlideContainer slideNumber={14}>
          <Slide13PreviousMonthComparison2Chart selectedStores={selectedStores} />
        </SlideContainer>

        {/* スライド15 */}
        <SlideContainer slideNumber={15}>
          <Slide14Spare />
        </SlideContainer>

        {/* スライド16 */}
        <SlideContainer slideNumber={16}>
          <Slide15CustomerVoice />
        </SlideContainer>
      </div>
    </div>
  )
}

// スライドコンテナ（最小高さのみ設定、縦幅は自動調整）
const SlideContainer = ({ slideNumber, children }: { slideNumber: number; children: React.ReactNode }) => {
  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden relative" style={{ minHeight: '600px' }}>
      <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-sm font-medium z-10">
        {slideNumber} / {TOTAL_SLIDES}
      </div>
      {children}
    </div>
  )
}

// ============================================================
// 個別スライドコンポーネント
// ============================================================

const Slide1TitleSlide = () => {
  return (
    <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 text-white">
      <h1 className="text-5xl font-bold mb-4">月次業績レポート</h1>
      <p className="text-2xl">2026年2月</p>
      <p className="text-lg mt-8">asian relaxation villa</p>
    </div>
  )
}

const Slide2TableOfContents = () => {
  return (
    <div className="h-full p-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">目次</h2>
      <div className="space-y-4 text-lg">
        <div className="flex items-center gap-3">
          <span className="font-bold text-red-500">1.</span>
          <span>全体サマリー</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-red-500">2.</span>
          <span>店舗別業績比較（客単価・稼働率・再来率・失客率）</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-red-500">3.</span>
          <span>スタッフ別パフォーマンス</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-red-500">4.</span>
          <span>先月比分析</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-red-500">5.</span>
          <span>お客様の声</span>
        </div>
      </div>
    </div>
  )
}

const Slide3OverallSummary = ({ selectedStores }: { selectedStores: StoreName[] }) => {
  const { monthlyData } = useDataContext()
  const stores = monthlyData.importedData?.storeTotals || []
  const storesNames: StoreName[] = ['新潟西店', '三条店', '新潟中央店']

  // 選択された店舗でフィルタリング
  const filteredStores = storesNames.filter((s) => selectedStores.includes(s))

  // 店舗別の再来率を計算する関数
  const calculateStoreReturnRate = (storeName: StoreName): number => {
    const storeRecords = monthlyData.importedData?.staffRecords.filter((r) => r.storeName === storeName) || []
    if (storeRecords.length === 0) return 0
    const totalCustomers = storeRecords.reduce((sum, r) => sum + r.customerCount, 0)
    const totalNewCustomers = storeRecords.reduce((sum, r) => sum + r.newCustomerCount, 0)
    if (totalCustomers === 0) return 0
    const returningCustomers = totalCustomers - totalNewCustomers
    return Math.round((returningCustomers / totalCustomers) * 100 * 10) / 10
  }

  return (
    <div className="h-full p-8 overflow-y-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">全体サマリー</h2>
      {filteredStores.length === 0 ? (
        <div className="flex items-center justify-center" style={{height: '400px'}}>
          <p className="text-gray-500 text-lg">店舗を選択してください</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="p-2.5 border">店舗</th>
                  <th className="p-2.5 border">売上</th>
                  <th className="p-2.5 border">稼働率</th>
                  <th className="p-2.5 border">客単価</th>
                  <th className="p-2.5 border">再来率</th>
                  <th className="p-2.5 border">失客率</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map((storeName, i) => {
                  const store = stores.find((s) => s.storeName === storeName)
                  const kpi = monthlyData.manualData.storeKpis?.find((k) => k.storeName === storeName)
                  const returnRate = calculateStoreReturnRate(storeName)

                  return (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-2.5 border font-medium">{storeName}</td>
                      <td className="p-2.5 border text-right">¥{(store?.sales || 0).toLocaleString()}</td>
                      <td className="p-2.5 border text-right">
                        {kpi?.utilizationRate !== null && kpi?.utilizationRate !== undefined
                          ? `${kpi.utilizationRate}%`
                          : '-'}
                      </td>
                      <td className="p-2.5 border text-right">¥{(store?.unitPrice || 0).toLocaleString()}</td>
                      <td className="p-2.5 border text-right">{returnRate}%</td>
                      <td className="p-2.5 border text-right">
                        {kpi?.churnRate !== null && kpi?.churnRate !== undefined ? `${kpi.churnRate}%` : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 店舗別コメント表示 */}
          <div className="mt-6 space-y-4">
            {filteredStores.map((storeName) => {
              const kpi = monthlyData.manualData.storeKpis?.find((k) => k.storeName === storeName)
              return kpi?.comment ? (
                <div key={storeName} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2 text-blue-900">【{storeName}】</h3>
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{kpi.comment}</p>
                </div>
              ) : null
            })}
          </div>
        </>
      )}
    </div>
  )
}

// 指標別3店舗年間推移グラフ（スライド4-7）
const Slide4MetricComparison = ({
  metric,
  selectedStores,
}: {
  metric: '客単価' | '稼働率' | '再来率' | '失客率'
  selectedStores: StoreName[]
}) => {
  const { currentYearMonth } = useDataContext()

  // 現在の年を取得
  const currentYear = currentYearMonth.split('-')[0]

  // 1-12月のデータを全て取得
  const data = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0')
    const yearMonth = `${currentYear}-${month}` as YearMonth
    const monthData = getMonthlyData(yearMonth)

    const result: any = {
      month: `${i + 1}月`,
    }

    // 選択された店舗のみ指標値を取得
    selectedStores.forEach((storeName) => {
      const value = getStoreMetricFromMonthlyData(monthData, storeName, metric)
      result[storeName] = value

      // デバッグ用（最初の月のみ）
      if (i === 0 && value) {
        console.log(`[${metric}] 1月 ${storeName}: ${value}`)
      }
    })

    return result
  })

  // 全データが0かどうか確認
  const hasData = data.some((d) => selectedStores.some((store) => {
    const value = d[store]
    return value !== undefined && value !== null && value > 0
  }))

  // デバッグ用：最初の月のデータをログ出力
  if (data.length > 0 && selectedStores.length > 0) {
    console.log(`[${metric}] 1月のデータ:`, data[0], 'hasData:', hasData)
  }


  return (
    <div className="p-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">{metric} - 年間推移</h2>
      {selectedStores.length === 0 ? (
        <div className="flex items-center justify-center" style={{height: '500px'}}>
          <p className="text-gray-500 text-lg">店舗を選択してください</p>
        </div>
      ) : !hasData ? (
        <div className="flex items-center justify-center" style={{height: '500px'}}>
          <p className="text-gray-500 text-lg">データがありません。モックデータを読み込んでください。</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" style={{ fontSize: '14px' }} />
            <YAxis style={{ fontSize: '14px' }} />
            <Tooltip />
            <Legend />
            {selectedStores.includes('新潟西店') && (
              <Line type="monotone" dataKey="新潟西店" stroke="#DC3545" strokeWidth={2} name="新潟西店" />
            )}
            {selectedStores.includes('三条店') && (
              <Line type="monotone" dataKey="三条店" stroke="#4285F4" strokeWidth={2} name="三条店" />
            )}
            {selectedStores.includes('新潟中央店') && (
              <Line type="monotone" dataKey="新潟中央店" stroke="#34A853" strokeWidth={2} name="新潟中央店" />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

const Slide5MetricComparison = ({
  metric,
  selectedStores,
}: {
  metric: '客単価' | '稼働率' | '再来率' | '失客率'
  selectedStores: StoreName[]
}) => <Slide4MetricComparison metric={metric} selectedStores={selectedStores} />
const Slide6MetricComparison = ({
  metric,
  selectedStores,
}: {
  metric: '客単価' | '稼働率' | '再来率' | '失客率'
  selectedStores: StoreName[]
}) => <Slide4MetricComparison metric={metric} selectedStores={selectedStores} />
const Slide7MetricComparison = ({
  metric,
  selectedStores,
}: {
  metric: '客単価' | '稼働率' | '再来率' | '失客率'
  selectedStores: StoreName[]
}) => <Slide4MetricComparison metric={metric} selectedStores={selectedStores} />

const Slide7_1AllMetricsComparison = ({ selectedStores }: { selectedStores: StoreName[] }) => {
  const { currentYearMonth } = useDataContext()

  // 現在の年を取得
  const currentYear = currentYearMonth.split('-')[0]
  const metrics: Array<'客単価' | '稼働率' | '再来率' | '失客率'> = ['客単価', '稼働率', '再来率', '失客率']

  // 各店舗の各指標の年間データを取得
  const data = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0')
    const yearMonth = `${currentYear}-${month}` as YearMonth
    const monthData = getMonthlyData(yearMonth)

    const result: any = {
      month: `${i + 1}月`,
    }

    // 選択された店舗のみ、各指標を取得
    selectedStores.forEach((storeName) => {
      metrics.forEach((metric) => {
        const value = getStoreMetricFromMonthlyData(monthData, storeName, metric)
        // 店舗名_指標名の形式でキーを作成
        result[`${storeName}_${metric}`] = value
      })
    })

    return result
  })

  // データが存在するか確認
  const hasData = data.some((d) =>
    selectedStores.some((store) =>
      metrics.some((metric) => {
        const key = `${store}_${metric}`
        const value = d[key]
        return value !== undefined && value !== null && value > 0
      })
    )
  )

  // 各指標の色定義
  const metricColors: Record<string, string> = {
    客単価: '#DC3545', // 赤
    稼働率: '#4285F4', // 青
    再来率: '#34A853', // 緑
    失客率: '#FFA500', // オレンジ
  }

  return (
    <div className="p-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">全指標 年間推移（統合）</h2>
      {selectedStores.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: '500px' }}>
          <p className="text-gray-500 text-lg">店舗を選択してください</p>
        </div>
      ) : !hasData ? (
        <div className="flex items-center justify-center" style={{ height: '500px' }}>
          <p className="text-gray-500 text-lg">データがありません。モックデータを読み込んでください。</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" style={{ fontSize: '14px' }} />
            <YAxis style={{ fontSize: '14px' }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {/* 選択された店舗 × 4指標のLineを全て描画 */}
            {selectedStores.map((storeName) =>
              metrics.map((metric) => {
                const dataKey = `${storeName}_${metric}`
                const color = metricColors[metric]
                return (
                  <Line
                    key={dataKey}
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={2}
                    name={`${storeName} - ${metric}`}
                    dot={{ r: 3 }}
                  />
                )
              })
            )}
          </ComposedChart>
        </ResponsiveContainer>
      )}
      <div className="mt-4 text-xs text-gray-500">
        <p>※ 各指標の単位は異なります（客単価: 円、稼働率/再来率/失客率: %）</p>
      </div>
    </div>
  )
}

const Slide8StaffPerformanceTable = ({ selectedStores }: { selectedStores: StoreName[] }) => {
  const { monthlyData } = useDataContext()
  const allStaffList = monthlyData.importedData?.staffRecords || []

  // 選択された店舗のスタッフでフィルタリング
  const staffList = allStaffList.filter((s) => selectedStores.includes(s.storeName)).slice(0, 10)

  return (
    <div className="h-full p-8 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">スタッフ別パフォーマンス</h2>
      {staffList.length === 0 ? (
        <div className="flex items-center justify-center" style={{height: '400px'}}>
          <p className="text-gray-500 text-lg">選択した店舗にスタッフデータがありません</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="p-1.5 border">名前</th>
                <th className="p-1.5 border">店舗</th>
                <th className="p-1.5 border">売上</th>
                <th className="p-1.5 border">稼働率</th>
                <th className="p-1.5 border">対応客数</th>
                <th className="p-1.5 border">指名数</th>
                <th className="p-1.5 border">指名割合</th>
                <th className="p-1.5 border">客単価</th>
                <th className="p-1.5 border">再来率</th>
                <th className="p-1.5 border">CS登録率</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff, i) => {
                // 手動入力データを取得
                const manualData = monthlyData.manualData.staffManualData?.find(
                  (m) => m.staffName === staff.staffName && m.storeName === staff.storeName
                )

                // 指名割合を計算
                const nominationRate =
                  staff.customerCount > 0
                    ? ((staff.nominationCount / staff.customerCount) * 100).toFixed(1)
                    : '-'

                // 再来率を計算
                const returnRate = calculateStaffReturnRate(staff)

                // CS登録率を計算
                const csRate =
                  staff.customerCount > 0 && manualData?.csRegistrationCount
                    ? (((manualData.csRegistrationCount || 0) / staff.customerCount) * 100).toFixed(1)
                    : '-'

                return (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-1.5 border font-medium">{staff.staffName}</td>
                    <td className="p-1.5 border text-xs">{staff.storeName}</td>
                    <td className="p-1.5 border text-right">¥{staff.sales.toLocaleString()}</td>
                    <td className="p-1.5 border text-right">
                      {manualData?.utilizationRate !== null && manualData?.utilizationRate !== undefined
                        ? `${manualData.utilizationRate}%`
                        : '-'}
                    </td>
                    <td className="p-1.5 border text-right">{staff.customerCount}</td>
                    <td className="p-1.5 border text-right">{staff.nominationCount}</td>
                    <td className="p-1.5 border text-right">{nominationRate !== '-' ? `${nominationRate}%` : '-'}</td>
                    <td className="p-1.5 border text-right">¥{staff.unitPrice.toLocaleString()}</td>
                    <td className="p-1.5 border text-right">{returnRate}%</td>
                    <td className="p-1.5 border text-right">{csRate !== '-' ? `${csRate}%` : '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// スタッフ稼働率縦棒グラフ（スライド9）
const Slide9StaffUtilizationChart = ({ selectedStores }: { selectedStores: StoreName[] }) => {
  const { currentYearMonth, availableMonths } = useDataContext()
  const [selectedMonth, setSelectedMonth] = useState<YearMonth>(currentYearMonth)

  // 選択された月のデータを取得
  const selectedMonthData = getMonthlyData(selectedMonth)

  // スタッフ稼働率データ準備（選択された店舗のみ）
  const utilizationData =
    selectedMonthData?.manualData.staffManualData
      ?.filter((u) => u.utilizationRate !== null && u.utilizationRate !== undefined)
      .filter((u) => selectedStores.includes(u.storeName))
      .map((u) => ({
        name: u.staffName,
        稼働率: u.utilizationRate || 0,
        store: u.storeName,
      })) || []

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">スタッフ稼働率</h2>
        {/* スライド内月選択UI */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value as YearMonth)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {availableMonths.map((month) => (
            <option key={month} value={month}>
              {formatYearMonth(month)}
            </option>
          ))}
        </select>
      </div>
      {utilizationData.length === 0 ? (
        <div className="flex items-center justify-center" style={{height: '500px'}}>
          <p className="text-gray-500">
            {selectedStores.length === 0 ? '店舗を選択してください' : 'スタッフ稼働率データがありません'}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={utilizationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={100} />
            <YAxis label={{ value: '稼働率 (%)', angle: -90, position: 'insideLeft' }} style={{ fontSize: '12px' }} />
            <Tooltip />
            <Bar dataKey="稼働率" fill="#DC3545">
              <LabelList dataKey="稼働率" position="top" style={{ fontSize: '11px' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

const Slide10PreviousMonthComparison1Table = ({ selectedStores }: { selectedStores: StoreName[] }) => {
  const { monthlyData, currentYearMonth } = useDataContext()
  const previousMonth = getPreviousMonth(currentYearMonth)
  const previousMonthData = getMonthlyData(previousMonth)

  const allStaffList = monthlyData.importedData?.staffRecords || []
  // 選択された店舗のスタッフでフィルタリング
  const staffList = allStaffList.filter((s) => selectedStores.includes(s.storeName))

  return (
    <div className="h-full p-8 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">スタッフ別先月比①（売上金額/指名件数）</h2>
      {!previousMonthData ? (
        <div className="flex items-center justify-center" style={{height: '400px'}}>
          <p className="text-gray-500 text-lg">前月データがありません</p>
        </div>
      ) : staffList.length === 0 ? (
        <div className="flex items-center justify-center" style={{height: '400px'}}>
          <p className="text-gray-500 text-lg">選択した店舗にスタッフデータがありません</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="p-1.5 border">スタッフ</th>
                <th className="p-1.5 border">店舗</th>
                <th className="p-1.5 border">売上_今月</th>
                <th className="p-1.5 border">売上_先月</th>
                <th className="p-1.5 border">売上_差分</th>
                <th className="p-1.5 border">指名_今月</th>
                <th className="p-1.5 border">指名_先月</th>
                <th className="p-1.5 border">指名_差分</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff, i) => {
                const prevStaff = previousMonthData.importedData?.staffRecords.find(
                  (s) => s.staffName === staff.staffName && s.storeName === staff.storeName
                )
                const salesDiff = staff.sales - (prevStaff?.sales || 0)
                const nominationDiff = staff.nominationCount - (prevStaff?.nominationCount || 0)

                return (
                  <tr key={`${staff.staffName}-${staff.storeName}-${i}`} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-1.5 border font-medium">{staff.staffName}</td>
                    <td className="p-1.5 border text-xs">{staff.storeName}</td>
                    <td className="p-1.5 border text-right">¥{staff.sales.toLocaleString()}</td>
                    <td className="p-1.5 border text-right">¥{(prevStaff?.sales || 0).toLocaleString()}</td>
                    <td
                      className={`p-1.5 border text-right font-semibold ${salesDiff >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                      {salesDiff >= 0 ? '+' : ''}¥{salesDiff.toLocaleString()}
                    </td>
                    <td className="p-1.5 border text-right">{staff.nominationCount}</td>
                    <td className="p-1.5 border text-right">{prevStaff?.nominationCount || 0}</td>
                    <td
                      className={`p-1.5 border text-right font-semibold ${nominationDiff >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                      {nominationDiff >= 0 ? '+' : ''}
                      {nominationDiff}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const Slide11PreviousMonthComparison1Chart = ({ selectedStores }: { selectedStores: StoreName[] }) => {
  const { monthlyData, currentYearMonth } = useDataContext()
  const previousMonth = getPreviousMonth(currentYearMonth)
  const previousMonthData = getMonthlyData(previousMonth)

  // 選択された店舗のスタッフのみフィルタリング
  const allStaffList = monthlyData.importedData?.staffRecords || []
  const filteredStaffList =
    selectedStores.length > 0
      ? allStaffList.filter((staff) => selectedStores.includes(staff.storeName)).slice(0, 8)
      : []

  const data = filteredStaffList.map((staff) => {
    const prevStaff = previousMonthData?.importedData?.staffRecords.find(
      (s) => s.staffName === staff.staffName && s.storeName === staff.storeName
    )
    return {
      name: staff.staffName,
      売上_今月: staff.sales,
      売上_先月: prevStaff?.sales || 0,
      指名_今月: staff.nominationCount,
      指名_先月: prevStaff?.nominationCount || 0,
    }
  })

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">スタッフ別先月比グラフ①（売上金額/指名件数）</h2>

      {!previousMonthData ? (
        <div className="flex items-center justify-center" style={{height: '500px'}}>
          <p className="text-gray-500 text-lg">前月データがありません</p>
        </div>
      ) : selectedStores.length === 0 ? (
        <div className="flex items-center justify-center" style={{height: '500px'}}>
          <p className="text-gray-500 text-lg">店舗を選択してください</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} style={{ fontSize: '11px' }} />
            <YAxis yAxisId="left" label={{ value: '売上金額', angle: -90, position: 'insideLeft' }} style={{ fontSize: '11px' }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: '指名件数', angle: 90, position: 'insideRight' }}
              style={{ fontSize: '11px' }}
            />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="売上_今月" fill="#DC3545" name="売上（今月）" />
            <Bar yAxisId="left" dataKey="売上_先月" fill="#FFA07A" name="売上（先月）" />
            <Line yAxisId="right" type="monotone" dataKey="指名_今月" stroke="#4285F4" strokeWidth={2} name="指名（今月）" />
            <Line yAxisId="right" type="monotone" dataKey="指名_先月" stroke="#87CEEB" strokeWidth={2} name="指名（先月）" />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

const Slide12PreviousMonthComparison2Table = ({ selectedStores }: { selectedStores: StoreName[] }) => {
  const { monthlyData, currentYearMonth } = useDataContext()
  const previousMonth = getPreviousMonth(currentYearMonth)
  const previousMonthData = getMonthlyData(previousMonth)

  const allStaffList = monthlyData.importedData?.staffRecords || []
  // 選択された店舗のスタッフでフィルタリング
  const staffList = allStaffList.filter((s) => selectedStores.includes(s.storeName))

  return (
    <div className="h-full p-8 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">スタッフ別先月比②（再来率/客単価）</h2>
      {!previousMonthData ? (
        <div className="flex items-center justify-center" style={{height: '400px'}}>
          <p className="text-gray-500 text-lg">前月データがありません</p>
        </div>
      ) : staffList.length === 0 ? (
        <div className="flex items-center justify-center" style={{height: '400px'}}>
          <p className="text-gray-500 text-lg">選択した店舗にスタッフデータがありません</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="p-1.5 border">スタッフ</th>
                <th className="p-1.5 border">店舗</th>
                <th className="p-1.5 border">再来率_今月</th>
                <th className="p-1.5 border">再来率_先月</th>
                <th className="p-1.5 border">再来率_差分</th>
                <th className="p-1.5 border">客単価_今月</th>
                <th className="p-1.5 border">客単価_先月</th>
                <th className="p-1.5 border">客単価_差分</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff, i) => {
                const prevStaff = previousMonthData.importedData?.staffRecords.find(
                  (s) => s.staffName === staff.staffName && s.storeName === staff.storeName
                )
                const returnRateCurrent = calculateStaffReturnRate(staff)
                const returnRatePrev = prevStaff ? calculateStaffReturnRate(prevStaff) : 0
                const returnRateDiff = returnRateCurrent - returnRatePrev
                const unitPriceDiff = staff.unitPrice - (prevStaff?.unitPrice || 0)

                return (
                  <tr key={`${staff.staffName}-${staff.storeName}-${i}`} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-1.5 border font-medium">{staff.staffName}</td>
                    <td className="p-1.5 border text-xs">{staff.storeName}</td>
                    <td className="p-1.5 border text-right">{returnRateCurrent}%</td>
                    <td className="p-1.5 border text-right">{returnRatePrev}%</td>
                    <td
                      className={`p-1.5 border text-right font-semibold ${returnRateDiff >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                      {returnRateDiff >= 0 ? '+' : ''}
                      {returnRateDiff.toFixed(1)}%
                    </td>
                    <td className="p-1.5 border text-right">¥{staff.unitPrice.toLocaleString()}</td>
                    <td className="p-1.5 border text-right">¥{(prevStaff?.unitPrice || 0).toLocaleString()}</td>
                    <td
                      className={`p-1.5 border text-right font-semibold ${unitPriceDiff >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                      {unitPriceDiff >= 0 ? '+' : ''}¥{unitPriceDiff.toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const Slide13PreviousMonthComparison2Chart = ({ selectedStores }: { selectedStores: StoreName[] }) => {
  const { monthlyData, currentYearMonth } = useDataContext()
  const previousMonth = getPreviousMonth(currentYearMonth)
  const previousMonthData = getMonthlyData(previousMonth)

  // 選択された店舗のスタッフのみフィルタリング
  const allStaffList = monthlyData.importedData?.staffRecords || []
  const filteredStaffList =
    selectedStores.length > 0
      ? allStaffList.filter((staff) => selectedStores.includes(staff.storeName)).slice(0, 8)
      : []

  const data = filteredStaffList.map((staff) => {
    const prevStaff = previousMonthData?.importedData?.staffRecords.find(
      (s) => s.staffName === staff.staffName && s.storeName === staff.storeName
    )
    const returnRateCurrent = calculateStaffReturnRate(staff)
    const returnRatePrev = prevStaff ? calculateStaffReturnRate(prevStaff) : 0

    return {
      name: staff.staffName,
      客単価_今月: staff.unitPrice,
      客単価_先月: prevStaff?.unitPrice || 0,
      再来率_今月: returnRateCurrent,
      再来率_先月: returnRatePrev,
    }
  })

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">スタッフ別先月比グラフ②（再来率/客単価）</h2>

      {!previousMonthData ? (
        <div className="flex items-center justify-center" style={{height: '500px'}}>
          <p className="text-gray-500 text-lg">前月データがありません</p>
        </div>
      ) : selectedStores.length === 0 ? (
        <div className="flex items-center justify-center" style={{height: '500px'}}>
          <p className="text-gray-500 text-lg">店舗を選択してください</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} style={{ fontSize: '11px' }} />
            <YAxis yAxisId="left" label={{ value: '客単価', angle: -90, position: 'insideLeft' }} style={{ fontSize: '11px' }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: '再来率(%)', angle: 90, position: 'insideRight' }}
              style={{ fontSize: '11px' }}
            />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="客単価_今月" fill="#DC3545" name="客単価（今月）" />
            <Bar yAxisId="left" dataKey="客単価_先月" fill="#FFA07A" name="客単価（先月）" />
            <Line yAxisId="right" type="monotone" dataKey="再来率_今月" stroke="#4285F4" strokeWidth={2} name="再来率（今月）" />
            <Line yAxisId="right" type="monotone" dataKey="再来率_先月" stroke="#87CEEB" strokeWidth={2} name="再来率（先月）" />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

const Slide14Spare = () => {
  return (
    <div className="h-full p-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">予備ページ</h2>
      <p className="text-gray-500">このページは予備用です</p>
    </div>
  )
}

const Slide15CustomerVoice = () => {
  const { monthlyData } = useDataContext()
  const customerVoice = monthlyData.manualData.customerVoice.content

  return (
    <div className="h-full p-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">お客様の声</h2>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 h-4/5 overflow-y-auto">
        {customerVoice ? (
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{customerVoice}</p>
        ) : (
          <p className="text-gray-400 italic">お客様の声がまだ登録されていません</p>
        )}
      </div>
    </div>
  )
}
