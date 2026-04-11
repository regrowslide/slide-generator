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

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useDataContext } from '../../context/DataContext'
import { arr__sortByKey } from '@cm/class/ArrHandler/array-utils/sorting'
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
import type { MonthlyData, StoreName, YearMonth, StaffRecord, SlideViewMode, MenuCategory } from '../../types'
import { MENU_CATEGORIES } from '../../types'
import { formatYearMonth } from '../../lib/storage'
import Image from 'next/image'

const TOTAL_SLIDES = 19

// メニューカテゴリのカラーパレット
const MENU_COLORS: Record<MenuCategory, string> = {
  もみほぐし: '#4285F4',
  タイ古式マッサージ: '#34A853',
  バリ式リンパマッサージ: '#FBBC04',
  オプション: '#EA4335',
  その他: '#9AA0A6',
}

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
  const { monthlyData, stores: storesMaster } = useDataContext()
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
    .map((r) => ({ staffName: r.staffName, storeName: r.storeName })) || []

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
  const commonProps = { selectedStores, selectedStaffNames }

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
    // <SlideMenuCompositionChart key="s10" {...commonProps} />,
    <Slide10StaffAchievementTable key="s10a" {...commonProps} />,
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
      style={isFullscreen ? { padding: '0' } : {}}
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
                className={`px-3 py-1.5 text-sm rounded ${viewMode === 'scroll' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                スクロール
              </button>
              <button
                onClick={() => setViewMode('pagination')}
                className={`px-3 py-1.5 text-sm rounded ${viewMode === 'pagination' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                    className={`w-3 h-3 rounded-full ${i === currentSlide ? 'bg-purple-600' : 'bg-gray-300 hover:bg-gray-400'
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
const SlideContainer = ({ slideNumber, children, isFullscreen = false }: { slideNumber: number; children: React.ReactNode; isFullscreen?: boolean }) => {
  return (
    <div
      className="bg-white shadow-xl rounded-lg overflow-hidden relative"
      style={isFullscreen ? { height: 'calc(100vh - 48px)' } : { minHeight: '600px' }}
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
  const { currentYearMonth } = useDataContext()
  const year = currentYearMonth.split('-')[0]
  const month = parseInt(currentYearMonth.split('-')[1])

  return (
    <div className="h-full min-h-[600px] flex flex-col items-center gap-8 justify-center bg-[#221E1F] text-white">
      <Image src="/logo.jpg" width={160} height={160} alt="logo" />
      <p className="text-3xl  ">ReGrow × relaxation villa</p>
      <h1 className="text-5xl font-bold mb-4">月次業績レポート</h1>
      <p className="text-2xl">{year}年{month}月</p>

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
          <span>売上目標達成率（スタッフ別）・店舗別パフォーマンス</span>
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

const Slide3OverallSummary = ({ selectedStores }: StoreFilterProps) => {
  const { monthlyData } = useDataContext()
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

  // 店舗別の新規客数を集計
  const calcStoreNewCustomerCount = (storeName: StoreName): number => {
    const storeRecords = monthlyData.importedData?.staffRecords.filter((r) => r.storeName === storeName) || []
    return storeRecords.reduce((sum, r) => sum + r.newCustomerCount, 0)
  }

  // 店舗別の達成率を計算
  const calcStoreAchievementRate = (storeName: StoreName, actualSales: number): number | null => {
    const storeManualData = monthlyData.manualData.staffManualData?.filter((m) => m.storeName === storeName) || []
    const totalTarget = storeManualData.reduce((sum, m) => sum + (m.targetSales ?? 0), 0)
    if (totalTarget <= 0) return null
    return Math.round((actualSales / totalTarget) * 100)
  }

  return (
    <div className="h-full p-8 overflow-y-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">全体サマリー</h2>
      {filteredStores.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
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
                  <th className="p-2.5 border">来客数</th>
                  <th className="p-2.5 border">新規数</th>
                  <th className="p-2.5 border">稼働率 <span className="text-xs font-normal">※スタッフ平均</span></th>
                  <th className="p-2.5 border">客単価</th>
                  <th className="p-2.5 border">再来率</th>
                  <th className="p-2.5 border">達成率</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map((storeName, i) => {
                  const store = stores.find((s) => s.storeName === storeName)
                  const returnRate = calcStoreReturnRate(storeName)
                  const utilization = calcStoreUtilization(storeName)
                  const customerCount = store?.customerCount || 0
                  const newCustomerCount = calcStoreNewCustomerCount(storeName)
                  const achievementRate = calcStoreAchievementRate(storeName, store?.sales || 0)

                  return (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-2.5 border font-medium">{storeName}</td>
                      <td className="p-2.5 border text-right">¥{(store?.sales || 0).toLocaleString()}</td>
                      <td className="p-2.5 border text-right">{customerCount}</td>
                      <td className="p-2.5 border text-right">{newCustomerCount}</td>
                      <td className="p-2.5 border text-right">{utilization > 0 ? `${utilization}%` : '-'}</td>
                      <td className="p-2.5 border text-right">¥{(store?.unitPrice || 0).toLocaleString()}</td>
                      <td className="p-2.5 border text-right">{returnRate}%</td>
                      <td className="p-2.5 border text-right">
                        {achievementRate !== null ? (
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${achievementColorClass(achievementRate)}`}>
                            {achievementRate}%
                          </span>
                        ) : '-'}
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

