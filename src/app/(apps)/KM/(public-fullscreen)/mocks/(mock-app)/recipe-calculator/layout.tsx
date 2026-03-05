import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI食品原価計算システム',
  description:
    'AIでレシピ画像や手書きメモから食材を自動認識し、原価を瞬時に算出。食材マスタと粗利基準の管理で収益性を可視化。 改善マニアが開発したAI食品原価計算システムのデモ画面をご覧いただけます。',
  keywords: ['AI原価解析', '食材マスタ', '粗利基準管理', '自動原価算出', 'システム開発', '業務改善', '改善マニア', 'デモ'],
  openGraph: {
    title: 'AI食品原価計算システム | 改善マニア 業務システムデモ',
    description: 'AIでレシピ画像や手書きメモから食材を自動認識し、原価を瞬時に算出。食材マスタと粗利基準の管理で収益性を可視化。',
    type: 'website',
    locale: 'ja_JP',
    siteName: '改善マニア',
    url: 'https://kaizen-mania.com/KM/mocks/recipe-calculator',
  },
  alternates: {
    canonical: 'https://kaizen-mania.com/KM/mocks/recipe-calculator',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
