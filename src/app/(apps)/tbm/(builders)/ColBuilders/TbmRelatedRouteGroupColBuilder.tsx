'use client'
import { RouteGroupCl } from '@app/(apps)/tbm/(class)/RouteGroupCl'
import { defaultRegister } from '@cm/class/builders/ColBuilderVariables'
import { Fields } from '@cm/class/Fields/Fields'
import { columnGetterType } from '@cm/types/types'

export const TbmRelatedRouteGroupColBuilder = (props: columnGetterType) => {
  const { tbmBaseId } = props.ColBuilderExtraProps ?? {}

  return new Fields([
    {
      id: 'childRouteGroupId',
      label: '関連便',
      forSelect: {
        config: RouteGroupCl.getRouteGroupForSelectConfig({ tbmBaseId }),
      },
      form: {
        ...defaultRegister,
      },
      format: (val, row) => {
        return <div>
          {[
            row?.childRouteGroup?.routeName,
            row?.childRouteGroup?.name,
          ].join(' / ')}

        </div>

      },
    },
    {
      id: 'daysOffset',
      label: 'N日後',
      type: 'number',
      form: {
        ...defaultRegister,
        defaultValue: 1,
      },
      inputProps: {
        min: -30,
        max: 30,
        style: { width: 80 },
      },
      format: (val) => {
        if (val === 0) return '同日'
        if (val > 0) return `${val}日後`
        return `${Math.abs(val)}日前`
      },
    },
  ]).transposeColumns()
}
