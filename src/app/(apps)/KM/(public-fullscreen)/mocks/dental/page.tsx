'use client'

import React, {useState} from 'react'
import {PanelRightOpen, Stethoscope, ClipboardList, MapPin, FileText, Calendar} from 'lucide-react'
import {InfoSidebar, type Feature, type TimeEfficiencyItem} from '../_components'
import DentalAppMock from '@app/(apps)/dental/doc/mock/DentalAppMock'

// ==========================================
// 機能説明データ
// ==========================================

const FEATURES: Feature[] = [
  {
    icon: ClipboardList,
    title: '患者管理・診療記録',
    description:
      '患者情報・既往歴・診療記録を一元管理。訪問先施設ごとに患者を一覧表示し、過去の記録も即座に参照できます。',
    benefit: 'カルテ検索時間を1件5分→10秒に短縮',
  },
  {
    icon: MapPin,
    title: '訪問スケジュール管理',
    description:
      '訪問先施設・時間帯・担当歯科医をカレンダーで一括管理。ルート最適化で移動時間を削減します。',
    benefit: '移動時間を平均20%削減',
  },
  {
    icon: FileText,
    title: 'ドキュメント自動生成',
    description:
      '診療計画書・報告書・請求書をテンプレートから自動生成。手書きや転記ミスを防止します。',
    benefit: '書類作成時間を70%削減',
  },
  {
    icon: Calendar,
    title: '施設別管理',
    description:
      '介護施設・グループホーム・在宅など訪問先タイプ別に患者を管理。施設担当者との連絡履歴も記録できます。',
    benefit: '施設対応の抜け漏れゼロを実現',
  },
]

const TIME_EFFICIENCY: TimeEfficiencyItem[] = [
  {task: '診療記録の入力', before: '30分/件', after: '5分/件', saved: '25分/件'},
  {task: '報告書作成', before: '1時間', after: '10分', saved: '50分/件'},
  {task: '患者情報の検索', before: '5分', after: '10秒', saved: '4分50秒/件'},
  {task: '月次レポート集計', before: '3時間', after: '自動生成', saved: '3時間/月'},
]

const CHALLENGES = [
  '訪問先で紙カルテを持ち歩くのが大変',
  '診療記録の転記ミスが発生する',
  '施設ごとの患者状況を把握しにくい',
  '報告書作成に時間がかかりすぎる',
  '訪問スケジュールの調整が煩雑',
]

// ==========================================
// メインコンポーネント
// ==========================================

export default function DentalMockPage() {
  const [showInfoSidebar, setShowInfoSidebar] = useState(false)

  return (
    <div className="relative">
      {/* フローティング「機能説明」ボタン */}
      <button
        onClick={() => setShowInfoSidebar(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-sky-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:to-sky-700 transition-all duration-200"
      >
        <PanelRightOpen className="w-4 h-4" />
        <span className="text-sm font-medium">機能説明</span>
      </button>

      {/* 機能説明サイドバー */}
      <InfoSidebar
        isOpen={showInfoSidebar}
        onClose={() => setShowInfoSidebar(false)}
        theme="blue"
        systemIcon={Stethoscope}
        systemName="訪問歯科管理システム"
        systemDescription="訪問歯科診療に特化した業務管理システムです。患者管理・診療記録・スケジュール管理・ドキュメント生成を統合し、訪問診療の効率を大幅に向上させます。"
        features={FEATURES}
        timeEfficiency={TIME_EFFICIENCY}
        challenges={CHALLENGES}
      />

      {/* 既存モックコンポーネント */}
      <DentalAppMock />
    </div>
  )
}
