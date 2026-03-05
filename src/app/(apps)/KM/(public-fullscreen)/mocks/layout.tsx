import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: '業務システムデモ一覧 | 改善マニア',
    template: '%s | 改善マニア 業務システムデモ',
  },
  description:
    '改善マニアが開発した業務システムのデモ画面コレクション。美容クリニック管理、生産管理、訪問歯科、月次レポート、原価計算、営業管理など、多業種の実績をご覧いただけます。',
  keywords: [
    '業務システム',
    'デモ',
    'システム開発',
    '業務改善',
    '改善マニア',
    'クリニック管理',
    '生産管理',
    '歯科管理',
    '営業管理',
    '原価計算',
  ],
  openGraph: {
    title: '業務システムデモ一覧 | 改善マニア',
    description: '改善マニアが開発した業務システムのデモ画面コレクション。多業種の実績をご覧いただけます。',
    type: 'website',
    locale: 'ja_JP',
    siteName: '改善マニア',
    url: 'https://kaizen-mania.com/KM/mocks',
  },
  twitter: {
    card: 'summary_large_image',
    title: '業務システムデモ一覧 | 改善マニア',
    description: '改善マニアが開発した業務システムのデモ画面コレクション。',
  },
  alternates: {
    canonical: 'https://kaizen-mania.com/KM/mocks',
  },
}

export default function MocksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
