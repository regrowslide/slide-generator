'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {HREF} from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import { Input } from '@shadcn/ui/input'
import { Card, CardContent } from '@shadcn/ui/card'
import { Badge } from '@shadcn/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shadcn/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shadcn/ui/select'
import useModal from '@cm/components/utils/modal/useModal'
import { createDentalPatient, updateDentalPatient, deleteDentalPatient } from '@app/(apps)/dental/_actions/patient-actions'
import { getPatientName, getPatientNameKana } from '@app/(apps)/dental/lib/helpers'
import type { Facility, Patient } from '@app/(apps)/dental/lib/types'
import { Button } from '@cm/components/styles/common-components/Button'

type PatientMasterClientProps = {
  facilities: Facility[]
  patients: Patient[]
}

type PatientFormData = {
  lastName: string
  firstName: string
  lastNameKana: string
  firstNameKana: string
  building: string
  floor: string
  room: string
  notes: string
}

const PatientMasterClient = ({ facilities, patients }: PatientMasterClientProps) => {
  const router = useRouter()
  const {query} = useGlobal()
  const [searchQuery, setSearchQuery] = useState('')
  const [facilityFilter, setFacilityFilter] = useState('all')
  const patientModal = useModal()
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [formData, setFormData] = useState<PatientFormData>({
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    building: '',
    floor: '',
    room: '',
    notes: '',
  })

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const fullName = getPatientName(p)
      const fullNameKana = getPatientNameKana(p)
      const matchesSearch =
        !searchQuery ||
        fullName.includes(searchQuery) ||
        fullNameKana.includes(searchQuery) ||
        p.lastName.includes(searchQuery) ||
        p.firstName.includes(searchQuery)
      const matchesFacility = facilityFilter === 'all' || p.facilityId === Number(facilityFilter)
      return matchesSearch && matchesFacility
    })
  }, [patients, searchQuery, facilityFilter])

  const handleOpenAdd = () => {
    setEditingPatient(null)
    setFormData({ lastName: '', firstName: '', lastNameKana: '', firstNameKana: '', building: '', floor: '', room: '', notes: '' })
    patientModal.handleOpen()
  }

  const handleSubmit = async () => {
    if (!formData.lastName || !formData.firstName || !formData.lastNameKana || !formData.firstNameKana) return
    if (editingPatient) {
      await updateDentalPatient(editingPatient.id, formData)
    } else {
      const targetFacilityId = facilityFilter !== 'all' ? Number(facilityFilter) : facilities[0]?.id
      if (!targetFacilityId) return
      await createDentalPatient({ dentalFacilityId: targetFacilityId, ...formData })
    }
    patientModal.handleClose()
    router.refresh()
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`「${name}」を削除しますか？`)) return
    await deleteDentalPatient(id)
    router.refresh()
  }

  return (
    <div className={`p-4 `}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">利用者マスタ</h2>
        <Button onClick={handleOpenAdd}>+ 利用者を追加</Button>
      </div>

      {/* フィルター */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <Input placeholder="氏名・カナで検索" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Select value={facilityFilter} onValueChange={setFacilityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="全施設" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全施設</SelectItem>
            {facilities.map(f => (
              <SelectItem key={f.id} value={String(f.id)}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <span className="text-sm font-medium text-gray-700">利用者マスタ ({filteredPatients.length}名)</span>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>氏名</TableHead>
                <TableHead>ふりがな</TableHead>
                <TableHead>施設</TableHead>
                <TableHead>居場所</TableHead>
                <TableHead>年齢</TableHead>
                <TableHead>申し送り</TableHead>
                <TableHead className="text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    該当する利用者がいません
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((p, idx) => {
                  const facility = facilities.find(f => f.id === p.facilityId)
                  return (
                    <TableRow key={p.id} className="cursor-pointer" onClick={() => router.push(HREF(`/dental/admin/patients/${p.id}`, {}, query))}>
                      <TableCell className="text-gray-500">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{getPatientName(p)}</TableCell>
                      <TableCell className="text-gray-600">{getPatientNameKana(p)}</TableCell>
                      <TableCell className="text-gray-600">{facility?.name || '-'}</TableCell>
                      <TableCell className="text-gray-600">
                        {p.building && <Badge color="blue" size="sm">{p.building}</Badge>}{' '}
                        {p.floor}-{p.room}
                      </TableCell>
                      <TableCell className="text-gray-600">{p.age || '-'}歳</TableCell>
                      <TableCell className="text-gray-600 max-w-[120px] truncate">{p.notes || '-'}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center" onClick={e => e.stopPropagation()}>
                          <Button
                            size="sm"

                            onClick={() => router.push(HREF(`/dental/admin/patients/${p.id}`, {}, query))}
                          >
                            詳細
                          </Button>
                          <Button
                            size="sm"

                            onClick={() => router.push(HREF(`/dental/admin/patients/${p.id}/edit`, {}, query))}
                          >
                            編集
                          </Button>
                          <Button
                            size="sm"
                            color="red"
                            onClick={() => handleDelete(p.id, getPatientName(p))}
                          >
                            削除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <patientModal.Modal title='利用者を追加'>
        <div className="space-y-3 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">姓 *</label>
                <Input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">名 *</label>
                <Input value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">セイ *</label>
                <Input value={formData.lastNameKana} onChange={e => setFormData({ ...formData, lastNameKana: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">メイ *</label>
                <Input value={formData.firstNameKana} onChange={e => setFormData({ ...formData, firstNameKana: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">建物</label>
                <Input
                  value={formData.building}
                  onChange={e => setFormData({ ...formData, building: e.target.value })}
                  placeholder="本館"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">フロア</label>
                <Input value={formData.floor} onChange={e => setFormData({ ...formData, floor: e.target.value })} placeholder="2F" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">部屋番号</label>
                <Input value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} placeholder="201" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">申し送り</label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="特記事項があれば入力"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={patientModal.handleClose}>
                キャンセル
              </Button>
              <Button onClick={handleSubmit}>追加</Button>
            </div>
          </div>
      </patientModal.Modal>
    </div>
  )
}

export default PatientMasterClient
