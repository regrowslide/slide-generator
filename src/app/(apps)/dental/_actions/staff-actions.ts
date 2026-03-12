'use server'

import type {Prisma} from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'
import {AuthService} from 'src/lib/services/AuthService'

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

// スタッフ新規作成（User + Account を作成してクリニックに紐づけ）
export const createDentalStaff = async (data: {name: string; email?: string; password?: string; dentalClinicId: number; type: string}) => {
  return await AuthService.createUserDirect({
    password: data.password,
    prismaData: {
      name: data.name,
      email: data.email,
      dentalClinicId: data.dentalClinicId,
      type: data.type,
    },
  })
}

// スタッフ（ユーザー）のクリニック・タイプ設定
export const assignDentalStaff = async (data: {userId: string; dentalClinicId: number; type: string}) => {
  return await AuthService.updateUser({id: data.userId}, {dentalClinicId: data.dentalClinicId, type: data.type})
}

// スタッフのタイプ更新
export const updateDentalStaffType = async (userId: string, type: string) => {
  return await AuthService.updateUser({id: userId}, {type})
}

// スタッフのクリニック紐づけ解除
export const removeDentalStaff = async (userId: string) => {
  return await AuthService.updateUser({id: userId}, {dentalClinicId: null, type: null})
}

// スタッフ並び替え
export const reorderDentalStaff = async (items: Array<{id: string; sortOrder: number}>) => {
  await Promise.all(items.map(item => AuthService.updateUser({id: item.id}, {sortOrder: item.sortOrder})))
}

// スタッフの認証情報（メールアドレス・パスワード）を更新
export const updateDentalStaffCredentials = async (userId: string, data: {email?: string; password?: string}) => {
  const updateData: Record<string, unknown> = {}
  if (data.email !== undefined) updateData.email = data.email
  await AuthService.updateUser({id: userId}, updateData, data.password)
}
