'use server'

import type {Prisma} from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'

// ユーザーの所属クリニックを取得（User.dentalClinicId経由）
export const getUserDentalClinic = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: {id: userId},
    include: {DentalClinic: true},
  })
  return user?.DentalClinic ?? null
}

// クリニック取得
export const getDentalClinic = async (id: number) => {
  return await prisma.dentalClinic.findUnique({where: {id}})
}

// 管理者用: クリニック一覧取得（スタッフ付き）
export const getDentalClinicList = async () => {
  return await prisma.dentalClinic.findMany({
    orderBy: {id: 'asc'},
    include: {
      User: {
        where: {type: {in: ['doctor', 'hygienist']}},
        orderBy: {sortOrder: 'asc'},
        select: {id: true, name: true, type: true, sortOrder: true},
      },
    },
  })
}

// クリニックupsert
export const upsertDentalClinic = async (data: {
  id?: number
  name: string
  address?: string
  phone?: string
  representative?: string
  qualifications?: Record<string, unknown>
}) => {
  if (data.id) {
    return await prisma.dentalClinic.update({
      where: {id: data.id},
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        representative: data.representative,
        qualifications: data.qualifications as Prisma.InputJsonValue,
      },
    })
  }
  return await prisma.dentalClinic.create({
    data: {
      name: data.name,
      address: data.address,
      phone: data.phone,
      representative: data.representative,
      qualifications: data.qualifications as Prisma.InputJsonValue,
    },
  })
}

// クリニック削除
export const deleteDentalClinic = async (id: number) => {
  return await prisma.dentalClinic.delete({where: {id}})
}
