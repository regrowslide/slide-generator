import {useCallback, useEffect, useState} from 'react'

import {optionType} from 'src/cm/class/Fields/col-operator-types'
import {
  getNameFromSelectOption,
  getSelectId,
  mapAdjustOptionValue,
} from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/lib/MySelectMethods-server'
import {
  getRecord,
  renewOptions,
} from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/lib/MySelectMethods-client'
import {ControlProps} from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control'

import {
  contextsType,
  MySelectContextType,
} from '@cm/components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/my-select-types'

import {OptionCreatorProps} from '@cm/types/types'

export default function useInitMySelect(props: ControlProps) {
  const {controlContextValue} = props
  const {col, currentValue, Cached_Option_Props} = controlContextValue

  // autoOpen設定を確認（インライン編集モード時）
  const autoOpen = col?.inputProps?.autoOpen ?? false
  const [isOptionsVisible, setIsOptionsVisible] = useState(autoOpen)

  const [filteredOptions, setFilteredOptions] = useState<optionType[]>([])

  const selectId = getSelectId(col)
  const options = Cached_Option_Props?.allOptions?.[selectId]

  const record: any = getRecord({col, currentValue, options})

  const currentValueToReadableStr = getcurrentValueToReadableStr({col, record, currentValue, options}) ?? ''

  const COLOR = options?.find(op => op?.value === currentValue)?.color

  const [searchedInput, setsearchedInput] = useState('')

  //init filteredOptions
  useEffect(() => {
    if (options) {
      const pickedOption = mapAdjustOptionValue([record])[0]

      const pickedOptionsIsAlreadyInOptions = pickedOption?.value && options?.find(op => op?.value === pickedOption?.value)
      const uniqueOptions = pickedOption?.value && !pickedOptionsIsAlreadyInOptions ? [...options, pickedOption] : options

      const sorted = [...uniqueOptions]
      setFilteredOptions(sorted)
    }
  }, [options])

  /**オプションをクリックしたときの挙動*/
  const handleOptionClick = useCallback(
    async (option, newFilterdOptions) => {
      const {liftUpNewValueOnChange, ReactHookForm, field} = controlContextValue
      try {
        setIsOptionsVisible(false)
        // option.value がDBに格納される値
        const newValue = option?.value ?? ''

        const props = {id: col.id, newValue, ReactHookForm}

        // /**親コンポーネントにデータを送る */
        liftUpNewValueOnChange(props)

        field.onBlur()
        const {allOptions, setallOptionsState} = Cached_Option_Props
        renewOptions({col, allOptions, setallOptionsState, newOptions: newFilterdOptions})
      } catch (error) {
        console.error(error.stack)
      }
    },
    [controlContextValue, col, Cached_Option_Props]
  )

  const {allowCreateOptions} = col.forSelect ?? {}
  const {messageWhenNoHit = `選択肢が見つかりませんでした。`} = col.forSelect?.config ?? {}

  const MySelectContextValue: MySelectContextType = {
    messageWhenNoHit,
    selectId,
    ...{isOptionsVisible, setIsOptionsVisible},
    ...{options, filteredOptions, setFilteredOptions},
    ...{searchedInput, setsearchedInput},
    allowCreateOptions,
    handleOptionClick,
    COLOR,
    currentValueToReadableStr,
  }

  const contexts: contextsType = {MySelectContextValue, controlContextValue}

  return {contexts}
}

/**
 * 現在の値を読みやすい文字列に変換
 * - options から value が一致するものの label を返す
 */
const getcurrentValueToReadableStr = ({col, record, currentValue, options}) => {
  // options から現在の値に一致するオプションの label を取得
  const matchedOption = options?.find(op => op?.value === currentValue)

  if (matchedOption?.label) {
    return matchedOption.label
  }

  // record から取得
  if (record?.name) return record.name

  if (getNameFromSelectOption({col, record})) return getNameFromSelectOption({col, record})

  // プリミティブ値の場合
  if (typeof record === 'string' || typeof record === 'number') {
    return record
  }

  return undefined
}

export const parseContexts = (contexts: contextsType) => {
  const {controlContextValue, MySelectContextValue} = contexts
  return {
    ...controlContextValue,
    ...MySelectContextValue,
  }
}

export const makeOptionCreatorProps = (contexts: contextsType) => {
  const {searchedInput} = contexts.MySelectContextValue

  const OptionCreatorProps: OptionCreatorProps = {
    searchedInput,
    ...contexts.controlContextValue,
  }
  return OptionCreatorProps
}
