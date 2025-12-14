'use client'

import { UserColBuilder } from './UserColBuilder'
import { getVehicleForSelectConfig, TbmVehicleColBuilder } from './TbmVehicleColBuilder'
import { TbmBaseColBuilder } from './TbmBaseColBuilder'
import { TbmRouteGroupColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/TbmRouteGroupColBuilder'

import { TbmOperationGroupColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/TbmOperationGroupColBuilder'
import { TbmRefuelHistoryColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/TbmRefuelHistoryColBuilder'
import { TbmDriveScheduleBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/TbmDriveScheduleBuilder'
import { tbmOperationBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/tbmOperationBuilder'
import { tbmMonthlyConfigForRouteGroupBuilder, tbmMonthlyTollConfigBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/tbmMonthlyConfigForRouteGroupBuilder'
import { columnGetterType } from '@cm/types/types'
import { Fields } from '@cm/class/Fields/Fields'
import { defaultRegister } from '@cm/class/builders/ColBuilderVariables'
import { tbmProductColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/tbmProductColBuilder'
import { odometerInputColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/odometerInputColBuilder'
import { tbmCustomerColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/tbmCustomerColBuilder'
import { getMidnight } from '@cm/class/Days/date-utils/calculations'

import { tbmVehicleMaintananceRecordColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/tbmVehicleMaintananceRecordColBuilder'
import { TbmBillingAddressColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/TbmBillingAddressColBuilder'
import { TbmFuelCardColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/TbmFuelCardColBuilder'
import { TbmRelatedRouteGroupColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/TbmRelatedRouteGroupColBuilder'
import { R_Stack } from '@cm/components/styles/common-components/common-components'

export class ColBuilder {
  static user = UserColBuilder
  static tbmVehicle = TbmVehicleColBuilder
  static tbmBase = TbmBaseColBuilder
  static tbmRouteGroup = TbmRouteGroupColBuilder
  static tbmBillingAddress = TbmBillingAddressColBuilder
  static tbmOperationGroup = TbmOperationGroupColBuilder
  static tbmRefuelHistory = TbmRefuelHistoryColBuilder
  static tbmDriveSchedule = TbmDriveScheduleBuilder
  static tbmOperation = tbmOperationBuilder
  static tbmMonthlyConfigForRouteGroup = tbmMonthlyConfigForRouteGroupBuilder
  static tbmMonthlyTollConfig = tbmMonthlyTollConfigBuilder
  static tbmProduct = tbmProductColBuilder
  static odometerInput = odometerInputColBuilder
  static tbmCustomer = tbmCustomerColBuilder
  static tbmVehicleMaintenanceRecord = tbmVehicleMaintananceRecordColBuilder
  static tbmKeihi = (props: columnGetterType) => {
    const { tbmBaseId } = props.ColBuilderExtraProps ?? {}
    return new Fields([
      { id: 'tbmBaseId', label: '営業所', forSelect: {}, form: { defaultValue: tbmBaseId, disabled: tbmBaseId } },
      { id: 'item', label: '項目', type: 'text', form: { ...defaultRegister } },
      { id: 'amount', label: '金額', type: 'float', form: { ...defaultRegister } },
      { id: 'date', label: '日付', type: 'date', form: { ...defaultRegister, defaultValue: getMidnight() } },
      { id: 'remark', label: '備考', type: 'textarea', form: {} },
    ]).transposeColumns()
  }
  static tbmDriveScheduleImage = (props: columnGetterType) => {
    return new Fields([
      {
        id: 'imageUrl',
        label: '画像',
        form: {},
        type: 'file',
      },
    ]).transposeColumns()
  }
  static tbmEtcMeisai = (props: columnGetterType) => {
    const { tbmBaseId } = props.ColBuilderExtraProps ?? {}
    return new Fields([
      { id: 'frameNo', label: '車両', forSelect: {}, form: { defaultValue: tbmBaseId, disabled: tbmBaseId } },
      { id: 'month', label: '年月', type: 'month' },
      { id: 'groupIndex', label: '連判', type: 'int' },
      {
        id: 'info',
        label: 'ETC利用明細',
        type: 'json',
        format: (value, row) => {
          return row[`info`].map((json, i) => {
            const { fromDatetime, toDatetime, fromIc, toIc, toll, discount, sum } = JSON.parse(json)
            return (
              <R_Stack key={i}>
                <div>{fromDatetime}</div>
                <div>{toDatetime}</div>
                <div>{fromIc}</div>
                <div>{toIc}</div>
                <div>{toll}</div>
                <div>{discount}</div>
                <div>{sum}</div>
              </R_Stack>
            )
          })
        },
      },
      { id: 'sum', label: '合計', type: 'float' },
    ])
      .customAttributes(({ col }) => ({
        ...col,
        form: {
          ...col.form,
          ...defaultRegister,
        },
      }))
      .transposeColumns()
  }
  static TbmFuelCard = TbmFuelCardColBuilder
  static tbmRelatedRouteGroup = TbmRelatedRouteGroupColBuilder
  static tbmBase_MonthConfig = (props: columnGetterType) => {
    const { tbmBaseId } = props.ColBuilderExtraProps ?? {}
    return new Fields([
      { id: 'tbmBaseId', label: '営業所', forSelect: {}, form: { defaultValue: tbmBaseId, disabled: tbmBaseId } },
      { id: 'yearMonth', label: '年月', type: 'month' },
      { id: 'keiyuPerLiter', label: '軽油単価', type: 'float' },
      { id: 'gasolinePerLiter', label: 'ガソリン単価', type: 'float' },
    ])
      .customAttributes(({ col }) => ({
        ...col,
        form: {
          ...col.form,
          ...defaultRegister,
        },
      }))
      .transposeColumns()
  }
  static tbmCarWashHistory = (props: columnGetterType) => {
    const { session } = props.useGlobalProps
    const userId = session?.id
    const { tbmVehicleId } = props.ColBuilderExtraProps ?? {}

    return new Fields([
      {
        id: 'tbmVehicleId',
        label: '車両',
        form: {
          ...defaultRegister,
          defaultValue: tbmVehicleId,
          disabled: tbmVehicleId ? true : false,
        },
        forSelect: { config: getVehicleForSelectConfig({}) },
      },
      {
        id: 'date',
        label: '日付',
        form: {
          ...defaultRegister,
          defaultValue: getMidnight(),
        },
        type: `date`,
      },

      {
        id: 'userId',
        label: 'ドライバ',
        forSelect: {},
        form: {
          defaultValue: userId,
          disabled: !!userId,
        },
      },
      {
        id: 'price',
        label: '料金',
        form: { defaultValue: null, ...defaultRegister },
        type: `price`,
      },
    ]).transposeColumns()
  }
  static tbmRouteGroupFee = (props: columnGetterType) => {
    const { session } = props.useGlobalProps
    const userId = session?.id
    const { tbmVehicleId } = props.ColBuilderExtraProps ?? {}

    return new Fields([
      {
        id: 'startDate',
        label: '開始日',
        form: { ...defaultRegister },
        type: `date`,
      },

      {
        id: 'futaiFee',
        label: `付帯費用`,
        form: { ...defaultRegister },
        type: `price`,
      },
      {
        id: 'driverFee',
        label: '運賃',
        form: { ...defaultRegister },
        type: `price`,
      },
    ]).transposeColumns()
  }
}
