'use client'

import { useState, useCallback } from 'react'
import { Calendar, MapPin, Plus, LogOut, CircleDot, Bell } from 'lucide-react'
import { signOut } from 'next-auth/react'
import useModal from '@cm/components/utils/modal/useModal'
import HomeTab from './HomeTab'
import CourtsTab from './CourtsTab'
import EventDetailModal from './EventDetailModal'
import EventFormModal from './EventFormModal'
import UserAvatar from './UserAvatar'
import { getEventsByRange } from '../_actions/event-actions'
import { createEvent, updateEvent, deleteEvent, toggleCourtStatus } from '../_actions/event-actions'
import { upsertAttendance, updateAttendanceComment, removeAttendance } from '../_actions/attendance-actions'
import { notifyAttendanceChange, notifyEventCreated } from '../_actions/line-notify-actions'
import type { TennisEventWithRelations, TennisCourtWithRelations, TennisMember, AttendanceStatus, EventFormData, EventCourtInput } from '../lib/types'
import { ATTENDANCE_DISPLAY } from '../lib/types'
import { STATUS_CONFIG } from '../lib/constants'
import { HREF } from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

type TabId = 'home' | 'courts'

type Props = {
  initialEvents: TennisEventWithRelations[]
  initialCourts: TennisCourtWithRelations[]
  members: TennisMember[]
  userId: number
  userName: string
  userAvatar: string | null
  initialFrom: string
  initialTo: string
}

