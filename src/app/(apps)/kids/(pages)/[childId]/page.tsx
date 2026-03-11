import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { redirect } from 'next/navigation'
import { getChildWithCategories } from '../../_actions/child-actions'
import { getTodayCompletedIds, getStreak, getAchievementCount } from '../../_actions/log-actions'
import { isOwnChild } from '../../_actions/child-actions'
import KidsRoutineClient from './KidsRoutineClient'

type Props = {
  params: Promise<{ childId: string }>
  searchParams: Promise<Record<string, string>>
}

export default async function KidsRoutinePage({ params, searchParams }: Props) {
  const { childId: childIdStr } = await params
  const query = await searchParams
  const childId = parseInt(childIdStr, 10)

  if (isNaN(childId)) redirect('/kids')

  const { session } = await initServerComopnent({ query })
  if (!session?.id) redirect('/login')

  // 自分の子どもか確認
  const isOwn = await isOwnChild(childId, session.id)
  if (!isOwn) redirect('/kids')

  // データを並列取得
  const [childData, completedIds, streak, achCount] = await Promise.all([
    getChildWithCategories(childId),
    getTodayCompletedIds(childId),
    getStreak(childId),
    getAchievementCount(childId),
  ])

  if (!childData) redirect('/kids')

  return (
    <KidsRoutineClient
      child={childData}
      categories={childData.KidsCategory}
      initialCompletedIds={completedIds}
      initialStreak={streak}
      initialAchievementCount={achCount}
    />
  )
}
