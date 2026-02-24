'use server'

import type {Prisma} from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'

// 共通include
const visitPlanInclude = {
  DentalFacility: true,
  DentalExamination: {
    include: {
      DentalPatient: true,
    },
    orderBy: {sortOrder: 'asc'} as const,
  },
} satisfies Prisma.DentalVisitPlanInclude

// 訪問計画一覧取得
export const getDentalVisitPlans = async (params?: {
  where?: Prisma.DentalVisitPlanWhereInput
  orderBy?: Prisma.DentalVisitPlanOrderByWithRelationInput
  take?: number
  skip?: number
  dentalClinicId?: number
}) => {
  const {where, orderBy, take, skip, dentalClinicId} = params ?? {}
  return await prisma.dentalVisitPlan.findMany({
    where: {...where, ...(dentalClinicId ? {dentalClinicId} : {})},
    orderBy: orderBy ?? {visitDate: 'asc'},
    include: visitPlanInclude,
    take,
    skip,
  })
}

// 訪問計画取得
export const getDentalVisitPlan = async (id: number) => {
  return await prisma.dentalVisitPlan.findUnique({
    where: {id},
    include: visitPlanInclude,
  })
}

// 訪問計画作成
export const createDentalVisitPlan = async (data: {
  dentalClinicId: number
  dentalFacilityId: number
  visitDate: Date | string
  status?: string
}) => {
  return await prisma.dentalVisitPlan.create({
    data: {
      ...data,
      visitDate: new Date(data.visitDate),
    },
    include: visitPlanInclude,
  })
}

// 訪問計画更新
export const updateDentalVisitPlan = async (
  id: number,
  data: {
    dentalFacilityId?: number
    visitDate?: Date | string
    status?: string
  }
) => {
  return await prisma.dentalVisitPlan.update({
    where: {id},
    data: {
      ...data,
      visitDate: data.visitDate ? new Date(data.visitDate) : undefined,
    },
    include: visitPlanInclude,
  })
}

// 訪問計画削除
export const deleteDentalVisitPlan = async (id: number) => {
  return await prisma.dentalVisitPlan.delete({where: {id}})
}
