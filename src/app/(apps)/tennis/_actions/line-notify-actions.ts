'use server'

import prisma from 'src/lib/prisma'
import {ATTENDANCE_DISPLAY} from '../lib/types'
import type {AttendanceStatus} from '../lib/types'
import {LINE_NOTIFY_CONFIG} from '../lib/constants'
import {toUtc, toJst} from '@cm/class/Days/date-utils/calculations'
import {requireAuth} from '../lib/auth'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

const LINE_API_URL = 'https://api.line.me/v2/bot/message/push'

// アプリURL（通知メッセージに付与）
function getAppUrl() {
  const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || ''
  return base ? `${base}/tennis` : ''
}

// JSTの現在時刻から指定日数後の日付文字列とUTC範囲を取得
function getJstDateRange(daysOffset: number) {
  const jstNow = toJst(new Date())
  const target = new Date(jstNow)
  target.setDate(target.getDate() + daysOffset)
  const dateStr = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`
  const dayStart = toUtc(new Date(`${dateStr}T00:00:00Z`))
  const dayEnd = toUtc(new Date(`${dateStr}T23:59:59Z`))
  return {dateStr, dayStart, dayEnd}
}

// LINE Messaging APIでプッシュ通知を送信
async function sendLinePush(lineUserId: string, message: string): Promise<{success: boolean; error?: string}> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) {
    return {success: false, error: 'LINE_CHANNEL_ACCESS_TOKEN が未設定'}
  }

  try {
    const res = await fetch(LINE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [{type: 'text', text: message}],
      }),
    })
    if (!res.ok) {
      const errText = await res.text()
      console.error('[Tennis] LINE通知エラー:', res.status, errText)
      return {success: false, error: `${res.status}: ${errText}`}
    }
    return {success: true}
  } catch (e: any) {
    console.error('[Tennis] LINE通知送信失敗:', e)
    return {success: false, error: e.message}
  }
}

// ステータスの表示テキスト
function getStatusText(status: AttendanceStatus | null) {
  if (!status) return '取り消し'
  return `${ATTENDANCE_DISPLAY[status]}（${status === 'yes' ? '参加' : status === 'maybe' ? '未定' : '不参加'}）`
}

/**
 * 出欠変更時：該当予定の全「出席」者にLINE通知
 */
export async function notifyAttendanceChange(
  eventId: number,
  userId: number,
  newStatus: AttendanceStatus | null // null = 取り消し
) {
  await requireAuth()
  if (!LINE_NOTIFY_CONFIG.ATTENDANCE_CHANGE) return

  const event = await prisma.tennisEvent.findUnique({
    where: {id: eventId},
    select: {
      title: true,
      TennisAttendance: {
        where: {status: 'yes'},
        select: {userId: true, User: {select: {lineUserId: true}}},
      },
    },
  })
  if (!event) return

  const user = await prisma.user.findUnique({
    where: {id: userId},
    select: {name: true, lineUserId: true},
  })
  if (!user) return

  const statusText = getStatusText(newStatus)
  const appUrl = getAppUrl()
  const urlLine = appUrl ? `\n${appUrl}` : ''

  // 自分自身への通知
  if (user.lineUserId) {
    const selfMessage = `[テニス] あなたが「${event.title}」の出欠を${statusText}に変更しました${urlLine}`
    await sendLinePush(user.lineUserId, selfMessage)
  }

  // 出席者全員への通知（自分以外）を並列送信
  const message = `[テニス] ${user.name}さんが「${event.title}」の出欠を${statusText}に変更しました${urlLine}`
  const promises = event.TennisAttendance.filter(att => att.userId !== userId && att.User.lineUserId).map(att =>
    sendLinePush(att.User.lineUserId!, message)
  )
  await Promise.allSettled(promises)
}

/**
 * 3日前リマインド：未定・未回答の人に回答促進通知
 * cronジョブから呼び出す（毎晩20:00 JST）
 */
export async function sendReminder3Days() {
  if (!LINE_NOTIFY_CONFIG.REMINDER_3DAYS) {
    return {success: true, message: 'REMINDER_3DAYS が無効', sent: 0}
  }

  const {dayStart, dayEnd} = getJstDateRange(3)

  const [events, allMembers] = await Promise.all([
    prisma.tennisEvent.findMany({
      where: {date: {gte: dayStart, lte: dayEnd}, isDeleted: false},
      select: {
        id: true,
        title: true,
        date: true,
        startTime: true,
        TennisAttendance: {select: {userId: true, status: true}},
      },
    }),
    prisma.user.findMany({
      where: {active: true, lineUserId: {not: null}},
      select: {id: true, name: true, lineUserId: true},
    }),
  ])

  const appUrl = getAppUrl()
  const urlLine = appUrl ? `\n${appUrl}` : ''

  const promises: Promise<any>[] = []
  for (const event of events) {
    const respondedIds = new Set(event.TennisAttendance.map(a => a.userId))
    const maybeIds = new Set(event.TennisAttendance.filter(a => a.status === 'maybe').map(a => a.userId))
    const targets = allMembers.filter(m => !respondedIds.has(m.id) || maybeIds.has(m.id))

    const d = new Date(event.date)
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`

    for (const member of targets) {
      if (!member.lineUserId) continue
      const isUnanswered = !respondedIds.has(member.id)
      const message = isUnanswered
        ? `[テニス] ${dateStr} ${event.startTime}〜「${event.title}」の出欠がまだ回答されていません。回答をお願いします！${urlLine}`
        : `[テニス] ${dateStr} ${event.startTime}〜「${event.title}」の出欠が△（未定）です。確定をお願いします！${urlLine}`
      promises.push(sendLinePush(member.lineUserId, message))
    }
  }

  const results = await Promise.allSettled(promises)
  const sent = results.filter(r => r.status === 'fulfilled').length

  return {success: true, message: `3日前リマインド完了`, sent, events: events.length}
}

