'use client'

import { useParams } from 'next/navigation'
import DealRoomContract from '../../../components/DealRoomContract'

export default function DealContractPage() {
  const params = useParams()
  const id = params!.id as string
  return <DealRoomContract dealId={id} />
}
