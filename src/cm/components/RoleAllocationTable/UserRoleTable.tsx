'use client'

import type { RoleMaster, User, UserRole } from '@prisma/generated/prisma/client'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { cn } from '@cm/shadcn/lib/utils'

/** テーブルに表示するカラムの定義 */
export type UserColumnConfig = {
  /** Userオブジェクトのキー */
  key: keyof User
  /** カラムヘッダーのラベル */
  label: string
  /** セルのスタイル */
  style?: React.CSSProperties
}

/** デフォルトカラム: ユーザー名のみ */
export const DEFAULT_USER_COLUMNS: UserColumnConfig[] = [
  { key: 'name', label: 'ユーザー', style: { fontSize: 12 } },
]

type UserWithRole = User & { UserRole: UserRole[] }

type UserRoleTableProps = {
  users: UserWithRole[]
  roles: RoleMaster[]
  onUsersChanged: () => Promise<void>
  minWidthClassName?: string
  /** 表示するカラム定義（デフォルト: ユーザー名のみ） */
  userColumns?: UserColumnConfig[]
}

const UserRoleTable = ({ users, roles, onUsersChanged, minWidthClassName, userColumns = DEFAULT_USER_COLUMNS }: UserRoleTableProps) => {
  return CsvTable({
    records: users.map(u => ({
      csvTableRow: [
        ...userColumns.map(col => ({
          cellValue: String(u[col.key] ?? ''),
          label: col.label,
          style: col.style ?? { fontSize: 12 },
        })),
        ...roles.map(r => {
          const hasRole = !!u.UserRole.find(ur => ur.roleMasterId === r.id)
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
                        if (!confirm(`${u.name}に${r.description || r.name}を割り当てますか？`)) return
                        await doStandardPrisma('userRole', 'upsert', {
                          where: { userId_roleMasterId_unique },
                          create: { userId: u.id, roleMasterId: r.id },
                          update: { userId: u.id, roleMasterId: r.id },
                        })
                        await onUsersChanged()
                      } else {
                        if (!confirm(`${u.name}から${r.description || r.name}を割り当て解除しますか？`)) return
                        await doStandardPrisma('userRole', 'delete', {
                          where: { userId_roleMasterId_unique },
                        })
                        await onUsersChanged()
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
            label: <div>{r.description || r.name}</div>,
          }
        }),
      ],
    })),
  }).WithWrapper({
    className: cn('border rounded-lg border-gray-200 max-h-[55vh]  border-2 shadow', minWidthClassName),
  })
}

export default UserRoleTable
