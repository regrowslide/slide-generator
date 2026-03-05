'use client'

import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  Presentation,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
  PanelRightOpen,
  HelpCircle,
  Upload,
  Table,
  Pen,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Plus,
  LucideIcon,
} from 'lucide-react'
import RegrowMockUnifiedNew from './RegrowMockUnifiedNew'
import { MockDataContextProvider } from './context/MockDataContext'
import { useDataContext } from '@app/(apps)/regrow/context/DataContext'
import { formatYearMonth } from '@app/(apps)/regrow/lib/storage'
import type { SectionKey } from '@app/(apps)/regrow/types'
import {
  SplashScreen,
  InfoSidebar,
  GuidanceOverlay,
  type Feature,
  type TimeEfficiencyItem,
  type OverviewInfo,
  type OperationStep,
  type GuidanceStep,
} from '../../_components'

// ==========================================
// タブ定義
// ==========================================

const TABS: { id: SectionKey; label: string; icon: LucideIcon }[] = [
  { id: 'guidance', label: 'ガイダンス', icon: HelpCircle },
  { id: 'import', label: 'Excel取込', icon: Upload },
  { id: 'import-data', label: 'データ確認', icon: Table },
  { id: 'manual-input', label: '手動入力', icon: Pen },
  { id: 'slides', label: 'スライド', icon: Presentation },
]

// ==========================================
// InfoSidebar データ
// ==========================================

const FEATURES: Feature[] = [
  { icon: Presentation, title: '14枚スライド自動生成', description: 'Excelデータと手動入力から、グラフ・表を含む14枚のプレゼンテーション用スライドを自動生成します。', benefit: 'レポート作成時間を丸1日→30分に短縮' },
  { icon: TrendingUp, title: '複合グラフ分析', description: '客単価（棒グラフ）・稼働率・再来率（折れ線）を2軸で統合表示。年間推移を一目で把握できます。', benefit: '経営判断のスピードが3倍に向上' },
  { icon: PieChart, title: '累計平均比較', description: '当月値と累計平均を並べてスタッフ個人の成長・課題を可視化。先月比テーブル・グラフも自動生成されます。', benefit: 'スタッフ評価の精度が大幅向上' },
  { icon: FileSpreadsheet, title: 'Excel自動取込', description: '担当者別分析表（.xlsx）をドラッグ&ドロップするだけで、3店舗分のデータを自動パース・集計します。', benefit: 'データ入力ミスを90%削減' },
]

const TIME_EFFICIENCY: TimeEfficiencyItem[] = [
  { task: '月次レポート作成', before: '8時間', after: '30分', saved: '7.5時間/月' },
  { task: 'グラフ・表の作成', before: '3時間', after: '自動生成', saved: '3時間/月' },
  { task: '前月比較データ集計', before: '2時間', after: '即時表示', saved: '2時間/月' },
  { task: '部門別データ集約', before: '4時間', after: '15分', saved: '3.75時間/月' },
]

const CHALLENGES = [
  '毎月のレポート作成に丸1日以上かかる',
  'Excelからパワポへの転記でミスが発生する',
  '部門間の数値フォーマットが統一されていない',
  '経営者への報告が遅れがち',
  'スタッフ個々の成長推移が見えにくい',
]

const OVERVIEW: OverviewInfo = {
  description: '美容サロン月次業績レポート自動生成システム。Excelの担当者別分析表から14枚のスライドを自動構成し、複合グラフ・累計平均比較・先月比分析を提供します。',
  automationPoints: [
    'Excelデータの自動パースと3店舗分の集約',
    '客単価・稼働率・再来率の年間推移グラフ自動生成',
    'スタッフ別パフォーマンスの累計平均比較',
    '先月比テーブル・グラフの自動構成（売上/指名/再来率/客単価）',
  ],
  userBenefits: [
    'レポート作成の丸1日が30分に短縮',
    '転記ミスゼロで数値の信頼性が向上',
    'スタッフの成長・課題が一目で把握可能',
  ],
}

const OPERATION_STEPS: OperationStep[] = [
  { step: 1, action: 'Excelファイルを取込', detail: '担当者別分析表（3店舗分）をドラッグ&ドロップで取込' },
  { step: 2, action: '取込データを確認', detail: '店舗別タブでスタッフの売上・客数・指名数を確認' },
  { step: 3, action: '手動データを入力', detail: '店舗KPI・スタッフ稼働率・お客様の声を入力' },
  { step: 4, action: 'スライドを確認', detail: '自動生成された14枚のスライドを確認・印刷' },
]

// ==========================================
// ガイダンスステップ
// ==========================================

const getGuidanceSteps = (setSection: (section: SectionKey) => void): GuidanceStep[] => [
  { targetSelector: '[data-guidance="tab-guidance"]', title: 'ガイダンス', description: '資料作成の3ステップと完了状況を確認できます。まずはここで全体像を把握しましょう。', position: 'bottom', action: () => setSection('guidance') },
  { targetSelector: '[data-guidance="load-mock-button"]', title: 'モックデータ読込', description: 'デモ用に2026年通年のサンプルデータを一括生成できます。初回はこちらを使ってお試しください。', position: 'top', action: () => setSection('guidance') },
  { targetSelector: '[data-guidance="tab-import"]', title: 'Excel取込タブ', description: 'Excelファイル（担当者別分析表）をアップロードして業績データを取り込みます。', position: 'bottom', action: () => setSection('guidance') },
  { targetSelector: '[data-guidance="upload-area"]', title: 'ファイルアップロード', description: 'ここにExcelファイルをドラッグ&ドロップ、またはクリックして選択します。3店舗分アップロードしてください。', position: 'bottom', action: () => setSection('import') },
  { targetSelector: '[data-guidance="tab-import-data"]', title: 'データ確認タブ', description: '取り込んだExcelデータを店舗別タブで確認できます。スタッフの売上・客数・指名数が表示されます。', position: 'bottom', action: () => setSection('import') },
  { targetSelector: '[data-guidance="store-tabs"]', title: '店舗タブ', description: '港北店・青葉店・中央店を切り替えて、各店舗のデータを確認します。', position: 'bottom', action: () => setSection('import-data') },
  { targetSelector: '[data-guidance="tab-manual-input"]', title: '手動入力タブ', description: '店舗KPI・スタッフ稼働率・お客様の声を入力します。スライドに反映されます。', position: 'bottom', action: () => setSection('import-data') },
  { targetSelector: '[data-guidance="manual-tabs"]', title: 'サブタブ切替', description: '店舗KPI / スタッフ稼働率・CS登録数 / お客様の声の3つのタブを切り替えて入力します。', position: 'bottom', action: () => setSection('manual-input') },
  { targetSelector: '[data-guidance="customer-voice-tab"]', title: 'お客様の声', description: '「お客様の声」タブに入力したテキストがスライド14に反映されます。', position: 'bottom', action: () => setSection('manual-input') },
  { targetSelector: '[data-guidance="tab-slides"]', title: 'スライドタブ', description: '入力データから自動生成された14枚のスライドを確認できます。グラフ・表がすべて自動で構成されます。', position: 'bottom', action: () => setSection('manual-input') },
  { targetSelector: '[data-guidance="view-mode-toggle"]', title: '表示モード切替', description: 'スクロール表示とページ切替表示を切り替えられます。全画面表示も可能です。', position: 'bottom', action: () => setSection('slides') },
  { targetSelector: '[data-guidance="filter-bar"]', title: 'フィルタバー', description: '店舗・スタッフを絞り込んでスライドの表示内容をカスタマイズできます。', position: 'top', action: () => setSection('slides') },
]

// ==========================================
// メインコンポーネント
// ==========================================

const RegrowMockPage = () => {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen theme="violet" systemName="月次業績レポートシステム" subtitle="ReGrow Analytics" />
  }

  return (
    <MockDataContextProvider>
      <RegrowMockPageInner />
    </MockDataContextProvider>
  )
}

// ==========================================
// ヘッダー＋本体（DataContext内で使用）
// ==========================================

