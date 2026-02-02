import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '改善マニア | システム開発・業務改善のプロフェッショナル',
  description:
    '改善マニアは業務改善・システム開発の専門家です。スプレッドシートからWEBアプリまで、様々なツール開発で業務効率化を実現。',
}

// 詳細ページ用フルスクリーンレイアウト（ヘッダーなし）
export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
