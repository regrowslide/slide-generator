import {eigyoshoRecordKey, fetchEigyoshoUriageData} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchEigyoshoUriageData'

import {carHistoryKey, fetchRuisekiKyoriKichoData} from '@app/(apps)/tbm/(server-actions)/fetchRuisekiKyoriKichoData'

import {fetchUnkoMeisaiData, DriveScheduleData} from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import {unkoMeisaiKey} from '@app/(apps)/tbm/(class)/TbmReportCl/cols/createUnkoMeisaiRow'
type userSchedule = Awaited<ReturnType<typeof fetchUnkoMeisaiData>>['monthlyTbmDriveList']

export const MEIAI_SUM_ORIGIN = (userSchedule: userSchedule, dataKey: unkoMeisaiKey) => {
  return userSchedule.reduce((acc, cur) => {
    const value = cur.keyValue?.[dataKey]?.cellValue
    return acc + (Number(value) ?? 0)
  }, 0)
}

type userWithCarHistory = Awaited<ReturnType<typeof fetchRuisekiKyoriKichoData>>

export const RUISEKI_SUM_ORIGIN = (userWithCarHistory: userWithCarHistory, dataKey: carHistoryKey) => {
  return userWithCarHistory.reduce((acc, obj) => {
    const value = obj.allCars.reduce((acc, cur) => {
      return acc + (cur[dataKey] ?? 0)
    }, 0)

    return acc + (Number(value) ?? 0)
  }, 0)
}

type MyEigyoshoUriageRecord = Awaited<ReturnType<typeof fetchEigyoshoUriageData>>['EigyoshoUriageRecords']
export const EIGYOSHO_URIAGE_SUMORIGIN = (MyEigyoshoUriageRecord: MyEigyoshoUriageRecord, dataKey: eigyoshoRecordKey) => {
  return MyEigyoshoUriageRecord.reduce((acc, cur) => {
    const sum = Object.keys(cur.keyValue).reduce((acc, key) => {
      const theKey = (dataKey || '') as any
      return acc + (cur.keyValue[theKey]?.cellValue ?? 0)
    }, 0)

    return acc + (Number(sum) ?? 0)
  }, 0)
}

// --- 売上合計額の統一計算関数 ---

const TAX_RATE = 0.1

// 運行日に適用される料金を取得する
export const getFeeOnDate = (schedule: DriveScheduleData) => {
  return schedule.TbmRouteGroup.TbmRouteGroupFee
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
    .find(fee => fee.startDate <= schedule.date)
}

// 便グループ内のスケジュール一覧から売上（税抜）を計算する
export const calculateRouteGroupSales = (schedules: DriveScheduleData[]) => {
  // 運賃+付帯（税抜）
  const driverFeeTotal = schedules.reduce((sum, s) => {
    const fee = getFeeOnDate(s)
    return sum + (fee?.driverFee || 0) + (fee?.futaiFee || 0)
  }, 0)

  // 通行料（税抜）: 月間設定がある場合はそれを使用、なければ実績値合計
  const config = schedules[0]?.TbmRouteGroup.TbmMonthlyConfigForRouteGroup?.[0]
  const monthlyToll = (config?.monthlyTollTotal || 0) + (config?.tsukoryoSeikyuGaku || 0)
  const tollInclTax = monthlyToll > 0
    ? monthlyToll
    : schedules.reduce((sum, s) =>
        sum + (s.M_postalHighwayFee || 0) + (s.O_generalHighwayFee || 0), 0)
  const tollExclTax = Math.round(tollInclTax / (1 + TAX_RATE))

  return { driverFeeTotal, tollExclTax, totalExclTax: driverFeeTotal + tollExclTax }
}

// スケジュール一覧を便グループでグループ化して売上合計+消費税を計算する
export const calculateSalesBySchedules = (schedules: DriveScheduleData[]) => {
  // 便グループごとにグループ化
  const byRouteGroup = new Map<number, DriveScheduleData[]>()
  for (const s of schedules) {
    const id = s.TbmRouteGroup.id
    if (!byRouteGroup.has(id)) byRouteGroup.set(id, [])
    byRouteGroup.get(id)!.push(s)
  }

  let driverFeeTotal = 0
  let tollExclTax = 0
  for (const [, group] of byRouteGroup) {
    const result = calculateRouteGroupSales(group)
    driverFeeTotal += result.driverFeeTotal
    tollExclTax += result.tollExclTax
  }

  const totalExclTax = driverFeeTotal + tollExclTax
  const taxAmount = Math.floor(totalExclTax * TAX_RATE)
  return { driverFeeTotal, tollExclTax, totalExclTax, taxAmount, grandTotal: totalExclTax + taxAmount }
}
