'use server'

import type {Prisma} from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'

// 共通include
const patientInclude = {
  DentalFacility: true,
} satisfies Prisma.DentalPatientInclude

// 患者一覧取得
export const getDentalPatients = async (params?: {
  where?: Prisma.DentalPatientWhereInput
  orderBy?: Prisma.DentalPatientOrderByWithRelationInput
  take?: number
  skip?: number
  dentalClinicId?: number
}) => {
  const {where, orderBy, take, skip, dentalClinicId} = params ?? {}
  return await prisma.dentalPatient.findMany({
    where: {...where, ...(dentalClinicId ? {DentalFacility: {dentalClinicId}} : {})},
    orderBy: orderBy ?? {sortOrder: 'asc'},
    include: patientInclude,
    take,
    skip,
  })
}

// 患者取得
export const getDentalPatient = async (id: number) => {
  return await prisma.dentalPatient.findUnique({
    where: {id},
    include: patientInclude,
  })
}

// 患者作成
export const createDentalPatient = async (data: {
  dentalFacilityId: number
  lastName: string
  firstName: string
  lastNameKana?: string
  firstNameKana?: string
  gender?: string
  birthDate?: Date | string
  careLevel?: string
  building?: string
  floor?: string
  room?: string
  notes?: string
  diseases?: Record<string, unknown>
  teethCount?: number
  hasDenture?: boolean
  hasOralHypofunction?: boolean
  assessment?: Record<string, unknown>
}) => {
  return await prisma.dentalPatient.create({
    data: {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      diseases: data.diseases as Prisma.InputJsonValue,
      assessment: data.assessment as Prisma.InputJsonValue,
    },
    include: patientInclude,
  })
}

// 患者更新
export const updateDentalPatient = async (
  id: number,
  data: {
    dentalFacilityId?: number
    lastName?: string
    firstName?: string
    lastNameKana?: string
    firstNameKana?: string
    gender?: string
    birthDate?: Date | string | null
    careLevel?: string
    building?: string
    floor?: string
    room?: string
    notes?: string
    diseases?: Record<string, unknown>
    teethCount?: number
    hasDenture?: boolean
    hasOralHypofunction?: boolean
    assessment?: Record<string, unknown>
  }
) => {
  return await prisma.dentalPatient.update({
    where: {id},
    data: {
      ...data,
      birthDate: data.birthDate !== undefined ? (data.birthDate ? new Date(data.birthDate) : null) : undefined,
      diseases: data.diseases as Prisma.InputJsonValue,
      assessment: data.assessment as Prisma.InputJsonValue,
    },
    include: patientInclude,
  })
}

// 患者削除
export const deleteDentalPatient = async (id: number) => {
  return await prisma.dentalPatient.delete({where: {id}})
}
