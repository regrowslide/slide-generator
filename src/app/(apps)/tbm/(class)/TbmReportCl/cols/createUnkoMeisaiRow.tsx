import { DriveScheduleData, tbmTableKeyValue } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { BillingHandler } from '@app/(apps)/tbm/(class)/TimeHandler'
import { NumHandler } from '@cm/class/NumHandler'

export type unkoMeisaiKey =
  | `date`
  // | `routeCode`
  | `name`
  | `routeName`
  | `vehicleType`
  | `productName`
  // | `customerCode`
  | `customerName`
  // | `vehicleTypeCode`
  | `plateNumber`
  // | `driverCode`
  | `driverName`
  | `L_postalFee`
  | `M_postalHighwayFee`
  | `N_generalFee`
  | `O_generalHighwayFee`
  | `P_KosokuShiyodai`
  | `Q_driverFee`
  | `Q_futaiFee`
  | `R_JomuinUnchin`
  | `S_jomuinFutan`
  | `T_thirteenPercentOfPostalHighway`
  | `U_general`
  | `V_highwayExcess`
// | `W_remarks`
// | `X_orderNumber`

export type unkoMeisaiKeyValue = {
  [key in unkoMeisaiKey]: tbmTableKeyValue
}

export const createUnkoMeisaiRow = (schedule: DriveScheduleData, jitsudoKaisu: number = 1) => {
  const ConfigForRoute = schedule.TbmRouteGroup.TbmMonthlyConfigForRouteGroup.find(
    config => config.tbmRouteGroupId === schedule.TbmRouteGroup.id
  )



  const feeOnDate = schedule.TbmRouteGroup.TbmRouteGroupFee.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()).find(
    fee => fee.startDate <= schedule.date
  )

  // const Q_driverFee = (feeOnDate?.driverFee ?? 0) + (feeOnDate?.futaiFee ?? 0)

  const taxRate = 0.1 // 消費税率10%
  const L_postalFee = ((ConfigForRoute?.tsukoryoSeikyuGaku ?? 0) / jitsudoKaisu) * (1 + taxRate)
  const M_postalHighwayFee = schedule.M_postalHighwayFee ?? 0

  // 月間通行料合計額が設定されている場合は自動計算、そうでなければ従来の1便あたり設定値を使用



  const name = schedule.TbmRouteGroup.name

  const N_generalFee = ConfigForRoute?.monthlyTollTotal
    ? ConfigForRoute.monthlyTollTotal / jitsudoKaisu
    : ConfigForRoute?.generalFee ?? 0
  const O_generalHighwayFee = schedule.O_generalHighwayFee ?? 0

  // if (name === 'ゆパ上下二') {
  //   console.log({
  //     tsukoryoSeikyuGaku: ConfigForRoute?.tsukoryoSeikyuGaku,
  //     jitsudoKaisu: jitsudoKaisu,
  //   })
  // }


  const T_thirteenPercentOfPostalHighway = M_postalHighwayFee * 0.3
  const S_jomuinFutan = M_postalHighwayFee - (L_postalFee + T_thirteenPercentOfPostalHighway)
  const U_general = O_generalHighwayFee - N_generalFee

  const R_JomuinUnchin = (feeOnDate?.driverFee ?? 0) + (feeOnDate?.futaiFee ?? 0) - (T_thirteenPercentOfPostalHighway + U_general)

  const Customer = schedule.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer

  // 運行明細ページでは、出発時刻が2400以降の場合は翌日に表示
  const displayDate = BillingHandler.getDisplayDate(
    schedule.date,
    schedule.TbmRouteGroup.departureTime
  )

  const keyValue: unkoMeisaiKeyValue = {
    date: {
      type: 'date',
      label: 'A運行日',
      cellValue: displayDate,
    },
    // routeCode: {
    //   label: 'B便CD',
    //   cellValue: schedule.TbmRouteGroup.code,
    // },
    routeName: {
      label: '路線名',
      cellValue: schedule.TbmRouteGroup.routeName,
      style: { minWidth: 160 },
    },
    name: {
      label: 'C便名',
      cellValue: schedule.TbmRouteGroup.name,
      style: { minWidth: 160 },
    },
    vehicleType: {
      label: 'D車種',
      cellValue: schedule.TbmVehicle?.type,
    },

    productName: {
      label: 'E品名',
      cellValue: schedule.TbmRouteGroup.productName,
    },
    // customerCode: {
    //   label: 'F取引先CD',
    //   cellValue: Customer?.code,
    // },
    customerName: {
      label: 'G取引先',
      cellValue: Customer?.name,
    },
    // vehicleTypeCode: {
    //   label: '車種CD',
    //   cellValue: 'コード',
    // },
    plateNumber: {
      label: 'I車番',
      cellValue: schedule.TbmVehicle?.vehicleNumber,
    },
    // driverCode: {
    //   label: '運転手CD',
    //   cellValue: 'コード',
    // },
    driverName: {
      label: 'K運転手',
      cellValue: schedule.User?.name,
    },
    L_postalFee: {
      label: (
        <div>
          <div>L通行料</div> <div>(郵便)</div>
        </div>
      ),
      cellValue: NumHandler.round(L_postalFee, 1),
      style: { backgroundColor: '#fcdede' },
    },
    M_postalHighwayFee: {
      label: (
        <div>
          <div>M有料利用料</div> <div>(郵便)</div>
        </div>
      ),
      cellValue: NumHandler.round(M_postalHighwayFee, 1),
      style: { backgroundColor: '#fcdede' },
    },
    N_generalFee: {
      label: (
        <div>
          <div>N通行料</div> <div>(一般)</div>
        </div>
      ),
      cellValue: NumHandler.round(N_generalFee, 1),
      style: { backgroundColor: '#deebfc' },
    },
    O_generalHighwayFee: {
      label: (
        <div>
          <div>O有料利用料</div> <div>(一般)</div>
        </div>
      ),
      cellValue: O_generalHighwayFee,
      style: { backgroundColor: '#deebfc' },
    },
    P_KosokuShiyodai: {
      label: 'P高速使用代',
      cellValue: NumHandler.round(S_jomuinFutan, 1),
    },
    Q_driverFee: {
      label: 'Q運賃',
      cellValue: feeOnDate?.driverFee ?? 0,
    },
    Q_futaiFee: {
      label: 'Q付帯作業',
      cellValue: feeOnDate?.futaiFee ?? 0,
    },
    R_JomuinUnchin: {
      label: 'R給与算定運賃',
      cellValue: NumHandler.round(R_JomuinUnchin, 1),
      style: {
        minWidth: 100,
        backgroundColor: '#defceb',
      },
    },
    S_jomuinFutan: {
      label: (
        <div>
          <div>S乗務員負担</div> <div>高速代-(通行料+30％)</div>
        </div>
      ),
      cellValue: NumHandler.round(S_jomuinFutan, 1),
      style: { backgroundColor: '#defceb' },
    },
    T_thirteenPercentOfPostalHighway: {
      label: (
        <div>
          <div>T運賃から負担</div> <div>高速代の30％</div>
        </div>
      ),
      cellValue: NumHandler.round(T_thirteenPercentOfPostalHighway, 1),
    },
    U_general: {
      label: 'U高速代-通行料',
      cellValue: NumHandler.round(U_general, 1),
      style: { backgroundColor: '#9ec1ff' },
    },
    V_highwayExcess: {
      label: 'V高速超過額',
      cellValue: 0,
    },
    // W_remarks: {
    //   label: 'W備考',
    //   cellValue: '要検討',
    // },
    // X_orderNumber: {
    //   label: 'X発注書NO',
    //   cellValue: '要検討',
    // },
  }

  Object.keys(keyValue).forEach(key => {
    keyValue[key].style = { minWidth: 90, fontSize: 12, ...keyValue[key].style }
  })
  return keyValue
}
