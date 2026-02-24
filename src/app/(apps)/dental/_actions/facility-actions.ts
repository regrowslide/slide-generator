'use server'

import type {Prisma} from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'

// 施設一覧取得
export const getDentalFacilities = async (params?: {
  where?: Prisma.DentalFacilityWhereInput
  orderBy?: Prisma.DentalFacilityOrderByWithRelationInput
  dentalClinicId?: number
}) => {
  const {where, orderBy, dentalClinicId} = params ?? {}
  return await prisma.dentalFacility.findMany({
    where: {...where, ...(dentalClinicId ? {dentalClinicId} : {})},
    orderBy: orderBy ?? {sortOrder: 'asc'},
  })
}

// 施設取得
export const getDentalFacility = async (id: number) => {
  return await prisma.dentalFacility.findUnique({where: {id}})
}

// 施設作成
export const createDentalFacility = async (data: {
  dentalClinicId: number
  name: string
  address?: string
  facilityType: string
}) => {
  return await prisma.dentalFacility.create({data})
}

// 施設更新
export const updateDentalFacility = async (
  id: number,
  data: {name?: string; address?: string; facilityType?: string}
) => {
  return await prisma.dentalFacility.update({where: {id}, data})
}

// 施設削除
export const deleteDentalFacility = async (id: number) => {
  return await prisma.dentalFacility.delete({where: {id}})
}

// 施設並び替え
export const reorderDentalFacilities = async (items: Array<{id: number; sortOrder: number}>) => {
  await Promise.all(
    items.map(item => prisma.dentalFacility.update({where: {id: item.id}, data: {sortOrder: item.sortOrder}}))
  )
}
