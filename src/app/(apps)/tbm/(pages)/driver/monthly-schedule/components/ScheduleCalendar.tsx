'use client'

import React from 'react'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import ScheduleDayCell from './ScheduleDayCell'

type CalendarData = {
  weeks: Date[][]
  schedulesByDate: Record<string, any[]>
  startDate: Date
}

type Props = {
  calendarData: CalendarData
  selectedDriverId: number
  tbmBaseId: number
  query: Record<string, string>
}

const ScheduleCalendar = ({ calendarData, selectedDriverId, tbmBaseId, query }: Props) => {
  return (
    <div className="mx-auto w-fit print-target ">
      <div className={`max-w-[95vw] mx-auto overflow-auto border max-h-[calc(100vh-140px)]`}>
        <table className=" border-[1px]">
          <thead>
            <tr>
              {calendarData.weeks[0]?.map((day, idx) => {
                const dayStr = formatDate(day, 'ddd')
                const isWeekend = dayStr === '土' || dayStr === '日'

                return (
                  <th
                    key={idx}
                    className={`text-center p-2 ${isWeekend ? 'bg-red-50 text-red-600' : 'bg-blue-50'}`}
                    style={{ minWidth: '100px' }}
                  >
                    {dayStr}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {calendarData.weeks.map((week, weekIdx) => (
              <tr key={weekIdx}>
                {week.map((date, dayIdx) => {
                  const dateKey = formatDate(date, 'YYYY-MM-DD')
                  const schedules = calendarData.schedulesByDate[dateKey] || []

                  return (
                    <ScheduleDayCell
                      key={dayIdx}
                      date={date}
                      startDate={calendarData.startDate}
                      schedules={schedules}
                      selectedDriverId={selectedDriverId}
                      tbmBaseId={tbmBaseId}
                      query={query}
                    />
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ScheduleCalendar
