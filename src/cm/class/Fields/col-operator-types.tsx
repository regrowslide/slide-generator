import {colType} from '@cm/types/col-types'
import {anyObject} from '@cm/types/utility-types'

export type transposeColumnsOptionProps = {
  autoSplit?: {
    table?: number
    form?: number
  }
} & anyObject

export type optionsOrOptionFetcherProps = {
  latestFormData?: anyObject
  col: colType
  searchInput?: string
  // additionalQuery?: anyObject
}

export type optionsOrOptionFetcherType = (
  props: optionsOrOptionFetcherProps
) => Promise<{optionObjArr: optionType[]; modelName?: string}>

/**
 * セレクトオプションの型定義
 * - value: DBに格納される値（必須）
 * - label: UIに表示される値（任意、なければvalueを文字列化）
 * - color: オプションの色（任意）
 */
export type optionType = {
  value: any
  label?: string
  color?: string
} & anyObject