export default function TennisApp({ initialEvents, initialCourts, members, userId, userName, userAvatar, initialFrom, initialTo }: Props) {
  const { query } = useGlobal()
  const [events, setEvents] = useState(initialEvents)
  const [courts, setCourts] = useState(initialCourts)
  const [activeTab, setActiveTab] = useState<TabId>('home')

  // 表示期間
  const [dateFrom, setDateFrom] = useState(initialFrom)
  const [dateTo, setDateTo] = useState(initialTo)

  // カレンダー状態
  const [calendarDate, setCalendarDate] = useState(() => new Date())
  const calYear = calendarDate.getFullYear()
  const calMonth = calendarDate.getMonth()

  // モーダル
  const eventDetailModal = useModal<number>()
  const createEventModal = useModal()
  const editEventModal = useModal<number>()

  // 出欠確認モーダル
  const confirmAttendanceModal = useModal()
  const [pendingAttendance, setPendingAttendance] = useState<{ eventId: number; status: AttendanceStatus } | null>(null)

  // 削除確認モーダル
  const confirmDeleteModal = useModal()
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  // フォーム初期データ
  const [createInitialData, setCreateInitialData] = useState<EventFormData | null>(null)
  const [editInitialData, setEditInitialData] = useState<EventFormData | null>(null)

  const selectedEvent = eventDetailModal.open ? events.find((e) => e.id === eventDetailModal.open) ?? null : null

  // 期間変更時にデータ再取得
  const fetchEvents = useCallback(async (from: string, to: string) => {
    const data = await getEventsByRange(from, to)
    setEvents(data)
  }, [])

  const handleDateFromChange = (value: string) => {
    setDateFrom(value)
    if (value && dateTo && value <= dateTo) {
      fetchEvents(value, dateTo)
    }
  }

  const handleDateToChange = (value: string) => {
    setDateTo(value)
    if (dateFrom && value && dateFrom <= value) {
      fetchEvents(dateFrom, value)
    }
  }

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calYear, calMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setCalendarDate(new Date(calYear, calMonth + 1, 1))
  }

  // 出欠操作（確認モーダル経由）
  const handleAttendanceRequest = (eventId: number, status: AttendanceStatus) => {
    setPendingAttendance({ eventId, status })
    confirmAttendanceModal.handleOpen()
  }

  const handleAttendanceConfirm = async () => {
    if (!pendingAttendance) return
    const { eventId, status } = pendingAttendance
    confirmAttendanceModal.handleClose()
    setPendingAttendance(null)

    const event = events.find((e) => e.id === eventId)
    if (!event) return

    const existing = event.TennisAttendance.find((a) => a.userId === userId)

    if (existing && existing.status === status) {
      // 同じステータスで再度押したら取り消し
      await removeAttendance(eventId, userId)
      setEvents((prev) =>
        prev.map((ev) => (ev.id === eventId ? { ...ev, TennisAttendance: ev.TennisAttendance.filter((a) => a.userId !== userId) } : ev))
      )
      // LINE通知（取り消し）
      notifyAttendanceChange(eventId, userId, null).catch(console.error)
    } else {
      const result = await upsertAttendance(eventId, userId, status)
      setEvents((prev) =>
        prev.map((ev) => {
          if (ev.id !== eventId) return ev
          const existingIdx = ev.TennisAttendance.findIndex((a) => a.userId === userId)
          const newAttendance = { ...result, User: { id: userId, name: userName, avatar: userAvatar } }
          if (existingIdx >= 0) {
            const updated = [...ev.TennisAttendance]
            updated[existingIdx] = newAttendance
            return { ...ev, TennisAttendance: updated }
          }
          return { ...ev, TennisAttendance: [...ev.TennisAttendance, newAttendance] }
        })
      )
      // LINE通知
      notifyAttendanceChange(eventId, userId, status).catch(console.error)
    }
  }

  // コメント保存
  const handleSaveComment = async (eventId: number, comment: string) => {
    await updateAttendanceComment(eventId, userId, comment)
    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, TennisAttendance: ev.TennisAttendance.map((a) => (a.userId === userId ? { ...a, comment } : a)) } : ev))
    )
  }

  // コートステータス切り替え
  const handleToggleCourtStatus = async (eventId: number, eventCourtId: number) => {
    const result = await toggleCourtStatus(eventCourtId)
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev
        return {
          ...ev,
          TennisEventCourt: ev.TennisEventCourt.map((ec) =>
            ec.id === eventCourtId ? { ...ec, status: result.status, TennisCourt: result.TennisCourt } : ec
          ),
        }
      })
    )
  }

  // イベント作成
  const handleCreateEvent = async (data: EventFormData) => {
    const created = await createEvent(data, userId)
    notifyEventCreated(created.id).catch(console.error)
    fetchEvents(dateFrom, dateTo)
  }

  // イベント編集開始
  const handleStartEdit = (eventId: number) => {
    const ev = events.find((e) => e.id === eventId)
    if (!ev) return
    const dateStr = formatDate(ev.date, 'YYYY-MM-DD') as string
    setEditInitialData({
      title: ev.title,
      date: dateStr,
      startTime: ev.startTime,
      endTime: ev.endTime,
      courts: ev.TennisEventCourt.map((ec) => ({
        courtId: ec.tennisCourtId,
        courtNumber: ec.courtNumber,
        status: ec.status as 'planned' | 'reserved',
      })),
      memo: ev.memo || '',
    })
    eventDetailModal.handleClose()
    setTimeout(() => editEventModal.handleOpen(eventId), 150)
  }

  // イベント更新
  const handleUpdateEvent = async (data: EventFormData) => {
    if (!editEventModal.open) return
    await updateEvent(editEventModal.open as number, data)
    fetchEvents(dateFrom, dateTo)
  }

  // イベント削除リクエスト
  const handleDeleteRequest = (eventId: number) => {
    setPendingDeleteId(eventId)
    eventDetailModal.handleClose()
    setTimeout(() => confirmDeleteModal.handleOpen(), 150)
  }

  // イベント削除確定
  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return
    confirmDeleteModal.handleClose()
    await deleteEvent(pendingDeleteId)
    setEvents((prev) => prev.filter((e) => e.id !== pendingDeleteId))
    setPendingDeleteId(null)
  }

  // カレンダーの日付から予定作成
  const handleCreateFromDate = (dateStr: string) => {
    setCreateInitialData({ title: '練習', date: dateStr, startTime: '07:00', endTime: '09:00', courts: [], memo: '' })
    createEventModal.handleOpen()
  }

  const handleOpenCreate = () => {
    setCreateInitialData(null)
    createEventModal.handleOpen()
  }

  const handleLogout = () => {
    if (confirm('ログアウトしますか？')) {
      signOut({ redirect: HREF('/tennis/login', {}, query) as any })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto relative">
      {/* ヘッダー */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
              <CircleDot className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800">Tennis</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${activeTab === 'home' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}
              `}
            >
              <Calendar className="w-3.5 h-3.5" />
              ホーム
            </button>
            <button
              onClick={() => setActiveTab('courts')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${activeTab === 'courts' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}
              `}
            >
              <MapPin className="w-3.5 h-3.5" />
              コート
            </button>
          </div>
        </div>
      </div>

      {/* ユーザー情報バー */}
      <div className="bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-between sticky top-[52px] z-30">
        <div className="flex items-center gap-2">
          <UserAvatar name={userName} avatar={userAvatar} size="sm" />
          <span className="text-sm font-medium text-slate-700">{userName}</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="/tennis/notify-test" className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
            <Bell className="w-3.5 h-3.5" />
            通知
          </a>

          <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            ログアウト
          </button>
        </div>
      </div>

      {/* 期間フィルター */}
      {activeTab === 'home' && (
        <div className="bg-white border-b border-slate-100 px-4 py-2 flex items-center gap-2">
          <span className="text-xs text-slate-500 shrink-0">期間</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => handleDateFromChange(e.target.value)}
            className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-300"
          />
          <span className="text-xs text-slate-400">〜</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => handleDateToChange(e.target.value)}
            className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-300"
          />
        </div>
      )}

      {/* タブコンテンツ */}
      {activeTab === 'home' && (
        <HomeTab
          events={events}
          userId={userId}
          calYear={calYear}
          calMonth={calMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onEventDetail={(id) => eventDetailModal.handleOpen(id)}
          onAttendance={handleAttendanceRequest}
          onToggleCourtStatus={handleToggleCourtStatus}
          onCreateFromDate={handleCreateFromDate}
        />
      )}
      {activeTab === 'courts' && <CourtsTab initialCourts={courts} onCourtsChange={setCourts} />}

      {/* FAB */}
      {activeTab === 'home' && (
        <button
          onClick={handleOpenCreate}
          data-guidance="add-event"
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-full shadow-lg shadow-emerald-200 flex items-center justify-center hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-40 max-w-lg"
          style={{ right: 'max(1.5rem, calc(50% - 240px + 1.5rem))' }}
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* モーダル群 */}
      <EventDetailModal
        modal={eventDetailModal}
        event={selectedEvent}
        userId={userId}
        members={members}
        onAttendance={handleAttendanceRequest}
        onSaveComment={handleSaveComment}
        onEdit={handleStartEdit}
        onDelete={handleDeleteRequest}
      />

      <EventFormModal modal={createEventModal} courts={courts} initialData={createInitialData} onSubmit={handleCreateEvent} title="予定を作成" />

      <EventFormModal modal={editEventModal} courts={courts} initialData={editInitialData} onSubmit={handleUpdateEvent} title="予定を編集" />

      {/* 出欠確認モーダル */}
      <confirmAttendanceModal.Modal title="">
        {pendingAttendance && (() => {
          const ev = events.find((e) => e.id === pendingAttendance.eventId)
          const existing = ev?.TennisAttendance.find((a) => a.userId === userId)
          const isCancelling = existing?.status === pendingAttendance.status
          const config = STATUS_CONFIG[pendingAttendance.status]
          return (
            <div className="w-64 text-center">
              <p className="text-sm text-slate-700 mb-1">{ev?.title}</p>
              {isCancelling ? (
                <p className="text-base font-bold text-slate-600 mb-4">
                  {ATTENDANCE_DISPLAY[pendingAttendance.status]} {config.label}を取り消しますか？
                </p>
              ) : (
                <p className={`text-base font-bold ${config.color} mb-4`}>
                  {ATTENDANCE_DISPLAY[pendingAttendance.status]} {config.label}に変更しますか？
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => { confirmAttendanceModal.handleClose(); setPendingAttendance(null) }}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-500 bg-slate-100 hover:bg-slate-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAttendanceConfirm}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600"
                >
                  確定
                </button>
              </div>
            </div>
          )
        })()}
      </confirmAttendanceModal.Modal>

      {/* 削除確認モーダル */}
      <confirmDeleteModal.Modal title="">
        {pendingDeleteId && (() => {
          const ev = events.find((e) => e.id === pendingDeleteId)
          return (
            <div className="w-64 text-center">
              <p className="text-sm text-slate-700 mb-1">{ev?.title}</p>
              <p className="text-base font-bold text-red-500 mb-4">この予定を削除しますか？</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { confirmDeleteModal.handleClose(); setPendingDeleteId(null) }}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-500 bg-slate-100 hover:bg-slate-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600"
                >
                  削除する
                </button>
              </div>
            </div>
          )
        })()}
      </confirmDeleteModal.Modal>
    </div>
  )
}
