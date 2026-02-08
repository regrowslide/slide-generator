'use server'

import { DriveScheduleData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { TimeHandler } from '@app/(apps)/tbm/(class)/TimeHandler'
import { getFilteredSchedulesByMonth } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/shared/getFilteredSchedules'

export type MeisaiRow = {
 date: Date // 運行日
 routeName: string | null // 路線名
 serviceName: string // 便名
 vehicleNumber: string | null // 車番
 driver: string | null // 運転手
 fare: number // 運賃
 futaiFee: number // 付帯費用
 remark: string | null // 備考
 departureTime: string | null // 出発時刻
 finalArrivalTime: string | null // 到着時刻
}

export type MeisaiData = {
 yearMonth: Date
 rows: MeisaiRow[]
 customerName: string
}

export const getMeisaiData = async ({
 whereQuery,
 customerId,
 driveScheduleList: providedDriveScheduleList,
}: {
 whereQuery: { gte: Date; lte: Date }
 customerId: number
 driveScheduleList?: DriveScheduleData[] // オプション: 既に取得済みのデータを再利用
}): Promise<MeisaiData> => {
 // 共通フィルタで対象月のスケジュールを取得（day-1 + BillingHandler処理は内部で実行）
 const monthFilteredSchedules = await getFilteredSchedulesByMonth({
  targetMonth: whereQuery.gte,
  whereQuery,
  providedScheduleList: providedDriveScheduleList,
 })

 // 指定された顧客の便のみをフィルタリング
 const filteredSchedules = monthFilteredSchedules.filter(schedule => {
  return schedule.TbmRouteGroup.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.id === customerId
 })

 // 運行日でソート
 const sortedSchedules = filteredSchedules.sort((a, b) => {
  const dateCompare = a.date.getTime() - b.date.getTime()
  if (dateCompare !== 0) return dateCompare

  // 同じ日付の場合は出発時刻でソート
  const departureTimeA = a.TbmRouteGroup.departureTime || ''
  const departureTimeB = b.TbmRouteGroup.departureTime || ''
  return departureTimeA.localeCompare(departureTimeB)
 })

 // 明細行を作成
 const rows: MeisaiRow[] = sortedSchedules.map(schedule => {
  // 運賃を計算
  const feeSorted = schedule.TbmRouteGroup.TbmRouteGroupFee.sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
  const feeOnDate = feeSorted.find(fee => schedule.date.getTime() >= fee.startDate.getTime())

  const driverFee = feeOnDate?.driverFee || 0
  const futaiFee = feeOnDate?.futaiFee || 0

  // 時刻をHH:MM形式に変換
  const departureTime = schedule.TbmRouteGroup.departureTime
   ? TimeHandler.formatTimeString(schedule.TbmRouteGroup.departureTime, 'HH:MM')
   : null
  const finalArrivalTime = schedule.TbmRouteGroup.finalArrivalTime
   ? TimeHandler.formatTimeString(schedule.TbmRouteGroup.finalArrivalTime, 'HH:MM')
   : null

  return {
   date: schedule.date,
   routeName: schedule.TbmRouteGroup.routeName || null,
   serviceName: schedule.TbmRouteGroup.name,
   vehicleNumber: schedule.TbmVehicle?.vehicleNumber || null,
   driver: schedule.User?.name || null,
   fare: driverFee,
   futaiFee: futaiFee,
   remark: schedule.remark || null,
   departureTime,
   finalArrivalTime,
  }
 })

 // 顧客名を取得
 const customer = filteredSchedules[0]?.TbmRouteGroup.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer
 const customerName = customer?.name || ''

 return {
  yearMonth: whereQuery.gte,
  rows,
  customerName,
 }
}

