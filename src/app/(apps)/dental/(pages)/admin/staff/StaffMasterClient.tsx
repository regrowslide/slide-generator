'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@cm/components/styles/common-components/Button'
import { Card, CardContent } from '@shadcn/ui/card'
import useModal from '@cm/components/utils/modal/useModal'
import { createDentalStaff, updateDentalStaffType, removeDentalStaff, reorderDentalStaff, updateDentalStaffCredentials } from '@app/(apps)/dental/_actions/staff-actions'
import { STAFF_ROLES } from '@app/(apps)/dental/lib/constants'
import type { Staff } from '@app/(apps)/dental/lib/types'

type StaffMasterClientProps = {
  staff: Staff[]
  clinicId: number
}

const ROLE_OPTIONS = [
  { id: STAFF_ROLES.DOCTOR, name: '歯科医師' },
  { id: STAFF_ROLES.HYGIENIST, name: '歯科衛生士' },
]

const StaffMasterClient = ({ staff, clinicId }: StaffMasterClientProps) => {
  const router = useRouter()
  const staffModal = useModal()

  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [formData, setFormData] = useState({ name: '', role: '', email: '', password: '' })

  const doctors = staff
    .filter(s => s.role === STAFF_ROLES.DOCTOR)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  const hygienists = staff
    .filter(s => s.role === STAFF_ROLES.HYGIENIST)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

  const handleOpenAdd = () => {
    setEditingStaff(null)
    setFormData({ name: '', role: '', email: '', password: '' })
    staffModal.handleOpen()
  }

  const handleOpenEdit = (s: Staff & {email?: string | null}) => {
    setEditingStaff(s)
    setFormData({ name: s.name, role: s.role, email: s.email || '', password: '' })
    staffModal.handleOpen()
  }

  const handleSubmit = async () => {
    if (!formData.role) return
    if (editingStaff) {
      // 役割更新
      if (formData.role !== editingStaff.role) {
        await updateDentalStaffType(editingStaff.id, formData.role)
      }
      // 認証情報更新
      const credData: {email?: string; password?: string} = {}
      if (formData.email !== (editingStaff.email || '')) credData.email = formData.email
      if (formData.password) credData.password = formData.password
      if (Object.keys(credData).length > 0) {
        await updateDentalStaffCredentials(editingStaff.id, credData)
      }
    } else {
      if (!formData.name?.trim()) return
      await createDentalStaff({ name: formData.name.trim(), dentalClinicId: clinicId, type: formData.role })
    }
    staffModal.handleClose()
    router.refresh()
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`「${name}」をスタッフから外しますか？`)) return
    await removeDentalStaff(id)
    router.refresh()
  }

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    const members = staff.filter(s => s.role === staff.find(x => x.id === id)?.role)
    const idx = members.findIndex(s => s.id === id)
    if (idx < 0) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= members.length) return
    const items = [
      { id: members[idx].id, sortOrder: members[swapIdx].sortOrder ?? swapIdx },
      { id: members[swapIdx].id, sortOrder: members[idx].sortOrder ?? idx },
    ]
    await reorderDentalStaff(items)
    router.refresh()
  }

  const renderStaffList = (members: Staff[], roleLabel: string) => (
    <Card>
      <div className='p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg'>
        <span className='text-sm font-medium text-gray-700'>
          {roleLabel} ({members.length}名)
        </span>
      </div>
      <CardContent className='p-0'>
        <ul className='divide-y divide-gray-200'>
          {members.map((s, idx) => (
            <li key={s.id} className='flex items-center justify-between px-4 py-3'>
              <div
                className='cursor-pointer hover:text-blue-600 transition-colors'
                onClick={() => handleOpenEdit(s)}
              >
                <span className='text-sm font-medium text-gray-900'>{s.name}</span>
                {s.email && <span className='text-xs text-gray-400 ml-2'>{s.email}</span>}
              </div>
              <div className='flex gap-1 items-center'>
                <button
                  onClick={() => handleReorder(s.id, 'up')}
                  disabled={idx === 0}
                  className='p-1 text-gray-400 hover:text-slate-600 disabled:opacity-30 rounded'
                >
                  &#x25B2;
                </button>
                <button
                  onClick={() => handleReorder(s.id, 'down')}
                  disabled={idx === members.length - 1}
                  className='p-1 text-gray-400 hover:text-slate-600 disabled:opacity-30 rounded'
                >
                  &#x25BC;
                </button>
                <Button color='sub' size='sm' onClick={() => handleOpenEdit(s)}>
                  編集
                </Button>
                <Button color='red' size='sm' onClick={() => handleDelete(s.id, s.name)}>
                  解除
                </Button>
              </div>
            </li>
          ))}
          {members.length === 0 && <li className='px-4 py-3 text-sm text-gray-500'>登録なし</li>}
        </ul>
      </CardContent>
    </Card>
  )

  return (
    <div className='p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-bold text-gray-900'>スタッフマスタ</h2>
        <Button onClick={handleOpenAdd} color='primary'>+ スタッフ追加</Button>
      </div>

      <div className='grid md:grid-cols-2 gap-4'>
        {renderStaffList(doctors, '歯科医師')}
        {renderStaffList(hygienists, '歯科衛生士')}
      </div>

      <staffModal.Modal title={editingStaff ? 'スタッフを編集' : 'スタッフを追加'}>
        <div className='p-4 space-y-4'>
          {/* 名前（新規追加時のみ編集可能） */}
          <div>
            <label className='block text-xs text-gray-600 mb-1'>名前</label>
            {editingStaff ? (
              <div className='text-sm font-medium text-gray-900 py-2'>{editingStaff.name}</div>
            ) : (
              <input
                type='text'
                value={formData.name}
                onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                className='w-full border border-gray-300 rounded px-3 py-2 text-sm'
                placeholder='名前を入力'
              />
            )}
          </div>

          {/* 役割 */}
          <div>
            <label className='block text-xs text-gray-600 mb-1'>役割</label>
            <select
              value={formData.role}
              onChange={e => setFormData(prev => ({...prev, role: e.target.value}))}
              className='w-full border border-gray-300 rounded px-3 py-2 text-sm'
            >
              <option value=''>選択してください</option>
              {ROLE_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          </div>

          {/* 認証情報（編集時のみ表示） */}
          {editingStaff && (
            <>
              <hr className='border-gray-200' />
              <div className='text-xs font-medium text-gray-500'>認証情報</div>
              <div>
                <label className='block text-xs text-gray-600 mb-1'>メールアドレス</label>
                <input
                  type='email'
                  value={formData.email}
                  onChange={e => setFormData(prev => ({...prev, email: e.target.value}))}
                  className='w-full border border-gray-300 rounded px-3 py-2 text-sm'
                  placeholder='example@example.com'
                />
              </div>
              <div>
                <label className='block text-xs text-gray-600 mb-1'>パスワード（変更する場合のみ入力）</label>
                <input
                  type='text'
                  value={formData.password}
                  onChange={e => setFormData(prev => ({...prev, password: e.target.value}))}
                  className='w-full border border-gray-300 rounded px-3 py-2 text-sm'
                  placeholder='新しいパスワード'
                />
              </div>
            </>
          )}

          <div className='flex justify-end gap-2 pt-2'>
            <Button onClick={staffModal.handleClose}>キャンセル</Button>
            <Button color='primary' onClick={handleSubmit}>{editingStaff ? '更新' : '追加'}</Button>
          </div>
        </div>
      </staffModal.Modal>
    </div>
  )
}

export default StaffMasterClient
