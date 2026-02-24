'use server'

import prisma from 'src/lib/prisma'
import type {Prisma} from '@prisma/generated/prisma/client'

// 算定履歴取得
export const getDentalScoringHistories = async (params?: {
  where?: Prisma.DentalScoringHistoryWhereInput
  orderBy?: Prisma.DentalScoringHistoryOrderByWithRelationInput
  dentalClinicId?: number
}) => {
  const {where, orderBy, dentalClinicId} = params ?? {}
  return await prisma.dentalScoringHistory.findMany({
    where: {...where, ...(dentalClinicId ? {DentalPatient: {DentalFacility: {dentalClinicId}}} : {})},
    orderBy: orderBy ?? {lastScoredAt: 'desc'},
  })
}

// 算定履歴upsert（患者×実施項目で一意更新）
export const upsertDentalScoringHistory = async (data: {
  dentalPatientId: number
  procedureId: string
  lastScoredAt: Date | string
  points: number
}) => {
  // 既存レコードを検索
  const existing = await prisma.dentalScoringHistory.findFirst({
    where: {
      dentalPatientId: data.dentalPatientId,
      procedureId: data.procedureId,
    },
  })

  if (existing) {
    return await prisma.dentalScoringHistory.update({
      where: {id: existing.id},
      data: {
        lastScoredAt: new Date(data.lastScoredAt),
        points: data.points,
      },
    })
  }

  return await prisma.dentalScoringHistory.create({
    data: {
      dentalPatientId: data.dentalPatientId,
      procedureId: data.procedureId,
      lastScoredAt: new Date(data.lastScoredAt),
      points: data.points,
    },
  })
}
