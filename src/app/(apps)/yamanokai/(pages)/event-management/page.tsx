import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { getYamanokaiEvents } from '@app/(apps)/yamanokai/_actions/event-actions'
import { getApplicationSummaryByEventIds } from '@app/(apps)/yamanokai/_actions/attendance-actions'
import prisma from 'src/lib/prisma'
import EventManagementClient from './EventManagementClient'
import { FitMargin } from '@cm/components/styles/common-components/common-components'

export default async function Page(props) {
  const query = await props.searchParams
  const { session, scopes } = await initServerComopnent({ query })
  const { isSystemAdmin, isCL, canEdit } = scopes.getYamanokaiScopes()

  const [events, departments, users] = await Promise.all([
    getYamanokaiEvents({ where: { isDeleted: false }, orderBy: { startAt: 'desc' } }),
    prisma.yamanokaiDepartment.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.user.findMany({
      where: { apps: { has: 'yamanokai' }, active: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const applicationSummary = await getApplicationSummaryByEventIds(events.map(e => e.id))

  return (
    <FitMargin className='p-2 min-w-[80vw]'>
      <EventManagementClient {...{ events, departments, users, canEdit, isSystemAdmin, applicationSummary, currentUserId: session.id }} />
    </FitMargin>
  )
}
