'use client'

import {useState, useEffect, useCallback} from 'react'
import {Pencil, Trash2, Eye, Search} from 'lucide-react'
import {Card, CardContent} from '@shadcn/ui/card'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@shadcn/ui/table'
import {Input} from '@shadcn/ui/input'
import {Switch} from '@shadcn/ui/switch'
import {Button} from '@cm/components/styles/common-components/Button'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {getUsers, createUser, updateUser, toggleUserActive, deleteUser} from '../../_actions/user-actions'
import type {AdminUserRow} from '../../lib/types'
import UserFormModal from '../modals/UserFormModal'
import UserDetailModal from '../modals/UserDetailModal'

const UserManagementTab = () => {
  const {toggleLoad} = useGlobal()
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')

  const formModal = useModal()
  const detailModal = useModal<string | null>()
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null)

  const fetchUsers = useCallback(async () => {
    const result = await getUsers({search: search || undefined, activeFilter, roleFilter, page})
    setUsers(result.users as AdminUserRow[])
    setTotal(result.total)
    setTotalPages(result.totalPages)
  }, [search, activeFilter, roleFilter, page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = () => {
    setPage(1)
    fetchUsers()
  }

  const handleCreate = () => {
    setEditingUser(null)
    formModal.handleOpen()
  }

  const handleEdit = (user: AdminUserRow) => {
    setEditingUser(user)
    formModal.handleOpen()
  }

  const handleSave = async (data: {name: string; email: string; password: string; role: string}) => {
    await toggleLoad(async () => {
      if (editingUser) {
        await updateUser(
          editingUser.id,
          {name: data.name, email: data.email, role: data.role},
          data.password || undefined
        )
      } else {
        await createUser({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role as 'user' | 'admin',
        })
      }
      await fetchUsers()
    }, {refresh: false})
  }

  const handleToggleActive = async (userId: string, active: boolean) => {
    await toggleLoad(async () => {
      await toggleUserActive(userId, active)
      await fetchUsers()
    }, {refresh: false})
  }

  const handleDelete = async (user: AdminUserRow) => {
    if (!window.confirm(`「${user.name}」を削除しますか？\nこの操作は取り消せません。`)) return
    await toggleLoad(async () => {
      await deleteUser(user.id)
      await fetchUsers()
    }, {refresh: false})
  }

  const formatJst = (date: Date | string | null) => {
    if (!date) return '-'
    return formatDate(new Date(date), 'YYYY/MM/DD')
  }

  return (
    <div className="space-y-4">
      {/* 検索・フィルタ */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-500 mb-1 block">検索（名前/メール）</label>
              <div className="flex gap-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="名前またはメールで検索"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button size="sm" onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">状態</label>
              <select
                className="border rounded px-3 py-2 text-sm"
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value as any)
                  setPage(1)
                }}
              >
                <option value="all">全て</option>
                <option value="active">有効</option>
                <option value="inactive">無効</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">ロール</label>
              <select
                className="border rounded px-3 py-2 text-sm"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as any)
                  setPage(1)
                }}
              >
                <option value="all">全て</option>
                <option value="admin">admin</option>
                <option value="user">user</option>
              </select>
            </div>
            <Button onClick={handleCreate}>新規作成</Button>
          </div>
        </CardContent>
      </Card>

      {/* 件数表示 */}
      <div className="text-sm text-gray-500">
        {total}件中 {(page - 1) * 20 + 1}〜{Math.min(page * 20, total)}件を表示
      </div>

      {/* テーブル */}
      <Card>
        <CardContent className="pt-4">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>メール</TableHead>
                  <TableHead>ロール</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>プロバイダ</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                      ユーザーが見つかりません
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className={!user.active ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm text-gray-500">{user.email ?? '-'}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={user.active}
                          onCheckedChange={(checked) => handleToggleActive(user.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.Account.map((acc) => (
                            <ProviderBadge key={acc.id} providerId={acc.providerId} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{formatJst(user.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1 hover:bg-gray-100 rounded"
                            title="詳細"
                            onClick={() => detailModal.handleOpen(user.id)}
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            className="p-1 hover:bg-gray-100 rounded"
                            title="編集"
                            onClick={() => handleEdit(user)}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 hover:bg-gray-100 rounded"
                            title="削除"
                            onClick={() => handleDelete(user)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button size="sm" color="gray" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            前へ
          </Button>
          <span className="px-3 py-1 text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <Button size="sm" color="gray" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            次へ
          </Button>
        </div>
      )}

      {/* モーダル */}
      <UserFormModal modal={formModal} editingUser={editingUser} onSave={handleSave} />
      <UserDetailModal modal={detailModal} />
    </div>
  )
}

/** プロバイダバッジ */
const ProviderBadge = ({providerId}: {providerId: string}) => {
  const styles: Record<string, string> = {
    credential: 'bg-blue-100 text-blue-700',
    google: 'bg-red-100 text-red-700',
    line: 'bg-green-100 text-green-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[providerId] ?? 'bg-gray-100 text-gray-600'}`}>
      {providerId}
    </span>
  )
}

export default UserManagementTab
