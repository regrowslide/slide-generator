import { PrismaModelNames } from '@cm/types/prisma-types'
import { DetailPagePropType } from '@cm/types/types'
import { useEffect, useState, useMemo } from 'react'
import { Prisma, RoleMaster, User, UserRole } from '@prisma/generated/prisma/client'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { surroundings } from '@cm/components/DataLogic/types/customParams-types'
import { anyObject } from '@cm/types/utility-types'
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { C_Stack } from '@cm/components/styles/common-components/common-components'
import { Fields } from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { Button } from '@cm/components/styles/common-components/Button'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import TableForm from '@cm/components/DataLogic/TFs/PropAdjustor/components/TableForm'
import { ClientPropsType2 } from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'
import { Card } from '@cm/shadcn/ui/card'

export type PageBuidlerClassType = {
  [key in PrismaModelNames]: surroundings
} & anyObject

export type DataModelBuilder = {
  table?: (props: DetailPagePropType) => React.ReactNode
  top?: (props: DetailPagePropType) => React.ReactNode
  form?: (props: DetailPagePropType) => React.ReactNode
  bottom?: (props: DetailPagePropType) => React.ReactNode
  left?: (props: DetailPagePropType) => React.ReactNode
  right?: (props: DetailPagePropType) => React.ReactNode
}

export const roleMaster: DataModelBuilder = {
  table: props => {
    return <Card className="border">
      <C_Stack>
        <div >
          <h2 className="text-xl font-bold  ">ユーザー権限一覧</h2>
        </div>
        <TableForm {...props as unknown as ClientPropsType2} />

      </C_Stack>
    </Card>

  },

  right: props => {
    return <Card>
      <div >
        <h2 className="text-xl font-bold  ">割当表</h2>
      </div>

      <RoleAllocationTable
        {...{
          PageBuilderExtraProps: props.PageBuilderExtraProps,
          // 動的検索フィールド定義（例: 店舗、ユーザー）
          searchFields: [
            {
              id: `storeId`,
              label: `店舗`,
              forSelect: {},
              userFilterKey: `storeId`, // User.storeId でフィルタ
            },
            {
              id: `userId`,
              label: `ユーザー`,
              forSelect: { modelName: `user` },
              userFilterKey: `id`, // User.id でフィルタ
            },
          ],
        }}
      />
    </Card>
  },


}

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
  /** Userモデルのどのプロパティでフィルタするか */
  userFilterKey: string
}

type RoleAllocationTableProps = {
  PageBuilderExtraProps?: anyObject
  /** 動的検索フィールドの定義配列 */
  searchFields?: SearchFieldConfig[]
}

