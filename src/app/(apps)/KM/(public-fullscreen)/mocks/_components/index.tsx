'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Info,
  X,
  Clock,
  Zap,
  TrendingUp,
  Check,
  LucideIcon,
  RotateCcw,
  ChevronRight,
  FileText,
  ListOrdered,
  HelpCircle,
  PanelRightOpen,
} from 'lucide-react'

// ==========================================
// Types
// ==========================================

export type ThemeColor = 'rose' | 'teal' | 'blue' | 'violet' | 'amber' | 'emerald' | 'slate'

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

export interface OverviewInfo {
  description: string
  automationPoints: string[]
  userBenefits: string[]
}

export interface OperationStep {
  step: number
  action: string
  detail: string
}

export interface GuidanceStep {
  targetSelector: string
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: () => void // ステップ表示前に実行（タブ切り替え等）
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
  overview?: OverviewInfo
  operationSteps?: OperationStep[]
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
  blue: {
    gradient: 'from-blue-500 to-sky-600',
    gradientLight: 'from-blue-50 via-white to-sky-50',
    shadow: 'shadow-blue-500/30',
    text: 'from-blue-600 to-sky-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    textDark: 'text-blue-800',
    textMedium: 'text-blue-700',
    textLight: 'text-blue-600',
    iconBg: 'from-blue-100 to-blue-50',
    hoverBorder: 'hover:border-blue-200',
    progressBg: 'from-blue-400 to-blue-500',
    subtitleText: 'text-slate-500',
    loadingBg: 'bg-slate-200',
  },
  violet: {
    gradient: 'from-violet-500 to-purple-600',
    gradientLight: 'from-violet-50 via-white to-purple-50',
    shadow: 'shadow-violet-500/30',
    text: 'from-violet-600 to-purple-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    textDark: 'text-violet-800',
    textMedium: 'text-violet-700',
    textLight: 'text-violet-600',
    iconBg: 'from-violet-100 to-violet-50',
    hoverBorder: 'hover:border-violet-200',
    progressBg: 'from-violet-400 to-violet-500',
    subtitleText: 'text-slate-500',
    loadingBg: 'bg-slate-200',
  },
  amber: {
    gradient: 'from-amber-500 to-orange-500',
    gradientLight: 'from-amber-50 via-white to-orange-50',
    shadow: 'shadow-amber-500/30',
    text: 'from-amber-600 to-orange-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    textDark: 'text-amber-800',
    textMedium: 'text-amber-700',
    textLight: 'text-amber-600',
    iconBg: 'from-amber-100 to-amber-50',
    hoverBorder: 'hover:border-amber-200',
    progressBg: 'from-amber-400 to-amber-500',
    subtitleText: 'text-stone-500',
    loadingBg: 'bg-stone-200',
  },
  emerald: {
    gradient: 'from-emerald-500 to-green-600',
    gradientLight: 'from-emerald-50 via-white to-green-50',
    shadow: 'shadow-emerald-500/30',
    text: 'from-emerald-600 to-green-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    textDark: 'text-emerald-800',
    textMedium: 'text-emerald-700',
    textLight: 'text-emerald-600',
    iconBg: 'from-emerald-100 to-emerald-50',
    hoverBorder: 'hover:border-emerald-200',
    progressBg: 'from-emerald-400 to-emerald-500',
    subtitleText: 'text-slate-500',
    loadingBg: 'bg-slate-200',
  },
  slate: {
    gradient: 'from-slate-700 to-slate-900',
    gradientLight: 'from-slate-50 via-white to-stone-50',
    shadow: 'shadow-slate-500/30',
    text: 'from-slate-700 to-slate-900',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    textDark: 'text-slate-900',
    textMedium: 'text-slate-700',
    textLight: 'text-slate-600',
    iconBg: 'from-slate-200 to-slate-100',
    hoverBorder: 'hover:border-slate-300',
    progressBg: 'from-slate-500 to-slate-600',
    subtitleText: 'text-slate-400',
    loadingBg: 'bg-slate-200',
  },
}

export { themeConfig }

// ==========================================
// Hooks & Utilities
// ==========================================

/** localStorage永続化付きuseState */
export const usePersistedState = <T,>(key: string, initialData: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialData
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initialData
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])
  return [state, setState]
}

/** 一意なID生成 */
export const generateId = (prefix: string) => `${prefix}${Date.now().toString(36).toUpperCase()}`

/** STORAGE_KEYSに基づくlocalStorageリセット + リロード */
export const resetPersistedData = (storageKeys: Record<string, string>, extraKeys?: string[]) => {
  if (!window.confirm('データを初期状態に戻しますか？')) return
  Object.values(storageKeys).forEach((key) => localStorage.removeItem(key))
  extraKeys?.forEach((key) => localStorage.removeItem(key))
  window.location.reload()
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
// Modal Component
// ==========================================

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}) => {
  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[85vh] overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
            <h3 className="font-bold text-stone-800 text-lg">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </>
  )
}

