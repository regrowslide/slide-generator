import useMyNavigation from 'src/cm/hooks/globalHooks/useMyNavigation'
import {useSession} from 'next-auth/react'
import {anyObject} from '@cm/types/utility-types'
import useSWR from 'swr'
import useUserRole from '@cm/hooks/useUserRole'
import {FakeOrKeepSession} from 'src/non-common/scope-lib/FakeOrKeepSession'
import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {judgeIsAdmin} from 'src/non-common/scope-lib/judgeIsAdmin'
import {UserCl} from '@cm/class/UserCl'
import {User} from '@prisma/client'
import {useCallback, useMemo} from 'react'
import {Session} from 'next-auth'

export type customeSessionType = anyObject
export default function useCustomSession(props?: {session?: Session | null}) {
  const {query} = useMyNavigation()

  // next auth sessionの取得
  const {data: getSessoin, status} = useSession()
  const realSession = (status === 'loading' ? props?.session?.user : getSessoin?.user) as unknown as User

  // fakeSessionの取得
  const {globalUserId} = judgeIsAdmin(realSession, query)

  const {data: fakeSession} = useSWR(JSON.stringify({globalUserId, realSession, query}), async () => {
    const fakeSession = await FakeOrKeepSession({query, realSession})
    return fakeSession ?? null
  })

  //fakeSession || realSession
  const userData = useMemo(
    () => ({
      ...realSession,
      ...fakeSession,
      role: realSession?.role,
    }),
    [fakeSession, realSession, globalUserId]
  )

  const {roles, roleIsLoading} = useUserRole({session: userData})

  const sessionLoading = fakeSession === undefined || status === 'loading' || roleIsLoading

  const accessScopes = useCallback(() => getScopes(userData, {query, roles}), [userData, query, roles])

  const User = new UserCl({
    user: userData,
    roles,
    scopes: getScopes(userData, {query, roles}),
  })

  return {
    sessionLoading,
    status,
    accessScopes,
    fakeSession,
    session: User.data,
    roles,
    useMySessionDependencies: [JSON.stringify(roles), sessionLoading, status],
  }
}
