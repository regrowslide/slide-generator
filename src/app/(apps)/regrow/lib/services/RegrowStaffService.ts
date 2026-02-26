import prisma from 'src/lib/prisma'
import type {RgStaff, RgStore} from '@prisma/generated/prisma/client'

export class RegrowStaffService {
  static async createStaff(data: {staffName: string; storeId: number; role?: string}): Promise<RgStaff> {
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

  static async getStaffs(
    where?: Partial<{storeId: number; isActive: boolean}>
  ): Promise<(RgStaff & {RgStore: RgStore})[]> {
    return prisma.rgStaff.findMany({
      where: {isActive: true, ...where},
      include: {RgStore: true},
      orderBy: {sortOrder: 'asc'},
    })
  }

  static async updateStaff(
    id: number,
    data: Partial<{staffName: string; storeId: number; role: string; isActive: boolean; sortOrder: number}>
  ): Promise<RgStaff> {
    return prisma.rgStaff.update({where: {id}, data})
  }

  static async deleteStaff(id: number): Promise<void> {
    await prisma.rgStaff.delete({where: {id}})
  }

  static async upsertStaffByName(staffName: string, storeName: string): Promise<RgStaff> {
    const store = await prisma.rgStore.findFirst({where: {name: storeName}})
    if (!store) throw new Error(`店舗が見つかりません: ${storeName}`)

    const existing = await prisma.rgStaff.findFirst({where: {staffName, storeId: store.id}})
    if (existing) return existing

    return RegrowStaffService.createStaff({staffName, storeId: store.id})
  }
}
