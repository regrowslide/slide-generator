'use server'
import {requireAdmin} from './session-actions'

import {AdminService} from 'src/lib/services/AdminService'
import {AuthService} from 'src/lib/services/AuthService'

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
export const updateUser = async (userId: string, data: {name?: string; email?: string; role?: string}, password?: string) => {
  await requireAdmin()
  return AuthService.updateUser({id: userId}, data, password)
}

/** ユーザー削除 */
export const deleteUser = async (userId: string) => {
  await requireAdmin()
  return AdminService.deleteUser(userId)
}

/** ユーザーBAN */
export const banUser = async (userId: string, banReason?: string) => {
  await requireAdmin()
  return AdminService.banUser(userId, banReason)
}

/** ユーザーBAN解除 */
export const unbanUser = async (userId: string) => {
  await requireAdmin()
  return AdminService.unbanUser(userId)
}

/** ユーザーUpsert（email基準で作成 or 更新） */
export const upsertUser = async (input: {email: string; name: string; role?: 'user' | 'admin'; password?: string}) => {
  await requireAdmin()
  return AuthService.upsertUser(input)
}
