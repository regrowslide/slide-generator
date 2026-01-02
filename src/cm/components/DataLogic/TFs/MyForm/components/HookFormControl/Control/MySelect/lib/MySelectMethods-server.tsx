import {optionType} from 'src/cm/class/Fields/col-operator-types'

export const getNameFromSelectOption = ({col, record}) => {
  if (col.forSelect?.config?.nameChanger) {
    const changed = record ? col.forSelect?.config?.nameChanger(record) : null
    return changed?.label ?? ''
  }
}

export const getSelectId = col => {
  let selectId = col.id.split('-')[2] ?? col.id

  // purposeMasterId_1_in_Purposeなどへの対応
  const strToCut = selectId.match(/_\d_in_.+/g, '')?.[0]
  selectId = selectId.replace(strToCut, '')
  return selectId
}

export const convertColIdToModelName = ({col}) => {
  const config = col?.forSelect?.config
  if (config?.modelName) return config?.modelName

  let key = col?.pseudoId ?? col?.id
  key = key
    .replace(/.+:/g, '') //カンマによるネストは省く
    .replace(/Id.+/g, '') // ~Idは省く
    .replace('Id', '')
    .replace(/g_/g, '')

  return key
}

/**
 * オプション配列を正規化する
 * - value: DBに格納される値（必須）
 * - label: UIに表示される値（なければvalueを文字列化）
 */
export const mapAdjustOptionValue = (optionObjArr: optionType[]) => {
  if (!Array.isArray(optionObjArr ?? [])) {
    throw new Error('optionObjArr is not array')
  }
  return (optionObjArr ?? []).map(optionObj => normalizeOption(optionObj))
}

function normalizeOption(optionObj: any): optionType {
  // プリミティブ値の場合はそのままvalueとして使用
  if (typeof optionObj !== 'object' || optionObj === null) {
    return {
      value: optionObj,
      label: String(optionObj ?? ''),
    }
  }

  // Prismaデータ（id/name）やカスタムデータから変換
  // value > id の優先順位で取得
  const value = optionObj.value ?? optionObj.id

  return {
    value,
    label: optionObj.label ?? optionObj.name ?? String(value ?? ''),
    color: optionObj.color,
  }
}
