'use client'

import React, { useMemo } from 'react'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { Days } from '@cm/class/Days/Days'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { T_LINK } from '@cm/components/styles/common-components/links'
import { HREF } from '@cm/lib/methods/urls'
import { Alert } from '@cm/components/styles/common-components/Alert'
import { MarkDownDisplay } from '@cm/components/utils/texts/MarkdownDisplay'
import { TBM_CODE } from '@app/(apps)/tbm/(class)/TBM_CODE'
import { TimeHandler } from '@app/(apps)/tbm/(class)/TimeHandler'
import { UseWorkStatusCl } from '@app/(apps)/tbm/(class)/UseWorkStatusCl'
import { UserWorkStatusItem } from '@app/(apps)/tbm/(server-actions)/userWorkStatusActions'
import { globalIds } from 'src/non-common/searchParamStr'
import InlineEditField from './InlineEditField'
import { calcOdometerDistance, calcRefuelAmount, getVehicleNumbers, getDriveContents } from '../lib/kintai-daily-row'

type Props = {
  UserWorkStatus: UserWorkStatusItem[]
  OdometerInput: any[]
  TbmRefuelHistory: any[]
  TbmDriveSchedule: any[]
  selectedUserId: number | undefined
  daysInMonth: Date[]
  fetchData: () => void
  query: Record<string, string>
}

