'use client'

import React, {useMemo} from 'react'
import {ChevronLeft, ChevronRight} from 'lucide-react'
import {StScheduleWithRelations} from '../../(server-actions)/schedule-actions'
import useModal from '@cm/components/utils/modal/useModal'

type Props = {
  schedules: StScheduleWithRelations[]
  currentDate: Date
  setCurrentDate: (date: Date) => void
}

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0]
}

export const MonthlyView = ({schedules, currentDate, setCurrentDate}: Props) => {
  const ScheduleDetailModal = useModal<{schedules: StScheduleWithRelations[]; dateStr: string} | null>()

  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // 日付ごとにスケジュールをグループ化
  const schedulesByDate = useMemo(() => {
    const map = new Map<string, StScheduleWithRelations[]>()
    schedules.forEach(s => {
      const dateStr = formatDate(s.date)
      if (!map.has(dateStr)) {
        map.set(dateStr, [])
      }
      map.get(dateStr)!.push(s)
    })
    return map
  }, [schedules])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const todayStr = formatDate(new Date())

  // カレンダーのセル配列を作成
  const days: {key: string; isBlank?: boolean; dateStr?: string; day?: number; isToday?: boolean; schedules?: StScheduleWithRelations[]}[] =
    []

  // 前月の空白セル
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({key: `prev-${i}`, isBlank: true})
  }

  // 当月のセル
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(new Date(year, month, d))
    days.push({
      key: dateStr,
      dateStr: dateStr,
      day: d,
      isToday: dateStr === todayStr,
      schedules: schedulesByDate.get(dateStr) || [],
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md border">
      {/* ヘッダー */}
      <div className="flex justify-between items-center p-3 border-b">
        <button onClick={handlePrevMonth} className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-semibold">
          {year}年 {month + 1}月
        </h3>
        <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-gray-100">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
          <div
            key={day}
            className={`p-2 text-center text-sm font-medium ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-600'}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7">
        {days.map(d => {
          if (d.isBlank) {
            return <div key={d.key} className="h-24 border-b border-r bg-gray-50"></div>
          }
          return (
            <div
              key={d.key}
              className={`h-28 border-b border-r p-1.5 overflow-y-auto relative cursor-pointer hover:bg-gray-50 ${
                d.schedules && d.schedules.length > 0 ? 'cursor-pointer' : ''
              }`}
              onClick={() => {
                if (d.schedules && d.schedules.length > 0) {
                  ScheduleDetailModal.handleOpen({schedules: d.schedules, dateStr: d.dateStr!})
                }
              }}
            >
              <span
                className={`text-sm font-medium ${
                  d.isToday ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-800'
                }`}
              >
                {d.day}
              </span>
              <div className="mt-1 space-y-0.5">
                {d.schedules?.slice(0, 3).map(s => (
                  <div key={s.id} className="p-0.5 bg-blue-500 text-white rounded text-[10px] truncate" title={s.organizationName || ''}>
                    {s.departureTime} {s.organizationName || '(未設定)'}
                  </div>
                ))}
                {d.schedules && d.schedules.length > 3 && (
                  <div className="text-[10px] text-gray-500">他 {d.schedules.length - 3}件</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* スケジュール詳細モーダル */}
      <ScheduleDetailModal.Modal>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">スケジュール詳細 ({ScheduleDetailModal.open?.dateStr})</h2>
          <div className="space-y-3">
            {ScheduleDetailModal.open?.schedules?.map(s => (
              <div key={s.id} className="p-3 border rounded-lg">
                <p className="font-semibold">
                  {s.departureTime} 〜 {s.returnTime}
                </p>
                <p className="text-lg font-bold">{s.organizationName || '(団体名未設定)'}</p>
                <p className="text-sm text-gray-600">行き先: {s.destination || '-'}</p>
                <p className="text-sm text-gray-600">車両: {s.StVehicle?.plateNumber || '不明'}</p>
                {s.remarks && <p className="text-sm text-gray-500 mt-1">備考: {s.remarks}</p>}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => ScheduleDetailModal.handleClose()}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              閉じる
            </button>
          </div>
        </div>
      </ScheduleDetailModal.Modal>
    </div>
  )
}

