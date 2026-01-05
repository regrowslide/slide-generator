'use client'

import { useState, useEffect } from 'react'
import { EnhancedServices } from '@app/(apps)/KM/components/enhanced/EnhancedServices'
import { EnhancedWorks } from '@app/(apps)/KM/components/enhanced/EnhancedWorks'
import { EnhancedContact } from '@app/(apps)/KM/components/enhanced/EnhancedContact'
import { DemoDrivenDevelopment } from '@app/(apps)/KM/components/DemoDrivenDevelopment'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Sparkles, X } from 'lucide-react'

// スクロール進捗バーコンポーネント
const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const worksSection = document.getElementById('works')
      const contactSection = document.getElementById('contact')

      if (worksSection && contactSection) {
        const worksTop = worksSection.offsetTop
        const contactTop = contactSection.offsetTop
        const windowHeight = window.innerHeight
        const scrollY = window.scrollY

        // 実績セクションからお問い合わせセクションまでの進捗を計算
        const totalDistance = contactTop - worksTop
        const scrolledDistance = scrollY + windowHeight - worksTop
        const progress = Math.min(Math.max(scrolledDistance / totalDistance, 0), 1)

        setScrollProgress(progress)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // 初期値設定

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

// フローティングCTAバナーコンポーネント
const FloatingCTABanner = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const worksSection = document.getElementById('works')
      const contactSection = document.getElementById('contact')

      if (worksSection && contactSection) {
        const worksRect = worksSection.getBoundingClientRect()
        const contactRect = contactSection.getBoundingClientRect()

        // 実績セクションに入り、お問い合わせセクションに到達する前まで表示
        const isInWorksSection = worksRect.top < window.innerHeight && worksRect.bottom > 0
        const isBeforeContact = contactRect.top > window.innerHeight

        setIsVisible(isInWorksSection && isBeforeContact)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // 初期値設定

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-2 py-1 text-white font-bold shadow-lg transition-all hover:bg-amber-600 hover:scale-105"
                  >
                    <Sparkles className="h-4 w-4" />
                    デモ先行開発とは？
                  </button>
                  <button
                    onClick={scrollToContact}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-2 py-1 text-blue-900 font-bold shadow-lg transition-all hover:bg-gray-100 hover:scale-105"
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

export const EnhancedEasyProfile = ({ kaizenClient, works }: { kaizenClient: any[]; works: any[] }) => {
  const sections = [
    {
      id: 'mainActivity',
      label: 'お仕事',
      component: <EnhancedServices {...{ kaizenClient }} />,
    },
    {
      id: 'works',
      label: '実績・制作物',
      component: <EnhancedWorks works={works} />,
    },
    {
      id: 'contact',
      label: 'お問い合わせ',
      component: <EnhancedContact />,
    },
  ]

  return (
    <>
      {/* スクロール進捗バー */}
      <ScrollProgressBar />

      {/* フローティングCTAバナー */}
      <FloatingCTABanner />

      <main id="EasyProfile" className="mx-auto items-center" role="main">
        <div className="w-full">
          {sections.map((section, i) => {
            return (
              <motion.section
                key={i}
                id={section.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8 }}
                className="relative"
                aria-labelledby={`${section.id}-heading`}
              >
                {/* セクションヘッダー - よりモダンなデザイン */}
                <header className="sticky top-0 z-20 mb-6">
                  <div className="bg-gradient-to-r from-blue-900 via-blue-400 to-blue-900 shadow-xl">
                    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                      <div className="flex items-center justify-between">
                        <motion.h2
                          id={`${section.id}-heading`}
                          initial={{ x: -20, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6 }}
                          className="text-xl font-bold text-white sm:text-2xl"
                        >
                          {section.label}
                        </motion.h2>
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, type: 'spring' }}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-base font-bold text-white backdrop-blur-sm"
                          aria-label={`セクション ${i + 1}`}
                        >
                          {i + 1}
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  {/* 装飾ライン */}
                  <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>
                </header>

                {/* コンテンツ */}
                <div className="pb-16">{section.component}</div>
              </motion.section>
            )
          })}
        </div>
      </main>
    </>
  )
}
