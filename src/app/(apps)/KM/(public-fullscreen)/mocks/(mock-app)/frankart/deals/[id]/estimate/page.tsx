'use client'

import { useParams } from 'next/navigation'
import DealRoomEstimate from '../../../components/DealRoomEstimate'

export default function DealEstimatePage() {
  const params = useParams()
  const id = params!.id as string
  return <DealRoomEstimate dealId={id} />
}
