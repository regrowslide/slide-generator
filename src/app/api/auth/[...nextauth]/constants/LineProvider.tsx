import prisma from "src/lib/prisma";



export const lineProvider = {
  id: 'line',
  name: 'LINE',
  type: 'oauth' as const,
  authorization: {
    url: 'https://access.line.me/oauth2/v2.1/authorize',
    params: {
      scope: 'profile openid',
    },
  },
  token: 'https://api.line.me/oauth2/v2.1/token',
  userinfo: 'https://api.line.me/v2/profile',
  clientId: process.env.LINE_CLIENT_ID ?? '',
  clientSecret: process.env.LINE_CLIENT_SECRET ?? '',
  profile: async (profile: { userId: string; displayName: string; pictureUrl?: string }) => {
    // lineUserIdで既存ユーザーを検索
    const existingUser = await prisma.user.findUnique({
      where: { lineUserId: profile.userId },
    })

    if (existingUser) {
      return { ...existingUser, id: profile.userId }
    }

    // 初回ログイン：User自動生成
    const newUser = await prisma.user.create({
      data: {
        name: profile.displayName,
        lineUserId: profile.userId,
        avatar: profile.pictureUrl ?? null,
      },
    })

    return { ...newUser, id: profile.userId }
  },
}
