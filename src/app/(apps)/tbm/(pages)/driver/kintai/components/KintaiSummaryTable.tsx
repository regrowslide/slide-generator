'use client'

import React, { useMemo } from 'react'
import { C_Stack } from '@cm/components/styles/common-components/common-components'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { UseWorkStatusCl } from '@app/(apps)/tbm/(class)/UseWorkStatusCl'
import { UserWorkStatusItem } from '@app/(apps)/tbm/(server-actions)/userWorkStatusActions'

type Props = {
  UserWorkStatus: UserWorkStatusItem[]
  selectedUserId: number | undefined
  daysInMonth: Date[]
}

const KintaiSummaryTable = ({ UserWorkStatus, selectedUserId, daysInMonth }: Props) => {
  return useMemo(() => {
    const monthlySummaryResult = UseWorkStatusCl.calculateMonthlySummary(UserWorkStatus, selectedUserId, daysInMonth)
    const { monthlyTotals, summary } = monthlySummaryResult

    return (
      <C_Stack className="items-start ">
        <div>
          <div>
            {CsvTable({
              records: [
                {
                  csvTableRow: [
                    { label: '出勤日数', cellValue: summary.workDays },
                    { label: '公休日数', cellValue: summary.holidays },
                    { label: '欠勤日数', cellValue: summary.absences },
                    { label: '休日出勤', cellValue: summary.holidayWork },
                    { label: '早退日数', cellValue: summary.earlyLeave },
                    { label: '有給休暇', cellValue: summary.paidLeave },
                    { label: '総出勤日数', cellValue: summary.totalWorkDays },
                  ],
                },
              ],
              chunked: { enabled: false },
            }).WithWrapper({})}
          </div>
        </div>

        <div>
          {CsvTable({
            records: [
              {
                csvTableRow: [
                  { label: '拘束時間', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.kosokuMins) },
                  { label: '労働時間', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.rodoMins) },
                  { label: '一日平均', cellValue: UseWorkStatusCl.formatMinutesToTime(Math.round(summary.averageDailyHours)) },
                  { label: '所定内', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.shoteinai) },
                  { label: '時間外1', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.jikangai1) },
                  { label: '時間外2', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.jikangai2) },
                  { label: '深夜', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.shinyaZangyo) },
                  { label: '休日勤務', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.kyujitsuShukkin) },
                  { label: '月間距離', cellValue: '-' },
                  { label: '給油量', cellValue: '-' },
                  { label: '燃費', cellValue: '-' },
                ],
              },
            ],
            chunked: { enabled: false },
          }).WithWrapper({})}
        </div>
      </C_Stack>
    )
  }, [UserWorkStatus, selectedUserId, daysInMonth])
}

export default KintaiSummaryTable
