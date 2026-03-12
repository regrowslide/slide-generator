'use server'

import {sessionOnServer} from 'src/non-common/serverSideFunction'
import {AdminService} from 'src/lib/services/AdminService'
import {AuthService} from 'src/lib/services/AuthService'

/** 管理者セッションを検証する */
const requireAdmin = async () => {
  const {session} = await sessionOnServer()
  if (session?.role !== 'admin') throw new Error('管理者権限が必要です')
  return session
}

/** ユーザー一覧取得 */
export const getUsers = async (params: {
  search?: string
  activeFilter?: 'all' | 'active' | 'inactive'
  roleFilter?: 'all' | 'admin' | 'user'
  page?: number
}) => {
  await requireAdmin()
  return AdminService.getUsers(params)
}

/** ユーザー詳細取得 */
export const getUserDetail = async (userId: string) => {
  await requireAdmin()
  return AdminService.getUserDetail(userId)
}

/** ユーザー作成 */
export const createUser = async (input: {name: string; email: string; password: string; role?: 'user' | 'admin'}) => {
  await requireAdmin()
  return AuthService.createUser(input)
}

/** ユーザー更新 */
export const updateUser = async (
  userId: string,
  data: {name?: string; email?: string; role?: string},
  password?: string
) => {
  await requireAdmin()
  return AuthService.updateUser({id: userId}, data, password)
}

/** ユーザーの有効/無効切替 */
export const toggleUserActive = async (userId: string, active: boolean) => {
  await requireAdmin()
  return AdminService.toggleUserActive(userId, active)
}

/** ユーザー削除 */
export const deleteUser = async (userId: string) => {
  await requireAdmin()
  return AdminService.deleteUser(userId)
}
