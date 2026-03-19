'use client'

import React, { useState } from 'react'
import { Calendar, MapPin, Users, FileText, Mail, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useFrankartMockData } from '../context/MockDataContext'

const MeetingsPage: React.FC = () => {
  const { meetings, updateMeeting } = useFrankartMockData()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  // 未来の商談と過去の商談を分ける
  const upcomingMeetings = meetings
    .filter((m) => m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
  const pastMeetings = meetings
    .filter((m) => m.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))

  const renderMeeting = (meeting: typeof meetings[0]) => {
    const expanded = expandedId === meeting.id
    const isPast = meeting.date < today
    const needsFollowUp = isPast && !meeting.followUpDone

    return (
      <div key={meeting.id} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setExpandedId(expanded ? null : meeting.id)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-stone-800 text-sm truncate">{meeting.dealTitle}</h3>
              {needsFollowUp && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1 shrink-0">
                  <Mail className="w-3 h-3" />
                  お礼メール未送信
                </span>
              )}
              {meeting.followUpDone && isPast && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1 shrink-0">
                  <Check className="w-3 h-3" />
                  フォロー済
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {meeting.date} {meeting.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {meeting.location}
              </span>
              <span className="text-stone-400">{meeting.companyName}</span>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
        </button>

        {expanded && (
          <div className="px-5 pb-4 border-t border-stone-100 space-y-3 pt-3">
            {/* 参加者 */}
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
              <div className="flex flex-wrap gap-1.5">
                {meeting.attendees.map((a) => (
                  <span key={a} className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded">{a}</span>
                ))}
              </div>
            </div>
            {/* アジェンダ */}
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
              <p className="text-sm text-stone-600">{meeting.agenda}</p>
            </div>
            {/* 議事録 */}
            <div>
              <label className="text-xs font-medium text-stone-500 block mb-1">議事録</label>
              <textarea
                value={meeting.minutes}
                onChange={(e) => updateMeeting(meeting.id, { minutes: e.target.value })}
                placeholder="議事録を入力..."
                rows={3}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 resize-none"
              />
            </div>
            {/* お礼メール済みチェック */}
            {isPast && (
              <button
                onClick={() => updateMeeting(meeting.id, { followUpDone: !meeting.followUpDone })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  meeting.followUpDone
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
              >
                {meeting.followUpDone ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                {meeting.followUpDone ? 'お礼メール送信済み' : 'お礼メール送信済みにする'}
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 今後の商談 */}
      <div>
        <h2 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-600" />
          今後の商談
          <span className="text-xs text-stone-400 font-normal">{upcomingMeetings.length}件</span>
        </h2>
        <div className="space-y-3">
          {upcomingMeetings.length === 0 ? (
            <p className="text-sm text-stone-400 py-4 text-center">予定されている商談はありません</p>
          ) : (
            upcomingMeetings.map(renderMeeting)
          )}
        </div>
      </div>

      {/* 過去の商談 */}
      <div>
        <h2 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-stone-400" />
          過去の商談
          <span className="text-xs text-stone-400 font-normal">{pastMeetings.length}件</span>
        </h2>
        <div className="space-y-3">
          {pastMeetings.length === 0 ? (
            <p className="text-sm text-stone-400 py-4 text-center">過去の商談はありません</p>
          ) : (
            pastMeetings.map(renderMeeting)
          )}
        </div>
      </div>
    </div>
  )
}

export default MeetingsPage
