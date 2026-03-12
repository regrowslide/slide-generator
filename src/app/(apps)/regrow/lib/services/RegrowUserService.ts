import prisma from 'src/lib/prisma'
import {AuthService} from 'src/lib/services/AuthService'
import type {User, RgStore} from '@prisma/generated/prisma/client'
import type {StaffMaster, StaffRole, StoreName} from '../../types'

export class RegrowUserService {
  /** regrowアプリの新規ユーザーを作成（User + Account + パスワードハッシュ化） */
  static async createUser(data: {name: string; email?: string; password?: string}): Promise<User> {
    return AuthService.createUserDirect({
      password: data.password,
      prismaData: {
        name: data.name,
        email: data.email || null,
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
  static async getRgRoleByUserId(userId: string): Promise<StaffRole> {
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

  /** ユーザーをBAN（全セッション削除 + ログイン不可） */
  static async banUser(userId: string, banReason?: string): Promise<void> {
    const {AdminService} = await import('src/lib/services/AdminService')
    await AdminService.banUser(userId, banReason)
  }

  /** ユーザーのBAN解除 */
  static async unbanUser(userId: string): Promise<void> {
    const {AdminService} = await import('src/lib/services/AdminService')
    await AdminService.unbanUser(userId)
  }

  /** ユーザーを完全削除（UserRoleも事前削除） */
  static async deleteUser(userId: string): Promise<void> {
    await prisma.userRole.deleteMany({where: {userId}})
    await prisma.user.delete({where: {id: userId}})
  }

  /** ユーザー情報を更新（名前・メール・パスワード） */
  static async updateUser(userId: string, data: {name?: string; email?: string; password?: string}): Promise<User> {
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email || null

    return AuthService.updateUser({id: userId}, updateData, data.password)
  }

  /** ユーザーの担当店舗（rgStoreId）を更新 */
  static async updateRgStore(userId: string, rgStoreId: number | null): Promise<User> {
    return AuthService.updateUser({id: userId}, {rgStoreId})
  }

  /** regrow UserをStaffMaster形式で取得（レポート画面用・店舗未設定ユーザーも含む） */
  static async getStaffMaster(): Promise<StaffMaster[]> {
    const users = await prisma.user.findMany({
      where: {apps: {has: 'regrow'}, banned: {not: true}},
      include: {
        RgStoreRg: true,
        UserRole: {
          where: {RoleMaster: {apps: {has: 'regrow'}}},
          include: {RoleMaster: {select: {name: true}}},
        },
      },
      orderBy: [{name: 'asc'}],
    })

    return users.map(u => ({
      userId: u.id,
      staffName: u.name,
      storeName: (u.RgStoreRg?.name ?? '未設定') as StoreName,
      role: (u.UserRole[0]?.RoleMaster.name.replace('regrow-', '') ?? 'viewer') as StaffRole,
      isBanned: u.banned ?? false,
    }))
  }
}
