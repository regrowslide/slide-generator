'use client'

import React from 'react'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { getScopes } from 'src/non-common/scope-lib/getScopes'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import useLocalLoading from '@cm/hooks/globalHooks/useLocalLoading'
import { useMonthlyScheduleData } from './hooks/useMonthlyScheduleData'
import MonthNavigator from './components/MonthNavigator'
import ScheduleCalendar from './components/ScheduleCalendar'

export default function MonthlySchedulePage() {
  const { query, session, addQuery } = useGlobal()
  const { LocalLoader, toggleLocalLoading } = useLocalLoading()

  const scopes = getScopes(session, { query })
  const { userId, tbmBaseId } = scopes.getTbmScopes()

  const currentDate = new Date()
  const defaultYearMonth = formatDate(currentDate, 'YYYY-MM')
  const selectedYearMonth = query.yearMonth || defaultYearMonth
  const selectedDriverId = userId

  const handleYearMonthChange = (newYearMonth: string) => {
    addQuery({ yearMonth: newYearMonth })
  }

  const { calendarData } = useMonthlyScheduleData({
    selectedYearMonth,
    tbmBaseId,
    selectedDriverId,
    toggleLocalLoading,
  })

  if (!calendarData) {
    return (
      <div>
        <LocalLoader />
        <div>データを読み込み中...</div>
      </div>
    )
  }

  return (
    <div className=" p-1  ">
      <LocalLoader />

      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4 mx-auto w-fit">
          <MonthNavigator selectedYearMonth={selectedYearMonth} onYearMonthChange={handleYearMonthChange} />
        </div>
      </div>

      <ScheduleCalendar
        calendarData={calendarData}
        selectedDriverId={selectedDriverId}
        tbmBaseId={tbmBaseId}
        query={query}
      />
    </div>
  )
}
