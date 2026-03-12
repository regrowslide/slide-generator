import {isDev} from '@cm/lib/methods/common'
import prisma from 'src/lib/prisma'
import {AuthService} from 'src/lib/services/AuthService'
import {NextResponse} from 'next/server'

export const POST = async () => {
  if (!isDev) return NextResponse.json({})

  const email = 'admin@gmail.com'
  const password = 'admin12345'

  const existing = await prisma.user.findUnique({where: {email}})

  if (existing) {
    // 既存ユーザーの情報を更新 + パスワードをAccountに設定
    await AuthService.updateUser(
      {email},
      {code: '999999', sortOrder: 0, name: '管理者', type: 'マネージャー', role: 'admin', storeId: 8, rentaStoreId: 5},
      password,
    )
  } else {
    // 新規作成（User + Account）
    await AuthService.createUserDirect({
      password,
      prismaData: {
        code: '999999',
        sortOrder: 0,
        name: '管理者',
        email,
        type: 'マネージャー',
        role: 'admin',
        storeId: 8,
        rentaStoreId: 5,
      },
    })
  }

  return NextResponse.json({})
}
