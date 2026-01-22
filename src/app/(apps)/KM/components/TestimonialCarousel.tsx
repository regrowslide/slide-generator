'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TestimonialCard } from './TestimonialCard'
import { TESTIMONIAL_ANIMATION } from '../constants/animationConstants'
import type { TestimonialData } from '@app/(apps)/KM/(public)/testimonials/page'

interface TestimonialCarouselProps {
 testimonials: TestimonialData[]
}

export const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ testimonials }) => {
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
     <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
     >
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
       お客様の声
      </h1>
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
      {testimonials.map((testimonial) => (
       <TestimonialCard key={testimonial.id} testimonial={testimonial} />
      ))}
     </motion.div>

     {/* 件数表示 */}
     <div className="text-center mt-8 text-sm text-gray-500">
      全 {testimonials.length} 件のお客様の声
     </div>
    </div>
   </section>
  </div>
 )
}

