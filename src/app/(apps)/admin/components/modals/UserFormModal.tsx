'use client'

import {useState} from 'react'
import {Input} from '@shadcn/ui/input'
import {Label} from '@shadcn/ui/label'
import {Button} from '@cm/components/styles/common-components/Button'
import type {useModalReturn} from '@cm/components/utils/modal/useModal'
import type {AdminUserRow} from '../../lib/types'

type Props = {
  modal: useModalReturn
  editingUser: AdminUserRow | null
  onSave: (data: {name: string; email: string; password: string; role: string}) => Promise<void>
}

const UserFormModal = ({modal, editingUser, onSave}: Props) => {
  const [form, setForm] = useState({
    name: editingUser?.name ?? '',
    email: editingUser?.email ?? '',
    password: '',
    role: editingUser?.role ?? 'user',
  })
  const [error, setError] = useState<string | null>(null)

  // editingUser変更時にフォームをリセット
  const resetForm = (user: AdminUserRow | null) => {
    setForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
      role: user?.role ?? 'user',
    })
    setError(null)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('名前は必須です')
      return
    }
    if (!form.email.trim()) {
      setError('メールアドレスは必須です')
      return
    }
    if (!editingUser && !form.password.trim()) {
      setError('パスワードは必須です')
      return
    }
    try {
      await onSave(form)
      modal.handleClose()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <modal.Modal
      title={editingUser ? 'ユーザーを編集' : 'ユーザーを作成'}
      onOpen={() => resetForm(editingUser)}
    >
      <div className="space-y-4">
        {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}
        <div className="space-y-2">
          <Label htmlFor="adminUserName">名前 *</Label>
          <Input
            id="adminUserName"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            placeholder="山田 太郎"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="adminUserEmail">メールアドレス *</Label>
          <Input
            id="adminUserEmail"
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            placeholder="taro@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="adminUserPassword">
            パスワード {editingUser ? '（変更する場合のみ入力）' : '*'}
          </Label>
          <Input
            id="adminUserPassword"
            type="password"
            value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
            placeholder={editingUser ? '空欄の場合は変更しません' : 'パスワードを入力'}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="adminUserRole">ロール</Label>
          <select
            id="adminUserRole"
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.role}
            onChange={(e) => setForm({...form, role: e.target.value})}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button color="gray" onClick={() => modal.handleClose()}>
          キャンセル
        </Button>
        <Button onClick={handleSave}>{editingUser ? '更新' : '作成'}</Button>
      </div>
    </modal.Modal>
  )
}

export default UserFormModal
