'use client'

import React from 'react'

import { C_Stack, FitMargin, R_Stack } from '@cm/components/styles/common-components/common-components'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { getUserWorkStatusForMonth } from '@app/(apps)/tbm/(server-actions)/userWorkStatusActions'
import { getMidnight } from '@cm/class/Days/date-utils/calculations'
import useSWR from 'swr'
import { Days } from '@cm/class/Days/Days'
import { globalIds } from 'src/non-common/searchParamStr'
import KintaiSummaryTable from './components/KintaiSummaryTable'
import KintaiDailyTable from './components/KintaiDailyTable'

export default function AttendancePage() {
  const { query, session } = useGlobal()

  // 現在の月を取得（クエリパラメータから、または現在の日付から）
  const getCurrentMonth = () => {
    if (query.month) return new Date(query.month)
    if (query.from) return new Date(query.from)
    return getMidnight()
  }

  const {
    data,
    isLoading,
    mutate: fetchData,
  } = useSWR(JSON.stringify([query.userId, query.month]), async () => {
    const tbmBaseId = session.scopes?.getTbmScopes?.()?.tbmBaseId
    const selectedUserId = query.userId ? parseInt(query.userId) : undefined
    console.log({ selectedUserId })  //logs


    const theDate = getCurrentMonth()
    return await getUserWorkStatusForMonth({
      tbmBaseId,
      userId: selectedUserId,
      yearMonth: theDate,
    })
  })

  const User = data as Awaited<ReturnType<typeof getUserWorkStatusForMonth>>
  const { UserWorkStatus = [], TbmRefuelHistory = [], OdometerInput = [], TbmDriveSchedule = [] } = User ?? {}


  const selectedUserId = query.userId ? parseInt(query.userId) : undefined


  const theDate = getCurrentMonth()
  const { days: daysInMonth } = Days.month.getMonthDatum(theDate)

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  return (
    <FitMargin className="pt-4">
      <div>
        <C_Stack className="items-start gap-8">
          <R_Stack className={` items-start justify-between  w-full`}>
            <KintaiSummaryTable
              UserWorkStatus={UserWorkStatus}
              selectedUserId={selectedUserId}
              daysInMonth={daysInMonth}
            />
            <div className={` w-fit`}>
              <NewDateSwitcher
                {...{
                  monthOnly: true,
                  additionalCols: [{ label: '', id: 'userId', forSelect: {} }],
                }}
              />
            </div>
          </R_Stack>
          <KintaiDailyTable
            UserWorkStatus={UserWorkStatus}
            OdometerInput={OdometerInput}
            TbmRefuelHistory={TbmRefuelHistory}
            TbmDriveSchedule={TbmDriveSchedule}
            selectedUserId={selectedUserId}
            daysInMonth={daysInMonth}
            fetchData={fetchData}
            query={query}
          />
        </C_Stack>
      </div>
    </FitMargin>
  )
}
