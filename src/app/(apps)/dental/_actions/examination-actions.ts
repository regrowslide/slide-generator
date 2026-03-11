'use server'

import type {Prisma} from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'

// 共通include
const examinationInclude = {
  DentalPatient: true,
  Doctor: true,
  Hygienist: true,
  DentalVisitPlan: {include: {DentalFacility: true}},
  DentalSavedDocument: true,
} satisfies Prisma.DentalExaminationInclude

// 診察一覧取得
export const getDentalExaminations = async (params?: {
  where?: Prisma.DentalExaminationWhereInput
  orderBy?: Prisma.DentalExaminationOrderByWithRelationInput
  take?: number
  skip?: number
  dentalClinicId?: number
}) => {
  const {where, orderBy, take, skip, dentalClinicId} = params ?? {}
  return await prisma.dentalExamination.findMany({
    where: {...where, ...(dentalClinicId ? {DentalVisitPlan: {dentalClinicId}} : {})},
    orderBy: orderBy ?? {sortOrder: 'asc'},
    include: examinationInclude,
    take,
    skip,
  })
}

// 診察取得
export const getDentalExamination = async (id: number) => {
  return await prisma.dentalExamination.findUnique({
    where: {id},
    include: examinationInclude,
  })
}

// 診察作成
export const createDentalExamination = async (data: {
  dentalVisitPlanId: number
  dentalPatientId: number
  doctorId?: number | null
  hygienistId?: number | null
  status?: string
  sortOrder?: number
}) => {
  return await prisma.dentalExamination.create({
    data,
    include: examinationInclude,
  })
}

// 診察更新
export const updateDentalExamination = async (
  id: number,
  data: {
    status?: string
    vitalBefore?: Record<string, unknown> | null
    vitalAfter?: Record<string, unknown> | null
    treatmentItems?: unknown[]
    procedureItems?: Record<string, unknown>
    visitCondition?: string
    oralFindings?: string
    treatment?: string
    nextPlan?: string
    drStartTime?: string | null
    drEndTime?: string | null
    dhStartTime?: string | null
    dhEndTime?: string | null
    doctorId?: number | null
    hygienistId?: number | null
    treatmentPerformed?: unknown[]
    oralFunctionRecord?: Record<string, unknown> | null
    sortOrder?: number
  }
) => {
  return await prisma.dentalExamination.update({
    where: {id},
    data: {
      ...data,
      vitalBefore: data.vitalBefore as Prisma.InputJsonValue,
      vitalAfter: data.vitalAfter as Prisma.InputJsonValue,
      treatmentItems: data.treatmentItems as Prisma.InputJsonValue,
      procedureItems: data.procedureItems as Prisma.InputJsonValue,
      treatmentPerformed: data.treatmentPerformed as Prisma.InputJsonValue,
      oralFunctionRecord: data.oralFunctionRecord as Prisma.InputJsonValue,
    },
    include: examinationInclude,
  })
}

// 診察削除
export const deleteDentalExamination = async (id: number) => {
  return await prisma.dentalExamination.delete({where: {id}})
}

// 診察並び替え
export const reorderDentalExaminations = async (items: Array<{id: number; sortOrder: number}>) => {
  await Promise.all(
    items.map(item => prisma.dentalExamination.update({where: {id: item.id}, data: {sortOrder: item.sortOrder}}))
  )
}

// 診察完了処理
export const completeDentalExamination = async (id: number) => {
  return await prisma.dentalExamination.update({
    where: {id},
    data: {status: 'done'},
    include: examinationInclude,
  })
}

// タイマーイベント保存（開始/停止/手動変更）
export const saveTimerEvent = async (params: {
  examinationId: number
  timerType: 'dr' | 'dh'
  actionType: 'start' | 'stop' | 'manual_edit'
  previousValue: string | null
  newValue: string
}) => {
  const {examinationId, timerType, actionType, previousValue, newValue} = params

  // 履歴レコード作成
  await prisma.dentalTimerHistory.create({
    data: {
      dentalExaminationId: examinationId,
      timerType,
      actionType,
      previousValue,
      newValue,
    },
  })

  // DentalExaminationの時刻フィールドを更新（manual_editはsaveTimerTimeで個別保存するため、ここではstart/stopのみ）
  if (actionType === 'start' || actionType === 'stop') {
    const updateData: Record<string, string | null> = {}
    if (timerType === 'dr') {
      if (actionType === 'start') updateData.drStartTime = newValue
      else updateData.drEndTime = newValue
    } else {
      if (actionType === 'start') updateData.dhStartTime = newValue
      else updateData.dhEndTime = newValue
    }
    return await prisma.dentalExamination.update({
      where: {id: examinationId},
      data: updateData,
      include: examinationInclude,
    })
  }
}

// タイマーイベント保存（開始/終了時刻を指定フィールドに保存）
export const saveTimerTime = async (params: {
  examinationId: number
  field: 'drStartTime' | 'drEndTime' | 'dhStartTime' | 'dhEndTime'
  value: string | null
}) => {
  return await prisma.dentalExamination.update({
    where: {id: params.examinationId},
    data: {[params.field]: params.value},
    include: examinationInclude,
  })
}

// タイマー変更履歴取得
export const getTimerHistories = async (examinationId: number) => {
  return await prisma.dentalTimerHistory.findMany({
    where: {dentalExaminationId: examinationId},
    orderBy: {createdAt: 'desc'},
  })
}

// 同一患者の過去診察取得
export const getPatientPastExaminations = async (patientId: number, excludeExaminationId: number) => {
  return await prisma.dentalExamination.findMany({
    where: {
      dentalPatientId: patientId,
      id: {not: excludeExaminationId},
    },
    orderBy: {createdAt: 'desc'},
    take: 20,
    include: examinationInclude,
  })
}
