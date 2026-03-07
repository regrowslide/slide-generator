'use client'

import {useState} from 'react'
import {Bell, Send, Eye, CheckCircle, AlertCircle, ExternalLink, UserPlus, ArrowLeft} from 'lucide-react'
import {sendTestNotify, sendReminder3Days, sendReminderNextDay, sendCourtUndecidedWarning, previewReminder3Days, previewReminderNextDay, previewCourtUndecidedWarning} from '../_actions/line-notify-actions'
import {LINE_NOTIFY_CONFIG, LINE_FRIEND_URL} from '../lib/constants'

type LogEntry = {
  time: string
  type: 'success' | 'error' | 'info'
  message: string
}

type Props = {
  userId: number
  userName: string
}

export default function NotifyTestClient({userId, userName}: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [preview3Days, setPreview3Days] = useState<any[] | null>(null)
  const [previewNextDay, setPreviewNextDay] = useState<any[] | null>(null)
  const [previewCourt, setPreviewCourt] = useState<any[] | null>(null)

  const addLog = (type: LogEntry['type'], message: string) => {
    const time = new Date().toLocaleTimeString('ja-JP')
    setLogs((prev) => [{time, type, message}, ...prev])
  }

  const handleTestNotify = async () => {
    setLoading('test')
    try {
      const res = await sendTestNotify(userId)
      if (res.success) {
        addLog('success', `テスト通知を${userName}に送信しました`)
      } else {
        addLog('error', `テスト通知失敗: ${res.error}`)
      }
    } catch (e: any) {
      addLog('error', `エラー: ${e.message}`)
    }
    setLoading(null)
  }

  const handlePreview3Days = async () => {
    setLoading('preview3')
    try {
      const data = await previewReminder3Days()
      setPreview3Days(data)
      addLog('info', `3日前リマインド対象: ${data.length}件のイベント`)
    } catch (e: any) {
      addLog('error', `エラー: ${e.message}`)
    }
    setLoading(null)
  }

  const handlePreviewNextDay = async () => {
    setLoading('previewNext')
    try {
      const data = await previewReminderNextDay()
      setPreviewNextDay(data)
      addLog('info', `前日通知対象: ${data.length}件のイベント`)
    } catch (e: any) {
      addLog('error', `エラー: ${e.message}`)
    }
    setLoading(null)
  }

  const handleSendReminder3Days = async () => {
    setLoading('send3')
    try {
      const res = await sendReminder3Days()
      addLog(res.success ? 'success' : 'error', `3日前リマインド: ${res.message}（${res.sent}件送信、${res.events}イベント）`)
    } catch (e: any) {
      addLog('error', `エラー: ${e.message}`)
    }
    setLoading(null)
  }

  const handleSendReminderNextDay = async () => {
    setLoading('sendNext')
    try {
      const res = await sendReminderNextDay()
      addLog(res.success ? 'success' : 'error', `前日通知: ${res.message}（${res.sent}件送信、${res.events}イベント）`)
    } catch (e: any) {
      addLog('error', `エラー: ${e.message}`)
    }
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto">
      {/* ヘッダー */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <a href="/tennis" className="p-1 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </a>
        <Bell className="w-5 h-5 text-emerald-500" />
        <h1 className="font-bold text-slate-800">LINE通知テスト</h1>
      </div>

      {/* LINE友だち追加案内 */}
      <div className="mx-3 mt-3 bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <UserPlus className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-green-800 mb-1">LINE公式アカウントの友だち追加が必要です</p>
            <p className="text-xs text-green-700 mb-3">LINE通知を受け取るには、テニスサークルの公式LINEアカウントを友だちに追加してください。</p>
            <a
              href={LINE_FRIEND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-green-600 transition-colors"
            >
              友だち追加する
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 通知設定状況 */}
      <div className="mx-3 mt-3 bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <h2 className="text-sm font-bold text-slate-700 mb-3">通知設定状況</h2>
        <div className="space-y-2">
          {([
            {key: 'ATTENDANCE_CHANGE' as const, label: '出欠変更通知', desc: '出欠変更時に出席者全員に通知'},
            {key: 'EVENT_CREATE' as const, label: '新規予定通知', desc: '予定作成時にLINEグループに通知'},
            {key: 'REMINDER_3DAYS' as const, label: '3日前リマインド', desc: '未定・未回答者に回答促進通知（毎日20:00）'},
            {key: 'REMINDER_1DAY' as const, label: '前日通知', desc: '翌日の予定詳細を参加者に通知（毎日20:00）'},
            {key: 'COURT_UNDECIDED_2DAYS' as const, label: 'コート未定警告', desc: '2日前〜前日のコート未定予定をグループに通知（毎日18:00）'},
          ] as const).map(({key, label, desc}) => (
            <div key={key} className="flex items-center justify-between py-1">
              <div>
                <span className="text-sm text-slate-700">{label}</span>
                <p className="text-[11px] text-slate-400">{desc}</p>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  LINE_NOTIFY_CONFIG[key] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {LINE_NOTIFY_CONFIG[key] ? 'ON' : 'OFF'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* テスト通知 */}
      <div className="mx-3 mt-3 bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <h2 className="text-sm font-bold text-slate-700 mb-2">自分にテスト通知</h2>
        <p className="text-[11px] text-slate-400 mb-3">{userName}さんのLINEにテストメッセージを送信します</p>
        <button
          onClick={handleTestNotify}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-1.5 bg-emerald-500 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-emerald-600 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {loading === 'test' ? '送信中...' : 'テスト通知を送信'}
        </button>
      </div>

      {/* 操作ボタン */}
      <div className="mx-3 mt-3 space-y-2">
        <h2 className="text-sm font-bold text-slate-700 px-1">Cronジョブ手動実行</h2>

        {/* 3日前リマインド */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-1">3日前リマインド</h3>
          <p className="text-[11px] text-slate-400 mb-3">3日後の予定に未定・未回答の人へ通知</p>
          <div className="flex gap-2">
            <button
              onClick={handlePreview3Days}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-medium py-2 rounded-lg hover:bg-slate-200 disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" />
              {loading === 'preview3' ? '取得中...' : 'プレビュー'}
            </button>
            <button
              onClick={handleSendReminder3Days}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 text-white text-xs font-medium py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {loading === 'send3' ? '送信中...' : '今すぐ送信'}
            </button>
          </div>
          {preview3Days && (
            <div className="mt-3 bg-slate-50 rounded-lg p-3 text-xs">
              {preview3Days.length === 0 ? (
                <p className="text-slate-400">3日後に該当イベントなし</p>
              ) : (
                preview3Days.map((ev, i) => (
                  <div key={i} className="mb-2 last:mb-0">
                    <p className="font-bold text-slate-700">
                      {ev.title}（{ev.targetDate} {ev.startTime}〜）
                    </p>
                    {ev.maybeMembers.length > 0 && <p className="text-amber-600">未定: {ev.maybeMembers.join('、')}</p>}
                    {ev.unansweredMembers.length > 0 && <p className="text-slate-400">未回答: {ev.unansweredMembers.join('、')}</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 前日通知 */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-1">前日通知</h3>
          <p className="text-[11px] text-slate-400 mb-3">翌日の予定詳細を参加者に通知</p>
          <div className="flex gap-2">
            <button
              onClick={handlePreviewNextDay}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-medium py-2 rounded-lg hover:bg-slate-200 disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" />
              {loading === 'previewNext' ? '取得中...' : 'プレビュー'}
            </button>
            <button
              onClick={handleSendReminderNextDay}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500 text-white text-xs font-medium py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {loading === 'sendNext' ? '送信中...' : '今すぐ送信'}
            </button>
          </div>
          {previewNextDay && (
            <div className="mt-3 bg-slate-50 rounded-lg p-3 text-xs">
              {previewNextDay.length === 0 ? (
                <p className="text-slate-400">翌日に該当イベントなし</p>
              ) : (
                previewNextDay.map((ev, i) => (
                  <div key={i} className="mb-2 last:mb-0">
                    <p className="font-bold text-slate-700">
                      {ev.title}（{ev.targetDate} {ev.startTime}〜{ev.endTime}）
                    </p>
                    {ev.courts.length > 0 && <p className="text-slate-500">コート: {ev.courts.join('、')}</p>}
                    <p className="text-emerald-600">参加: {ev.yesMembers.join('、') || 'なし'}</p>
                    {ev.maybeMembers.length > 0 && <p className="text-amber-600">未定: {ev.maybeMembers.join('、')}</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        {/* コート未定警告 */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-1">コート未定警告</h3>
          <p className="text-[11px] text-slate-400 mb-3">明日〜明後日の予定でコート未設定のものをグループに通知</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                setLoading('previewCourt')
                try {
                  const data = await previewCourtUndecidedWarning()
                  setPreviewCourt(data)
                  addLog('info', `コート未定警告対象: ${data.length}件のイベント`)
                } catch (e: any) {
                  addLog('error', `エラー: ${e.message}`)
                }
                setLoading(null)
              }}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-medium py-2 rounded-lg hover:bg-slate-200 disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" />
              {loading === 'previewCourt' ? '取得中...' : 'プレビュー'}
            </button>
            <button
              onClick={async () => {
                setLoading('sendCourt')
                try {
                  const res = await sendCourtUndecidedWarning()
                  addLog(res.success ? 'success' : 'error', `コート未定警告: ${res.message}（${res.sent}件送信、${res.events}イベント）`)
                } catch (e: any) {
                  addLog('error', `エラー: ${e.message}`)
                }
                setLoading(null)
              }}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 text-white text-xs font-medium py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {loading === 'sendCourt' ? '送信中...' : '今すぐ送信'}
            </button>
          </div>
          {previewCourt && (
            <div className="mt-3 bg-slate-50 rounded-lg p-3 text-xs">
              {previewCourt.length === 0 ? (
                <p className="text-slate-400">コート未定の該当イベントなし</p>
              ) : (
                previewCourt.map((ev, i) => (
                  <div key={i} className="mb-2 last:mb-0">
                    <p className="font-bold text-red-600">
                      {ev.title}（{ev.dateLabel} {ev.startTime}〜{ev.endTime}）
                    </p>
                    <p className="text-slate-400">コート未設定</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 実行ログ */}
      <div className="mx-3 mt-3 mb-6 bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <h2 className="text-sm font-bold text-slate-700 mb-3">実行ログ</h2>
        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">操作を実行するとログが表示されます</p>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="text-slate-300 shrink-0">{log.time}</span>
                {log.type === 'success' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />}
                {log.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />}
                {log.type === 'info' && <Bell className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />}
                <span className={`${log.type === 'error' ? 'text-red-600' : log.type === 'success' ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
