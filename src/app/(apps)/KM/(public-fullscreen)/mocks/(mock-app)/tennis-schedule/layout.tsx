import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'テニスサークル予定管理アプリ',
  description:
    'サークルの練習・試合予定をカレンダーで共有。ワンタップで参加可否を入力でき、LINEスケジュールの煩雑さを解消。 改善マニアが開発したテニスサークル予定管理アプリのデモ画面をご覧いただけます。',
  keywords: ['カレンダー管理', 'ワンタップ出欠', 'コート場所リンク', '誰でも予定作成', 'システム開発', '業務改善', '改善マニア', 'デモ'],
  openGraph: {
    title: 'テニスサークル予定管理アプリ | 改善マニア 業務システムデモ',
    description: 'サークルの練習・試合予定をカレンダーで共有。ワンタップで参加可否を入力でき、LINEスケジュールの煩雑さを解消。',
    type: 'website',
    locale: 'ja_JP',
    siteName: '改善マニア',
    url: 'https://kaizen-mania.com/KM/mocks/tennis-schedule',
  },
  alternates: {
    canonical: 'https://kaizen-mania.com/KM/mocks/tennis-schedule',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
