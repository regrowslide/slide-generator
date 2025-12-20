'use client'

import { useGlobalPropType } from '@cm/hooks/globalHooks/useGlobal'
import { Fields } from '@cm/class/Fields/Fields'
import { globalIds } from 'src/non-common/searchParamStr'
import GlobalIdSelector from '@cm/components/GlobalIdSelector/GlobalIdSelector'
import { DataModelBuilder, roleMaster } from '@cm/class/builders/PageBuilderVariables'

export class PageBuilder {
  static roleMaster: DataModelBuilder = roleMaster
  static getGlobalIdSelector = (props: { useGlobalProps: useGlobalPropType }) => {
    const { useGlobalProps } = props
    const { admin, login } = useGlobalProps.accessScopes()

    const columns = new Fields([
      {
        id: globalIds.globalHakobunClientId,
        label: 'クライアント',
        forSelect: {
          config: {
            modelName: 'hakobunClient',

          }
        },
        form: { style: { width: 200 } }
      },


    ]).transposeColumns()

    if (admin || login) {
      return () => <GlobalIdSelector {...{ useGlobalProps, columns }} />
    }
  }
}
