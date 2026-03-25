'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  LayoutDashboard,
  CalendarDays,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  SplashScreen,
  useInfoModal,
  GuidanceOverlay,
  GuidanceStartButton,
  MockHeader,
  MockHeaderTitle,
  MockHeaderTab,
  MockHeaderInfoButton,
  type Feature,
  type TimeEfficiencyItem,
  type OverviewInfo,
  type OperationStep,
  type GuidanceStep,
} from '../../_components'
import DashboardTab from './components/DashboardTab'
import ShiftTab from './components/ShiftTab'
import PlTab from './components/PlTab'

// ==========================================
// 機能説明データ
// ==========================================

const FEATURES: Feature[] = [
  { icon: CalendarDays, title: 'シフト管理', description: 'カレンダー形式でスタッフを案件に配置。空きスタッフの確認と配置が一画面で完結。', benefit: 'シフト作成時間を90%短縮' },
  { icon: DollarSign, title: '個人別PL', description: 'スタッフごとの売上・支払・粗利を自動算出。自社/他社フィルタやソート機能で分析が即座に可能。', benefit: 'PL算出を完全自動化' },
  { icon: LayoutDashboard, title: 'ダッシュボード', description: 'KPI・ランキング・グラフで経営状態を可視化。粗利率の低いスタッフも一目で把握。', benefit: '経営判断をリアルタイム化' },
  { icon: Users, title: 'マスタ管理', description: 'クライアント・スタッフ・単価の一元管理。役割別単価設定で複雑な料金体系にも対応。', benefit: 'マスタ管理の属人化を解消' },
]

const TIME_EFFICIENCY: TimeEfficiencyItem[] = [
  { task: 'シフト作成', before: '3時間/月', after: '30分/月', saved: '2.5時間/月' },
  { task: 'PL算出', before: '2時間/月', after: '自動生成', saved: '2時間/月' },
  { task: '月次レポート', before: '3時間/月', after: 'ワンクリック', saved: '3時間/月' },
  { task: 'スタッフ稼働確認', before: '30分/日', after: 'ダッシュボード即確認', saved: '30分/日' },
]

const CHALLENGES = [
  'シフト表をExcelで管理しており、変更のたびに手作業で修正が必要',
  'スタッフごとの粗利を算出するのに毎月数時間かかる',
  '空きスタッフの把握が難しく、配置漏れや二重配置が発生する',
  '自社スタッフと他社スタッフの収益性の比較ができていない',
  '経営数値の把握が月次レポート待ちで、リアルタイムに確認できない',
]

const OVERVIEW: OverviewInfo = {
  description: 'イベント人材会社のシフト管理・収益管理をデジタル化するシステムです。スタッフの配置からPL算出、経営ダッシュボードまで一気通貫で管理します。',
  automationPoints: [
    'カレンダー形式でのドラッグ&ドロップによるシフト配置',
    '単価マスタに基づく売上・支払・粗利の自動算出',
    'KPI・ランキング・グラフによるリアルタイム経営可視化',
    '空きスタッフの自動検出と配置提案',
  ],
  userBenefits: [
    'シフト作成の大幅な時間短縮と配置ミスの防止',
    'スタッフごとの収益性をリアルタイムで把握',
    'データに基づく人材配置の最適化と経営判断',
  ],
}

const OPERATION_STEPS: OperationStep[] = [
  { step: 1, action: 'ダッシュボードを確認', detail: '総売上・粗利・稼働状況などのKPIとランキングを一目で把握' },
  { step: 2, action: 'シフトを確認・配置', detail: 'カレンダー形式で空きスタッフを確認し、クライアントに配置' },
  { step: 3, action: '個人別PLを確認', detail: 'スタッフごとの売上・支払・粗利率をテーブルで確認・分析' },
  { step: 4, action: '低粗利スタッフを特定', detail: 'ダッシュボードの分析セクションで改善対象を特定' },
  { step: 5, action: '月次レポートを出力', detail: 'ダッシュボードのデータをもとに経営会議資料を作成' },
]

// ==========================================
// タブ定義
// ==========================================

type TabId = 'dashboard' | 'shift' | 'pl'

interface Tab {
  id: TabId
  label: string
  icon: typeof LayoutDashboard
}

