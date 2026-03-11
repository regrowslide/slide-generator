'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Stethoscope,
  Calendar,
  ClipboardList,
  MapPin,
  FileText,
  Settings,
  PanelRightOpen,
  HelpCircle,
  RotateCcw,
  ChevronDown,
  LucideIcon,
} from 'lucide-react'
import DentalAppMock from '@app/(apps)/dental/detnal-doc/mock/DentalAppMock'
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
// メニュー定義（親メニュー＋サブメニュー）
// ==========================================

type PageId = 'dashboard' | 'schedule' | 'admin-clinic' | 'admin-facilities' | 'admin-patients' | 'admin-staff' | 'document-list'

type NavMenu = {
  id: string
  label: string
  icon: LucideIcon
  items?: { id: PageId; label: string }[]
  directPage?: PageId
}

const NAV_MENUS: NavMenu[] = [
  {
    id: 'dashboard',
    label: 'ダッシュボード',
    icon: Calendar,
    directPage: 'dashboard',
  },
  {
    id: 'master',
    label: 'マスタ',
    icon: Settings,
    items: [
      { id: 'admin-clinic', label: 'クリニック' },
      { id: 'admin-facilities', label: '施設' },
      { id: 'admin-patients', label: '利用者' },
      { id: 'admin-staff', label: 'スタッフ' },
    ],
  },
  {
    id: 'schedule',
    label: '訪問計画',
    icon: ClipboardList,
    directPage: 'schedule',
  },
  {
    id: 'document-list',
    label: '文書管理',
    icon: FileText,
    directPage: 'document-list',
  },
]

// ==========================================
// InfoSidebar データ
// ==========================================

const FEATURES: Feature[] = [
  { icon: ClipboardList, title: '患者管理・診療記録', description: '患者情報・既往歴・診療記録を一元管理。訪問先施設ごとに患者を一覧表示し、過去の記録も即座に参照できます。', benefit: 'カルテ検索時間を1件5分→10秒に短縮' },
  { icon: MapPin, title: '訪問スケジュール管理', description: '訪問先施設・時間帯・担当歯科医をカレンダーで一括管理。ルート最適化で移動時間を削減します。', benefit: '移動時間を平均20%削減' },
  { icon: FileText, title: 'ドキュメント自動生成', description: '診療計画書・報告書・請求書をテンプレートから自動生成。手書きや転記ミスを防止します。', benefit: '書類作成時間を70%削減' },
  { icon: Calendar, title: '施設別管理', description: '介護施設・グループホーム・在宅など訪問先タイプ別に患者を管理。施設担当者との連絡履歴も記録できます。', benefit: '施設対応の抜け漏れゼロを実現' },
]

const TIME_EFFICIENCY: TimeEfficiencyItem[] = [
  { task: '診療記録の入力', before: '30分/件', after: '5分/件', saved: '25分/件' },
  { task: '報告書作成', before: '1時間', after: '10分', saved: '50分/件' },
  { task: '患者情報の検索', before: '5分', after: '10秒', saved: '4分50秒/件' },
  { task: '月次レポート集計', before: '3時間', after: '自動生成', saved: '3時間/月' },
]

const CHALLENGES = [
  '訪問先で紙カルテを持ち歩くのが大変',
  '診療記録の転記ミスが発生する',
  '施設ごとの患者状況を把握しにくい',
  '報告書作成に時間がかかりすぎる',
  '訪問スケジュールの調整が煩雑',
]

const OVERVIEW: OverviewInfo = {
  description: '訪問歯科診療に特化した業務管理システムです。患者管理・診療記録・スケジュール管理・ドキュメント生成を統合し、訪問診療の効率を大幅に向上させます。',
  automationPoints: ['患者情報・既往歴・診療記録の一元管理', '訪問スケジュールのカレンダー管理とルート最適化', '診療計画書・報告書・請求書のテンプレート自動生成', '施設別の患者一覧と連絡履歴の管理'],
  userBenefits: ['紙カルテからの脱却で訪問時の荷物を軽減', '転記ミスゼロで診療品質を向上', '書類作成の自動化で患者と向き合う時間を確保'],
}

const OPERATION_STEPS: OperationStep[] = [
  { step: 1, action: '今日の訪問予定を確認', detail: 'ダッシュボードで訪問先施設・時間帯・担当を確認' },
  { step: 2, action: '患者情報を確認', detail: '訪問前に既往歴・前回の診療記録を確認' },
  { step: 3, action: '診療記録を入力', detail: '訪問先でタブレットから診療内容を即時入力' },
  { step: 4, action: '報告書を自動生成', detail: '診療記録から施設向け報告書を自動作成' },
]

// ==========================================
// ガイダンスステップ
// ==========================================

const getGuidanceSteps = (navigateTo: (page: PageId) => void): GuidanceStep[] => [
  { targetSelector: '[data-guidance="nav-dashboard"]', title: 'ダッシュボード', description: '今日の訪問予定・診療状況・アラートを一目で確認できます。', position: 'bottom', action: () => navigateTo('dashboard') },
  { targetSelector: '[data-guidance="nav-schedule"]', title: '訪問計画', description: '施設ごとの訪問予定を一覧管理します。訪問計画の追加や詳細確認ができます。', position: 'bottom', action: () => navigateTo('dashboard') },
  { targetSelector: '[data-guidance="nav-master"]', title: 'マスタ管理', description: 'クリニック・施設・利用者・スタッフの基本情報を管理します。ドロップダウンで各マスタにアクセス。', position: 'bottom', action: () => navigateTo('schedule') },
  { targetSelector: '[data-guidance="nav-document-list"]', title: '文書管理', description: '生成した診療文書の一覧と管理を行います。PDF結合出力も可能。', position: 'bottom', action: () => navigateTo('admin-clinic') },
  { targetSelector: '[data-guidance="info-button"]', title: '機能説明', description: 'システムの概要・操作手順・時間削減効果を確認できます。', position: 'top', action: () => navigateTo('document-list') },
]

