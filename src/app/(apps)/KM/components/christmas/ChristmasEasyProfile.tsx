'use client'

import { ChristmasServices } from '@app/(apps)/KM/components/christmas/ChristmasServices'
import { ChristmasWorks } from '@app/(apps)/KM/components/christmas/ChristmasWorks'
import { ChristmasContact } from '@app/(apps)/KM/components/christmas/ChristmasContact'
import { motion } from 'framer-motion'
import { Gift, Star, TreePine } from 'lucide-react'

export const ChristmasEasyProfile = ({ kaizenClient, works }: { kaizenClient: any[]; works: any[] }) => {
  const sections = [
    {
      id: 'mainActivity',
      label: 'お仕事',
      icon: TreePine,
      component: <ChristmasServices {...{ kaizenClient }} />,
    },
    {
      id: 'works',
      label: '実績・制作物',
      icon: Star,
      component: <ChristmasWorks works={works} />,
    },
    {
      id: 'contact',
      label: 'お問い合わせ',
      icon: Gift,
      component: <ChristmasContact />,
    },
  ]

  return (
    <main id="EasyProfile" className="mx-auto items-center" role="main">
      <div className="w-full">
        {sections.map((section, i) => {
          const Icon = section.icon
          const isEven = i % 2 === 0

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
              {/* クリスマスセクションヘッダー */}
              <header className="sticky top-0 z-20 mb-6">
                <div
                  className={`shadow-xl ${
                    isEven
                      ? 'bg-gradient-to-r from-red-700 via-red-800 to-red-900'
                      : 'bg-gradient-to-r from-green-700 via-green-800 to-green-900'
                  }`}
                >
                  <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                      <motion.div
                        className="flex items-center gap-3"
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                          <Icon className="h-5 w-5 text-amber-300" />
                        </div>
                        <h2
                          id={`${section.id}-heading`}
                          className="text-xl font-bold text-white sm:text-2xl"
                        >
                          {section.label}
                        </h2>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, type: 'spring' }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/80 text-base font-bold text-red-900 backdrop-blur-sm"
                        aria-label={`セクション ${i + 1}`}
                      >
                        {i + 1}
                      </motion.div>
                    </div>
                  </div>
                </div>
                {/* クリスマス装飾ライン - 金色と白のストライプ */}
                <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              </header>

              {/* コンテンツ */}
              <div className="pb-16">{section.component}</div>
            </motion.section>
          )
        })}
      </div>
    </main>
  )
}

