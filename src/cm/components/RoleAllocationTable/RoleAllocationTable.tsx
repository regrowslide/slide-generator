'use client'

import { useEffect, useState, useMemo } from 'react'
import { Prisma, type RoleMaster, type User, type UserRole } from '@prisma/generated/prisma/client'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { anyObject } from '@cm/types/utility-types'
import { Search, UserRound } from 'lucide-react'
import { C_Stack } from '@cm/components/styles/common-components/common-components'
import { Fields } from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { Button } from '@cm/components/styles/common-components/Button'
import RoleMasterCrudSection from './RoleMasterCrudSection'
import PaginationSection from './PaginationSection'
import RoleFilterSection from './RoleFilterSection'
import UserRoleTable from './UserRoleTable'

/**
 * 動的検索フィールドの型定義
 */
export type SearchFieldConfig = {
  /** フィールドID (クエリパラメータ名として使用) */
  id: string
  /** フィールドラベル */
  label: string
  /** forSelectの設定 */
  forSelect?: anyObject

}

type user = User & { UserRole: UserRole[] }
type RoleAllocationTableProps = {
  PageBuilderExtraProps?: anyObject
  /** 動的検索フィールドの定義配列 */
  searchFields?: SearchFieldConfig[]
  /** アプリ名でRoleMasterを絞り込む */
  appFilter?: string
  /** Userフィルタ（未指定時はrootPathベースで自動判定） */
  createUserFetchProps?: (query: anyObject) => {
    where?: Prisma.UserFindManyArgs['where']
    include?: Prisma.UserFindManyArgs['include']
    orderBy?: Prisma.UserFindManyArgs['orderBy']
    take?: Prisma.UserFindManyArgs['take']
    skip?: Prisma.UserFindManyArgs['skip']
  }
}

const ITEMS_PER_PAGE = 50

