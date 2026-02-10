'use client'

/**
 * スライド資料閲覧ビュー
 * 15スライド構成で表示
 */

import React from 'react'
import {useDataContext} from '../../context/DataContext'
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList} from 'recharts'
import type {StoreName} from '../../types'

const TOTAL_SLIDES = 15

export const SlidesView = () => {
  return (
    <div className="w-full bg-gray-100 py-8">
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
          <Slide3OverallSummary />
        </SlideContainer>

        {/* スライド4-7: 指標別比較 */}
        <SlideContainer slideNumber={4}>
          <Slide4MetricComparison metric="客単価" />
        </SlideContainer>

        <SlideContainer slideNumber={5}>
          <Slide5MetricComparison metric="稼働率" />
        </SlideContainer>

        <SlideContainer slideNumber={6}>
          <Slide6MetricComparison metric="再来率" />
        </SlideContainer>

        <SlideContainer slideNumber={7}>
          <Slide7MetricComparison metric="失客率" />
        </SlideContainer>

        {/* スライド8 */}
        <SlideContainer slideNumber={8}>
          <Slide8StaffPerformanceTable />
        </SlideContainer>

        {/* スライド9 */}
        <SlideContainer slideNumber={9}>
          <Slide9StaffUtilizationChart />
        </SlideContainer>

        {/* スライド10-13: 先月比 */}
        <SlideContainer slideNumber={10}>
          <Slide10PreviousMonthComparison1Table />
        </SlideContainer>

        <SlideContainer slideNumber={11}>
          <Slide11PreviousMonthComparison1Chart />
        </SlideContainer>

        <SlideContainer slideNumber={12}>
          <Slide12PreviousMonthComparison2Table />
        </SlideContainer>

        <SlideContainer slideNumber={13}>
          <Slide13PreviousMonthComparison2Chart />
        </SlideContainer>

        {/* スライド14 */}
        <SlideContainer slideNumber={14}>
          <Slide14Spare />
        </SlideContainer>

        {/* スライド15 */}
        <SlideContainer slideNumber={15}>
          <Slide15CustomerVoice />
        </SlideContainer>
      </div>
    </div>
  )
}

