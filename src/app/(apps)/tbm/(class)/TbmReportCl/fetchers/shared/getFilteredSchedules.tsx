'use server'

import { getDriveScheduleList, DriveScheduleData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { BillingHandler } from '@app/(apps)/tbm/(class)/TimeHandler'
import { Days } from '@cm/class/Days/Days'
import { toUtc } from '@cm/class/Days/date-utils/calculations'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

/**
 * 月別フィルタ済みスケジュールを取得する共通関数
 * 全レポートページで統一的に使用する
 *
 * 処理:
 * 1. DBから運行スケジュールを取得（月末跨ぎ対応のため前日を含む）
 * 2. BillingHandler.getBillingMonth() で対象月に属するデータのみフィルタ
 */
export const getFilteredSchedulesByMonth = async (props: {
  targetMonth: Date // 対象月の月初日（例: 12/1）
  whereQuery: { gte?: Date; lte?: Date }
  tbmBaseId?: number
  userId?: number
  providedScheduleList?: DriveScheduleData[] // 既に取得済みのデータを再利用
}): Promise<DriveScheduleData[]> => {
  const { targetMonth, whereQuery, tbmBaseId, userId, providedScheduleList } = props







  // 既取得データがあればDB呼び出しをスキップ
  const rawSchedules =
    providedScheduleList ||
    (await getDriveScheduleList({
      firstDayOfMonth: targetMonth,
      whereQuery: {
        ...whereQuery,
        // 月末跨ぎ運行対応: 前日も含めて取得（例: 11/30の24:00発車 → 12月請求）
        gte: whereQuery.gte ? Days.day.subtract(whereQuery.gte, 1) : undefined,
      },
      tbmBaseId,
      userId,
    }))


  // BillingHandler で対象月に属するスケジュールのみフィルタ
  const billingTargetMonth = toUtc(new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 1))


  const filteredSchedules = rawSchedules.filter(schedule => {


    const billingMonth = BillingHandler.getBillingMonth(
      billingTargetMonth,
      schedule.date,
      schedule.TbmRouteGroup.departureTime,
      schedule.TbmRouteGroup.id
    )

    // if (schedule.TbmRouteGroup.name.includes('土・日曜運行')) {
    //   console.log({
    //     foo: [
    //       formatDate(schedule.date), schedule.TbmRouteGroup.name
    //     ]
    //   })  //logs
    // }

    return formatDate(billingMonth, 'YYYYMM') === formatDate(billingTargetMonth, 'YYYYMM')
  })

  return filteredSchedules
}
