'use client'

import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { motion } from 'framer-motion'
import { INTRODUCTION_ANIMATION, PARTICLE_ANIMATION, SCROLL_DOWN_ANIMATION } from '../../constants/animationConstants'
import { KM } from '../../class/Kaizen'

interface IntroductionMessageProps {
  isVisible: boolean
}

/**
 * イントロダクションメッセージコンポーネント
 */
export const IntroductionMessage: React.FC<IntroductionMessageProps> = ({ isVisible }) => {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8">
      {/* 装飾要素 - 浮遊するパーティクル */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(PARTICLE_ANIMATION.COUNT)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-white/20"
            initial={{ opacity: 0 }}
            animate={{
              opacity: PARTICLE_ANIMATION.OPACITY_RANGE,
              y: PARTICLE_ANIMATION.Y_RANGE,
              x: [0, Math.random() * PARTICLE_ANIMATION.X_VARIANCE - PARTICLE_ANIMATION.X_VARIANCE / 2, 0],
            }}
            transition={{
              duration: PARTICLE_ANIMATION.BASE_DURATION + Math.random() * PARTICLE_ANIMATION.DURATION_VARIANCE,
              repeat: Infinity,
              delay: i * PARTICLE_ANIMATION.BASE_DELAY,
            }}
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        variants={INTRODUCTION_ANIMATION.CONTAINER}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        className="w-full max-w-4xl"
      >
        {/* メインカード */}
        <motion.div
          variants={INTRODUCTION_ANIMATION.ITEM}
          className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:p-10"
        >
          {/* 背景グラデーション装飾 */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-tr from-amber-400/20 to-transparent blur-3xl" />

          <C_Stack className="relative z-10 items-center gap-6 sm:gap-8">
            {/* サブタイトル */}
            <motion.div variants={INTRODUCTION_ANIMATION.ITEM}>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-5 py-2.5 text-base font-medium text-blue-800 backdrop-blur-sm sm:text-lg">
                業務改善・自動化に特化したツール開発
              </div>
            </motion.div>

            {/* メインキャッチコピー */}
            <motion.div variants={INTRODUCTION_ANIMATION.ITEM} className="w-full">
              <C_Stack className="gap-4 text-center">
                <div className="relative inline-block">
                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-5xl">
                    <span className="bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 bg-clip-text text-transparent">
                      無駄な業務の撲滅を。
                    </span>
                  </h1>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="absolute -bottom-2 left-0 h-1 w-full origin-left rounded-full bg-gradient-to-r from-blue-600 via-blue-800 to-blue-600"
                  />
                </div>

                <div className="relative inline-block self-end">
                  <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-5xl">
                    <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                      ヒトの時間に余白を。
                    </span>
                  </h2>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="absolute -bottom-2 right-0 h-1 w-full origin-right rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400"
                  />
                </div>
              </C_Stack>
            </motion.div>

            {/* 哲学 */}
            <motion.div variants={INTRODUCTION_ANIMATION.ITEM} className="text-center">
              <p className="text-lg text-slate-600 sm:text-xl">
                をモットーに、
                <span className="mx-1 font-bold text-blue-900">揺るぎない信念</span>と
                <span className="mx-1 font-bold text-blue-900">確固たる意志</span>で
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-800 sm:text-2xl">本気の業務改善をお届けします。</p>
            </motion.div>

            {/* 特徴テキスト */}
            <motion.div variants={INTRODUCTION_ANIMATION.ITEM}>
              <R_Stack className="flex-wrap justify-center gap-3 text-center text-base sm:text-lg">
                <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-slate-50 px-5 py-3 shadow-sm">
                  <KM.CoolStrong>誰よりも「めんどくさがり」</KM.CoolStrong>
                  <span className="text-slate-600">だからこそ、</span>
                </div>
                <div className="rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50 to-slate-50 px-5 py-3 shadow-sm">
                  <KM.WarmStrong>誰よりも使い手の利便性</KM.WarmStrong>
                  <span className="text-slate-600">にこだわる。</span>
                </div>
              </R_Stack>
            </motion.div>

            {/* CTA */}
            <motion.div variants={INTRODUCTION_ANIMATION.ITEM} className="w-full">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-6 shadow-xl transition-all duration-500 hover:shadow-2xl sm:p-8">
                {/* ホバー時の光沢エフェクト */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <div className="relative z-10 text-center">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/90 sm:text-base">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    新規ご相談受付中
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl lg:text-3xl">
                    ~マイデスクから始める業務改善~
                  </h3>
                  <p className="text-lg text-white/90 sm:text-xl">を一緒に始めませんか?</p>
                </div>
              </div>
            </motion.div>
          </C_Stack>
        </motion.div>
      </motion.div>

      {/* スクロールダウン */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 2 }}
        className="mt-10"
      >
        <motion.button
          animate={{ y: SCROLL_DOWN_ANIMATION.Y_RANGE }}
          transition={{
            duration: SCROLL_DOWN_ANIMATION.DURATION,
            repeat: SCROLL_DOWN_ANIMATION.REPEAT,
            ease: SCROLL_DOWN_ANIMATION.EASE,
          }}
          onClick={() => {
            const element = document.getElementById('mainActivity')
            element?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="group flex flex-col items-center gap-2 text-white/90 transition-colors hover:text-white"
        >
          <span className="text-base font-medium tracking-wider">SCROLL</span>
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/50 p-1 transition-colors group-hover:border-white">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-1 rounded-full bg-white"
            />
          </div>
        </motion.button>
      </motion.div>
    </div>
  )
}

