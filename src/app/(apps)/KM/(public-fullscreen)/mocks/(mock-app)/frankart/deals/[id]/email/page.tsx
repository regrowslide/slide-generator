'use client'

import { useParams } from 'next/navigation'
import DealRoomEmail from '../../../components/DealRoomEmail'

export default function DealEmailPage() {
  const params = useParams()
  const id = params!.id as string
  return <DealRoomEmail dealId={id} />
}
