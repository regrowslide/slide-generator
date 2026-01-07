'use client'

import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { motion, Variants } from 'framer-motion'
import {
 ChevronRight,
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const containerVariants: Variants = {
 hidden: { opacity: 0 },
 visible: {
  opacity: 1,
  transition: {
   staggerChildren: 0.1,
   delayChildren: 0.2,
  },
 },
}

const itemVariants: Variants = {
 hidden: { opacity: 0, y: 20 },
 visible: {
  opacity: 1,
  y: 0,
  transition: {
   duration: 0.6,
   ease: 'easeOut',
  },
 },
}

const fadeInUp: Variants = {
 hidden: { opacity: 0, y: 40 },
 visible: {
  opacity: 1,
  y: 0,
  transition: { duration: 0.8, ease: 'easeOut' },
 },
}

// セクションコンポーネント
const Section = ({
 children,
 className = '',
 id,
}: {
 children: React.ReactNode
 className?: string
 id?: string
}) => (
 <motion.section
  id={id}
  variants={fadeInUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: '-100px' }}
  className={`py-16 lg:py-24 ${className}`}
 >
  {children}
 </motion.section>
)

// 従来の開発プロセスの懸念セクション
const ConcernsSection = () => {
 const concerns = [
  {
   title: '実物が見えない不安',
   description: '要件定義書だけで話が進み、完成直前まで実物が確認できない。',
  },
  {
   title: '現場との乖離',
   description: '納品されたシステムが、現場の実際の業務フローと噛み合わない。',
  },
  {
   title: '追加費用の発生',
   description: '「仕様通りです」と言われ、使い勝手の改善に追加費用が発生する。',
  },
 ]

 return (
  <Section className="bg-gradient-to-b from-slate-50 to-white">
   <div className="mx-auto max-w-6xl px-4">
    <motion.div variants={itemVariants} className="mb-12 text-center">
     <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
      従来の開発プロセスにおける懸念
     </div>
     <h2 className="mb-4 text-2xl font-bold text-slate-800 lg:text-4xl">
      システム開発において、
      <br className="sm:hidden" />
      こんなリスクを感じたことはありませんか？
     </h2>
    </motion.div>

    <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-6 md:grid-cols-3">
     {concerns.map((concern, index) => (
      <motion.div
       key={index}
       variants={itemVariants}
       className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-amber-300 hover:shadow-lg"
      >
       <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-amber-100 to-transparent opacity-50 transition-transform duration-300 group-hover:scale-150" />
       <div className="relative z-10">
        <h3 className="mb-2 text-lg font-bold text-slate-800">{concern.title}</h3>
        <p className="text-slate-600">{concern.description}</p>
       </div>
      </motion.div>
     ))}
    </motion.div>

    <motion.div variants={itemVariants} className="mt-10 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-6 text-center lg:p-8">
     <p className="text-lg text-slate-700">
      これらは、開発プロセスが
      <span className="mx-1 font-bold text-slate-900">ブラックボックス化</span>
      していることに起因します。
     </p>
     <p className="mt-3 text-xl font-bold text-blue-800">
      私たちはこの不確実性を排除するため、
      <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">「デモ先行開発」</span>
      という手法を標準採用しています。
     </p>
    </motion.div>
   </div>
  </Section>
 )
}

