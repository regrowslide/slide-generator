import { arr__findCommonValues } from '@cm/class/ArrHandler/array-utils/data-operations'
import { MyFormType } from '@cm/types/form-types'
import { MyTableType } from '@cm/types/types'
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

    getRegrowScopes: () => {

      const isFakeUser = query?.[globalIds.globalUserId]
      const isManager = roleNames.includes('マネージャー')
      const isAdmin = roleNames.includes('管理者') || (admin && !isFakeUser)
      console.log({ isFakeUser, isAdmin })  //logs

      return {
        isAdmin,
        isManager,

      }
    },

  }

  return result
}

const addAdminToRoles: (targetObject: any, session: anyObject, adminSelf: boolean) => anyObject = (targetObject, session, adminSelf) => {

  // const result: anyObject = {...targetObject}
  if (adminSelf) {
    Object.keys(targetObject).forEach(key => {
      const value = targetObject[key]
      targetObject[key] = value

      if (typeof targetObject[key] !== 'object' && roleIs(['管理者'], session) && targetObject[key] === false) {
        targetObject[key] = true
      }
    })

  }

  return targetObject
}

export const limitEditting = (props: { exclusiveTo?: boolean; myTable?: MyTableType; myForm?: MyFormType }) => {
  const {
    exclusiveTo,
    myTable = { update: false, delete: false },
    myForm = {
      update: false,
      delete: false,
    },
  } = props
  if (!exclusiveTo) {
    return {
      myTable,
      myForm,
    }
  }
}
