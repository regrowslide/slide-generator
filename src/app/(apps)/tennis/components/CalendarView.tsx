'use client'

import {useMemo} from 'react'
import {ChevronLeft, ChevronRight} from 'lucide-react'
import type {TennisEventWithRelations, AttendanceStatus} from '../lib/types'
import {ATTENDANCE_DISPLAY} from '../lib/types'
import {STATUS_CONFIG} from '../lib/constants'

type Props = {
  year: number
  month: number // 0-based
  events: TennisEventWithRelations[]
  userId: number
  onPrevMonth: () => void
  onNextMonth: () => void
  onDateClick: (dateStr: string) => void
}

const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay()
  const days: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d)
  return days
}

export default function CalendarView({year, month, events, userId, onPrevMonth, onNextMonth, onDateClick}: Props) {
  const calendarDays = useMemo(() => generateCalendarDays(year, month), [year, month])

  // 日付ごとのイベント情報マップ（件数 + 自分の参加状況）
  type DateInfo = { count: number; myStatuses: (AttendanceStatus | 'none')[] }
  const eventInfoByDate = useMemo(() => {
    const map: Record<string, DateInfo> = {}
    events.forEach((ev) => {
      const d = new Date(ev.date)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (!map[dateStr]) map[dateStr] = { count: 0, myStatuses: [] }
      map[dateStr].count++
      const myAtt = ev.TennisAttendance.find((a) => a.userId === userId)
      map[dateStr].myStatuses.push(myAtt ? (myAtt.status as AttendanceStatus) : 'none')
    })
    return map
  }, [events, userId])

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="bg-white mx-3 mt-3 rounded-2xl shadow-sm border border-slate-100 overflow-hidden" data-guidance="calendar">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onPrevMonth} className="p-2 hover:bg-slate-100 rounded-full">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h3 className="text-base font-bold text-slate-800">
          {year}年{month + 1}月
        </h3>
        <button onClick={onNextMonth} className="p-2 hover:bg-slate-100 rounded-full">
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-t border-slate-100">
        {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
          <div key={d} className={`text-center text-xs font-medium py-2 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border-t border-slate-100">
        {calendarDays.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="h-14" />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const info = eventInfoByDate[dateStr]
          const isToday = dateStr === todayStr
          const dayOfWeek = new Date(year, month, day).getDay()

          return (
            <button key={dateStr} onClick={() => onDateClick(dateStr)} className="h-14 flex flex-col items-center justify-center relative transition-colors hover:bg-slate-50">
              <span
                className={`text-sm leading-none
                  ${isToday ? 'bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold' : ''}
                  ${!isToday && dayOfWeek === 0 ? 'text-red-400' : ''}
                  ${!isToday && dayOfWeek === 6 ? 'text-blue-400' : ''}
                  ${!isToday && dayOfWeek !== 0 && dayOfWeek !== 6 ? 'text-slate-700' : ''}
                `}
              >
                {day}
              </span>
              {info && (
                <div className="flex gap-0.5 mt-0.5">
                  {info.myStatuses.slice(0, 3).map((s, i) => {
                    if (s === 'none') return <span key={i} className="text-[10px] font-bold text-slate-300">?</span>
                    const color = s === 'yes' ? 'text-emerald-500' : s === 'maybe' ? 'text-amber-500' : 'text-red-400'
                    return <span key={i} className={`text-[10px] font-bold ${color}`}>{ATTENDANCE_DISPLAY[s]}</span>
                  })}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
