'use server'

import type {Prisma} from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'

// スタッフ一覧取得（dentalClinicIdが紐づいているUser）
export const getDentalStaffList = async (params?: {
  where?: Prisma.UserWhereInput
  orderBy?: Prisma.UserOrderByWithRelationInput
  dentalClinicId?: number
}) => {
  const {where, orderBy, dentalClinicId} = params ?? {}
  return await prisma.user.findMany({
    where: {
      ...where,
      ...(dentalClinicId ? {dentalClinicId} : {}),
      type: {in: ['doctor', 'hygienist']},
    },
    orderBy: orderBy ?? {sortOrder: 'asc'},
  })
}

// スタッフ新規作成（Userを作成してクリニックに紐づけ）
export const createDentalStaff = async (data: {name: string; dentalClinicId: number; type: string}) => {
  return await prisma.user.create({
    data: {
      name: data.name,
      dentalClinicId: data.dentalClinicId,
      type: data.type,
    },
  })
}

// スタッフ（ユーザー）のクリニック・タイプ設定
export const assignDentalStaff = async (data: {userId: number; dentalClinicId: number; type: string}) => {
  return await prisma.user.update({
    where: {id: data.userId},
    data: {dentalClinicId: data.dentalClinicId, type: data.type},
  })
}

// スタッフのタイプ更新
export const updateDentalStaffType = async (userId: number, type: string) => {
  return await prisma.user.update({
    where: {id: userId},
    data: {type},
  })
}

// スタッフのクリニック紐づけ解除
export const removeDentalStaff = async (userId: number) => {
  return await prisma.user.update({
    where: {id: userId},
    data: {dentalClinicId: null, type: null},
  })
}

// スタッフ並び替え
export const reorderDentalStaff = async (items: Array<{id: number; sortOrder: number}>) => {
  await Promise.all(items.map(item => prisma.user.update({where: {id: item.id}, data: {sortOrder: item.sortOrder}})))
}

// スタッフの認証情報（メールアドレス・パスワード）を更新
export const updateDentalStaffCredentials = async (userId: number, data: {email?: string; password?: string}) => {
  const updateData: Record<string, string> = {}
  if (data.email !== undefined) updateData.email = data.email
  if (data.password !== undefined) updateData.password = data.password
  if (Object.keys(updateData).length === 0) return null
  return await prisma.user.update({
    where: {id: userId},
    data: updateData,
  })
}
