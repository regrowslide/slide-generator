'use client'

import React, {useState} from 'react'
import {PanelRightOpen, BarChart3, Presentation, TrendingUp, PieChart, FileSpreadsheet} from 'lucide-react'
import {
  InfoSidebar,
  GuidanceOverlay,
  GuidanceStartButton,
  type Feature,
  type TimeEfficiencyItem,
  type OverviewInfo,
  type OperationStep,
  type GuidanceStep,
} from '../_components'
import RegrowMockUnifiedNew from '@app/(apps)/regrow/(pages)/mock/RegrowMockUnifiedNew'

// ==========================================
// 機能説明データ
// ==========================================

const FEATURES: Feature[] = [
  {
    icon: Presentation,
    title: '自動スライド生成',
    description:
      '月次の業績データからプレゼンテーション用スライドを自動生成。16枚構成でグラフ・表を含む包括的なレポートを作成します。',
    benefit: 'レポート作成時間を丸1日→30分に短縮',
  },
  {
    icon: TrendingUp,
    title: '売上推移分析',
    description:
      '月次・四半期・年次の売上推移をグラフで可視化。前年同月比や目標達成率も自動算出されます。',
    benefit: '経営判断のスピードが3倍に向上',
  },
  {
    icon: PieChart,
    title: 'KPI可視化',
    description:
      '営業利益率・粗利率・人件費率などの重要指標をダッシュボードに集約。異常値は自動でハイライトされます。',
    benefit: '数値の見落としリスクを90%削減',
  },
  {
    icon: FileSpreadsheet,
    title: '部門別比較',
    description:
      '部門・事業所ごとの業績を横並びで比較。強み・弱みの把握と改善アクションの立案を支援します。',
    benefit: '部門間の情報共有コストを60%削減',
  },
]

const TIME_EFFICIENCY: TimeEfficiencyItem[] = [
  {task: '月次レポート作成', before: '8時間', after: '30分', saved: '7.5時間/月'},
  {task: 'グラフ・表の作成', before: '3時間', after: '自動生成', saved: '3時間/月'},
  {task: '前年比較データ集計', before: '2時間', after: '即時表示', saved: '2時間/月'},
  {task: '部門別データ集約', before: '4時間', after: '15分', saved: '3.75時間/月'},
]

const CHALLENGES = [
  '毎月のレポート作成に丸1日以上かかる',
  'Excelからパワポへの転記でミスが発生する',
  '部門間の数値フォーマットが統一されていない',
  '経営者への報告が遅れがち',
  'データの見せ方に悩む時間が長い',
]

const OVERVIEW: OverviewInfo = {
  description: '月次の業績データをスライド形式で自動生成するレポーティングシステムです。売上推移・KPI分析・部門別比較など16枚のスライドを自動構成します。',
  automationPoints: [
    'Excelデータの取り込みからスライド自動生成',
    '前年同月比・目標達成率の自動算出',
    'グラフ・表の自動レイアウトと配色',
    '部門別・事業所別の横断比較を自動構成',
  ],
  userBenefits: [
    'レポート作成の丸1日が30分に短縮',
    '転記ミスゼロで数値の信頼性が向上',
    '経営者への迅速な報告で意思決定を加速',
  ],
}

const OPERATION_STEPS: OperationStep[] = [
  {step: 1, action: 'データをインポート', detail: 'Excelファイルまたは手動で月次の業績データを入力'},
  {step: 2, action: '各スライドを確認', detail: '自動生成された16枚のスライドの内容を確認・調整'},
  {step: 3, action: 'スライドを生成', detail: 'プレゼンテーション形式でスライドを出力'},
  {step: 4, action: 'プレゼンテーション', detail: '生成されたスライドで経営会議に報告'},
]

const GUIDANCE_STEPS: GuidanceStep[] = [
  {targetSelector: '[data-guidance="info-button"]', title: '機能説明', description: 'システムの概要・操作手順・時間削減効果を確認できます。右下のボタンからいつでも開けます。', position: 'top'},
]

// ==========================================
// メインコンポーネント
// ==========================================

export default function RegrowMockPage() {
  const [showInfoSidebar, setShowInfoSidebar] = useState(false)
  const [showGuidance, setShowGuidance] = useState(false)

  return (
    <div className="relative">
      {/* ガイダンスボタン（固定位置） */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <GuidanceStartButton onClick={() => setShowGuidance(true)} theme="violet" />
        {/* フローティング「機能説明」ボタン */}
        <button
          data-guidance="info-button"
          onClick={() => setShowInfoSidebar(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl shadow-lg shadow-violet-500/30 hover:from-violet-600 hover:to-purple-700 transition-all duration-200"
        >
          <PanelRightOpen className="w-4 h-4" />
          <span className="text-sm font-medium">機能説明</span>
        </button>
      </div>

      {/* 機能説明サイドバー */}
      <InfoSidebar
        isOpen={showInfoSidebar}
        onClose={() => setShowInfoSidebar(false)}
        theme="violet"
        systemIcon={BarChart3}
        systemName="月次業績レポートシステム"
        systemDescription="月次の業績データをスライド形式で自動生成するレポーティングシステムです。売上推移・KPI分析・部門別比較など16枚のスライドを自動構成します。"
        features={FEATURES}
        timeEfficiency={TIME_EFFICIENCY}
        challenges={CHALLENGES}
        overview={OVERVIEW}
        operationSteps={OPERATION_STEPS}
      />

      <GuidanceOverlay
        steps={GUIDANCE_STEPS}
        isActive={showGuidance}
        onClose={() => setShowGuidance(false)}
        theme="violet"
      />

      {/* 既存モックコンポーネント */}
      <RegrowMockUnifiedNew />
    </div>
  )
}
