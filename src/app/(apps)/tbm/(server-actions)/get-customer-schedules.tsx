'use server'

import { getDriveScheduleList, DriveScheduleData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { Days } from '@cm/class/Days/Days'
import { BillingHandler } from '@app/(apps)/tbm/(class)/TimeHandler'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { toUtc } from '@cm/class/Days/date-utils/calculations'

export type CustomerSchedulesData = {
  schedules: DriveScheduleData[]
  customerName: string
}

/**
 * 荷主の運行明細データを取得
 * fetchEigyoshoHikakuData と同じロジックで getBillingMonth() でフィルタリング
 */
export const getCustomerSchedules = async ({
  customerId,
  firstDayOfMonth,
  whereQuery,
  tbmBaseId,
}: {
  customerId: number
  firstDayOfMonth: Date | undefined
  whereQuery: { gte?: Date | undefined; lte?: Date | undefined }
  tbmBaseId: number | undefined
}): Promise<CustomerSchedulesData> => {
  // 月末日跨ぎ運行対応のため、前日も含めて取得（fetchEigyoshoHikakuData と同じロジック）
  const allSchedules = await getDriveScheduleList({
    firstDayOfMonth,
    whereQuery: {
      ...whereQuery,
      gte: whereQuery.gte ? Days.day.subtract(whereQuery.gte, 1) : undefined,
    },
    tbmBaseId,
    userId: undefined,
  })

  // getBillingMonth() でフィルタリング（fetchEigyoshoHikakuData と同じロジック）
  const targetMonth = firstDayOfMonth
    ? toUtc(new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 1))
    : null

  const billingFilteredSchedules = targetMonth
    ? allSchedules.filter((schedule) => {
        const billingMonth = BillingHandler.getBillingMonth(
          targetMonth,
          schedule.date,
          schedule.TbmRouteGroup.departureTime,
          schedule.TbmRouteGroup.id
        )
        return formatDate(billingMonth, 'YYYYMM') === formatDate(targetMonth, 'YYYYMM')
      })
    : allSchedules

  // customerId でフィルタリング
  const filteredSchedules = billingFilteredSchedules.filter((schedule) => {
    const scheduleCustomerId = schedule.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.tbmCustomerId
    return scheduleCustomerId === customerId
  })

  // 荷主名を取得
  const customerName = filteredSchedules[0]?.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.name ?? ''

  return {
    schedules: filteredSchedules,
    customerName,
  }
}