// 契約前に正解を可視化するセクション
const VisualizationSection = () => {
 const qualities = [
  {
   title: '操作性',
   description: '直感的に扱えるUIか？ 入力にストレスはないか？',
   color: 'blue',
  },
  {
   title: '実効性',
   description: '貴社のボトルネックは、具体的にどう解消されるか？',
   color: 'emerald',
  },
  {
   title: '定着性',
   description: 'ITリテラシーに関わらず、現場の誰もが使いこなせるか？',
   color: 'amber',
  },
 ]

 const colorClasses = {
  blue: {
   bg: 'bg-blue-100',
   text: 'text-blue-600',
   border: 'border-blue-200',
   hoverBorder: 'hover:border-blue-400',
  },
  emerald: {
   bg: 'bg-emerald-100',
   text: 'text-emerald-600',
   border: 'border-emerald-200',
   hoverBorder: 'hover:border-emerald-400',
  },
  amber: {
   bg: 'bg-amber-100',
   text: 'text-amber-600',
   border: 'border-amber-200',
   hoverBorder: 'hover:border-amber-400',
  },
 }

 return (
  <Section className="bg-white">
   <div className="mx-auto max-w-6xl px-4">
    <motion.div variants={itemVariants} className="mb-12 text-center">
     <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
      <span className="text-xl font-bold">1</span>
     </div>
     <h2 className="mb-4 text-2xl font-bold text-slate-800 lg:text-4xl">
      契約前に「正解」を可視化する
     </h2>
     <p className="mx-auto max-w-3xl text-lg text-slate-600">
      従来の「要件定義 → 契約 → 開発」という順序を見直しました。
      <br />
      私たちは、ご契約いただく
      <span className="mx-1 font-bold text-blue-700">前</span>
      に、構想したシステムの挙動がわかる
      <span className="mx-1 font-bold text-blue-700">「デモ」</span>
      を作成します。
     </p>
    </motion.div>

    {/* デモで検証する3つの品質 */}
    <motion.div variants={itemVariants} className="mb-8">
     <div className="mb-8 text-center">
      <h3 className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-lg font-bold text-blue-800">
       デモで検証する3つの品質
      </h3>
      <p className="mt-4 text-slate-600">
       表面的な画面イメージではなく、
       <span className="font-bold text-slate-800">「実際の業務の流れ」</span>
       をシミュレーション可能なレベルで可視化します。
      </p>
     </div>

     <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid gap-6 md:grid-cols-3"
     >
      {qualities.map((quality, index) => {
       const colors = colorClasses[quality.color as keyof typeof colorClasses]
       return (
        <motion.div
         key={index}
         variants={itemVariants}
         className={`rounded-2xl border ${colors.border} bg-white p-6 shadow-sm transition-all duration-300 ${colors.hoverBorder} hover:shadow-lg`}
        >
         <h4 className="mb-2 text-xl font-bold text-slate-800">{quality.title}</h4>
         <p className="text-slate-600">{quality.description}</p>
        </motion.div>
       )
      })}
     </motion.div>
    </motion.div>

    {/* 注文住宅の例え */}
    <motion.div
     variants={itemVariants}
     className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-8 text-white lg:p-10"
    >
     <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
     <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
     <div className="relative z-10">
      <div className="mb-6">
       <span className="text-xl font-bold">たとえるなら...</span>
      </div>
      <p className="text-lg leading-relaxed text-slate-200">
       注文住宅を建てる際、
       <span className="text-white font-semibold">図面だけで契約する人はいません。</span>
       <br />
       必ずモデルハウスを確認するはずです。
      </p>
      <p className="mt-4 text-xl font-bold text-amber-300">
       システム開発においても、
       <br className="sm:hidden" />
       「実際に動くもの」を確認してから契約する安心をご提供します。
      </p>
     </div>
    </motion.div>
   </div>
  </Section>
 )
}

// なぜ高品質なデモを提供できるのかセクション
const TechnologySection = () => {
 const benefits = [
  {
   text: '高速で構築できるため、コストを転嫁する必要がない。',
  },
  {
   text: '修正コストが低いため、納得いくまでブラッシュアップできる。',
  },
 ]

 return (
  <Section className="bg-gradient-to-b from-white to-blue-50">
   <div className="mx-auto max-w-6xl px-4">
    <motion.div variants={itemVariants} className="mb-12 text-center">
     <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
      <span className="text-xl font-bold">2</span>
     </div>
     <h2 className="mb-4 text-2xl font-bold text-slate-800 lg:text-4xl">
      なぜ、契約前に
      <br className="sm:hidden" />
      高品質なデモを提供できるのか？
     </h2>
     <p className="mx-auto max-w-3xl text-lg text-slate-600">
      通常、プロトタイプの作成には多大なコストがかかります。
      <br />
      私たちがこれを無償で提供できる背景には、
      <span className="font-bold text-emerald-700">明確な技術的根拠</span>
      があります。
     </p>
    </motion.div>

    <motion.div
     variants={itemVariants}
     className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-8 shadow-xl lg:p-12"
    >
     <div className="absolute right-0 top-0 h-64 w-64 -translate-y-32 translate-x-32 rounded-full bg-gradient-to-br from-emerald-100 to-transparent opacity-60" />
     <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-24 translate-y-24 rounded-full bg-gradient-to-tr from-blue-100 to-transparent opacity-60" />

     <div className="relative z-10">
      {/* 秘密の見出し */}
      <div className="mb-8 text-center">
       <div className="inline-flex items-center gap-3 rounded-full border border-emerald-300 bg-emerald-100 px-6 py-3">
        <span className="text-lg font-bold text-emerald-800">
         秘密は「独自開発のプロトタイピングエンジン」
        </span>
       </div>
      </div>

      {/* 説明 */}
      <div className="mb-8 text-center">
       <p className="text-lg text-slate-700">
        私たちは、デモ開発に特化した
        <span className="mx-1 font-bold text-emerald-700">独自のコード生成技術・共通基盤</span>
        を保有しています。
       </p>
       <p className="mt-2 text-lg text-slate-700">
        他社が数週間かけて手作業で構築するプロトタイプを、
        <br className="hidden lg:inline" />
        弊社は自動化技術により
        <span className="mx-1 font-bold text-emerald-700">圧倒的な短時間</span>
        で構築可能です。
       </p>
      </div>

      {/* メリット */}
      <div className="mx-auto max-w-2xl space-y-4">
       {benefits.map((benefit, index) => (
        <motion.div
         key={index}
         variants={itemVariants}
         className="rounded-xl bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md"
        >
         <p className="text-lg font-medium text-slate-700">{benefit.text}</p>
        </motion.div>
       ))}
      </div>

      {/* 結論 */}
      <div className="mt-8 text-center">
       <p className="text-lg text-slate-700">
        これは安売りではなく、
        <span className="mx-1 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text font-bold text-transparent">
         高度な技術力による「工程のショートカット」
        </span>
        です。
       </p>
      </div>

      {/* 無償の明記 */}
      <motion.div
       variants={itemVariants}
       className="mt-8 rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-blue-50 p-6 shadow-lg lg:p-8"
      >
       <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-5 py-2 text-sm font-bold text-emerald-700">
         安心してお任せいただけるように
        </div>
        <p className="mb-2 text-xl font-bold text-slate-800 lg:text-2xl">
         <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
          デモ開発・お見積りまで無償
         </span>
        </p>
        <p className="text-lg text-slate-700">
         ご発注確定まで
         <span className="mx-1 font-bold text-slate-900">費用は一切発生しません</span>
        </p>
       </div>
      </motion.div>
     </div>
    </motion.div>
   </div>
  </Section>
 )
}

