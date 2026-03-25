import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'イベント人材シフト管理システム',
  description:
    'シフト配置・個人別PL・ダッシュボードを統合したイベント人材会社向けシフト管理ツール。スタッフの配置最適化と収益可視化で経営効率を向上。改善マニアが開発したイベント人材シフト管理システムのデモ画面をご覧いただけます。',
  keywords: ['シフト管理', '人材派遣', '個人別PL', 'ダッシュボード', 'システム開発', '業務改善', '改善マニア', 'デモ'],
  openGraph: {
    title: 'イベント人材シフト管理システム | 改善マニア 業務システムデモ',
    description: 'シフト配置・個人別PL・ダッシュボードを統合したイベント人材会社向けシフト管理ツール。スタッフの配置最適化と収益可視化で経営効率を向上。',
    type: 'website',
    locale: 'ja_JP',
    siteName: '改善マニア',
    url: 'https://kaizen-mania.com/KM/mocks/steers',
  },
  alternates: {
    canonical: 'https://kaizen-mania.com/KM/mocks/steers',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
