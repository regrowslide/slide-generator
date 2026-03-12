import useMyNavigation from 'src/cm/hooks/globalHooks/useMyNavigation'
import {anyObject} from '@cm/types/utility-types'
import useUserRole from '@cm/hooks/useUserRole'
import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {UserCl} from '@cm/class/UserCl'
import {User} from '@prisma/generated/prisma/client'
import {useCallback} from 'react'
import {useSession} from 'src/lib/auth-client'

export type customeSessionType = anyObject
export default function useCustomSession() {
  const {query} = useMyNavigation()

  // better-auth のセッション取得
  const {data: sessionData, isPending} = useSession()

  const userData = (sessionData?.user ?? null) as unknown as User | null
  // なりすまし中かどうか（better-auth Admin Plugin）
  const impersonatedBy = (sessionData?.session as anyObject)?.impersonatedBy as string | undefined

  const {roles, roleIsLoading} = useUserRole({session: userData})

  const sessionLoading = isPending || roleIsLoading

  const accessScopes = useCallback(() => getScopes(userData ?? {}, {query, roles}), [userData, query, roles])

  const userCl = new UserCl({
    user: (userData ?? {}) as User,
    roles,
    scopes: getScopes(userData ?? {}, {query, roles}),
  })

  return {
    sessionLoading,
    status: isPending ? 'loading' : userData ? 'authenticated' : 'unauthenticated',
    accessScopes,
    impersonatedBy: impersonatedBy ?? null,
    session: userCl.data,
    roles,
    useMySessionDependencies: [JSON.stringify(roles), sessionLoading],
  }
}