// 壁打ちからご相談くださいセクション
const ConsultationSection = () => {
 const painPoints = [
  'Excel/スプレッドシート管理に限界を感じている',
  '既存システムが複雑すぎて形骸化している',
  '自動化したいが、着手順序がわからない',
 ]

 return (
  <Section className="bg-gradient-to-b from-blue-50 to-white">
   <div className="mx-auto max-w-6xl px-4">
    <motion.div variants={itemVariants} className="mb-12 text-center">
     <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
      <span className="text-xl font-bold">3</span>
     </div>
     <h2 className="mb-4 text-2xl font-bold text-slate-800 lg:text-4xl">
      まずは「壁打ち」から
      <br className="sm:hidden" />
      ご相談ください
     </h2>
     <p className="mx-auto max-w-3xl text-lg text-slate-600">
      仕様書は不要です。
      <br />
      「今の業務のここが辛い」「もっとこうなればいいのに」
      <br className="hidden sm:inline" />
      という現場の生の声をそのままお聞かせください。
     </p>
    </motion.div>

    {/* 痛みポイントリスト */}
    <motion.div variants={itemVariants} className="mb-10">
     <div className="mx-auto max-w-2xl space-y-3">
      {painPoints.map((point, index) => (
       <motion.div
        key={index}
        variants={itemVariants}
        className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-amber-300 hover:shadow-md"
       >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
         <ChevronRight className="h-5 w-5 text-amber-600" />
        </div>
        <p className="text-lg text-slate-700">{point}</p>
       </motion.div>
      ))}
     </div>
    </motion.div>

    {/* 結論メッセージ */}
    <motion.div
     variants={itemVariants}
     className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 p-8 text-center text-white lg:p-12"
    >
     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
     <div className="relative z-10">
      <p className="mb-4 text-xl text-slate-200">
       そのお悩みに対し、私たちは難解な専門用語ではなく、
      </p>
      <p className="text-2xl font-bold text-white lg:text-3xl">
       解決策が見える
       <span className="mx-2 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
        「デモ」
       </span>
       で回答します。
      </p>
      <p className="mt-6 text-lg text-slate-300">
       まずは壁打ち相手として、お気軽にお声がけください。
      </p>

      {/* 無償の明記 */}
      <div className="mt-8 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
       <div className="text-center">
        <p className="text-base font-bold text-white lg:text-lg">
         <span className="text-amber-300">デモ開発・お見積りまで無償</span>
         <span className="mx-2 text-slate-300">|</span>
         <span>ご発注確定まで費用は一切発生しません</span>
        </p>
       </div>
      </div>
     </div>
    </motion.div>
   </div>
  </Section>
 )
}

