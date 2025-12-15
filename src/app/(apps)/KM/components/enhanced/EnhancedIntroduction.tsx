'use client'

import { Kaizen, KM } from '@app/(apps)/KM/class/Kaizen'
import BackGroundImage from '@cm/components/utils/BackGroundImage'
import useWindowSize from '@cm/hooks/useWindowSize'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { cn } from '@cm/shadcn/lib/utils'
import { isDev } from '@cm/lib/methods/common'
import { Button } from '@cm/components/styles/common-components/Button'
import { seedKM } from '@app/(apps)/KM/seedKM'

export const EnhancedIntroduction = () => {
  const { width } = useWindowSize()
  const { fontBig, fontSm } = Kaizen.const.getFonts({ width })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const bgUrl = '/image/KM/intro-bg.png'

  const Message = () => {
    return (
      <div className="relative z-10 py-4 pt-4">
        {/* {isDev && <Button onClick={async () => await seedKM()}>seedKM</Button>} 開発環境のみシーディング */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mx-auto max-w-3xl"
        >
          <div
            className={cn(
              `${fontBig} mx-2 lg:mx-4 rounded-2xl bg-white/70 p-4 font-bold shadow-2xl backdrop-blur-xs  sm:p-5 lg:p-6  `
            )}
          >
            <C_Stack className="items-center gap-4 sm:gap-">
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
                      <span className="bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                        無駄な業務の撲滅を。
                      </span>
                    </h1>
                    <div className="absolute -bottom-1 left-1/2 h-1 w-3/4 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-blue-700 to-blue-900"></div>
                  </div>
                  <div className="relative mt-2">
                    <h2 className="text-end text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">
                      <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                        ヒトの時間に余白を。
                      </span>
                    </h2>
                    <div className="absolute -bottom-1 right-0 h-1 w-3/4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
                  </div>
                </C_Stack>
              </motion.div>

              {/* 信念 */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: isVisible ? 1 : 0 }} transition={{ duration: 0.8, delay: 1.1 }}>
                <C_Stack className={`text-center ${fontSm} `}>
                  <p className="text-gray-700">をモットーとし、</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="rounded-lg bg-blue-900/10 px-2 py-1 text-sm font-semibold text-blue-900">
                      揺るぎない信念
                    </span>
                    <span className="rounded-lg bg-blue-900/10 px-2 py-1 text-sm font-semibold text-blue-900">確固たる意志</span>
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
                  <div className="rounded-lg bg-blue-900/5 p-3">
                    <div className="mb-1  text-gray-700">エンジニア・マネージャとしての開発経験。</div>
                    <div className="text-base font-bold text-blue-900 sm:text-lg">
                      エージェント実績280件超。
                      <div>
                        <small className="ml-2 text-xs text-gray-600">(ココナラ・ランサーズ)</small>
                      </div>
                    </div>
                  </div>

                  <R_Stack className="mt-3 justify-center gap-2  text-gray-700 sm:text-base">
                    <div className="w-fit rounded-lg bg-gradient-to-r from-blue-900/5 to-white p-2 shadow-sm">
                      <KM.CoolStrong>誰よりも「めんどくさがり」</KM.CoolStrong>
                      <span className="ml-1">だからこそ、</span>
                    </div>

                    <div className="w-fit rounded-lg bg-gradient-to-r from-amber-50 to-white p-2 shadow-sm">
                      <KM.WarmStrong>誰よりも使い手の利便性</KM.WarmStrong>
                      <span className="ml-1">にこだわり、</span>
                    </div>

                    <div>あなたの業務を改善します。</div>
                  </R_Stack>
                </C_Stack>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 1.5 }}
                className="mt-3"
              >
                <div className="rounded-xl bg-gradient-to-r from-blue-800 to-blue-950 p-4 text-white shadow-xl">
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
      <BackGroundImage {...{ url: bgUrl, alt: '改善マニア システム開発・業務改善のプロフェッショナル' }} />
      <Message />
    </header>
  )
}
