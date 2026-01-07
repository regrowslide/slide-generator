'use client'

import { motion } from 'framer-motion'
import { useScrollProgress } from '../../hooks/useScrollProgress'

/**
 * スクロール進捗バーコンポーネント
 */
export const ScrollProgressBar = () => {
  const scrollProgress = useScrollProgress({
    startSectionId: 'works',
    endSectionId: 'contact',
  })

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200/50 z-50">
      <motion.div
        className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-amber-500 transition-all duration-300"
        style={{ width: `${scrollProgress * 100}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${scrollProgress * 100}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  )
}

