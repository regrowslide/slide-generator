'use server'

import prisma from 'src/lib/prisma'
import type {RgStaff, RgStore} from '@prisma/generated/prisma/client'

// ============================================================
// Create
// ============================================================

export const createStaff = async (data: {
  staffName: string
  storeId: number
  role?: string
}): Promise<RgStaff> => {
  const maxSort = await prisma.rgStaff.aggregate({_max: {sortOrder: true}})
  const sortOrder = (maxSort._max.sortOrder ?? 0) + 1

  return prisma.rgStaff.create({
    data: {
      staffName: data.staffName,
      storeId: data.storeId,
      role: data.role ?? 'viewer',
      sortOrder,
    },
  })
}

// ============================================================
// Read
// ============================================================

export const getStaffs = async (
  where?: Partial<{storeId: number; isActive: boolean}>
): Promise<(RgStaff & {RgStore: RgStore})[]> => {
  return prisma.rgStaff.findMany({
    where: {isActive: true, ...where},
    include: {RgStore: true},
    orderBy: {sortOrder: 'asc'},
  })
}

// ============================================================
// Update
// ============================================================

export const updateStaff = async (
  id: number,
  data: Partial<{staffName: string; storeId: number; role: string; isActive: boolean; sortOrder: number}>
): Promise<RgStaff> => {
  return prisma.rgStaff.update({
    where: {id},
    data,
  })
}

// ============================================================
// Delete
// ============================================================

export const deleteStaff = async (id: number): Promise<void> => {
  await prisma.rgStaff.delete({where: {id}})
}

// ============================================================
// Upsert（名前+店舗名で検索、なければ作成）
// ============================================================

export const upsertStaffByName = async (staffName: string, storeName: string): Promise<RgStaff> => {
  // 店舗を名前で検索
  const store = await prisma.rgStore.findFirst({where: {name: storeName}})
  if (!store) {
    throw new Error(`店舗が見つかりません: ${storeName}`)
  }

  // スタッフを名前+店舗IDで検索
  const existing = await prisma.rgStaff.findFirst({
    where: {staffName, storeId: store.id},
  })

  if (existing) return existing

  // なければ作成
  return createStaff({staffName, storeId: store.id})
}
