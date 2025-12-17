import { UnkoBinKyuyoDriveScheduleData, UnkoBinKyuyoKeyValue } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoBinKyuyoData'
import { getStandardSalaryOnDate } from '@app/(apps)/tbm/(class)/TbmReportCl/helpers/getStandardSalaryOnDate'

export type UnkoBinKyuyoKey =
  | 'date'
  | 'routeCode'
  | 'routeName'
  | 'binName'
  | 'vehicleNumber'
  | 'vehicleType'
  | 'driverCode'
  | 'driverName'
  | 'standardSalary'
  | 'driverFee'
  | 'futaiFee'
  | 'customerName'

/**
 * 運行便給与レポートの行を生成する
 */
export const createUnkoBinKyuyoRow = (schedule: UnkoBinKyuyoDriveScheduleData): UnkoBinKyuyoKeyValue => {
  // 運行日の時点で有効な運賃・付帯作業を取得
  const feeOnDate = schedule.TbmRouteGroup.TbmRouteGroupFee.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()).find(
    fee => fee.startDate <= schedule.date
  )

  // 運行日の時点で有効な標準給料を取得
  const standardSalaryRecord = getStandardSalaryOnDate(
    schedule.TbmRouteGroup.TbmRouteGroupStandardSalary,
    schedule.date
  )

  const Customer = schedule.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer

  const keyValue: UnkoBinKyuyoKeyValue = {
    date: {
      type: 'date',
      label: '運行日',
      cellValue: schedule.date,
      style: { minWidth: 100 },
    },
    routeCode: {
      label: '便CD',
      cellValue: schedule.TbmRouteGroup.code,
      style: { minWidth: 80 },
    },
    routeName: {
      label: '路線名',
      cellValue: schedule.TbmRouteGroup.routeName,
      style: { minWidth: 140 },
    },
    binName: {
      label: '便名',
      cellValue: schedule.TbmRouteGroup.name,
      style: { minWidth: 140 },
    },
    vehicleNumber: {
      label: '車番',
      cellValue: schedule.TbmVehicle?.vehicleNumber,
      style: { minWidth: 100 },
    },
    vehicleType: {
      label: '車種',
      cellValue: schedule.TbmVehicle?.type,
      style: { minWidth: 80 },
    },
    driverCode: {
      label: '乗務員CD',
      cellValue: schedule.User?.code,
      style: { minWidth: 80 },
    },
    driverName: {
      label: '乗務員名',
      cellValue: schedule.User?.name,
      style: { minWidth: 100 },
    },
    standardSalary: {
      label: '標準給料',
      cellValue: standardSalaryRecord?.salary ?? null,
      style: { minWidth: 100, backgroundColor: '#e8f5e9' },
    },
    driverFee: {
      label: '運賃',
      cellValue: feeOnDate?.driverFee ?? null,
      style: { minWidth: 80, backgroundColor: '#e8f5e9' },
    },
    futaiFee: {
      label: '付帯作業',
      cellValue: feeOnDate?.futaiFee ?? null,
      style: { minWidth: 80, backgroundColor: '#e8f5e9' },
    },
    customerName: {
      label: '取引先',
      cellValue: Customer?.name,
      style: { minWidth: 120 },
    },
  }

  return keyValue
}
