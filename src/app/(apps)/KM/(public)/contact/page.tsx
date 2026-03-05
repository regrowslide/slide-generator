import { EnhancedContact } from '@app/(apps)/KM/components/enhanced/EnhancedContact'
import { Padding } from '@cm/components/styles/common-components/common-components'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'お問い合わせ | 合同会社改善マニア',
  description:
    '改善マニアへのお問い合わせはこちら。システム開発・業務改善のご相談、お見積もりなど、お気軽にご連絡ください。',
  keywords: ['お問い合わせ', 'システム開発', '業務改善', '見積もり', '改善マニア', '相談'],
  openGraph: {
    title: 'お問い合わせ | 合同会社改善マニア',
    description: 'システム開発・業務改善のご相談、お見積もりなど、お気軽にご連絡ください。',
    type: 'website',
    locale: 'ja_JP',
  },
  alternates: {
    canonical: 'https://kaizen-mania.com/KM/contact',
  },
}

export default function Page() {
 return (
  <Padding>
   <EnhancedContact />

  </Padding>
 )
}
