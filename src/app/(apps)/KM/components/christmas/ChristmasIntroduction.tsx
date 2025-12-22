'use client'

import { Kaizen } from '@app/(apps)/KM/class/Kaizen'
import BackGroundImage from '@cm/components/utils/BackGroundImage'
import useWindowSize from '@cm/hooks/useWindowSize'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, Snowflake, Star, Gift } from 'lucide-react'
import { cn } from '@cm/shadcn/lib/utils'

// 雪のアニメーションコンポーネント
const Snowfall = () => {
 const snowflakes = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: Math.random() * 5,
  duration: 5 + Math.random() * 10,
  size: 8 + Math.random() * 16,
 }))

 return (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
   {snowflakes.map(flake => (
    <motion.div
     key={flake.id}
     className="absolute text-white/80"
     style={{ left: flake.left, top: -20 }}
     animate={{
      y: ['0vh', '100vh'],
      rotate: [0, 360],
      opacity: [1, 0.8, 1],
     }}
     transition={{
      duration: flake.duration,
      delay: flake.delay,
      repeat: Infinity,
      ease: 'linear',
     }}
    >
     <Snowflake size={flake.size} />
    </motion.div>
   ))}
  </div>
 )
}

// キラキラ星のアニメーション
const TwinklingStars = () => {
 const stars = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: Math.random() * 2,
  size: 12 + Math.random() * 12,
 }))

 return (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
   {stars.map(star => (
    <motion.div
     key={star.id}
     className="absolute text-amber-300"
     style={{ left: star.left, top: star.top }}
     animate={{
      scale: [1, 1.5, 1],
      opacity: [0.5, 1, 0.5],
     }}
     transition={{
      duration: 2,
      delay: star.delay,
      repeat: Infinity,
      ease: 'easeInOut',
     }}
    >
     <Star size={star.size} fill="currentColor" />
    </motion.div>
   ))}
  </div>
 )
}

