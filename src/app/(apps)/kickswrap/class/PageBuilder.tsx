'use client'

import { Fields } from '@cm/class/Fields/Fields'

import GlobalIdSelector from '@cm/components/GlobalIdSelector/GlobalIdSelector'
import useMySession from '@cm/hooks/globalHooks/useMySession'
import { globalIds } from 'src/non-common/searchParamStr'

export class PageBuilder {
  static getGlobalIdSelector = ({ useGlobalProps }) => {
    return () => {
      const { accessScopes } = useMySession()
      const { admin } = accessScopes()

      const columns = Fields.transposeColumns([
        {
          label: 'ユーザー',
          id: globalIds.globalUserId,
          form: {},
          forSelect: {
            config: {
              modelName: `user`,
              where: { OR: [{ membershipName: { not: null } }] },
            },
          },
        },
      ])
      if (admin) {
        return (
          <GlobalIdSelector
            {...{
              useGlobalProps,
              columns,
            }}
          />
        )
      }
    }
  }
}
