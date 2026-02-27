import bcrypt from 'bcrypt'
import prisma from 'src/lib/prisma'
import type {User, RgStore} from '@prisma/generated/prisma/client'
import type {StaffMaster, StaffRole, StoreName} from '../../types'

const BCRYPT_ROUNDS = 10

export class RegrowUserService {
  /** regrowアプリの新規ユーザーを作成 */
  static async createUser(data: {name: string; email?: string; password?: string}): Promise<User> {
    const hashedPassword = data.password ? await bcrypt.hash(data.password, BCRYPT_ROUNDS) : null
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email || null,
        password: hashedPassword,
        apps: ['regrow'],
      },
    })
  }

  /** regrowアプリの全Userを取得（RgStoreRgを含む） */
  static async getAllUsers(): Promise<(User & {RgStoreRg: RgStore | null})[]> {
    return prisma.user.findMany({
      where: {apps: {has: 'regrow'}},
      include: {RgStoreRg: true},
      orderBy: [{code: 'asc'}, {name: 'asc'}],
    })
  }

  /** UserRole/RoleMasterからユーザーのregrowロールを取得 */
  static async getRgRoleByUserId(userId: number): Promise<StaffRole> {
    const role = await prisma.userRole.findFirst({
      where: {
        userId,
        RoleMaster: {apps: {has: 'regrow'}},
      },
      include: {RoleMaster: {select: {name: true}}},
    })
    const roleName = role?.RoleMaster.name ?? 'regrow-viewer'
    return roleName.replace('regrow-', '') as StaffRole
  }

  /** ユーザーの担当店舗（rgStoreId）を更新 */
  static async updateRgStore(userId: number, rgStoreId: number | null): Promise<User> {
    return prisma.user.update({
      where: {id: userId},
      data: {rgStoreId},
    })
  }

  /** rgStoreIdが設定されているUserをStaffMaster形式で取得（レポート画面用） */
  static async getStaffMaster(): Promise<StaffMaster[]> {
    const users = await prisma.user.findMany({
      where: {apps: {has: 'regrow'}, rgStoreId: {not: null}},
      include: {
        RgStoreRg: true,
        UserRole: {
          where: {RoleMaster: {apps: {has: 'regrow'}}},
          include: {RoleMaster: {select: {name: true}}},
        },
      },
      orderBy: [{name: 'asc'}],
    })

    return users.map((u) => ({
      staffName: u.name,
      storeName: u.RgStoreRg!.name as StoreName,
      role: (u.UserRole[0]?.RoleMaster.name.replace('regrow-', '') ?? 'viewer') as StaffRole,
      isActive: u.active,
    }))
  }
}
