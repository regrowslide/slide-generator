import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { redirect } from 'next/navigation'
import { isOwnChild } from '../../../_actions/child-actions'
import { getAllCategories } from '../../../_actions/routine-actions'
import { KidsChildService } from '../../../lib/services/KidsChildService'
import KidsMasterClient from './KidsMasterClient'

type Props = {
  params: Promise<{ childId: string }>
  searchParams: Promise<Record<string, string>>
}

export default async function KidsMasterPage({ params, searchParams }: Props) {
  const { childId: childIdStr } = await params
  const query = await searchParams
  const childId = parseInt(childIdStr, 10)

  if (isNaN(childId)) redirect('/kids')

  const { session } = await initServerComopnent({ query })
  if (!session?.id) redirect('/login')

  const isOwn = await isOwnChild(childId, session.id)
  if (!isOwn) redirect('/kids')

  const [categories, child] = await Promise.all([
    getAllCategories(childId),
    KidsChildService.getChildWithCategories(childId),
  ])

  if (!child) redirect('/kids')

  return (
    <KidsMasterClient
      childId={childId}
      childName={child.name}
      childEmoji={child.emoji}
      initialCategories={categories}
    />
  )
}
