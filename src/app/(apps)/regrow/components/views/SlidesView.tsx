'use client'

/**
 * スライド資料閲覧ビュー
 * 14スライド構成で表示
 * Phase1: 失客率削除（16→14枚）
 * Phase2: 店舗稼働率のスタッフ平均自動計算
 * Phase3: 累計平均との比較トグル
 * Phase4: 統合グラフの複合グラフ化（棒+折れ線、2軸）
 * Phase5: スライド閲覧モード拡充（スクロール/ページ切替/全画面）
 * Phase6: スタッフフィルタ機能
 */

import React, {useState, useEffect, useCallback, useRef} from 'react'
import {useDataContext} from '../../context/DataContext'
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
import type {StoreName, YearMonth, StaffRecord, SlideViewMode} from '../../types'
import {loadMonthlyData, formatYearMonth} from '../../lib/storage'
import {MOCK_DATA} from '../../lib/mockData'

const TOTAL_SLIDES = 10

// ============================================================
// ヘルパー関数
// ============================================================

/**
 * 店舗の稼働率をスタッフ平均から自動計算
 */
const calculateStoreUtilizationFromStaff = (monthData: any, storeName: StoreName): number => {
  const staffData = monthData?.manualData?.staffManualData?.filter(
    (s: any) => s.storeName === storeName && s.utilizationRate !== null && s.utilizationRate !== undefined
  ) || []
  if (staffData.length === 0) return 0
  const total = staffData.reduce((sum: number, s: any) => sum + (s.utilizationRate || 0), 0)
  return Math.round((total / staffData.length) * 10) / 10
}

/**
 * 指定された月データから店舗の指標値を取得
 */
