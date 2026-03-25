'use client'

import { useState, useCallback, useEffect } from 'react'
import { Pencil, Trash2, Building2, Users, Database, Shield } from 'lucide-react'

import { Card, CardContent } from '@shadcn/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shadcn/ui/table'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Switch } from '@shadcn/ui/switch'
import { Button } from '@cm/components/styles/common-components/Button'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useModal from '@cm/components/utils/modal/useModal'

import { getAllStores as fetchAllStores, createStore, updateStore, deleteStore } from '../../_actions/store-actions'
import { getAllUsers, updateUserRgStore, banRegrowUser, unbanRegrowUser, createRegrowUser, deleteRegrowUser, updateRegrowUser } from '../../_actions/staff-actions'
import { seedRegrowData, resetRegrowData, seedFromExcelFiles } from '../../_actions/seed-regrow-actions'
import RoleAllocationTable from '@cm/components/RoleAllocationTable/RoleAllocationTable'

import type { RgStore, User } from '@prisma/generated/prisma/client'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { isDev } from '@cm/lib/methods/common'

type Props = {
  stores: RgStore[]
}

type StoreFormData = {
  name: string
  isActive: boolean
}

const defaultStoreForm: StoreFormData = {
  name: '',
  isActive: true,
}

const RegrowMasterClient = ({ stores: initialStores }: Props) => {
  const { query, toggleLoad, session } = useGlobal()
  const [activeTab, setActiveTab] = useState<'store' | 'user' | 'role'>('store')
  // roleタブ切り替え時に再マウントさせるためのキー
  const [roleTabKey, setRoleTabKey] = useState(0)

  // 店舗state
  const [stores, setStores] = useState(initialStores)
  const [storeEditingId, setStoreEditingId] = useState<number | null>(null)
  const [storeForm, setStoreForm] = useState<StoreFormData>(defaultStoreForm)
  const [storeFormError, setStoreFormError] = useState<string | null>(null)

  // ユーザー・店舗割当state
  const [users, setUsers] = useState<(User & { RgStoreRg: RgStore | null })[]>([])

  // ユーザー新規追加state
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '' })
  const [userFormError, setUserFormError] = useState<string | null>(null)

  // ユーザー編集state
  const [userEditingId, setUserEditingId] = useState<string | null>(null)
  const [userEditForm, setUserEditForm] = useState({ name: '', email: '', password: '' })
  const [userEditFormError, setUserEditFormError] = useState<string | null>(null)

  // モーダル
  const storeModal = useModal()
  const userModal = useModal()
  const userEditModal = useModal()

  // 店舗一覧を取得
  const fetchStores = useCallback(async () => {
    const result = await fetchAllStores()
    setStores(result)
  }, [])

  // ユーザー一覧を取得
  const fetchUsers = useCallback(async () => {
    const result = await getAllUsers()
    setUsers(result)
  }, [])

  // タブ切り替え時にデータを再取得
  useEffect(() => {
    if (activeTab === 'store') {
      fetchStores()
    } else if (activeTab === 'user') {
      fetchUsers()
    }
  }, [activeTab, fetchStores, fetchUsers])

  // ============================================================
  // 店舗マスタ
  // ============================================================

  const handleOpenNewStore = useCallback(() => {
    setStoreEditingId(null)
    setStoreForm(defaultStoreForm)
    setStoreFormError(null)
    storeModal.handleOpen()
  }, [storeModal])

  const handleOpenEditStore = useCallback(
    (store: RgStore) => {
      setStoreEditingId(store.id)
      setStoreForm({
        name: store.name,
        isActive: store.isActive,
      })
      setStoreFormError(null)
      storeModal.handleOpen()
    },
    [storeModal]
  )

  const handleSaveStore = useCallback(async () => {
    if (!storeForm.name) {
      setStoreFormError('名前は必須です')
      return
    }

    toggleLoad(async () => {
      if (storeEditingId) {
        const updated = await updateStore(storeEditingId, {
          name: storeForm.name,
          isActive: storeForm.isActive,
        })
        setStores((prev) => prev.map((s) => (s.id === storeEditingId ? updated : s)))
      } else {
        const created = await createStore({
          name: storeForm.name,
        })
        setStores((prev) => [...prev, created])
      }
      storeModal.handleClose()
    }, { refresh: false })
  }, [storeEditingId, storeForm, toggleLoad, storeModal])

  const handleDeleteStore = useCallback(
    async (id: number) => {
      if (!window.confirm('この店舗を削除しますか？')) return

      toggleLoad(async () => {
        await deleteStore(id)
        setStores((prev) => prev.filter((s) => s.id !== id))
      }, { refresh: false })
    },
    [toggleLoad]
  )

  // ============================================================
  // ユーザー新規追加
  // ============================================================

  const handleOpenNewUser = useCallback(() => {
    setUserForm({ name: '', email: '', password: '' })
    setUserFormError(null)
    userModal.handleOpen()
  }, [userModal])

  const handleSaveUser = useCallback(async () => {
    if (!userForm.name.trim()) {
      setUserFormError('名前は必須です')
      return
    }
    toggleLoad(async () => {
      const created = await createRegrowUser({
        name: userForm.name.trim(),
        email: userForm.email.trim() || undefined,
        password: userForm.password.trim() || undefined,
      })
      setUsers((prev) => [...prev, { ...created, RgStoreRg: null }])
      userModal.handleClose()
    }, { refresh: false })
  }, [userForm, toggleLoad, userModal])

  // ============================================================
  // ユーザー担当店舗割当
  // ============================================================

  const handleUpdateUserStore = useCallback(
    async (userId: string, rgStoreId: number | null) => {
      await updateUserRgStore(userId, rgStoreId)
      await fetchUsers()
    },
    [fetchUsers]
  )

  const handleDeleteUser = useCallback(
    async (userId: string, userName: string) => {
      if (!window.confirm(`「${userName}」を完全に削除しますか？\nこの操作は取り消せません。過去データのスタッフ紐付けは解除されます。`)) return

      toggleLoad(async () => {
        await deleteRegrowUser(userId)
        await fetchUsers()
      }, { refresh: false })
    },
    [toggleLoad, fetchUsers]
  )

  const handleBanUser = useCallback(
    async (userId: string, userName: string) => {
      const reason = window.prompt(`「${userName}」を非アクティブにさせます。`)
      if (reason === null) return
      toggleLoad(async () => {
        await banRegrowUser(userId, reason || undefined)
        await fetchUsers()
      }, { refresh: false })
    },
    [toggleLoad, fetchUsers]
  )

  const handleUnbanUser = useCallback(
    async (userId: string, userName: string) => {
      if (!window.confirm(`「${userName}」のBANを解除しますか？`)) return
      toggleLoad(async () => {
        await unbanRegrowUser(userId)
        await fetchUsers()
      }, { refresh: false })
    },
    [toggleLoad, fetchUsers]
  )

  // ============================================================
  // ユーザー編集
  // ============================================================

  const handleOpenEditUser = useCallback(
    (user: User & { RgStoreRg: RgStore | null }) => {
      setUserEditingId(user.id)
      setUserEditForm({ name: user.name, email: user.email ?? '', password: '' })
      setUserEditFormError(null)
      userEditModal.handleOpen()
    },
    [userEditModal]
  )

  const handleSaveEditUser = useCallback(async () => {
    if (!userEditingId) return
    if (!userEditForm.name.trim()) {
      setUserEditFormError('名前は必須です')
      return
    }

    if (!userEditForm.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      setUserEditFormError('メールアドレスが不正です')
      return
    }


    toggleLoad(async () => {
      await updateRegrowUser(userEditingId, {
        name: userEditForm.name.trim(),
        email: userEditForm.email.trim() || undefined,
        ...(userEditForm.password.trim() ? { password: userEditForm.password.trim() } : {}),
      })
      await fetchUsers()
      userEditModal.handleClose()
    }, { refresh: false })
  }, [userEditingId, userEditForm, toggleLoad, fetchUsers, userEditModal])

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Regrow マスタ管理</h2>
        {session.role === 'admin' && <div className="flex gap-2">
          <Button
            color="red"
            size="sm"
            onClick={() => {
              if (!window.confirm('全データを削除します。この操作は取り消せません。よろしいですか？')) return
              toggleLoad(async () => {
                const result = await resetRegrowData()
                window.alert(result.message)
                window.location.reload()
              })
            }}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            データリセット
          </Button>
          <Button
            color="blue"
            size="sm"
            onClick={() => {
              if (!window.confirm('既存データをリセットしてシードデータを再投入しますか？')) return
              toggleLoad(async () => {
                const result = await seedRegrowData()
                window.alert(result.message)
                window.location.reload()
              })
            }}
          >
            <Database className="w-4 h-4 mr-1" />
            シードデータ投入
          </Button>
          <Button
            color="green"
            size="sm"
            onClick={() => {
              if (!window.confirm('既存データをリセットし、Excelファイルからシードデータを投入しますか？')) return
              toggleLoad(async () => {
                const result = await seedFromExcelFiles()
                window.alert(result.message)
                window.location.reload()
              })
            }}
          >
            <Database className="w-4 h-4 mr-1" />
            Excelからシード投入
          </Button>
        </div>}
      </div>

      {/* タブ */}
      <div className="flex gap-2 border-b">
        <button
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === 'store' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          onClick={() => setActiveTab('store')}
        >
          <Building2 className="w-4 h-4" />
          店舗マスタ
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === 'user' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          onClick={() => setActiveTab('user')}
        >
          <Users className="w-4 h-4" />
          ユーザー・権限管理
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === 'role' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          onClick={() => {
            setActiveTab('role')
            setRoleTabKey((prev) => prev + 1)
          }}
        >
          <Shield className="w-4 h-4" />
          権限割当
        </button>
      </div>

      {/* 店舗マスタ */}
      {activeTab === 'store' && (
        <>
          <div className="flex justify-end">
            <Button onClick={handleOpenNewStore}>
              新規追加
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* <TableHead>ID</TableHead> */}
                    <TableHead>名前</TableHead>
                    <TableHead>状態</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-400">
                        店舗が登録されていません
                      </TableCell>
                    </TableRow>
                  ) : (
                    stores.map((store) => (
                      <TableRow key={store.id} className={!store.isActive ? 'opacity-50' : ''}>
                        {/* <TableCell>{store.id}</TableCell> */}
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            {store.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${store.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                              }`}
                          >
                            {store.isActive ? '有効' : '無効'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded" onClick={() => handleOpenEditStore(store)}>
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded" onClick={() => handleDeleteStore(store.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 店舗編集モーダル */}
          <storeModal.Modal title={storeEditingId ? '店舗を編集' : '店舗を追加'}>
            <div className="space-y-4">
              {storeFormError && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{storeFormError}</div>}
              <div className="space-y-2">
                <Label htmlFor="storeName">名前 *</Label>
                <Input
                  id="storeName"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  placeholder="港北店"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="storeIsActive"
                  checked={storeForm.isActive}
                  onCheckedChange={(checked) => setStoreForm({ ...storeForm, isActive: checked })}
                />
                <Label htmlFor="storeIsActive">有効</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button color="gray" onClick={() => storeModal.handleClose()}>
                キャンセル
              </Button>
              <Button onClick={handleSaveStore}>{storeEditingId ? '更新' : '追加'}</Button>
            </div>
          </storeModal.Modal>
        </>
      )}

      {/* ユーザー・権限管理 */}
      {activeTab === 'user' && (
        <div className="space-y-8">
          {/* 担当店舗割当 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">ユーザー一覧・担当店舗割当</h3>
              <Button size="sm" onClick={handleOpenNewUser}>
                <Users className="w-4 h-4 mr-1" />
                新規追加
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名前</TableHead>
                      <TableHead>メールアドレス</TableHead>
                      <TableHead>担当店舗</TableHead>
                      <TableHead>状態</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                          ユーザーが見つかりません（appsに「regrow」が含まれるユーザーが対象）
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} className={user.banned ? 'opacity-50' : ''}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell className="text-sm text-slate-500">{user.email ?? '-'}</TableCell>
                          <TableCell>
                            <select
                              className="border rounded px-2 py-1 text-sm"
                              value={user.rgStoreId ?? ''}
                              onChange={(e) => handleUpdateUserStore(user.id, e.target.value ? Number(e.target.value) : null)}
                            >
                              <option value="">未設定</option>
                              {stores.filter((s) => s.isActive).map((store) => (
                                <option key={store.id} value={store.id}>
                                  {store.name}
                                </option>
                              ))}
                            </select>
                          </TableCell>
                          <TableCell>
                            {user.banned ? (
                              <div>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">非アクティブ</span>
                                {user.banReason && <p className="text-[10px] text-red-400 mt-0.5">{user.banReason}</p>}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-300">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                className="p-1 hover:bg-gray-100 rounded"
                                onClick={() => handleOpenEditUser(user)}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              {user.banned ? (
                                <button
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="BAN解除"
                                  onClick={() => handleUnbanUser(user.id, user.name)}
                                >
                                  <Shield className="w-4 h-4 text-green-500" />
                                </button>
                              ) : (
                                <button
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="BAN"
                                  onClick={() => handleBanUser(user.id, user.name)}
                                >
                                  <Shield className="w-4 h-4 text-orange-500" />
                                </button>
                              )}
                              <button
                                className="p-1 hover:bg-gray-100 rounded"
                                onClick={() => handleDeleteUser(user.id, user.name)}
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
              </CardContent>
            </Card>
          </div>

          {/* 新規ユーザー追加モーダル */}
          <userModal.Modal title="ユーザーを追加">
            <div className="space-y-4">
              {userFormError && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{userFormError}</div>}
              <div className="space-y-2">
                <Label htmlFor="userName">名前 *</Label>
                <Input
                  id="userName"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="山田 太郎"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userEmail">メールアドレス</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="taro@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userPassword">パスワード</Label>
                <Input
                  id="userPassword"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="未入力の場合はデフォルト値"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button color="gray" onClick={() => userModal.handleClose()}>キャンセル</Button>
              <Button onClick={handleSaveUser}>追加</Button>
            </div>
          </userModal.Modal>

          {/* ユーザー編集モーダル */}
          <userEditModal.Modal title="ユーザーを編集">
            <div className="space-y-4">
              {userEditFormError && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{userEditFormError}</div>}
              <div className="space-y-2">
                <Label htmlFor="editUserName">名前 *</Label>
                <Input
                  id="editUserName"
                  value={userEditForm.name}
                  onChange={(e) => setUserEditForm({ ...userEditForm, name: e.target.value })}
                  placeholder="山田 太郎"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editUserEmail">メールアドレス</Label>
                <Input
                  id="editUserEmail"
                  type="email"
                  value={userEditForm.email}
                  onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                  placeholder="taro@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editUserPassword">パスワード（変更する場合のみ入力）</Label>
                <Input
                  id="editUserPassword"
                  type="password"
                  value={userEditForm.password}
                  onChange={(e) => setUserEditForm({ ...userEditForm, password: e.target.value })}
                  placeholder="空欄の場合は変更しません"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button color="gray" onClick={() => userEditModal.handleClose()}>キャンセル</Button>
              <Button onClick={handleSaveEditUser}>更新</Button>
            </div>
          </userEditModal.Modal>

        </div>
      )}

      {activeTab === 'role' && (
        <div className={`w-fit `}>
          <h3 className="text-lg font-semibold text-slate-700 mb-4">権限割当</h3>
          <Card>
            <CardContent className="pt-4 ">
              <RoleAllocationTable key={roleTabKey} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default RegrowMasterClient
