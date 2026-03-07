'use client'

import type React from 'react'
import { Clock, MapPin, ExternalLink, AlertTriangle, ChevronRight, Calendar } from 'lucide-react'
import AttendanceButtons from './AttendanceButtons'
import type { TennisEventWithRelations, AttendanceStatus } from '../lib/types'
import { ATTENDANCE_DISPLAY, COURT_STATUS_DISPLAY } from '../lib/types'
import { SCHEDULE_PAGE_OPTIONS } from '../lib/constants'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

type Props = {
  event: TennisEventWithRelations
  userId: number
  onDetail: (eventId: number) => void
  onAttendance: (eventId: number, status: AttendanceStatus) => void
  onToggleCourtStatus: (eventId: number, eventCourtId: number) => void
}

// コート予約状況の説明テキスト
function getCourtStatusInfo(event: TennisEventWithRelations): { text: string; color: string; show: boolean; icon?: React.ReactNode } | null {
  if (!event.TennisEventCourt || event.TennisEventCourt.length === 0) {
    return {
      text: 'コート未定（会場調整中）',
      color: 'text-red-500',
      show: true,
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400 inline shrink-0" />
    }
  }
  const reserved = event.TennisEventCourt.filter((ec) => ec.status === 'reserved').length
  const required = event.TennisEventCourt.length

  if (reserved === 0) {
    return {
      text: 'コート予約が必要です',
      color: 'text-yellow-600',
      show: true,
      icon: <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 inline shrink-0" />
    }
  }
  if (reserved < required) {
    return {
      text: `一部予約未了（${reserved}/${required}）`,
      color: 'text-amber-600',
      show: true,
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500 inline shrink-0" />
    }
  }
  return null
}

export default function EventCard({ event, userId, onDetail, onAttendance, onToggleCourtStatus }: Props) {
  const counts = { yes: 0, maybe: 0, no: 0 }
  event.TennisAttendance.forEach((a) => {
    const s = a.status as AttendanceStatus
    if (counts[s] !== undefined) counts[s]++
  })

  const myAttendance = event.TennisAttendance.find((a) => a.userId === userId)

  // カード色
  const hasCourts = event.TennisEventCourt.length > 0
  const allReserved = hasCourts && event.TennisEventCourt.every((ec) => ec.status === 'reserved')
  const cardStyle = !hasCourts
    ? 'bg-red-50/50 border-red-100'
    : allReserved
      ? 'bg-blue-50/40 border-blue-100'
      : 'bg-amber-50/40 border-amber-100'

  const courtStatusInfo = getCourtStatusInfo(event)
  const dateStr = formatDate(event.date, 'YYYY-MM-DD') as string

  // コートごとにグループ化（空き状況リンク用）
  const courtGroups = new Map<number, typeof event.TennisEventCourt>()
  event.TennisEventCourt.forEach((ec) => {
    const list = courtGroups.get(ec.tennisCourtId) || []
    list.push(ec)
    courtGroups.set(ec.tennisCourtId, list)
  })

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden transition-colors ${cardStyle}`}>
      {/* 日付・時間ヘッダー */}
      <div className="px-4 pt-3 pb-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-black text-slate-800 tracking-tight">{formatDate(event.date, 'M/D')}</span>
        <span className="text-sm font-bold text-slate-500">{formatDate(event.date, '(ddd)')}</span>
        <span className="text-lg font-bold text-slate-700 ml-1">{event.startTime}</span>
        <span className="text-sm text-slate-400">〜</span>
        <span className="text-lg font-bold text-slate-700">{event.endTime}</span>
      </div>

      {/* タイトル・出欠カウント */}
      <div className="px-4 pb-2 flex items-center justify-between gap-2">
        <h5 className="font-bold text-slate-600 text-sm">{event.title}</h5>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-emerald-600 font-bold text-lg leading-none">{counts.yes}</span>
          <span className="text-emerald-500 text-[10px] mr-2">参加</span>
          <span className="text-slate-400 font-medium text-xs leading-none">{counts.maybe}</span>
          <span className="text-slate-300 text-[10px] mr-1">未定</span>
          <span className="text-slate-400 font-medium text-xs leading-none">{counts.no}</span>
          <span className="text-slate-300 text-[10px]">不参加</span>
        </div>
      </div>

      <div className="px-4 pb-2">

        {/* コート警告 */}
        {courtStatusInfo && courtStatusInfo.show && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${courtStatusInfo.color}`}>
            {courtStatusInfo.icon}
            <span>{courtStatusInfo.text}</span>
          </div>
        )}
      </div>

      {/* コートアクションエリア */}
      {hasCourts && (
        <div className="px-4 pb-2">
          {Array.from(courtGroups.entries()).map(([courtId, entries]) => {
            const court = entries[0].TennisCourt
            const schedulePage = court.schedulePageKey
              ? SCHEDULE_PAGE_OPTIONS.find((o) => o.key === court.schedulePageKey)
              : null

            return (
              <div key={courtId} className="mt-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="text-xs font-medium text-slate-600">{court.name}</span>

                  {schedulePage && (
                    <a
                      href={schedulePage.getSchedulePageUrl(dateStr)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-0.5 text-[11px] text-blue-600 hover:underline "
                    >
                      <Calendar className="w-3 h-3" />
                      空き状況
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 ml-4.5">
                  {entries.map((ec) => (
                    <button
                      key={ec.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleCourtStatus(event.id, ec.id)
                      }}
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors
                        ${ec.status === 'reserved'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                    >
                      {ec.courtNumber}番 {COURT_STATUS_DISPLAY[ec.status as 'planned' | 'reserved']}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 出欠ボタン + 詳細ボタン */}
      <div className="border-t border-slate-100/60 px-4 py-2.5 flex items-center gap-2">
        <div className="flex-1">
          <AttendanceButtons currentStatus={myAttendance?.status as AttendanceStatus | undefined} onSelect={(status) => onAttendance(event.id, status)} compact />
        </div>
        <button
          onClick={() => onDetail(event.id)}
          className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full shrink-0 transition-colors"
        >
          詳細
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
