'use client'

import { useParams } from 'next/navigation'
import DealRoomFiles from '../../../components/DealRoomFiles'

export default function DealFilesPage() {
  const params = useParams()
  const id = params!.id as string
  return <DealRoomFiles dealId={id} />
}
