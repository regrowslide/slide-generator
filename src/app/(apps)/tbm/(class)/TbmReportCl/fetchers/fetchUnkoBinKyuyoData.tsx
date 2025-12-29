'use server'

import prisma from 'src/lib/prisma'
import { TbmVehicle, User } from '@prisma/generated/prisma/client'
import { TbmReportCl } from '@app/(apps)/tbm/(class)/TbmReportCl'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { tbmTableKeyValue } from './fetchUnkoMeisaiData'

type userType = User & { TbmVehicle?: TbmVehicle }

export type UnkoBinKyuyoDriveScheduleData = Awaited<ReturnType<typeof getUnkoBinKyuyoDriveScheduleList>>[number]

/**
 * 運行便給与レポート用のTbmDriveScheduleを取得
 */
export const getUnkoBinKyuyoDriveScheduleList = async (props: {
  firstDayOfMonth: Date | undefined
  allowNonApprovedSchedule?: boolean
  whereQuery: {
    gte?: Date | undefined
    lte?: Date | undefined
  }
  tbmBaseId: number | undefined
  userId?: number | undefined
}) => {
  const { allowNonApprovedSchedule, tbmBaseId, whereQuery, userId, firstDayOfMonth } = props

  // 表示期限のフィルタリング: 指定月の初日時点で表示期限を超過している便は非表示
  const displayExpiryDateFilter = firstDayOfMonth
    ? {
      OR: [{ displayExpiryDate: null }, { displayExpiryDate: { gte: firstDayOfMonth } }],
    }
    : {}

  // 共有便を含む便グループのフィルター条件
  const routeGroupBaseFilter = tbmBaseId
    ? {
        OR: [
          { tbmBaseId },
          { TbmRouteGroupShare: { some: { tbmBaseId, isActive: true } } },
        ],
      }
    : {}

  const whereArgs = {
    approved: allowNonApprovedSchedule ? undefined : TbmReportCl.allowNonApprovedSchedule ? undefined : true,
    date: whereQuery,
    userId,
    TbmRouteGroup: {
      ...displayExpiryDateFilter,
      ...routeGroupBaseFilter,
    },
  }

  const tbmDriveSchedule = await prisma.tbmDriveSchedule.findMany({
    where: whereArgs,
    orderBy: [{ date: 'asc' }, { TbmRouteGroup: { departureTime: { sort: 'asc', nulls: 'last' } } }, { createdAt: 'asc' }, { userId: 'asc' }],
    include: {
      TbmRouteGroup: {
        include: {
          TbmRouteGroupFee: {}, // 運賃・付帯作業情報を取得
          TbmRouteGroupStandardSalary: {}, // 標準給料履歴を取得
          Mid_TbmRouteGroup_TbmCustomer: { include: { TbmCustomer: {} } },
        },
      },
      TbmVehicle: {},
      User: {
        include: { TbmVehicle: {} },
      },
    },
  })

  return tbmDriveSchedule
}

export type UnkoBinKyuyoRecord = {
  schedule: UnkoBinKyuyoDriveScheduleData
  keyValue: UnkoBinKyuyoKeyValue
}

export type UnkoBinKyuyoKeyValue = {
  date: tbmTableKeyValue
  routeCode: tbmTableKeyValue
  routeName: tbmTableKeyValue
  binName: tbmTableKeyValue
  vehicleNumber: tbmTableKeyValue
  vehicleType: tbmTableKeyValue
  driverCode: tbmTableKeyValue
  driverName: tbmTableKeyValue
  standardSalary: tbmTableKeyValue
  driverFee: tbmTableKeyValue
  futaiFee: tbmTableKeyValue
  customerName: tbmTableKeyValue
}

/**
 * 運行便給与レポート用のデータを取得
 */
export const fetchUnkoBinKyuyoData = async ({
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
  userId?: number | undefined
}) => {
  const tbmDriveSchedule = await getUnkoBinKyuyoDriveScheduleList({
    firstDayOfMonth,
    allowNonApprovedSchedule,
    whereQuery,
    tbmBaseId,
    userId,
  })

  // 対象月の年月を取得
  const targetYearMonth = firstDayOfMonth ? formatDate(firstDayOfMonth, 'YYYYMM') : null

  const unkoBinKyuyoList: UnkoBinKyuyoRecord[] = tbmDriveSchedule
    .map(schedule => {
      // 運行日の時点で有効な運賃・付帯作業を取得
      const feeOnDate = schedule.TbmRouteGroup.TbmRouteGroupFee.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()).find(
        fee => fee.startDate <= schedule.date
      )

      // 運行日の時点で有効な標準給料を取得
      const standardSalaryRecord = schedule.TbmRouteGroup.TbmRouteGroupStandardSalary.sort(
        (a, b) => b.startDate.getTime() - a.startDate.getTime()
      ).find(salary => salary.startDate <= schedule.date)

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

      return {
        schedule,
        keyValue,
      }
    })
    .filter(item => {
      if (!targetYearMonth) return true
      const scheduleYearMonth = formatDate(item.schedule.date, 'YYYYMM')
      return scheduleYearMonth === targetYearMonth
    })
    .sort((a, b) => {
      // 日付でソート
      const dateCompare = a.schedule.date.getTime() - b.schedule.date.getTime()
      if (dateCompare !== 0) return dateCompare

      // 同じ日付の場合は出発時刻でソート
      const departureTimeA = a.schedule.TbmRouteGroup.departureTime || ''
      const departureTimeB = b.schedule.TbmRouteGroup.departureTime || ''
      return departureTimeA.localeCompare(departureTimeB)
    })

  // ユーザーリストを作成
  const userList: userType[] = unkoBinKyuyoList
    .reduce((acc, row) => {
      const { schedule } = row
      const { User } = schedule
      if (User && !acc.find(user => user?.id === User?.id)) {
        acc.push(User as userType)
      }
      return acc
    }, [] as userType[])
    .sort((a, b) => -String(a?.code ?? '').localeCompare(String(b?.code ?? '')))

  // 便リストを作成
  const routeGroupList = unkoBinKyuyoList
    .reduce(
      (acc, row) => {
        const { schedule } = row
        const { TbmRouteGroup } = schedule
        if (!acc.find(rg => rg.id === TbmRouteGroup.id)) {
          acc.push(TbmRouteGroup)
        }
        return acc
      },
      [] as UnkoBinKyuyoDriveScheduleData['TbmRouteGroup'][]
    )
    .sort((a, b) => String(a?.code ?? '').localeCompare(String(b?.code ?? '')))

  // 車両リストを作成
  const vehicleList = unkoBinKyuyoList
    .reduce(
      (acc, row) => {
        const { schedule } = row
        const { TbmVehicle } = schedule
        if (TbmVehicle && !acc.find(v => v.id === TbmVehicle.id)) {
          acc.push(TbmVehicle)
        }
        return acc
      },
      [] as NonNullable<UnkoBinKyuyoDriveScheduleData['TbmVehicle']>[]
    )
    .sort((a, b) => String(a?.vehicleNumber ?? '').localeCompare(String(b?.vehicleNumber ?? '')))

  return {
    unkoBinKyuyoList,
    userList,
    routeGroupList,
    vehicleList,
  }
}
