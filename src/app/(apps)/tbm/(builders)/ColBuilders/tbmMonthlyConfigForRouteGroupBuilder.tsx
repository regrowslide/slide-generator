'use client'

import TbmRouteCl, { TbmRouteData } from '@app/(apps)/tbm/(class)/TbmRouteCl'
import useUnchinChildCreator from '@app/(apps)/tbm/(globalHooks)/useUnchinChildCreator'
import { defaultRegister } from '@cm/class/builders/ColBuilderVariables'
import { NumHandler } from '@cm/class/NumHandler'
import { Fields } from '@cm/class/Fields/Fields'
import { columnGetterType } from '@cm/types/types'
import { KeyValue } from '@cm/components/styles/common-components/ParameterCard'

export const tbmMonthlyConfigForRouteGroupBuilder = (props: columnGetterType) => {
  const HK_UnchinChildCreator = useUnchinChildCreator()

  return new Fields([
    {
      id: 'seikyuKaisu',
      label: '請求回数\n(チェック用)',
      type: 'number',
      td: { style: { width: 100 } },
    },
    {
      id: 'tsukoryoSeikyuGaku',
      label: '月間通行料\n合計(郵便)',
      type: 'number',
      td: { style: { width: 120 } },
    },

    {
      id: 'generalFee',
      label: '通行料\n(一般/1便)',
      type: 'number',
      td: { style: { width: 100 } },
    },

    {
      id: 'monthlyTollTotal',
      label: '月間通行料\n合計(一般)',
      type: 'number',
      td: { style: { width: 120 } },
    },

    {
      id: 'postalFee',
      label: `その他情報`,
      type: 'number',

      form: { hidden: true },
      format: (value, row: TbmRouteData) => {
        const { TbmDriveSchedule, TbmMonthlyConfigForRouteGroup } = row
        const monthConfig = TbmMonthlyConfigForRouteGroup?.[0]
        const TbmRouteInst = new TbmRouteCl(row)
        const { jitsudoKaisu } = TbmRouteInst.getMonthlyData(monthConfig?.yearMonth)

        const latestTbmRouteGroupFee = row.TbmRouteGroupFee[0]
        const { futaiFee = 0, driverFee = 0 } = latestTbmRouteGroupFee ?? {}

        // 月間通行料合計額から1便あたりの通行料を計算（設定されている場合）
        const postalTollTotal = monthConfig?.tsukoryoSeikyuGaku
        const postalTollPerTrip = postalTollTotal && jitsudoKaisu > 0
          ? Math.round(postalTollTotal / jitsudoKaisu)
          : null

        const generalTollTotal = monthConfig?.monthlyTollTotal
        const generalTollPerTrip = generalTollTotal && jitsudoKaisu > 0
          ? Math.round(generalTollTotal / jitsudoKaisu)
          : null

        return (
          <div style={{ width: 320 }} className={`grid grid-cols-2 gap-1`}>
            <KeyValue {...{ label: '運賃' }}>{NumHandler.WithUnit(driverFee ?? 0, '')}</KeyValue>
            <KeyValue {...{ label: '実働回数' }}>{jitsudoKaisu}</KeyValue>
            <KeyValue {...{ label: '付帯作業' }}>{NumHandler.WithUnit(futaiFee ?? 0, '')}</KeyValue>
            {postalTollPerTrip !== null && (
              <KeyValue {...{ label: '1便通行料(郵便)' }}>{NumHandler.WithUnit(postalTollPerTrip, '')}</KeyValue>
            )}
            {generalTollPerTrip !== null && (
              <KeyValue {...{ label: '1便通行料(一般)' }}>{NumHandler.WithUnit(generalTollPerTrip, '')}</KeyValue>
            )}
          </div>
        )
      },
    },
  ])
    .customAttributes(({ col }) => ({ ...col, form: { ...defaultRegister } }))
    .transposeColumns()
}

// 便詳細ページの月別通行料合計タブ用のビルダー
export const tbmMonthlyTollConfigBuilder = (props: columnGetterType) => {
  const { tbmRouteGroupId } = props.ColBuilderExtraProps ?? {}

  return new Fields([

    {
      id: 'yearMonth',
      label: '対象月',
      type: 'month',
      form: { ...defaultRegister },
    },
    {
      id: 'tsukoryoSeikyuGaku',
      label: '月間通行料合計\n(郵便)',
      type: 'number',
      form: { ...defaultRegister },
      td: { style: { width: 180 } },
    },
    {
      id: 'monthlyTollTotal',
      label: '月間通行料合計\n(一般)',
      type: 'number',
      form: { ...defaultRegister },
      td: { style: { width: 180 } },
    },
    //
  ])
    .customAttributes(({ col }) => ({ ...col }))
    .transposeColumns()
}
