'use client'

import { useParams } from 'next/navigation'
import DealRoomMeetings from '../../components/DealRoomMeetings'

export default function DealMeetingsPage() {
  const params = useParams()
  const id = params!.id as string
  return <DealRoomMeetings dealId={id} />
}
