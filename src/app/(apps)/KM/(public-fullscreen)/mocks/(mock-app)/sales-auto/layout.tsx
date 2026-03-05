import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '自動車ディーラー営業管理システム',
  description:
    '商談管理・見積書作成・納車スケジュール・売上分析を統合した営業管理ツール。ABC判定やパイプライン可視化で成約率を向上。 改善マニアが開発した自動車ディーラー営業管理システムのデモ画面をご覧いただけます。',
  keywords: ['商談管理', '見積書作成', '納車管理', '売上分析', 'システム開発', '業務改善', '改善マニア', 'デモ'],
  openGraph: {
    title: '自動車ディーラー営業管理システム | 改善マニア 業務システムデモ',
    description: '商談管理・見積書作成・納車スケジュール・売上分析を統合した営業管理ツール。ABC判定やパイプライン可視化で成約率を向上。',
    type: 'website',
    locale: 'ja_JP',
    siteName: '改善マニア',
    url: 'https://kaizen-mania.com/KM/mocks/sales-auto',
  },
  alternates: {
    canonical: 'https://kaizen-mania.com/KM/mocks/sales-auto',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
