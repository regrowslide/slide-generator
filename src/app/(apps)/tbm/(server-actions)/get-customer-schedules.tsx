'use server'

import { DriveScheduleData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { getFilteredSchedulesByMonth } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/shared/getFilteredSchedules'

export type CustomerSchedulesData = {
  schedules: DriveScheduleData[]
  customerName: string
}

/**
 * 荷主の運行明細データを取得
 * 共通フィルタで月別フィルタリング後、顧客でフィルタリング
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
  // 共通フィルタで対象月のスケジュールを取得（営業所フィルタなし → ドライバ所属で後フィルタ）
  const billingFilteredSchedules = firstDayOfMonth
    ? await getFilteredSchedulesByMonth({
        targetMonth: firstDayOfMonth,
        whereQuery,
      })
    : []

  // ドライバの所属営業所 + customerId でフィルタリング
  const filteredSchedules = billingFilteredSchedules.filter((schedule) => {
    const scheduleCustomerId = schedule.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.tbmCustomerId
    const driverBaseMatch = tbmBaseId ? schedule.User?.tbmBaseId === tbmBaseId : true
    return scheduleCustomerId === customerId && driverBaseMatch
  })

  // 荷主名を取得
  const customerName = filteredSchedules[0]?.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.name ?? ''

  return {
    schedules: filteredSchedules,
    customerName,
  }
}
