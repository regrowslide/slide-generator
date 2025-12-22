'use client'

import { motion } from 'framer-motion'
import { LightbulbIcon, WrenchIcon, ZapIcon } from 'lucide-react'
import SlateEditor from '@cm/components/SlateEditor/SlateEditor'
import { StepArrow } from './StepArrow'

interface WorkCardSolutionProps {
  description?: string | null
  points?: string | null
  quantitativeResult?: string | null
  inView: boolean
}

export const WorkCardSolution = ({ description, points, quantitativeResult, inView }: WorkCardSolutionProps) => {
  if (!description && !points) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="relative">
        {/* ステップ番号 */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shadow-lg flex-shrink-0">
            <span className="text-white font-black text-base sm:text-lg">2</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <LightbulbIcon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 flex-shrink-0" />
            <span className="text-base sm:text-lg font-bold text-slate-800">改善マニアの解決策</span>
          </div>
          <div className="text-xl sm:text-2xl flex-shrink-0">💡</div>
        </div>

        {/* ソリューションカード */}
        <div className="ml-0 sm:ml-5 pl-4 sm:pl-8 border-l-4 border-indigo-200">
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-3 sm:p-5 border-2 border-indigo-100 shadow-sm">
            {description && (
              <div className="text-slate-700 leading-relaxed text-base sm:text-lg">
                <SlateEditor readOnly>{description}</SlateEditor>
              </div>
            )}

            {/* 技術的ポイント */}
            {points && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-indigo-100">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <WrenchIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base font-bold text-purple-900">技術的工夫</span>
                  <ZapIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
                </div>
                <div className="text-slate-600 leading-relaxed text-base sm:text-lg mt-2">
                  <SlateEditor readOnly>{points}</SlateEditor>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 矢印 */}
      {quantitativeResult && <StepArrow color="emerald-400" />}
    </motion.div>
  )
}
