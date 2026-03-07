import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '補助金やることリスト生成AI',
  description:
    '補助金採択後に必要なタスクをAIが自動生成。計画書PDFと公募要領URLを読み込み、やることリスト（タスク・期限・担当者）を出力します。改善マニアが開発した補助金タスク管理AIのデモ画面をご覧いただけます。',
  keywords: ['補助金', 'やることリスト', 'AI', 'タスク管理', '行政書士', 'システム開発', '業務改善', '改善マニア', 'デモ'],
  openGraph: {
    title: '補助金やることリスト生成AI | 改善マニア 業務システムデモ',
    description: '補助金採択後に必要なタスクをAIが自動生成。計画書PDFと公募要領URLを読み込み、やることリスト（タスク・期限・担当者）を出力します。',
    type: 'website',
    locale: 'ja_JP',
    siteName: '改善マニア',
    url: 'https://kaizen-mania.com/KM/mocks/gyosei',
  },
  alternates: {
    canonical: 'https://kaizen-mania.com/KM/mocks/gyosei',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
