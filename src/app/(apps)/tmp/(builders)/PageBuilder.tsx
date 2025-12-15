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
    const { admin, } = useGlobalProps.accessScopes()


    const columns = new Fields([
      {
        id: globalIds.globalUserId,
        label: 'ユーザー',
        forSelect: {
          config: {
            modelName: 'user',
          }
        },
        form: { style: { width: 85 } }
      },

    ]).transposeColumns()


    if (admin) {
      return () => <GlobalIdSelector {...{ useGlobalProps, columns }} />
    }
  }
}
