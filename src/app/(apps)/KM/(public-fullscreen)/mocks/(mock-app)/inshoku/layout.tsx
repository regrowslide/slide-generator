import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '飲食店管理システム',
  description:
    '飲食店の売上管理・在庫管理・メニュー管理を一元化。日次売上レポートやシフト管理で店舗運営を効率化。 改善マニアが開発した飲食店管理システムのデモ画面をご覧いただけます。',
  keywords: ['売上管理', '在庫管理', 'メニュー管理', 'シフト管理', 'システム開発', '業務改善', '改善マニア', 'デモ'],
  openGraph: {
    title: '飲食店管理システム | 改善マニア 業務システムデモ',
    description: '飲食店の売上管理・在庫管理・メニュー管理を一元化。日次売上レポートやシフト管理で店舗運営を効率化。',
    type: 'website',
    locale: 'ja_JP',
    siteName: '改善マニア',
    url: 'https://kaizen-mania.com/KM/mocks/inshoku',
  },
  alternates: {
    canonical: 'https://kaizen-mania.com/KM/mocks/inshoku',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
