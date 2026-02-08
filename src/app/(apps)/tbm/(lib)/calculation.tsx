import { eigyoshoRecordKey, fetchEigyoshoUriageData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchEigyoshoUriageData'

import { carHistoryKey, fetchRuisekiKyoriKichoData } from '@app/(apps)/tbm/(server-actions)/fetchRuisekiKyoriKichoData'

import { fetchUnkoMeisaiData, DriveScheduleData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { unkoMeisaiKey } from '@app/(apps)/tbm/(class)/TbmReportCl/cols/createUnkoMeisaiRow'
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

export const TAX_RATE = 0.1

// 便グループ単位の売上計算結果（構成要素を個別に保持）
export type RouteGroupSalesResult = {
  // 運賃（税抜）— 個別に拾える
  driverFee: number
  futaiFee: number
  driverFeeTotal: number // = driverFee + futaiFee

  // 通行料 — 個別に拾える
  postalTollInclTax: number  // 郵便通行料（税込）月間設定 or 実績
  generalTollInclTax: number // 一般通行料（税込）月間設定 or 実績
  tollInclTax: number        // = postalTollInclTax + generalTollInclTax
  tollExclTax: number        // = Math.round(tollInclTax / 1.1)

  // 高速代（ETC実績）— 個別に拾える
  postalHighwayFee: number   // sum of M_postalHighwayFee
  generalHighwayFee: number  // sum of O_generalHighwayFee
  totalHighwayFee: number    // = postalHighwayFee + generalHighwayFee

  // 合計
  totalExclTax: number // = driverFeeTotal + tollExclTax
}

// スケジュール一覧の売上計算結果（消費税含む）
export type SchedulesSalesResult = RouteGroupSalesResult & {
  taxAmount: number  // = Math.floor(totalExclTax * 0.1)
  grandTotal: number // = totalExclTax + taxAmount
}

// 運行日に適用される料金を取得する
export const getFeeOnDate = (schedule: DriveScheduleData) => {



  return schedule.TbmRouteGroup.TbmRouteGroupFee
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
    .find(fee => {

      return fee.startDate <= schedule.date
    })
}

// 便グループ内のスケジュール一覧から売上（税抜）を計算する
export const calculateRouteGroupSales = (schedules: DriveScheduleData[]): RouteGroupSalesResult => {
  // 運賃と付帯を個別に集計
  let driverFee = 0
  let futaiFee = 0
  for (const s of schedules) {
    const fee = getFeeOnDate(s)
    driverFee += fee?.driverFee || 0
    futaiFee += fee?.futaiFee || 0
  }
  const driverFeeTotal = driverFee + futaiFee

  // 高速代（ETC実績）を個別に集計
  let postalHighwayFee = 0
  let generalHighwayFee = 0
  for (const s of schedules) {
    postalHighwayFee += s.M_postalHighwayFee || 0
    generalHighwayFee += s.O_generalHighwayFee || 0
  }
  const totalHighwayFee = postalHighwayFee + generalHighwayFee

  // 通行料（税込）: 月間設定がある場合はそれを使用、なければ実績値合計
  const config = schedules[0]?.TbmRouteGroup.TbmMonthlyConfigForRouteGroup?.[0]
  const hasMonthlyConfig = (config?.monthlyTollTotal || 0) + (config?.tsukoryoSeikyuGaku || 0) > 0

  let postalTollInclTax: number
  let generalTollInclTax: number
  if (hasMonthlyConfig) {
    postalTollInclTax = config?.tsukoryoSeikyuGaku || 0
    generalTollInclTax = config?.monthlyTollTotal || 0
  } else {
    postalTollInclTax = postalHighwayFee
    generalTollInclTax = generalHighwayFee
  }

  const tollInclTax = postalTollInclTax + generalTollInclTax
  const tollExclTax = Math.round(tollInclTax / (1 + TAX_RATE))

  const totalExclTax = driverFeeTotal + tollExclTax

  return {
    driverFee,
    futaiFee,
    driverFeeTotal,
    postalTollInclTax,
    generalTollInclTax,
    tollInclTax,
    tollExclTax,
    postalHighwayFee,
    generalHighwayFee,
    totalHighwayFee,
    totalExclTax,
  }
}

// スケジュール一覧を便グループでグループ化して売上合計+消費税を計算する
export const calculateSalesBySchedules = (schedules: DriveScheduleData[]): SchedulesSalesResult => {
  // 便グループごとにグループ化
  const byRouteGroup = new Map<number, DriveScheduleData[]>()
  for (const s of schedules) {
    const id = s.TbmRouteGroup.id
    if (!byRouteGroup.has(id)) byRouteGroup.set(id, [])
    byRouteGroup.get(id)!.push(s)
  }

  // 各便グループの売上を合算
  let driverFee = 0
  let futaiFee = 0
  let driverFeeTotal = 0
  let postalTollInclTax = 0
  let generalTollInclTax = 0
  let tollInclTax = 0
  let tollExclTax = 0
  let postalHighwayFee = 0
  let generalHighwayFee = 0
  let totalHighwayFee = 0
  let totalExclTax = 0

  for (const [, group] of byRouteGroup) {
    const result = calculateRouteGroupSales(group)
    driverFee += result.driverFee
    futaiFee += result.futaiFee
    driverFeeTotal += result.driverFeeTotal
    postalTollInclTax += result.postalTollInclTax
    generalTollInclTax += result.generalTollInclTax
    tollInclTax += result.tollInclTax
    tollExclTax += result.tollExclTax
    postalHighwayFee += result.postalHighwayFee
    generalHighwayFee += result.generalHighwayFee
    totalHighwayFee += result.totalHighwayFee
    totalExclTax += result.totalExclTax
  }

  const taxAmount = Math.floor(totalExclTax * TAX_RATE)

  return {
    driverFee,
    futaiFee,
    driverFeeTotal,
    postalTollInclTax,
    generalTollInclTax,
    tollInclTax,
    tollExclTax,
    postalHighwayFee,
    generalHighwayFee,
    totalHighwayFee,
    totalExclTax,
    taxAmount,
    grandTotal: totalExclTax + taxAmount,
  }
}
