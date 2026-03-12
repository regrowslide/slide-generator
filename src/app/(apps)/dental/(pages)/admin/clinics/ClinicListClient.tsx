'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Input } from '@shadcn/ui/input'
import { Card, CardContent } from '@shadcn/ui/card'
import { Fields } from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import useModal from '@cm/components/utils/modal/useModal'
import { upsertDentalClinic, deleteDentalClinic } from '@app/(apps)/dental/_actions/clinic-actions'
import { createDentalStaff, removeDentalStaff } from '@app/(apps)/dental/_actions/staff-actions'
import { STAFF_ROLES } from '@app/(apps)/dental/lib/constants'
import { Button } from '@cm/components/styles/common-components/Button'

type ClinicStaff = { id: string; name: string; type: string | null; sortOrder: number }
type ClinicWithStaff = {
  id: number
  name: string
  address: string | null
  phone: string | null
  representative: string | null
  User: ClinicStaff[]
}

type Props = {
  clinics: ClinicWithStaff[]
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

const ClinicListClient = ({ clinics }: Props) => {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', representative: '' })

  // スタッフ追加モーダル
  const [staffModalClinicId, setStaffModalClinicId] = useState<number | null>(null)
  const staffModal = useModal()

  // BasicForm（スタッフ追加用）
  const { BasicForm, latestFormData, ReactHookForm } = useBasicFormProps({ columns: staffColumns })

  // ---- クリニックCRUD ----

  const handleAddClinic = async () => {
    if (!formData.name.trim()) return
    await upsertDentalClinic(formData)
    setIsAdding(false)
    setFormData({ name: '', address: '', phone: '', representative: '' })
    router.refresh()
  }

  const handleEditClinic = (c: ClinicWithStaff) => {
    setEditingId(c.id)
    setFormData({ name: c.name, address: c.address || '', phone: c.phone || '', representative: c.representative || '' })
  }

  const handleUpdateClinic = async () => {
    if (!editingId || !formData.name.trim()) return
    await upsertDentalClinic({ id: editingId, ...formData })
    setEditingId(null)
    setFormData({ name: '', address: '', phone: '', representative: '' })
    router.refresh()
  }

  const handleDeleteClinic = async (id: number) => {
    if (!window.confirm('このクリニックを削除しますか？関連データもすべて削除されます。')) return
    await deleteDentalClinic(id)
    router.refresh()
  }

  const handleCancelClinic = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ name: '', address: '', phone: '', representative: '' })
  }

  // ---- スタッフCRUD ----

  const handleOpenStaffModal = (clinicId: number) => {
    ReactHookForm.reset({ name: '', role: '' })
    setStaffModalClinicId(clinicId)
    staffModal.handleOpen()
  }

  const handleAddStaff = async (data: Record<string, string>) => {
    if (!staffModalClinicId || !data.name?.trim() || !data.role) return
    await createDentalStaff({
      name: data.name.trim(),
      dentalClinicId: staffModalClinicId,
      type: data.role,
    })
    staffModal.handleClose()
    ReactHookForm.reset({ name: '', role: '' })
    router.refresh()
  }

  const handleRemoveStaff = async (userId: string, name: string) => {
    if (!window.confirm(`「${name}」をスタッフから外しますか？`)) return
    await removeDentalStaff(userId)
    router.refresh()
  }

  // ---- レンダリング ----

  const renderClinicForm = (onSubmit: () => void, submitLabel: string) => (
    <Card className='mb-4'>
      <CardContent className='p-4 space-y-3'>
        <div>
          <label className='block text-xs text-gray-600 mb-1'>クリニック名 *</label>
          <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div>
          <label className='block text-xs text-gray-600 mb-1'>住所</label>
          <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-xs text-gray-600 mb-1'>電話番号</label>
            <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div>
            <label className='block text-xs text-gray-600 mb-1'>代表者名</label>
            <Input
              value={formData.representative}
              onChange={e => setFormData({ ...formData, representative: e.target.value })}
            />
          </div>
        </div>
        <div className='flex justify-end gap-2'>
          <Button onClick={handleCancelClinic}>
            キャンセル
          </Button>
          <Button onClick={onSubmit}>{submitLabel}</Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderStaffSection = (clinic: ClinicWithStaff) => {
    const doctors = clinic.User.filter(u => u.type === STAFF_ROLES.DOCTOR)
    const hygienists = clinic.User.filter(u => u.type === STAFF_ROLES.HYGIENIST)

    const renderGroup = (members: ClinicStaff[], label: string) => (
      <div>
        <div className='text-xs font-medium text-gray-500 mb-1'>{label}</div>
        {members.length === 0 ? (
          <div className='text-xs text-gray-400'>なし</div>
        ) : (
          <div className='flex flex-wrap gap-1'>
            {members.map(m => (
              <span
                key={m.id}
                className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700'
              >
                {m.name}
                <button
                  onClick={() => handleRemoveStaff(m.id, m.name)}
                  className='text-gray-400 hover:text-red-500 ml-0.5'
                  title='解除'
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    )

    return (
      <div className='mt-3 pt-3 border-t border-gray-100'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-xs font-medium text-gray-600'>スタッフ</span>
          <Button size='sm' className='h-6 text-xs' onClick={() => handleOpenStaffModal(clinic.id)} color='primary'>
            + 追加
          </Button>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          {renderGroup(doctors, '歯科医師')}
          {renderGroup(hygienists, '歯科衛生士')}
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4`}>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-bold text-gray-900'>クリニック一覧</h2>
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)} size='sm' color='primary'>
            新規追加
          </Button>
        )}
      </div>

      {isAdding && renderClinicForm(handleAddClinic, '追加')}

      <div className='space-y-3'>
        {clinics.map(clinic =>
          editingId === clinic.id ? (
            <div key={clinic.id}>{renderClinicForm(handleUpdateClinic, '更新')}</div>
          ) : (
            <Card key={clinic.id}>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium text-gray-900'>{clinic.name}</div>
                    <div className='text-sm text-gray-500 mt-1'>
                      {[clinic.address, clinic.phone, clinic.representative].filter(Boolean).join(' / ')}
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Button size='sm' onClick={() => handleEditClinic(clinic)} color='sub'>
                      編集
                    </Button>
                    <Button size='sm' onClick={() => handleDeleteClinic(clinic.id)}>
                      削除
                    </Button>
                  </div>
                </div>
                {renderStaffSection(clinic)}
              </CardContent>
            </Card>
          )
        )}

        {clinics.length === 0 && !isAdding && (
          <div className='text-center text-gray-500 py-8'>クリニックが登録されていません</div>
        )}
      </div>

      {/* スタッフ新規作成モーダル */}
      <staffModal.Modal title='スタッフを追加'>
        <div className='p-4'>
          <BasicForm latestFormData={latestFormData} onSubmit={handleAddStaff}>
            <div className='flex justify-end gap-2 pt-2'>
              <Button onClick={staffModal.handleClose}>
                キャンセル
              </Button>
              <Button type='submit' color='primary'>追加</Button>
            </div>
          </BasicForm>
        </div>
      </staffModal.Modal>
    </div>
  )
}

export default ClinicListClient
