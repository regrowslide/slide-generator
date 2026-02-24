'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@cm/components/styles/common-components/Button'
import { Input } from '@shadcn/ui/input'
import { Card, CardContent } from '@shadcn/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shadcn/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shadcn/ui/select'
import useModal from '@cm/components/utils/modal/useModal'
import {
  createDentalFacility,
  updateDentalFacility,
  deleteDentalFacility,
  reorderDentalFacilities,
} from '@app/(apps)/dental/_actions/facility-actions'
import { FACILITY_TYPES } from '@app/(apps)/dental/lib/constants'
import type { Facility } from '@app/(apps)/dental/lib/types'

type FacilityMasterClientProps = {
  facilities: Facility[]
  clinicId: number
}

type FacilityFormData = {
  name: string
  address: string
  facilityType: string
}

const FacilityMasterClient = ({ facilities, clinicId }: FacilityMasterClientProps) => {
  const router = useRouter()
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [formData, setFormData] = useState<FacilityFormData>({ name: '', address: '', facilityType: '' })
  const facilityModal = useModal()

  const handleOpenAdd = () => {
    setEditingFacility(null)
    setFormData({ name: '', address: '', facilityType: '' })
    facilityModal.handleOpen()
  }

  const handleOpenEdit = (facility: Facility) => {
    setEditingFacility(facility)
    setFormData({ name: facility.name, address: facility.address, facilityType: facility.facilityType })
    facilityModal.handleOpen()
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.address) return
    if (editingFacility) {
      await updateDentalFacility(editingFacility.id, formData)
    } else {
      await createDentalFacility({ dentalClinicId: clinicId, ...formData })
    }
    facilityModal.handleClose()
    router.refresh()
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`「${name}」を削除しますか？`)) return
    await deleteDentalFacility(id)
    router.refresh()
  }

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    const idx = facilities.findIndex(f => f.id === id)
    if (idx < 0) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= facilities.length) return
    const items = [
      { id: facilities[idx].id, sortOrder: facilities[swapIdx].sortOrder ?? swapIdx },
      { id: facilities[swapIdx].id, sortOrder: facilities[idx].sortOrder ?? idx },
    ]
    await reorderDentalFacilities(items)
    router.refresh()
  }

  return (
    <div className={`p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">登録施設一覧</h2>
        <Button onClick={handleOpenAdd} color="primary">+ 施設追加</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">順序</TableHead>
                <TableHead>施設名</TableHead>
                <TableHead>住所</TableHead>
                <TableHead>施設区分</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    施設が登録されていません
                  </TableCell>
                </TableRow>
              ) : (
                facilities.map((facility, idx) => (
                  <TableRow key={facility.id}>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-0.5">
                        <button
                          onClick={() => handleReorder(facility.id, 'up')}
                          disabled={idx === 0}
                          className="p-0.5 text-gray-400 hover:text-slate-600 disabled:opacity-30 text-xs"
                        >
                          &#x25B2;
                        </button>
                        <button
                          onClick={() => handleReorder(facility.id, 'down')}
                          disabled={idx === facilities.length - 1}
                          className="p-0.5 text-gray-400 hover:text-slate-600 disabled:opacity-30 text-xs"
                        >
                          &#x25BC;
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{facility.name}</TableCell>
                    <TableCell className="text-gray-600">{facility.address}</TableCell>
                    <TableCell className="text-gray-600">
                      {FACILITY_TYPES[facility.facilityType as keyof typeof FACILITY_TYPES] || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button color="sub" size="sm" onClick={() => handleOpenEdit(facility)}>
                          編集
                        </Button>
                        <Button
                          color="red"
                          size="sm"
                          onClick={() => handleDelete(facility.id, facility.name)}
                        >
                          削除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <facilityModal.Modal title={editingFacility ? '施設を編集' : '施設を追加'}>
        <div className="space-y-3 p-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              施設名 <span className="text-red-500">*</span>
            </label>
            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              住所 <span className="text-red-500">*</span>
            </label>
            <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">施設区分</label>
            <Select value={formData.facilityType} onValueChange={v => setFormData({ ...formData, facilityType: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FACILITY_TYPES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={facilityModal.handleClose}>
              キャンセル
            </Button>
            <Button onClick={handleSubmit} color="primary">{editingFacility ? '更新' : '追加'}</Button>
          </div>
        </div>
      </facilityModal.Modal>
    </div>
  )
}

export default FacilityMasterClient
