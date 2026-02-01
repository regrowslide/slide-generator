import { EnhancedIntroduction } from '@app/(apps)/KM/components/enhanced/EnhancedIntroduction'
import { EnhancedEasyProfile } from '@app/(apps)/KM/components/enhanced/EnhancedEasyProfile'

import prisma from 'src/lib/prisma'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { Metadata } from 'next'

// SEO用のメタデータ生成
export async function generateMetadata(): Promise<Metadata> {
  const title = '改善マニア | システム開発・業務改善のプロフェッショナル'
  const description =
    '改善マニアは業務改善・システム開発の専門家です。スプレッドシートからWEBアプリまで、様々なツール開発で業務効率化を実現。業界・職種を問わず、無駄な業務の撲滅をサポートします。'
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
          alt: '改善マニア - システム開発・業務改善のプロフェッショナル',
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
      canonical: 'https://kaizen-mania.com/KM/enhanced',
    },
    other: {
      'application-name': '改善マニア',
      'apple-mobile-web-app-title': '改善マニア',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'mobile-web-app-capable': 'yes',
      'msapplication-TileColor': '#1e40af',
      'theme-color': '#1e40af',
    },
  }
}

const KM_ENHANCED_PAGE = async () => {
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

  // 構造化データ（JSON-LD）
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '改善マニア',
    description: '業務改善・システム開発の専門家。スプレッドシートからWEBアプリまで、様々なツール開発で業務効率化を実現。',
    url: 'https://kaizen-mania.com/KM/enhanced',
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
        {/* <EnhancedHeader menuItems={menuItems} /> */}

        <div className={`max-w-screen-2xl mx-auto  lg:p-8`}>
          <main role="main">
            <div>
              <EnhancedIntroduction />
            </div>
            <div className=" mt-4 max-w-screen-2xl mx-auto rounded-2xl bg-gray-50 p-1 lg:p-4">
              <EnhancedEasyProfile {...{ kaizenClient, works }} />
            </div>
          </main>

          {/* SEO最適化されたフッター */}
          <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 py-12 text-white" role="contentinfo">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold">改善マニア</h3>
                  <p className="mt-2 text-sm text-gray-400">マイデスクから始める業務改善</p>
                </div>
                <div className="mb-6 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

                {/* SEO用の追加情報 */}
                <nav className="mb-6" aria-label="フッターナビゲーション">
                  <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <a href="#introduction" className="text-gray-300 hover:text-white transition-colors">
                      改善マニアとは？
                    </a>
                    <a href="#mainActivity" className="text-gray-300 hover:text-white transition-colors">
                      サービス内容
                    </a>
                    <a href="#works" className="text-gray-300 hover:text-white transition-colors">
                      実績・事例
                    </a>
                    <a href="#contact" className="text-gray-300 hover:text-white transition-colors">
                      お問い合わせ
                    </a>
                  </div>
                </nav>

                <p className="text-sm text-gray-400">© 2025 改善マニア. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}

export default KM_ENHANCED_PAGE