const KintaiDailyTable = ({
  UserWorkStatus,
  OdometerInput,
  TbmRefuelHistory,
  TbmDriveSchedule,
  selectedUserId,
  daysInMonth,
  fetchData,
  query,
}: Props) => {
  return useMemo(() => {
    if (!selectedUserId) {
      return <Alert color="yellow">ユーザーを選択してください</Alert>
    }

    const records = daysInMonth.map(date => {
      const userWorkStatus = UserWorkStatus.find(item => {
        return item.userId === selectedUserId && Days.validate.isSameDate(new Date(item.date), date)
      })

      const odometerInput = calcOdometerDistance(OdometerInput, selectedUserId, date)
      const tbmRefuelHistory = calcRefuelAmount(TbmRefuelHistory, selectedUserId, date)
      const vehicleNumbers = getVehicleNumbers(TbmDriveSchedule, selectedUserId, date)
      const driveContents = getDriveContents(TbmDriveSchedule, selectedUserId, date)

      const useWorkStatusCl = new UseWorkStatusCl(userWorkStatus as UserWorkStatusItem)

      const {
        kosokuMins,
        rodoMins,
        kyukeiMins,
        shinyaKyukeiMins,
        kyusokuMins,
        shoteinai,
        jikangai1,
        shinyaZangyo,
        kyujitsuShukkin,
        shinyaTime,
      } = useWorkStatusCl.getAllTimeData()

      const dateStr = formatDate(date, 'DD(ddd)')
      const driveInputPageHref = HREF('/tbm/driver/driveInput', { [globalIds.globalUserId]: selectedUserId, from: date }, query)

      return {
        csvTableRow: [
          { label: '日付', cellValue: <T_LINK href={driveInputPageHref}>{dateStr}</T_LINK> },
          {
            label: '勤怠',
            cellValue: (
              <InlineEditField
                value={userWorkStatus?.workStatus || ''}
                userId={selectedUserId}
                date={date}
                fieldName="workStatus"
                placeholder=""
                onUpdate={fetchData}
                select={{
                  options: TBM_CODE.WORK_STATUS_KBN.array.map(item => ({
                    label: item.label,
                    value: item.code,
                  })),
                }}
              />
            ),
          },
          {
            label: '車番',
            cellValue: (
              <small>
                <MarkDownDisplay>{vehicleNumbers || ''}</MarkDownDisplay>
              </small>
            ),
            style: { minWidth: 120 },
          },
          {
            label: '出社時間',
            cellValue: (
              <InlineEditField
                value={userWorkStatus?.startTime || ''}
                userId={selectedUserId}
                date={date}
                fieldName="startTime"
                type="time"
                placeholder="--:--"
                onUpdate={fetchData}
              />
            ),
          },
          {
            label: '退社時間',
            cellValue: (
              <InlineEditField
                value={userWorkStatus?.endTime || ''}
                userId={selectedUserId}
                date={date}
                fieldName="endTime"
                type="time"
                placeholder="--:--"
                onUpdate={fetchData}
              />
            ),
          },
          {
            label: '走行距離',
            cellValue: odometerInput,
            className: odometerInput < 0 ? 'bg-red-500 text-white' : '',
          },
          { label: '給油量', cellValue: tbmRefuelHistory },
          {
            label: '拘束時間',
            cellValue: kosokuMins ? TimeHandler.minutesToTimeString(kosokuMins) : '',
          },
          {
            label: '労働時間',
            cellValue: rodoMins ? TimeHandler.minutesToTimeString(rodoMins) : '',
          },
          {
            label: '休憩時間',
            cellValue: (
              <InlineEditField
                value={userWorkStatus?.kyukeiMins || ''}
                userId={selectedUserId}
                date={date}
                fieldName="kyukeiMins"
                type="time"
                placeholder="--:--"
                onUpdate={fetchData}
              />
            ),
          },
          {
            label: '深夜休憩',
            cellValue: (
              <InlineEditField
                value={userWorkStatus?.shinyaKyukeiMins || ''}
                userId={selectedUserId}
                date={date}
                fieldName="shinyaKyukeiMins"
                type="time"
                placeholder="--:--"
                onUpdate={fetchData}
              />
            ),
          },
          {
            label: '休息時間',
            cellValue: (
              <InlineEditField
                value={userWorkStatus?.kyusokuMins || ''}
                userId={selectedUserId}
                date={date}
                fieldName="kyusokuMins"
                type="time"
                placeholder="--:--"
                onUpdate={fetchData}
              />
            ),
          },
          {
            label: '所定内',
            cellValue: shoteinai ? TimeHandler.minutesToTimeString(shoteinai) : '',
          },
          {
            label: '時間外1',
            cellValue: jikangai1 ? TimeHandler.minutesToTimeString(jikangai1) : '',
          },
          {
            label: '深夜時間',
            cellValue: shinyaTime ? TimeHandler.minutesToTimeString(shinyaTime) : '',
          },
          {
            label: '深夜残業',
            cellValue: shinyaZangyo ? TimeHandler.minutesToTimeString(shinyaZangyo) : '',
          },
          {
            label: '休日出勤',
            cellValue: kyujitsuShukkin ? TimeHandler.minutesToTimeString(kyujitsuShukkin) : '',
          },
          {
            label: '運行内容',
            cellValue: (
              <small>
                <MarkDownDisplay>{driveContents || ''}</MarkDownDisplay>
              </small>
            ),
            style: { minWidth: 240 },
          },
        ]
          .filter(Boolean)
          .map((d: any) => ({ ...d, style: { minWidth: 80, ...d.style } })),
      }
    })

    // 月間合計行を追加
    const monthlySummaryResult = UseWorkStatusCl.calculateMonthlySummary(UserWorkStatus, selectedUserId, daysInMonth)
    const { monthlyTotals } = monthlySummaryResult

    const totalRow = {
      className: 'bg-blue-50 font-bold',
      csvTableRow: [
        { label: '日付', cellValue: '合計' },
        { label: '勤怠', cellValue: '' },
        { label: '車番', cellValue: '' },
        { label: '出社時間', cellValue: '' },
        { label: '退社時間', cellValue: '' },
        { label: '走行距離', cellValue: '' },
        { label: '給油量', cellValue: '' },
        { label: '拘束時間', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.kosokuMins) },
        { label: '労働時間', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.rodoMins) },
        { label: '休憩時間', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.kyukeiMins) },
        { label: '深夜休憩', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.shinyaKyukeiMins) },
        { label: '休息時間', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.kyusokuMins) },
        { label: '所定内', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.shoteinai) },
        { label: '時間外1', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.jikangai1) },
        { label: '深夜時間', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.shinyaTime) },
        { label: '深夜残業', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.shinyaZangyo) },
        { label: '休日出勤', cellValue: UseWorkStatusCl.formatMinutesToTime(monthlyTotals.kyujitsuShukkin) },
        { label: '運行内容', cellValue: '' },
      ].map(d => ({ ...d, style: { minWidth: 80 } })),
    }

    const allRecords = [...records, totalRow]

    return (
      <div>
        {CsvTable({ records: allRecords }).WithWrapper({
          className: 'max-h-none',
        })}
      </div>
    )
  }, [UserWorkStatus, OdometerInput, TbmRefuelHistory, TbmDriveSchedule, selectedUserId, daysInMonth])
}

export default KintaiDailyTable
