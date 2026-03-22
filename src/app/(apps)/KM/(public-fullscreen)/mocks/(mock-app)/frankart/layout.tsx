import type { Metadata } from 'next'
import FrankartShell from './components/FrankartShell'

export const metadata: Metadata = {
  title: 'Frankart 案件統合管理',
  description:
    '案件を基軸とした営業管理システム。案件専用ルームでチャット・ToDo・見積・ファイルを一元管理。改善マニアが開発した案件統合管理のデモ画面をご覧いただけます。',
  keywords: ['案件管理', '営業管理', 'CRM', '見積管理', 'システム開発', '業務改善', '改善マニア', 'デモ'],
  openGraph: {
    title: 'Frankart 案件統合管理 | 改善マニア 業務システムデモ',
    description:
      '案件を基軸とした営業管理システム。案件専用ルームでチャット・ToDo・見積・ファイルを一元管理。',
    type: 'website',
    locale: 'ja_JP',
    siteName: '改善マニア',
    url: 'https://kaizen-mania.com/KM/mocks/frankart',
  },
  alternates: { canonical: 'https://kaizen-mania.com/KM/mocks/frankart' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <FrankartShell>{children}</FrankartShell>
}
