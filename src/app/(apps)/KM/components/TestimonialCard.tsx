'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Building2, User } from 'lucide-react'
import Image from 'next/image'
import { RatingStars } from './RatingStars'
import { TESTIMONIAL_ANIMATION } from '../constants/animationConstants'
import type { TestimonialData } from '@app/(apps)/KM/(public)/testimonials/page'

interface TestimonialCardProps {
 testimonial: TestimonialData
}

/**
 * テスティモニアルカードコンポーネント
 */
const TestimonialCardComponent: React.FC<TestimonialCardProps> = ({ testimonial }) => {
 return (
  <motion.div
   variants={TESTIMONIAL_ANIMATION.CARD}
   className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col"
  >
   {/* カードヘッダー */}
   <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-2 px-4">
    <div className="flex items-center gap-3">
     {/* アイコン */}
     {testimonial.allowShowClient && testimonial.KaizenClient?.iconUrl ? (
      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 p-0.5 border-white bg-white shadow-md flex-shrink-0">
       <Image src={testimonial.KaizenClient.iconUrl} alt="" fill className="object-cover" />
      </div>
     ) : (
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center p-0.5 border-2 border-white shadow-md justify-center flex-shrink-0">
       <User className="w-6 h-6 text-white" />
      </div>
     )}

     {/* 顧客情報 */}
     <div className="flex-1 min-w-0">
      {testimonial.allowShowClient ? (
       <>
        <h3 className="text-white font-bold  truncate">
         {testimonial.KaizenClient?.name || testimonial.clientName || '匿名のお客様'}
        </h3>
        {(testimonial.KaizenClient?.organization || testimonial.organization) && (
         <p className="text-white/80 flex items-center gap-1 mt-0.5">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
           {testimonial.KaizenClient?.organization || testimonial.organization}
          </span>
         </p>
        )}
       </>
      ) : (
       <h3 className="text-white font-bold ">匿名のお客様</h3>
      )}
     </div>
    </div>
   </div>

   {/* 評価 */}
   {(testimonial.dealPoint || testimonial.toolPoint) && (
    <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
     <div className="flex flex-wrap flex-col items-end gap-0.5 ">
      {testimonial.dealPoint && (
       <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-gray-600">応対に関する評価</span>
        <RatingStars rating={testimonial.dealPoint} />
       </div>
      )}
      {testimonial.toolPoint && (
       <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-gray-600">成果物に関する評価</span>
        <RatingStars rating={testimonial.toolPoint} />
       </div>
      )}
     </div>
    </div>
   )}

   {/* お客様の声 */}
   <div className="p-4 flex-1 flex flex-col">
    <div className="relative flex-1">
     <div className="absolute -top-1 -left-1 text-4xl text-amber-200 font-serif leading-none">"</div>
     <p className="text-gray-700 text-sm leading-relaxed pl-5 pr-1 line-clamp-6 whitespace-pre-wrap">
      {testimonial.impression}
     </p>
    </div>

    {/* プロジェクト名 */}
    {testimonial.title && (
     <p className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500 truncate">
      {testimonial.title}
     </p>
    )}
   </div>
  </motion.div>
 )
}

export const TestimonialCard = React.memo(TestimonialCardComponent)

