'use client'

import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import SlateEditor from '@cm/components/SlateEditor/SlateEditor'
import useWindowSize from '@cm/hooks/useWindowSize'
import { MyContainer, R_Stack } from '@cm/components/styles/common-components/common-components'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Mail, Clock, MessageSquare, CheckCircle } from 'lucide-react'

export const EnhancedContact = () => {
  const { width } = useWindowSize()
  const { data: kaizenCMS } = useDoStandardPrisma('kaizenCMS', 'findFirst', { orderBy: [{ id: 'desc' }] }, { deps: [] })

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  if (!kaizenCMS) return <></>

  const benefits = [
    { icon: MessageSquare, title: '相談無料', description: 'まずは気軽にご相談ください' },
    { icon: Clock, title: '半日以内に返信', description: '迅速な対応を心がけています' },
    { icon: CheckCircle, title: '要件が曖昧でもOK', description: '一緒に整理していきます' },
  ]

  const wrapperClas = ' w-screen-lg max-w-[90vw]'
  return (
    <MyContainer className={`p-2   mx-auto ${wrapperClas}`}>
      <div ref={ref} className="py-4">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center"
        >
          <div className="mb-3 inline-block rounded-full bg-blue-900/10 px-3 py-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-900">Contact</span>
          </div>
          <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">お問い合わせ</h2>
          <p className="mx-auto max-w-2xl text-sm text-gray-600 sm:text-base">
            まずは気軽にご相談ください。あなたの業務改善をサポートします。
          </p>
        </motion.div>

        {/* メリット表示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="rounded-xl bg-gradient-to-br from-blue-900/5 to-white p-4 text-center shadow-md transition-all hover:shadow-xl"
                >
                  <div className="mb-2 flex justify-center">
                    <div className="rounded-full bg-blue-900/10 p-2">
                      <Icon className="h-5 w-5 text-blue-900" />
                    </div>
                  </div>
                  <h3 className="mb-1 text-base font-bold text-gray-900">{benefit.title}</h3>
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
              <div className="h-full rounded-2xl bg-white shadow-2xl p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-900" />
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
              <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">

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

        {/* フッターメッセージ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 text-center"
        >
          <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-blue-800 to-blue-950 p-4 text-white shadow-xl sm:p-5">
            <h3 className="mb-2 text-xl font-bold">お気軽にお問い合わせください</h3>
            <p className="text-base text-blue-100">あなたの業務改善を全力でサポートいたします</p>
          </div>
        </motion.div>
      </div>
    </MyContainer>
  )
}
