'use client'

import React from 'react'
import {
  Info,
  X,
  Clock,
  Zap,
  TrendingUp,
  Check,
  LucideIcon,
} from 'lucide-react'

// ==========================================
// Types
// ==========================================

export type ThemeColor = 'rose' | 'teal'

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
  benefit: string
}

export interface TimeEfficiencyItem {
  task: string
  before: string
  after: string
  saved: string
}

export interface InfoSidebarProps {
  isOpen: boolean
  onClose: () => void
  theme: ThemeColor
  systemIcon: LucideIcon
  systemName: string
  systemDescription: string
  features: Feature[]
  timeEfficiency: TimeEfficiencyItem[]
  challenges: string[]
}

export interface SplashScreenProps {
  theme: ThemeColor
  systemName: string
  subtitle?: string
}

// ==========================================
// Theme Configuration
// ==========================================

const themeConfig = {
  rose: {
    gradient: 'from-rose-500 to-rose-600',
    gradientLight: 'from-rose-50 via-white to-amber-50',
    shadow: 'shadow-rose-500/30',
    text: 'from-rose-600 to-pink-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    textDark: 'text-rose-800',
    textMedium: 'text-rose-700',
    textLight: 'text-rose-600',
    iconBg: 'from-rose-100 to-rose-50',
    hoverBorder: 'hover:border-rose-200',
    progressBg: 'from-rose-400 to-rose-500',
    subtitleText: 'text-stone-500',
    loadingBg: 'bg-stone-200',
  },
  teal: {
    gradient: 'from-teal-500 to-teal-600',
    gradientLight: 'from-slate-50 via-white to-teal-50',
    shadow: 'shadow-teal-500/30',
    text: 'from-teal-600 to-cyan-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    textDark: 'text-teal-800',
    textMedium: 'text-teal-700',
    textLight: 'text-teal-600',
    iconBg: 'from-teal-100 to-teal-50',
    hoverBorder: 'hover:border-teal-200',
    progressBg: 'from-teal-400 to-teal-500',
    subtitleText: 'text-slate-500',
    loadingBg: 'bg-slate-200',
  },
}

// ==========================================
// SplashScreen Component
// ==========================================

export const SplashScreen: React.FC<SplashScreenProps> = ({
  theme,
  systemName,
  subtitle = 'Loading...',
}) => {
  const colors = themeConfig[theme]

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.gradientLight} flex items-center justify-center`}>
      <div className="text-center animate-in fade-in zoom-in duration-500">

        <h1 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${colors.text} mb-2`}>
          {systemName}
        </h1>
        <p className={`${colors.subtitleText} text-sm`}>{subtitle}</p>
        <div className={`mt-4 w-48 h-1 ${colors.loadingBg} rounded-full overflow-hidden mx-auto`}>
          <div
            className={`h-full bg-gradient-to-r ${colors.progressBg} rounded-full animate-pulse`}
            style={{ width: '60%' }}
          />
        </div>
      </div>
    </div>
  )
}

// ==========================================
// InfoSidebar Component
// ==========================================

export const InfoSidebar: React.FC<InfoSidebarProps> = ({
  isOpen,
  onClose,
  theme,
  systemIcon: SystemIcon,
  systemName,
  systemDescription,
  features,
  timeEfficiency,
  challenges,
}) => {
  const colors = themeConfig[theme]

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* サイドバー */}
      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* ヘッダー */}
        <div className={`sticky top-0 bg-gradient-to-r ${colors.gradient} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-white" />
            <h2 className="text-lg font-bold text-white">このシステムでできること</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* イントロ */}
          <div className={`${colors.bg} rounded-xl p-4 border ${colors.border}`}>
            <div className="flex items-start gap-3">
              <SystemIcon className={`w-5 h-5 ${colors.textLight} mt-0.5 shrink-0`} />
              <div>
                <h3 className={`font-semibold ${colors.textDark} mb-1`}>{systemName}</h3>
                <p className={`text-sm ${colors.textMedium} leading-relaxed`}>
                  {systemDescription}
                </p>
              </div>
            </div>
          </div>

          {/* 主要機能 */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              主要機能
            </h3>
            <div className="space-y-4">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className={`bg-white border border-slate-200 rounded-xl p-4 ${colors.hoverBorder} hover:shadow-md transition-all duration-300`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 bg-gradient-to-br ${colors.iconBg} rounded-lg`}>
                      <feature.icon className={`w-5 h-5 ${colors.textLight}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 mb-1">{feature.title}</h4>
                      <p className="text-sm text-slate-600 mb-2 leading-relaxed">{feature.description}</p>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {feature.benefit}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 時間効率化 */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              導入による時間削減効果
            </h3>
            <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">業務</th>
                    <th className="px-3 py-2 text-center font-medium text-slate-600">導入前</th>
                    <th className="px-3 py-2 text-center font-medium text-slate-600">導入後</th>
                    <th className="px-3 py-2 text-right font-medium text-emerald-600">削減</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {timeEfficiency.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white transition-colors">
                      <td className="px-3 py-2 text-slate-700">{item.task}</td>
                      <td className="px-3 py-2 text-center text-slate-500">{item.before}</td>
                      <td className={`px-3 py-2 text-center ${colors.textLight} font-medium`}>{item.after}</td>
                      <td className="px-3 py-2 text-right text-emerald-600 font-semibold">{item.saved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-500 text-center">
              ※ 効果は導入事例に基づく参考値です
            </p>
          </div>

          {/* こんな課題を解決 */}
          <div className={`bg-gradient-to-br ${colors.gradientLight} rounded-xl p-4 border ${colors.border}`}>
            <h3 className="font-semibold text-slate-800 mb-3">こんな課題をお持ちの方へ</h3>
            <ul className="space-y-2">
              {challenges.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <Check className={`w-4 h-4 ${colors.textLight} mt-0.5 shrink-0`} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </>
  )
}
