'use client'
import React from 'react'
import { Days } from '@cm/class/Days/Days'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { HaishaCard } from './HaishaCard'
import UserTh from './UserTh'
import DateThCell from './DateThCell'
import { doTransaction } from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import {
  TableRowBuilderProps,
  DateCellBuilderParams,
  UserWithWorkStatus,
  TbmRouteGroupWithCalendar,
} from '../types/haisha-page-types'
import TbmRouteCl from '@app/(apps)/tbm/(class)/TbmRouteCl'
import { CalendarIcon } from 'lucide-react'

// 固定列のスタイル定数
const STICKY_COLUMN_STYLE = {
  left: 0,
  position: 'sticky' as const,
  zIndex: 31,
  backgroundColor: '#F3F3F3',
  borderRight: '2px solid #c8c8c8',
  boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
}

const HEADER_STYLE = {
  backgroundColor: '#d8d8d8',
  fontWeight: 'bold' as const,
}

export const TableRowBuilder = {
  // ドライバーモード用の行生成
  buildDriverRows: (userList: UserWithWorkStatus[], props: TableRowBuilderProps) => {
    const {
      mode,
      tbmBase,
      days,
      holidays,
      fetchData,
      setModalOpen,
      admin,
      query,
      userWorkStatusCount,
      scheduleByDateAndUser = {},
    } = props

    return userList
      .sort((a, b) => a.code?.localeCompare(b.code ?? '') ?? 0)
      .map((user, i) => ({
        csvTableRow: [
          // ユーザー情報（固定列）

          {
            label: 'ユーザー',
            cellValue: (
              <R_Stack className={`gap-0.5`}>
                <span>{i + 1}. </span>
                <span>
                  <UserTh {...{ user, admin, query, userWorkStatusCount }} />
                </span>
              </R_Stack>
            ),
            style: {
              ...STICKY_COLUMN_STYLE,
              minWidth: 130,
              height: 10,
            },
          },
          // 日付別セル
          ...days.map((date, i) => {
            return TableRowBuilder.buildDateCell({
              date,
              scheduleListOnDate: scheduleByDateAndUser[formatDate(date)]?.[String(user.id)] ?? [],
              user,
              mode,
              tbmBase,
              holidays,
              fetchData,
              setModalOpen,
              query,
            })
          }),
        ],
      }))
  },

  // ルートモード用の行生成
  buildRouteRows: (tbmRouteGroup: TbmRouteGroupWithCalendar[], props: TableRowBuilderProps) => {
    const { mode, tbmBase, days, holidays, fetchData, setModalOpen, query, scheduleByDateAndRoute = {} } = props

    return tbmRouteGroup
      .sort((a, b) => a.code?.localeCompare(b.code ?? '') ?? 0)
      .map((route, i) => {
        const workingDaysOfRoute = route.TbmRouteGroupCalendar.filter(calendar => {
          return calendar.holidayType === '稼働'
        })

        const { name, routeName } = route

        const scheduledCount = Object.keys(scheduleByDateAndRoute).reduce((acc, date) => {
          return acc + (scheduleByDateAndRoute[date]?.[String(route.id)]?.length ?? 0)
        }, 0)

        const RouteCl = new TbmRouteCl(route)
        const customer = RouteCl.Customer
        const timeRange = RouteCl.timeRange

        return {
          csvTableRow: [
            // ルート情報（固定列）
            {
              label: '便',
              cellValue: (
                <div>
                  <R_Stack className={`  justify-between flex-nowrap`}>
                    <R_Stack className={`gap-0.5`}>
                      <span>{i + 1}.</span>
                      <strong>{route.name}</strong>
                    </R_Stack>

                    <CalendarIcon
                      className="text-xs text-blue-600 hover:underline h-5 onHover"
                      onClick={() => {
                        setModalOpen({
                          tbmBase,
                          tbmRouteGroup: route,
                          isBulkAssignment: true,
                        })
                      }}
                    />
                  </R_Stack>

                  <div className="text-xs text-gray-700 text-end w-full">
                    <span>{route.code}</span>
                    <span>{route.serviceNumber}</span>
                    <span>{routeName}</span>
                  </div>
                  <div className="text-xs text-gray-700 text-end w-full">
                    <R_Stack className={` justify-end`}>
                      <div>{timeRange}</div>
                      <div>({scheduledCount})</div>
                    </R_Stack>
                  </div>
                  <div className="text-[10px] text-gray-400 text-end w-full">
                    <R_Stack className={` justify-end`}>
                      <div>{customer?.name}</div>
                    </R_Stack>
                  </div>
                </div>
              ),
              style: {
                ...STICKY_COLUMN_STYLE,
                minWidth: 240,
              },
            },
            // 日付別セル
            ...days.map(date => {
              const must = workingDaysOfRoute.find(calendar => {
                return formatDate(calendar.date) === formatDate(date)
              })

              const scheduleListOnDate = scheduleByDateAndRoute[formatDate(date)]?.[String(route.id)] ?? []

              const cellStyle = must ? { backgroundColor: '#fff1cd' } : undefined

              return {
                ...TableRowBuilder.buildDateCell({
                  date,
                  scheduleListOnDate,
                  tbmRouteGroup: route,
                  mode,
                  tbmBase,
                  holidays,
                  fetchData,
                  setModalOpen,
                  query,
                  cellStyle: {},
                  // user: rout,
                }),
              }
            }),
          ],
        }
      })
  },

  // 日付セルの共通ビルダー
  buildDateCell: (params: DateCellBuilderParams) => {
    const { date, scheduleListOnDate, user, tbmRouteGroup, mode, tbmBase, holidays, fetchData, setModalOpen, query, cellStyle } =
      params
    const dateStr = formatDate(date, 'M/D(ddd)')
    const isHoliday = Days.day.isHoliday(date, holidays)
    const thStyle = { ...HEADER_STYLE, ...isHoliday?.style }

    return {
      label: (
        <div id={`#${dateStr}`} style={cellStyle}>
          <DateThCell
            {...{
              tbmBase,
              mode,
              date,
              userList: user ? [user] : [],
              scheduleListOnDate,
              doTransaction,
              fetchData,
            }}
          >
            {dateStr}
          </DateThCell>
        </div>
      ),
      cellValue: (
        <HaishaCard
          {...{
            fetchData,
            setModalOpen,
            scheduleListOnDate,
            user,
            tbmRouteGroup,
            date,
            tbmBase,
          }}
        />
      ),
      thStyle,
      style: cellStyle,
    }
  },
}
