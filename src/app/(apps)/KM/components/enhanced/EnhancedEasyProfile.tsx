'use client'

import { EnhancedServices } from '@app/(apps)/KM/components/enhanced/EnhancedServices'
import { EnhancedWorks } from '@app/(apps)/KM/components/enhanced/EnhancedWorks'
import { EnhancedContact } from '@app/(apps)/KM/components/enhanced/EnhancedContact'
import { ScrollProgressBar } from './ScrollProgressBar'
import { FloatingCTABanner } from './FloatingCTABanner'
import { motion } from 'framer-motion'

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
      <ScrollProgressBar />
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
