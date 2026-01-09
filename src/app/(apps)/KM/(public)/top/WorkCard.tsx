'use client'

import React from 'react'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import useWindowSize from '@cm/hooks/useWindowSize'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { WorkCardHeader } from './components/WorkCardHeader'
import { WorkCardClientInfo } from './components/WorkCardClientInfo'
import { WorkCardChallenge } from './components/WorkCardChallenge'
import { WorkCardSolution } from './components/WorkCardSolution'
import { WorkCardResult } from './components/WorkCardResult'
import { WorkCardTestimonial } from './components/WorkCardTestimonial'
import { useWorkCardReady } from '../../hooks/useWorkCardReady'
import { MOBILE_BREAKPOINT, WORK_CARD_INTERSECTION_CONFIG } from '../../constants/workCardConstants'

import { WORK_CARD_ANIMATION } from '@app/(apps)/KM/constants/animationConstants'

interface WorkCardProps {
  work: {
    title: string
    KaizenClient?: any
    subtitle?: string | null
    allowShowClient: boolean
    description?: string | null
    beforeChallenge?: string | null
    quantitativeResult?: string | null
    points?: string | null
    impression?: string | null
    reply?: string | null
    KaizenWorkImage?: Array<{ url: string }>
    dealPoint?: number | null
    toolPoint?: number | null
    companyScale?: string | null
    projectDuration?: string | null
    jobCategory?: string | null
    systemCategory?: string | null
    collaborationTool?: string | null
  }
  className?: string
}

export const WorkCard = React.memo(({ work, className }: WorkCardProps) => {
  const { width } = useWindowSize()
  const { ref, inView } = useInView({
    triggerOnce: WORK_CARD_INTERSECTION_CONFIG.TRIGGER_ONCE,
    threshold: WORK_CARD_INTERSECTION_CONFIG.THRESHOLD,
  })

  const ready = useWorkCardReady()

  if (!ready) return <PlaceHolder></PlaceHolder>

  const isMobile = width < MOBILE_BREAKPOINT

  return (
    <motion.div
      ref={ref}
      initial={WORK_CARD_ANIMATION.initial}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={WORK_CARD_ANIMATION.transition}
    >
      <div className={`group overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-50 via-white to-blue-50 shadow-xl transition-all duration-300 hover:shadow-2xl border-2 border-slate-100 ${className}   `}>
        {/* ヘッダー */}
        <WorkCardHeader
          title={work.title}
          subtitle={work.subtitle}
          KaizenClient={work.KaizenClient}
          allowShowClient={work.allowShowClient}
          work={work}
          dealPoint={work.dealPoint}
          toolPoint={work.toolPoint}
          isMobile={isMobile}
        />

        {/* 顧客・期間情報 */}
        <WorkCardClientInfo
          KaizenClient={work.KaizenClient}
          allowShowClient={work.allowShowClient}
          projectDuration={work.projectDuration}
          companyScale={work.companyScale}
        />

        {/* 画像カルーセル */}
        {/* <WorkCardImageCarousel images={work.KaizenWorkImage} /> */}

        {/* メインコンテンツ - フロー形式 */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* STEP 1: 課題 */}
          {work.beforeChallenge && <WorkCardChallenge beforeChallenge={work.beforeChallenge} inView={inView} />}

          {/* STEP 2: ソリューション */}
          {(work.description || work.points) && (
            <WorkCardSolution
              description={work.description}
              points={work.points}
              quantitativeResult={work.quantitativeResult}
              inView={inView}
            />
          )}

          {/* STEP 3: 成果 */}
          {work.quantitativeResult && (
            <WorkCardResult quantitativeResult={work.quantitativeResult} inView={inView} />
          )}

          {/* 顧客の声 */}
          {work.impression && (
            <WorkCardTestimonial impression={work.impression} reply={work.reply} inView={inView} />
          )}
        </div>
      </div>
    </motion.div>
  )
})
