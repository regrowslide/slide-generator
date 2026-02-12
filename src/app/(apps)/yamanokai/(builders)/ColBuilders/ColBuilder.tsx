'use client'

import { columnGetterType } from '@cm/types/types'
import { Fields } from '@cm/class/Fields/Fields'
import { defaultRegister } from '@cm/class/builders/ColBuilderVariables'

export class ColBuilder {
  static roleMaster = (props: columnGetterType) => {
    return Fields.transposeColumns(
      [
        { id: 'name', label: '名称', type: 'text', form: { ...defaultRegister } },
      ],
      { ...props.transposeColumnsOptions }
    )
  }
}