// ==========================================
// メインコンポーネント
// ==========================================

const DentalMockPage = () => {
  const [showSplash, setShowSplash] = useState(true)
  const [showGuidance, setShowGuidance] = useState(false)
  const [activePage, setActivePage] = useState<PageId>('dashboard')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const { InfoModal, openInfo } = useInfoModal({
    theme: 'slate',
    systemIcon: Stethoscope,
    systemName: '訪問歯科管理システム',
    systemDescription: '訪問歯科診療に特化した業務管理システムです。患者管理・診療記録・スケジュール管理・ドキュメント生成を統合し、訪問診療の効率を大幅に向上させます。',
    features: FEATURES,
    timeEfficiency: TIME_EFFICIENCY,
    challenges: CHALLENGES,
    overview: OVERVIEW,
    operationSteps: OPERATION_STEPS,
  })

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // メニューがアクティブか判定
  const isMenuActive = (menu: NavMenu) => {
    if (menu.directPage) return activePage === menu.directPage
    return menu.items?.some(item => activePage === item.id) ?? false
  }

  // メニュークリック
  const handleMenuClick = (menu: NavMenu) => {
    if (menu.directPage) {
      setActivePage(menu.directPage)
      setOpenMenu(null)
      return
    }
    setOpenMenu(prev => (prev === menu.id ? null : menu.id))
  }

  // サブメニュークリック
  const handleSubMenuClick = (pageId: PageId) => {
    setActivePage(pageId)
    setOpenMenu(null)
  }

  if (showSplash) {
    return <SplashScreen theme="slate" systemName="訪問歯科管理システム" subtitle="VisitDental Pro" />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30" ref={menuRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* 左: アイコン + タイトル + 対象月 */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-slate-700 to-slate-900  shadow-lg shadow-slate-500/20">
              <Stethoscope className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900">
                VisitDental Pro
              </h1>
              <p className="text-xs text-slate-400 -mt-0.5">訪問歯科管理システム</p>
            </div>
            <span className="ml-2 px-2.5 py-1 bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-200">
              2026年1月
            </span>
          </div>

          {/* 右: ガイダンス + リセット + メニュー + 機能説明 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuidance(true)}
              className="p-2 text-stone-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              title="ガイダンス開始"
            >
              <HelpCircle size={16} />
            </button>
            <button
              onClick={() => {
                if (!window.confirm('データを初期状態に戻しますか？')) return
                window.location.reload()
              }}
              className="p-2 text-stone-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              title="初期値に戻す"
            >
              <RotateCcw size={16} />
            </button>

            {/* メニューナビゲーション */}
            {NAV_MENUS.map((menu) => {
              const Icon = menu.icon
              const active = isMenuActive(menu)
              return (
                <div key={menu.id} className="relative" data-guidance={`nav-${menu.id}`}>
                  <button
                    onClick={() => handleMenuClick(menu)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${active
                      ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-lg shadow-slate-500/25'
                      : 'text-stone-600 hover:bg-stone-50 border border-transparent hover:border-slate-300'
                      }`}
                  >
                    <Icon size={16} />
                    <span className="hidden md:inline">{menu.label}</span>
                    {menu.items && (
                      <ChevronDown size={12} className={`transition-transform ${openMenu === menu.id ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {/* サブメニュー（ドロップダウン） */}
                  {menu.items && openMenu === menu.id && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg min-w-[160px] py-1 z-50">
                      {menu.items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleSubMenuClick(item.id)}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${activePage === item.id
                            ? 'bg-slate-100 text-slate-900 font-medium'
                            : 'text-stone-700 hover:bg-stone-50'
                            }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            <button
              data-guidance="info-button"
              onClick={openInfo}
              className="ml-2 p-2.5 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl hover:from-slate-800 hover:to-slate-950 transition-all duration-200 shadow-lg shadow-slate-500/20 hover:shadow-slate-500/30 flex items-center gap-2"
              title="このシステムでできること"
            >
              <PanelRightOpen className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">機能説明</span>
            </button>
          </div>
        </div>
      </header>

      {/* DentalAppMock本体（ヘッダー非表示、コンテンツのみ） */}
      <DentalAppMock
        externalPage={activePage}
        onPageChange={(page) => {
          const topLevelPages: PageId[] = ['dashboard', 'schedule', 'admin-patients', 'admin-facilities', 'admin-staff', 'admin-clinic', 'document-list']
          if (topLevelPages.includes(page as PageId)) {
            setActivePage(page as PageId)
          }
        }}
        hideHeader
      />

      <InfoModal />

      {/* ガイダンスオーバーレイ */}
      <GuidanceOverlay
        steps={getGuidanceSteps(setActivePage)}
        isActive={showGuidance}
        onClose={() => setShowGuidance(false)}
        theme="slate"
      />
    </div>
  )
}

export default DentalMockPage
