'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { TestimonialCard } from './TestimonialCard'
import { TESTIMONIAL_ANIMATION } from '../constants/animationConstants'
import type { TestimonialData } from '@app/(apps)/KM/(public)/testimonials/page'

// 初期表示件数
const INITIAL_DISPLAY_COUNT = 6

interface TestimonialCarouselProps {
  testimonials: TestimonialData[]
}

export const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ testimonials }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // 表示するtestimonials（展開状態によって変わる）
  const displayedTestimonials = useMemo(() => {
    if (isExpanded) {
      return testimonials
    }
    return testimonials.slice(0, INITIAL_DISPLAY_COUNT)
  }, [testimonials, isExpanded])

  // 残り件数
  const remainingCount = testimonials.length - INITIAL_DISPLAY_COUNT

  if (testimonials.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500 text-lg">お客様の声はまだ登録されていません。</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/30">
      {/* ヒーローセクション */}
      <section className="py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">お客様の声</h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              改善マニアをご利用いただいたお客様からの
              <br className="hidden sm:block" />
              貴重なご意見・ご感想をご紹介します
            </p>
          </motion.div>
        </div>
      </section>

      {/* カードグリッドセクション */}
      <section className="pb-16 sm:pb-20 lg:pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={TESTIMONIAL_ANIMATION.CONTAINER}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12"
          >
            <AnimatePresence mode="popLayout">
              {displayedTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: 0.3,
                    delay: index >= INITIAL_DISPLAY_COUNT ? (index - INITIAL_DISPLAY_COUNT) * 0.05 : 0,
                  }}
                >
                  <TestimonialCard testimonial={testimonial} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* 続きを見るボタン / 件数表示 */}
          <div className="text-center mt-12">
            {!isExpanded && remainingCount > 0 ? (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setIsExpanded(true)}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-xl active:scale-95"
              >
                <span>続きを見る（残り {remainingCount} 件）</span>
                <ChevronDown className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
              </motion.button>
            ) : (
              <div className="text-sm text-gray-500">全 {testimonials.length} 件のお客様の声</div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
