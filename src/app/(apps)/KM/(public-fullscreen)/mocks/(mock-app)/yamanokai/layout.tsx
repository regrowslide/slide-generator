import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '山の会管理システム',
  description:
    '登山サークルの会員管理・イベント計画・活動記録を一元管理。参加申込や会費管理もオンラインで完結。 改善マニアが開発した山の会管理システムのデモ画面をご覧いただけます。',
  keywords: ['会員管理', 'イベント管理', '活動記録', '会費管理', 'システム開発', '業務改善', '改善マニア', 'デモ'],
  openGraph: {
    title: '山の会管理システム | 改善マニア 業務システムデモ',
    description: '登山サークルの会員管理・イベント計画・活動記録を一元管理。参加申込や会費管理もオンラインで完結。',
    type: 'website',
    locale: 'ja_JP',
    siteName: '改善マニア',
    url: 'https://kaizen-mania.com/KM/mocks/yamanokai',
  },
  alternates: {
    canonical: 'https://kaizen-mania.com/KM/mocks/yamanokai',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
