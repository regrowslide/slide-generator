import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '月次業績レポートシステム',
  description:
    '月次の業績データをスライド形式で自動生成。売上推移・KPI分析・部門別比較などを視覚的にプレゼンテーション。 改善マニアが開発した月次業績レポートシステムのデモ画面をご覧いただけます。',
  keywords: ['自動スライド生成', '売上推移分析', 'KPI可視化', '部門別比較', 'システム開発', '業務改善', '改善マニア', 'デモ'],
  openGraph: {
    title: '月次業績レポートシステム | 改善マニア 業務システムデモ',
    description: '月次の業績データをスライド形式で自動生成。売上推移・KPI分析・部門別比較などを視覚的にプレゼンテーション。',
    type: 'website',
    locale: 'ja_JP',
    siteName: '改善マニア',
    url: 'https://kaizen-mania.com/KM/mocks/regrow',
  },
  alternates: {
    canonical: 'https://kaizen-mania.com/KM/mocks/regrow',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
