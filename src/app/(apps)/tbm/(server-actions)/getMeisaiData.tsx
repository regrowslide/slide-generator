'use server'

import { DriveScheduleData, getDriveScheduleList } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { BillingHandler, TimeHandler } from '@app/(apps)/tbm/(class)/TimeHandler'
import { toUtc } from '@cm/class/Days/date-utils/calculations'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { Days } from '@cm/class/Days/Days'

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
 // 運行スケジュールデータ取得（承認済みのみ）
 // 既に取得済みのデータがある場合は再利用
 const driveScheduleList = providedDriveScheduleList || await getDriveScheduleList({
  firstDayOfMonth: whereQuery.gte,
  whereQuery: {
   ...whereQuery,
   gte: Days.day.subtract(whereQuery.gte, 1),
  },
  tbmBaseId: undefined,
  userId: undefined,
 })

 // 指定された顧客の便のみをフィルタリング
 // 月末日跨ぎ運行の請求月判定も含める
 const filteredSchedules = driveScheduleList.filter(schedule => {
  // 顧客IDの一致チェック
  const matchesCustomer = schedule.TbmRouteGroup.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.id === customerId
  if (!matchesCustomer) return false

  // 請求月の判定（月末日跨ぎ運行対応）
  // 指定された月と請求月が一致するかチェック
  const targetMonth = toUtc(new Date(whereQuery.gte.getFullYear(), whereQuery.gte.getMonth() + 1, 1))

  const billingMonth = BillingHandler.getBillingMonth(
   targetMonth,
   schedule.date, schedule.TbmRouteGroup.departureTime, schedule.TbmRouteGroup.id)
  return formatDate(billingMonth, 'YYYYMM') === formatDate(targetMonth, 'YYYYMM')
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

