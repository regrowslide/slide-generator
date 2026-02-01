'use client'

import { motion } from 'framer-motion'
import { SCROLL_DOWN_ANIMATION } from '../../constants/animationConstants'
import { KM } from '../../class/Kaizen'

interface IntroductionMessageProps {
  isVisible: boolean
}

// スプリットスクリーン用アニメーション
const splitAnimation = {
  left: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  center: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
}

/**
 * イントロダクションメッセージコンポーネント
 * スプリットスクリーン型（左右対比）レイアウト
 */
export const IntroductionMessage: React.FC<IntroductionMessageProps> = ({ isVisible }) => {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 ">
      {/* メインコンテンツ */}
      <div className="w-full max-w-6xl ">
        {/* スプリットスクリーン - 左右対比 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-0 ">
          {/* 左側 - 課題（青系） */}
          <motion.div
            variants={splitAnimation.left}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 via-blue-950/70 to-slate-900/80 p-8 backdrop-blur-md lg:rounded-b-none lg:rounded-r-none lg:p-12"
          >
            {/* 背景装飾 */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-2xl" />
            </div>

            <div className="relative z-10 text-center lg:text-left ">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="hidden sm:inline-block mb-4  rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-1.5"
              >
                <span className="text-xs font-semibold tracking-wider text-blue-300">MISSION</span>
              </motion.div>

              <h1
                className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
              >
                <span className="block text-white">無駄な業務の</span>
                <span className="mt-1 block text-cyan-300">撲滅を</span>
              </h1>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={isVisible ? { scaleX: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 sm:w-24 lg:mx-0 lg:w-32"
              />
            </div>
          </motion.div>

          {/* 右側 - 解決（オレンジ系） */}
          <motion.div
            variants={splitAnimation.right}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 via-orange-950/70 to-slate-900/80 p-8 backdrop-blur-md lg:rounded-b-none lg:rounded-l-none lg:p-12"
          >
            {/* 背景装飾 */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-orange-500/10 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />
            </div>

            <div className="relative z-10 text-center lg:text-right">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="hidden sm:inline-block mb-4  rounded-full border border-amber-400/30 bg-amber-500/20 px-4 py-1.5"
              >
                <span className="text-xs font-semibold tracking-wider text-amber-300">VISION</span>
              </motion.div>

              <h2
                className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
              >
                <span className="block text-white">ヒトの時間に</span>
                <span className="mt-1 block text-amber-300">余白を</span>
              </h2>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={isVisible ? { scaleX: 1 } : {}}
                transition={{ duration: 0.8, delay: 1 }}
                className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 sm:w-24 lg:ml-auto lg:mr-0 lg:w-32"
              />
            </div>
          </motion.div>
        </div>

        {/* 中央 - サブコピー */}
        <motion.div
          variants={splitAnimation.center}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          className="mt-4 lg:mt-0"
        >
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-center backdrop-blur-md sm:p-8 lg:rounded-t-none">
            <div className="space-y-3 sm:space-y-4" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              <p className="text-base leading-relaxed sm:text-lg lg:text-xl">
                <span className="text-cyan-400 font-bold">誰よりも「めんどくさがり」</span>
                <span className="text-white">だからこそ、</span>
                <br />
                <span className="text-amber-400 font-bold">誰よりも使い手の利便性</span>
                <span className="text-white">にこだわった</span>
              </p>
              <p className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">本気の業務改善をお届けします。</p>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="mt-6 "
            >
              <div className="inline-block rounded-lg bg-white px-6 py-3 sm:px-8 sm:py-4">
                <span className="text-base font-bold text-slate-900 sm:text-lg lg:text-xl">
                  業務改善に特化したツール開発
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* スクロールダウン */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="mt-12 sm:mt-16"
      >
        <motion.button
          animate={{ y: SCROLL_DOWN_ANIMATION.Y_RANGE as any }}
          transition={{
            duration: SCROLL_DOWN_ANIMATION.DURATION,
            repeat: SCROLL_DOWN_ANIMATION.REPEAT,
            ease: SCROLL_DOWN_ANIMATION.EASE,
          }}
          onClick={() => {
            const element = document.getElementById('mainActivity')
            element?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="group flex flex-col items-center gap-2 text-white/80 transition-colors hover:text-white"
        >
          <span className="text-xs font-medium tracking-widest sm:text-sm">SCROLL</span>
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/40 bg-black/20 p-1 backdrop-blur-sm transition-colors group-hover:border-white/60 sm:h-12 sm:w-7 sm:p-1.5">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-1 rounded-full bg-white sm:h-2.5"
            />
          </div>
        </motion.button>
      </motion.div>
    </div>
  )
}
