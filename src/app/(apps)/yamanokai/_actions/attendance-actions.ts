'use server'

import prisma from 'src/lib/prisma'

// 共通 include
const attendanceInclude = {
  User: true,
  ApprovedByUser: true,
} as const

// 参加申請の作成
export const createYamanokaiApplication = async (params: { yamanokaiEventId: number; userId: string; comment?: string | null }) => {
  const { yamanokaiEventId, userId, comment } = params
  return await prisma.yamanokaiAttendance.create({
    data: {
      yamanokaiEventId,
      userId,
      status: 'pending',
      comment: comment ?? null,
    },
    include: attendanceInclude,
  })
}

// イベントの申請一覧取得（管理画面用）
export const getApplicationsByEventId = async (yamanokaiEventId: number) => {
  return await prisma.yamanokaiAttendance.findMany({
    where: { yamanokaiEventId, isDeleted: false },
    include: attendanceInclude,
    orderBy: { createdAt: 'asc' },
  })
}

// ユーザーの申請状態一括取得（一覧画面用）
export const getApplicationsByUserId = async (userId: string) => {
  return await prisma.yamanokaiAttendance.findMany({
    where: { userId, isDeleted: false },
  })
}

// 申請更新（ステータス・コメント変更）
export const updateYamanokaiApplication = async (
  id: number,
  data: {
    status?: string
    rejectionReason?: string | null
    approvedBy?: string | null
  }
) => {
  return await prisma.yamanokaiAttendance.update({
    where: { id },
    data,
    include: attendanceInclude,
  })
}

// 当日出席フラグ切り替え
export const toggleActualAttended = async (id: number) => {
  const current = await prisma.yamanokaiAttendance.findUnique({ where: { id } })
  if (!current) return null
  return await prisma.yamanokaiAttendance.update({
    where: { id },
    data: { actualAttended: !current.actualAttended },
    include: attendanceInclude,
  })
}

// イベント別ステータス件数（groupBy集計）
export const getApplicationSummaryByEventIds = async (eventIds: number[]) => {
  if (eventIds.length === 0) return {}

  const grouped = await prisma.yamanokaiAttendance.groupBy({
    by: ['yamanokaiEventId', 'status'],
    where: { yamanokaiEventId: { in: eventIds }, isDeleted: false },
    _count: { id: true },
  })

  // { eventId: { pending: n, approved: n, rejected: n } } 形式に変換
  const summary: Record<number, Record<string, number>> = {}
  for (const row of grouped) {
    if (!summary[row.yamanokaiEventId]) {
      summary[row.yamanokaiEventId] = {}
    }
    summary[row.yamanokaiEventId][row.status] = row._count.id
  }
  return summary
}
