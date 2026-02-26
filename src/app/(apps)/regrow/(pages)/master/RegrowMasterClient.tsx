'use client'

import {useState, useCallback} from 'react'
import {Plus, Pencil, Trash2, Building2, Users, Database} from 'lucide-react'

import {Card, CardContent} from '@shadcn/ui/card'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@shadcn/ui/table'
import {Input} from '@shadcn/ui/input'
import {Label} from '@shadcn/ui/label'
import {Switch} from '@shadcn/ui/switch'
import {Button} from '@cm/components/styles/common-components/Button'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useModal from '@cm/components/utils/modal/useModal'

import {createStore, updateStore, deleteStore} from '../../_actions/store-actions'
import {createStaff, updateStaff, deleteStaff} from '../../_actions/staff-actions'
import {seedRegrowData} from '../../_actions/seed-regrow-actions'

import type {RgStore, RgStaff} from '@prisma/generated/prisma/client'

type Props = {
  stores: RgStore[]
  staffs: (RgStaff & {RgStore: RgStore})[]
}

type StoreFormData = {
  name: string
  fullName: string
  isActive: boolean
}

type StaffFormData = {
  staffName: string
  storeId: number | null
  role: string
  isActive: boolean
}

const defaultStoreForm: StoreFormData = {
  name: '',
  fullName: '',
  isActive: true,
}

const defaultStaffForm: StaffFormData = {
  staffName: '',
  storeId: null,
  role: 'viewer',
  isActive: true,
}

const ROLE_OPTIONS = [
  {value: 'admin', label: '管理者'},
  {value: 'manager', label: 'マネージャー'},
  {value: 'viewer', label: '閲覧者'},
]

