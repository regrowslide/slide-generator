'use server'

import {sessionOnServer} from 'src/non-common/serverSideFunction'
import {AdminService} from 'src/lib/services/AdminService'

/** 管理者セッションを検証する */
const requireAdmin = async () => {
  const {session} = await sessionOnServer()
  if (session?.role !== 'admin') throw new Error('管理者権限が必要です')
  return session
}

/** アクティブセッション一覧取得 */
export const getSessions = async (params: {search?: string; page?: number}) => {
  await requireAdmin()
  return AdminService.getSessions(params)
}

/** 指定ユーザーの全セッション削除（強制ログアウト） */
export const revokeUserSessions = async (userId: string) => {
  await requireAdmin()
  return AdminService.revokeUserSessions(userId)
}

/** ログイン履歴取得 */
export const getLoginHistory = async (userId: string) => {
  await requireAdmin()
  return AdminService.getLoginHistory(userId)
}
