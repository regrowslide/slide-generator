'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Sparkles, X } from 'lucide-react'
import { useFloatingCTA } from '../../hooks/useFloatingCTA'
import { DemoDrivenDevelopment } from '../DemoDrivenDevelopment'

/**
 * フローティングCTAバナーコンポーネント
 */
export const FloatingCTABanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { isVisible, scrollToSection } = useFloatingCTA({
    triggerSectionId: 'works',
    hideBeforeSectionId: 'contact',
  })

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-2xl border-t-2 border-amber-500/30"
          >
            <div className="mx-auto max-w-7xl px-4 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm text-blue-100">デモ開発・お見積りまで無償 | ご発注確定まで費用は一切発生しません</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-white font-bold shadow-lg transition-all hover:bg-amber-600 hover:scale-105"
                  >

                    デモ先行開発とは？
                  </button>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-blue-900 font-bold shadow-lg transition-all hover:bg-gray-100 hover:scale-105"
                  >
                    <MessageCircle className="h-4 w-4" />
                    お問い合わせ
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* デモ先行開発モーダル */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            {/* オーバーレイ */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* モーダルコンテンツ */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 h-[90vh] w-full max-w-7xl overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ヘッダー */}
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900">デモ先行開発について</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* コンテンツ */}
              <div className="h-[calc(90vh-73px)] overflow-y-auto">
                <DemoDrivenDevelopment />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

