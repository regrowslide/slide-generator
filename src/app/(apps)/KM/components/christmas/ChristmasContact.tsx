'use client'

import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import SlateEditor from '@cm/components/SlateEditor/SlateEditor'
import useWindowSize from '@cm/hooks/useWindowSize'
import { MyContainer, R_Stack } from '@cm/components/styles/common-components/common-components'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Clock, MessageSquare, CheckCircle, Gift, Star, Snowflake, TreePine } from 'lucide-react'

export const ChristmasContact = () => {
  const { width } = useWindowSize()
  const { data: kaizenCMS } = useDoStandardPrisma('kaizenCMS', 'findFirst', { orderBy: [{ id: 'desc' }] }, { deps: [] })

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  if (!kaizenCMS) return <></>

  const benefits = [
    { icon: MessageSquare, title: '相談無料', description: 'まずは気軽にご相談ください', color: 'red' },
    { icon: Clock, title: '半日以内に返信', description: '迅速な対応を心がけています', color: 'green' },
    { icon: CheckCircle, title: '要件が曖昧でもOK', description: '一緒に整理していきます', color: 'red' },
  ]

  const wrapperClas = ' w-screen-lg max-w-[90vw]'
  return (
    <MyContainer className={`p-2 mx-auto ${wrapperClas}`}>
      <div ref={ref} className="py-4">
        {/* ヘッダー - クリスマステーマ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-100 to-green-100 px-4 py-2 border border-red-200">
            <Gift className="h-4 w-4 text-red-600" />
            <span className="text-xs font-semibold uppercase tracking-wide text-red-700">Contact</span>
            <Star className="h-4 w-4 text-amber-500" />
          </div>
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl lg:text-4xl">
            <span className="bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">
              お問い合わせ
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-gray-600 sm:text-base">
            まずは気軽にご相談ください。あなたの業務改善をサポートします。
          </p>
        </motion.div>

        {/* メリット表示 - クリスマスカラー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              const isRed = benefit.color === 'red'
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className={`rounded-xl p-4 text-center shadow-md transition-all hover:shadow-xl border-2 relative overflow-hidden ${
                    isRed
                      ? 'bg-gradient-to-br from-red-50 to-white border-red-200'
                      : 'bg-gradient-to-br from-green-50 to-white border-green-200'
                  }`}
                >
                  {/* 装飾 */}
                  <div className="absolute top-1 right-1 opacity-30">
                    <Snowflake size={16} className={isRed ? 'text-red-300' : 'text-green-300'} />
                  </div>

                  <div className="mb-2 flex justify-center">
                    <div className={`rounded-full p-2 ${isRed ? 'bg-red-100' : 'bg-green-100'}`}>
                      <Icon className={`h-5 w-5 ${isRed ? 'text-red-600' : 'text-green-600'}`} />
                    </div>
                  </div>
                  <h3 className={`mb-1 text-base font-bold ${isRed ? 'text-red-700' : 'text-green-700'}`}>
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-gray-600">{benefit.description}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* コンテンツエリア */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <R_Stack className="items-stretch gap-0 gap-y-12">
            {/* 左側: メッセージ */}
            <div className="w-full xl:w-1/2 xl:p-4">
              <div className="h-full rounded-2xl bg-gradient-to-br from-red-50 via-white to-green-50 p-4 shadow-lg sm:p-5 border-2 border-red-100">
                <div className="mb-3 flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">ご相談内容</h3>
                </div>
                <SlateEditor
                  {...{
                    initialValue: JSON.parse(kaizenCMS?.contactPageMsg ?? ''),
                    readOnly: true,
                  }}
                />
              </div>
            </div>

            {/* 右側: フォーム */}
            <div className="w-full xl:w-1/2 xl:p-4">
              <div className="overflow-hidden rounded-2xl bg-white shadow-2xl border-2 border-green-100">
                {/* フォームヘッダー - クリスマスグラデーション */}
                <div className="bg-gradient-to-r from-red-700 via-green-700 to-red-700 p-3 text-center relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300"></div>
                  <div className="flex items-center justify-center gap-2">
                    <Star className="h-5 w-5 text-amber-300" />
                    <h3 className="text-lg font-bold text-white">お問い合わせフォーム</h3>
                    <Star className="h-5 w-5 text-amber-300" />
                  </div>
                </div>
                <iframe
                  src="https://docs.google.com/forms/d/e/1FAIpQLSejumStkkME2f5sdC1dtBO1nbq0mntWxcfxuZvjTyD2NPPUeA/viewform?embedded=true"
                  style={{
                    margin: 'auto',
                    height: 2000,
                    width: Math.min(600, width),
                    maxWidth: '100%',
                    border: 'none',
                  }}
                  title="お問い合わせフォーム"
                >
                  読み込んでいます…
                </iframe>
              </div>
            </div>
          </R_Stack>
        </motion.div>

        {/* フッターメッセージ - クリスマステーマ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 text-center"
        >
          <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-red-700 via-green-700 to-red-700 p-4 text-white shadow-xl sm:p-5 relative overflow-hidden">
            {/* 装飾ライン */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300"></div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="h-6 w-6 text-amber-300" />
              <h3 className="text-xl font-bold">お気軽にお問い合わせください</h3>
              <Gift className="h-6 w-6 text-amber-300" />
            </div>
            <p className="text-base text-green-100">
              あなたの業務改善を全力でサポートいたします
            </p>
          </div>
        </motion.div>
      </div>
    </MyContainer>
  )
}

