import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '介護食管理システム',
  description:
    '介護施設向けの給食管理・献立作成・製造指示・配送管理を一元化。施設ごとの食事形態や個別対応にも柔軟に対応。 改善マニアが開発した介護食管理システムのデモ画面をご覧いただけます。',
  keywords: ['受注管理', '献立管理', '製造指示', '梱包・配送', 'システム開発', '業務改善', '改善マニア', 'デモ'],
  openGraph: {
    title: '介護食管理システム | 改善マニア 業務システムデモ',
    description: '介護施設向けの給食管理・献立作成・製造指示・配送管理を一元化。施設ごとの食事形態や個別対応にも柔軟に対応。',
    type: 'website',
    locale: 'ja_JP',
    siteName: '改善マニア',
    url: 'https://kaizen-mania.com/KM/mocks/kaigoshoku',
  },
  alternates: {
    canonical: 'https://kaizen-mania.com/KM/mocks/kaigoshoku',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