// スライドコンテナ（16:9アスペクト比を維持）
const SlideContainer = ({slideNumber, children}: {slideNumber: number; children: React.ReactNode}) => {
  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden relative" style={{aspectRatio: '16/9'}}>
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
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 text-white">
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

const Slide3OverallSummary = () => {
  const {monthlyData} = useDataContext()
  const stores = monthlyData.importedData?.storeTotals || []

  return (
    <div className="h-full p-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">全体サマリー</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="p-3 border">店舗</th>
              <th className="p-3 border">売上合計</th>
              <th className="p-3 border">客数</th>
              <th className="p-3 border">客単価</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="p-3 border font-medium">{store.storeName}</td>
                <td className="p-3 border text-right">¥{store.sales.toLocaleString()}</td>
                <td className="p-3 border text-right">{store.customerCount}</td>
                <td className="p-3 border text-right">¥{store.unitPrice.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// 指標別3店舗比較グラフ（スライド4-7）
const Slide4MetricComparison = ({metric}: {metric: string}) => {
  const {monthlyData} = useDataContext()

  // 実際のデータを取得
  const stores: StoreName[] = ['新潟西店', '三条店', '新潟中央店']

  // 店舗の再来率を計算する関数
  const calculateStoreReturnRate = (storeName: StoreName): number => {
    const storeRecords = monthlyData.importedData?.staffRecords.filter((r) => r.storeName === storeName) || []
    if (storeRecords.length === 0) return 0
    const totalCustomers = storeRecords.reduce((sum, r) => sum + r.customerCount, 0)
    const totalNewCustomers = storeRecords.reduce((sum, r) => sum + r.newCustomerCount, 0)
    if (totalCustomers === 0) return 0
    const returningCustomers = totalCustomers - totalNewCustomers
    return Math.round((returningCustomers / totalCustomers) * 100 * 10) / 10
  }

  const data = stores.map((storeName) => {
    let value = 0

    if (metric === '客単価') {
      // storeTotalsから客単価を取得
      const storeTotal = monthlyData.importedData?.storeTotals.find((t) => t.storeName === storeName)
      value = storeTotal?.unitPrice || 0
    } else if (metric === '稼働率' || metric === '失客率') {
      // manualDataから取得
      const storeKpi = monthlyData.manualData.storeKpis?.find((k) => k.storeName === storeName)
      if (metric === '稼働率') {
        value = storeKpi?.utilizationRate || 0
      } else if (metric === '失客率') {
        value = storeKpi?.churnRate || 0
      }
    } else if (metric === '再来率') {
      // 自動計算
      value = calculateStoreReturnRate(storeName)
    }

    return {store: storeName, value}
  })

  return (
    <div className="h-full p-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">{metric} - 店舗比較</h2>
      {data.every((d) => d.value === 0) ? (
        <div className="flex items-center justify-center h-3/4">
          <p className="text-gray-500 text-lg">データがありません。手動入力ページで入力してください。</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="70%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="store" style={{fontSize: '14px'}} />
            <YAxis style={{fontSize: '14px'}} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#DC3545" name={metric}>
              <LabelList dataKey="value" position="top" style={{fontSize: '14px', fontWeight: 'bold'}} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

const Slide5MetricComparison = ({metric}: {metric: string}) => <Slide4MetricComparison metric={metric} />
const Slide6MetricComparison = ({metric}: {metric: string}) => <Slide4MetricComparison metric={metric} />
const Slide7MetricComparison = ({metric}: {metric: string}) => <Slide4MetricComparison metric={metric} />

const Slide8StaffPerformanceTable = () => {
  const {monthlyData} = useDataContext()
  const staffList = monthlyData.importedData?.staffRecords.slice(0, 10) || []

  return (
    <div className="h-full p-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">スタッフ別パフォーマンス</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="p-2 border">順位</th>
              <th className="p-2 border">名前</th>
              <th className="p-2 border">店舗</th>
              <th className="p-2 border">売上</th>
              <th className="p-2 border">客数</th>
              <th className="p-2 border">指名数</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="p-2 border text-center">{staff.rank}</td>
                <td className="p-2 border font-medium">{staff.staffName}</td>
                <td className="p-2 border text-sm">{staff.storeName}</td>
                <td className="p-2 border text-right">¥{staff.sales.toLocaleString()}</td>
                <td className="p-2 border text-right">{staff.customerCount}</td>
                <td className="p-2 border text-right">{staff.nominationCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// スタッフ稼働率縦棒グラフ（スライド9）
const Slide9StaffUtilizationChart = () => {
  const {monthlyData} = useDataContext()

  // スタッフ稼働率データ準備
  const utilizationData =
    monthlyData.manualData.staffManualData?.map((u) => ({
      name: u.staffName,
      稼働率: u.utilizationRate || 0,
      store: u.storeName,
    })) || []

  // 店舗ごとに色を分ける
  const getBarColor = (storeName: string) => {
    if (storeName === '新潟西店') return '#DC3545'
    if (storeName === '三条店') return '#4285F4'
    if (storeName === '新潟中央店') return '#34A853'
    return '#999'
  }

  return (
    <div className="h-full p-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">スタッフ稼働率</h2>
      {utilizationData.length === 0 ? (
        <p className="text-gray-500">スタッフ稼働率データがありません</p>
      ) : (
        <ResponsiveContainer width="100%" height="70%">
          <BarChart data={utilizationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{fontSize: '12px'}} angle={-45} textAnchor="end" height={100} />
            <YAxis label={{value: '稼働率 (%)', angle: -90, position: 'insideLeft'}} style={{fontSize: '12px'}} />
            <Tooltip />
            <Bar dataKey="稼働率" fill="#DC3545">
              <LabelList dataKey="稼働率" position="top" style={{fontSize: '11px'}} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

const Slide10PreviousMonthComparison1Table = () => {
  return (
    <div className="h-full p-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">先月比①（テーブル）</h2>
      <p className="text-gray-500">先月比データは未実装です（今後追加予定）</p>
    </div>
  )
}

const Slide11PreviousMonthComparison1Chart = () => {
  return (
    <div className="h-full p-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">先月比①（グラフ）</h2>
      <p className="text-gray-500">先月比グラフは未実装です（今後追加予定）</p>
    </div>
  )
}

const Slide12PreviousMonthComparison2Table = () => {
  return (
    <div className="h-full p-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">先月比②（テーブル）</h2>
      <p className="text-gray-500">先月比データは未実装です（今後追加予定）</p>
    </div>
  )
}

const Slide13PreviousMonthComparison2Chart = () => {
  return (
    <div className="h-full p-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">先月比②（グラフ）</h2>
      <p className="text-gray-500">先月比グラフは未実装です（今後追加予定）</p>
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
  const {monthlyData} = useDataContext()
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