const getStoreMetricFromMonthlyData = (
  monthData: any,
  storeName: StoreName,
  metric: '客単価' | '稼働率' | '再来率'
): number => {
  if (!monthData) return 0

  if (metric === '客単価') {
    const storeTotal = monthData.importedData?.storeTotals.find((t: any) => t.storeName === storeName)
    return storeTotal?.unitPrice || 0
  } else if (metric === '稼働率') {
    // スタッフ平均から自動計算
    return calculateStoreUtilizationFromStaff(monthData, storeName)
  } else if (metric === '再来率') {
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
  return MOCK_DATA[yearMonth] || loadMonthlyData(yearMonth)
}

/**
 * スタッフの累計平均を算出
 * 当月含む過去全月データからスタッフ指標の平均を計算
 */
const calculateStaffCumulativeAverage = (
  staffName: string,
  storeName: StoreName,
  currentYearMonth: YearMonth,
  metric: 'sales' | 'nominationCount' | 'unitPrice' | 'returnRate' | 'utilizationRate'
): number => {
  const currentYear = currentYearMonth.split('-')[0]
  const currentMonth = parseInt(currentYearMonth.split('-')[1])
  let total = 0
  let count = 0

  for (let m = 1; m <= currentMonth; m++) {
    const ym = `${currentYear}-${String(m).padStart(2, '0')}` as YearMonth
    const monthData = getMonthlyData(ym)
    if (!monthData) continue

    if (metric === 'utilizationRate') {
      const staffManual = monthData.manualData?.staffManualData?.find(
        (s: any) => s.staffName === staffName && s.storeName === storeName
      )
      if (staffManual?.utilizationRate !== null && staffManual?.utilizationRate !== undefined) {
        total += staffManual.utilizationRate
        count++
      }
    } else if (metric === 'returnRate') {
      const staffRecord = monthData.importedData?.staffRecords.find(
        (r: any) => r.staffName === staffName && r.storeName === storeName
      )
      if (staffRecord) {
        total += calculateStaffReturnRate(staffRecord)
        count++
      }
    } else {
      const staffRecord = monthData.importedData?.staffRecords.find(
        (r: any) => r.staffName === staffName && r.storeName === storeName
      )
      if (staffRecord) {
        total += staffRecord[metric] || 0
        count++
      }
    }
  }

  return count > 0 ? Math.round((total / count) * 10) / 10 : 0
}

// ============================================================
// メインコンポーネント
// ============================================================

export const SlidesView = () => {
  const {monthlyData} = useDataContext()

  // グローバルな店舗フィルタ
  const allStores: StoreName[] = ['新潟西店', '三条店', '新潟中央店']
  const [selectedStores, setSelectedStores] = useState<StoreName[]>(allStores)

  // スタッフフィルタ
  const [selectedStaffNames, setSelectedStaffNames] = useState<string[]>([])
  const [isStaffFilterOpen, setIsStaffFilterOpen] = useState(false)

  // 当月/累計平均トグル
  const [showCurrentMonth, setShowCurrentMonth] = useState(true)
  const [showCumulativeAvg, setShowCumulativeAvg] = useState(false)

  // 閲覧モード
  const [viewMode, setViewMode] = useState<SlideViewMode>('scroll')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 選択された店舗のスタッフ一覧
  const availableStaff = monthlyData.importedData?.staffRecords
    .filter((r) => selectedStores.includes(r.storeName))
    .map((r) => ({staffName: r.staffName, storeName: r.storeName})) || []

  // ユニークなスタッフリスト
  const uniqueStaffNames = [...new Set(availableStaff.map((s) => s.staffName))]

  // 店舗チェックボックスの切り替え
  const toggleStore = (storeName: StoreName) => {
    if (selectedStores.includes(storeName)) {
      setSelectedStores(selectedStores.filter((s) => s !== storeName))
    } else {
      setSelectedStores([...selectedStores, storeName])
    }
  }

  // スタッフフィルタの切り替え
  const toggleStaff = (staffName: string) => {
    if (selectedStaffNames.includes(staffName)) {
      setSelectedStaffNames(selectedStaffNames.filter((s) => s !== staffName))
    } else {
      setSelectedStaffNames([...selectedStaffNames, staffName])
    }
  }

  // 全画面トグル
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true))
    } else if (document.fullscreenElement) {
      document.exitFullscreen().then(() => setIsFullscreen(false))
    }
  }, [])

  // 全画面解除の検知
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // ページ切替モードのキーボード対応
  useEffect(() => {
    if (viewMode !== 'pagination') return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        setCurrentSlide((prev) => Math.min(prev + 1, TOTAL_SLIDES - 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setCurrentSlide((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewMode, isFullscreen])

  // 共通props
  const commonProps = {selectedStores, selectedStaffNames}
  const toggleProps = {showCurrentMonth, showCumulativeAvg}

  // スライド配列を定義（10枚構成）
  const slides = [
    <Slide1TitleSlide key="s1" />,
    <Slide2TableOfContents key="s2" />,
    <Slide3OverallSummary key="s3" {...commonProps} />,
    <Slide4MetricComparison key="s4" metric="客単価" {...commonProps} />,
    <Slide5MetricComparison key="s5" metric="稼働率" {...commonProps} />,
    <Slide6MetricComparison key="s6" metric="再来率" {...commonProps} />,
    <Slide7AllMetricsComparison key="s7" {...commonProps} />,
    <Slide8StaffPerformanceTable key="s8" {...commonProps} />,
    <Slide9StaffUtilizationChart key="s9" {...commonProps} {...toggleProps} />,
    <Slide10CustomerVoice key="s10" />,
  ]

  return (
    <div
      ref={containerRef}
      className={`w-full bg-gray-100 ${isFullscreen ? 'overflow-auto' : ''}`}
      style={isFullscreen ? {padding: '0'} : {}}
    >
      {/* コントロールバー（上部） */}
      {!isFullscreen && (
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            {/* モード切替 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700">表示:</span>
              <button
                onClick={() => setViewMode('scroll')}
                className={`px-3 py-1.5 text-sm rounded ${
                  viewMode === 'scroll' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                スクロール
              </button>
              <button
                onClick={() => setViewMode('pagination')}
                className={`px-3 py-1.5 text-sm rounded ${
                  viewMode === 'pagination' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ページ切替
              </button>
            </div>

            {/* 全画面ボタン */}
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded hover:bg-gray-700"
            >
              全画面
            </button>
          </div>
        </div>
      )}

      {/* 全画面中のコントロール */}
      {isFullscreen && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('scroll')}
              className={`px-3 py-1 text-sm rounded ${viewMode === 'scroll' ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              スクロール
            </button>
            <button
              onClick={() => setViewMode('pagination')}
              className={`px-3 py-1 text-sm rounded ${viewMode === 'pagination' ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              ページ切替
            </button>
          </div>
          {viewMode === 'pagination' && (
            <span className="text-sm">
              {currentSlide + 1} / {TOTAL_SLIDES}
            </span>
          )}
          <button onClick={toggleFullscreen} className="px-3 py-1 text-sm bg-red-600 rounded hover:bg-red-500">
            全画面解除 (Esc)
          </button>
        </div>
      )}

      {/* スライドコンテンツ */}
      <div className={`${isFullscreen ? 'pt-12' : 'py-8 pb-24'}`}>
        {viewMode === 'scroll' ? (
          // スクロールモード
          <div className="max-w-6xl mx-auto space-y-8">
            {slides.map((slide, i) => (
              <SlideContainer key={i} slideNumber={i + 1}>
                {slide}
              </SlideContainer>
            ))}
          </div>
        ) : (
          // ページ切替モード
          <div className="max-w-6xl mx-auto">
            <SlideContainer slideNumber={currentSlide + 1}>
              {slides[currentSlide]}
            </SlideContainer>

            {/* ナビゲーション */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
                disabled={currentSlide === 0}
                className="px-4 py-2 bg-white rounded shadow disabled:opacity-50 hover:bg-gray-50"
              >
                前へ
              </button>

              {/* スライド番号インジケータ */}
              <div className="flex gap-1">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-3 h-3 rounded-full ${
                      i === currentSlide ? 'bg-purple-600' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, TOTAL_SLIDES - 1))}
                disabled={currentSlide === TOTAL_SLIDES - 1}
                className="px-4 py-2 bg-white rounded shadow disabled:opacity-50 hover:bg-gray-50"
              >
                次へ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* グローバルフィルタバー（画面下部固定、全画面時は非表示） */}
      {!isFullscreen && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-purple-600 p-3 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-4 flex-wrap">
            {/* 店舗フィルタ */}
            <span className="text-sm font-bold text-gray-700">店舗:</span>
            <div className="flex gap-3 items-center">
              {allStores.map((storeName) => (
                <label key={storeName} className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
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

            <div className="w-px h-6 bg-gray-300" />

            {/* スタッフフィルタ */}
            <div className="relative">
              <button
                onClick={() => setIsStaffFilterOpen(!isStaffFilterOpen)}
                className="text-sm font-bold text-gray-700 flex items-center gap-1 hover:text-purple-600"
              >
                スタッフ: {selectedStaffNames.length === 0 ? '全員' : `${selectedStaffNames.length}名`}
                <span className="text-xs">{isStaffFilterOpen ? '▲' : '▼'}</span>
              </button>
              {isStaffFilterOpen && (
                <div className="absolute bottom-full mb-2 left-0 bg-white border rounded-lg shadow-xl p-3 max-h-60 overflow-y-auto min-w-[200px]">
                  <button
                    onClick={() => setSelectedStaffNames([])}
                    className="text-xs text-purple-600 hover:underline mb-2 block"
                  >
                    全員表示にリセット
                  </button>
                  {uniqueStaffNames.map((name) => (
                    <label key={name} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded text-sm">
                      <input
                        type="checkbox"
                        checked={selectedStaffNames.includes(name)}
                        onChange={() => toggleStaff(name)}
                        className="w-3.5 h-3.5 text-purple-600 rounded"
                      />
                      <span>{name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-300" />

            {/* 当月/累計平均トグル */}
            <span className="text-sm font-bold text-gray-700">表示:</span>
            <label className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
              <input
                type="checkbox"
                checked={showCurrentMonth}
                onChange={(e) => setShowCurrentMonth(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">当月</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
              <input
                type="checkbox"
                checked={showCumulativeAvg}
                onChange={(e) => setShowCumulativeAvg(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">累計平均</span>
            </label>

            {selectedStores.length === 0 && (
              <span className="text-sm text-red-500 font-medium">※ 店舗を選択してください</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// スライドコンテナ
const SlideContainer = ({slideNumber, children}: {slideNumber: number; children: React.ReactNode}) => {
  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden relative" style={{minHeight: '600px'}}>
      <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-sm font-medium z-10">
        {slideNumber} / {TOTAL_SLIDES}
      </div>
      {children}
    </div>
  )
}

// ============================================================
// 共通Props型
// ============================================================

type StoreFilterProps = {
  selectedStores: StoreName[]
  selectedStaffNames: string[]
}

type ToggleProps = {
  showCurrentMonth: boolean
  showCumulativeAvg: boolean
}

// スタッフリストをフィルタリングするヘルパー
const filterStaffList = (
  staffRecords: StaffRecord[],
  selectedStores: StoreName[],
  selectedStaffNames: string[]
): StaffRecord[] => {
  let filtered = staffRecords.filter((s) => selectedStores.includes(s.storeName))
  if (selectedStaffNames.length > 0) {
    filtered = filtered.filter((s) => selectedStaffNames.includes(s.staffName))
  }
  return filtered
}

// ============================================================
// 個別スライドコンポーネント
// ============================================================

const Slide1TitleSlide = () => {
  const {currentYearMonth} = useDataContext()
  const year = currentYearMonth.split('-')[0]
  const month = parseInt(currentYearMonth.split('-')[1])

  return (
    <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 text-white">
      <h1 className="text-5xl font-bold mb-4">月次業績レポート</h1>
      <p className="text-2xl">{year}年{month}月</p>
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
          <span>店舗別業績比較（客単価・稼働率・再来率）</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-red-500">3.</span>
          <span>全指標統合グラフ</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-red-500">4.</span>
          <span>スタッフ別パフォーマンス・稼働率</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-red-500">5.</span>
          <span>お客様の声</span>
        </div>
      </div>
    </div>
  )
}

const Slide3OverallSummary = ({selectedStores}: StoreFilterProps) => {
  const {monthlyData} = useDataContext()
  const stores = monthlyData.importedData?.storeTotals || []
  const storesNames: StoreName[] = ['新潟西店', '三条店', '新潟中央店']
  const filteredStores = storesNames.filter((s) => selectedStores.includes(s))

  // 店舗別の再来率を計算
  const calcStoreReturnRate = (storeName: StoreName): number => {
    const storeRecords = monthlyData.importedData?.staffRecords.filter((r) => r.storeName === storeName) || []
    if (storeRecords.length === 0) return 0
    const totalCustomers = storeRecords.reduce((sum, r) => sum + r.customerCount, 0)
    const totalNewCustomers = storeRecords.reduce((sum, r) => sum + r.newCustomerCount, 0)
    if (totalCustomers === 0) return 0
    return Math.round(((totalCustomers - totalNewCustomers) / totalCustomers) * 100 * 10) / 10
  }

  // 店舗稼働率をスタッフ平均で算出
  const calcStoreUtilization = (storeName: StoreName): number => {
    const staffData = monthlyData.manualData.staffManualData?.filter(
      (s) => s.storeName === storeName && s.utilizationRate !== null && s.utilizationRate !== undefined
    ) || []
    if (staffData.length === 0) return 0
    const total = staffData.reduce((sum, s) => sum + (s.utilizationRate || 0), 0)
    return Math.round((total / staffData.length) * 10) / 10
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
                  <th className="p-2.5 border">稼働率 <span className="text-xs font-normal">※スタッフ平均</span></th>
                  <th className="p-2.5 border">客単価</th>
                  <th className="p-2.5 border">再来率</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map((storeName, i) => {
                  const store = stores.find((s) => s.storeName === storeName)
                  const returnRate = calcStoreReturnRate(storeName)
                  const utilization = calcStoreUtilization(storeName)

                  return (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-2.5 border font-medium">{storeName}</td>
                      <td className="p-2.5 border text-right">¥{(store?.sales || 0).toLocaleString()}</td>
                      <td className="p-2.5 border text-right">{utilization > 0 ? `${utilization}%` : '-'}</td>
                      <td className="p-2.5 border text-right">¥{(store?.unitPrice || 0).toLocaleString()}</td>
                      <td className="p-2.5 border text-right">{returnRate}%</td>
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

// 指標別3店舗年間推移グラフ（スライド4-6）
const MetricComparisonSlide = ({
  metric,
  selectedStores,
}: {
  metric: '客単価' | '稼働率' | '再来率'
  selectedStores: StoreName[]
}) => {
  const {currentYearMonth} = useDataContext()
  const currentYear = currentYearMonth.split('-')[0]

  const data = Array.from({length: 12}, (_, i) => {
    const month = String(i + 1).padStart(2, '0')
    const yearMonth = `${currentYear}-${month}` as YearMonth
    const monthData = getMonthlyData(yearMonth)

    const result: any = {month: `${i + 1}月`}
    selectedStores.forEach((storeName) => {
      result[storeName] = getStoreMetricFromMonthlyData(monthData, storeName, metric)
    })
    return result
  })

  const hasData = data.some((d) =>
    selectedStores.some((store) => {
      const value = d[store]
      return value !== undefined && value !== null && value > 0
    })
  )

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
            <XAxis dataKey="month" style={{fontSize: '14px'}} />
            <YAxis style={{fontSize: '14px'}} />
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

const Slide4MetricComparison = ({metric, selectedStores}: StoreFilterProps & {metric: '客単価' | '稼働率' | '再来率'}) => (
  <MetricComparisonSlide metric={metric} selectedStores={selectedStores} />
)
const Slide5MetricComparison = ({metric, selectedStores}: StoreFilterProps & {metric: '客単価' | '稼働率' | '再来率'}) => (
  <MetricComparisonSlide metric={metric} selectedStores={selectedStores} />
)
const Slide6MetricComparison = ({metric, selectedStores}: StoreFilterProps & {metric: '客単価' | '稼働率' | '再来率'}) => (
  <MetricComparisonSlide metric={metric} selectedStores={selectedStores} />
)

// Phase4: 統合グラフ（ComposedChart: 客単価=Bar左軸円、稼働率/再来率=Line右軸%）
const Slide7AllMetricsComparison = ({selectedStores}: StoreFilterProps) => {
  const {currentYearMonth} = useDataContext()
  const currentYear = currentYearMonth.split('-')[0]
  const metrics: Array<'客単価' | '稼働率' | '再来率'> = ['客単価', '稼働率', '再来率']

  const data = Array.from({length: 12}, (_, i) => {
    const month = String(i + 1).padStart(2, '0')
    const yearMonth = `${currentYear}-${month}` as YearMonth
    const monthData = getMonthlyData(yearMonth)

    const result: any = {month: `${i + 1}月`}
    selectedStores.forEach((storeName) => {
      metrics.forEach((metric) => {
        result[`${storeName}_${metric}`] = getStoreMetricFromMonthlyData(monthData, storeName, metric)
      })
    })
    return result
  })

  const hasData = data.some((d) =>
    selectedStores.some((store) =>
      metrics.some((metric) => {
        const value = d[`${store}_${metric}`]
        return value !== undefined && value !== null && value > 0
      })
    )
  )

  // 店舗の色定義
  const storeColors: Record<StoreName, string> = {
    新潟西店: '#DC3545',
    三条店: '#4285F4',
    新潟中央店: '#34A853',
  }

  // 稼働率/再来率のダッシュパターン
  const metricDash: Record<string, string> = {
    稼働率: '5 5',
    再来率: '10 3',
  }

  return (
    <div className="p-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">全指標 年間推移（統合）</h2>
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
            <XAxis dataKey="month" style={{fontSize: '14px'}} />
            <YAxis yAxisId="left" label={{value: '円', angle: -90, position: 'insideLeft'}} style={{fontSize: '12px'}} />
            <YAxis yAxisId="right" orientation="right" label={{value: '%', angle: 90, position: 'insideRight'}} style={{fontSize: '12px'}} />
            <Tooltip />
            <Legend wrapperStyle={{fontSize: '11px'}} />
            {/* 客単価 = Bar（左軸・円） */}
            {selectedStores.map((storeName) => (
              <Bar
                key={`${storeName}_客単価`}
                yAxisId="left"
                dataKey={`${storeName}_客単価`}
                fill={storeColors[storeName]}
                name={`${storeName} 客単価`}
                opacity={0.6}
              />
            ))}
            {/* 稼働率 = Line（右軸・%） */}
            {selectedStores.map((storeName) => (
              <Line
                key={`${storeName}_稼働率`}
                yAxisId="right"
                type="monotone"
                dataKey={`${storeName}_稼働率`}
                stroke={storeColors[storeName]}
                strokeWidth={2}
                strokeDasharray={metricDash['稼働率']}
                name={`${storeName} 稼働率`}
                dot={{r: 3}}
              />
            ))}
            {/* 再来率 = Line（右軸・%） */}
            {selectedStores.map((storeName) => (
              <Line
                key={`${storeName}_再来率`}
                yAxisId="right"
                type="monotone"
                dataKey={`${storeName}_再来率`}
                stroke={storeColors[storeName]}
                strokeWidth={2}
                strokeDasharray={metricDash['再来率']}
                name={`${storeName} 再来率`}
                dot={{r: 3, strokeWidth: 2, fill: '#fff'}}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      )}
      <div className="mt-4 text-xs text-gray-500 flex gap-6">
        <p>棒グラフ: 客単価（左軸・円）</p>
        <p>破線: 稼働率（右軸・%）</p>
        <p>点線: 再来率（右軸・%）</p>
      </div>
    </div>
  )
}

const Slide8StaffPerformanceTable = ({selectedStores, selectedStaffNames}: StoreFilterProps) => {
  const {monthlyData} = useDataContext()
  const allStaffList = monthlyData.importedData?.staffRecords || []
  const staffList = filterStaffList(allStaffList, selectedStores, selectedStaffNames).slice(0, 15)

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
                const manualData = monthlyData.manualData.staffManualData?.find(
                  (m) => m.staffName === staff.staffName && m.storeName === staff.storeName
                )
                const nominationRate =
                  staff.customerCount > 0 ? ((staff.nominationCount / staff.customerCount) * 100).toFixed(1) : '-'
                const returnRate = calculateStaffReturnRate(staff)
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

// スタッフ稼働率（当月/累計平均はグローバルトグル）
const Slide9StaffUtilizationChart = ({selectedStores, selectedStaffNames, showCurrentMonth, showCumulativeAvg}: StoreFilterProps & ToggleProps) => {
  const {currentYearMonth, availableMonths} = useDataContext()
  const [selectedMonth, setSelectedMonth] = useState<YearMonth>(currentYearMonth)

  const selectedMonthData = getMonthlyData(selectedMonth)

  // スタッフ稼働率データ
  let utilizationData =
    selectedMonthData?.manualData.staffManualData
      ?.filter((u) => u.utilizationRate !== null && u.utilizationRate !== undefined)
      .filter((u) => selectedStores.includes(u.storeName))
      .map((u) => ({
        name: u.staffName,
        ...(showCurrentMonth ? {稼働率: u.utilizationRate || 0} : {}),
        store: u.storeName,
        ...(showCumulativeAvg
          ? {累計平均: calculateStaffCumulativeAverage(u.staffName, u.storeName, selectedMonth, 'utilizationRate')}
          : {}),
      })) || []

  // スタッフフィルタ適用
  if (selectedStaffNames.length > 0) {
    utilizationData = utilizationData.filter((u) => selectedStaffNames.includes(u.name))
  }

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800">スタッフ稼働率</h2>
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
        <div className="flex items-center justify-center" style={{height: '450px'}}>
          <p className="text-gray-500">
            {selectedStores.length === 0 ? '店舗を選択してください' : 'スタッフ稼働率データがありません'}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={utilizationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{fontSize: '12px'}} angle={-45} textAnchor="end" height={100} />
            <YAxis label={{value: '稼働率 (%)', angle: -90, position: 'insideLeft'}} style={{fontSize: '12px'}} />
            <Tooltip />
            <Legend />
            {showCurrentMonth && (
              <Bar dataKey="稼働率" fill="#DC3545" name="当月">
                <LabelList dataKey="稼働率" position="top" style={{fontSize: '11px'}} />
              </Bar>
            )}
            {showCumulativeAvg && <Bar dataKey="累計平均" fill="#87CEEB" name="累計平均" />}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

const Slide10CustomerVoice = () => {
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
