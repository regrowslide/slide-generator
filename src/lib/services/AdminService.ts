import prisma from 'src/lib/prisma'
import type {Prisma} from '@prisma/generated/prisma/client'

/**
 * 管理者向けDB操作サービス
 * User・Session・Account の一覧取得・操作を提供する。
 */
export class AdminService {
  // ============================================================
  // User関連
  // ============================================================

  /** ユーザー一覧取得（検索・フィルタ・ページネーション対応） */
  static async getUsers(params: {
    search?: string
    roleFilter?: 'all' | 'admin' | 'user'
    page?: number
    perPage?: number
  }) {
    const {search, roleFilter = 'all', page = 1, perPage = 20} = params

    const where: Prisma.UserWhereInput = {
      AND: [
        // テキスト検索（name/email部分一致）
        ...(search
          ? [
              {
                OR: [
                  {name: {contains: search, mode: 'insensitive' as const}},
                  {email: {contains: search, mode: 'insensitive' as const}},
                ],
              },
            ]
          : []),
        // roleフィルタ
        ...(roleFilter !== 'all' ? [{role: roleFilter}] : []),
      ],
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          Account: {select: {id: true, providerId: true, createdAt: true}},
          UserRole: {include: {RoleMaster: {select: {name: true, color: true, apps: true}}}},
        },
        orderBy: [{sortOrder: 'asc'}, {name: 'asc'}],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.user.count({where}),
    ])

    return {users, total, totalPages: Math.ceil(total / perPage)}
  }

  /** ユーザー詳細取得（Account・Session・UserRole含む） */
  static async getUserDetail(userId: string) {
    return prisma.user.findUnique({
      where: {id: userId},
      include: {
        Account: {select: {id: true, providerId: true, accountId: true, createdAt: true}},
        Session: {
          select: {id: true, ipAddress: true, userAgent: true, createdAt: true, expiresAt: true, impersonatedBy: true},
          orderBy: {createdAt: 'desc'},
          take: 20,
        },
        UserRole: {include: {RoleMaster: {select: {name: true, color: true, apps: true}}}},
      },
    })
  }

  /** ユーザー削除（関連Account・Session・UserRoleはCascadeで削除） */
  static async deleteUser(userId: string) {
    return prisma.user.delete({where: {id: userId}})
  }

  /** ユーザーをBAN（全セッション削除 + ログイン不可） */
  static async banUser(userId: string, banReason?: string, banExpiresIn?: number) {
    await prisma.user.update({
      where: {id: userId},
      data: {
        banned: true,
        banReason: banReason || null,
        banExpires: banExpiresIn ? new Date(Date.now() + banExpiresIn * 1000) : null,
      },
    })
    // BAN時に全セッションを削除（即ログアウト）
    await prisma.session.deleteMany({where: {userId}})
  }

  /** ユーザーのBAN解除 */
  static async unbanUser(userId: string) {
    await prisma.user.update({
      where: {id: userId},
      data: {banned: false, banReason: null, banExpires: null},
    })
  }

  // ============================================================
  // Session関連
  // ============================================================

  /** アクティブセッション一覧取得 */
  static async getSessions(params: {search?: string; page?: number; perPage?: number}) {
    const {search, page = 1, perPage = 20} = params

    const where: Prisma.SessionWhereInput = {
      ...(search
        ? {
            User: {
              OR: [
                {name: {contains: search, mode: 'insensitive'}},
                {email: {contains: search, mode: 'insensitive'}},
              ],
            },
          }
        : {}),
    }

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        include: {
          User: {select: {id: true, name: true, email: true}},
        },
        orderBy: {createdAt: 'desc'},
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.session.count({where}),
    ])

    return {sessions, total, totalPages: Math.ceil(total / perPage)}
  }

  /** 指定ユーザーの全セッション削除（強制ログアウト） */
  static async revokeUserSessions(userId: string) {
    return prisma.session.deleteMany({where: {userId}})
  }

  /** ログイン履歴取得（Session createdAt時系列） */
  static async getLoginHistory(userId: string) {
    return prisma.session.findMany({
      where: {userId},
      select: {id: true, ipAddress: true, userAgent: true, createdAt: true, expiresAt: true, impersonatedBy: true},
      orderBy: {createdAt: 'desc'},
      take: 50,
    })
  }
}