export const ChristmasIntroduction = () => {
 const { width } = useWindowSize()
 const { fontBig, fontSm } = Kaizen.const.getFonts({ width })
 const [isVisible, setIsVisible] = useState(false)

 useEffect(() => {
  setIsVisible(true)
 }, [])

 const bgUrl = '/image/KM/intro-bg.png'

 const Message = () => {
  return (
   <div className="relative z-30 py-4 pt-4">
    <motion.div
     initial={{ opacity: 0, y: 50 }}
     animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
     transition={{ duration: 1, delay: 0.3 }}
     className="mx-auto max-w-3xl"
    >
     {/* クリスマス装飾バナー */}
     <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="mb-4 flex justify-center"
     >
      <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 via-green-600 to-red-600 px-6 py-2 shadow-lg">
       <Gift className="h-5 w-5 text-amber-300" />
       <span className="text-lg font-bold text-white">Merry Christmas</span>
       <Gift className="h-5 w-5 text-amber-300" />
      </div>
     </motion.div>

     <div
      className={cn(
       `${fontBig} mx-2 lg:mx-4 rounded-2xl bg-gradient-to-br from-white/90 via-red-50/80 to-green-50/80 p-4 font-bold shadow-2xl backdrop-blur-sm sm:p-5 lg:p-6 border-2 border-red-200`
      )}
     >
      <C_Stack className="items-center gap-4 sm:gap-6">

       {/* クリスマスリボン装飾 */}
       <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <div className="h-4 w-20 bg-gradient-to-b from-red-300 to-red-700 rounded-b-lg shadow-md"></div>
       </div>

       {/* サブタイトル */}
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: isVisible ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.7 }}>
        <C_Stack className={`text-center ${fontSm}`}>
         <h2 className="text-gray-700">業務改善・自動化に特化したツール開発で</h2>
         <p className="text-gray-700">中小企業、事業主様の業務改善を担います。</p>
        </C_Stack>
       </motion.div>

       {/* メインキャッチコピー */}
       <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="relative"
       >
        <C_Stack className={`${fontBig} p-0 lg:p-4 text-center`}>
         <div className="relative">
          <h1 className="text-center text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">
           <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            無駄な業務の撲滅を。
           </span>
          </h1>
          <div className="absolute -bottom-1 left-1/2 h-1 w-3/4 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-red-600 to-red-800"></div>
         </div>
         <div className="relative mt-2">
          <h2 className="text-end text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">
           <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            ヒトの時間に余白を。
           </span>
          </h2>
          <div className="absolute -bottom-1 right-0 h-1 w-3/4 rounded-full bg-gradient-to-r from-green-600 to-green-800"></div>
         </div>
        </C_Stack>
       </motion.div>

       {/* 信念 */}
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: isVisible ? 1 : 0 }} transition={{ duration: 0.8, delay: 1.1 }}>
        <C_Stack className={`text-center ${fontSm} `}>
         <p className="text-gray-700">をモットーとし、</p>
         <div className="flex flex-wrap justify-center gap-2">
          <span className="rounded-lg bg-red-600/10 px-2 py-1 text-sm font-semibold text-red-700 border border-red-200">
           揺るぎない信念
          </span>
          <span className="rounded-lg bg-green-600/10 px-2 py-1 text-sm font-semibold text-green-700 border border-green-200">
           確固たる意志
          </span>
         </div>
         <p className="text-gray-700">で、本気の業務改善を。</p>
        </C_Stack>
       </motion.div>

       {/* 実績と特徴 */}
       <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 1.3 }}
        className="w-full"
       >
        <C_Stack className={`text-center ${fontSm}`}>
         <div className="rounded-lg bg-gradient-to-r from-red-50 to-green-50 p-3 border border-red-100">
          <div className="mb-1 text-gray-700">エンジニア・マネージャとしての開発経験。</div>
          <div className="text-base font-bold text-red-700 sm:text-lg">
           エージェント実績280件超。
           <div>
            <small className="ml-2 text-xs text-gray-600">(ココナラ・ランサーズ)</small>
           </div>
          </div>
         </div>

         <R_Stack className="mt-3 justify-center gap-2 text-gray-700 sm:text-base">
          <div className="w-fit rounded-lg bg-gradient-to-r from-red-50 to-white p-2 shadow-sm border border-red-100">
           <span className="mx-2 font-bold text-red-700">誰よりも「めんどくさがり」</span>
           <span className="ml-1">だからこそ、</span>
          </div>

          <div className="w-fit rounded-lg bg-gradient-to-r from-green-50 to-white p-2 shadow-sm border border-green-100">
           <span className="mx-2 font-bold text-green-700">誰よりも使い手の利便性</span>
           <span className="ml-1">にこだわり、</span>
          </div>

          <div>あなたの業務を改善します。</div>
         </R_Stack>
        </C_Stack>
       </motion.div>

       {/* CTA - クリスマス仕様 */}
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="mt-3"
       >
        <div className="relative rounded-xl bg-gradient-to-r from-red-700 via-green-700 to-red-700 p-4 text-white shadow-xl overflow-hidden">
         {/* 装飾 */}
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300"></div>
         <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300"></div>

         <div className={`${fontBig} mb-1 text-center text-lg sm:text-xl lg:text-2xl`}>
          ~マイデスクから始める業務改善~
         </div>
         <div className="text-center text-base sm:text-lg">を一緒にやりませんか？</div>
        </div>
       </motion.div>
      </C_Stack>
     </div>
    </motion.div>

    {/* スクロールダウン矢印 */}
    <motion.div
     initial={{ opacity: 0 }}
     animate={{ opacity: isVisible ? 1 : 0 }}
     transition={{ duration: 0.8, delay: 2 }}
     className="mt-8 flex justify-center"
    >
     <motion.div
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="cursor-pointer text-white"
      onClick={() => {
       const element = document.getElementById('mainActivity')
       element?.scrollIntoView({ behavior: 'smooth' })
      }}
     >
      <ArrowDown className="h-8 w-8 drop-shadow-lg" />
     </motion.div>
    </motion.div>
   </div>
  )
 }

 return (
  <header id="introduction" className="relative min-h-screen" role="banner">
   {/* クリスマスオーバーレイ */}
   <div className="absolute inset-0 bg-gradient-to-b from-red-900/30 via-transparent to-green-900/30 z-[5]"></div>

   <BackGroundImage {...{ url: bgUrl, alt: '改善マニア クリスマス特別ページ' }} />

   <Snowfall />
   <TwinklingStars />

   <Message />
  </header>
 )
}

