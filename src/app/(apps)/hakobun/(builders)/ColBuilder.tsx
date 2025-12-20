'use client'

import { defaultRegister } from '@cm/class/builders/ColBuilderVariables'
import { Fields } from '@cm/class/Fields/Fields'
import { columnGetterType } from '@cm/types/types'
export class ColBuilder {
  static user = (props: columnGetterType) => {
    return new Fields([
      { id: 'name', label: '名称', form: { ...defaultRegister } },
      { id: 'email', label: 'Email', form: { ...defaultRegister } },
      { id: 'password', label: 'パスワード', type: `password`, form: { ...defaultRegister } },
    ]).transposeColumns()
  }

  static hakobunClient = (props: columnGetterType) => {
    return new Fields([
      { id: 'clientId', label: 'クライアントID', form: { ...defaultRegister } },
      { id: 'name', label: '名称', form: { ...defaultRegister } },
      { id: 'createdAt', label: '作成日時', form: { disabled: true } },
      { id: 'updatedAt', label: '更新日時', form: { disabled: true } },
    ]).transposeColumns()
  }

  static hakobunCategory = (props: columnGetterType) => {
    return new Fields([
      { id: 'categoryCode', label: 'カテゴリコード', form: { ...defaultRegister } },
      { id: 'generalCategory', label: '大分類', form: { ...defaultRegister } },
      { id: 'specificCategory', label: '小分類', form: { ...defaultRegister } },
      { id: 'description', label: '説明', form: { ...defaultRegister } },
      { id: 'enabled', label: '有効', type: 'boolean', form: { ...defaultRegister } },
      { id: 'hakobunClientId', label: 'クライアントID', form: { ...defaultRegister } },
      { id: 'createdAt', label: '作成日時', form: { disabled: true } },
      { id: 'updatedAt', label: '更新日時', form: { disabled: true } },
    ]).transposeColumns()
  }

  static hakobunRule = (props: columnGetterType) => {
    return new Fields([
      { id: 'targetCategory', label: '対象カテゴリ', form: { ...defaultRegister } },
      { id: 'ruleDescription', label: 'ルール説明', form: { ...defaultRegister } },
      { id: 'priority', label: '優先度', form: { ...defaultRegister } },
      { id: 'hakobunClientId', label: 'クライアントID', form: { ...defaultRegister } },
      { id: 'createdAt', label: '作成日時', form: { disabled: true } },
      { id: 'updatedAt', label: '更新日時', form: { disabled: true } },
    ]).transposeColumns()
  }
}
