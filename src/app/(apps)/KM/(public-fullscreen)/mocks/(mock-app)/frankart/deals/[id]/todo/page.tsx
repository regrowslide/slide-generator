'use client'

import { useParams } from 'next/navigation'
import DealRoomTodo from '../../../components/DealRoomTodo'

export default function DealTodoPage() {
  const params = useParams()
  const id = params!.id as string
  return <DealRoomTodo dealId={id} />
}
