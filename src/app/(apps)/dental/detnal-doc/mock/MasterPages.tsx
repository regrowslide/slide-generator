'use client'

import {useState, useMemo} from 'react'
import useModal from '@cm/components/utils/modal/useModal'
import {
  FACILITY_TYPES,
  STAFF_ROLES,
  CLINIC_QUALIFICATIONS,
} from './constants'
import {getPatientName, getPatientNameKana} from './helpers'
import {
  Button,
  Badge,
  Card,
  Input,
  Select,
  TextArea,
  EmptyState,
  IconEdit,
  IconTrash,
  IconPlus,
} from './ui-components'
import type {
  Facility,
  Patient,
  Staff,
  ClinicQualificationMaster,
  Clinic,
} from './types'

// =============================================================================
// Props型定義（ローカル）
// =============================================================================

type FacilityFormData = {
  name: string
  address: string
  facilityType: string
}

type FacilityFormProps = {
  facility: Facility | null
  onSubmit: (data: FacilityFormData) => void
  onClose: () => void
}

type PortalSettings = Record<
  number,
  {
    enabled: boolean
    loginId: string
    password: string
    portalUrl: string
  }
>

type FacilityMasterPageProps = {
  facilities: Facility[]
  onAdd: (data: FacilityFormData) => void
  onUpdate: (id: number, data: FacilityFormData) => void
  onDelete: (id: number) => void
  onReorder?: (id: number, direction: 'up' | 'down') => void
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

type PatientFormProps = {
  patient: Patient | null
  onSubmit: (data: PatientFormData) => void
  onClose: () => void
}

type PatientMasterPageProps = {
  facilities: Facility[]
  patients: Patient[]
  onAdd: (data: PatientFormData & {facilityId: number}) => void
  onUpdate: (id: number, data: PatientFormData) => void
  onDelete: (id: number) => void
  onSelectPatient?: (id: number) => void
  onEditPatient?: (id: number) => void
}

type StaffFormData = {
  name: string
  role: string
}

type StaffFormProps = {
  staffMember: Staff | null
  onSubmit: (data: StaffFormData) => void
  onClose: () => void
}

type StaffMasterPageProps = {
  staff: Staff[]
  onAdd: (data: StaffFormData) => void
  onUpdate: (id: number, data: StaffFormData) => void
  onDelete: (id: number) => void
  onReorder: (id: number, direction: 'up' | 'down') => void
}

type ClinicSettingsPageProps = {
  clinic: Clinic
  onUpdateClinic: (data: {name: string; address: string; phone: string; representative: string}) => void
  onUpdateQualification: (qualId: string, value: boolean | string) => void
}

// =============================================================================
// コンポーネント
// =============================================================================

/**
 * 施設フォーム（モーダル用）
 */
export const FacilityForm = ({facility, onSubmit, onClose}: FacilityFormProps) => {
  const [formData, setFormData] = useState<FacilityFormData>({
    name: facility?.name || '',
    address: facility?.address || '',
    facilityType: facility?.facilityType || '',
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.address) return
    onSubmit(formData)
  }

  return (
    <div className="space-y-3">
      <Input label="施設名" value={formData.name} onChange={v => setFormData({...formData, name: v})} required />
      <Input label="住所" value={formData.address} onChange={v => setFormData({...formData, address: v})} required />
      <Select
        label="施設区分"
        value={formData.facilityType}
        onChange={v => setFormData({...formData, facilityType: v})}
        options={Object.entries(FACILITY_TYPES).map(([value, label]) => ({value, label}))}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>{facility ? '更新' : '追加'}</Button>
      </div>
    </div>
  )
}

/**
 * 施設マスタ画面
 */
export const FacilityMasterPage = ({facilities, onAdd, onUpdate, onDelete, onReorder}: FacilityMasterPageProps) => {
  const facilityModal = useModal()
  const [portalSettings, setPortalSettings] = useState<PortalSettings>(
    facilities.reduce((acc, f) => {
      acc[f.id] = {
        enabled: false,
        loginId: `facility_${f.id}`,
        password: '',
        portalUrl: `https://visitdental.example.com/portal/${f.id}`,
      }
      return acc
    }, {} as PortalSettings)
  )

  const handleOpenAdd = () => {
    facilityModal.handleOpen({facility: null})
  }

  const handleOpenEdit = (facility: Facility) => {
    facilityModal.handleOpen({facility})
  }

  const handleSubmit = (formData: FacilityFormData) => {
    if (facilityModal.open?.facility) {
      onUpdate(facilityModal.open.facility.id, formData)
    } else {
      onAdd(formData)
    }
    facilityModal.handleClose()
  }

  const togglePortal = (facilityId: number) => {
    setPortalSettings(prev => {
      const current = prev[facilityId] || {}
      return {
        ...prev,
        [facilityId]: {
          ...current,
          enabled: !current.enabled,
          password: !current.enabled ? `pass_${Math.random().toString(36).slice(2, 8)}` : '',
        },
      }
    })
  }

  const regeneratePassword = (facilityId: number) => {
    setPortalSettings(prev => ({
      ...prev,
      [facilityId]: {...prev[facilityId], password: `pass_${Math.random().toString(36).slice(2, 8)}`},
    }))
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">登録施設一覧</h2>
        <Button onClick={handleOpenAdd}>
          <span className="flex items-center gap-1">
            <IconPlus />
            施設追加
          </span>
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-16">順序</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">施設名</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">住所</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">施設区分</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">ポータル</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {facilities.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="施設が登録されていません" />
                  </td>
                </tr>
              ) : (
                facilities.map((facility, idx) => {
                  const portal = portalSettings[facility.id] || {}
                  return (
                    <tr key={facility.id} className="hover:bg-gray-50 align-top">
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-0.5">
                          <button
                            onClick={() => onReorder?.(facility.id, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 text-gray-400 hover:text-slate-600 disabled:opacity-30 rounded text-xs"
                            aria-label="上へ"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => onReorder?.(facility.id, 'down')}
                            disabled={idx === facilities.length - 1}
                            className="p-0.5 text-gray-400 hover:text-slate-600 disabled:opacity-30 rounded text-xs"
                            aria-label="下へ"
                          >
                            ▼
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{facility.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{facility.address}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{FACILITY_TYPES[facility.facilityType as keyof typeof FACILITY_TYPES] || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => togglePortal(facility.id)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${portal.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
                          >
                            <div
                              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${portal.enabled ? 'translate-x-5' : 'translate-x-0.5'}`}
                            />
                          </button>
                          <span className="text-xs text-gray-500">{portal.enabled ? '有効' : '無効'}</span>
                          {portal.enabled && (
                            <div className="text-xs text-left mt-1 space-y-0.5">
                              <div className="text-gray-500">
                                ID: <span className="font-mono">{portal.loginId}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">PW:</span>
                                <span className="font-mono text-gray-700">{portal.password}</span>
                                <button
                                  onClick={() => regeneratePassword(facility.id)}
                                  className="text-blue-500 hover:text-blue-700 text-[10px]"
                                >
                                  再生成
                                </button>
                              </div>
                              <div className="text-blue-600 break-all text-[10px]">{portal.portalUrl}</div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(facility)}
                            className="p-1 text-gray-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
                            aria-label="編集"
                          >
                            <IconEdit />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`「${facility.name}」を削除しますか？`)) {
                                onDelete(facility.id)
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                            aria-label="削除"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <facilityModal.Modal title={facilityModal.open?.facility ? '施設を編集' : '施設を追加'}>
        <FacilityForm facility={facilityModal.open?.facility} onSubmit={handleSubmit} onClose={facilityModal.handleClose} />
      </facilityModal.Modal>
    </div>
  )
}

/**
 * 利用者フォーム（モーダル用）
 */
export const PatientForm = ({patient, onSubmit, onClose}: PatientFormProps) => {
  const [formData, setFormData] = useState<PatientFormData>({
    lastName: patient?.lastName || '',
    firstName: patient?.firstName || '',
    lastNameKana: patient?.lastNameKana || '',
    firstNameKana: patient?.firstNameKana || '',
    building: patient?.building || '',
    floor: patient?.floor || '',
    room: patient?.room || '',
    notes: patient?.notes || '',
  })

  const handleSubmit = () => {
    if (!formData.lastName || !formData.firstName || !formData.lastNameKana || !formData.firstNameKana) return
    onSubmit(formData)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="姓" value={formData.lastName} onChange={v => setFormData({...formData, lastName: v})} required />
        <Input label="名" value={formData.firstName} onChange={v => setFormData({...formData, firstName: v})} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="セイ" value={formData.lastNameKana} onChange={v => setFormData({...formData, lastNameKana: v})} required />
        <Input
          label="メイ"
          value={formData.firstNameKana}
          onChange={v => setFormData({...formData, firstNameKana: v})}
          required
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input
          label="建物"
          value={formData.building}
          onChange={v => setFormData({...formData, building: v})}
          placeholder="本館"
        />
        <Input label="フロア" value={formData.floor} onChange={v => setFormData({...formData, floor: v})} placeholder="2F" />
        <Input label="部屋番号" value={formData.room} onChange={v => setFormData({...formData, room: v})} placeholder="201" />
      </div>
      <TextArea
        label="申し送り"
        value={formData.notes}
        onChange={v => setFormData({...formData, notes: v})}
        placeholder="特記事項があれば入力"
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>{patient ? '更新' : '追加'}</Button>
      </div>
    </div>
  )
}

/**
 * 利用者マスタ画面
 */
export const PatientMasterPage = ({facilities, patients, onAdd, onUpdate, onDelete, onSelectPatient, onEditPatient}: PatientMasterPageProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [facilityFilter, setFacilityFilter] = useState('')
  const patientModal = useModal()

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const fullName = getPatientName(p)
      const fullNameKana = getPatientNameKana(p)
      const matchesSearch =
        !searchQuery ||
        fullName.includes(searchQuery) ||
        fullNameKana.includes(searchQuery) ||
        p.lastName.includes(searchQuery) ||
        p.firstName.includes(searchQuery) ||
        p.lastNameKana.includes(searchQuery) ||
        p.firstNameKana.includes(searchQuery)
      const matchesFacility = !facilityFilter || p.facilityId === Number(facilityFilter)
      return matchesSearch && matchesFacility
    })
  }, [patients, searchQuery, facilityFilter])

  const handleOpenAdd = () => {
    patientModal.handleOpen({patient: null})
  }

  const handleSubmit = (formData: PatientFormData) => {
    if (patientModal.open?.patient) {
      onUpdate(patientModal.open.patient.id, formData)
    } else {
      const targetFacilityId = facilityFilter ? Number(facilityFilter) : facilities[0]?.id
      onAdd({...formData, facilityId: targetFacilityId})
    }
    patientModal.handleClose()
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">利用者マスタ</h2>
        <Button onClick={handleOpenAdd}>
          <span className="flex items-center gap-1">
            <IconPlus />
            利用者を追加
          </span>
        </Button>
      </div>

      {/* フィルター行 */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <Input label="" value={searchQuery} onChange={setSearchQuery} placeholder="🔍 氏名・カナで検索" />
        </div>
        <div className="w-48">
          <Select
            label=""
            value={facilityFilter}
            onChange={setFacilityFilter}
            options={[{value: '', label: '全施設'}, ...facilities.map(f => ({value: String(f.id), label: f.name}))]}
          />
        </div>
      </div>

      {/* 統合テーブル */}
      <Card>
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">利用者マスタ ({filteredPatients.length}名)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">#</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">氏名</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">ふりがな</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">施設</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">居場所</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">年齢</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">申し送り</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState message="該当する利用者がいません" />
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p, idx) => {
                  const facility = facilities.find(f => f.id === p.facilityId)
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{getPatientName(p)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getPatientNameKana(p)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{facility?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.building && <Badge variant="primary">{p.building}</Badge>} {p.floor}-{p.room}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.age || '-'}歳</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[120px] truncate">{p.notes || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" variant="outline" onClick={() => onSelectPatient?.(p.id)}>
                            詳細
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onEditPatient?.(p.id)}>
                            ✏️
                          </Button>
                          <button
                            onClick={() => {
                              if (window.confirm(`「${getPatientName(p)}」を削除しますか？`)) {
                                onDelete(p.id)
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                            aria-label="削除"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <patientModal.Modal title={patientModal.open?.patient ? '利用者を編集' : '利用者を追加'}>
        <PatientForm patient={patientModal.open?.patient} onSubmit={handleSubmit} onClose={patientModal.handleClose} />
      </patientModal.Modal>
    </div>
  )
}

/**
 * スタッフフォーム（モーダル用）
 */
export const StaffForm = ({staffMember, onSubmit, onClose}: StaffFormProps) => {
  const [formData, setFormData] = useState<StaffFormData>({
    name: staffMember?.name || '',
    role: staffMember?.role || '',
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.role) return
    onSubmit(formData)
  }

  return (
    <div className="space-y-3">
      <Input label="氏名" value={formData.name} onChange={v => setFormData({...formData, name: v})} required />
      <Select
        label="役割"
        value={formData.role}
        onChange={v => setFormData({...formData, role: v})}
        options={[
          {value: STAFF_ROLES.DOCTOR, label: '歯科医師'},
          {value: STAFF_ROLES.HYGIENIST, label: '歯科衛生士'},
        ]}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>{staffMember ? '更新' : '追加'}</Button>
      </div>
    </div>
  )
}

/**
 * スタッフマスタ画面
 */
export const StaffMasterPage = ({staff, onAdd, onUpdate, onDelete, onReorder}: StaffMasterPageProps) => {
  const staffModal = useModal()

  const handleOpenAdd = () => {
    staffModal.handleOpen({staffMember: null})
  }

  const handleOpenEdit = (s: Staff) => {
    staffModal.handleOpen({staffMember: s})
  }

  const handleSubmit = (formData: StaffFormData) => {
    if (staffModal.open?.staffMember) {
      onUpdate(staffModal.open.staffMember.id, formData)
    } else {
      onAdd(formData)
    }
    staffModal.handleClose()
  }

  const handleDelete = (id: number) => {
    onDelete(id)
  }

  const doctors = staff.filter(s => s.role === STAFF_ROLES.DOCTOR).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  const hygienists = staff.filter(s => s.role === STAFF_ROLES.HYGIENIST).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

  const renderStaffList = (members: Staff[], roleLabel: string) => (
    <Card>
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <span className="text-sm font-medium text-gray-700">
          {roleLabel} ({members.length}名)
        </span>
      </div>
      <ul className="divide-y divide-gray-200">
        {members.map((s, idx) => (
          <li key={s.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-gray-900">{s.name}</span>
            <div className="flex gap-1 items-center">
              <button
                onClick={() => onReorder(s.id, 'up')}
                disabled={idx === 0}
                className="p-1 text-gray-400 hover:text-slate-600 disabled:opacity-30 rounded"
                aria-label="上へ"
              >
                ▲
              </button>
              <button
                onClick={() => onReorder(s.id, 'down')}
                disabled={idx === members.length - 1}
                className="p-1 text-gray-400 hover:text-slate-600 disabled:opacity-30 rounded"
                aria-label="下へ"
              >
                ▼
              </button>
              <button
                onClick={() => handleOpenEdit(s)}
                className="p-1 text-gray-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
                aria-label="編集"
              >
                <IconEdit />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`「${s.name}」を削除しますか？`)) handleDelete(s.id)
                }}
                className="p-1 text-gray-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                aria-label="削除"
              >
                <IconTrash />
              </button>
            </div>
          </li>
        ))}
        {members.length === 0 && <li className="px-4 py-3 text-sm text-gray-500">登録なし</li>}
      </ul>
    </Card>
  )

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">スタッフマスタ</h2>
        <Button onClick={handleOpenAdd}>
          <span className="flex items-center gap-1">
            <IconPlus />
            スタッフ追加
          </span>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {renderStaffList(doctors, '歯科医師')}
        {renderStaffList(hygienists, '歯科衛生士')}
      </div>

      <staffModal.Modal title={staffModal.open?.staffMember ? 'スタッフを編集' : 'スタッフを追加'}>
        <StaffForm staffMember={staffModal.open?.staffMember} onSubmit={handleSubmit} onClose={staffModal.handleClose} />
      </staffModal.Modal>
    </div>
  )
}

/**
 * クリニック設定画面
 */
export const ClinicSettingsPage = ({clinic, onUpdateClinic, onUpdateQualification}: ClinicSettingsPageProps) => {
  const [formData, setFormData] = useState({
    name: clinic.name,
    address: clinic.address,
    phone: clinic.phone,
    representative: clinic.representative,
  })

  const handleSaveBasicInfo = () => {
    onUpdateClinic(formData)
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">クリニック設定</h2>

      {/* 注意事項 */}
      <Card className="mb-4 bg-yellow-50 border-yellow-200">
        <div className="p-4">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 text-lg">⚠</span>
            <div className="text-sm text-yellow-800">
              <div className="font-medium mb-1">前提条件について</div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>このアプリは歯訪診の施設基準の登録が済んでいる前提です</li>
                <li>歯科訪問診療料の注15も登録済みである前提の点数表示になっています</li>
                <li>院内感染対策の届出も提出済である前提としてあります</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* 基本情報 */}
      <Card className="mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">基本情報</span>
        </div>
        <div className="p-4 space-y-4">
          <Input label="クリニック名" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
          <Input label="住所" value={formData.address} onChange={v => setFormData({...formData, address: v})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="電話番号" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
            <Input
              label="代表者名"
              value={formData.representative}
              onChange={v => setFormData({...formData, representative: v})}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveBasicInfo}>基本情報を保存</Button>
          </div>
        </div>
      </Card>

      {/* 届出・施設基準 */}
      <Card>
        <div className="p-3 border-b border-gray-200 bg-blue-600">
          <span className="text-sm font-medium text-white">届出・施設基準</span>
        </div>
        <div className="p-4 space-y-2">
          {CLINIC_QUALIFICATIONS.map((qual: ClinicQualificationMaster) => {
            const currentValue = clinic.qualifications[qual.id]
            return (
              <div key={qual.id} className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!currentValue}
                    onChange={() => onUpdateQualification(qual.id, !currentValue)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-900">{qual.name}</span>
                </label>
                {qual.hasTextInput && <span className="text-sm text-gray-700">（</span>}
                {qual.hasTextInput && (
                  <input
                    type="text"
                    value={clinic.qualifications.otherText || ''}
                    onChange={e => onUpdateQualification('otherText', e.target.value)}
                    className="border-b border-gray-400 text-sm px-1 py-0.5 w-40 outline-none"
                  />
                )}
                {qual.hasTextInput && <span className="text-sm text-gray-700">）</span>}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