/**
 * 前日通知：翌日の予定詳細を参加者に通知
 * cronジョブから呼び出す（毎晩20:00 JST）
 */
export async function sendReminderNextDay() {
  if (!LINE_NOTIFY_CONFIG.REMINDER_1DAY) {
    return {success: true, message: 'REMINDER_1DAY が無効', sent: 0}
  }

  const {dayStart, dayEnd} = getJstDateRange(1)

  const events = await prisma.tennisEvent.findMany({
    where: {date: {gte: dayStart, lte: dayEnd}, isDeleted: false},
    select: {
      id: true,
      title: true,
      date: true,
      startTime: true,
      endTime: true,
      memo: true,
      TennisEventCourt: {
        select: {courtNumber: true, status: true, TennisCourt: {select: {name: true}}},
      },
      TennisAttendance: {
        select: {userId: true, status: true, User: {select: {name: true, lineUserId: true}}},
      },
    },
  })

  const appUrl = getAppUrl()

  const promises: Promise<any>[] = []
  for (const event of events) {
    const d = new Date(event.date)
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}（${weekdays[d.getDay()]}）`

    const yesMembers = event.TennisAttendance.filter(a => a.status === 'yes').map(a => a.User.name)
    const maybeMembers = event.TennisAttendance.filter(a => a.status === 'maybe').map(a => a.User.name)

    const courtInfo = event.TennisEventCourt.map(
      ec => `${ec.TennisCourt.name} ${ec.courtNumber}番（${ec.status === 'reserved' ? '予約済' : '予定'}）`
    ).join('\n')

    const message = [
      `[テニス] 明日の予定`,
      ``,
      `${event.title}`,
      `${dateStr} ${event.startTime}〜${event.endTime}`,
      courtInfo ? `\nコート:\n${courtInfo}` : '',
      `\n参加（${yesMembers.length}名）: ${yesMembers.join('、') || 'なし'}`,
      maybeMembers.length > 0 ? `未定（${maybeMembers.length}名）: ${maybeMembers.join('、')}` : '',
      event.memo ? `\nメモ: ${event.memo}` : '',
      appUrl ? `\n${appUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    for (const att of event.TennisAttendance) {
      if (att.status !== 'yes') continue
      if (!att.User.lineUserId) continue
      promises.push(sendLinePush(att.User.lineUserId, message))
    }
  }

  const results = await Promise.allSettled(promises)
  const sent = results.filter(r => r.status === 'fulfilled').length

  return {success: true, message: `前日通知完了`, sent, events: events.length}
}

