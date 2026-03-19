'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Wallet,
  PenLine,
  ClipboardList,
  BarChart3,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PanelRightOpen,
  RotateCcw,
  Database,
  LucideIcon,
} from 'lucide-react'
import PdfExportButton from './components/PdfExportButton'
import KakeiboAppMock from './components/KakeiboAppMock'
import { KakeiboMockDataProvider, useKakeiboMockData } from './context/MockDataContext'
import {
  SplashScreen,
  useInfoModal,
  type Feature,
  type TimeEfficiencyItem,
  type OverviewInfo,
  type OperationStep,
} from '../../_components'
import type { PageId } from './components/types'

// ==========================================
// メニュー定義（親メニュー + サブメニュー）
// ==========================================

type NavMenu = {
  id: string
  label: string
  icon: LucideIcon
  items?: { id: PageId; label: string }[]
  directPage?: PageId
}

const NAV_MENUS: NavMenu[] = [
  {
    id: 'record',
    label: '記録',
    icon: PenLine,
    items: [
      { id: 'input', label: '収支入力' },
      { id: 'history', label: '入力履歴' },
    ],
  },
  {
    id: 'analysis',
    label: '分析',
    icon: BarChart3,
    items: [
      { id: 'calendar', label: 'ノーマネーデー' },
      { id: 'annual-transition', label: '年間推移' },
      { id: 'income-expense-viz', label: '収支可視化' },
      { id: 'payment-management', label: '支払管理' },
      { id: 'satisfaction-review', label: '満足度振り返り' },
    ],
  },
  {
    id: 'future',
    label: '将来設計',
    icon: Sparkles,
    items: [
      { id: 'life-plan', label: 'ライフプラン' },
      { id: 'asset-projection', label: '資産推移' },
    ],
  },
  {
    id: 'master',
    label: 'マスタ',
    icon: ClipboardList,
    items: [
      { id: 'master-category', label: 'カテゴリ管理' },
      { id: 'master-payment', label: '支払方法管理' },
    ],
  },
]

// ==========================================
// InfoModal データ
// ==========================================

const FEATURES: Feature[] = [
  {
    icon: PenLine,
    title: 'かんたん収支入力',
    description: 'カテゴリ・金額・満足度をワンタップで入力。週予算の残りもリアルタイム表示で、使いすぎを防止します。',
    benefit: '入力時間を1件30秒以内に短縮',
  },
  {
    icon: BarChart3,
    title: '収支可視化・年間推移',
    description: '月別・カテゴリ別の収支をグラフで可視化。年間推移で季節ごとの傾向を把握し、予算計画に活かせます。',
    benefit: '家計の全体像を一目で把握',
  },
  {
    icon: ClipboardList,
    title: '支払管理・引落カレンダー',
    description: 'クレジットカード・口座引落の支払日を一元管理。引落予定額を事前に確認し、残高不足を防ぎます。',
    benefit: '引落ミス・延滞をゼロに',
  },
  {
    icon: Sparkles,
    title: 'ライフプラン・資産推移',
    description: '将来のライフイベントと収支を試算。資産推移シミュレーションで老後資金の見通しも立てられます。',
    benefit: '将来の家計不安を数値で解消',
  },
]

const TIME_EFFICIENCY: TimeEfficiencyItem[] = [
  { task: '日々の家計入力', before: '5分/日', after: '1分/日', saved: '4分/日' },
  { task: '月次集計・振り返り', before: '2時間/月', after: '自動生成', saved: '2時間/月' },
  { task: '予算残チェック', before: '都度計算', after: 'リアルタイム表示', saved: '手間ゼロ' },
  { task: '年間レポート作成', before: '半日', after: '自動生成', saved: '半日/年' },
]

const CHALLENGES = [
  '家計簿が続かない・入力が面倒',
  '月末まで予算の残りがわからない',
  'クレジットカードの引落日を把握しきれない',
  '将来の家計に漠然とした不安がある',
  '家計データが散らばって全体像が見えない',
]

const OVERVIEW: OverviewInfo = {
  description: '入力のしやすさを追求したスマート家計簿です。週予算・月予算管理、年間推移、収支可視化、支払管理、ライフプランまで一元管理できます。',
  automationPoints: [
    'ワンタップ入力で日々の家計記録を継続',
    '週予算・月予算の残りをリアルタイム表示',
    '月別・カテゴリ別グラフで収支を自動可視化',
    'ライフプラン試算で将来の家計をシミュレーション',
  ],
  userBenefits: [
    '入力が簡単だから家計簿が続く',
    '予算残がリアルタイムでわかるから使いすぎを防げる',
    '将来の家計を数値で把握できるから安心',
  ],
}

