'use client'

import { motion } from 'framer-motion'
import { AlertCircleIcon } from 'lucide-react'
import { StepArrow } from './StepArrow'

interface WorkCardChallengeProps {
  beforeChallenge: string
  inView: boolean
}

export const WorkCardChallenge = ({ beforeChallenge, inView }: WorkCardChallengeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="relative">
        {/* ステップ番号 */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-400 to-orange-500 shadow-lg flex-shrink-0">
            <span className="text-white font-black text-base sm:text-lg">1</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <AlertCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
            <span className="text-base sm:text-lg font-bold text-slate-800">お悩み・課題</span>
          </div>
          <div className="text-xl sm:text-2xl flex-shrink-0">😰</div>
        </div>

        {/* 課題カード */}
        <div className="ml-0 sm:ml-5 pl-4 sm:pl-8 border-l-4 border-red-200">
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 p-3 sm:p-5 border-2 border-red-100 shadow-sm">
            <p className="text-slate-700 whitespace-pre-line leading-relaxed text-base sm:text-lg">
              {beforeChallenge}
            </p>
          </div>
        </div>
      </div>

      {/* 矢印 */}
      <StepArrow color="indigo-400" />
    </motion.div>
  )
}
