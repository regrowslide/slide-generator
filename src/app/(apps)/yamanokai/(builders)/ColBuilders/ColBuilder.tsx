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

  static user = (props: columnGetterType) => {
    return new Fields([
      { id: 'name', label: '氏名', form: { ...defaultRegister }, search: {} },
      { id: 'email', label: 'メール', form: {} },
      { id: 'password', label: 'パスワード', type: 'password', form: {} },
      { id: 'phone', label: '電話番号', form: {} },
    ]).transposeColumns()
  }

  static yamanokaiDepartment = (props: columnGetterType) => {
    return new Fields([
      { id: 'code', label: 'コード', form: { ...defaultRegister } },
      { id: 'name', label: '部署名', form: { ...defaultRegister }, search: {} },
      { id: 'color', label: 'カラー', form: {}, type: 'color' },
      { id: 'bgColor', label: '背景色', form: {}, type: 'color' },
    ]).transposeColumns()
  }

}
