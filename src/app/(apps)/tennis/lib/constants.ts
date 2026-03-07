import {isDev} from '@cm/lib/methods/common'
import type {AttendanceStatus} from './types'

export const HOUR_OPTIONS = Array.from({length: 24}, (_, i) => {
  const h = String(i).padStart(2, '0')
  return {value: `${h}:00`, label: `${h}:00`}
})

export const STATUS_CONFIG: Record<AttendanceStatus, {color: string; bg: string; label: string; ring: string}> = {
  yes: {color: 'text-emerald-600', bg: 'bg-emerald-100', label: '参加', ring: 'ring-emerald-300'},
  maybe: {color: 'text-amber-600', bg: 'bg-amber-100', label: '未定', ring: 'ring-amber-300'},
  no: {color: 'text-red-500', bg: 'bg-red-100', label: '不参加', ring: 'ring-red-300'},
}

const doNotify = !isDev

// LINE通知設定（ON/OFF切り替え）
export const LINE_NOTIFY_CONFIG = {
  // 出欠変更時の通知（出席者全員に送信）
  ATTENDANCE_CHANGE: false,
  // 新規予定作成時（LINEグループに送信）
  EVENT_CREATE: doNotify,
  // 3日前リマインド（未定・未回答者に送信）
  REMINDER_3DAYS: doNotify,
  // 前日の予定詳細通知（参加者に送信）
  REMINDER_1DAY: doNotify,
  // 2日前コート未定警告（LINEグループに送信）
  COURT_UNDECIDED_2DAYS: doNotify,
}

// LINE公式アカウント友だち追加URL
export const LINE_FRIEND_URL = 'https://line.me/R/ti/p/%40704esypa'

// コート予約サイト定数
export type SchedulePageConfig = {
  key: string
  label: string
  getSchedulePageUrl: (dateStr: string) => string
}

export const SCHEDULE_PAGE_OPTIONS: SchedulePageConfig[] = [
  {
    key: 'kenei',
    label: '県営コート',
    getSchedulePageUrl: (dateStr: string) =>
      `https://yoyacool.e-harp.jp/okayama/FacilityAvailability/Index/330001/1003?ptn=2&d=${dateStr}&sd=${dateStr}&ed=${dateStr}`,
  },
]

export const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-red-500',
  'bg-sky-500',
  'bg-fuchsia-500',
  'bg-lime-500',
  'bg-yellow-500',
]
