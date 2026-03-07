import type {TennisCourt, TennisEvent, TennisEventCourt, TennisAttendance, User} from '@prisma/generated/prisma/client'

export type AttendanceStatus = 'yes' | 'maybe' | 'no'
export type CourtStatus = 'planned' | 'reserved'

// UI表示マッピング
export const ATTENDANCE_DISPLAY: Record<AttendanceStatus, string> = {
  yes: '○',
  maybe: '△',
  no: '×',
}

export const COURT_STATUS_DISPLAY: Record<CourtStatus, string> = {
  planned: '予定',
  reserved: '予約済み',
}

// DB取得時のリレーション含む型
export type TennisCourtWithRelations = TennisCourt

export type TennisEventCourtWithRelations = TennisEventCourt & {
  TennisCourt: TennisCourt
}

export type TennisAttendanceWithUser = TennisAttendance & {
  User: Pick<User, 'id' | 'name' | 'avatar'>
}

export type TennisEventWithRelations = TennisEvent & {
  TennisEventCourt: TennisEventCourtWithRelations[]
  TennisAttendance: TennisAttendanceWithUser[]
  Creator: Pick<User, 'id' | 'name' | 'avatar'>
}

// フォーム用
export type EventFormData = {
  title: string
  date: string // YYYY-MM-DD
  startTime: string // HH:00
  endTime: string // HH:00
  courts: EventCourtInput[]
  memo: string
}

export type EventCourtInput = {
  courtId: number
  courtNumber: string
  status: CourtStatus
}

export type CourtFormData = {
  name: string
  address: string
  googleMapsUrl: string
  courtNumbers: string[]
  schedulePageKey: string
}

// メンバー（未回答者表示用）
export type TennisMember = Pick<User, 'id' | 'name' | 'avatar'>
