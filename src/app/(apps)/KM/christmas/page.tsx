import { ChristmasIntroduction } from '@app/(apps)/KM/components/christmas/ChristmasIntroduction'
import { ChristmasEasyProfile } from '@app/(apps)/KM/components/christmas/ChristmasEasyProfile'

import prisma from 'src/lib/prisma'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { Metadata } from 'next'

// SEO用のメタデータ生成 - クリスマス仕様
export async function generateMetadata(): Promise<Metadata> {
 const title = '改善マニア | クリスマス特別ページ 2024'
 const description =
  '改善マニアのクリスマス特別ページです。業務改善・システム開発の専門家として、スプレッドシートからWEBアプリまで、様々なツール開発で業務効率化を実現。年末年始も業務改善をサポートします。'
 const keywords = [
  'システム開発',
  '業務改善',
  'DX',
  'ITツール開発',
  'スプレッドシート',
  'WEBアプリ',
  'API連携',
  '自動化',
  '効率化',
  '改善マニア',
  'クリスマス',
  '年末',
 ]

 return {
  title,
  description,
  keywords: keywords.join(', '),
  openGraph: {
   title,
   description,
   type: 'website',
   locale: 'ja_JP',
   siteName: '改善マニア',
   images: [
    {
     url: '/image/KM/logo.png',
     width: 1200,
     height: 630,
     alt: '改善マニア クリスマス特別ページ 2024',
    },
   ],
  },
  twitter: {
   card: 'summary_large_image',
   title,
   description,
   images: ['/image/KM/logo.png'],
  },
  robots: {
   index: true,
   follow: true,
   googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
   },
  },
  alternates: {
   canonical: 'https://kaizen-mania.com/KM/christmas',
  },
  other: {
   'application-name': '改善マニア',
   'apple-mobile-web-app-title': '改善マニア',
   'apple-mobile-web-app-capable': 'yes',
   'apple-mobile-web-app-status-bar-style': 'default',
   'mobile-web-app-capable': 'yes',
   'msapplication-TileColor': '#DC2626',
   'theme-color': '#DC2626',
  },
 }
}

const KM_CHRISTMAS_PAGE = async () => {
 const { session, scopes } = await initServerComopnent({ query: {} })
 const kaizenClient = await prisma.kaizenClient.findMany({ where: { public: true }, orderBy: [{ id: 'asc' }] })
 const works = await prisma.kaizenWork.findMany({
  include: {
   KaizenClient: {},
   KaizenWorkImage: true,
  },
  orderBy: [{ sortOrder: 'asc' }, { date: 'desc' }],
 })

 // ヘッダーメニュー項目
 const menuItems = [
  { label: '改善マニアとは？', id: 'introduction' },
  { label: 'お仕事', id: 'mainActivity' },
  { label: '実績', id: 'works' },
  { label: 'お問い合わせ', id: 'contact' },
 ]

 // 構造化データ（JSON-LD）- クリスマス仕様
 const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '改善マニア',
  description: '業務改善・システム開発の専門家。スプレッドシートからWEBアプリまで、様々なツール開発で業務効率化を実現。',
  url: 'https://kaizen-mania.com/KM/christmas',
  logo: 'https://kaizen-mania.com/image/KM/logo.png',
  sameAs: [],
  contactPoint: {
   '@type': 'ContactPoint',
   contactType: 'customer service',
   availableLanguage: 'Japanese',
  },
  address: {
   '@type': 'PostalAddress',
   addressCountry: 'JP',
  },
  serviceArea: {
   '@type': 'Country',
   name: 'Japan',
  },
  hasOfferCatalog: {
   '@type': 'OfferCatalog',
   name: 'システム開発・業務改善サービス',
   itemListElement: [
    {
     '@type': 'Offer',
     itemOffered: {
      '@type': 'Service',
      name: 'システム開発',
      description: 'スプレッドシート、WEBアプリ、API連携など様々なシステム開発',
     },
    },
    {
     '@type': 'Offer',
     itemOffered: {
      '@type': 'Service',
      name: '業務改善コンサルティング',
      description: '無駄な業務の撲滅と業務効率化のサポート',
     },
    },
   ],
  },
 }

 return (
  <>
   {/* 構造化データ */}
   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

   <div className="min-h-screen">
    {/* クリスマステーマの背景 */}
    <div className="max-w-screen-2xl mx-auto bg-gradient-to-b from-red-50 via-white to-green-50 lg:p-8">
     <main role="main">
      <div>
       <ChristmasIntroduction />
      </div>
      <div className="mt-4 max-w-screen-2xl mx-auto rounded-2xl bg-gradient-to-br from-white via-red-50/30 to-green-50/30 p-1 lg:p-4 border border-red-100">
       <ChristmasEasyProfile {...{ kaizenClient, works }} />
      </div>
     </main>

     {/* クリスマス仕様フッター */}
     <footer
      className="bg-gradient-to-r from-red-800 via-green-800 to-red-800 py-12 text-white relative overflow-hidden"
      role="contentinfo"
     >
      {/* 装飾ライン */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
       <div className="text-center">
        <div className="mb-4">
         <h3 className="text-2xl font-bold">改善マニア</h3>
         <p className="mt-2 text-sm text-green-200">マイデスクから始める業務改善</p>
         <p className="mt-1 text-amber-300 text-lg font-semibold">🎄 Merry Christmas 🎄</p>
        </div>
        <div className="mb-6 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

        {/* SEO用の追加情報 */}
        <nav className="mb-6" aria-label="フッターナビゲーション">
         <div className="flex flex-wrap justify-center gap-6 text-sm">
          <a href="#introduction" className="text-green-200 hover:text-white transition-colors">
           改善マニアとは？
          </a>
          <a href="#mainActivity" className="text-green-200 hover:text-white transition-colors">
           サービス内容
          </a>
          <a href="#works" className="text-green-200 hover:text-white transition-colors">
           実績・事例
          </a>
          <a href="#contact" className="text-green-200 hover:text-white transition-colors">
           お問い合わせ
          </a>
         </div>
        </nav>

        <p className="text-sm text-green-200">© 2025 改善マニア. All rights reserved.</p>
       </div>
      </div>
     </footer>
    </div>
   </div>
  </>
 )
}

export default KM_CHRISTMAS_PAGE

