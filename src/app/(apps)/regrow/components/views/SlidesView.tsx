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
  Cell,
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
import type {MonthlyData, StoreName, YearMonth, StaffRecord, SlideViewMode} from '../../types'
import {formatYearMonth} from '../../lib/storage'

const TOTAL_SLIDES = 18

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
 * スタッフの累計平均を算出
 * 当月含む過去全月データからスタッフ指標の平均を計算
 */
const calculateStaffCumulativeAverage = (
  staffName: string,
  storeName: StoreName,
  currentYearMonth: YearMonth,
  metric: 'sales' | 'nominationCount' | 'unitPrice' | 'returnRate' | 'utilizationRate',
  allMonthlyData: Record<YearMonth, MonthlyData>
): number => {
  const currentYear = currentYearMonth.split('-')[0]
  const currentMonth = parseInt(currentYearMonth.split('-')[1])
  let total = 0
  let count = 0

  for (let m = 1; m <= currentMonth; m++) {
    const ym = `${currentYear}-${String(m).padStart(2, '0')}` as YearMonth
    const monthData = allMonthlyData[ym]
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

// 店舗インデックスに基づく動的カラーパレット
const STORE_COLORS = ['#DC3545', '#4285F4', '#34A853', '#FF9800', '#9C27B0', '#00BCD4', '#795548', '#607D8B']

export const SlidesView = () => {
  const {monthlyData, stores: storesMaster} = useDataContext()
  const allStores = storesMaster.map((s) => s.name)

  // グローバルな店舗フィルタ
  const [selectedStores, setSelectedStores] = useState<StoreName[]>(allStores)

  // storesMasterが変わったらselectedStoresを同期
  useEffect(() => {
    setSelectedStores(allStores)
  }, [storesMaster])

  // スタッフフィルタ
  const [selectedStaffNames, setSelectedStaffNames] = useState<string[]>([])
  const [isStaffFilterOpen, setIsStaffFilterOpen] = useState(false)

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
    <Slide9StaffUtilizationChart key="s9" {...commonProps} />,
    <Slide10StaffAchievementTable key="s10" {...commonProps} />,
    <Slide11StaffAchievementChart key="s11" {...commonProps} />,
    <Slide12StoreAchievementTable key="s12" {...commonProps} />,
    <Slide13StoreAchievementChart key="s13" {...commonProps} />,
    <Slide14StaffMomTable1 key="s14" {...commonProps} />,
    <Slide15StaffMomChart1 key="s15" {...commonProps} />,
    <Slide16StaffMomTable2 key="s16" {...commonProps} />,
    <Slide17StaffMomChart2 key="s17" {...commonProps} />,
    <Slide18CustomerVoice key="s18" />,
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
            <div data-guidance="view-mode-toggle" className="flex items-center gap-2">
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
      <div data-guidance="slides-container" className={`${isFullscreen ? 'pt-12' : 'py-8 pb-24'}`}>
        {viewMode === 'scroll' ? (
          // スクロールモード
          <div className="max-w-6xl mx-auto space-y-8">
            {slides.map((slide, i) => (
              <SlideContainer key={i} slideNumber={i + 1} isFullscreen={isFullscreen}>
                {slide}
              </SlideContainer>
            ))}
          </div>
        ) : (
          // ページ切替モード
          <div className={`max-w-6xl mx-auto ${isFullscreen ? 'flex items-center justify-center min-h-[calc(100vh-48px)]' : ''}`}>
            <div className={`w-full ${isFullscreen ? 'pb-16' : ''}`}>
              <SlideContainer slideNumber={currentSlide + 1} isFullscreen={isFullscreen}>
                {slides[currentSlide]}
              </SlideContainer>
            </div>

            {/* ナビゲーション */}
            <div className={`flex items-center justify-center gap-4 ${isFullscreen ? 'fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur py-3 shadow-lg' : 'mt-4'}`}>
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
        <div data-guidance="filter-bar" className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-purple-600 p-3 z-50">
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
const SlideContainer = ({slideNumber, children, isFullscreen = false}: {slideNumber: number; children: React.ReactNode; isFullscreen?: boolean}) => {
  return (
    <div
      className="bg-white shadow-xl rounded-lg overflow-hidden relative"
      style={isFullscreen ? {height: 'calc(100vh - 48px)'} : {minHeight: '600px'}}
    >
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
      <p className="text-lg mt-8">Relaxation Salon SAMPLE</p>
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
          <span>売上目標達成率（スタッフ別・店舗別）</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-red-500">6.</span>
          <span>スタッフ別先月比（売上金額/指名件数・再来率/客単価）</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-red-500">7.</span>
          <span>お客様の声</span>
        </div>
      </div>
    </div>
  )
}

const Slide3OverallSummary = ({selectedStores}: StoreFilterProps) => {
  const {monthlyData} = useDataContext()
  const stores = monthlyData.importedData?.storeTotals || []
  const filteredStores = selectedStores

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
  const {currentYearMonth, allMonthlyData} = useDataContext()
  const currentYear = currentYearMonth.split('-')[0]

  const data = Array.from({length: 12}, (_, i) => {
    const month = String(i + 1).padStart(2, '0')
    const yearMonth = `${currentYear}-${month}` as YearMonth
    const monthData = allMonthlyData[yearMonth]

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
          <p className="text-gray-500 text-lg">データがありません</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" style={{fontSize: '14px'}} />
            <YAxis style={{fontSize: '14px'}} />
            <Tooltip />
            <Legend />
            {selectedStores.map((storeName, i) => (
              <Line key={storeName} type="monotone" dataKey={storeName} stroke={STORE_COLORS[i % STORE_COLORS.length]} strokeWidth={2} name={storeName} />
            ))}
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
  const {currentYearMonth, allMonthlyData} = useDataContext()
  const currentYear = currentYearMonth.split('-')[0]
  const metrics: Array<'客単価' | '稼働率' | '再来率'> = ['客単価', '稼働率', '再来率']

  const data = Array.from({length: 12}, (_, i) => {
    const month = String(i + 1).padStart(2, '0')
    const yearMonth = `${currentYear}-${month}` as YearMonth
    const monthData = allMonthlyData[yearMonth]

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

  // 店舗の色定義（動的）
  const storeColors: Record<string, string> = {}
  selectedStores.forEach((name, i) => {
    storeColors[name] = STORE_COLORS[i % STORE_COLORS.length]
  })

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
          <p className="text-gray-500 text-lg">データがありません</p>
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

/**
 * グラフ内チェックボックス（当月/累計平均）
 */
const ChartToggle = ({
  showCurrent,
  showCumulative,
  onCurrentChange,
  onCumulativeChange,
}: {
  showCurrent: boolean
  showCumulative: boolean
  onCurrentChange: (v: boolean) => void
  onCumulativeChange: (v: boolean) => void
}) => (
  <div className="flex items-center gap-4">
    <label className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
      <input
        type="checkbox"
        checked={showCurrent}
        onChange={(e) => onCurrentChange(e.target.checked)}
        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
      />
      <span className="text-sm font-medium text-gray-700">当月</span>
    </label>
    <label className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
      <input
        type="checkbox"
        checked={showCumulative}
        onChange={(e) => onCumulativeChange(e.target.checked)}
        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
      />
      <span className="text-sm font-medium text-gray-700">累計平均</span>
    </label>
  </div>
)

// スタッフ稼働率（各グラフ内にローカルトグル）
const Slide9StaffUtilizationChart = ({selectedStores, selectedStaffNames}: StoreFilterProps) => {
  const {currentYearMonth, availableMonths, allMonthlyData} = useDataContext()
  const [selectedMonth, setSelectedMonth] = useState<YearMonth>(currentYearMonth)
  const [showCurrent, setShowCurrent] = useState(true)
  const [showCumulative, setShowCumulative] = useState(false)

  const selectedMonthData = allMonthlyData[selectedMonth]

  // スタッフ稼働率データ
  let utilizationData =
    selectedMonthData?.manualData.staffManualData
      ?.filter((u) => u.utilizationRate !== null && u.utilizationRate !== undefined)
      .filter((u) => selectedStores.includes(u.storeName))
      .map((u) => ({
        name: u.staffName,
        ...(showCurrent ? {当月: u.utilizationRate || 0} : {}),
        store: u.storeName,
        ...(showCumulative
          ? {累計平均: calculateStaffCumulativeAverage(u.staffName, u.storeName, selectedMonth, 'utilizationRate', allMonthlyData)}
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
        <div className="flex items-center gap-4">
          <ChartToggle
            showCurrent={showCurrent}
            showCumulative={showCumulative}
            onCurrentChange={setShowCurrent}
            onCumulativeChange={setShowCumulative}
          />
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
            {showCurrent && (
              <Bar dataKey="当月" fill="#DC3545" name="当月">
                <LabelList dataKey="当月" position="top" style={{fontSize: '11px'}} />
              </Bar>
            )}
            {showCumulative && <Bar dataKey="累計平均" fill="#87CEEB" name="累計平均" />}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ============================================================
// 達成率データ構築ヘルパー
// ============================================================

type StaffAchievementRow = {
  staffName: string
  storeName: string
  targetSales: number
  actualSales: number
  diff: number
  achievementRate: number
}

type StoreAchievementRow = {
  storeName: string
  targetTotal: number
  actualTotal: number
  diff: number
  achievementRate: number
}

const achievementColorClass = (rate: number) =>
  rate >= 100 ? 'bg-green-100 text-green-700' : rate >= 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'

const achievementBarColor = (rate: number) =>
  rate >= 100 ? '#34A853' : rate >= 80 ? '#FFA500' : '#DC3545'

const buildStaffAchievementData = (
  monthlyData: MonthlyData,
  selectedStores: StoreName[],
  selectedStaffNames: string[]
): StaffAchievementRow[] => {
  const allStaffList = monthlyData.importedData?.staffRecords || []
  const filteredStaff = filterStaffList(allStaffList, selectedStores, selectedStaffNames)
  return filteredStaff
    .map((staff) => {
      const manualData = monthlyData.manualData.staffManualData?.find(
        (m) => m.staffName === staff.staffName && m.storeName === staff.storeName
      )
      const target = manualData?.targetSales
      if (!target || target <= 0) return null
      return {
        staffName: staff.staffName,
        storeName: staff.storeName,
        targetSales: target,
        actualSales: staff.sales,
        diff: staff.sales - target,
        achievementRate: Math.round((staff.sales / target) * 100),
      }
    })
    .filter(Boolean) as StaffAchievementRow[]
}

const buildStoreAchievementData = (
  monthlyData: MonthlyData,
  selectedStores: StoreName[]
): StoreAchievementRow[] => {
  return selectedStores
    .map((storeName) => {
      const storeRecords = monthlyData.importedData?.staffRecords.filter((r) => r.storeName === storeName) || []
      const totalActual = storeRecords.reduce((sum, r) => sum + r.sales, 0)
      const storeManualData = monthlyData.manualData.staffManualData?.filter((m) => m.storeName === storeName) || []
      const totalTarget = storeManualData.reduce((sum, m) => sum + (m.targetSales ?? 0), 0)
      if (totalTarget <= 0) return null
      return {
        storeName,
        targetTotal: totalTarget,
        actualTotal: totalActual,
        diff: totalActual - totalTarget,
        achievementRate: Math.round((totalActual / totalTarget) * 100),
      }
    })
    .filter(Boolean) as StoreAchievementRow[]
}

const AchievementLegend = () => (
  <div className="mt-4 flex gap-4 text-xs text-gray-500">
    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-600 inline-block" /> 100%以上</span>
    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500 inline-block" /> 80-99%</span>
    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600 inline-block" /> 80%未満</span>
    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-500 inline-block" /> 達成率ライン</span>
  </div>
)

// ============================================================
// スライド10: スタッフ別売上達成率（テーブル）
// ============================================================

const Slide10StaffAchievementTable = ({selectedStores, selectedStaffNames}: StoreFilterProps) => {
  const {monthlyData} = useDataContext()
  const rows = buildStaffAchievementData(monthlyData, selectedStores, selectedStaffNames)
  const hasStaff = (monthlyData.importedData?.staffRecords || []).length > 0

  return (
    <div className="h-full p-8 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">スタッフ別 売上目標達成率</h2>
      {rows.length === 0 ? (
        <div className="flex items-center justify-center" style={{height: '400px'}}>
          <p className="text-gray-500 text-lg">
            {!hasStaff ? 'スタッフデータがありません' : '目標売上が未入力です（目標売上タブで入力してください）'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="p-2.5 border">スタッフ</th>
                <th className="p-2.5 border">店舗</th>
                <th className="p-2.5 border">目標売上</th>
                <th className="p-2.5 border">実績売上</th>
                <th className="p-2.5 border">差額</th>
                <th className="p-2.5 border">達成率</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-2.5 border font-medium">{row.staffName}</td>
                  <td className="p-2.5 border text-xs">{row.storeName}</td>
                  <td className="p-2.5 border text-right">¥{row.targetSales.toLocaleString()}</td>
                  <td className="p-2.5 border text-right">¥{row.actualSales.toLocaleString()}</td>
                  <td className="p-2.5 border text-right">
                    <span className={row.diff >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {row.diff >= 0 ? '+' : ''}¥{row.diff.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-2.5 border text-right">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${achievementColorClass(row.achievementRate)}`}>
                      {row.achievementRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ============================================================
// スライド11: スタッフ別売上達成率（グラフ）
// 横棒: 目標vs実績（2本並び）+ 達成率ライン
// ============================================================

const Slide11StaffAchievementChart = ({selectedStores, selectedStaffNames}: StoreFilterProps) => {
  const {monthlyData} = useDataContext()
  const rows = buildStaffAchievementData(monthlyData, selectedStores, selectedStaffNames)
  const hasStaff = (monthlyData.importedData?.staffRecords || []).length > 0

  const chartData = rows.map((row) => ({
    name: row.staffName,
    目標売上: row.targetSales,
    実績売上: row.actualSales,
    達成率: row.achievementRate,
  }))

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">スタッフ別 売上目標達成率</h2>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center" style={{height: '450px'}}>
          <p className="text-gray-500 text-lg">
            {!hasStaff ? 'スタッフデータがありません' : '目標売上が未入力です（目標売上タブで入力してください）'}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(chartData.length * 50 + 80, 300)}>
          <ComposedChart data={chartData} layout="vertical" margin={{left: 20, right: 60}}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis xAxisId="sales" type="number" orientation="bottom" style={{fontSize: '11px'}}
              tickFormatter={(v: number) => `¥${(v / 10000).toFixed(0)}万`}
            />
            <XAxis xAxisId="rate" type="number" orientation="top" domain={[0, (max: number) => Math.max(max, 130)]} unit="%" style={{fontSize: '11px'}} hide />
            <YAxis dataKey="name" type="category" width={80} style={{fontSize: '12px'}} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === '達成率') return [`${value}%`, name]
                return [`¥${value.toLocaleString()}`, name]
              }}
            />
            <Legend wrapperStyle={{fontSize: '12px'}} />
            <Bar xAxisId="sales" dataKey="目標売上" fill="#94A3B8" name="目標売上" barSize={16} />
            <Bar xAxisId="sales" dataKey="実績売上" name="実績売上" barSize={16}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={achievementBarColor(entry.達成率)} />
              ))}
            </Bar>
            <Line xAxisId="rate" dataKey="達成率" stroke="#6366F1" strokeWidth={2} name="達成率" dot={{r: 5, fill: '#6366F1'}} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
      <AchievementLegend />
    </div>
  )
}

// ============================================================
// スライド12: 店舗別売上達成率（テーブル）
// ============================================================

const Slide12StoreAchievementTable = ({selectedStores}: StoreFilterProps) => {
  const {monthlyData} = useDataContext()
  const rows = buildStoreAchievementData(monthlyData, selectedStores)

  return (
    <div className="h-full p-8 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">店舗別 売上目標達成率</h2>
      {rows.length === 0 ? (
        <div className="flex items-center justify-center" style={{height: '400px'}}>
          <p className="text-gray-500 text-lg">
            {selectedStores.length === 0 ? '店舗を選択してください' : '目標売上が未入力です（目標売上タブで入力してください）'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="p-2.5 border">店舗</th>
                <th className="p-2.5 border">目標合計</th>
                <th className="p-2.5 border">実績合計</th>
                <th className="p-2.5 border">差額</th>
                <th className="p-2.5 border">達成率</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-2.5 border font-medium">{row.storeName}</td>
                  <td className="p-2.5 border text-right">¥{row.targetTotal.toLocaleString()}</td>
                  <td className="p-2.5 border text-right">¥{row.actualTotal.toLocaleString()}</td>
                  <td className="p-2.5 border text-right">
                    <span className={row.diff >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {row.diff >= 0 ? '+' : ''}¥{row.diff.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-2.5 border text-right">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${achievementColorClass(row.achievementRate)}`}>
                      {row.achievementRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ============================================================
// スライド13: 店舗別売上達成率（グラフ）
// 横棒: 目標vs実績（2本並び）+ 達成率ライン
// ============================================================

const Slide13StoreAchievementChart = ({selectedStores}: StoreFilterProps) => {
  const {monthlyData} = useDataContext()
  const rows = buildStoreAchievementData(monthlyData, selectedStores)

  const chartData = rows.map((row) => ({
    name: row.storeName,
    目標売上: row.targetTotal,
    実績売上: row.actualTotal,
    達成率: row.achievementRate,
  }))

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">店舗別 売上目標達成率</h2>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center" style={{height: '450px'}}>
          <p className="text-gray-500 text-lg">
            {selectedStores.length === 0 ? '店舗を選択してください' : '目標売上が未入力です（目標売上タブで入力してください）'}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(chartData.length * 70 + 80, 250)}>
          <ComposedChart data={chartData} layout="vertical" margin={{left: 20, right: 60}}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis xAxisId="sales" type="number" orientation="bottom" style={{fontSize: '11px'}}
              tickFormatter={(v: number) => `¥${(v / 10000).toFixed(0)}万`}
            />
            <XAxis xAxisId="rate" type="number" orientation="top" domain={[0, (max: number) => Math.max(max, 130)]} unit="%" style={{fontSize: '11px'}} hide />
            <YAxis dataKey="name" type="category" width={100} style={{fontSize: '14px', fontWeight: 'bold'}} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === '達成率') return [`${value}%`, name]
                return [`¥${value.toLocaleString()}`, name]
              }}
            />
            <Legend wrapperStyle={{fontSize: '12px'}} />
            <Bar xAxisId="sales" dataKey="目標売上" fill="#94A3B8" name="目標売上" barSize={22} />
            <Bar xAxisId="sales" dataKey="実績売上" name="実績売上" barSize={22}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={achievementBarColor(entry.達成率)} />
              ))}
            </Bar>
            <Line xAxisId="rate" dataKey="達成率" stroke="#6366F1" strokeWidth={2} name="達成率" dot={{r: 6, fill: '#6366F1'}} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
      <AchievementLegend />
    </div>
  )
}

// ============================================================
// スタッフ別先月比 共通ヘルパー
// ============================================================

/**
 * 先月比テーブル・グラフ用のスタッフデータを生成
 * 当月値と累計平均値の両方を返す
 */
const buildStaffMomData = (
  currentYearMonth: YearMonth,
  monthlyData: any,
  selectedStores: StoreName[],
  selectedStaffNames: string[],
  allMonthlyData: Record<YearMonth, MonthlyData>
) => {
  const currentStaff = monthlyData.importedData?.staffRecords || []
  const filtered = filterStaffList(currentStaff, selectedStores, selectedStaffNames)

  return filtered.map((staff) => {
    const cumSales = calculateStaffCumulativeAverage(staff.staffName, staff.storeName, currentYearMonth, 'sales', allMonthlyData)
    const cumNomination = calculateStaffCumulativeAverage(staff.staffName, staff.storeName, currentYearMonth, 'nominationCount', allMonthlyData)
    const cumUnitPrice = calculateStaffCumulativeAverage(staff.staffName, staff.storeName, currentYearMonth, 'unitPrice', allMonthlyData)
    const cumReturnRate = calculateStaffCumulativeAverage(staff.staffName, staff.storeName, currentYearMonth, 'returnRate', allMonthlyData)

    return {
      staffName: staff.staffName,
      storeName: staff.storeName,
      // 当月
      currentSales: staff.sales,
      currentNomination: staff.nominationCount,
      currentUnitPrice: staff.unitPrice,
      currentReturnRate: Number(calculateStaffReturnRate(staff).toFixed(1)),
      // 累計平均
      cumSales: Math.round(cumSales),
      cumNomination: Math.round(cumNomination),
      cumUnitPrice: Math.round(cumUnitPrice),
      cumReturnRate: Number(cumReturnRate.toFixed(1)),
    }
  })
}

/** 差分セルの色付け */
const DiffCell = ({value, prefix = '', suffix = ''}: {value: number; prefix?: string; suffix?: string}) => {
  const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-500'
  const sign = value > 0 ? '+' : ''
  return <span className={`font-medium ${color}`}>{sign}{prefix}{value.toLocaleString()}{suffix}</span>
}

// ============================================================
// スライド14: スタッフ別先月比① テーブル（売上金額/指名件数）
// ============================================================

const Slide14StaffMomTable1 = ({selectedStores, selectedStaffNames}: StoreFilterProps) => {
  const {monthlyData, currentYearMonth, allMonthlyData} = useDataContext()
  const rows = buildStaffMomData(currentYearMonth, monthlyData, selectedStores, selectedStaffNames, allMonthlyData)

  return (
    <div className="h-full p-8 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        スタッフ別先月比①（売上金額/指名件数）
      </h2>
      {rows.length === 0 ? (
        <div className="flex items-center justify-center" style={{height: '400px'}}>
          <p className="text-gray-500 text-lg">スタッフデータがありません</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="p-2 border">スタッフ</th>
                <th className="p-2 border">店舗</th>
                <th className="p-2 border">売上_当月</th>
                <th className="p-2 border">売上_累計平均</th>
                <th className="p-2 border">売上_差分</th>
                <th className="p-2 border">指名_当月</th>
                <th className="p-2 border">指名_累計平均</th>
                <th className="p-2 border">指名_差分</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-2 border font-medium">{row.staffName}</td>
                  <td className="p-2 border text-xs">{row.storeName}</td>
                  <td className="p-2 border text-right">¥{row.currentSales.toLocaleString()}</td>
                  <td className="p-2 border text-right">¥{row.cumSales.toLocaleString()}</td>
                  <td className="p-2 border text-right"><DiffCell value={row.currentSales - row.cumSales} prefix="¥" /></td>
                  <td className="p-2 border text-right">{row.currentNomination}</td>
                  <td className="p-2 border text-right">{row.cumNomination}</td>
                  <td className="p-2 border text-right"><DiffCell value={row.currentNomination - row.cumNomination} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ============================================================
// スライド15: スタッフ別先月比① グラフ（売上金額/指名件数）
// ============================================================

const Slide15StaffMomChart1 = ({selectedStores, selectedStaffNames}: StoreFilterProps) => {
  const {monthlyData, currentYearMonth, allMonthlyData} = useDataContext()
  const [showCurrent, setShowCurrent] = useState(true)
  const [showCumulative, setShowCumulative] = useState(false)
  const rows = buildStaffMomData(currentYearMonth, monthlyData, selectedStores, selectedStaffNames, allMonthlyData)

  const chartData = rows.map((row) => ({
    name: row.staffName,
    ...(showCurrent ? {'売上（当月）': row.currentSales, '指名（当月）': row.currentNomination} : {}),
    ...(showCumulative ? {'売上（累計平均）': row.cumSales, '指名（累計平均）': row.cumNomination} : {}),
  }))

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">スタッフ別先月比グラフ①（売上金額/指名件数）</h2>
        <ChartToggle showCurrent={showCurrent} showCumulative={showCumulative} onCurrentChange={setShowCurrent} onCumulativeChange={setShowCumulative} />
      </div>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center" style={{height: '450px'}}>
          <p className="text-gray-500 text-lg">スタッフデータがありません</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={480}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{fontSize: '11px'}} angle={-30} textAnchor="end" height={80} />
            <YAxis yAxisId="left" label={{value: '売上金額', angle: -90, position: 'insideLeft'}} style={{fontSize: '11px'}} />
            <YAxis yAxisId="right" orientation="right" label={{value: '指名件数', angle: 90, position: 'insideRight'}} style={{fontSize: '11px'}} />
            <Tooltip formatter={(value: number, name: string) => {
              if (name.includes('売上')) return [`¥${value.toLocaleString()}`, name]
              return [value, name]
            }} />
            <Legend wrapperStyle={{fontSize: '12px'}} />
            {showCurrent && <Bar yAxisId="left" dataKey="売上（当月）" fill="#DC3545" barSize={20} />}
            {showCumulative && <Bar yAxisId="left" dataKey="売上（累計平均）" fill="#F4A460" barSize={20} />}
            {showCurrent && <Line yAxisId="right" type="monotone" dataKey="指名（当月）" stroke="#1a3a5c" strokeWidth={2} dot={{r: 4}} />}
            {showCumulative && <Line yAxisId="right" type="monotone" dataKey="指名（累計平均）" stroke="#87CEEB" strokeWidth={2} dot={{r: 4, fill: '#fff'}} />}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ============================================================
// スライド16: スタッフ別先月比② テーブル（再来率/客単価）
// ============================================================

const Slide16StaffMomTable2 = ({selectedStores, selectedStaffNames}: StoreFilterProps) => {
  const {monthlyData, currentYearMonth, allMonthlyData} = useDataContext()
  const rows = buildStaffMomData(currentYearMonth, monthlyData, selectedStores, selectedStaffNames, allMonthlyData)

  return (
    <div className="h-full p-8 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        スタッフ別先月比②（再来率/客単価）
      </h2>
      {rows.length === 0 ? (
        <div className="flex items-center justify-center" style={{height: '400px'}}>
          <p className="text-gray-500 text-lg">スタッフデータがありません</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="p-2 border">スタッフ</th>
                <th className="p-2 border">店舗</th>
                <th className="p-2 border">再来率_当月</th>
                <th className="p-2 border">再来率_累計平均</th>
                <th className="p-2 border">再来率_差分</th>
                <th className="p-2 border">客単価_当月</th>
                <th className="p-2 border">客単価_累計平均</th>
                <th className="p-2 border">客単価_差分</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-2 border font-medium">{row.staffName}</td>
                  <td className="p-2 border text-xs">{row.storeName}</td>
                  <td className="p-2 border text-right">{row.currentReturnRate}%</td>
                  <td className="p-2 border text-right">{row.cumReturnRate}%</td>
                  <td className="p-2 border text-right"><DiffCell value={Number((row.currentReturnRate - row.cumReturnRate).toFixed(1))} suffix="%" /></td>
                  <td className="p-2 border text-right">¥{row.currentUnitPrice.toLocaleString()}</td>
                  <td className="p-2 border text-right">¥{row.cumUnitPrice.toLocaleString()}</td>
                  <td className="p-2 border text-right"><DiffCell value={row.currentUnitPrice - row.cumUnitPrice} prefix="¥" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ============================================================
// スライド17: スタッフ別先月比② グラフ（再来率/客単価）
// ============================================================

const Slide17StaffMomChart2 = ({selectedStores, selectedStaffNames}: StoreFilterProps) => {
  const {monthlyData, currentYearMonth, allMonthlyData} = useDataContext()
  const [showCurrent, setShowCurrent] = useState(true)
  const [showCumulative, setShowCumulative] = useState(false)
  const rows = buildStaffMomData(currentYearMonth, monthlyData, selectedStores, selectedStaffNames, allMonthlyData)

  const chartData = rows.map((row) => ({
    name: row.staffName,
    ...(showCurrent ? {'客単価（当月）': row.currentUnitPrice, '再来率（当月）': row.currentReturnRate} : {}),
    ...(showCumulative ? {'客単価（累計平均）': row.cumUnitPrice, '再来率（累計平均）': row.cumReturnRate} : {}),
  }))

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">スタッフ別先月比グラフ②（再来率/客単価）</h2>
        <ChartToggle showCurrent={showCurrent} showCumulative={showCumulative} onCurrentChange={setShowCurrent} onCumulativeChange={setShowCumulative} />
      </div>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center" style={{height: '450px'}}>
          <p className="text-gray-500 text-lg">スタッフデータがありません</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={480}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{fontSize: '11px'}} angle={-30} textAnchor="end" height={80} />
            <YAxis yAxisId="left" label={{value: '客単価', angle: -90, position: 'insideLeft'}} style={{fontSize: '11px'}} />
            <YAxis yAxisId="right" orientation="right" label={{value: '再来率（%）', angle: 90, position: 'insideRight'}} style={{fontSize: '11px'}} />
            <Tooltip formatter={(value: number, name: string) => {
              if (name.includes('客単価')) return [`¥${value.toLocaleString()}`, name]
              return [`${value}%`, name]
            }} />
            <Legend wrapperStyle={{fontSize: '12px'}} />
            {showCurrent && <Bar yAxisId="left" dataKey="客単価（当月）" fill="#DC3545" barSize={20} />}
            {showCumulative && <Bar yAxisId="left" dataKey="客単価（累計平均）" fill="#F4A460" barSize={20} />}
            {showCurrent && <Line yAxisId="right" type="monotone" dataKey="再来率（当月）" stroke="#1a3a5c" strokeWidth={2} dot={{r: 4}} />}
            {showCumulative && <Line yAxisId="right" type="monotone" dataKey="再来率（累計平均）" stroke="#87CEEB" strokeWidth={2} dot={{r: 4, fill: '#fff'}} />}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ============================================================
// スライド18: お客様の声
// ============================================================

const Slide18CustomerVoice = () => {
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
