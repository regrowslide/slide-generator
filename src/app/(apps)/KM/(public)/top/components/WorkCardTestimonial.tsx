'use client'

import { motion } from 'framer-motion'
import { MessageCircleIcon, PartyPopperIcon } from 'lucide-react'
import SlateEditor from '@cm/components/SlateEditor/SlateEditor'

interface WorkCardTestimonialProps {
  impression: string
  reply?: string | null
  inView: boolean
}

export const WorkCardTestimonial = ({ impression, reply, inView }: WorkCardTestimonialProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-4 sm:mt-6"
    >
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4 sm:p-6 border-2 border-amber-200 shadow-md relative overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg flex-shrink-0">
            <MessageCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <span className="text-base sm:text-lg font-bold text-amber-800">お客様の声</span>
          <PartyPopperIcon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0" />
        </div>

        <div className="ml-1 sm:ml-2 pl-3 sm:pl-4 border-l-4 border-amber-300">
          <p className="text-slate-700 italic leading-relaxed text-base sm:text-lg">"{impression}"</p>
        </div>

        {reply && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-amber-200/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs sm:text-sm font-bold text-amber-700">💪 改善マニアより</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 bg-white/50 rounded-lg sm:rounded-xl p-2 sm:p-3">
              <SlateEditor readOnly>{reply}</SlateEditor>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
