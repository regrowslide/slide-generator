'use client'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { useEffect, useMemo } from 'react'
import useDateSwitcherFunc from '@cm/components/utils/dates/DateSwitcher/useDateSwitcherFunc'
import { colType } from '@cm/types/col-types'
import { FitMargin } from '@cm/components/styles/common-components/common-components'
import useWindowSize from '@cm/hooks/useWindowSize'

// 定数
const MOBILE_BREAKPOINT = 600
const CONTROL_WIDTH = { desktop: 190, mobile: 145 } as const
const CONTROL_FONT_SIZE = 14

interface NewDateSwitcherProps {
  yearOnly?: boolean
  monthOnly?: boolean
  selectPeriod?: boolean
  selectMonth?: boolean
  additionalCols?: colType[]
}

const NewDateSwitcher = (props: NewDateSwitcherProps) => {
  const { query, setglobalLoaderAtom } = useGlobal()
  const { width } = useWindowSize()

  const {
    FormHook: { BasicForm, ReactHookForm, latestFormData },
    from,
    to,
  } = useDateSwitcherFunc(props)

  // レスポンシブ対応のControlOptionsをメモ化
  const controlOptions = useMemo(
    () => ({
      ControlStyle: {
        width: width > MOBILE_BREAKPOINT ? CONTROL_WIDTH.desktop : CONTROL_WIDTH.mobile,
        fontSize: CONTROL_FONT_SIZE,
      },
    }),
    [width]
  )

  // queryの変更時にフォーム値を更新し、ローダーを終了
  useEffect(() => {
    if (from && ReactHookForm.getValues('from') !== from) {
      ReactHookForm.setValue('from', from)
    }
    if (to && ReactHookForm.getValues('to') !== to) {
      ReactHookForm.setValue('to', to)
    }



  }, [query]) // from, to, ReactHookForm, setglobalLoaderAtomは意図的に除外（query変更時のみ実行）

  return (
    <FitMargin>
      <BasicForm latestFormData={latestFormData} alignMode="row" ControlOptions={controlOptions} />
    </FitMargin>
  )
}

export default NewDateSwitcher
