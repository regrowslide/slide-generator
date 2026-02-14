'use client'
import {getVehicleForSelectConfig} from '@app/(apps)/tbm/(builders)/ColBuilders/TbmVehicleColBuilder'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'

export const odometerInputColBuilder = (props: columnGetterType) => {
  const {date, tbmVehicleId, tbmDriveScheduleId, lastOdometerStart = 0, lastOdometerEnd = 0} =
    props.ColBuilderExtraProps ?? {}
  const {session} = props.useGlobalProps
  const userId = session?.id
  return new Fields([
    {
      id: 'date',
      label: '日付',
      type: 'date',
      form: {
        defaultValue: date,
        disabled: date,
      },
    },
    {
      id: 'tbmVehicleId',
      label: '車両',
      forSelect: {config: getVehicleForSelectConfig({})},
      form: {
        defaultValue: tbmVehicleId,
        disabled: tbmVehicleId,
      },
    },
    {
      id: 'tbmDriveScheduleId',
      label: 'スケジュールID',
      form: {
        defaultValue: tbmDriveScheduleId,
        hidden: true,
      },
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
      id: 'odometerStart',
      label: '乗車時オドメータ(km)',
      form: {
        // register: {
        //   validate: (value, formValues) => {
        //     const min = lastOdometerEnd
        //     return formValues[`odometerStart`] >= min ? true : `前回登録時(${min}km)以上を入力してください。`
        //   },
        // },
      },
      type: `float`,
    },
    {
      id: 'odometerEnd',
      label: '降車時オドメータ(km)',
      form: {
        // register: {
        //   validate: (value, formValues) => {
        //     if (formValues[`odometerStart`] && formValues[`odometerEnd`] !== 0) {
        //       const min = formValues[`odometerStart`]
        //       return formValues[`odometerEnd`] >= min ? true : `乗車時(${min}km)以上を入力してください。`
        //     }
        //     return true
        //   },
        // },
      },
      type: `float`,
    },
    {
      id: '区間距離',
      label: '区間距離',
      format: (val, row) => {
        return row.odometerEnd - row.odometerStart
      },
    },
  ]).transposeColumns()
}