const RegrowMockPageInner = () => {
  const [showInfoSidebar, setShowInfoSidebar] = useState(false)
  const [showGuidance, setShowGuidance] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionKey>('guidance')
  const [showNewMonthInput, setShowNewMonthInput] = useState(false)
  const [newMonthValue, setNewMonthValue] = useState('')

  const { currentYearMonth, availableMonths, setCurrentYearMonth, createNewMonth } = useDataContext()

  // 新規年月作成
  const handleCreateMonth = () => {
    if (!newMonthValue) return
    if (!/^\d{4}-\d{2}$/.test(newMonthValue)) return
    if (availableMonths.includes(newMonthValue)) {
      setCurrentYearMonth(newMonthValue)
      setShowNewMonthInput(false)
      setNewMonthValue('')
      return
    }
    createNewMonth(newMonthValue)
    setCurrentYearMonth(newMonthValue)
    setShowNewMonthInput(false)
    setNewMonthValue('')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* 左: アイコン + タイトル + 年月セレクター */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
              <BarChart3 className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600">
                Sales Analytics
              </h1>
              <p className="text-xs text-stone-400 -mt-0.5">月次業績レポートシステム</p>
            </div>

            {/* 年月セレクター */}
            <div className="ml-2 flex items-center gap-1">
              <button
                onClick={() => {
                  const idx = availableMonths.indexOf(currentYearMonth)
                  if (idx < availableMonths.length - 1) setCurrentYearMonth(availableMonths[idx + 1])
                }}
                className="p-1 text-stone-400 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors"
                title="前月"
              >
                <ChevronLeft size={14} />
              </button>
              <select
                value={currentYearMonth}
                onChange={(e) => setCurrentYearMonth(e.target.value)}
                className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-lg border border-violet-200 cursor-pointer hover:bg-violet-100 transition-colors appearance-none text-center"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>{formatYearMonth(m)}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const idx = availableMonths.indexOf(currentYearMonth)
                  if (idx > 0) setCurrentYearMonth(availableMonths[idx - 1])
                }}
                className="p-1 text-stone-400 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors"
                title="次月"
              >
                <ChevronRight size={14} />
              </button>

              {/* 新規年月作成 */}
              {showNewMonthInput ? (
                <div className="flex items-center gap-1 ml-1">
                  <input
                    type="month"
                    value={newMonthValue}
                    onChange={(e) => setNewMonthValue(e.target.value)}
                    className="px-2 py-1 text-xs border border-violet-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateMonth}
                    className="px-2 py-1 text-xs bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                  >
                    作成
                  </button>
                  <button
                    onClick={() => { setShowNewMonthInput(false); setNewMonthValue('') }}
                    className="px-2 py-1 text-xs text-stone-500 hover:text-stone-700"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewMonthInput(true)}
                  className="p-1 text-stone-400 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors"
                  title="新規年月を作成"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
          </div>

          {/* 右: ガイダンス + リセット + タブ */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuidance(true)}
              className="p-2 text-stone-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
              title="ガイダンス開始"
            >
              <HelpCircle size={16} />
            </button>
            <button
              onClick={() => {
                if (!window.confirm('データを初期状態に戻しますか？')) return
                localStorage.removeItem('regrow-data')
                window.location.reload()
              }}
              className="p-2 text-stone-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
              title="初期値に戻す"
            >
              <RotateCcw size={16} />
            </button>

            {/* タブナビゲーション */}
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  data-guidance={`tab-${tab.id}`}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeSection === tab.id
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                    : 'text-stone-600 hover:bg-stone-50 border border-transparent hover:border-violet-200'
                    }`}
                >
                  <Icon size={16} />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              )
            })}
            <button
              data-guidance="info-button"
              onClick={() => setShowInfoSidebar(true)}
              className="ml-2 p-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 flex items-center gap-2"
              title="このシステムでできること"
            >
              <PanelRightOpen className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">機能説明</span>
            </button>
          </div>
        </div>
      </header>

      {/* RegrowMockUnifiedNew本体（ナビ非表示） */}
      <RegrowMockUnifiedNew
        externalSection={activeSection}
        onSectionChange={(section) => setActiveSection(section)}
        hideNavigation
      />

      {/* 機能説明サイドバー */}
      <InfoSidebar
        isOpen={showInfoSidebar}
        onClose={() => setShowInfoSidebar(false)}
        theme="violet"
        systemIcon={BarChart3}
        systemName="月次業績レポートシステム"
        systemDescription="美容サロン月次業績レポート自動生成システム。Excelの担当者別分析表から14枚のスライドを自動構成します。"
        features={FEATURES}
        timeEfficiency={TIME_EFFICIENCY}
        challenges={CHALLENGES}
        overview={OVERVIEW}
        operationSteps={OPERATION_STEPS}
      />

      {/* ガイダンスオーバーレイ */}
      <GuidanceOverlay
        steps={getGuidanceSteps(setActiveSection)}
        isActive={showGuidance}
        onClose={() => setShowGuidance(false)}
        theme="violet"
      />
    </div>
  )
}

export default RegrowMockPage
