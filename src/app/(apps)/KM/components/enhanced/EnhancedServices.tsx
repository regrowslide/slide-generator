'use client'

import { C_Stack, MyContainer, R_Stack } from '@cm/components/styles/common-components/common-components'

import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import { Award, Code2, Sparkles, TrendingUp } from 'lucide-react'
import { Developer } from '@app/(apps)/KM/components/Developer'
import { EnhancedCategory } from '@app/(apps)/KM/components/enhanced/EnhancedCategory'

export const EnhancedServices = ({ kaizenClient }: { kaizenClient: any[] }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const sections = [
    {
      icon: Award,
      badge: '200+',
      badgeLabel: '案件',
      title: 'フリーランスマッチングサイトでの実績',
      subtitle: 'ココナラ、Lancers等で高評価を獲得',
      gradient: 'from-amber-400 via-orange-400 to-amber-500',
      bgGradient: 'from-amber-50/40 via-orange-50/30 to-amber-50/20',
      borderColor: 'border-amber-100/80',
      content: <Developer />,
    },
    {
      icon: Code2,
      badge: null,
      title: '開発実績',
      subtitle: '多様な事業者様向けにシステム開発・業務改善をサポート',
      gradient: 'from-slate-400 via-slate-500 to-slate-600',
      bgGradient: 'from-slate-50/40 via-gray-50/30 to-slate-50/20',
      borderColor: 'border-slate-100/80',
      content: <EnhancedCategory />,
    },
    // {
    //   icon: Building2,
    //   badge: null,
    //   title: '多彩なクライアント様との取引実績',
    //   subtitle: '企業・大学・個人事業主様など幅広くサポート',
    //   gradient: 'from-blue-400 via-blue-500 to-indigo-500',
    //   bgGradient: 'from-blue-50/40 via-indigo-50/30 to-blue-50/20',
    //   borderColor: 'border-blue-100/80',
    //   content: <EnhancedPartners {...{ kaizenClient }} />,
    // },
  ]

  return (
    <MyContainer className="mx-auto max-w-7xl px-4 py-8">
      <div ref={ref}>
        {/* セクションヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <R_Stack className="mb-3 justify-center gap-2">
            <Sparkles className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-semibold uppercase tracking-widest text-slate-500">Track Record</span>
            <Sparkles className="h-5 w-5 text-slate-400" />
          </R_Stack>
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            実績・サービス
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            これまでの開発実績とサービス内容をご紹介します
          </p>
        </motion.div>

        {/* セクションカード */}
        <C_Stack className="gap-8">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`group relative overflow-hidden rounded-3xl border ${section.borderColor} bg-gradient-to-br ${section.bgGradient} p-6 shadow-lg transition-all duration-500 hover:shadow-2xl md:p-8`}
              >
                {/* 背景装飾 */}
                <div className={`absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br ${section.gradient} opacity-5 blur-3xl transition-all duration-500 group-hover:opacity-10`} />
                <div className={`absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-br ${section.gradient} opacity-3 blur-2xl`} />

                {/* ヘッダー */}
                <R_Stack className="mb-6 flex-wrap items-start gap-4">
                  {/* アイコン */}
                  <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${section.gradient} shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  {/* タイトル */}
                  <div className="flex-1">
                    <R_Stack className="mb-1 flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-900 md:text-2xl">{section.title}</h3>
                      {section.badge && (
                        <div className={`flex items-center gap-1.5 rounded-full bg-gradient-to-r ${section.gradient} px-3 py-1 shadow-md`}>
                          <TrendingUp className="h-3.5 w-3.5 text-white" />
                          <span className="text-sm font-bold text-white">{section.badge}</span>
                          {section.badgeLabel && (
                            <span className="text-xs text-white/80">{section.badgeLabel}</span>
                          )}
                        </div>
                      )}
                    </R_Stack>
                    <p className="text-sm text-gray-600 md:text-base">{section.subtitle}</p>
                  </div>
                </R_Stack>

                {/* コンテンツ */}
                <div className="relative">
                  {section.content}
                </div>

                {/* 下部アクセント */}
                <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r ${section.gradient} opacity-40`} />
              </motion.div>
            )
          })}
        </C_Stack>
      </div>
    </MyContainer>
  )
}
