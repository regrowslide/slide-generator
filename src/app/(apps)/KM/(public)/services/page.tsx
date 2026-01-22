import { ServiceIntroduction } from '@app/(apps)/KM/components/ServiceIntroduction'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '導入事例・フィットするお客様 | 合同会社改善マニア',
  description:
    '既存ソフトでは届かない「業務の隙間」をシステム化します。高額な開発も、帯に短し襷に長しなパッケージソフトも不要。御社独自の「お作法」に合わせた現場特化型システムで、確実なコスト削減と業務効率化を実現します。',
  keywords: [
    '業務改善',
    'システム開発',
    '導入事例',
    'ケーススタディ',
    '業務効率化',
    'コスト削減',
    '改善マニア',
    'SaaS',
    '業務の隙間',
  ],
  openGraph: {
    title: '導入事例・フィットするお客様 | 合同会社改善マニア',
    description:
      '既存ソフトでは届かない「業務の隙間」をシステム化。14件の導入事例とサービス適合判断をご紹介します。',
    type: 'website',
    locale: 'ja_JP',
  },
}

export default function ServicesPage() {
  return <ServiceIntroduction />
}