/**
 * コート未定警告：2日前〜前日の予定でコートが未設定の場合にLINEグループに通知
 * cronジョブから呼び出す（毎日18:00 JST）
 */
export async function sendCourtUndecidedWarning() {
  if (!LINE_NOTIFY_CONFIG.COURT_UNDECIDED_2DAYS) {
    return {success: true, message: 'COURT_UNDECIDED_2DAYS が無効', sent: 0}
  }

  const groupId = process.env.LINE_GROUP_ID
  if (!groupId) {
    return {success: true, message: 'LINE_GROUP_ID が未設定', sent: 0}
  }

  // 2日前〜前日の範囲を取得
  const {dayStart: start} = getJstDateRange(1)
  const {dayEnd: end} = getJstDateRange(2)

  const events = await prisma.tennisEvent.findMany({
    where: {
      date: {gte: start, lte: end},
      isDeleted: false,
    },
    select: {
      id: true,
      title: true,
      date: true,
      startTime: true,
      endTime: true,
      TennisEventCourt: {select: {id: true}},
    },
  })

  // コートが1件も設定されていない予定を抽出
  const undecidedEvents = events.filter(ev => ev.TennisEventCourt.length === 0)

  if (undecidedEvents.length === 0) {
    return {success: true, message: 'コート未定の予定なし', sent: 0}
  }

  const appUrl = getAppUrl()
  const urlLine = appUrl ? `\n${appUrl}` : ''
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']

  const eventLines = undecidedEvents.map(ev => {
    const d = new Date(ev.date)
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}（${weekdays[d.getDay()]}）`
    return `・${ev.title}  ${dateStr} ${ev.startTime}〜${ev.endTime}`
  }).join('\n')

  const message = [
    `[テニス] コート未定の予定があります`,
    ``,
    eventLines,
    `\nコートの予約・設定をお願いします！`,
    urlLine,
  ].filter(Boolean).join('\n')

  const result = await sendLinePush(groupId, message)
  return {success: result.success, message: 'コート未定警告送信完了', sent: result.success ? 1 : 0, events: undecidedEvents.length}
}

/**
 * 通知テスト用：コート未定警告のプレビュー（送信せずに対象を返す）
 */
export async function previewCourtUndecidedWarning() {
  await requireAuth()
  const {dayStart: start} = getJstDateRange(1)
  const {dayEnd: end} = getJstDateRange(2)

  const events = await prisma.tennisEvent.findMany({
    where: {
      date: {gte: start, lte: end},
      isDeleted: false,
    },
    select: {
      id: true,
      title: true,
      date: true,
      startTime: true,
      endTime: true,
      TennisEventCourt: {select: {id: true}},
    },
  })

  const undecidedEvents = events.filter(ev => ev.TennisEventCourt.length === 0)
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']

  return undecidedEvents.map(ev => {
    const d = new Date(ev.date)
    return {
      title: ev.title,
      date: ev.date,
      dateLabel: `${d.getMonth() + 1}/${d.getDate()}（${weekdays[d.getDay()]}）`,
      startTime: ev.startTime,
      endTime: ev.endTime,
    }
  })
}

/**
 * 通知テスト用：指定ユーザーにテストメッセージを送信
 */
export async function sendTestNotify(userId: number) {
  await requireAuth()
  const user = await prisma.user.findUnique({
    where: {id: userId},
    select: {name: true, lineUserId: true},
  })
  if (!user?.lineUserId) {
    return {success: false, error: 'lineUserIdが未設定です'}
  }

  const appUrl = getAppUrl()
  const urlLine = appUrl ? `\n${appUrl}` : ''
  return sendLinePush(user.lineUserId, `[テニス] テスト通知です。${user.name}さん、LINE通知が正常に動作しています！${urlLine}`)
}

/**
 * 通知テスト用：3日前リマインドのプレビュー（送信せずに対象を返す）
 */
export async function previewReminder3Days() {
  await requireAuth()
  const {dateStr: targetDateStr, dayStart, dayEnd} = getJstDateRange(3)

  const events = await prisma.tennisEvent.findMany({
    where: {date: {gte: dayStart, lte: dayEnd}, isDeleted: false},
    select: {
      id: true,
      title: true,
      date: true,
      startTime: true,
      TennisAttendance: {select: {userId: true, status: true, User: {select: {name: true}}}},
    },
  })

  const allMembers = await prisma.user.findMany({
    where: {active: true, lineUserId: {not: null}},
    select: {id: true, name: true},
  })

  return events.map(event => {
    const respondedIds = new Set(event.TennisAttendance.map(a => a.userId))
    const maybeMembers = event.TennisAttendance.filter(a => a.status === 'maybe').map(a => a.User.name)
    const unanswered = allMembers.filter(m => !respondedIds.has(m.id)).map(m => m.name)
    return {
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      targetDate: targetDateStr,
      maybeMembers,
      unansweredMembers: unanswered,
    }
  })
}

/**
 * 通知テスト用：前日通知のプレビュー（送信せずに対象を返す）
 */
export async function previewReminderNextDay() {
  await requireAuth()
  const {dateStr: tomorrowStr, dayStart, dayEnd} = getJstDateRange(1)

  const events = await prisma.tennisEvent.findMany({
    where: {date: {gte: dayStart, lte: dayEnd}, isDeleted: false},
    select: {
      id: true,
      title: true,
      date: true,
      startTime: true,
      endTime: true,
      TennisEventCourt: {select: {courtNumber: true, status: true, TennisCourt: {select: {name: true}}}},
      TennisAttendance: {select: {userId: true, status: true, User: {select: {name: true}}}},
    },
  })

  return events.map(event => ({
    title: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    targetDate: tomorrowStr,
    courts: event.TennisEventCourt.map(
      ec => `${ec.TennisCourt.name} ${ec.courtNumber}番（${ec.status === 'reserved' ? '予約済' : '予定'}）`
    ),
    yesMembers: event.TennisAttendance.filter(a => a.status === 'yes').map(a => a.User.name),
    maybeMembers: event.TennisAttendance.filter(a => a.status === 'maybe').map(a => a.User.name),
  }))
}

/**
 * 新規予定作成時：LINEグループに通知
 * 環境変数 LINE_GROUP_ID にグループIDを設定
 */
export async function notifyEventCreated(eventId: number) {
  await requireAuth()
  if (!LINE_NOTIFY_CONFIG.EVENT_CREATE) return

  const groupId = process.env.LINE_GROUP_ID
  if (!groupId) return

  const event = await prisma.tennisEvent.findUnique({
    where: {id: eventId},
    select: {
      title: true,
      date: true,
      startTime: true,
      endTime: true,
      memo: true,
      Creator: {select: {name: true}},
      TennisEventCourt: {
        select: {courtNumber: true, status: true, TennisCourt: {select: {name: true}}},
      },
    },
  })
  if (!event) return

  const dateStr = formatDate(event.date, 'YYYY年M月D日(ddd)')

  const courtInfo = event.TennisEventCourt.map(
    ec => `${ec.TennisCourt.name} ${ec.courtNumber}番（${ec.status === 'reserved' ? '予約済' : '予定'}）`
  ).join('\n')

  const appUrl = getAppUrl()

  const message = [
    `[テニス] 新しい予定が作成されました`,
    ``,
    `${event.title}`,
    `${dateStr} ${event.startTime}〜${event.endTime}`,
    `作成者: ${event.Creator.name}`,
    courtInfo ? `\nコート:\n${courtInfo}` : '',
    event.memo ? `\nメモ: ${event.memo}` : '',
    `\n出欠を回答してください！`,
    appUrl ? `${appUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  await sendLinePush(groupId, message)
}
