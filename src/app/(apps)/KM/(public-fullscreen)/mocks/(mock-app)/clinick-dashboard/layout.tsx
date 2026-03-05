import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '美容医療クリニック管理ダッシュボード',
  description:
    '美容クリニックのマーケティング分析・顧客管理・予約管理を統合したダッシュボード。流入経路分析やKPI可視化機能を搭載。 改善マニアが開発した美容医療クリニック管理ダッシュボードのデモ画面をご覧いただけます。',
  keywords: ['流入経路分析', 'KPI可視化', '顧客管理', '予約管理', 'システム開発', '業務改善', '改善マニア', 'デモ'],
  openGraph: {
    title: '美容医療クリニック管理ダッシュボード | 改善マニア 業務システムデモ',
    description: '美容クリニックのマーケティング分析・顧客管理・予約管理を統合したダッシュボード。流入経路分析やKPI可視化機能を搭載。',
    type: 'website',
    locale: 'ja_JP',
    siteName: '改善マニア',
    url: 'https://kaizen-mania.com/KM/mocks/clinick-dashboard',
  },
  alternates: {
    canonical: 'https://kaizen-mania.com/KM/mocks/clinick-dashboard',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