const OPERATION_STEPS: OperationStep[] = [
  { step: 1, action: '収支を入力する', detail: 'カテゴリ・金額・満足度を選んでサクッと記録' },
  { step: 2, action: '予算残を確認する', detail: '週予算・月予算の残りをリアルタイムでチェック' },
  { step: 3, action: '月次で振り返る', detail: 'カテゴリ別グラフと満足度で改善ポイントを発見' },
  { step: 4, action: '将来設計を見直す', detail: 'ライフプラン・資産推移で長期的な家計を最適化' },
]

// ==========================================
// ヘッダー内コンテンツ（Context利用のため分離）
// ==========================================

const KakeiboPageContent = () => {
  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    seedDemoData,
    resetAll,
  } = useKakeiboMockData()

  const [activePage, setActivePage] = useState<PageId>('input')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const { InfoModal, openInfo } = useInfoModal({
    theme: 'emerald',
    systemIcon: Wallet,
    systemName: 'スマート家計簿',
    systemDescription: '入力のしやすさを追求した家計簿アプリ。週予算・月予算管理、年間推移、収支可視化、ライフプランまで一元管理。',
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
    return menu.items?.some((item) => activePage === item.id) ?? false
  }

  // メニュークリック
  const handleMenuClick = (menu: NavMenu) => {
    if (menu.directPage) {
      setActivePage(menu.directPage)
      setOpenMenu(null)
      return
    }
    setOpenMenu((prev) => (prev === menu.id ? null : menu.id))
  }

  // サブメニュークリック
  const handleSubMenuClick = (pageId: PageId) => {
    setActivePage(pageId)
    setOpenMenu(null)
  }

  // 年月セレクターの前月・翌月移動
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear(selectedYear - 1)
      setSelectedMonth(12)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear(selectedYear + 1)
      setSelectedMonth(1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  // リセット
  const handleReset = () => {
    if (!window.confirm('データを初期状態に戻しますか？')) return
    resetAll()
    window.location.reload()
  }

  // 全ページID
  const ALL_PAGES: PageId[] = [
    'input', 'history', 'calendar',
    'master-category', 'master-payment',
    'annual-transition', 'income-expense-viz', 'payment-management', 'satisfaction-review',
    'life-plan', 'asset-projection',
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30" ref={menuRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* 左: アイコン + タイトル + 年月セレクター */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-600 to-teal-700 shadow-lg shadow-emerald-500/20">
              <Wallet className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-700">
                Smart Kakeibo
              </h1>
              <p className="text-xs text-slate-400 -mt-0.5">スマート家計簿</p>
            </div>

            {/* 年月セレクター */}
            <div className="ml-2 flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                title="前月"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-200 min-w-[90px] text-center">
                {selectedYear}年{selectedMonth}月
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                title="翌月"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* 右: メニュー + ユーティリティ */}
          <div className="flex items-center gap-1.5">
            {/* メニューナビゲーション */}
            {NAV_MENUS.map((menu) => {
              const Icon = menu.icon
              const active = isMenuActive(menu)
              return (
                <div key={menu.id} className="relative">
                  <button
                    onClick={() => handleMenuClick(menu)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/25'
                        : 'text-stone-600 hover:bg-stone-50 border border-transparent hover:border-emerald-300'
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
                      {menu.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSubMenuClick(item.id)}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            activePage === item.id
                              ? 'bg-emerald-100 text-emerald-900 font-medium'
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

            {/* 区切り */}
            <div className="w-px h-6 bg-stone-200 mx-1" />

            {/* ユーティリティボタン群（アイコンのみ） */}
            <button
              onClick={() => {
                if (!window.confirm('12ヶ月分のデモデータを投入しますか？\n（現在の入力データは上書きされます）')) return
                seedDemoData()
              }}
              className="p-2 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              title="デモデータ投入"
            >
              <Database size={16} />
            </button>
            <PdfExportButton />
            <button
              onClick={handleReset}
              className="p-2 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              title="初期値に戻す"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={openInfo}
              className="p-2 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              title="このシステムでできること"
            >
              <PanelRightOpen size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* KakeiboAppMock本体 */}
      <KakeiboAppMock
        externalPage={activePage}
        onPageChange={(page) => {
          if (ALL_PAGES.includes(page as PageId)) {
            setActivePage(page as PageId)
          }
        }}
      />

      <InfoModal />
    </div>
  )
}

// ==========================================
// メインコンポーネント
// ==========================================

const KakeiboMockPage = () => {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen theme="emerald" systemName="スマート家計簿" subtitle="Smart Kakeibo" />
  }

  return (
    <KakeiboMockDataProvider>
      <KakeiboPageContent />
    </KakeiboMockDataProvider>
  )
}

export default KakeiboMockPage
