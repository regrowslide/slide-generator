import {hashPassword} from 'better-auth/crypto'
import prisma from 'src/lib/prisma'
import {NextResponse} from 'next/server'

/**
 * 全ユーザーのプレーンテキストパスワードをscryptハッシュ化して
 * Accountテーブルに保存するAPI（開発・移行用）
 */
export const POST = async () => {
  const allUsers = await prisma.user.findMany({
    where: {password: {not: null}},
  })

  let updatedCount = 0

  for (const user of allUsers) {
    if (!user.password || !user.email) continue

    // 既にscryptハッシュ済み（salt:hash形式）ならスキップ
    if (user.password.includes(':') && user.password.length > 100) continue

    const hashed = await hashPassword(user.password)

    // credential Accountを検索
    const account = await prisma.account.findFirst({
      where: {userId: user.id, providerId: 'credential'},
    })

    if (account) {
      await prisma.account.update({
        where: {id: account.id},
        data: {password: hashed},
      })
    } else {
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
    updatedCount++
  }

  return NextResponse.json({updatedCount})
}
