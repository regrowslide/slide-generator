'use client'
import React from 'react'
import { CsvTableVirtualized } from '@cm/components/styles/common-components/CsvTable/CsvTableVirtualized'
import { TableRowBuilder } from './TableRowBuilder'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { HaishaTableContentProps, TbmDriveScheduleWithDuplicated } from '../types/haisha-page-types'

export const HaishaTableContent = React.memo((props: HaishaTableContentProps) => {
  const {
    mode,
    tbmBase,
    userList,
    TbmDriveSchedule,
    tbmRouteGroup,
    days,
    holidays,
    fetchData,
    setModalOpen,
    admin,
    query,
    userWorkStatusCount,
    canEdit = true,
  } = props



  // スケジュールデータを整理
  const { scheduleByDateAndUser, scheduleByDateAndRoute } = React.useMemo(() => {
    return {
      scheduleByDateAndUser: getScheduleByDateAndUser({ TbmDriveSchedule }),
      scheduleByDateAndRoute: getScheduleByDateAndRoute({ TbmDriveSchedule }),
    }
  }, [TbmDriveSchedule, days, holidays])

  const tableRowBuilderProps = {
    mode,
    tbmBase,
    days,
    holidays,
    fetchData,
    setModalOpen,
    admin,
    query,
    userWorkStatusCount,
    scheduleByDateAndUser: scheduleByDateAndUser.scheduleByDateAndUser,
    scheduleByDateAndRoute: scheduleByDateAndRoute.scheduleByDateAndRoute,
    canEdit,
  }

  const tableClassName = 'max-h-[calc(100vh-230px)]'

  if (mode === 'DRIVER') {
    const records = TableRowBuilder.buildDriverRows(userList, tableRowBuilderProps)
    return <div>{CsvTableVirtualized({ records }).WithWrapper({ className: tableClassName })}</div>
  }

  if (mode === 'ROUTE') {
    const records = TableRowBuilder.buildRouteRows(tbmRouteGroup, tableRowBuilderProps)

    return <div>{CsvTableVirtualized({ records }).WithWrapper({ className: tableClassName })}</div>
  }

  return <></>
})

const getScheduleByDateAndUser = ({ TbmDriveSchedule }: { TbmDriveSchedule: TbmDriveScheduleWithDuplicated[] }) => {
  const scheduleByDateAndUser = TbmDriveSchedule.reduce(
    (acc, schedule) => {
      const dateKey = formatDate(schedule.date)
      const userKey = String(schedule.userId)
      if (!acc[dateKey]) {
        acc[dateKey] = {}
      }
      if (!acc[dateKey][userKey]) {
        acc[dateKey][userKey] = []
      }
      acc[dateKey][userKey].push(schedule)
      return acc
    },
    {} as Record<string, Record<string, TbmDriveScheduleWithDuplicated[]>>
  )

  return { scheduleByDateAndUser }
}

const getScheduleByDateAndRoute = ({ TbmDriveSchedule }: { TbmDriveSchedule: TbmDriveScheduleWithDuplicated[] }) => {
  const scheduleByDateAndRoute = TbmDriveSchedule.reduce(
    (acc, schedule) => {
      const dateKey = formatDate(schedule.date)
      const routeKey = String(schedule.tbmRouteGroupId)
      if (!acc[dateKey]) {
        acc[dateKey] = {}
      }
      if (!acc[dateKey][routeKey]) {
        acc[dateKey][routeKey] = []
      }
      acc[dateKey][routeKey].push(schedule)
      return acc
    },
    {} as Record<string, Record<string, TbmDriveScheduleWithDuplicated[]>>
  )

  return { scheduleByDateAndRoute }
}
export default HaishaTableContent