// 指標別3店舗年間推移グラフ（スライド4-6）
const MetricComparisonSlide = ({
  metric,
  selectedStores,
}: {
  metric: '客単価' | '稼働率' | '再来率'
  selectedStores: StoreName[]
}) => {
  const { currentYearMonth, allMonthlyData } = useDataContext()
  const currentYear = currentYearMonth.split('-')[0]

  const data = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0')
    const yearMonth = `${currentYear}-${month}` as YearMonth
    const monthData = allMonthlyData[yearMonth]

    const result: any = { month: `${i + 1}月` }
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
        <div className="flex items-center justify-center" style={{ height: '500px' }}>
          <p className="text-gray-500 text-lg">店舗を選択してください</p>
        </div>
      ) : !hasData ? (
        <div className="flex items-center justify-center" style={{ height: '500px' }}>
          <p className="text-gray-500 text-lg">データがありません</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart data={data} margin={{ top: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" style={{ fontSize: '14px' }} />
            <YAxis style={{ fontSize: '14px' }} />
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

const Slide4MetricComparison = ({ metric, selectedStores }: StoreFilterProps & { metric: '客単価' | '稼働率' | '再来率' }) => (
  <MetricComparisonSlide metric={metric} selectedStores={selectedStores} />
)
const Slide5MetricComparison = ({ metric, selectedStores }: StoreFilterProps & { metric: '客単価' | '稼働率' | '再来率' }) => (
  <MetricComparisonSlide metric={metric} selectedStores={selectedStores} />
)
const Slide6MetricComparison = ({ metric, selectedStores }: StoreFilterProps & { metric: '客単価' | '稼働率' | '再来率' }) => (
  <MetricComparisonSlide metric={metric} selectedStores={selectedStores} />
)

// Phase4: 統合グラフ（ComposedChart: 客単価=Bar左軸円、稼働率/再来率=Line右軸%）
const Slide7AllMetricsComparison = ({ selectedStores }: StoreFilterProps) => {
  const { currentYearMonth, allMonthlyData } = useDataContext()
  const currentYear = currentYearMonth.split('-')[0]
  const metrics: Array<'客単価' | '稼働率' | '再来率'> = ['客単価', '稼働率', '再来率']

  const data = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0')
    const yearMonth = `${currentYear}-${month}` as YearMonth
    const monthData = allMonthlyData[yearMonth]

    const result: any = { month: `${i + 1}月` }
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
        <div className="flex items-center justify-center" style={{ height: '500px' }}>
          <p className="text-gray-500 text-lg">店舗を選択してください</p>
        </div>
      ) : !hasData ? (
        <div className="flex items-center justify-center" style={{ height: '500px' }}>
          <p className="text-gray-500 text-lg">データがありません</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart data={data} margin={{ top: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" style={{ fontSize: '14px' }} />
            <YAxis yAxisId="left" label={{ value: '円', angle: -90, position: 'insideLeft' }} style={{ fontSize: '12px' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: '%', angle: 90, position: 'insideRight' }} style={{ fontSize: '12px' }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
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
                dot={{ r: 3 }}
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
                dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
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

const PERFORMANCE_METRICS: SortMetricOption[] = [
  { key: 'sales', label: '売上' },
  { key: 'utilizationRate', label: '稼働率' },
  { key: 'proposalRate', label: '提案力実施率' },
  { key: 'customerCount', label: '対応客数' },
  { key: 'nominationCount', label: '指名数' },
  { key: 'nominationRate', label: '指名率' },
  { key: 'unitPrice', label: '客単価' },
  { key: 'returnRate', label: '再来率' },
  { key: 'csRegistrationCount', label: 'CS登録数' },
  { key: 'csRate', label: 'CS登録率' },
  { key: 'googleReviewCount', label: 'Google口コミ獲得数' },
]

const Slide8StaffPerformanceTable = ({ selectedStores, selectedStaffNames }: StoreFilterProps) => {
  const { monthlyData } = useDataContext()
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [sortMetric, setSortMetric] = useState('sales')

  const allStaffList = monthlyData.importedData?.staffRecords || []
  const staffList = filterStaffList(allStaffList, selectedStores, selectedStaffNames)

  // manualDataをMapで事前インデックス化（O(1)ルックアップ）
  const manualDataMap = useMemo(() => {
    const map = new Map<string, (typeof monthlyData.manualData.staffManualData)[number]>()
    for (const m of monthlyData.manualData.staffManualData ?? []) {
      map.set(`${m.staffName}::${m.storeName}`, m)
    }
    return map
  }, [monthlyData.manualData.staffManualData])

  const rawRows = staffList.map((staff) => {
    const manualData = manualDataMap.get(`${staff.staffName}::${staff.storeName}`)
    const nominationRate =
      staff.customerCount > 0 ? Number(((staff.nominationCount / staff.customerCount) * 100).toFixed(1)) : 0
    const returnRate = calculateStaffReturnRate(staff)
    const csRate =
      staff.customerCount > 0 && manualData?.csRegistrationCount
        ? Number((((manualData.csRegistrationCount || 0) / staff.customerCount) * 100).toFixed(1))
        : 0
    const utilizationRate = manualData?.utilizationRate ?? 0
    const proposalRate = manualData?.proposalRate ?? 0

    return {
      staffName: staff.staffName,
      storeName: staff.storeName,
      sales: staff.sales,
      utilizationRate,
      utilizationRateRaw: manualData?.utilizationRate,
      proposalRate,
      proposalRateRaw: manualData?.proposalRate,
      customerCount: staff.customerCount,
      nominationCount: staff.nominationCount,
      nominationRate,
      unitPrice: staff.unitPrice,
      returnRate,
      csRegistrationCount: manualData?.csRegistrationCount ?? 0,
      csRate,
      csRateRaw: manualData?.csRegistrationCount,
      googleReviewCount: manualData?.googleReviewCount ?? 0,
    }
  })

  const rows = sortByKey(rawRows, sortMetric as keyof (typeof rawRows)[0], sortOrder)

  return (
    <div className="h-full p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">スタッフ別パフォーマンス</h2>
        <SortToggle
          value={sortOrder}
          onChange={setSortOrder}
          metrics={PERFORMANCE_METRICS}
          selectedMetric={sortMetric}
          onMetricChange={setSortMetric}
        />
      </div>
      {rows.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
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
                <th className="p-1.5 border">提案力実施率</th>
                <th className="p-1.5 border">対応客数</th>
                <th className="p-1.5 border">指名数</th>
                <th className="p-1.5 border">指名率</th>
                <th className="p-1.5 border">客単価</th>
                <th className="p-1.5 border">再来率</th>
                <th className="p-1.5 border">CS登録数</th>
                <th className="p-1.5 border">CS登録率</th>
                <th className="p-1.5 border">Google口コミ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-1.5 border font-medium">{i === 0 && sortOrder === 'desc' ? `👑 ${row.staffName}` : row.staffName}</td>
                  <td className="p-1.5 border text-xs">{row.storeName}</td>
                  <td className="p-1.5 border text-right">¥{row.sales.toLocaleString()}</td>
                  <td className="p-1.5 border text-right">
                    {row.utilizationRateRaw !== null && row.utilizationRateRaw !== undefined
                      ? `${row.utilizationRateRaw}%`
                      : '-'}
                  </td>
                  <td className="p-1.5 border text-right">
                    {row.proposalRateRaw !== null && row.proposalRateRaw !== undefined
                      ? `${row.proposalRateRaw}%`
                      : '-'}
                  </td>
                  <td className="p-1.5 border text-right">{row.customerCount}</td>
                  <td className="p-1.5 border text-right">{row.nominationCount}</td>
                  <td className="p-1.5 border text-right">{row.nominationRate > 0 ? `${row.nominationRate}%` : '-'}</td>
                  <td className="p-1.5 border text-right">¥{row.unitPrice.toLocaleString()}</td>
                  <td className="p-1.5 border text-right">{row.returnRate}%</td>
                  <td className="p-1.5 border text-right">{row.csRegistrationCount || '-'}</td>
                  <td className="p-1.5 border text-right">{row.csRateRaw ? `${row.csRate}%` : '-'}</td>
                  <td className="p-1.5 border text-right">{row.googleReviewCount || '-'}</td>
                </tr>
              ))}
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

// ソート順の型と共通トグル
type SortOrder = 'desc' | 'asc' | 'default'

type SortMetricOption<T extends string = string> = { key: T; label: string }

const SortToggle = <T extends string = string>({
  value,
  onChange,
  metrics,
  selectedMetric,
  onMetricChange,
}: {
  value: SortOrder
  onChange: (v: SortOrder) => void
  metrics?: SortMetricOption<T>[]
  selectedMetric?: T
  onMetricChange?: (v: T) => void
}) => {
  const orderOptions: { key: SortOrder; label: string }[] = [
    { key: 'default', label: '登録順' },
    { key: 'desc', label: '降順' },
    { key: 'asc', label: '昇順' },
  ]
  return (
    <div className="flex items-center gap-2">
      {metrics && metrics.length > 1 && selectedMetric && onMetricChange && (
        <div className="flex items-center gap-1 bg-blue-50 rounded-md p-0.5">
          {metrics.map((m) => (
            <button
              key={m.key}
              onClick={() => onMetricChange(m.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${selectedMetric === m.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
        {orderOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${value === opt.key ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/** 'default'（元順序）対応のソートラッパー */
const sortByKey = <T,>(data: T[], key: keyof T, order: SortOrder): T[] => {
  if (order === 'default') return data
  return arr__sortByKey(data, key as string, order)
}

// スタッフ稼働率（各グラフ内にローカルトグル）
const Slide9StaffUtilizationChart = ({ selectedStores, selectedStaffNames }: StoreFilterProps) => {
  const { currentYearMonth, availableMonths, allMonthlyData } = useDataContext()
  const [selectedMonth, setSelectedMonth] = useState<YearMonth>(currentYearMonth)
  const [showCurrent, setShowCurrent] = useState(true)
  const [showCumulative, setShowCumulative] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const selectedMonthData = allMonthlyData[selectedMonth]

  // スタッフ稼働率データ
  let utilizationData =
    selectedMonthData?.manualData.staffManualData
      ?.filter((u) => u.utilizationRate !== null && u.utilizationRate !== undefined)
      .filter((u) => selectedStores.includes(u.storeName))
      .map((u) => ({
        name: u.staffName,
        当月: u.utilizationRate || 0,
        store: u.storeName,
        ...(showCumulative
          ? { 累計平均: calculateStaffCumulativeAverage(u.staffName, u.storeName, selectedMonth, 'utilizationRate', allMonthlyData) }
          : {}),
      })) || []

  // スタッフフィルタ適用
  if (selectedStaffNames.length > 0) {
    utilizationData = utilizationData.filter((u) => selectedStaffNames.includes(u.name))
  }

  // ソート適用（稼働率の当月値でソート）
  utilizationData = sortByKey(utilizationData, '当月', sortOrder)

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800">スタッフ稼働率</h2>
        <div className="flex items-center gap-4">
          <SortToggle value={sortOrder} onChange={setSortOrder} />
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
        <div className="flex items-center justify-center" style={{ height: '450px' }}>
          <p className="text-gray-500">
            {selectedStores.length === 0 ? '店舗を選択してください' : 'スタッフ稼働率データがありません'}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={utilizationData} margin={{ top: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={100} />
            <YAxis label={{ value: '稼働率 (%)', angle: -90, position: 'insideLeft' }} style={{ fontSize: '12px' }} />
            <Tooltip />
            <Legend />
            {showCurrent && (
              <Bar dataKey="当月" fill="#DC3545" name="当月">
                <LabelList dataKey="当月" position="top" style={{ fontSize: '11px' }} />
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
  customerCount: number
  newCustomerCount: number
  unitPrice: number
  returnRate: number
  utilizationRate: number
  proposalRate: number
  googleReviewCount: number
}

const achievementColorClass = (rate: number) =>
  rate >= 100 ? 'bg-green-100 text-green-700' : rate >= 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'

const achievementBarColor = (rate: number) =>
  rate >= 100 ? 'url(#achievementGradient)' : rate >= 80 ? '#FFA500' : '#DC3545'

// 達成グラデーション定義（SVG defs内で使用）
const AchievementGradientDef = () => (
  <defs>
    <linearGradient id="achievementGradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#3B82F6" />
      <stop offset="35%" stopColor="#10B981" />
      <stop offset="70%" stopColor="#22C55E" />
      <stop offset="100%" stopColor="#F59E0B" />
    </linearGradient>
  </defs>
)

// 達成時にバーを太く描画するカスタムシェイプ
const AchievementBarShape = (props: Record<string, unknown>) => {
  const { x, y, width, height, fill, payload } = props as { x: number; y: number; width: number; height: number; fill: string; payload: { 達成率: number } }
  const isAchieved = payload.達成率 >= 100
  // 達成時は1.8倍の太さ、角丸付き
  const barHeight = isAchieved ? height * 1.8 : height
  const barY = y + (height - barHeight) / 2
  return <rect x={x} y={barY} width={width} height={barHeight} fill={fill} rx={isAchieved ? 4 : 0} ry={isAchieved ? 4 : 0} />
}

// 達成時に王冠を表示するカスタムラベル
const CrownLabel = (props: Record<string, unknown>) => {
  const { x, y, width, height, value } = props as { x: number; y: number; width: number; height: number; value: number }
  if (value < 100) return null
  // バーが太くなった分を考慮して中央に配置
  return (
    <text x={(x ?? 0) + (width ?? 0) + 6} y={(y ?? 0) + (height ?? 0) / 2 + 6} fontSize={20}>
      👑
    </text>
  )
}

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
      const storeTotal = monthlyData.importedData?.storeTotals.find((t) => t.storeName === storeName)
      const totalActual = storeRecords.reduce((sum, r) => sum + r.sales, 0)
      const storeManualData = monthlyData.manualData.staffManualData?.filter((m) => m.storeName === storeName) || []
      const totalTarget = storeManualData.reduce((sum, m) => sum + (m.targetSales ?? 0), 0)

      // 来客数・新規数
      const customerCount = storeTotal?.customerCount || storeRecords.reduce((sum, r) => sum + r.customerCount, 0)
      const newCustomerCount = storeRecords.reduce((sum, r) => sum + r.newCustomerCount, 0)

      // 客単価
      const unitPrice = storeTotal?.unitPrice || 0

      // 再来率
      const totalCustomers = storeRecords.reduce((sum, r) => sum + r.customerCount, 0)
      const totalNewCustomers = storeRecords.reduce((sum, r) => sum + r.newCustomerCount, 0)
      const returnRate = totalCustomers > 0
        ? Math.round(((totalCustomers - totalNewCustomers) / totalCustomers) * 100 * 10) / 10
        : 0

      // 稼働率（スタッフ平均）
      const staffUtilData = monthlyData.manualData.staffManualData?.filter(
        (s) => s.storeName === storeName && s.utilizationRate !== null && s.utilizationRate !== undefined
      ) || []
      const utilizationRate = staffUtilData.length > 0
        ? Math.round(staffUtilData.reduce((sum, s) => sum + (s.utilizationRate || 0), 0) / staffUtilData.length * 10) / 10
        : 0

      // 提案力実施率（スタッフ平均）
      const staffProposalData = monthlyData.manualData.staffManualData?.filter(
        (s) => s.storeName === storeName && s.proposalRate !== null && s.proposalRate !== undefined
      ) || []
      const proposalRate = staffProposalData.length > 0
        ? Math.round(staffProposalData.reduce((sum, s) => sum + (s.proposalRate || 0), 0) / staffProposalData.length * 10) / 10
        : 0

      // 達成率（目標未入力でも行は表示する）
      const achievementRate = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0

      return {
        storeName,
        targetTotal: totalTarget,
        actualTotal: totalActual,
        diff: totalTarget > 0 ? totalActual - totalTarget : 0,
        achievementRate,
        customerCount,
        newCustomerCount,
        unitPrice,
        returnRate,
        utilizationRate,
        proposalRate,
        googleReviewCount: storeManualData.reduce((sum, m) => sum + (m.googleReviewCount ?? 0), 0),
      }
    })
    // 目標未入力でも表示する（フィルタを削除）
    .filter(Boolean) as StoreAchievementRow[]
}

const AchievementLegend = () => (
  <div className="mt-4 flex gap-4 text-xs text-gray-500">
    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded inline-block" style={{ background: 'linear-gradient(to right, #3B82F6, #10B981, #22C55E, #F59E0B)' }} /> 👑 100%以上</span>
    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500 inline-block" /> 80-99%</span>
    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600 inline-block" /> 80%未満</span>
    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-500 inline-block" /> 達成率ライン</span>
  </div>
)

// ============================================================
// スライド10: スタッフ別売上達成率（テーブル）
// ============================================================

const ACHIEVEMENT_METRICS: SortMetricOption[] = [
  { key: 'targetSales', label: '目標売上' },
  { key: 'actualSales', label: '実績売上' },
  { key: 'diff', label: '差額' },
  { key: 'achievementRate', label: '達成率' },
]

const Slide10StaffAchievementTable = ({ selectedStores, selectedStaffNames }: StoreFilterProps) => {
  const { monthlyData } = useDataContext()
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [sortMetric, setSortMetric] = useState('achievementRate')
  const rawRows = useMemo(() => buildStaffAchievementData(monthlyData, selectedStores, selectedStaffNames), [monthlyData, selectedStores, selectedStaffNames])
  const rows = sortByKey(rawRows, sortMetric as keyof StaffAchievementRow, sortOrder)
  const hasStaff = (monthlyData.importedData?.staffRecords || []).length > 0

  return (
    <div className="h-full p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">スタッフ別 売上目標達成率</h2>
        <SortToggle
          value={sortOrder}
          onChange={setSortOrder}
          metrics={ACHIEVEMENT_METRICS}
          selectedMetric={sortMetric}
          onMetricChange={setSortMetric}
        />
      </div>
      {rows.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
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

const Slide11StaffAchievementChart = ({ selectedStores, selectedStaffNames }: StoreFilterProps) => {
  const { monthlyData } = useDataContext()
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [sortMetric, setSortMetric] = useState('achievementRate')
  const rawRows = useMemo(() => buildStaffAchievementData(monthlyData, selectedStores, selectedStaffNames), [monthlyData, selectedStores, selectedStaffNames])
  const sortedRows = sortByKey(rawRows, sortMetric as keyof StaffAchievementRow, sortOrder)
  const hasStaff = (monthlyData.importedData?.staffRecords || []).length > 0

  const chartData = sortedRows.map((row) => ({
    name: row.staffName,
    目標売上: row.targetSales,
    実績売上: row.actualSales,
    達成率: row.achievementRate,
  }))

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">スタッフ別 売上目標達成率</h2>
        <SortToggle
          value={sortOrder}
          onChange={setSortOrder}
          metrics={ACHIEVEMENT_METRICS}
          selectedMetric={sortMetric}
          onMetricChange={setSortMetric}
        />
      </div>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: '450px' }}>
          <p className="text-gray-500 text-lg">
            {!hasStaff ? 'スタッフデータがありません' : '目標売上が未入力です（目標売上タブで入力してください）'}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(chartData.length * 50 + 80, 300)}>
          <ComposedChart data={chartData} layout="vertical" margin={{ top: 20, left: 20, right: 80 }}>
            <AchievementGradientDef />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis xAxisId="sales" type="number" orientation="bottom" style={{ fontSize: '11px' }}
              tickFormatter={(v: number) => `¥${(v / 10000).toFixed(0)}万`}
            />
            <XAxis xAxisId="rate" type="number" orientation="top" domain={[0, (max: number) => Math.max(max, 130)]} unit="%" style={{ fontSize: '11px' }} hide />
            <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '12px' }} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === '達成率') return [`${value}%`, name]
                return [`¥${value.toLocaleString()}`, name]
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar xAxisId="sales" dataKey="目標売上" fill="#94A3B8" name="目標売上" barSize={16} />
            <Bar xAxisId="sales" dataKey="実績売上" name="実績売上" barSize={16} shape={<AchievementBarShape />}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={achievementBarColor(entry.達成率)} />
              ))}
              <LabelList dataKey="達成率" content={<CrownLabel />} />
            </Bar>
            <Line xAxisId="rate" dataKey="達成率" stroke="#6366F1" strokeWidth={2} name="達成率" dot={{ r: 5, fill: '#6366F1' }} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
      <AchievementLegend />
    </div>
  )
}

// ============================================================
// スライド12: 店舗別パフォーマンス（テーブル）
// ============================================================

const STORE_PERFORMANCE_METRICS: SortMetricOption[] = [
  { key: 'actualTotal', label: '実績売上' },
  { key: 'achievementRate', label: '達成率' },
  { key: 'customerCount', label: '来客数' },
  { key: 'newCustomerCount', label: '新規数' },
  { key: 'unitPrice', label: '客単価' },
  { key: 'utilizationRate', label: '稼働率' },
  { key: 'proposalRate', label: '提案力実施率' },
  { key: 'returnRate', label: '再来率' },
  { key: 'googleReviewCount', label: 'Google口コミ' },
]

const Slide12StoreAchievementTable = ({ selectedStores }: StoreFilterProps) => {
  const { monthlyData } = useDataContext()
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [sortMetric, setSortMetric] = useState('actualTotal')
  const rawRows = useMemo(() => buildStoreAchievementData(monthlyData, selectedStores), [monthlyData, selectedStores])
  const rows = sortByKey(rawRows, sortMetric as keyof StoreAchievementRow, sortOrder)

  return (
    <div className="h-full p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">店舗別パフォーマンス</h2>
        <SortToggle
          value={sortOrder}
          onChange={setSortOrder}
          metrics={STORE_PERFORMANCE_METRICS}
          selectedMetric={sortMetric}
          onMetricChange={setSortMetric}
        />
      </div>
      {rows.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
          <p className="text-gray-500 text-lg">
            {selectedStores.length === 0 ? '店舗を選択してください' : 'データがありません'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="p-2.5 border">店舗</th>
                <th className="p-2.5 border">実績売上</th>
                <th className="p-2.5 border">目標売上</th>
                <th className="p-2.5 border">差額</th>
                <th className="p-2.5 border">達成率</th>
                <th className="p-2.5 border">来客数</th>
                <th className="p-2.5 border">新規数</th>
                <th className="p-2.5 border">客単価</th>
                <th className="p-2.5 border">稼働率</th>
                <th className="p-2.5 border">提案力実施率</th>
                <th className="p-2.5 border">再来率</th>
                <th className="p-2.5 border">Google口コミ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-2.5 border font-medium">{i === 0 && sortOrder === 'desc' ? `👑 ${row.storeName}` : row.storeName}</td>
                  <td className="p-2.5 border text-right">¥{row.actualTotal.toLocaleString()}</td>
                  <td className="p-2.5 border text-right">{row.targetTotal > 0 ? `¥${row.targetTotal.toLocaleString()}` : '-'}</td>
                  <td className="p-2.5 border text-right">
                    {row.targetTotal > 0 ? (
                      <span className={row.diff >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {row.diff >= 0 ? '+' : ''}¥{row.diff.toLocaleString()}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-2.5 border text-right">
                    {row.targetTotal > 0 ? (
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${achievementColorClass(row.achievementRate)}`}>
                        {row.achievementRate}%
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-2.5 border text-right">{row.customerCount}</td>
                  <td className="p-2.5 border text-right">{row.newCustomerCount}</td>
                  <td className="p-2.5 border text-right">¥{row.unitPrice.toLocaleString()}</td>
                  <td className="p-2.5 border text-right">{row.utilizationRate > 0 ? `${row.utilizationRate}%` : '-'}</td>
                  <td className="p-2.5 border text-right">{row.proposalRate > 0 ? `${row.proposalRate}%` : '-'}</td>
                  <td className="p-2.5 border text-right">{row.returnRate}%</td>
                  <td className="p-2.5 border text-right">{row.googleReviewCount || '-'}</td>
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
// スライド13: 店舗別パフォーマンス（グラフ）
// チェックボックスで表示指標を切り替え
// ============================================================

type StoreChartMetricKey = 'actualTotal' | 'achievementRate' | 'customerCount' | 'newCustomerCount' | 'unitPrice' | 'utilizationRate' | 'proposalRate' | 'returnRate' | 'googleReviewCount'

const STORE_CHART_METRICS: { key: StoreChartMetricKey; label: string; color: string; unit: 'yen' | 'percent' | 'count' }[] = [
  { key: 'actualTotal', label: '実績売上', color: '#7C3AED', unit: 'yen' },
  { key: 'achievementRate', label: '達成率', color: '#DC2626', unit: 'percent' },
  { key: 'customerCount', label: '来客数', color: '#2563EB', unit: 'count' },
  { key: 'newCustomerCount', label: '新規数', color: '#16A34A', unit: 'count' },
  { key: 'unitPrice', label: '客単価', color: '#D97706', unit: 'yen' },
  { key: 'utilizationRate', label: '稼働率', color: '#DB2777', unit: 'percent' },
  { key: 'proposalRate', label: '提案力実施率', color: '#8B5CF6', unit: 'percent' },
  { key: 'returnRate', label: '再来率', color: '#0891B2', unit: 'percent' },
  { key: 'googleReviewCount', label: 'Google口コミ', color: '#EA580C', unit: 'count' },
]

const Slide13StoreAchievementChart = ({ selectedStores }: StoreFilterProps) => {
  const { monthlyData } = useDataContext()
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [sortMetric, setSortMetric] = useState('actualTotal')
  const [visibleMetrics, setVisibleMetrics] = useState<Set<StoreChartMetricKey>>(new Set(STORE_CHART_METRICS.map((m) => m.key)))
  const rawRows = useMemo(() => buildStoreAchievementData(monthlyData, selectedStores), [monthlyData, selectedStores])
  const rows = sortByKey(rawRows, sortMetric as keyof StoreAchievementRow, sortOrder)

  const toggleMetric = (key: StoreChartMetricKey) => {
    setVisibleMetrics((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        // 最低1つは残す
        if (next.size > 1) next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const chartData = rows.map((row) => ({
    name: row.storeName,
    実績売上: row.actualTotal,
    達成率: row.targetTotal > 0 ? row.achievementRate : 0,
    来客数: row.customerCount,
    新規数: row.newCustomerCount,
    客単価: row.unitPrice,
    稼働率: row.utilizationRate,
    提案力実施率: row.proposalRate,
    再来率: row.returnRate,
    Google口コミ: row.googleReviewCount,
  }))

  // 表示中の指標を単位別に分類
  const activeMetrics = STORE_CHART_METRICS.filter((m) => visibleMetrics.has(m.key))
  const hasYen = activeMetrics.some((m) => m.unit === 'yen')
  const hasPercent = activeMetrics.some((m) => m.unit === 'percent')
  const hasCount = activeMetrics.some((m) => m.unit === 'count')

  // 軸の割り当て: 単位の種類に応じて左軸・右軸を決定
  const getAxisId = (unit: 'yen' | 'percent' | 'count'): string => {
    const units = [hasYen && 'yen', hasPercent && 'percent', hasCount && 'count'].filter(Boolean)
    if (units.length <= 1) return 'left'
    if (unit === units[0]) return 'left'
    return 'right'
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">店舗別パフォーマンス</h2>
        <SortToggle
          value={sortOrder}
          onChange={setSortOrder}
          metrics={STORE_PERFORMANCE_METRICS}
          selectedMetric={sortMetric}
          onMetricChange={setSortMetric}
        />
      </div>
      {/* 指標トグル */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STORE_CHART_METRICS.map((m) => (
          <label key={m.key} className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
            <input
              type="checkbox"
              checked={visibleMetrics.has(m.key)}
              onChange={() => toggleMetric(m.key)}
              className="w-4 h-4 rounded"
              style={{ accentColor: m.color }}
            />
            <span className="text-sm font-medium text-gray-700">{m.label}</span>
          </label>
        ))}
      </div>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
          <p className="text-gray-500 text-lg">
            {selectedStores.length === 0 ? '店舗を選択してください' : 'データがありません'}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(chartData.length * 80 + 80, 250)}>
          <ComposedChart data={chartData} layout="vertical" margin={{ top: 20, left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '13px', fontWeight: 'bold' }} />
            {/* 左軸 */}
            <XAxis
              xAxisId="left"
              type="number"
              orientation="bottom"
              style={{ fontSize: '11px' }}
              tickFormatter={(v: number) => {
                const leftUnit = activeMetrics.find((m) => getAxisId(m.unit) === 'left')?.unit
                if (leftUnit === 'yen') return `¥${(v / 10000).toFixed(0)}万`
                if (leftUnit === 'percent') return `${v}%`
                return String(v)
              }}
            />
            {/* 右軸（2種類以上の単位がある場合） */}
            {[hasYen, hasPercent, hasCount].filter(Boolean).length > 1 && (
              <XAxis
                xAxisId="right"
                type="number"
                orientation="top"
                style={{ fontSize: '11px' }}
                tickFormatter={(v: number) => {
                  const rightUnit = activeMetrics.find((m) => getAxisId(m.unit) === 'right')?.unit
                  if (rightUnit === 'yen') return `¥${(v / 10000).toFixed(0)}万`
                  if (rightUnit === 'percent') return `${v}%`
                  return String(v)
                }}
              />
            )}
            <Tooltip
              formatter={(value: number, name: string) => {
                const metric = STORE_CHART_METRICS.find((m) => m.label === name)
                if (metric?.unit === 'yen') return [`¥${value.toLocaleString()}`, name]
                if (metric?.unit === 'percent') return [`${value}%`, name]
                return [value, name]
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {activeMetrics.map((m) => (
              <Bar
                key={m.key}
                xAxisId={getAxisId(m.unit)}
                dataKey={m.label}
                fill={m.color}
                name={m.label}
                barSize={22}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      )}
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
const DiffCell = ({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) => {
  const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-500'
  const sign = value > 0 ? '+' : ''
  return <span className={`font-medium ${color}`}>{sign}{prefix}{value.toLocaleString()}{suffix}</span>
}

// ============================================================
// スライド14: スタッフ別先月比① テーブル（売上金額/指名件数）
// ============================================================

type SalesNominationKey = 'currentSales' | 'currentNomination'
type ReturnUnitKey = 'currentReturnRate' | 'currentUnitPrice'

const SALES_NOMINATION_METRICS: SortMetricOption<SalesNominationKey>[] = [
  { key: 'currentSales', label: '売上' },
  { key: 'currentNomination', label: '指名' },
]

const RETURN_UNIT_METRICS: SortMetricOption<ReturnUnitKey>[] = [
  { key: 'currentUnitPrice', label: '客単価' },
  { key: 'currentReturnRate', label: '再来率' },
]

const Slide14StaffMomTable1 = ({ selectedStores, selectedStaffNames }: StoreFilterProps) => {
  const { monthlyData, currentYearMonth, allMonthlyData } = useDataContext()
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [sortMetric, setSortMetric] = useState<SalesNominationKey>('currentSales')
  const rawRows = useMemo(() => buildStaffMomData(currentYearMonth, monthlyData, selectedStores, selectedStaffNames, allMonthlyData), [currentYearMonth, monthlyData, selectedStores, selectedStaffNames, allMonthlyData])
  const rows = sortByKey(rawRows, sortMetric, sortOrder)

  return (
    <div className="h-full p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          スタッフ別先月比①（売上金額/指名件数）
        </h2>
        <SortToggle<SalesNominationKey>
          value={sortOrder}
          onChange={setSortOrder}
          metrics={SALES_NOMINATION_METRICS}
          selectedMetric={sortMetric}
          onMetricChange={setSortMetric}
        />
      </div>
      {rows.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
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

const Slide15StaffMomChart1 = ({ selectedStores, selectedStaffNames }: StoreFilterProps) => {
  const { monthlyData, currentYearMonth, allMonthlyData } = useDataContext()
  const [showCurrent, setShowCurrent] = useState(true)
  const [showCumulative, setShowCumulative] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [sortMetric, setSortMetric] = useState<SalesNominationKey>('currentSales')
  const rawRows = useMemo(() => buildStaffMomData(currentYearMonth, monthlyData, selectedStores, selectedStaffNames, allMonthlyData), [currentYearMonth, monthlyData, selectedStores, selectedStaffNames, allMonthlyData])
  const rows = sortByKey(rawRows, sortMetric, sortOrder)

  const chartData = rows.map((row) => ({
    name: row.staffName,
    ...(showCurrent ? { '売上（当月）': row.currentSales, '指名（当月）': row.currentNomination } : {}),
    ...(showCumulative ? { '売上（累計平均）': row.cumSales, '指名（累計平均）': row.cumNomination } : {}),
  }))

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">スタッフ別先月比グラフ①（売上金額/指名件数）</h2>
        <div className="flex items-center gap-4">
          <SortToggle<SalesNominationKey>
            value={sortOrder}
            onChange={setSortOrder}
            metrics={SALES_NOMINATION_METRICS}
            selectedMetric={sortMetric}
            onMetricChange={setSortMetric}
          />
          <ChartToggle showCurrent={showCurrent} showCumulative={showCumulative} onCurrentChange={setShowCurrent} onCumulativeChange={setShowCumulative} />
        </div>
      </div>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: '450px' }}>
          <p className="text-gray-500 text-lg">スタッフデータがありません</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={480}>
          <ComposedChart data={chartData} margin={{ top: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: '11px' }} angle={-30} textAnchor="end" height={80} />
            <YAxis yAxisId="left" label={{ value: '売上金額', angle: -90, position: 'insideLeft' }} style={{ fontSize: '11px' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: '指名件数', angle: 90, position: 'insideRight' }} style={{ fontSize: '11px' }} />
            <Tooltip formatter={(value: number, name: string) => {
              if (name.includes('売上')) return [`¥${value.toLocaleString()}`, name]
              return [value, name]
            }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {showCurrent && <Bar yAxisId="left" dataKey="売上（当月）" fill="#DC3545" barSize={20} />}
            {showCumulative && <Bar yAxisId="left" dataKey="売上（累計平均）" fill="#F4A460" barSize={20} />}
            {showCurrent && <Line yAxisId="right" type="monotone" dataKey="指名（当月）" stroke="#1a3a5c" strokeWidth={2} dot={{ r: 4 }} />}
            {showCumulative && <Line yAxisId="right" type="monotone" dataKey="指名（累計平均）" stroke="#87CEEB" strokeWidth={2} dot={{ r: 4, fill: '#fff' }} />}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ============================================================
// スライド16: スタッフ別先月比② テーブル（再来率/客単価）
// ============================================================

const Slide16StaffMomTable2 = ({ selectedStores, selectedStaffNames }: StoreFilterProps) => {
  const { monthlyData, currentYearMonth, allMonthlyData } = useDataContext()
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [sortMetric, setSortMetric] = useState<ReturnUnitKey>('currentUnitPrice')
  const rawRows = useMemo(() => buildStaffMomData(currentYearMonth, monthlyData, selectedStores, selectedStaffNames, allMonthlyData), [currentYearMonth, monthlyData, selectedStores, selectedStaffNames, allMonthlyData])
  const rows = sortByKey(rawRows, sortMetric, sortOrder)

  return (
    <div className="h-full p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          スタッフ別先月比②（再来率/客単価）
        </h2>
        <SortToggle<ReturnUnitKey>
          value={sortOrder}
          onChange={setSortOrder}
          metrics={RETURN_UNIT_METRICS}
          selectedMetric={sortMetric}
          onMetricChange={setSortMetric}
        />
      </div>
      {rows.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
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

const Slide17StaffMomChart2 = ({ selectedStores, selectedStaffNames }: StoreFilterProps) => {
  const { monthlyData, currentYearMonth, allMonthlyData } = useDataContext()
  const [showCurrent, setShowCurrent] = useState(true)
  const [showCumulative, setShowCumulative] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [sortMetric, setSortMetric] = useState<ReturnUnitKey>('currentUnitPrice')
  const rawRows = useMemo(() => buildStaffMomData(currentYearMonth, monthlyData, selectedStores, selectedStaffNames, allMonthlyData), [currentYearMonth, monthlyData, selectedStores, selectedStaffNames, allMonthlyData])
  const rows = sortByKey(rawRows, sortMetric, sortOrder)

  const chartData = rows.map((row) => ({
    name: row.staffName,
    ...(showCurrent ? { '客単価（当月）': row.currentUnitPrice, '再来率（当月）': row.currentReturnRate } : {}),
    ...(showCumulative ? { '客単価（累計平均）': row.cumUnitPrice, '再来率（累計平均）': row.cumReturnRate } : {}),
  }))

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">スタッフ別先月比グラフ②（再来率/客単価）</h2>
        <div className="flex items-center gap-4">
          <SortToggle<ReturnUnitKey>
            value={sortOrder}
            onChange={setSortOrder}
            metrics={RETURN_UNIT_METRICS}
            selectedMetric={sortMetric}
            onMetricChange={setSortMetric}
          />
          <ChartToggle showCurrent={showCurrent} showCumulative={showCumulative} onCurrentChange={setShowCurrent} onCumulativeChange={setShowCumulative} />
        </div>
      </div>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: '450px' }}>
          <p className="text-gray-500 text-lg">スタッフデータがありません</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={480}>
          <ComposedChart data={chartData} margin={{ top: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: '11px' }} angle={-30} textAnchor="end" height={80} />
            <YAxis yAxisId="left" label={{ value: '客単価', angle: -90, position: 'insideLeft' }} style={{ fontSize: '11px' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: '再来率（%）', angle: 90, position: 'insideRight' }} style={{ fontSize: '11px' }} />
            <Tooltip formatter={(value: number, name: string) => {
              if (name.includes('客単価')) return [`¥${value.toLocaleString()}`, name]
              return [`${value}%`, name]
            }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {showCurrent && <Bar yAxisId="left" dataKey="客単価（当月）" fill="#DC3545" barSize={20} />}
            {showCumulative && <Bar yAxisId="left" dataKey="客単価（累計平均）" fill="#F4A460" barSize={20} />}
            {showCurrent && <Line yAxisId="right" type="monotone" dataKey="再来率（当月）" stroke="#1a3a5c" strokeWidth={2} dot={{ r: 4 }} />}
            {showCumulative && <Line yAxisId="right" type="monotone" dataKey="再来率（累計平均）" stroke="#87CEEB" strokeWidth={2} dot={{ r: 4, fill: '#fff' }} />}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ============================================================
// メニュー構成割合グラフ: スタッフ別メニュー構成（100%積み上げ棒グラフ）
// ============================================================

const SlideMenuCompositionChart = ({ selectedStores, selectedStaffNames }: StoreFilterProps) => {
  const { monthlyData, availableMonths, allMonthlyData } = useDataContext()
  const [selectedMonth, setSelectedMonth] = useState<YearMonth>(monthlyData.yearMonth)

  const selectedMonthData = allMonthlyData[selectedMonth]
  const staffMenuRecords = selectedMonthData?.importedData?.staffMenuRecords ?? []

  // 店舗・スタッフフィルタ適用後のスタッフ名一覧
  const filteredStaffNames = staffMenuRecords
    .filter((r) => selectedStores.includes(r.storeName))
    .reduce<string[]>((acc, r) => {
      if (!acc.includes(r.staffName)) acc.push(r.staffName)
      return acc
    }, [])
    .filter((name) => selectedStaffNames.length === 0 || selectedStaffNames.includes(name))

  // recharts用データに変換（客数を正規化して100%積み上げ）
  // `${category}_count` キーに実客数も保持してTooltipで表示
  const chartData = filteredStaffNames.map((staffName) => {
    const menus = staffMenuRecords.filter((r) => r.staffName === staffName)
    const totalMenuCustomers = menus.reduce((sum, m) => sum + m.customerCount, 0)

    const entry: Record<string, string | number> = { name: staffName }
    for (const category of MENU_CATEGORIES) {
      const menu = menus.find((m) => m.menuCategory === category)
      const count = menu?.customerCount ?? 0
      entry[category] =
        totalMenuCustomers > 0 ? Math.round((count / totalMenuCustomers) * 1000) / 10 : 0
      entry[`${category}_count`] = count
    }
    return entry
  })

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800">メニュー構成割合（スタッフ別）</h2>
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

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: '450px' }}>
          <p className="text-gray-500">
            {selectedStores.length === 0 ? '店舗を選択してください' : 'メニューデータがありません'}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 48 + 60)}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 40, bottom: 20, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              style={{ fontSize: '12px' }}
              width={75}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="bg-white border border-gray-200 rounded shadow-md p-3 text-sm">
                    <p className="font-bold mb-2">{label}</p>
                    {payload.map((p) => {
                      const count = p.payload[`${p.name}_count`] as number
                      return (
                        <p key={p.name} style={{ color: p.fill }} className="leading-5">
                          {p.name}: {(p.value as number).toFixed(1)}%（{count}人）
                        </p>
                      )
                    })}
                  </div>
                )
              }}
            />
            <Legend />
            {MENU_CATEGORIES.map((category) => (
              <Bar key={category} dataKey={category} stackId="menu" fill={MENU_COLORS[category]} name={category}>
                <LabelList
                  dataKey={category}
                  content={(props: any) => {
                    const { x, y, width, height, value, index } = props
                    if (!value || value < 7 || width < 32) return null
                    const count = (chartData[index]?.[`${category}_count`] as number) ?? 0
                    return (
                      <text textAnchor="middle" fill="#fff" fontSize={10} fontWeight="bold">
                        <tspan x={x + width / 2} y={y + height / 2 - 5}>{(value as number).toFixed(0)}%</tspan>
                        <tspan x={x + width / 2} y={y + height / 2 + 8}>{count}人</tspan>
                      </text>
                    )
                  }}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ============================================================
// スライド18: お客様の声
// ============================================================

const Slide18CustomerVoice = () => {
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
