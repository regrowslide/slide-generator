import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '製造業向け生産管理システム',
  description:
    '製造業の生産計画・在庫管理・受注管理を効率化するシステム。カレンダーベースの生産スケジュール管理と原材料在庫の可視化を実現。 改善マニアが開発した製造業向け生産管理システムのデモ画面をご覧いただけます。',
  keywords: ['生産計画', '在庫管理', '受注管理', 'スケジュール管理', 'システム開発', '業務改善', '改善マニア', 'デモ'],
  openGraph: {
    title: '製造業向け生産管理システム | 改善マニア 業務システムデモ',
    description: '製造業の生産計画・在庫管理・受注管理を効率化するシステム。カレンダーベースの生産スケジュール管理と原材料在庫の可視化を実現。',
    type: 'website',
    locale: 'ja_JP',
    siteName: '改善マニア',
    url: 'https://kaizen-mania.com/KM/mocks/seisan-kanri',
  },
  alternates: {
    canonical: 'https://kaizen-mania.com/KM/mocks/seisan-kanri',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
