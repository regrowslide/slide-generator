'use server'

import type {Prisma} from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'

// スタッフ一覧取得
export const getDentalStaffList = async (params?: {
  where?: Prisma.DentalStaffWhereInput
  orderBy?: Prisma.DentalStaffOrderByWithRelationInput
}) => {
  const {where, orderBy} = params ?? {}
  return await prisma.dentalStaff.findMany({
    where,
    orderBy: orderBy ?? {sortOrder: 'asc'},
  })
}

// スタッフ取得
export const getDentalStaff = async (id: number) => {
  return await prisma.dentalStaff.findUnique({where: {id}})
}

// スタッフ作成
export const createDentalStaff = async (data: {dentalClinicId: number; name: string; role: string}) => {
  return await prisma.dentalStaff.create({data})
}

// スタッフ更新
export const updateDentalStaff = async (id: number, data: {name?: string; role?: string}) => {
  return await prisma.dentalStaff.update({where: {id}, data})
}

// スタッフ削除
export const deleteDentalStaff = async (id: number) => {
  return await prisma.dentalStaff.delete({where: {id}})
}

// スタッフ並び替え
export const reorderDentalStaff = async (items: Array<{id: number; sortOrder: number}>) => {
  await Promise.all(
    items.map(item => prisma.dentalStaff.update({where: {id: item.id}, data: {sortOrder: item.sortOrder}}))
  )
}
