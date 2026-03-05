import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '訪問歯科管理システム',
  description:
    '訪問歯科診療の患者管理・診療記録・スケジュール管理を統合。訪問先施設ごとの患者一覧やドキュメント管理を効率化。 改善マニアが開発した訪問歯科管理システムのデモ画面をご覧いただけます。',
  keywords: ['患者管理', '診療記録', '訪問スケジュール', 'ドキュメント管理', 'システム開発', '業務改善', '改善マニア', 'デモ'],
  openGraph: {
    title: '訪問歯科管理システム | 改善マニア 業務システムデモ',
    description: '訪問歯科診療の患者管理・診療記録・スケジュール管理を統合。訪問先施設ごとの患者一覧やドキュメント管理を効率化。',
    type: 'website',
    locale: 'ja_JP',
    siteName: '改善マニア',
    url: 'https://kaizen-mania.com/KM/mocks/dental',
  },
  alternates: {
    canonical: 'https://kaizen-mania.com/KM/mocks/dental',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
