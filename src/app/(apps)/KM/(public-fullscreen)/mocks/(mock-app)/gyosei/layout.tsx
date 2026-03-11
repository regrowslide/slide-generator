import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI行政書士君 II | 補助金採択後やることリスト作成ツール',
  description:
    '補助金採択後に必要なタスクをAIが自動生成。計画書PDF・公募要領URL・採択状況を入力するだけで、やることリスト（タスク・期限・担当者）と実績報告ガイドを出力します。',
  keywords: ['補助金', 'やることリスト', 'AI', 'タスク管理', '行政書士', '実績報告', '交付申請', '保利国際法務事務所'],
  openGraph: {
    title: 'AI行政書士君 II | 補助金採択後やることリスト作成ツール',
    description:
      '補助金採択後に必要なタスクをAIが自動生成。計画書PDF・公募要領URL・採択状況を入力するだけで、やることリスト（タスク・期限・担当者）と実績報告ガイドを出力します。',
    type: 'website',
    locale: 'ja_JP',
    siteName: '改善マニア',
    url: 'https://kaizen-mania.com/KM/mocks/gyosei-ii',
  },
  alternates: {
    canonical: 'https://kaizen-mania.com/KM/mocks/gyosei-ii',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
