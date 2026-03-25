'use client'

import { useState, useMemo } from 'react'
import StaffBadge from './StaffBadge'
import {
  MOCK_CLIENTS,
  MOCK_STAFF,
  MOCK_ASSIGNMENTS,
  MOCK_AVAILABILITY,
} from '../lib/mock-data'

type Props = {
  year: number
  month: number
}

const ShiftTab = ({ year, month }: Props) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // 月の日数
  const daysInMonth = new Date(year, month, 0).getDate()
  const dates = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  })

  // 曜日取得
  const getDayOfWeek = (dateStr: string) => {
    const d = new Date(dateStr)
    return ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  }

  const isWeekend = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.getDay() === 0 || d.getDay() === 6
  }

  // 日付ごとの空きスタッフ
  const availabilityByDate = useMemo(() => {
    const map = new Map<string, number[]>()
    for (const a of MOCK_AVAILABILITY) {
      const existing = map.get(a.date) || []
      existing.push(a.staffId)
      map.set(a.date, existing)
    }
    return map
  }, [])

  // 日付ごとの配置データ
  const assignmentsByDateClient = useMemo(() => {
    const map = new Map<string, typeof MOCK_ASSIGNMENTS>()
    for (const a of MOCK_ASSIGNMENTS) {
      const key = `${a.date}_${a.clientId}`
      const existing = map.get(key) || []
      existing.push(a)
      map.set(key, existing)
    }
    return map
  }, [])

  // 配置済みスタッフID（日付別）
  const assignedByDate = useMemo(() => {
    const map = new Map<string, Set<number>>()
    for (const a of MOCK_ASSIGNMENTS) {
      const existing = map.get(a.date) || new Set()
      existing.add(a.staffId)
      map.set(a.date, existing)
    }
    return map
  }, [])

  return (
    <div className="space-y-6">
      {/* 空きスタッフパネル */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          空きスタッフ
        </h2>
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* 日付ヘッダー */}
            <div className="flex border-b border-gray-100 pb-2 mb-2">
              <div className="w-16 shrink-0" />
              {dates.map((date) => {
                const day = parseInt(date.split('-')[2])
                const dow = getDayOfWeek(date)
                const weekend = isWeekend(date)
                return (
                  <div
                    key={date}
                    className={`w-24 shrink-0 text-center text-xs cursor-pointer rounded px-1 py-0.5 ${
                      selectedDate === date ? 'bg-emerald-100' : ''
                    } ${weekend ? 'text-red-500' : 'text-gray-500'}`}
                    onClick={() => setSelectedDate(selectedDate === date ? null : date)}
                  >
                    <div className="font-medium">{day}</div>
                    <div>{dow}</div>
                  </div>
                )
              })}
            </div>

            {/* 空きスタッフ行 */}
            <div className="flex">
              <div className="w-16 shrink-0 text-xs text-gray-400 pt-1">名前</div>
              {dates.map((date) => {
                const availableIds = availabilityByDate.get(date) || []
                const assignedIds = assignedByDate.get(date) || new Set()
                // 空きスタッフ = 稼働可能 & 未配置
                const freeStaff = availableIds
                  .filter((id) => !assignedIds.has(id))
                  .map((id) => MOCK_STAFF.find((s) => s.id === id))
                  .filter(Boolean)

                return (
                  <div key={date} className="w-24 shrink-0 px-0.5">
                    <div className="flex flex-col gap-0.5">
                      {freeStaff.slice(0, 4).map((staff) => (
                        <StaffBadge
                          key={staff!.id}
                          name={staff!.name}
                          variant="available"
                        />
                      ))}
                      {freeStaff.length > 4 && (
                        <span className="text-[10px] text-gray-400 text-center">
                          +{freeStaff.length - 4}
                        </span>
                      )}
                      {freeStaff.length === 0 && (
                        <span className="text-[10px] text-gray-300 text-center">-</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* クライアント別配置カレンダー */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          配置表
        </h2>
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* 日付ヘッダー */}
            <div className="flex border-b border-gray-200 pb-2 mb-2 sticky top-0 bg-white z-10">
              <div className="w-36 shrink-0 text-xs font-medium text-gray-500">
                クライアント
              </div>
              {dates.map((date) => {
                const day = parseInt(date.split('-')[2])
                const dow = getDayOfWeek(date)
                const weekend = isWeekend(date)
                return (
                  <div
                    key={date}
                    className={`w-24 shrink-0 text-center text-xs ${
                      weekend ? 'text-red-500' : 'text-gray-500'
                    }`}
                  >
                    <div className="font-medium">{day}</div>
                    <div>{dow}</div>
                  </div>
                )
              })}
            </div>

            {/* クライアント行 */}
            {MOCK_CLIENTS.map((client) => (
              <div
                key={client.id}
                className="flex border-b border-gray-50 py-1.5 hover:bg-gray-50/50"
              >
                <div className="w-36 shrink-0 pr-2">
                  <div className="text-xs font-medium text-gray-700 truncate">
                    {client.name}
                  </div>
                  <div className="text-[10px] text-gray-400">{client.location}</div>
                </div>
                {dates.map((date) => {
                  const key = `${date}_${client.id}`
                  const assignments = assignmentsByDateClient.get(key) || []

                  return (
                    <div
                      key={date}
                      className={`w-24 shrink-0 px-0.5 ${
                        isWeekend(date) ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        {assignments.map((a) => {
                          const staff = MOCK_STAFF.find(
                            (s) => s.id === a.staffId
                          )
                          return (
                            <StaffBadge
                              key={a.id}
                              name={staff?.name || '?'}
                              roleId={a.roleId}
                              variant="assigned"
                            />
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShiftTab
