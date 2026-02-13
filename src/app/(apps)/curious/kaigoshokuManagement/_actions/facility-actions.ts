'use server'

import type { Prisma } from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'
import type { KgFacilityMaster, KgFacilityFormData } from '../types'

// 施設一覧取得
export const getFacilities = async (params?: {
  where?: Prisma.KgFacilityMasterWhereInput
  orderBy?: Prisma.KgFacilityMasterOrderByWithRelationInput
  take?: number
  skip?: number
}): Promise<KgFacilityMaster[]> => {
  const { where, orderBy, take, skip } = params ?? {}

  return await prisma.kgFacilityMaster.findMany({
    where: where ?? { isActive: true },
    orderBy: orderBy ?? { sortOrder: 'asc' },
    take,
    skip,
  })
}

// 施設詳細取得
export const getFacility = async (id: number): Promise<KgFacilityMaster | null> => {
  return await prisma.kgFacilityMaster.findUnique({
    where: { id },
  })
}

// 施設作成
export const createFacility = async (data: KgFacilityFormData): Promise<KgFacilityMaster> => {
  return await prisma.kgFacilityMaster.create({
    data: {
      code: data.code,
      name: data.name,
      contactMethod: 'CSV',
      address: data.address,
      phone: data.phone,
      email: data.email,
      isActive: data.isActive,
    },
  })
}

// 施設更新
export const updateFacility = async (
  id: number,
  data: Partial<KgFacilityFormData>
): Promise<KgFacilityMaster> => {
  return await prisma.kgFacilityMaster.update({
    where: { id },
    data,
  })
}

// 施設削除（論理削除）
export const deleteFacility = async (id: number): Promise<KgFacilityMaster> => {
  return await prisma.kgFacilityMaster.update({
    where: { id },
    data: { isActive: false },
  })
}

// 施設コードの重複チェック
export const checkFacilityCodeExists = async (
  code: string,
  excludeId?: number
): Promise<boolean> => {
  const facility = await prisma.kgFacilityMaster.findFirst({
    where: {
      code,
      id: excludeId ? { not: excludeId } : undefined,
    },
  })
  return facility !== null
}
