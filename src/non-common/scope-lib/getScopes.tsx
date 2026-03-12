import { arr__findCommonValues } from '@cm/class/ArrHandler/array-utils/data-operations'
import { MyFormType } from '@cm/types/form-types'
import { MyTableType } from '@cm/types/types'
import { anyObject } from '@cm/types/utility-types'

import { judgeIsAdmin, roleIs } from 'src/non-common/scope-lib/judgeIsAdmin'

type getScopeOptionsProps = { query?: anyObject; roles?: any[] }

export const getScopes = (session: anyObject, options: getScopeOptionsProps) => {
  const { query, roles } = options ?? {}

  const roleNames = (roles ?? []).map(d => d.name)
  const login = session?.id ? true : false
  const { admin } = judgeIsAdmin(session)


  const result = {
    login,
    admin,

    getYamanokaiScopes: () => {
      const isSystemAdmin = !!arr__findCommonValues([`管理者`], roleNames) || admin
      const isCL = !!arr__findCommonValues([`CL`], roleNames)
      const canEdit = isSystemAdmin || isCL
      // better-auth impersonationではsession.idが対象ユーザーのIDになる
      const userId = session?.id ?? ''
      return { userId, isSystemAdmin, isCL, canEdit }
    },

    getDentalScopes: () => {
      const isSystemAdmin = !!arr__findCommonValues([`管理者`], roleNames) || admin
      // better-auth impersonationではsession.idが対象ユーザーのIDになる
      const userId = session?.id ?? ''
      return { userId, isSystemAdmin }
    },

    getRegrowScopes: () => {
      const isManager = roleNames.includes('マネージャー')
      const isAdmin = roleNames.includes('管理者') || admin

      return {
        isAdmin,
        isManager,
      }
    },
  }

  return result
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
