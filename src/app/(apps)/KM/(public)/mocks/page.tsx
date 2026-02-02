'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Factory, Mountain, ArrowRight, Monitor, Tablet, Smartphone } from 'lucide-react'

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
    id: 'yamanokai',
    title: '山岳会会員管理システム',

    description:
      '山岳会の会員管理・例会企画・計画書・装備貸出を統合管理するシステム。カレンダーベースの例会スケジュールと装備管理機能を搭載。',
    features: ['会員管理', '例会企画', '計画書作成', '装備貸出'],
    icon: Mountain,
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    accentColor: 'blue',
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mockups.map(mockup => (
            <MockCard key={mockup.id} mockup={mockup} isVisible={showCards} />
          ))}
        </div>


      </main>
    </div>
  )
}