const RoleAllocationTable = ({
  PageBuilderExtraProps,
  searchFields = [{
    id: 'userId',
    label: 'ユーザー',
    forSelect: { modelName: 'user' },
  }],
  appFilter,
  createUserFetchProps,
}: RoleAllocationTableProps) => {
  const minWidthClassName = 'min-w-[480px]'
  const useGlobalProps = useGlobal()
  const { query, addQuery, session } = useGlobalProps

  const isAdmin = session?.scopes.admin

  const [users, setusers] = useState<user[]>([])
  const [roles, setroles] = useState<RoleMaster[]>([])

  // queryから値を取得（デフォルト値付き）
  const selectedRoleFilter = query?.roleFilter || 'all'
  const currentPage = query?.page ? Number(query.page) : 1

  // 動的フィールドのクエリ値を取得
  const searchFieldValues = useMemo(() => {
    return Object.fromEntries(
      searchFields.map(field => [
        field.id,
        query?.[field.id] ? query[field.id] : null,
      ])
    )
  }, [query, searchFields])

  // 動的検索フィールドからフォームのデフォルト値を生成
  const formDefaultValues = useMemo(() => {
    return Object.fromEntries(
      searchFields.map(field => [field.id, searchFieldValues[field.id] ? String(searchFieldValues[field.id]) : ''])
    )
  }, [searchFields, searchFieldValues])

  // 動的検索フィールドからカラム定義を生成
  const searchColumns = useMemo(() => {
    return new Fields(
      searchFields.map(field => ({
        id: field.id,
        label: field.label,
        forSelect: field.forSelect || {},
        form: {},
      }))
    ).transposeColumns()
  }, [searchFields])

  const { BasicForm, latestFormData } = useBasicFormProps({
    formData: formDefaultValues,
    columns: searchColumns,
  })

  const fetchUsers = async () => {
    const {
      where = {
        AND: [
          { apps: { has: useGlobalProps.rootPath } },
          ...(query.userId ? [{ id: query.userId }] : []),
          ...(query.storeId ? [{ storeId: Number(query.storeId) }] : []),
        ]
      },
      include = {
        UserRole: { include: { RoleMaster: {} } }
      },
      orderBy = [{ code: `asc` }, { sortOrder: `asc` }, { name: `asc` }],
      take,
      skip,
    } = createUserFetchProps?.(query) ?? {}

    const { result: users } = await doStandardPrisma('user', 'findMany', {
      where,
      include,
      orderBy,
      take,
      skip,
    })
    setusers(users)
  }

  const fetchRoles = async () => {
    const where = appFilter ? { apps: { has: appFilter } } : {}
    const { result: roles = [] } = await doStandardPrisma('roleMaster', 'findMany', { where })
    setroles(roles)
  }

  const searchFieldValuesKey = JSON.stringify(searchFieldValues)

  useEffect(() => {
    fetchUsers()
  }, [PageBuilderExtraProps?.where, PageBuilderExtraProps?.where?.userId, PageBuilderExtraProps?.where?.roleMasterId, searchFieldValuesKey])

  useEffect(() => {
    fetchRoles()
  }, [])

  // 権限フィルタのみクライアント側（searchFieldsはサーバーサイドで処理済み）
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (selectedRoleFilter === 'all') return true
      if (selectedRoleFilter === 'no-role') return user.UserRole.length === 0
      return user.UserRole.some(ur => ur.roleMasterId === Number(selectedRoleFilter))
    })
  }, [users, selectedRoleFilter])

  // ページネーション計算
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(startIndex, endIndex)
  }, [filteredUsers, startIndex, endIndex])

  const handlePageChange = (newPage: number) => {
    addQuery({ page: newPage > 1 ? String(newPage) : null })
    const tableContainer = document.querySelector('.overflow-auto.max-h-\\[40vw\\]')
    if (tableContainer) {
      tableContainer.scrollTop = 0
    }
  }

  const handleRoleFilterChange = (value: string) => {
    addQuery({
      roleFilter: value !== 'all' ? value : null,
      page: null,
    })
  }

  return (
    <C_Stack className="gap-4" >
      {/* RoleMaster管理（管理者のみ） */}
      {isAdmin && (
        <RoleMasterCrudSection
          roles={roles}
          appFilter={appFilter}
          onRolesChanged={fetchRoles}
          onUsersChanged={fetchUsers}
        />
      )}

      <hr />
      <section>
        <C_Stack className="items-start">
          <h2 className="text-lg font-bold">権限割り振り</h2>

          {/* 検索・フィルタエリア */}
          <C_Stack className="gap-8 p-2">
            <div className="space-y-6">
              <RoleFilterSection
                roles={roles}
                selectedRoleFilter={selectedRoleFilter}
                onFilterChange={handleRoleFilterChange}
                minWidthClassName={minWidthClassName}
              />

              {/* 動的検索フィールドのフォーム */}
              <C_Stack>
                {searchFields.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2">
                      <Search className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-bold">検索</span>
                    </div>
                    <div className="ml-4">
                      <BasicForm
                        {...{
                          alignMode: 'row',
                          latestFormData,
                          onSubmit: async data => {
                            const newQuery: any = { page: null }
                            searchFields.forEach(field => {
                              newQuery[field.id] = data[field.id] || null
                            })
                            addQuery(newQuery)
                          },
                        }}
                      >
                        <Button>確定</Button>
                      </BasicForm>
                    </div>
                  </div>
                )}
              </C_Stack>
            </div>
          </C_Stack>

          <div className="p-2">
            <div className="flex items-center space-x-2">
              <UserRound className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-bold">割り振り</span>
            </div>
            {/* 検索結果件数表示 */}
            <div className="text-sm text-gray-500">
              {filteredUsers.length}件のユーザーが見つかりました（全{users.length}件中）
              {totalPages > 1 && (
                <span className="ml-2">
                  - {startIndex + 1}〜{Math.min(endIndex, filteredUsers.length)}件を表示（{currentPage}/{totalPages}ページ）
                </span>
              )}
            </div>

            <UserRoleTable
              users={paginatedUsers}
              roles={roles}
              onUsersChanged={fetchUsers}
              minWidthClassName={minWidthClassName}
            />
          </div>

          <PaginationSection
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </C_Stack>
      </section>
    </C_Stack>
  )
}

export default RoleAllocationTable
