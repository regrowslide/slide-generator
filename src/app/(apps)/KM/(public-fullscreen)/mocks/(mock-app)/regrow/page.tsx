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
  RotateCcw,
} from 'lucide-react'
import RegrowMockUnifiedNew from './RegrowMockUnifiedNew'
import { MockDataContextProvider } from './context/MockDataContext'
import type { SectionKey } from '@app/(apps)/regrow/types'
import {
  SplashScreen,
  useInfoModal,
  GuidanceOverlay,
  type Feature,
  type TimeEfficiencyItem,
  type OverviewInfo,
  type OperationStep,
  type GuidanceStep,
} from '../../_components'

// ==========================================
// InfoSidebar データ
// ==========================================

const FEATURES: Feature[] = [
  { icon: Presentation, title: '18枚スライド自動生成', description: 'Excelデータと手動入力から、グラフ・表を含む18枚のプレゼンテーション用スライドを自動生成します。', benefit: 'レポート作成時間を丸1日→30分に短縮' },
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
  description: '美容サロン月次業績レポート自動生成システム。Excelの担当者別分析表から18枚のスライドを自動構成し、複合グラフ・累計平均比較・先月比分析を提供します。',
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
  { step: 4, action: '目標売上を入力', detail: 'スタッフ別の月間目標売上を入力し、達成率を確認' },
  { step: 5, action: 'スライドを確認', detail: '自動生成された18枚のスライドを確認・印刷' },
]

// ==========================================
// ガイダンスステップ
// ==========================================

const getGuidanceSteps = (setSection: (section: SectionKey) => void): GuidanceStep[] => [
  { targetSelector: '[data-guidance="tab-import"]', title: 'Excel取込タブ', description: 'Excelファイル（担当者別分析表）をアップロードして業績データを取り込みます。', position: 'bottom', action: () => setSection('import') },
  { targetSelector: '[data-guidance="upload-area"]', title: 'ファイルアップロード', description: 'ここにExcelファイルをドラッグ&ドロップ、またはクリックして選択します。3店舗分アップロードしてください。', position: 'bottom', action: () => setSection('import') },
  { targetSelector: '[data-guidance="tab-import-data"]', title: 'データ確認タブ', description: '取り込んだExcelデータを店舗別タブで確認できます。スタッフの売上・客数・指名数が表示されます。', position: 'bottom', action: () => setSection('import') },
  { targetSelector: '[data-guidance="store-tabs"]', title: '店舗タブ', description: '港北店・青葉店・中央店を切り替えて、各店舗のデータを確認します。', position: 'bottom', action: () => setSection('import-data') },
  { targetSelector: '[data-guidance="tab-manual-input"]', title: '手動入力タブ', description: '店舗KPI・スタッフ稼働率・お客様の声を入力します。スライドに反映されます。', position: 'bottom', action: () => setSection('import-data') },
  { targetSelector: '[data-guidance="manual-tabs"]', title: 'サブタブ切替', description: '店舗KPI / スタッフ稼働率・CS登録数 / お客様の声の3つのタブを切り替えて入力します。', position: 'bottom', action: () => setSection('manual-input') },
  { targetSelector: '[data-guidance="customer-voice-tab"]', title: 'お客様の声', description: '「お客様の声」タブに入力したテキストがスライド18に反映されます。', position: 'bottom', action: () => setSection('manual-input') },
  { targetSelector: '[data-guidance="tab-target-sales"]', title: '目標売上タブ', description: 'スタッフ別の月間目標売上を入力します。達成率がスライドに自動反映されます。', position: 'bottom', action: () => setSection('manual-input') },
  { targetSelector: '[data-guidance="tab-slides"]', title: 'スライドタブ', description: '入力データから自動生成された18枚のスライドを確認できます。グラフ・表がすべて自動で構成されます。', position: 'bottom', action: () => setSection('target-sales') },
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
// 本体（本番と同じレイアウト + モック用コントロール）
// ==========================================

const RegrowMockPageInner = () => {
  const [showGuidance, setShowGuidance] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionKey>('slides')

  const { InfoModal, openInfo } = useInfoModal({
    theme: 'violet',
    systemIcon: BarChart3,
    systemName: '月次業績レポートシステム',
    systemDescription: '美容サロン月次業績レポート自動生成システム。Excelの担当者別分析表から18枚のスライドを自動構成します。',
    features: FEATURES,
    timeEfficiency: TIME_EFFICIENCY,
    challenges: CHALLENGES,
    overview: OVERVIEW,
    operationSteps: OPERATION_STEPS,
  })

  return (
    <div className="min-h-screen bg-gray-100">
      {/* モック用コントロールバー（小さく目立たない） */}
      <div className="bg-gray-800 text-gray-300 px-4 py-1.5 flex items-center justify-between text-xs">
        <span className="font-medium">DEMO MODE</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGuidance(true)}
            className="flex items-center gap-1 hover:text-white transition-colors"
            title="ガイダンス開始"
          >
            <HelpCircle size={14} />
            <span>ガイダンス</span>
          </button>
          <button
            onClick={() => {
              if (!window.confirm('データを初期状態に戻しますか？')) return
              localStorage.removeItem('regrow-data')
              window.location.reload()
            }}
            className="flex items-center gap-1 hover:text-white transition-colors"
            title="初期値に戻す"
          >
            <RotateCcw size={14} />
            <span>リセット</span>
          </button>
          <button
            onClick={openInfo}
            className="flex items-center gap-1 px-2 py-0.5 bg-violet-600 text-white rounded hover:bg-violet-700 transition-colors"
            title="このシステムでできること"
          >
            <PanelRightOpen size={14} />
            <span>機能説明</span>
          </button>
        </div>
      </div>

      {/* 本番と同じレイアウト（MonthSelector + タブバー + ビュー） */}
      <RegrowMockUnifiedNew
        externalSection={activeSection}
        onSectionChange={(section) => setActiveSection(section)}
      />

      <InfoModal />

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
