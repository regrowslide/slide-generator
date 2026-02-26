'use server'

import prisma from 'src/lib/prisma'
import type {RgStore} from '@prisma/generated/prisma/client'

// ============================================================
// Create
// ============================================================

export const createStore = async (data: {name: string; fullName?: string}): Promise<RgStore> => {
  const maxSort = await prisma.rgStore.aggregate({_max: {sortOrder: true}})
  const sortOrder = (maxSort._max.sortOrder ?? 0) + 1

  return prisma.rgStore.create({
    data: {
      name: data.name,
      fullName: data.fullName ?? null,
      sortOrder,
    },
  })
}

// ============================================================
// Read
// ============================================================

export const getStores = async (): Promise<RgStore[]> => {
  return prisma.rgStore.findMany({
    where: {isActive: true},
    orderBy: {sortOrder: 'asc'},
  })
}

// ============================================================
// Update
// ============================================================

export const updateStore = async (
  id: number,
  data: Partial<{name: string; fullName: string | null; isActive: boolean; sortOrder: number}>
): Promise<RgStore> => {
  return prisma.rgStore.update({
    where: {id},
    data,
  })
}

// ============================================================
// Delete
// ============================================================

export const deleteStore = async (id: number): Promise<void> => {
  await prisma.rgStore.delete({where: {id}})
}
