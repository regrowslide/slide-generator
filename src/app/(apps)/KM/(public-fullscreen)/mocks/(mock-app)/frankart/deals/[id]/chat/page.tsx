'use client'

import { useParams } from 'next/navigation'
import DealRoomChat from '../../../components/DealRoomChat'

export default function DealChatPage() {
  const params = useParams()
  const id = params!.id as string
  return <DealRoomChat dealId={id} />
}
