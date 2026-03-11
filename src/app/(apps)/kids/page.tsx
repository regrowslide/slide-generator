import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { redirect } from 'next/navigation'
import { getChildren } from './_actions/child-actions'
import KidsHomeClient from './KidsHomeClient'

type Props = {
  searchParams: Promise<Record<string, string>>
}

export default async function KidsPage({ searchParams }: Props) {
  const query = await searchParams
  const { session } = await initServerComopnent({ query })

  if (!session?.id) redirect('/login')

  const children = await getChildren(session.id)

  return <KidsHomeClient initialChildren={children} userId={session.id} />
}
