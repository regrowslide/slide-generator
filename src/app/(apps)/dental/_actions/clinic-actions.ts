'use server'

import type {Prisma} from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'

// 最初のクリニックを取得
export const getFirstDentalClinic = async () => {
  return await prisma.dentalClinic.findFirst()
}

// クリニック取得
export const getDentalClinic = async (id: number) => {
  return await prisma.dentalClinic.findUnique({where: {id}})
}

// クリニックupsert（1件のみ想定）
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
