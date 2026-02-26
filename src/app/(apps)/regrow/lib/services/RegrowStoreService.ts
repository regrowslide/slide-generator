import prisma from 'src/lib/prisma'
import type {RgStore} from '@prisma/generated/prisma/client'

export class RegrowStoreService {
  static async createStore(data: {name: string; fullName?: string}): Promise<RgStore> {
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

  static async getStores(): Promise<RgStore[]> {
    return prisma.rgStore.findMany({
      where: {isActive: true},
      orderBy: {sortOrder: 'asc'},
    })
  }

  static async updateStore(
    id: number,
    data: Partial<{name: string; fullName: string | null; isActive: boolean; sortOrder: number}>
  ): Promise<RgStore> {
    return prisma.rgStore.update({where: {id}, data})
  }

  static async deleteStore(id: number): Promise<void> {
    await prisma.rgStore.delete({where: {id}})
  }
}
