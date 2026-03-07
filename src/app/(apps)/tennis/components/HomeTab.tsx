'use client'

import { useState, useMemo } from 'react'
import { LayoutList, Calendar, Clock, MapPin, Plus } from 'lucide-react'
import useModal from '@cm/components/utils/modal/useModal'
import CalendarView from './CalendarView'
import EventCard from './EventCard'
import AttendanceButtons from './AttendanceButtons'
import type { TennisEventWithRelations, AttendanceStatus } from '../lib/types'
import { ATTENDANCE_DISPLAY } from '../lib/types'
import { getMidnight } from '@cm/class/Days/date-utils/calculations'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

type HomeViewMode = 'list' | 'calendar'

type Props = {
  events: TennisEventWithRelations[]
  userId: number
  calYear: number
  calMonth: number
  onPrevMonth: () => void
  onNextMonth: () => void
  onEventDetail: (eventId: number) => void
  onAttendance: (eventId: number, status: AttendanceStatus) => void
  onToggleCourtStatus: (eventId: number, eventCourtId: number) => void
  onCreateFromDate: (dateStr: string) => void
}



export default function HomeTab({ events, userId, calYear, calMonth, onPrevMonth, onNextMonth, onEventDetail, onAttendance, onToggleCourtStatus, onCreateFromDate }: Props) {
  const [viewMode, setViewMode] = useState<HomeViewMode>('list')
  const dateEventsModal = useModal<string>()

  // 直近の予定（今日以降）
  const upcomingEvents = useMemo(() => {
    const now = getMidnight()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    return events
      .filter((ev) => {
        const date = formatDate(ev.date)


        return date >= todayStr
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime() || a.startTime.localeCompare(b.startTime))
  }, [events])


  // 日付クリック時のイベント取得
  const getEventsForDate = (dateStr: string) => {
    return events.filter((ev) => {
      const d = new Date(ev.date)
      const evDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      return evDateStr === dateStr
    })
  }

  const handleDateClick = (dateStr: string) => {
    dateEventsModal.handleOpen(dateStr)
  }

  const dateEvents = dateEventsModal.open ? getEventsForDate(dateEventsModal.open) : []

  return (
    <div className="pb-24">
      {/* サブタブ */}
      <div className="flex mx-3 mt-3 bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all
            ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
          `}
        >
          <LayoutList className="w-4 h-4" />
          リスト
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all
            ${viewMode === 'calendar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
          `}
        >
          <Calendar className="w-4 h-4" />
          カレンダー
        </button>
      </div>

      {viewMode === 'list' && (
        <div className="mx-3 mt-3" data-guidance="event-list">
          {upcomingEvents.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 p-6 text-center text-sm text-slate-400">予定はまだありません</div>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((ev) => (
                <EventCard key={ev.id} event={ev} userId={userId} onDetail={onEventDetail} onAttendance={onAttendance} onToggleCourtStatus={onToggleCourtStatus} />
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'calendar' && (
        <CalendarView year={calYear} month={calMonth} events={events} userId={userId} onPrevMonth={onPrevMonth} onNextMonth={onNextMonth} onDateClick={handleDateClick} />
      )}

      {/* 日付選択モーダル */}
      <dateEventsModal.Modal title={dateEventsModal.open || ''}>
        {dateEventsModal.open && (
          <div>
            {dateEvents.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">この日の予定はありません</p>
                <button
                  onClick={() => {
                    const d = dateEventsModal.open!
                    dateEventsModal.handleClose()
                    onCreateFromDate(d)
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full hover:bg-emerald-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  予定を作成
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {dateEvents.map((ev) => {
                  const counts = { yes: 0, maybe: 0, no: 0 }
                  ev.TennisAttendance.forEach((a) => {
                    const s = a.status as AttendanceStatus
                    if (counts[s] !== undefined) counts[s]++
                  })
                  const courtLabels = ev.TennisEventCourt.map((ec) => `${ec.TennisCourt.name} ${ec.courtNumber}番`).join('、')
                  const myAtt = ev.TennisAttendance.find((a) => a.userId === userId)

                  return (
                    <div key={ev.id} className="bg-slate-50 rounded-xl overflow-hidden">
                      <button
                        onClick={() => {
                          dateEventsModal.handleClose()
                          setTimeout(() => onEventDetail(ev.id), 150)
                        }}
                        className="w-full text-left p-3 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-slate-800 text-sm">{ev.title}</h5>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {ev.startTime}〜{ev.endTime}
                              </span>
                            </div>
                            {courtLabels && (
                              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{courtLabels}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 text-xs">
                            <span className="text-emerald-600 font-bold">{ATTENDANCE_DISPLAY.yes}{counts.yes}</span>
                            <span className="text-amber-600 font-bold">{ATTENDANCE_DISPLAY.maybe}{counts.maybe}</span>
                            <span className="text-red-400 font-bold">{ATTENDANCE_DISPLAY.no}{counts.no}</span>
                          </div>
                        </div>
                      </button>
                      <div className="border-t border-slate-200/50 px-3 py-2">
                        <AttendanceButtons currentStatus={myAtt?.status as AttendanceStatus | undefined} onSelect={(status) => onAttendance(ev.id, status)} compact />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </dateEventsModal.Modal>
    </div>
  )
}
