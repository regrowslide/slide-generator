'use server'

import type { Prisma } from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'

// 共通 include
const eventInclude = {
  YamanokaiDepartment: true,
  CL: true,
  SL: true,
} satisfies Prisma.YamanokaiEventInclude

// フォームデータ型
export type YamanokaiEventFormData = {
  title: string
  yamanokaiDepartmentId: number
  clId: number
  slId?: number | null
  startAt: Date | string
  endAt: Date | string
  deadline: Date | string
  staminaGrade: string
  skillGrade: string
  rockCategory: string
  requiredInsurance?: number
  mountainName?: string | null
  altitude?: string | null
  meetingPlace: string
  meetingTime: string
  course?: string | null
  capacity?: number | null
  notes?: string | null
}

// 例会一覧取得
export const getYamanokaiEvents = async (params?: {
  where?: Prisma.YamanokaiEventWhereInput
  orderBy?: Prisma.YamanokaiEventOrderByWithRelationInput | Prisma.YamanokaiEventOrderByWithRelationInput[]
}) => {
  const { where, orderBy } = params ?? {}

  return await prisma.yamanokaiEvent.findMany({
    where: where ?? { isDeleted: false },
    orderBy: orderBy ?? { startAt: 'desc' },
    include: eventInclude,
  })
}

// 例会詳細取得
export const getYamanokaiEvent = async (id: number) => {
  return await prisma.yamanokaiEvent.findUnique({
    where: { id },
    include: eventInclude,
  })
}

// 例会作成
export const createYamanokaiEvent = async (data: YamanokaiEventFormData) => {
  return await prisma.yamanokaiEvent.create({
    data: {
      title: data.title,
      yamanokaiDepartmentId: data.yamanokaiDepartmentId,
      clId: data.clId,
      slId: data.slId || null,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      deadline: new Date(data.deadline),
      staminaGrade: data.staminaGrade,
      skillGrade: data.skillGrade,
      rockCategory: data.rockCategory,
      requiredInsurance: data.requiredInsurance ?? 3,
      mountainName: data.mountainName || null,
      altitude: data.altitude || null,
      meetingPlace: data.meetingPlace,
      meetingTime: data.meetingTime,
      course: data.course || null,
      capacity: data.capacity || null,
      notes: data.notes || null,
      status: 'draft',
    },
    include: eventInclude,
  })
}

// 例会更新
export const updateYamanokaiEvent = async (id: number, data: Partial<YamanokaiEventFormData>) => {
  const updateData: Prisma.YamanokaiEventUpdateInput = {}

  if (data.title !== undefined) updateData.title = data.title
  if (data.yamanokaiDepartmentId !== undefined) updateData.YamanokaiDepartment = { connect: { id: data.yamanokaiDepartmentId } }
  if (data.clId !== undefined) updateData.CL = { connect: { id: data.clId } }
  if (data.slId !== undefined) updateData.SL = data.slId ? { connect: { id: data.slId } } : { disconnect: true }
  if (data.startAt !== undefined) updateData.startAt = new Date(data.startAt)
  if (data.endAt !== undefined) updateData.endAt = new Date(data.endAt)
  if (data.deadline !== undefined) updateData.deadline = new Date(data.deadline)
  if (data.staminaGrade !== undefined) updateData.staminaGrade = data.staminaGrade
  if (data.skillGrade !== undefined) updateData.skillGrade = data.skillGrade
  if (data.rockCategory !== undefined) updateData.rockCategory = data.rockCategory
  if (data.requiredInsurance !== undefined) updateData.requiredInsurance = data.requiredInsurance
  if (data.mountainName !== undefined) updateData.mountainName = data.mountainName || null
  if (data.altitude !== undefined) updateData.altitude = data.altitude || null
  if (data.meetingPlace !== undefined) updateData.meetingPlace = data.meetingPlace
  if (data.meetingTime !== undefined) updateData.meetingTime = data.meetingTime
  if (data.course !== undefined) updateData.course = data.course || null
  if (data.capacity !== undefined) updateData.capacity = data.capacity || null
  if (data.notes !== undefined) updateData.notes = data.notes || null

  return await prisma.yamanokaiEvent.update({
    where: { id },
    data: updateData,
    include: eventInclude,
  })
}

// ステータス変更
export const updateYamanokaiEventStatus = async (id: number, status: string) => {
  return await prisma.yamanokaiEvent.update({
    where: { id },
    data: { status },
    include: eventInclude,
  })
}

// 一括ステータス変更
export const bulkUpdateYamanokaiEventStatus = async (ids: number[], status: string) => {
  return await prisma.yamanokaiEvent.updateMany({
    where: { id: { in: ids } },
    data: { status },
  })
}

// 公開済み例会一覧取得（一般会員向け）
export const getPublishedYamanokaiEvents = async () => {
  return await prisma.yamanokaiEvent.findMany({
    where: { status: 'published', isDeleted: false },
    orderBy: { startAt: 'asc' },
    include: eventInclude,
  })
}

// 論理削除
export const deleteYamanokaiEvent = async (id: number) => {
  return await prisma.yamanokaiEvent.update({
    where: { id },
    data: { isDeleted: true },
    include: eventInclude,
  })
}