const RoleAllocationTable = ({ PageBuilderExtraProps, searchFields = [] }: RoleAllocationTableProps) => {
  const { rootPath, query, addQuery } = useGlobal()
  type user = User & { UserRole: UserRole[] }
  const [users, setusers] = useState<user[]>([])
  const [roles, setroles] = useState<RoleMaster[]>([])
  const itemsPerPage = 50

  // queryから値を取得（デフォルト値付き）
  const selectedRoleFilter = query?.roleFilter || 'all'
  const currentPage = query?.page ? Number(query.page) : 1

  // 動的フィールドのクエリ値を取得
  const searchFieldValues = useMemo(() => {
    return Object.fromEntries(
      searchFields.map(field => [
        field.id,
        query?.[field.id] ? (field.userFilterKey === 'id' ? Number(query[field.id]) : query[field.id]) : null,
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

  // 店舗・ユーザーの絞り込みフォーム
  const { BasicForm, latestFormData } = useBasicFormProps({
    formData: formDefaultValues,
    columns: searchColumns,
  })

  const fetchUsers = async () => {
    // 共通マスタページの場合は全アプリのユーザーを取得
    const whereCondition: Prisma.UserFindManyArgs['where'] =
      rootPath === 'common'
        ? PageBuilderExtraProps?.where
        : { ...PageBuilderExtraProps?.where, apps: { has: rootPath } }

    const { result: users = [] } = await doStandardPrisma(`user`, `findMany`, {
      where: whereCondition,
      include: {
        Store: { select: { id: true, name: true } },
        UserRole: { include: { RoleMaster: {} } }
      },
      orderBy: [{ code: `asc` }, { sortOrder: `asc` }, { name: `asc` }],
    })




    setusers(users)
  }

  const fetchRoles = async () => {
    const { result: roles = [] } = await doStandardPrisma(`roleMaster`, `findMany`, {})
    setroles(roles)
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [PageBuilderExtraProps?.where, PageBuilderExtraProps?.where?.userId, PageBuilderExtraProps?.where?.roleMasterId])

  // フィルタリングされたユーザーリスト（useMemoで最適化）
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // 動的検索フィールドによるフィルタリング
      for (const field of searchFields) {
        const filterValue = searchFieldValues[field.id]
        if (filterValue !== null && filterValue !== undefined) {
          // userFilterKeyに対応するユーザープロパティでフィルタ
          const userValue = user[field.userFilterKey]
          if (userValue !== filterValue) {
            return false
          }
        }
      }

      // 権限フィルタ
      if (selectedRoleFilter === 'all') {
        return true
      } else if (selectedRoleFilter === 'no-role') {
        return user.UserRole.length === 0
      } else {
        return user.UserRole.some(ur => ur.roleMasterId === Number(selectedRoleFilter))
      }
    })
  }, [users, selectedRoleFilter, searchFields, searchFieldValues])

  // ページネーション計算
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(startIndex, endIndex)
  }, [filteredUsers, startIndex, endIndex])



  // 検索・フィルタ変更時にページを1にリセットするヘルパー
  // const updateQuery = (updates: any, resetPage: boolean = false) => {
  //   const newQuery: any = {...updates}
  //   if (resetPage) {
  //     newQuery.page = null
  //   }
  //   addQuery(newQuery)
  // }

  // ページ変更ハンドラー
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newQuery: any = {}
      if (newPage > 1) {
        newQuery.page = String(newPage)
      } else {
        newQuery.page = null
      }
      addQuery(newQuery)
      // スクロールをテーブル上部に戻す
      const tableContainer = document.querySelector('.overflow-auto.max-h-\\[40vw\\]')
      if (tableContainer) {
        tableContainer.scrollTop = 0
      }
    }
  }

  // フィルタ変更ハンドラー
  const handleRoleFilterChange = (value: string) => {
    const newQuery: any = {}
    if (value !== 'all') {
      newQuery.roleFilter = value
    } else {
      newQuery.roleFilter = null
    }
    // ページをリセット
    newQuery.page = null
    addQuery(newQuery)
  }

  return (
    <>
      <C_Stack className={`items-start`}>

        {/* 検索・フィルタエリア */}
        <div className="space-y-4 p-2 ">
          {/* 動的検索フィールドのフォーム */}
          {searchFields.length > 0 && (
            <BasicForm
              {...{
                alignMode: `row`,
                latestFormData,
                onSubmit: async data => {
                  const newQuery: any = { page: null }
                  // 動的フィールドの値をクエリに設定
                  searchFields.forEach(field => {
                    newQuery[field.id] = data[field.id] || null
                  })
                  addQuery(newQuery)
                },
              }}
            >
              <Button>確定</Button>
            </BasicForm>
          )}

          {/* 権限フィルタ */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">権限フィルタ</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className={`grid grid-cols-8 gap-2`}>
                {/* すべてのユーザー */}
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="roleFilter"
                    value="all"
                    checked={selectedRoleFilter === 'all'}
                    onChange={e => handleRoleFilterChange(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700 font-semibold">すべて</span>
                </label>
                {/* 役割なしユーザー */}
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="roleFilter"
                    value="no-role"
                    checked={selectedRoleFilter === 'no-role'}
                    onChange={e => handleRoleFilterChange(e.target.value)}
                    className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="text-xs text-orange-700 font-semibold">役割なし</span>
                </label>
                {roles.map(role => (
                  <label key={role.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="roleFilter"
                      value={role.id}
                      checked={selectedRoleFilter === String(role.id)}
                      onChange={e => handleRoleFilterChange(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700">{role.name}</span>
                  </label>
                ))}
              </div>
            </div>
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
        </div>

        <div className={`p-2`}>
          {CsvTable({
            records: paginatedUsers.map(u => ({
              csvTableRow: [
                { cellValue: String(u.code), label: 'コード', style: { fontSize: 12 } },
                { cellValue: u.name, label: 'ユーザー', style: { fontSize: 12 } },
                ...roles.map(r => {
                  const userRole = u.UserRole.find(ur => ur.roleMasterId === r.id)
                  const hasRole = !!userRole
                  return {
                    style: { width: 70, fontSize: 12 },
                    cellValue: (
                      <div className="flex justify-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            onChange={async e => {
                              const apply = e.target.checked
                              const userId_roleMasterId_unique = {
                                userId: u.id,
                                roleMasterId: r.id,
                              }

                              if (apply) {
                                if (!confirm(`${u.name}に${r.name}を割り当てますか？`)) return

                                await doStandardPrisma(`userRole`, `upsert`, {
                                  where: { userId_roleMasterId_unique },
                                  create: { userId: u.id, roleMasterId: r.id },
                                  update: { userId: u.id, roleMasterId: r.id },
                                })
                                await fetchUsers()
                              } else {
                                if (!confirm(`${u.name}から${r.name}を割り当て解除しますか？`)) return
                                await doStandardPrisma(`userRole`, `delete`, {
                                  where: { userId_roleMasterId_unique },
                                })
                                await fetchUsers()
                              }
                            }}
                            type="checkbox"
                            defaultChecked={hasRole}
                            className="sr-only peer"
                          />
                          <div
                            className={`
                        relative w-7 h-4 rounded-full transition-all duration-300 ease-in-out
                        ${hasRole ? 'bg-blue-500 shadow-lg' : 'bg-gray-200'}
                        peer-focus:ring-2 peer-focus:ring-blue-300/50
                      `}
                          >
                            <div
                              className={`
                          absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full
                          transition-all duration-300 ease-in-out shadow-md
                          ${hasRole ? 'translate-x-3.5' : 'translate-x-0'}
                        `}
                            />
                          </div>
                        </label>
                      </div>
                    ),
                    label: <div>{r.name}</div>,
                  }
                }),
              ],
            })),
          }).WithWrapper({
            className: 'border rounded-lg border-gray-200 max-h-[55vh]  min-w-[400px]',
          })}
        </div>

        {/* ページネーション */}
        <div className={`p-2`}>
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 ">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`
                  flex items-center space-x-1 px-3 py-1 rounded-lg transition-all duration-200
                  ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                  }
                `}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>前へ</span>
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // 最初のページ、最後のページ、現在のページ、その前後のページを表示
                    return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)
                  })
                  .map((page, index, array) => {
                    // 前のページ番号との間に省略記号を挿入
                    const showEllipsis = index > 0 && array[index - 1] < page - 1
                    return (
                      <div key={page} className="flex items-center space-x-1">
                        {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`
                            w-10 rounded-lg transition-all duration-200 font-medium
                            ${currentPage === page
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                            }
                          `}
                        >
                          {page}
                        </button>
                      </div>
                    )
                  })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`
                  flex items-center space-x-1 px-3 py-1 rounded-lg transition-all duration-200
                  ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                  }
                `}
              >
                <span>次へ</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </C_Stack>
    </>
  )
}
