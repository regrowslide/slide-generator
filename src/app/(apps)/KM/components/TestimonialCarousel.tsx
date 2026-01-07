'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Star, Building2, User } from 'lucide-react'
import Image from 'next/image'
import type { TestimonialData } from '@app/(apps)/KM/(public)/testimonials/page'

interface TestimonialCarouselProps {
 testimonials: TestimonialData[]
}

const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
  opacity: 1,
  transition: {
   staggerChildren: 0.1,
  },
 },
}

const cardVariants: any = {
 hidden: { opacity: 0, y: 30 },
 visible: {
  opacity: 1,
  y: 0,
  transition: {
   duration: 0.5,
   ease: 'easeOut',
  },
 },
}

// 星評価を表示
const RatingStars = ({ rating }: { rating: number | null }) => {
 if (!rating) return null
 const stars: any[] = []
 const fullStars = Math.floor(rating)
 const hasHalfStar = rating % 1 >= 0.5

 for (let i = 0; i < 5; i++) {
  if (i < fullStars) {
   stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)
  } else if (i === fullStars && hasHalfStar) {
   stars.push(
    <div key={i} className="relative">
     <Star className="w-3.5 h-3.5 text-gray-300" />
     <div className="absolute inset-0 overflow-hidden w-1/2">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
     </div>
    </div>
   )
  } else {
   stars.push(<Star key={i} className="w-3.5 h-3.5 text-gray-300" />)
  }
 }
 return <div className="flex gap-0.5">{stars}</div>
}

// テスティモニアルカード
const TestimonialCard = ({ testimonial }: { testimonial: TestimonialData }) => {
 return (
  <motion.div
   variants={cardVariants}
   className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col"
  >
   {/* カードヘッダー */}
   <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-4">
    <div className="flex items-center gap-3">
     {/* アイコン */}
     {testimonial.allowShowClient && testimonial.KaizenClient?.iconUrl ? (
      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
       <Image src={testimonial.KaizenClient.iconUrl} alt="" fill className="object-cover" />
      </div>
     ) : (
      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
       <User className="w-6 h-6 text-white" />
      </div>
     )}

     {/* 顧客情報 */}
     <div className="flex-1 min-w-0">
      {testimonial.allowShowClient ? (
       <>
        <h3 className="text-white font-bold text-sm truncate">
         {testimonial.KaizenClient?.name || testimonial.clientName || '匿名のお客様'}
        </h3>
        {(testimonial.KaizenClient?.organization || testimonial.organization) && (
         <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
           {testimonial.KaizenClient?.organization || testimonial.organization}
          </span>
         </p>
        )}
       </>
      ) : (
       <h3 className="text-white font-bold text-sm">お客様</h3>
      )}
     </div>
    </div>
   </div>

   {/* 評価 */}
   {(testimonial.dealPoint || testimonial.toolPoint) && (
    <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
     <div className="flex flex-wrap gap-3 justify-center">
      {testimonial.dealPoint && (
       <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-600">対応</span>
        <RatingStars rating={testimonial.dealPoint} />
       </div>
      )}
      {testimonial.toolPoint && (
       <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-600">成果物</span>
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

    {/* 改善マニアからの返信
    {testimonial.reply && (
     <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3">
       <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
         <MessageCircle className="w-2.5 h-2.5 text-white" />
        </div>
        <span className="text-xs font-bold text-blue-700">改善マニアより</span>
       </div>
       <p className="text-gray-600 text-xs leading-relaxed pl-6 line-clamp-3 whitespace-pre-wrap">
        {testimonial.reply}
       </p>
      </div>
     </div>
    )} */}
   </div>
  </motion.div>
 )
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
      variants={containerVariants}
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

