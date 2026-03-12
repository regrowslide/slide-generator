'use client'

import { useEffect, useState } from 'react'
import useModal from '@cm/components/utils/modal/useModal'
import { authClient } from 'src/lib/auth-client'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

type UserItem = {
  id: string
  name: string
  code: string | null
  email: string | null
  roleNames: string[]
}

const ImpersonationButton = () => {
  const { Modal, handleOpen, open } = useModal()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  // モーダルを開いた時にユーザー一覧を取得（権限情報含む）
  useEffect(() => {
    if (!open) return
    setLoading(true)
    doStandardPrisma('user', 'findMany', {
      select: {
        id: true,
        name: true,
        code: true,
        email: true,
        UserRole: { select: { RoleMaster: { select: { name: true } } } },
      },
      where: { active: true },
      orderBy: [{ name: 'asc' }],
    }).then(({ result }) => {
      const mapped = (result ?? []).map(u => ({
        id: u.id,
        name: u.name,
        code: u.code,
        email: u.email,
        roleNames: u.UserRole?.map(r => r.RoleMaster?.name).filter(Boolean) ?? [],
      }))
      setUsers(mapped)
      setLoading(false)
    })
  }, [open])

  const handleImpersonate = async (userId: string) => {
    await authClient.admin.impersonateUser({ userId })
    window.location.reload()
  }

  const filteredUsers = users.filter(u => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      u.name?.toLowerCase().includes(s) ||
      u.code?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.roleNames.some(r => r.toLowerCase().includes(s))
    )
  })

  return (
    <>
      <button
        onClick={() => handleOpen()}
        className="text-xs bg-amber-500 text-white px-2 py-1 rounded hover:bg-amber-600 transition-colors whitespace-nowrap"
      >
        ユーザー切替
      </button>
      <Modal title="ユーザー切替">
        <div className="min-w-[300px] max-w-[500px]">
          <input
            type="text"
            placeholder="名前・コード・メール・権限で検索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3 text-sm"
            autoFocus
          />
          {loading ? (
            <div className="text-center py-4 text-sm text-gray-500">読み込み中...</div>
          ) : (
            <div className="max-h-[50vh] overflow-y-auto">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleImpersonate(user.id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    {user.code && <span className="text-gray-400 text-xs">[{user.code}]</span>}
                    <span className="font-medium">{user.name}</span>
                    <span className="text-gray-400 text-xs ml-auto">{user.email}</span>
                  </div>
                  {user.roleNames.length > 0 && (
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {user.roleNames.map(role => (
                        <span key={role} className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                          {role}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-4 text-sm text-gray-400">該当ユーザーなし</div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

export default ImpersonationButton
