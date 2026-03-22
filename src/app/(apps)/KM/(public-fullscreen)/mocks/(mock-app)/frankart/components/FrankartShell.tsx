'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Briefcase,
  LayoutDashboard,
  List,
  Handshake,
  Users,
  Settings,
  RotateCcw,
  PanelRightOpen,
  LucideIcon,
} from 'lucide-react'
import { FrankartMockDataProvider, useFrankartMockData } from '../context/MockDataContext'
import {
  SplashScreen,
  useInfoModal,
  type Feature,
  type TimeEfficiencyItem,
  type OverviewInfo,
  type OperationStep,
} from '../../../_components'

const BASE = '/KM/mocks/frankart'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  matchPrefix?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: BASE, label: 'ダッシュボード', icon: LayoutDashboard },
  { href: `${BASE}/deals`, label: '案件管理', icon: List, matchPrefix: `${BASE}/deals` },
  { href: `${BASE}/contacts`, label: '取引先', icon: Users },
  { href: `${BASE}/settings`, label: '設定', icon: Settings },
]

// InfoModal データ
const FEATURES: Feature[] = [
  {
    icon: Briefcase,
    title: '案件専用ルーム',
    description:
      '案件ごとにチャット・ToDo・見積・ファイルを集約。情報の散在を防ぎ、チーム全員が最新状況を把握できます。',
    benefit: '案件情報の検索時間を90%削減',
  },
  {
    icon: List,
    title: 'パイプライン管理',
    description:
      'リード→商談→提案→受注の各ステータスで案件を一覧管理。フィルタ・検索で必要な案件をすぐに確認。',
    benefit: '営業進捗を一目で把握',
  },
  {
    icon: Handshake,
    title: '商談・議事録管理',
    description:
      '商談スケジュールと議事録を紐付け管理。お礼メールリマインドで顧客フォローの抜け漏れを防止。',
    benefit: 'フォロー漏れゼロ',
  },
  {
    icon: Users,
    title: '取引先・顧問管理',
    description:
      '取引先企業・担当者・顧問情報を一元管理。案件との紐付けで関係者をすぐに参照できます。',
    benefit: '顧客情報を即座にアクセス',
  },
]
const TIME_EFFICIENCY: TimeEfficiencyItem[] = [
  { task: '案件情報の確認', before: '15分/件', after: '1クリック', saved: '14分/件' },
  { task: '商談議事録の共有', before: 'メール転送', after: 'ルーム内自動共有', saved: '手間ゼロ' },
  { task: '見積書の管理', before: 'ファイルサーバー検索', after: '案件ルーム内', saved: '5分/回' },
  {
    task: 'フォロー状況の確認',
    before: '各自の手帳・メモ',
    after: 'ダッシュボード表示',
    saved: '30分/日',
  },
]
const CHALLENGES = [
  '案件情報がメール・Excel・チャットに分散している',
  '商談後のフォローアップが属人的で抜け漏れがある',
  '見積書・契約書のバージョン管理ができていない',
  '営業パイプラインの全体像が見えない',
  '顧問への相談タイミングを逃すことがある',
]
const OVERVIEW: OverviewInfo = {
  description:
    '案件を基軸とした統合営業管理システムです。案件専用ルームにチャット・ToDo・見積・ファイルを集約し、チーム全体の営業活動を可視化します。',
  automationPoints: [
    '案件ごとの専用ルームで情報を一元管理',
    'パイプラインビューで営業進捗を可視化',
    '商談議事録とフォローアップを自動リマインド',
    '見積書・契約書のバージョン管理を自動化',
  ],
  userBenefits: [
    '案件の全情報が1クリックで確認できる',
    'チーム全員が最新の営業状況を共有できる',
    'フォロー漏れがなくなり受注率が向上する',
  ],
}
const OPERATION_STEPS: OperationStep[] = [
  {
    step: 1,
    action: '案件を登録する',
    detail: '取引先・見込み金額・担当者を入力して案件を作成',
  },
  {
    step: 2,
    action: '案件ルームで活動する',
    detail: 'チャット・ToDo・見積・ファイルで案件を推進',
  },
  { step: 3, action: '商談を記録する', detail: '議事録を入力し、次回フォローを設定' },
  {
    step: 4,
    action: 'ダッシュボードで全体把握',
    detail: 'KPI・アラート・タスクで営業活動を管理',
  },
]

// ヘッダー + ナビゲーション
const FrankartHeader = () => {
  const pathname = usePathname() ?? ''
  const { resetAll } = useFrankartMockData()

  const { InfoModal, openInfo } = useInfoModal({
    theme: 'slate',
    systemIcon: Briefcase,
    systemName: 'Frankart 案件統合管理',
    systemDescription:
      '案件を基軸とした営業管理システム。チャット・ToDo・見積・ファイルを案件ルームで一元管理。',
    features: FEATURES,
    timeEfficiency: TIME_EFFICIENCY,
    challenges: CHALLENGES,
    overview: OVERVIEW,
    operationSteps: OPERATION_STEPS,
  })

  const handleReset = () => {
    if (!window.confirm('データを初期状態に戻しますか？')) return
    resetAll()
    window.location.reload()
  }

  const isActive = (item: NavItem) => {
    if (item.matchPrefix) return pathname.startsWith(item.matchPrefix)
    return pathname === item.href
  }

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={BASE} className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl shadow-lg shadow-slate-500/20">
              <Briefcase className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900">
                Frankart
              </h1>
              <p className="text-xs text-slate-400 -mt-0.5">案件統合管理</p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-lg shadow-slate-500/25'
                      : 'text-stone-600 hover:bg-stone-50 border border-transparent hover:border-slate-300'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              )
            })}
            <div className="w-px h-6 bg-stone-200 mx-1" />
            <button
              onClick={handleReset}
              className="p-2 text-stone-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              title="初期値に戻す"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={openInfo}
              className="p-2 text-stone-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              title="このシステムでできること"
            >
              <PanelRightOpen size={16} />
            </button>
          </div>
        </div>
      </header>
      <InfoModal />
    </>
  )
}

// シェル: SplashScreen → Provider → Header → children
const FrankartShell = ({ children }: { children: React.ReactNode }) => {
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    // 初回のみスプラッシュ表示
    const shown = sessionStorage.getItem('frankart-splash-shown')
    if (!shown) {
      setShowSplash(true)
      sessionStorage.setItem('frankart-splash-shown', '1')
      const timer = setTimeout(() => setShowSplash(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  if (showSplash) {
    return <SplashScreen theme="slate" systemName="Frankart" subtitle="案件統合管理" />
  }

  return (
    <FrankartMockDataProvider>
      <div className="min-h-screen bg-gray-100">
        <FrankartHeader />
        {children}
      </div>
    </FrankartMockDataProvider>
  )
}

export default FrankartShell
