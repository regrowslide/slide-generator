import { arr__findCommonValues } from '@cm/class/ArrHandler/array-utils/data-operations'
import { anyObject } from '@cm/types/utility-types'

import { judgeIsAdmin, roleIs, typeIs } from 'src/non-common/scope-lib/judgeIsAdmin'
import { globalIds } from 'src/non-common/searchParamStr'

type GroupieScopeType = {
  schoolId?: number
  teacherId?: number
  classroomId?: number
  isSchoolLeader: boolean
}


type getScopeOptionsProps = { query?: anyObject; roles?: any[] }

export const getScopes = (session: anyObject, options: getScopeOptionsProps) => {
  const { query, roles } = options ?? {}

  const roleNames = (roles ?? []).map(d => d.name)
  const login = session?.id ? true : false
  const { admin, getGlobalUserId } = judgeIsAdmin(session, query)

  const result = {
    login,
    admin,
    getGlobalUserId,


    getYamanokaiScopes: () => {
      const isSystemAdmin = !!arr__findCommonValues([`管理者`], roleNames) || admin
      const isCL = !!arr__findCommonValues([`CL`], roleNames)
      const canEdit = isSystemAdmin || isCL
      const userId = !admin ? session?.id : Number(query?.[globalIds.globalUserId] ?? session?.id ?? 0)
      return { userId, isSystemAdmin, isCL, canEdit }
    },

    getDentalScopes: () => {
      const isSystemAdmin = !!arr__findCommonValues([`管理者`], roleNames) || admin
      const userId = !admin ? session?.id : Number(query?.[globalIds.globalUserId] ?? session?.id ?? 0)
      return { userId, isSystemAdmin }
    },

  }

  return result
}

const addAdminToRoles: (targetObject: any, session: anyObject) => anyObject = (targetObject, session) => {
  // const result: anyObject = {...targetObject}
  Object.keys(targetObject).forEach(key => {
    const value = targetObject[key]
    targetObject[key] = value

    if (typeof targetObject[key] !== 'object' && roleIs(['管理者'], session) && targetObject[key] === false) {
      targetObject[key] = true
    }
  })

  return targetObject
}
// 管理者・編集者・閲覧者
