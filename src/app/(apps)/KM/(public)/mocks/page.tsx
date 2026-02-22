'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Factory, Stethoscope, BarChart3, UtensilsCrossed, Calculator, Building2, Car, ArrowRight, Monitor, Tablet, Smartphone } from 'lucide-react'

// ==========================================
// モック一覧ページ
// 商談デモ用のインデックスページ
// ==========================================

const mockups = [
  {
    id: 'clinick-dashboard',
    title: '美容医療クリニック管理ダッシュボード',

    description:
      '美容クリニックのマーケティング分析・顧客管理・予約管理を統合したダッシュボード。流入経路分析やKPI可視化機能を搭載。',
    features: ['流入経路分析', 'KPI可視化', '顧客管理', '予約管理'],
    icon: LayoutDashboard,
    gradient: 'from-rose-500 to-pink-600',
    bgGradient: 'from-rose-50 to-pink-50',
    accentColor: 'rose',
  },
  {
    id: 'seisan-kanri',
    title: '製造業向け生産管理システム',

    description:
      '製造業の生産計画・在庫管理・受注管理を効率化するシステム。カレンダーベースの生産スケジュール管理と原材料在庫の可視化を実現。',
    features: ['生産計画', '在庫管理', '受注管理', 'スケジュール管理'],
    icon: Factory,
    gradient: 'from-teal-500 to-cyan-600',
    bgGradient: 'from-teal-50 to-cyan-50',
    accentColor: 'teal',
  },
  {
    id: 'dental',
    title: '訪問歯科管理システム',
    description:
      '訪問歯科診療の患者管理・診療記録・スケジュール管理を統合。訪問先施設ごとの患者一覧やドキュメント管理を効率化。',
    features: ['患者管理', '診療記録', '訪問スケジュール', 'ドキュメント管理'],
    icon: Stethoscope,
    gradient: 'from-blue-500 to-sky-600',
    bgGradient: 'from-blue-50 to-sky-50',
    accentColor: 'blue',
  },
  {
    id: 'regrow',
    title: '月次業績レポートシステム',
    description:
      '月次の業績データをスライド形式で自動生成。売上推移・KPI分析・部門別比較などを視覚的にプレゼンテーション。',
    features: ['自動スライド生成', '売上推移分析', 'KPI可視化', '部門別比較'],
    icon: BarChart3,
    gradient: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-50 to-purple-50',
    accentColor: 'violet',
  },
  {
    id: 'kaigoshoku',
    title: '介護食管理システム',
    description:
      '介護施設向けの給食管理・献立作成・製造指示・配送管理を一元化。施設ごとの食事形態や個別対応にも柔軟に対応。',
    features: ['受注管理', '献立管理', '製造指示', '梱包・配送'],
    icon: UtensilsCrossed,
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-50 to-orange-50',
    accentColor: 'amber',
  },
  {
    id: 'recipe-calculator',
    title: 'AI食品原価計算システム',
    description:
      'AIでレシピ画像や手書きメモから食材を自動認識し、原価を瞬時に算出。食材マスタと粗利基準の管理で収益性を可視化。',
    features: ['AI原価解析', '食材マスタ', '粗利基準管理', '自動原価算出'],
    icon: Calculator,
    gradient: 'from-emerald-500 to-green-600',
    bgGradient: 'from-emerald-50 to-green-50',
    accentColor: 'emerald',
  },
  {
    id: 'earth',
    title: '不動産業務管理システム',
    description:
      '不動産仲介・賃貸管理・建築工事を一元管理。物件・顧客・現場・仲介の情報を有機的に連携し、業務効率を大幅に向上。',
    features: ['物件管理', '賃貸管理', '現場管理', '仲介管理'],
    icon: Building2,
    gradient: 'from-indigo-500 to-blue-600',
    bgGradient: 'from-indigo-50 to-blue-50',
    accentColor: 'indigo',
  },
  {
    id: 'sales-auto',
    title: '自動車ディーラー営業管理システム',
    description:
      '商談管理・見積書作成・納車スケジュール・売上分析を統合した営業管理ツール。ABC判定やパイプライン可視化で成約率を向上。',
    features: ['商談管理', '見積書作成', '納車管理', '売上分析'],
    icon: Car,
    gradient: 'from-sky-500 to-blue-600',
    bgGradient: 'from-sky-50 to-blue-50',
    accentColor: 'sky',
  },
]

const MockCard = ({ mockup, isVisible }) => {
  const IconComponent = mockup.icon

  return (
    <Link href={`/KM/mocks/${mockup.id}`} className="block group" target="_blank">
      <div
        className={`
          relative overflow-hidden rounded-2xl border border-slate-200
          bg-white shadow-sm
          transition-all duration-500 ease-out
          hover:shadow-xl hover:scale-[1.02] hover:border-slate-300
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        {/* ヘッダー部分 */}
        <div className={`bg-gradient-to-r ${mockup.gradient} p-6 pb-12`}>
          <div className="flex items-center justify-between">
            {/* <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <IconComponent className="w-8 h-8 text-white" />
            </div> */}
            <div className="flex gap-2">
              <Monitor className="w-5 h-5 text-white/70" />
              <Tablet className="w-5 h-5 text-white/70" />
              <Smartphone className="w-5 h-5 text-white/70" />
            </div>
          </div>
        </div>

        {/* コンテンツ部分 */}
        <div className="relative -mt-6 bg-white rounded-t-3xl p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors">{mockup.title}</h3>

          </div>

          <p className="text-sm text-slate-600 leading-relaxed mb-4">{mockup.description}</p>

          {/* 機能タグ */}
          <div className="flex flex-wrap gap-2 mb-6">
            {mockup.features.map((feature, idx) => (
              <span
                key={idx}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  bg-gradient-to-r ${mockup.bgGradient}
                  text-${mockup.accentColor}-700
                `}
              >
                {feature}
              </span>
            ))}
          </div>

          {/* CTAボタン */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">デモを見る</span>
            <div
              className={`
                p-2 rounded-full bg-gradient-to-r ${mockup.gradient}
                text-white transition-transform duration-300
                group-hover:translate-x-1
              `}
            >
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function MockIndexPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showCards, setShowCards] = useState(false)

  useEffect(() => {
    // ウェルカムアニメーション
    const loadTimer = setTimeout(() => setIsLoaded(true), 100)
    const cardTimer = setTimeout(() => setShowCards(true), 400)

    return () => {
      clearTimeout(loadTimer)
      clearTimeout(cardTimer)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヒーローセクション */}
        <div
          className={`
            text-center mb-16 transition-all duration-700 ease-out
            ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
            業務システム

            コレクション
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            実際にご納品したシステムの画面デザインと機能フローをご確認いただけます。
            <br className="hidden sm:block" />
            （実際のシステムのうち、<strong>一部機能を抜粋</strong>しています。）
          </p>
        </div>

        {/* モックカードグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockups.map(mockup => (
            <MockCard key={mockup.id} mockup={mockup} isVisible={showCards} />
          ))}
        </div>


      </main>
    </div>
  )
}