const RegrowMasterClient = ({stores: initialStores, staffs: initialStaffs}: Props) => {
  const {toggleLoad} = useGlobal()
  const [activeTab, setActiveTab] = useState<'store' | 'staff'>('store')

  // 店舗state
  const [stores, setStores] = useState(initialStores)
  const [storeEditingId, setStoreEditingId] = useState<number | null>(null)
  const [storeForm, setStoreForm] = useState<StoreFormData>(defaultStoreForm)
  const [storeFormError, setStoreFormError] = useState<string | null>(null)

  // スタッフstate
  const [staffs, setStaffs] = useState(initialStaffs)
  const [staffEditingId, setStaffEditingId] = useState<number | null>(null)
  const [staffForm, setStaffForm] = useState<StaffFormData>(defaultStaffForm)
  const [staffFormError, setStaffFormError] = useState<string | null>(null)
  const [staffFilterStoreId, setStaffFilterStoreId] = useState<number | null>(null)

  // モーダル
  const storeModal = useModal()
  const staffModal = useModal()

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
        fullName: store.fullName ?? '',
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
          fullName: storeForm.fullName || null,
          isActive: storeForm.isActive,
        })
        setStores((prev) => prev.map((s) => (s.id === storeEditingId ? updated : s)))
      } else {
        const created = await createStore({
          name: storeForm.name,
          fullName: storeForm.fullName || undefined,
        })
        setStores((prev) => [...prev, created])
      }
      storeModal.handleClose()
    })
  }, [storeEditingId, storeForm, toggleLoad, storeModal])

  const handleDeleteStore = useCallback(
    async (id: number) => {
      if (!window.confirm('この店舗を削除しますか？')) return

      toggleLoad(async () => {
        await deleteStore(id)
        setStores((prev) => prev.filter((s) => s.id !== id))
      })
    },
    [toggleLoad]
  )

  // ============================================================
  // スタッフマスタ
  // ============================================================

  const handleOpenNewStaff = useCallback(() => {
    setStaffEditingId(null)
    setStaffForm(defaultStaffForm)
    setStaffFormError(null)
    staffModal.handleOpen()
  }, [staffModal])

  const handleOpenEditStaff = useCallback(
    (staff: RgStaff & {RgStore: RgStore}) => {
      setStaffEditingId(staff.id)
      setStaffForm({
        staffName: staff.staffName,
        storeId: staff.storeId,
        role: staff.role ?? 'viewer',
        isActive: staff.isActive,
      })
      setStaffFormError(null)
      staffModal.handleOpen()
    },
    [staffModal]
  )

  const handleSaveStaff = useCallback(async () => {
    if (!staffForm.staffName) {
      setStaffFormError('名前は必須です')
      return
    }
    if (!staffForm.storeId) {
      setStaffFormError('店舗を選択してください')
      return
    }

    toggleLoad(async () => {
      if (staffEditingId) {
        const updated = await updateStaff(staffEditingId, {
          staffName: staffForm.staffName,
          storeId: staffForm.storeId!,
          role: staffForm.role,
          isActive: staffForm.isActive,
        })
        // includeされた店舗情報を付与
        const store = stores.find((s) => s.id === staffForm.storeId)!
        const staffWithStore = {...updated, RgStore: store} as RgStaff & {RgStore: RgStore}
        setStaffs((prev) => prev.map((s) => (s.id === staffEditingId ? staffWithStore : s)))
      } else {
        const created = await createStaff({
          staffName: staffForm.staffName,
          storeId: staffForm.storeId!,
          role: staffForm.role,
        })
        const store = stores.find((s) => s.id === staffForm.storeId)!
        const staffWithStore = {...created, RgStore: store} as RgStaff & {RgStore: RgStore}
        setStaffs((prev) => [...prev, staffWithStore])
      }
      staffModal.handleClose()
    })
  }, [staffEditingId, staffForm, stores, toggleLoad, staffModal])

  const handleDeleteStaff = useCallback(
    async (id: number) => {
      if (!window.confirm('このスタッフを削除しますか？')) return

      toggleLoad(async () => {
        await deleteStaff(id)
        setStaffs((prev) => prev.filter((s) => s.id !== id))
      })
    },
    [toggleLoad]
  )

  // フィルタ済みスタッフ
  const filteredStaffs = staffFilterStoreId ? staffs.filter((s) => s.storeId === staffFilterStoreId) : staffs

  const getRoleLabel = (role: string | null) => {
    return ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role ?? '-'
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Regrow マスタ管理</h2>
        <Button
          color="red"
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
      </div>

      {/* タブ */}
      <div className="flex gap-2 border-b">
        <button
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'store' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('store')}
        >
          <Building2 className="w-4 h-4" />
          店舗マスタ
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'staff' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('staff')}
        >
          <Users className="w-4 h-4" />
          スタッフマスタ
        </button>
      </div>

      {/* 店舗マスタ */}
      {activeTab === 'store' && (
        <>
          <div className="flex justify-end">
            <Button onClick={handleOpenNewStore}>
              <Plus className="w-4 h-4 mr-2" />
              新規追加
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>名前</TableHead>
                    <TableHead>フルネーム</TableHead>
                    <TableHead>状態</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                        店舗が登録されていません
                      </TableCell>
                    </TableRow>
                  ) : (
                    stores.map((store) => (
                      <TableRow key={store.id} className={!store.isActive ? 'opacity-50' : ''}>
                        <TableCell>{store.id}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            {store.name}
                          </div>
                        </TableCell>
                        <TableCell>{store.fullName ?? '-'}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              store.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
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
                  onChange={(e) => setStoreForm({...storeForm, name: e.target.value})}
                  placeholder="港北店"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeFullName">フルネーム</Label>
                <Input
                  id="storeFullName"
                  value={storeForm.fullName}
                  onChange={(e) => setStoreForm({...storeForm, fullName: e.target.value})}
                  placeholder="Regrow 港北店"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="storeIsActive"
                  checked={storeForm.isActive}
                  onCheckedChange={(checked) => setStoreForm({...storeForm, isActive: checked})}
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

      {/* スタッフマスタ */}
      {activeTab === 'staff' && (
        <>
          <div className="flex items-center justify-between">
            <select
              className="border rounded px-3 py-2 text-sm"
              value={staffFilterStoreId ?? ''}
              onChange={(e) => setStaffFilterStoreId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">全店舗</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
            <Button onClick={handleOpenNewStaff}>
              <Plus className="w-4 h-4 mr-2" />
              新規追加
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>名前</TableHead>
                    <TableHead>店舗</TableHead>
                    <TableHead>権限</TableHead>
                    <TableHead>状態</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaffs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                        スタッフが登録されていません
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaffs.map((staff) => (
                      <TableRow key={staff.id} className={!staff.isActive ? 'opacity-50' : ''}>
                        <TableCell>{staff.id}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            {staff.staffName}
                          </div>
                        </TableCell>
                        <TableCell>{staff.RgStore?.name ?? '-'}</TableCell>
                        <TableCell>{getRoleLabel(staff.role)}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              staff.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {staff.isActive ? '有効' : '無効'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded" onClick={() => handleOpenEditStaff(staff)}>
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded" onClick={() => handleDeleteStaff(staff.id)}>
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

          {/* スタッフ編集モーダル */}
          <staffModal.Modal title={staffEditingId ? 'スタッフを編集' : 'スタッフを追加'}>
            <div className="space-y-4">
              {staffFormError && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{staffFormError}</div>}
              <div className="space-y-2">
                <Label htmlFor="staffName">名前 *</Label>
                <Input
                  id="staffName"
                  value={staffForm.staffName}
                  onChange={(e) => setStaffForm({...staffForm, staffName: e.target.value})}
                  placeholder="山田 太郎"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffStoreId">店舗 *</Label>
                <select
                  id="staffStoreId"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={staffForm.storeId ?? ''}
                  onChange={(e) => setStaffForm({...staffForm, storeId: e.target.value ? Number(e.target.value) : null})}
                >
                  <option value="">選択してください</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffRole">権限</Label>
                <select
                  id="staffRole"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({...staffForm, role: e.target.value})}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="staffIsActive"
                  checked={staffForm.isActive}
                  onCheckedChange={(checked) => setStaffForm({...staffForm, isActive: checked})}
                />
                <Label htmlFor="staffIsActive">有効</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button color="gray" onClick={() => staffModal.handleClose()}>
                キャンセル
              </Button>
              <Button onClick={handleSaveStaff}>{staffEditingId ? '更新' : '追加'}</Button>
            </div>
          </staffModal.Modal>
        </>
      )}
    </div>
  )
}

export default RegrowMasterClient
