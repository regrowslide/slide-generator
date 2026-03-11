import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VisitDental Pro | 訪問歯科の算定・書類作成を自動化',
  description:
    '訪問歯科診療の算定項目を自動判定、提供文書をワンクリック生成。診療時間の自動記録で業務効率を大幅改善。無料でお問い合わせください。',
}

// LP用フルスクリーンレイアウト（認証・ヘッダー不要）
export default function DentalLpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className='min-h-screen bg-white'>{children}</div>
}
