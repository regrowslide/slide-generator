import { DemoDrivenDevelopment } from '@app/(apps)/KM/components/DemoDrivenDevelopment'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'デモ先行開発 | 合同会社改善マニア',
  description:
    '契約前に「動くデモ」で正解を可視化。要件定義書だけでは伝わらないシステムの使い勝手を、契約前に確認できる新しい開発プロセス。',
  keywords: ['デモ先行開発', 'システム開発', 'プロトタイプ', '業務改善', '改善マニア', 'アジャイル'],
  openGraph: {
    title: 'デモ先行開発 | 合同会社改善マニア',
    description: '契約前に「動くデモ」で正解を可視化。システム開発の不確実性を排除する新しいアプローチ。',
    type: 'website',
    locale: 'ja_JP',
  },
}

export default async function DemoDrivenPage() {
  return <DemoDrivenDevelopment />
}

