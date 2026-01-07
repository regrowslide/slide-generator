import { KMHeader } from '@app/(apps)/KM/components/KMHeader'
import { Metadata } from 'next'

export const metadata: Metadata = {
 title: '改善マニア | システム開発・業務改善のプロフェッショナル',
 description:
  '改善マニアは業務改善・システム開発の専門家です。スプレッドシートからWEBアプリまで、様々なツール開発で業務効率化を実現。',
}

export default function PublicLayout({
 children,
}: {
 children: React.ReactNode
}) {
 return (
  <div className="min-h-screen flex flex-col">
   <KMHeader />
   <main className="flex-1">{children}</main>
  </div>
 )
}

