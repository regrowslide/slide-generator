'use client'

import { columnGetterType } from '@cm/types/types'
import { colType } from '@cm/types/col-types'
import { Fields } from '@cm/class/Fields/Fields'


export class ColBuilder {
  static store = (props: columnGetterType) => {
    const data: colType[] = [
      {
        id: 'code',
        label: '拠点コード',
        type: 'number',
        td: {},
        form: { register: { required: '必須' } },
        search: {},
        sort: {},
      },
      {
        id: 'name',
        label: '名前',
        form: { register: { required: '必須' } },
        search: {},
        sort: {},
      },
      {
        id: 'tel',
        label: '電話番号',
        form: { register: {} },
        search: {},
      },
      {
        id: 'fax',
        label: 'FAX番号',
        form: { register: {} },
        search: {},
      },
      {
        id: 'address',
        label: '住所',
        form: { register: {} },
        search: {},
      },
      {
        id: 'areaId',
        label: '配送エリア区分',
        form: { register: {} },
        forSelect: {},
        search: {},
      },
      {
        id: 'active',
        label: 'アクティブ',
        type: 'boolean',
        form: {},
        sort: {},
      },
      {
        id: 'sortOrder',
        label: '並び順',
        type: 'number',
        form: {},
        sort: {},
      },
    ]

    return Fields.transposeColumns(data)
  }



  static roleMaster = (props: columnGetterType) => {
    return new Fields([
      {
        id: 'name',
        label: '役割名称',
        form: {
          register: { required: '必須' },
        },
        format: (value, row) => {
          return (
            <div>
              {value}
              <small className="text-gray-500"> ({row.UserRole?.length || 0}人)</small>
            </div>
          )
        },
        sort: {},
        search: {},
      },
      {
        id: 'description',
        label: '説明',
        form: {},
        search: {},
      },
      {
        id: 'color',
        label: '色',
        type: 'color',
        form: {},
        sort: {},
      },
    ]).transposeColumns()
  }
}
