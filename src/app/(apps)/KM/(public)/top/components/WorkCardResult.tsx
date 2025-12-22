'use client'

import { motion } from 'framer-motion'
import { RocketIcon, TrendingUpIcon } from 'lucide-react'

interface WorkCardResultProps {
  quantitativeResult: string
  inView: boolean
}

export const WorkCardResult = ({ quantitativeResult, inView }: WorkCardResultProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="relative">
        {/* ステップ番号 */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg flex-shrink-0">
            <span className="text-white font-black text-base sm:text-lg">3</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <RocketIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 flex-shrink-0" />
            <span className="text-base sm:text-lg font-bold text-slate-800">達成した成果</span>
          </div>
        </div>

        {/* 成果カード */}
        <div className="ml-0 sm:ml-5 pl-4 sm:pl-8 border-l-4 border-emerald-200">
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-3 sm:p-5 border-2 border-emerald-100 shadow-sm">
            <div className="flex items-start gap-2 sm:gap-3">
              <TrendingUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500 flex-shrink-0 mt-0.5 sm:mt-1" />
              <p className="text-base sm:text-lg font-bold text-emerald-800 whitespace-pre-line leading-relaxed">
                {quantitativeResult}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
