'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, Users, MessageCircle, Edit3, Trash2, Navigation, ExternalLink } from 'lucide-react'
import useModal from '@cm/components/utils/modal/useModal'
import AttendanceButtons from './AttendanceButtons'
import type { TennisEventWithRelations, TennisMember, AttendanceStatus } from '../lib/types'
import { ATTENDANCE_DISPLAY, COURT_STATUS_DISPLAY } from '../lib/types'
import { STATUS_CONFIG, SCHEDULE_PAGE_OPTIONS } from '../lib/constants'
import UserAvatar from './UserAvatar'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

type Props = {
  modal: ReturnType<typeof useModal<number>>
  event: TennisEventWithRelations | null
  userId: number
  members: TennisMember[]
  onAttendance: (eventId: number, status: AttendanceStatus) => void
  onSaveComment: (eventId: number, comment: string) => void
  onEdit: (eventId: number) => void
  onDelete: (eventId: number) => void
}

const STATUSES: AttendanceStatus[] = ['yes', 'maybe', 'no']

export default function EventDetailModal({ modal, event, userId, members, onAttendance, onSaveComment, onEdit, onDelete }: Props) {
  const [commentInput, setCommentInput] = useState('')
  const [showComment, setShowComment] = useState(false)

  if (!event) return <modal.Modal title="">{null}</modal.Modal>

  const counts = { yes: 0, maybe: 0, no: 0 }
  event.TennisAttendance.forEach((a) => {
    const s = a.status as AttendanceStatus
    if (counts[s] !== undefined) counts[s]++
  })

  const myAttendance = event.TennisAttendance.find((a) => a.userId === userId)
  const isCreator = event.creatorId === userId

  // コート場所ごとにグループ化
  const courtGroups = new Map<number, typeof event.TennisEventCourt>()
  event.TennisEventCourt.forEach((ec) => {
    const list = courtGroups.get(ec.tennisCourtId) || []
    list.push(ec)
    courtGroups.set(ec.tennisCourtId, list)
  })

  // 未回答者
  const respondedIds = new Set(event.TennisAttendance.map((a) => a.userId))
  const notResponded = members.filter((m) => !respondedIds.has(m.id))

  // ステータス別グループ
  const attendanceByStatus: Record<AttendanceStatus, typeof event.TennisAttendance> = { yes: [], maybe: [], no: [] }
  event.TennisAttendance.forEach((a) => {
    const s = a.status as AttendanceStatus
    if (attendanceByStatus[s]) attendanceByStatus[s].push(a)
  })

  return (
    <modal.Modal title="">
      <div className="-mt-2 w-72 max-w-[70vw]">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800">{event.title}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <UserAvatar name={event.Creator.name} avatar={event.Creator.avatar} userId={event.creatorId} size="xs" />
            <span className="text-xs text-slate-500">{event.Creator.name} が作成</span>
          </div>
        </div>

        <div className="space-y-2.5 mb-5">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-slate-700">{formatDate(event.date, 'YYYY年M月D日(ddd)')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-slate-700">
              {event.startTime} 〜 {event.endTime}
            </span>
          </div>
          {courtGroups.size > 0 && <div className="flex items-start gap-3 text-sm">
            <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              {Array.from(courtGroups.entries()).map(([courtId, entries]) => {
                const court = entries[0].TennisCourt
                const schedulePage = court.schedulePageKey ? SCHEDULE_PAGE_OPTIONS.find((o) => o.key === court.schedulePageKey) : null
                const dateStr = formatDate(event.date, 'YYYY-MM-DD') as string
                return (
                  <div key={courtId} className="space-y-2  shadow p-1.5 border border-gray-200  rounded-md">
                    <div className="flex items-center gap-2 justify-between">
                      <span className="text-slate-700">{court.name}</span>
                      <div className="flex items-center gap-2">
                        {schedulePage && (
                          <a href={schedulePage.getSchedulePageUrl(dateStr)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-xs text-blue-600 hover:underline">
                            <Calendar className="w-3 h-3" />
                            空き状況
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {court.googleMapsUrl && (
                          <a href={court.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-xs text-emerald-600 hover:underline">
                            <Navigation className="w-3 h-3" />
                            地図
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>


                    <div className="flex flex-wrap gap-1 mt-0.5 ml-1">
                      {entries.map((ec) => (
                        <span
                          key={ec.id}
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${ec.status === 'reserved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                        >
                          {ec.courtNumber}番 {COURT_STATUS_DISPLAY[ec.status as 'planned' | 'reserved']}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>}
        </div>

        {event.memo && <div className="bg-slate-50 rounded-xl p-3 mb-5 text-sm text-slate-600">{event.memo}</div>}

        {/* 出欠ボタン */}
        <div className="bg-emerald-50 rounded-xl p-3 mb-5">

          <AttendanceButtons currentStatus={myAttendance?.status as AttendanceStatus | undefined} onSelect={(status) => onAttendance(event.id, status)} />

          {myAttendance && !showComment && (
            <button
              onClick={() => {
                setCommentInput(myAttendance.comment || '')
                setShowComment(true)
              }}
              className="flex items-center gap-1.5 mt-3 text-xs text-emerald-600 hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {myAttendance.comment ? `コメント: ${myAttendance.comment}` : 'コメントを追加'}
            </button>
          )}

          {showComment && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="一言コメント（任意）"
                className="flex-1 text-sm border border-emerald-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
              <button
                onClick={() => {
                  onSaveComment(event.id, commentInput)
                  setShowComment(false)
                }}
                className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600"
              >
                保存
              </button>
            </div>
          )}
        </div>

        {/* 参加者一覧 */}
        <div>
          {/* サマリー */}
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-slate-500" />
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-600 font-bold">{ATTENDANCE_DISPLAY.yes}{counts.yes}</span>
              <span className="text-amber-500 font-bold">{ATTENDANCE_DISPLAY.maybe}{counts.maybe}</span>
              <span className="text-red-400 font-bold">{ATTENDANCE_DISPLAY.no}{counts.no}</span>
              {notResponded.length > 0 && <span className="text-slate-300">?{notResponded.length}</span>}
            </div>
          </div>

          {/* 参加者（目立たせる） */}
          {attendanceByStatus.yes.length > 0 && (
            <div className="mb-2">
              <div className="space-y-0.5">
                {attendanceByStatus.yes.map((a) => (
                  <div key={a.userId} className="flex items-center gap-2 py-1 px-1">
                    <UserAvatar name={a.User.name} avatar={a.User.avatar} userId={a.userId} size="sm" />
                    <span className="text-sm text-slate-700">{a.User.name}</span>
                    {a.comment && <span className="text-xs text-slate-400 ml-auto max-w-[100px] truncate">{a.comment}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 未定・不参加・未回答（小さく薄く） */}
          {(attendanceByStatus.maybe.length > 0 || attendanceByStatus.no.length > 0 || notResponded.length > 0) && (
            <div className="border-t border-slate-100 pt-2 mt-1 space-y-1">
              {attendanceByStatus.maybe.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-amber-500 font-medium w-4">{ATTENDANCE_DISPLAY.maybe}</span>
                  {attendanceByStatus.maybe.map((a) => (
                    <span key={a.userId} className="text-[11px] text-slate-400">{a.User.name}</span>
                  ))}
                </div>
              )}
              {attendanceByStatus.no.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-red-400 font-medium w-4">{ATTENDANCE_DISPLAY.no}</span>
                  {attendanceByStatus.no.map((a) => (
                    <span key={a.userId} className="text-[11px] text-slate-400">{a.User.name}</span>
                  ))}
                </div>
              )}
              {notResponded.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-slate-300 font-medium w-4">?</span>
                  {notResponded.map((m) => (
                    <span key={m.id} className="text-[11px] text-slate-300">{m.name}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {isCreator && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button onClick={() => onEdit(event.id)} className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              <Edit3 className="w-3.5 h-3.5" />
              この予定を編集
            </button>
            <button onClick={() => onDelete(event.id)} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500">
              <Trash2 className="w-3.5 h-3.5" />
              削除
            </button>
          </div>
        )}
      </div>
    </modal.Modal>
  )
}
