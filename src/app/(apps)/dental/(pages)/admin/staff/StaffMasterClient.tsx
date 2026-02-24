'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@cm/components/styles/common-components/Button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Fields } from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import useModal from '@cm/components/utils/modal/useModal'
import { createDentalStaff, updateDentalStaffType, removeDentalStaff, reorderDentalStaff } from '@app/(apps)/dental/_actions/staff-actions'
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

const staffColumns = Fields.transposeColumns([
  { id: 'name', label: '名前', type: 'text', form: { register: { required: '名前は必須です' } } },
  {
    id: 'role',
    label: '役割',
    forSelect: {
      optionsOrOptionFetcher: ROLE_OPTIONS,
    },
    form: { register: { required: '役割は必須です' } },
  },
])

const StaffMasterClient = ({ staff, clinicId }: StaffMasterClientProps) => {
  const router = useRouter()
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const staffModal = useModal()

  const { BasicForm, latestFormData, ReactHookForm } = useBasicFormProps({ columns: staffColumns })

  const doctors = staff
    .filter(s => s.role === STAFF_ROLES.DOCTOR)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  const hygienists = staff
    .filter(s => s.role === STAFF_ROLES.HYGIENIST)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

  const handleOpenAdd = () => {
    setEditingStaff(null)
    ReactHookForm.reset({ name: '', role: '' })
    staffModal.handleOpen()
  }

  const handleOpenEdit = (s: Staff) => {
    setEditingStaff(s)
    ReactHookForm.reset({ name: s.name, role: s.role })
    staffModal.handleOpen()
  }

  const handleSubmit = async (data: Record<string, string>) => {
    if (!data.role) return
    if (editingStaff) {
      await updateDentalStaffType(editingStaff.id, data.role)
    } else {
      if (!data.name?.trim()) return
      await createDentalStaff({ name: data.name.trim(), dentalClinicId: clinicId, type: data.role })
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
              <span className='text-sm font-medium text-gray-900'>{s.name}</span>
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
    <div className={`p-4`}>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-bold text-gray-900'>スタッフマスタ</h2>
        <Button onClick={handleOpenAdd} color='primary'>+ スタッフ追加</Button>
      </div>

      <div className='grid md:grid-cols-2 gap-4'>
        {renderStaffList(doctors, '歯科医師')}
        {renderStaffList(hygienists, '歯科衛生士')}
      </div>

      <staffModal.Modal title={editingStaff ? 'スタッフを編集' : 'スタッフを追加'}>
        <div className='p-4'>
          <BasicForm latestFormData={latestFormData} onSubmit={handleSubmit}>
            <div className='flex justify-end gap-2 pt-2'>
              <Button onClick={staffModal.handleClose}>
                キャンセル
              </Button>
              <Button type='submit' color='primary'>{editingStaff ? '更新' : '追加'}</Button>
            </div>
          </BasicForm>
        </div>
      </staffModal.Modal>
    </div>
  )
}

export default StaffMasterClient
