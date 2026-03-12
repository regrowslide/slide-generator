import type {Account, Session, User, UserRole, RoleMaster} from '@prisma/generated/prisma/client'

/** ユーザー一覧の1行の型 */
export type AdminUserRow = User & {
  Account: Pick<Account, 'id' | 'providerId' | 'createdAt'>[]
  UserRole: (UserRole & {RoleMaster: Pick<RoleMaster, 'name' | 'color' | 'apps'>})[]
}

/** ユーザー詳細の型 */
export type AdminUserDetail = User & {
  Account: Pick<Account, 'id' | 'providerId' | 'accountId' | 'createdAt'>[]
  Session: Pick<Session, 'id' | 'ipAddress' | 'userAgent' | 'createdAt' | 'expiresAt' | 'impersonatedBy'>[]
  UserRole: (UserRole & {RoleMaster: Pick<RoleMaster, 'name' | 'color' | 'apps'>})[]
}

/** セッション一覧の1行の型 */
export type AdminSessionRow = Pick<
  Session,
  'id' | 'userId' | 'ipAddress' | 'userAgent' | 'createdAt' | 'expiresAt' | 'impersonatedBy'
> & {
  User: Pick<User, 'id' | 'name' | 'email'>
}

/** ユーザー検索パラメータ */
export type UserSearchParams = {
  search?: string
  activeFilter?: 'all' | 'active' | 'inactive'
  roleFilter?: 'all' | 'admin' | 'user'
  page?: number
}

/** セッション検索パラメータ */
export type SessionSearchParams = {
  search?: string
  page?: number
}
