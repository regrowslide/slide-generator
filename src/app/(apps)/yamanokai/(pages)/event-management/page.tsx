import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { getYamanokaiEvents } from '@app/(apps)/yamanokai/_actions/event-actions'
import prisma from 'src/lib/prisma'
import EventManagementClient from './EventManagementClient'

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

  return <EventManagementClient {...{ events, departments, users, canEdit, isSystemAdmin }} />
}
