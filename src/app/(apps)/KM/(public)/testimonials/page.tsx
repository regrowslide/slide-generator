import { TestimonialCarousel } from '@app/(apps)/KM/components/TestimonialCarousel'
import prisma from 'src/lib/prisma'
import { Metadata } from 'next'

export const metadata: Metadata = {
 title: 'お客様の声 | 合同会社改善マニア',
 description:
  '改善マニアをご利用いただいたお客様からの声をご紹介します。業務改善・システム開発の成果と満足度をお確かめください。',
 keywords: ['お客様の声', 'レビュー', '評価', 'システム開発', '業務改善', '改善マニア', '実績'],
 openGraph: {
  title: 'お客様の声 | 合同会社改善マニア',
  description: '改善マニアをご利用いただいたお客様からの声をご紹介します。',
  type: 'website',
  locale: 'ja_JP',
 },
}

export type TestimonialData = {
 id: number
 impression: string
 reply: string | null
 clientName: string | null
 organization: string | null
 title: string | null
 dealPoint: number | null
 toolPoint: number | null
 allowShowClient: boolean | null
 KaizenClient: {
  name: string | null
  organization: string | null
  iconUrl: string | null
 } | null
}

export default async function TestimonialsPage() {
 const works = await prisma.kaizenWork.findMany({
  where: {
   impression: {
    not: null,
   },
  },
  select: {
   id: true,
   impression: true,
   reply: true,
   clientName: true,
   organization: true,
   title: true,
   dealPoint: true,
   toolPoint: true,
   allowShowClient: true,
   KaizenClient: {
    select: {
     name: true,
     organization: true,
     iconUrl: true,
    },
   },
  },
  orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
 })

 // impressionが存在するもののみをフィルタリング
 const testimonials = works.filter(
  (work): work is typeof work & { impression: string } => work.impression !== null && work.impression.trim() !== ''
 )

 return <TestimonialCarousel testimonials={testimonials} />
}