// フッターセクション
const FooterSection = () => {
 return (
  <Section className="bg-white pb-8 pt-12">
   <div className="mx-auto max-w-4xl px-4 text-center">
    <motion.div
     variants={itemVariants}
     className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-lg lg:p-12"
    >
     <R_Stack className="justify-center gap-4 mb-6">
      <Image
       src="/image/KM/logo.png"
       alt="改善マニア"
       width={80}
       height={80}
       className="rounded-full shadow-lg"
      />
     </R_Stack>
     <h3 className="mb-2 text-2xl font-bold text-slate-800 lg:text-3xl">合同会社改善マニア</h3>
     <p className="mb-6 text-lg text-slate-600">業務改善・システム開発のスペシャリスト集団</p>

     {/* 信頼のバッジ */}
     <div className="flex flex-wrap justify-center gap-4">
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
       誠実な対応
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
       信頼の実績
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
       高速開発
      </div>
     </div>

     {/* お問い合わせボタン */}
     <div className="mt-8">
      <a
       href="/KM/contact"
       className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-900 hover:shadow-xl"
      >
       お問い合わせはこちら
      </a>
     </div>
    </motion.div>
   </div>
  </Section>
 )
}

// メインコンポーネント
export const DemoDrivenDevelopment = () => {
 const [isVisible, setIsVisible] = useState(false)

 useEffect(() => {
  setIsVisible(true)
 }, [])

 return (
  <div className="min-h-screen bg-white">
   {/* ヒーローセクション */}
   <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20 lg:py-32">
    {/* 装飾パターン */}
    <div className="absolute inset-0 opacity-10">
     <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-500 blur-3xl" />
     <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-amber-500 blur-3xl" />
    </div>

    {/* グリッドパターン */}
    <div
     className="absolute inset-0 opacity-5"
     style={{
      backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
      backgroundSize: '50px 50px',
     }}
    />

    <motion.div
     variants={containerVariants}
     initial="hidden"
     animate={isVisible ? 'visible' : 'hidden'}
     className="relative z-10 mx-auto max-w-5xl px-4 text-center"
    >
     <motion.div variants={itemVariants} className="mb-6">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white/90 backdrop-blur-sm">
       システム開発の新しいカタチ
      </div>
     </motion.div>

     <motion.h1
      variants={itemVariants}
      className="mb-6 text-4xl font-black tracking-tight text-white lg:text-6xl"
     >
      <span className="block">デモ先行開発</span>
      <span className="mt-2 block bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 bg-clip-text text-2xl font-bold text-transparent lg:text-4xl">
       Demo-Driven Development
      </span>
     </motion.h1>

     <motion.p variants={itemVariants} className="mx-auto max-w-3xl text-lg text-slate-300 lg:text-xl">
      契約前に「動くデモ」をお見せします。
      <br />
      <span className="text-white font-semibold">
       要件定義書だけでは伝わらないシステムの「使い勝手」を、
      </span>
      <br />
      実際に触って確認してから、安心してご契約いただけます。
     </motion.p>

     {/* 信頼のメッセージ */}
     <motion.div variants={itemVariants} className="mt-10">
      <div className="inline-flex flex-wrap justify-center gap-6 text-sm text-slate-400">
       <span>誠実な対応</span>
       <span>信頼第一</span>
       <span>透明性の確保</span>
      </div>
     </motion.div>

     {/* 無償の明記 */}
     <motion.div
      variants={itemVariants}
      className="mt-8 mx-auto max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
     >
      <div className="text-center">
       <p className="mb-2 text-lg font-bold text-white lg:text-xl">
        デモ開発・お見積りまで
        <span className="mx-1 text-amber-300">無償</span>
       </p>
       <p className="text-sm text-slate-300 lg:text-base">
        ご発注確定まで費用は一切発生しません
       </p>
      </div>
     </motion.div>
    </motion.div>

    {/* スクロールインジケーター */}
    <motion.div
     initial={{ opacity: 0 }}
     animate={{ opacity: isVisible ? 1 : 0 }}
     transition={{ duration: 0.8, delay: 1.5 }}
     className="absolute bottom-8 left-1/2 -translate-x-1/2"
    >
     <motion.div
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="flex flex-col items-center gap-2 text-white/60"
     >
      <span className="text-xs tracking-wider">SCROLL</span>
      <div className="flex h-8 w-5 items-start justify-center rounded-full border border-white/30 p-1">
       <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="h-1.5 w-1 rounded-full bg-white/60"
       />
      </div>
     </motion.div>
    </motion.div>
   </header>

   {/* メインコンテンツ */}
   <main>
    <ConcernsSection />
    <VisualizationSection />
    <TechnologySection />
    <ConsultationSection />
    <FooterSection />
   </main>
  </div>
 )
}

