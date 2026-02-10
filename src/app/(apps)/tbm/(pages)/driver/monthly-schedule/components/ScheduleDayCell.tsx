'use client'

import React from 'react'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { Days } from '@cm/class/Days/Days'
import { cn } from '@cm/shadcn/lib/utils'
import { C_Stack } from '@cm/components/styles/common-components/common-components'
import { TimeHandler } from '@app/(apps)/tbm/(class)/TimeHandler'
import { T_LINK } from '@cm/components/styles/common-components/links'
import { HREF } from '@cm/lib/methods/urls'
import { globalIds } from 'src/non-common/searchParamStr'

type Props = {
  date: Date
  startDate: Date
  schedules: any[]
  selectedDriverId: number
  tbmBaseId: number
  query: Record<string, string>
}

const ScheduleDayCell = ({ date, startDate, schedules, selectedDriverId, tbmBaseId, query }: Props) => {
  const dayStr = formatDate(date, 'D(ddd)')
  const onThisMonth = formatDate(date, 'MM') === formatDate(startDate, 'MM')
  const isToday = Days.validate.isSameDate(date, new Date())
  const isWeekend = formatDate(date, 'ddd') === '土' || formatDate(date, 'ddd') === '日'

  if (!onThisMonth) {
    return (
      <td className="border p-1 text-gray-300">
        <div className="h-[120px]  w-full text-sm"></div>
      </td>
    )
  }

  let cellStyle = {}
  if (isToday) {
    cellStyle = { backgroundColor: '#ffeb3b' }
  } else if (isWeekend) {
    cellStyle = { backgroundColor: '#ffebee' }
  }

  return (
    <td style={cellStyle} className="border p-1.5  align-top">
      <C_Stack className="min-h-[140px]  w-full text-sm gap-4">
        {/* 日付表示 */}
        <div
          className={cn(
            'text-right font-bold ',
            formatDate(date, 'ddd') === '土' && 'text-blue-600',
            formatDate(date, 'ddd') === '日' && 'text-red-600'
          )}
        >
          <T_LINK
            target="_blank"
            href={HREF(
              '/tbm/driver/driveInput',
              {
                from: formatDate(date, 'YYYY-MM-DD'),
                [globalIds.globalUserId]: selectedDriverId,
                [globalIds.globalTbmBaseId]: tbmBaseId,
              },
              query
            )}
          >
            {dayStr}
          </T_LINK>
        </div>

        {/* スケジュール表示 */}
        <div className="space-y-2 leading-3">
          {schedules.map((item, idx) => (
            <div key={idx} className="text-[10px] bg-blue-100 ring-blue-300 ring rounded px-1 py-0.5 truncate">
              <div className="font-semibold"></div>
              <div className="text-gray-600">{item.schedule.TbmRouteGroup?.name}</div>
              {item.schedule.TbmVehicle && <div className="text-gray-500">{item.schedule.TbmVehicle.vehicleNumber}</div>}
              <div className={`text-red-500`}>
                {TimeHandler.formatTimeString(item.schedule.TbmRouteGroup?.departureTime, 'display')}
              </div>
            </div>
          ))}
        </div>
      </C_Stack>
    </td>
  )
}

export default ScheduleDayCell
