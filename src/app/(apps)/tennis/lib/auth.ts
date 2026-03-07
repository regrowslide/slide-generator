import {getServerSession} from 'next-auth'
import {authOptions} from '@app/api/auth/[...nextauth]/constants/authOptions'

// Server Action用の認証チェック。未認証なら例外を投げる
export async function requireAuth() {
  const data: any = await getServerSession(authOptions)
  const user = data?.user
  if (!user?.id || typeof user.id === 'string') {
    throw new Error('認証が必要です')
  }
  return {userId: user.id as number}
}
