import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'スマート家計簿',
  description:
    '入力のしやすさを追求した家計簿アプリ。週予算・月予算管理、年間推移、収支可視化、ライフプランまで一元管理。改善マニアが開発したスマート家計簿のデモ画面をご覧いただけます。',
  keywords: ['家計簿', '予算管理', '収支可視化', 'ライフプラン', 'システム開発', '業務改善', '改善マニア', 'デモ'],
  openGraph: {
    title: 'スマート家計簿 | 改善マニア 業務システムデモ',
    description: '入力のしやすさを追求した家計簿アプリ。週予算・月予算管理、年間推移、収支可視化、ライフプランまで一元管理。',
    type: 'website',
    locale: 'ja_JP',
    siteName: '改善マニア',
    url: 'https://kaizen-mania.com/KM/mocks/kakeibo',
  },
  alternates: {
    canonical: 'https://kaizen-mania.com/KM/mocks/kakeibo',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
