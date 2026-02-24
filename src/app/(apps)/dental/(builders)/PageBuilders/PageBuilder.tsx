'use client'

import {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobal'
import {Fields} from '@cm/class/Fields/Fields'
import GlobalIdSelector from '@cm/components/GlobalIdSelector/GlobalIdSelector'
import {globalIds} from 'src/non-common/searchParamStr'

export class PageBuilder {
  static getGlobalIdSelector = (props: {useGlobalProps: useGlobalPropType}) => {
    const {useGlobalProps} = props
    const {admin} = useGlobalProps.accessScopes()

    if (admin) {
      const columns = new Fields([
        {
          id: globalIds.globalUserId,
          label: 'ユーザー',
          forSelect: {
            config: {
              modelName: 'user',
            },
          },
          form: {style: {width: 120}},
        },
      ]).transposeColumns()

      return () => <GlobalIdSelector {...{useGlobalProps, columns}} />
    }
  }
}
