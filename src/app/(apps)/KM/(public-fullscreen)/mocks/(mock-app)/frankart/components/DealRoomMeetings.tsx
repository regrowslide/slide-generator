'use client'

import React, { useState } from 'react'
import { Plus, Calendar, MapPin, Users, FileText, Mail, Check, ChevronDown, ChevronUp, Clock, CheckCircle2, Circle } from 'lucide-react'
import { useFrankartMockData } from '../context/MockDataContext'

type Props = { dealId: string }

const DealRoomMeetings: React.FC<Props> = ({ dealId }) => {
  const { meetings, updateMeeting, addMeeting, staff, deals } = useFrankartMockData()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  // フォローアップ済みの状態管理（Meeting型に無いのでローカルで管理）
  const [followedUpMap, setFollowedUpMap] = useState<Record<string, boolean>>({})

  // 新規商談フォーム
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newAttendees, setNewAttendees] = useState<string[]>([])
  const [newAgenda, setNewAgenda] = useState('')

  const deal = deals.find((d) => d.id === dealId)
  const dealMeetings = meetings.filter((m) => m.dealId === dealId)
  const today = new Date().toISOString().split('T')[0]

  const upcomingMeetings = dealMeetings
    .filter((m) => m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
  const pastMeetings = dealMeetings
    .filter((m) => m.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))

  const toggleFollowedUp = (id: string) => {
    setFollowedUpMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAdd = () => {
    if (!newDate || !newAgenda) return
    addMeeting({
      id: `mtg-${Date.now()}`,
      dealId,
      dealTitle: deal?.title || '',
      companyName: deal?.companyName || '',
      date: newDate,
      time: newTime || '10:00',
      location: newLocation || 'オンライン（Google Meet）',
      attendees: newAttendees.length > 0 ? newAttendees : deal?.assigneeIds.map(id => staff.find(s => s.id === id)?.name).filter(Boolean) as string[] || [],
      agenda: newAgenda,
      minutes: '',
      followUpDone: false,
    })
    setNewDate('')
    setNewTime('')
    setNewLocation('')
    setNewAttendees([])
    setNewAgenda('')
    setShowForm(false)
  }

  const toggleAttendee = (name: string) => {
    setNewAttendees((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const renderMeeting = (meeting: typeof meetings[0]) => {
    const expanded = expandedId === meeting.id
    const isPast = meeting.date < today
    const hasMinutes = meeting.minutes.trim().length > 0
    const isFollowedUp = followedUpMap[meeting.id] || false

    // 完了項目数
    const doneCount = [hasMinutes, meeting.followUpDone, isFollowedUp].filter(Boolean).length

    return (
      <div key={meeting.id} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setExpandedId(expanded ? null : meeting.id)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1.5 text-sm font-medium text-stone-800">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {meeting.date} {meeting.time}
              </span>
              {isPast && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  doneCount === 3
                    ? 'bg-emerald-100 text-emerald-700'
                    : doneCount > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-stone-100 text-stone-500'
                }`}>
                  {doneCount}/3完了
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {meeting.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {meeting.attendees.join(', ')}
              </span>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
        </button>

        {expanded && (
          <div className="px-5 pb-4 border-t border-stone-100 space-y-4 pt-3">
            {/* アジェンダ */}
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-stone-500 mb-0.5">アジェンダ</p>
                <p className="text-sm text-stone-700">{meeting.agenda}</p>
              </div>
            </div>

            {/* 議事録 */}
            <div>
              <p className="text-xs font-medium text-stone-500 mb-1">議事録</p>
              <textarea
                value={meeting.minutes}
                onChange={(e) => updateMeeting(meeting.id, { minutes: e.target.value })}
                placeholder="議事録を入力..."
                rows={4}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 resize-none"
              />
            </div>

            {/* 商談後業務チェックリスト */}
            {isPast && (
              <div className="bg-stone-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">商談後業務</p>
                <div className="space-y-2">
                  {/* 議事録入力済み */}
                  <div className="flex items-center gap-2">
                    {hasMinutes ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-stone-300" />
                    )}
                    <span className={`text-sm ${hasMinutes ? 'text-stone-700' : 'text-stone-400'}`}>
                      議事録入力{hasMinutes ? '済み' : ''}
                    </span>
                  </div>

                  {/* お礼メール送信済み */}
                  <button
                    onClick={() => updateMeeting(meeting.id, { followUpDone: !meeting.followUpDone })}
                    className="flex items-center gap-2 w-full text-left"
                  >
                    {meeting.followUpDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-stone-300 hover:text-stone-500" />
                    )}
                    <span className={`text-sm ${meeting.followUpDone ? 'text-stone-700' : 'text-stone-400'}`}>
                      お礼メール送信{meeting.followUpDone ? '済み' : ''}
                    </span>
                  </button>

                  {/* フォローアップ済み */}
                  <button
                    onClick={() => toggleFollowedUp(meeting.id)}
                    className="flex items-center gap-2 w-full text-left"
                  >
                    {isFollowedUp ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-stone-300 hover:text-stone-500" />
                    )}
                    <span className={`text-sm ${isFollowedUp ? 'text-stone-700' : 'text-stone-400'}`}>
                      フォローアップ{isFollowedUp ? '済み' : ''}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー + 新規登録 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-stone-600">{dealMeetings.length}件の商談</span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          新規商談
        </button>
      </div>

      {/* 新規商談フォーム */}
      {showForm && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-500 block mb-1">日付</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">時間</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-stone-500 block mb-1">場所</label>
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="例: 本社 会議室A / オンライン（Google Meet）"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            />
          </div>
          <div>
            <label className="text-xs text-stone-500 block mb-1">参加者</label>
            <div className="flex flex-wrap gap-1.5">
              {staff.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleAttendee(s.name)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    newAttendees.includes(s.name)
                      ? 'bg-slate-700 text-white border-slate-700'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-stone-500 block mb-1">アジェンダ</label>
            <input
              type="text"
              value={newAgenda}
              onChange={(e) => setNewAgenda(e.target.value)}
              placeholder="例: 初回ヒアリング / 要件定義レビュー"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-lg">
              キャンセル
            </button>
            <button
              onClick={handleAdd}
              disabled={!newDate || !newAgenda}
              className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40"
            >
              登録する
            </button>
          </div>
        </div>
      )}

      {/* 今後の商談 */}
      {upcomingMeetings.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            今後の商談
          </h3>
          <div className="space-y-2">
            {upcomingMeetings.map(renderMeeting)}
          </div>
        </div>
      )}

      {/* 過去の商談 */}
      {pastMeetings.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            過去の商談
          </h3>
          <div className="space-y-2">
            {pastMeetings.map(renderMeeting)}
          </div>
        </div>
      )}

      {dealMeetings.length === 0 && !showForm && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-5 py-8 text-center text-stone-400 text-sm">
          商談はまだ登録されていません
        </div>
      )}
    </div>
  )
}

export default DealRoomMeetings