const TABS: Tab[] = [
  { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { id: 'shift', label: 'シフト管理', icon: CalendarDays },
  { id: 'pl', label: '個人別PL', icon: DollarSign },
]

// ==========================================
// ガイダンスステップ
// ==========================================

const getGuidanceSteps = (setActiveTab: (tab: TabId) => void): GuidanceStep[] => [
  { targetSelector: '[data-guidance="dashboard-tab"]', title: 'ダッシュボード', description: 'KPI・ランキング・分析グラフで経営状態をリアルタイムに確認できます。', position: 'bottom', action: () => setActiveTab('dashboard') },
  { targetSelector: '[data-guidance="shift-tab"]', title: 'シフト管理', description: 'カレンダー形式でスタッフの配置状況を確認。空きスタッフの把握も一目瞭然。', position: 'bottom', action: () => setActiveTab('dashboard') },
  { targetSelector: '[data-guidance="shift-available"]', title: '空きスタッフ', description: '稼働可能だが未配置のスタッフを日付別に表示。ここからドラッグ&ドロップで配置します。', position: 'bottom', action: () => setActiveTab('shift') },
  { targetSelector: '[data-guidance="shift-calendar"]', title: '配置表', description: 'クライアント別×日付のカレンダーで配置状況を一覧表示。役割バッジで一目で確認。', position: 'bottom', action: () => setActiveTab('shift') },
  { targetSelector: '[data-guidance="pl-tab"]', title: '個人別PL', description: 'スタッフごとの売上・支払・粗利を自動算出。フィルタとソートで多角的に分析。', position: 'bottom', action: () => setActiveTab('shift') },
  { targetSelector: '[data-guidance="pl-filter"]', title: 'フィルター', description: '全員・自社・他社でフィルタリング。収益性の比較に活用できます。', position: 'bottom', action: () => setActiveTab('pl') },
  { targetSelector: '[data-guidance="info-button"]', title: '機能説明', description: 'システムの概要・操作手順・時間削減効果を確認できます。右下のボタンからいつでも開けます。', position: 'top', action: () => setActiveTab('pl') },
]

// ==========================================
// 月セレクター（ヘッダー内用）
// ==========================================

const MonthSelector = ({
  year,
  month,
  onChange,
}: {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}) => {
  const handlePrev = () => {
    if (month === 1) onChange(year - 1, 12)
    else onChange(year, month - 1)
  }
  const handleNext = () => {
    if (month === 12) onChange(year + 1, 1)
    else onChange(year, month + 1)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrev}
        className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-gray-500" />
      </button>
      <span className="text-sm font-bold min-w-[100px] text-center text-gray-700">
        {year}年 {month}月
      </span>
      <button
        onClick={handleNext}
        className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  )
}

// ==========================================
// メインコンポーネント
// ==========================================

export default function SteersMockPage() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [showSplash, setShowSplash] = useState(true)
  const [showGuidance, setShowGuidance] = useState(false)
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(3)

  const { InfoModal, openInfo } = useInfoModal({
    theme: 'emerald',
    systemIcon: Users,
    systemName: 'イベント人材シフト管理システム',
    systemDescription: 'イベント人材会社のシフト管理・収益管理をデジタル化するシステムです。スタッフの配置からPL算出、経営ダッシュボードまで一気通貫で管理します。',
    features: FEATURES,
    timeEfficiency: TIME_EFFICIENCY,
    challenges: CHALLENGES,
    overview: OVERVIEW,
    operationSteps: OPERATION_STEPS,
  })

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen theme="emerald" systemName="イベント人材シフト管理システム" subtitle="Event Staff Shift Management" />
  }

  const TAB_VIEWS: Record<TabId, React.ReactNode> = {
    dashboard: <DashboardTab year={year} month={month} />,
    shift: <ShiftTab year={year} month={month} />,
    pl: <PlTab year={year} month={month} />,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-green-50/20 font-sans">
      <MockHeader>
        <MockHeaderTitle icon={Users} title="イベント人材シフト管理" subtitle="Event Staff Shift Management" theme="emerald" />

        <div className="flex items-center gap-2">
          <GuidanceStartButton onClick={() => setShowGuidance(true)} theme="emerald" />
          <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} />
          {TABS.map((tab) => (
            <MockHeaderTab
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
              theme="emerald"
              data-guidance={`${tab.id}-tab`}
            />
          ))}
          <MockHeaderInfoButton onClick={openInfo} theme="emerald" />
        </div>
      </MockHeader>

      <main className={`mx-auto py-6 ${activeTab === 'shift' ? 'px-4' : 'max-w-7xl px-4 sm:px-6 lg:px-8'}`}>
        {/* シフト管理タブ用のdata-guidance属性 */}
        {activeTab === 'shift' && (
          <>
            <div data-guidance="shift-available" />
            <div data-guidance="shift-calendar" />
          </>
        )}
        {/* PL タブ用のdata-guidance属性 */}
        {activeTab === 'pl' && (
          <div data-guidance="pl-filter" />
        )}
        {TAB_VIEWS[activeTab]}
      </main>

      <InfoModal />

      <GuidanceOverlay
        steps={getGuidanceSteps(setActiveTab)}
        isActive={showGuidance}
        onClose={() => setShowGuidance(false)}
        theme="emerald"
      />
    </div>
  )
}
