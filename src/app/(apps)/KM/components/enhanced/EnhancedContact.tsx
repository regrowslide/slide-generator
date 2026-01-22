'use client'

import { useState } from 'react'
import useWindowSize from '@cm/hooks/useWindowSize'
import { MyContainer, R_Stack } from '@cm/components/styles/common-components/common-components'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { X } from 'lucide-react'
import { DemoDrivenDevelopment } from '@app/(apps)/KM/components/DemoDrivenDevelopment'

export const EnhancedContact = () => {
  const { width } = useWindowSize()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const benefits = [
    { title: '相談無料', description: 'まずは気軽にご相談ください' },
    { title: '半日以内に返信', description: '迅速な対応を心がけています' },
    { title: '要件が曖昧でもOK', description: '一緒に整理していきます' },
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
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="rounded-xl bg-gradient-to-br from-blue-900/5 to-white p-4 text-center shadow-md transition-all hover:shadow-xl"
                >
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
              <div className="h-full rounded-2xl bg-white shadow-2xl p-6 lg:p-8">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">ご相談について</h3>
                </div>

                {/* 導入文 */}
                <div className="mb-8">
                  <p className="mb-4 text-base leading-relaxed text-gray-700">
                    業務の自動化、システム開発、業務改善に関するご相談は、以下のフォームよりお送りください。
                    <br />
                    「漠然とした悩み」から「具体的なツールの開発」まで、幅広く承ります。
                  </p>
                  <div className="rounded-xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
                    <p className="text-sm font-semibold text-blue-900">
                      ご相談からヒアリング、解決策のご提案（お見積り）までは、原則無償で対応させていただきます。
                    </p>
                  </div>

                  {/* デモ先行開発の紹介 */}
                  <div className="mt-4">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="group w-full rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-left transition-all duration-300 hover:border-amber-300 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-sm font-bold text-amber-900">デモ先行開発</span>
                          </div>
                          <p className="text-xs leading-relaxed text-gray-700">
                            契約前に「動くデモ」をお見せします。要件定義書だけでは伝わらないシステムの「使い勝手」を、実際に触って確認してから安心してご契約いただけます。
                          </p>
                        </div>
                        <span className="ml-2 flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-300 to-orange-200 shadow-lg text-amber-900 font-bold text-sm  group-hover:scale-105 group-hover:underline group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-orange-300 cursor-pointer">
                          <span className="drop-shadow-[0_1px_0_rgba(255,255,255,0.6)] tracking-wide">詳細はこちら</span>
                          <svg
                            className="w-5 h-5 inline-block text-amber-700 group-hover:text-amber-900 transition-colors drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3つの信念 */}
                <div className="space-y-6">
                  <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        <span className="text-sm font-bold">1</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-2 text-base font-bold text-gray-900">
                          「改善」のハードルを下げるために
                        </h4>
                        <p className="text-sm leading-relaxed text-gray-700">
                          「どういう仕組みが自社にフィットするのか」が最初から明確な事業主様は多くありません。
                          私自身の活動も、デスクワークにおける小さな「不便」の解消から始まりました。
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-gray-700">
                          DXやシステム開発は大企業だけのものではありません。ITの専門部署がなくても、「こういう作業が手間だ」「もっと楽にできないか」という漠然とした声を拾い上げ、形にすることこそが私の役割です。
                          <span className="font-semibold text-blue-900">
                            まずはリスクなく最初の一歩を踏み出していただくために、相談の入り口を無償としています。
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <span className="text-sm font-bold">2</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-2 text-base font-bold text-gray-900">
                          納得と信頼の上でプロジェクトを進めるために
                        </h4>
                        <p className="text-sm leading-relaxed text-gray-700">
                          お話をお伺いした結果、技術的・費用的に「実現困難」と判断せざるを得ないケースもございます。
                          いきなり契約をするのではなく、しっかりとしたヒアリングを経て、私からの提案内容と費用感に十分ご納得いただけた場合にのみ、本契約へと進ませていただきます。
                          <span className="font-semibold text-emerald-900">
                            これが、お互いにとって最も誠実な進め方だと考えています。
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <span className="text-sm font-bold">3</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-2 text-base font-bold text-gray-900">
                          共に最適解を創るパートナーとして
                        </h4>
                        <p className="text-sm leading-relaxed text-gray-700">
                          無償でのご相談は、私にとっても新しい課題やアイデアに触れられる貴重な機会です。
                          単なる「発注者と受注者」という関係を超え、課題解決の喜びを共有できるパートナーでありたいと考えています。
                          <span className="font-semibold text-amber-900">
                            「こんなことを聞いても良いのだろうか」と躊躇せず、壁打ち相手としてお気軽にお声がけください。
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* フォームへの案内 */}
                <div className="mt-8 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="mb-1 text-base font-bold text-blue-900">お問い合わせフォーム</h4>
                      <p className="text-sm text-blue-800">以下のフォームよりお気軽にご相談ください</p>
                    </div>
                  </div>
                </div>
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

      {/* デモ先行開発モーダル */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            {/* オーバーレイ */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* モーダルコンテンツ */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 h-[90vh] w-full max-w-7xl overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ヘッダー */}
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900">デモ先行開発について</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* コンテンツ */}
              <div className="h-[calc(90vh-73px)] overflow-y-auto">
                <DemoDrivenDevelopment />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MyContainer>
  )
}
