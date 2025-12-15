'use server'

export type tbmTableKeyValue = {
  type?: any
  label: string | React.ReactNode
  cellValue?: number | string | Date | null
  style?: {
    width?: number
    minWidth?: number
    backgroundColor?: string
  }
}

type userType = User & { TbmVehicle?: TbmVehicle }

export type getMonthlyTbmDriveDataReturn = Awaited<ReturnType<typeof fetchUnkoMeisaiData>>
export type MonthlyTbmDriveData = getMonthlyTbmDriveDataReturn['monthlyTbmDriveList'][number]

import prisma from 'src/lib/prisma'
import { TbmVehicle, User } from '@prisma/generated/prisma/client'
import { TbmReportCl } from '@app/(apps)/tbm/(class)/TbmReportCl'
import { unkoMeisaiKeyValue } from '@app/(apps)/tbm/(class)/TbmReportCl/cols/createUnkoMeisaiRow'
import { Days } from '@cm/class/Days/Days'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

export type DriveScheduleData = Awaited<ReturnType<typeof getDriveScheduleList>>[number]
export const getDriveScheduleList = async (props: {
  firstDayOfMonth,
  allowNonApprovedSchedule?: boolean
  whereQuery: {
    gte?: Date | undefined
    lte?: Date | undefined
  }
  tbmBaseId: number | undefined
  userId: number | undefined
}) => {
  const { allowNonApprovedSchedule, tbmBaseId, whereQuery, userId, firstDayOfMonth } = props

  // 表示期限のフィルタリング: 指定月の初日時点で表示期限を超過している便は非表示
  // 期限未入力のものは有効なデータだとみなして表示する

  const displayExpiryDateFilter = firstDayOfMonth
    ? {
      OR: [
        { displayExpiryDate: null },
        { displayExpiryDate: { gte: firstDayOfMonth } },
      ],
    }
    : {}

  const whereArgs = {
    approved: allowNonApprovedSchedule ? undefined : TbmReportCl.allowNonApprovedSchedule ? undefined : true,
    date: whereQuery,
    tbmBaseId,
    userId,
    TbmRouteGroup: displayExpiryDateFilter,
  }



  const tbmDriveSchedule = await prisma.tbmDriveSchedule.findMany({
    where: whereArgs,
    orderBy: [{ date: 'asc' }, { TbmRouteGroup: { departureTime: { sort: 'asc', nulls: 'last' } } }, { createdAt: 'asc' }, { userId: 'asc' }],
    include: {
      TbmEtcMeisai: { include: {} },
      TbmRouteGroup: {
        include: {
          TbmMonthlyConfigForRouteGroup: { where: { yearMonth: firstDayOfMonth } },
          Mid_TbmRouteGroup_TbmCustomer: { include: { TbmCustomer: {} } },
          TbmRouteGroupFee: {}, // フィルタを削除して、すべての料金設定を取得（運行日でフィルタリングする）
        },
      },
      TbmVehicle: {},
      User: {
        where: { id: userId },
        include: { TbmVehicle: {} },
      },
      TbmDriveScheduleImage: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  return tbmDriveSchedule
}

export const fetchUnkoMeisaiData = async ({
  firstDayOfMonth,
  allowNonApprovedSchedule,
  whereQuery,
  tbmBaseId,
  userId,
}: {
  firstDayOfMonth: Date | undefined
  allowNonApprovedSchedule?: boolean
  whereQuery: { gte?: Date | undefined; lte?: Date | undefined }
  tbmBaseId: number
  userId: number | undefined
}) => {
  const ConfigForMonth = await prisma.tbmMonthlyConfigForRouteGroup.findFirst({
    where: {
      yearMonth: firstDayOfMonth,
      TbmRouteGroup: { tbmBaseId: tbmBaseId },
    },
  })

  // 月末日跨ぎ運行対応のため、前日も含めて取得（例：11/30の運行で出発時刻2400の場合は12月に表示）
  const tbmDriveSchedule = await getDriveScheduleList({
    firstDayOfMonth,
    allowNonApprovedSchedule,
    whereQuery: {
      ...whereQuery,
      gte: whereQuery.gte ? Days.day.subtract(whereQuery.gte, 1) : undefined,
    },
    tbmBaseId,
    userId,
  })

  // 対象月の年月を取得（whereQuery.gteは月初日）
  const targetYearMonth = firstDayOfMonth ? formatDate(firstDayOfMonth, 'YYYYMM') : null



  // 便ごとの月間実働回数を計算するためのMap
  const routeGroupTripCountMap = new Map<number, number>()
  tbmDriveSchedule.forEach(schedule => {
    const routeGroupId = schedule.tbmRouteGroupId
    const currentCount = routeGroupTripCountMap.get(routeGroupId) || 0
    routeGroupTripCountMap.set(routeGroupId, currentCount + 1)
  })

  const monthlyTbmDriveList = tbmDriveSchedule
    .map(schedule => {
      // 便ごとの月間実働回数を取得
      const jitsudoKaisu = routeGroupTripCountMap.get(schedule.tbmRouteGroupId) || 1






      const unkoMeisaiKeyValue = TbmReportCl.reportCols.createUnkoMeisaiRow(schedule, jitsudoKaisu)
      return {
        schedule,
        keyValue: unkoMeisaiKeyValue,
      }
    })
    // 表示用日付で対象月のデータのみをフィルタリング
    .filter(item => {
      if (!targetYearMonth) return true
      const displayDate = item.keyValue.date.cellValue as Date
      const displayYearMonth = formatDate(displayDate, 'YYYYMM')
      return displayYearMonth === targetYearMonth
    })
    .sort((a, b) => {
      // 運行明細ページでは、表示用の日付でソート
      // 出発時刻が2400以降の場合は翌日に表示されるため、表示用の日付でソート
      const displayDateA = a.keyValue.date.cellValue as Date
      const displayDateB = b.keyValue.date.cellValue as Date
      const dateCompare = displayDateA.getTime() - displayDateB.getTime()
      if (dateCompare !== 0) return dateCompare

      // 同じ日付の場合は出発時刻でソート
      const departureTimeA = a.schedule.TbmRouteGroup.departureTime || ''
      const departureTimeB = b.schedule.TbmRouteGroup.departureTime || ''
      return departureTimeA.localeCompare(departureTimeB)
    }) as { schedule: DriveScheduleData; keyValue: unkoMeisaiKeyValue }[]

  const userList: userType[] = monthlyTbmDriveList
    .reduce((acc, row) => {
      const { schedule } = row
      const { User } = schedule
      if (acc.find(user => User && user?.id === User?.id)) {
        return acc
      }
      acc.push(User as userType)
      return acc
    }, [] as userType[])
    .sort((a, b) => -String(a?.code ?? '').localeCompare(String(b?.code ?? '')))

  return {
    monthlyTbmDriveList,
    ConfigForMonth,
    userList,
  }
}