// ==========================================
// ResetButton Component
// ==========================================

export interface ResetButtonProps {
  storageKeys: Record<string, string>
  extraKeys?: string[]
  theme: ThemeColor
}

export const ResetButton: React.FC<ResetButtonProps> = ({ storageKeys, extraKeys, theme }) => {
  const colors = themeConfig[theme]
  return (
    <button
      onClick={() => resetPersistedData(storageKeys, extraKeys)}
      className={`p-2 text-stone-400 hover:${colors.textLight} hover:${colors.bg} rounded-lg transition-colors`}
      title="初期値に戻す"
    >
      <RotateCcw size={16} />
    </button>
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
  overview,
  operationSteps,
}) => {
  const colors = themeConfig[theme]

  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* フルスクリーンモーダル */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className={`bg-gradient-to-r ${colors.gradient} px-8 py-5 flex items-center justify-between shrink-0`}>
            <div className="flex items-center gap-3">
              <SystemIcon className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-lg font-bold text-white">{systemName}</h2>
                <p className="text-white/80 text-xs mt-0.5">{systemDescription}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* コンテンツ（スクロール領域） */}
          <div className="flex-1 overflow-y-auto p-8 md:p-10">

            {/* 2カラムレイアウト */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* 左カラム */}
              <div className="space-y-10">
                {/* 主要機能 */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" />
                    主要機能
                  </h3>
                  <div className="space-y-3">
                    {features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`p-2 bg-gradient-to-br ${colors.iconBg} rounded-lg shrink-0`}>
                          <feature.icon className={`w-4 h-4 ${colors.textLight}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-800 text-sm">{feature.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 概要（overview） */}
                {overview && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      導入メリット
                    </h3>
                    <ul className="space-y-2">
                      {overview.userBenefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <Check className={`w-4 h-4 ${colors.textLight} mt-0.5 shrink-0`} />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 右カラム */}
              <div className="space-y-10">
                {/* 操作手順（operationSteps） */}
                {operationSteps && operationSteps.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <ListOrdered className="w-3.5 h-3.5" />
                      操作手順
                    </h3>
                    <div className="space-y-3">
                      {operationSteps.map((s) => (
                        <div key={s.step} className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                            {s.step}
                          </div>
                          <div className="flex-1 pt-0.5">
                            <p className="font-medium text-slate-800 text-sm">{s.action}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{s.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 時間効率化 */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    時間削減効果
                  </h3>
                  <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100/80">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-medium text-slate-500 text-xs">業務</th>
                          <th className="px-4 py-2.5 text-center font-medium text-slate-500 text-xs">導入前</th>
                          <th className="px-4 py-2.5 text-center font-medium text-slate-500 text-xs">導入後</th>
                          <th className="px-4 py-2.5 text-right font-medium text-emerald-600 text-xs">削減</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {timeEfficiency.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2.5 text-slate-700 text-sm">{item.task}</td>
                            <td className="px-4 py-2.5 text-center text-slate-400 text-sm">{item.before}</td>
                            <td className={`px-4 py-2.5 text-center ${colors.textLight} font-medium text-sm`}>{item.after}</td>
                            <td className="px-4 py-2.5 text-right text-emerald-600 font-semibold text-sm">{item.saved}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ==========================================
// GuidanceOverlay Component
// ==========================================

interface GuidanceOverlayProps {
  steps: GuidanceStep[]
  isActive: boolean
  onClose: () => void
  theme: ThemeColor
}

export const GuidanceOverlay: React.FC<GuidanceOverlayProps> = ({
  steps,
  isActive,
  onClose,
  theme,
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({})
  const overlayRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const colors = themeConfig[theme]

  // ツールチップ位置をDOM描画後に補正
  const clampTooltipPosition = useCallback(() => {
    const tooltipEl = tooltipRef.current
    if (!tooltipEl) return

    const tooltipRect = tooltipEl.getBoundingClientRect()
    const margin = 16
    const vh = window.innerHeight
    const vw = window.innerWidth

    let needsUpdate = false
    const fix: React.CSSProperties = {}

    // 下端はみ出し → topを補正
    if (tooltipRect.bottom > vh - margin) {
      fix.top = vh - tooltipRect.height - margin
      fix.bottom = 'auto'
      needsUpdate = true
    }
    // 上端はみ出し
    if (tooltipRect.top < margin) {
      fix.top = margin
      fix.bottom = 'auto'
      needsUpdate = true
    }
    // 右端はみ出し
    if (tooltipRect.right > vw - margin) {
      fix.left = vw - tooltipRect.width - margin
      fix.right = 'auto'
      needsUpdate = true
    }
    // 左端はみ出し
    if (tooltipRect.left < margin) {
      fix.left = margin
      fix.right = 'auto'
      needsUpdate = true
    }

    if (needsUpdate) {
      setTooltipStyle((prev) => ({ ...prev, ...fix }))
    }
  }, [])

  // 対象要素の位置を計算してハイライト・ツールチップを配置
  const positionTooltip = useCallback((step: GuidanceStep) => {
    const el = document.querySelector(step.targetSelector)
    if (!el) {
      setHighlightStyle({ display: 'none' })
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      })
      return
    }

    // instantスクロールで即座に位置確定させる
    el.scrollIntoView({ behavior: 'instant', block: 'center' })

    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      const padding = 8

      setHighlightStyle({
        position: 'fixed',
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        borderRadius: '8px',
      })

      const tooltipWidth = 320
      const gap = 12
      const margin = 16

      const tooltip: React.CSSProperties = { position: 'fixed' }
      const pos = step.position || 'bottom'

      if (pos === 'bottom') {
        tooltip.top = rect.bottom + gap
        tooltip.left = Math.max(margin, Math.min(rect.left, window.innerWidth - tooltipWidth - margin))
      } else if (pos === 'top') {
        tooltip.bottom = window.innerHeight - rect.top + gap
        tooltip.left = Math.max(margin, Math.min(rect.left, window.innerWidth - tooltipWidth - margin))
      } else if (pos === 'left') {
        tooltip.top = rect.top
        tooltip.right = window.innerWidth - rect.left + gap
      } else {
        tooltip.top = rect.top
        tooltip.left = rect.right + gap
      }

      setTooltipStyle(tooltip)

      // 描画後に実際のサイズで位置補正
      requestAnimationFrame(() => clampTooltipPosition())
    })
  }, [clampTooltipPosition])

  // ステップ遷移: action実行 → DOM更新待ち → 位置計算
  const goToStep = useCallback((index: number) => {
    const step = steps[index]
    if (!step) return
    setCurrentStep(index)

    if (step.action) {
      step.action()
      // action（タブ切替等）後のDOM更新を待ってから位置計算
      setTimeout(() => positionTooltip(step), 150)
    } else {
      positionTooltip(step)
    }
  }, [steps, positionTooltip])

  // 位置の再計算（リサイズ時）
  const updatePosition = useCallback(() => {
    if (!isActive || steps.length === 0) return
    const step = steps[currentStep]
    if (!step) return
    positionTooltip(step)
  }, [isActive, currentStep, steps, positionTooltip])

  useEffect(() => {
    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [updatePosition])

  // ガイダンス開始時に最初のステップへ（isActiveがtrueになった時のみ）
  const prevIsActiveRef = useRef(false)
  useEffect(() => {
    if (isActive && !prevIsActiveRef.current) {
      goToStep(0)
    }
    prevIsActiveRef.current = isActive
  }, [isActive, goToStep])

  if (!isActive || steps.length === 0) return null

  const step = steps[currentStep]
  const isLast = currentStep === steps.length - 1

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[9999]">
      {/* 半透明オーバーレイ（box-shadowでハイライト切り抜き） */}
      <div className="fixed inset-0 bg-black/50" />

      {/* ハイライト（対象要素をくり抜く） */}
      <div
        style={highlightStyle}
        className="z-[10000] pointer-events-none border-2 border-white/80"
        // box-shadowで大きな影を使い、対象部分だけ見えるようにする
      />

      {/* ツールチップ */}
      <div
        ref={tooltipRef}
        style={{ ...tooltipStyle, width: 320 }}
        className="z-[10001] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* ステップヘッダー */}
        <div className={`bg-gradient-to-r ${colors.gradient} px-4 py-2.5 flex items-center justify-between`}>
          <span className="text-white text-xs font-medium">
            ステップ {currentStep + 1} / {steps.length}
          </span>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <h4 className="font-bold text-slate-800 mb-1.5">{step?.title}</h4>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{step?.description}</p>

          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              スキップ
            </button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={() => goToStep(currentStep - 1)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  戻る
                </button>
              )}
              <button
                onClick={() => {
                  if (isLast) {
                    onClose()
                  } else {
                    goToStep(currentStep + 1)
                  }
                }}
                className={`px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r ${colors.gradient} rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1`}
              >
                {isLast ? '完了' : '次へ'}
                {!isLast && <ChevronRight className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* プログレスバー */}
        <div className="h-1 bg-slate-100">
          <div
            className={`h-full bg-gradient-to-r ${colors.progressBg} transition-all duration-300`}
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ==========================================
// GuidanceStartButton (ヘッダー用)
// ==========================================

export interface GuidanceStartButtonProps {
  onClick: () => void
  theme: ThemeColor
}

export const GuidanceStartButton: React.FC<GuidanceStartButtonProps> = ({ onClick, theme }) => {
  const colors = themeConfig[theme]
  return (
    <button
      onClick={onClick}
      className={`p-2 text-stone-400 hover:${colors.textLight} hover:${colors.bg} rounded-lg transition-colors`}
      title="ガイダンス開始"
    >
      <HelpCircle size={16} />
    </button>
  )
}

// ==========================================
// useEditModal Hook
// ==========================================

/** モーダル + 編集対象 + フォームの状態管理を共通化 */
export const useEditModal = <T extends {id: string}, F>(
  emptyForm: F,
  toForm: (item: T) => F,
) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)
  const [form, setForm] = useState<F>(emptyForm)

  const openNew = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (item: T) => {
    setEditingItem(item)
    setForm(toForm(item))
    setModalOpen(true)
  }

  const close = () => setModalOpen(false)

  /** データ配列に対して upsert + モーダル閉じ */
  const save = (setData: React.Dispatch<React.SetStateAction<T[]>>, idPrefix: string) => {
    if (editingItem) {
      setData((prev) => prev.map((d) => (d.id === editingItem.id ? {...d, ...form} : d)))
    } else {
      setData((prev) => [...prev, {id: generateId(idPrefix), ...form} as unknown as T])
    }
    close()
  }

  /** データ配列から削除 + モーダル閉じ */
  const remove = (setData: React.Dispatch<React.SetStateAction<T[]>>) => {
    if (!editingItem) return
    setData((prev) => prev.filter((d) => d.id !== editingItem.id))
    close()
  }

  return {modalOpen, editingItem, form, setForm, openNew, openEdit, close, save, remove}
}

// ==========================================
// useCsvImport Hook
// ==========================================

/** CSV取込シミュレーション（確認モーダル + ローディング + 完了表示） */
export const useCsvImport = <T,>(
  generateData: () => T[],
  setData: React.Dispatch<React.SetStateAction<T[]>>,
) => {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)

  const open = () => {
    setDone(false)
    setConfirmOpen(true)
  }

  const execute = () => {
    setImporting(true)
    setDone(false)
    setTimeout(() => {
      setData((prev) => [...prev, ...generateData()])
      setImporting(false)
      setDone(true)
      setTimeout(() => {
        setConfirmOpen(false)
        setDone(false)
      }, 1200)
    }, 1500)
  }

  const cancel = () => {
    setConfirmOpen(false)
    setDone(false)
  }

  return {confirmOpen, importing, done, open, execute, cancel}
}

// ==========================================
// MockHeader Components
// ==========================================

/** ヘッダー外枠（glass morphism + sticky） */
export const MockHeader = React.forwardRef<HTMLElement, {children: React.ReactNode}>(
  ({children}, ref) => (
    <header ref={ref} className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {children}
      </div>
    </header>
  ),
)
MockHeader.displayName = 'MockHeader'

/** ヘッダー左側: アイコン + タイトル + サブタイトル */
export const MockHeaderTitle = ({
  icon: Icon,
  title,
  subtitle,
  theme,
  children,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  theme: ThemeColor
  children?: React.ReactNode
}) => {
  const colors = themeConfig[theme]
  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 bg-gradient-to-r ${colors.gradient} rounded-xl shadow-lg ${colors.shadow}`}>
        <Icon className="text-white w-5 h-5" />
      </div>
      <div>
        <h1 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${colors.text}`}>
          {title}
        </h1>
        <p className="text-xs text-stone-400 -mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

/** ヘッダータブボタン */
export const MockHeaderTab = ({
  active,
  onClick,
  icon: Icon,
  label,
  theme,
  ...rest
}: {
  active: boolean
  onClick: () => void
  icon: LucideIcon
  label: string
  theme: ThemeColor
  'data-guidance'?: string
}) => {
  const colors = themeConfig[theme]
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
        active
          ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg ${colors.shadow}`
          : `text-stone-600 hover:bg-stone-50 border border-transparent ${colors.hoverBorder}`
      }`}
      {...rest}
    >
      <Icon size={16} />
      <span className="hidden md:inline">{label}</span>
    </button>
  )
}

/** ヘッダー機能説明ボタン */
export const MockHeaderInfoButton = ({
  onClick,
  theme,
}: {
  onClick: () => void
  theme: ThemeColor
}) => {
  const colors = themeConfig[theme]
  return (
    <button
      data-guidance="info-button"
      onClick={onClick}
      className={`ml-2 p-2.5 bg-gradient-to-r ${colors.gradient} text-white rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg ${colors.shadow} flex items-center gap-2`}
      title="このシステムでできること"
    >
      <PanelRightOpen className="w-4 h-4" />
      <span className="text-sm font-medium hidden sm:inline">機能説明</span>
    </button>
  )
}
