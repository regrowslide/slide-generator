import {auth} from 'src/lib/auth'
import {headers} from 'next/headers'
import {hashPassword} from 'better-auth/crypto'
import prisma from 'src/lib/prisma'
import type {Prisma, User} from '@prisma/generated/prisma/client'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * 認証関連のサービスクラス
 *
 * User + Account の作成・パスワード更新を一元管理する。
 * パスワードは better-auth 標準の scrypt でハッシュ化して Account に保存。
 */
export class AuthService {
  /** メールアドレス形式を検証する。不正な場合はエラーをスローする。 */
  static validateEmail(email: string): void {
    if (!EMAIL_REGEX.test(email)) {
      throw new Error(`メールアドレスの形式が正しくありません: ${email}`)
    }
  }
  /**
   * ユーザーを作成する（User + Account + パスワードハッシュ化）
   *
   * better-auth Admin Plugin の createUser API を使用。
   * 管理者セッションが必要。Server Actions から呼ぶ場合に使用。
   */
  static async createUser(input: {
    email: string
    password: string
    name: string
    role?: 'user' | 'admin'
    data?: Record<string, unknown>
  }) {
    AuthService.validateEmail(input.email)

    const result = await auth.api.createUser({
      headers: await headers(),
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
        role: input.role ?? 'user',
        data: input.data,
      },
    })

    return result.user
  }

  /**
   * ユーザーを作成する（Prisma直接操作版）
   *
   * 管理者セッション不要。シードスクリプトやバッチ処理から使用。
   * User作成 + credential Account作成 + パスワードscryptハッシュ化を行う。
   */
  static async createUserDirect(input: {password?: string; prismaData: Prisma.UserUncheckedCreateInput}): Promise<User> {
    if (input.prismaData.email) {
      AuthService.validateEmail(input.prismaData.email)
    }

    const user = await prisma.user.create({data: input.prismaData})

    // パスワード指定時はcredential Accountを作成
    if (input.password && user.email) {
      const hashed = await hashPassword(input.password)
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          accountId: user.email,
          providerId: 'credential',
          password: hashed,
        },
      })
    }

    return user
  }

  /**
   * ユーザー情報を更新する（email変更時はバリデーション + Account.accountId同期）
   *
   * パスワード変更が含まれる場合はAccount.passwordも更新する。
   */
  static async updateUser(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUncheckedUpdateInput,
    password?: string,
  ): Promise<User> {
    // emailが含まれる場合はバリデーション
    if (typeof data.email === 'string' && data.email) {
      AuthService.validateEmail(data.email)
    }

    const user = await prisma.user.update({where, data})

    // email変更時はAccount.accountIdも同期
    if (typeof data.email === 'string' && user.id) {
      const account = await prisma.account.findFirst({
        where: {userId: user.id, providerId: 'credential'},
      })
      if (account) {
        await prisma.account.update({
          where: {id: account.id},
          data: {accountId: data.email || account.accountId},
        })
      }
    }

    // パスワード変更
    if (password) {
      await AuthService.updatePassword(user.id, password)
    }

    return user
  }

  /**
   * パスワードを更新する（Account.password を scrypt ハッシュで上書き）
   */
  static async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashed = await hashPassword(newPassword)

    const existingAccount = await prisma.account.findFirst({
      where: {userId, providerId: 'credential'},
    })

    if (existingAccount) {
      await prisma.account.update({
        where: {id: existingAccount.id},
        data: {password: hashed},
      })
    } else {
      // credential Accountがない場合は新規作成
      const user = await prisma.user.findUnique({where: {id: userId}})
      if (!user?.email) throw new Error('ユーザーにemailが設定されていません')
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          accountId: user.email,
          providerId: 'credential',
          password: hashed,
        },
      })
    }
  }
}
