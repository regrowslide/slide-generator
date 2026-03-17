'use client'

import {useState, useMemo, useCallback} from 'react'
import useModal from '@cm/components/utils/modal/useModal'
import {STAFF_ROLES} from './constants'
import {getPatientName, formatDate, generateCalendarDays} from './helpers'
import {
  Button,
  Badge,
  Card,
  Input,
  Select,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconUsers,
  IconBuilding,
} from './ui-components'
import type {
  Facility,
  Patient,
  Staff,
  VisitPlan,
  Examination,
  CalendarDay,
} from './types'

// =============================================================================
// Props型定義（ローカル）
// =============================================================================

type VisitPlanFormData = {
  visitDate: string
  facilityId: number
}

type VisitPlanFormProps = {
  facilities: Facility[]
  onSubmit: (data: VisitPlanFormData) => void
  onClose: () => void
}

type SchedulePageProps = {
  facilities: Facility[]
  visitPlans: VisitPlan[]
  onAddPlan: (data: VisitPlanFormData) => void
  onSelectPlan: (plan: VisitPlan | null) => void
}

type VisitPlanDetailPageProps = {
  visitPlan: VisitPlan
  facility: Facility
  patients: Patient[]
  examinations: Examination[]
  staff: Staff[]
  onBack: () => void
  onAddExamination: (data: {visitPlanId: number; patientId: number}) => void
  onUpdateExamination: (id: number, data: Partial<Examination>) => void
  onRemoveExamination: (id: number) => void
  onReorderExaminations: (visitPlanId: number, newOrder: number[]) => void
  onStartConsultation: (examId: number, mode: 'doctor' | 'dh') => void
}

// =============================================================================
// コンポーネント
// =============================================================================

/**
 * 訪問計画フォーム（モーダル用）
 */
export const VisitPlanForm = ({facilities, onSubmit, onClose}: VisitPlanFormProps) => {
  const [formData, setFormData] = useState({
    visitDate: '',
    facilityId: '',
  })

  const handleSubmit = () => {
    if (!formData.visitDate || !formData.facilityId) return
    onSubmit({visitDate: formData.visitDate, facilityId: Number(formData.facilityId)})
  }

  return (
    <div className="space-y-3">
      <Input
        label="訪問日"
        type="date"
        value={formData.visitDate}
        onChange={v => setFormData({...formData, visitDate: v})}
        required
      />
      <Select
        label="施設"
        value={formData.facilityId}
        onChange={v => setFormData({...formData, facilityId: v})}
        options={facilities.map(f => ({value: f.id, label: f.name}))}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit}>作成</Button>
      </div>
    </div>
  )
}

/**
 * 訪問計画スケジュール（カレンダー）画面
 */
export const SchedulePage = ({facilities, visitPlans, onAddPlan, onSelectPlan}: SchedulePageProps) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1))
  const [selectedFacilityId, setSelectedFacilityId] = useState('')
  const visitPlanModal = useModal()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const calendarDays = useMemo(() => generateCalendarDays(year, month), [year, month])

  const filteredPlans = useMemo(() => {
    if (!selectedFacilityId) return visitPlans
    return visitPlans.filter(p => p.facilityId === Number(selectedFacilityId))
  }, [visitPlans, selectedFacilityId])

  const getPlansByDate = useCallback(
    (date: Date) => {
      const dateStr = formatDate(date)
      return filteredPlans.filter(p => p.visitDate === dateStr)
    },
    [filteredPlans]
  )

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleAddPlan = (formData: VisitPlanFormData) => {
    onAddPlan(formData)
    visitPlanModal.handleClose()
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectPlan(null)}
            className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
            aria-label="戻る"
          >
            <IconChevronLeft />
          </button>
          <h2 className="text-xl font-bold text-gray-900">訪問計画スケジュール</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedFacilityId}
            onChange={setSelectedFacilityId}
            options={facilities.map(f => ({value: f.id, label: f.name}))}
            placeholder="全ての施設"
          />
          <Button onClick={() => visitPlanModal.handleOpen()}>
            <span className="flex items-center gap-1">
              <IconPlus />
              新規作成
            </span>
          </Button>
        </div>
      </div>

      <Card className="p-4">
        {/* カレンダーヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-100 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            aria-label="前月"
          >
            <IconChevronLeft />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {year}年 {month + 1}月
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            aria-label="翌月"
          >
            <IconChevronRight />
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-1 ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダー本体 */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
          {calendarDays.map((dayInfo: CalendarDay, index: number) => {
            const plans = getPlansByDate(dayInfo.date)
            const dayOfWeek = dayInfo.date.getDay()
            return (
              <div key={index} className={`bg-white min-h-[80px] p-1 ${!dayInfo.isCurrentMonth ? 'bg-gray-50' : ''}`}>
                <div
                  className={`text-xs font-medium mb-1 ${
                    !dayInfo.isCurrentMonth
                      ? 'text-gray-400'
                      : dayOfWeek === 0
                        ? 'text-red-500'
                        : dayOfWeek === 6
                          ? 'text-blue-500'
                          : 'text-gray-900'
                  }`}
                >
                  {dayInfo.date.getDate()}
                </div>
                <div className="space-y-0.5">
                  {plans.map(plan => {
                    const facility = facilities.find(f => f.id === plan.facilityId)
                    return (
                      <button
                        key={plan.id}
                        onClick={() => onSelectPlan(plan)}
                        className="w-full text-left px-1 py-0.5 text-xs bg-slate-100 text-slate-700 rounded truncate hover:bg-slate-200"
                      >
                        {facility?.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <visitPlanModal.Modal title="新規訪問計画">
        <VisitPlanForm facilities={facilities} onSubmit={handleAddPlan} onClose={visitPlanModal.handleClose} />
      </visitPlanModal.Modal>
    </div>
  )
}

/**
 * ドラッグハンドルアイコン
 */
export const IconDragHandle = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
  </svg>
)

/**
 * 訪問計画詳細（並び替え・診察前設定）画面
 */
export const VisitPlanDetailPage = ({
  visitPlan,
  facility,
  patients,
  examinations,
  staff,
  onBack,
  onAddExamination,
  onUpdateExamination,
  onRemoveExamination,
  onReorderExaminations,
  onStartConsultation,
}: VisitPlanDetailPageProps) => {
  const [draggedPatientId, setDraggedPatientId] = useState<number | null>(null)
  const [draggedExamId, setDraggedExamId] = useState<number | null>(null)
  const [dragOverExamId, setDragOverExamId] = useState<number | null>(null)
  const [isDragOverDropZone, setIsDragOverDropZone] = useState(false)

  // 施設の利用者を取得
  const facilityPatients = useMemo(() => patients.filter(p => p.facilityId === facility.id), [patients, facility.id])

  // 既に診察リストに追加済みの患者ID
  const addedPatientIds = useMemo(() => examinations.map(e => e.patientId), [examinations])

  // 建物×フロアでグループ化
  const groupedPatients = useMemo(() => {
    const groups: Record<string, Patient[]> = {}
    facilityPatients.forEach(p => {
      const key = `${p.building} - ${p.floor}`
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    })
    return groups
  }, [facilityPatients])

  // 患者ドラッグ開始（左カラムから）
  const handlePatientDragStart = (e: React.DragEvent, patientId: number) => {
    setDraggedPatientId(patientId)
    e.dataTransfer.effectAllowed = 'copy'
  }

  // 診察リストへのドロップ（新規追加）
  const handleDropToList = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverDropZone(false)
    if (draggedPatientId && !addedPatientIds.includes(draggedPatientId)) {
      onAddExamination({visitPlanId: visitPlan.id, patientId: draggedPatientId})
    }
    setDraggedPatientId(null)
  }

  // 診察項目のドラッグ開始（並び替え用）
  const handleExamDragStart = (e: React.DragEvent, examId: number) => {
    setDraggedExamId(examId)
    e.dataTransfer.effectAllowed = 'move'
  }

  // 診察項目へのドラッグオーバー
  const handleExamDragOver = (e: React.DragEvent, examId: number) => {
    e.preventDefault()
    if (draggedExamId && draggedExamId !== examId) {
      setDragOverExamId(examId)
    }
  }

  // 診察項目へのドロップ（並び替え）
  const handleExamDrop = (e: React.DragEvent, targetExamId: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedExamId && draggedExamId !== targetExamId) {
      // 現在の順序を取得
      const currentOrder = examinations.map(ex => ex.id)
      const draggedIndex = currentOrder.indexOf(draggedExamId)
      const targetIndex = currentOrder.indexOf(targetExamId)

      // 順序を入れ替え
      const newOrder = [...currentOrder]
      newOrder.splice(draggedIndex, 1)
      newOrder.splice(targetIndex, 0, draggedExamId)

      onReorderExaminations(visitPlan.id, newOrder)
    }

    setDraggedExamId(null)
    setDragOverExamId(null)
  }

  // ドラッグ終了
  const handleDragEnd = () => {
    setDraggedPatientId(null)
    setDraggedExamId(null)
    setDragOverExamId(null)
    setIsDragOverDropZone(false)
  }

  const handleAddPatient = (patientId: number) => {
    if (!addedPatientIds.includes(patientId)) {
      onAddExamination({visitPlanId: visitPlan.id, patientId})
    }
  }

  const doctors = staff.filter(s => s.role === STAFF_ROLES.DOCTOR)
  const hygienists = staff.filter(s => s.role === STAFF_ROLES.HYGIENIST)

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
            aria-label="戻る"
          >
            <IconChevronLeft />
          </button>
          <div>
            <div className="text-xs text-gray-500">{visitPlan.visitDate}</div>
            <h2 className="text-xl font-bold text-gray-900">{facility.name}</h2>
          </div>
        </div>
        <Button variant="success">
          <span className="flex items-center gap-1">
            <IconCheck />
            訪問全体を終了する
          </span>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 左カラム: 施設登録患者リスト */}
        <Card>
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <IconUsers />
              <span className="text-sm font-medium text-gray-700">施設登録患者リスト</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">右のリストへドラッグ&ドロップして計画を作成</p>
          </div>
          <div className="p-2 max-h-[500px] overflow-y-auto">
            {Object.entries(groupedPatients).map(([groupKey, groupPatients]) => (
              <div key={groupKey} className="mb-3">
                <div className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-50 rounded">{groupKey}</div>
                <ul className="mt-1 space-y-1">
                  {groupPatients.map(patient => {
                    const isAdded = addedPatientIds.includes(patient.id)
                    return (
                      <li
                        key={patient.id}
                        draggable={!isAdded}
                        onDragStart={e => handlePatientDragStart(e, patient.id)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center justify-between px-2 py-2 rounded border transition-all ${
                          isAdded
                            ? 'bg-emerald-50 border-emerald-200'
                            : draggedPatientId === patient.id
                              ? 'bg-slate-100 border-slate-400 opacity-50'
                              : 'bg-white border-gray-200 cursor-grab hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getPatientName(patient)}</div>
                          <div className="text-xs text-gray-500">{patient.room}号室</div>
                        </div>
                        {isAdded ? (
                          <span className="text-emerald-600">
                            <IconCheck />
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddPatient(patient.id)}
                            className="text-gray-400 hover:text-slate-600 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
                            aria-label={`${getPatientName(patient)}を追加`}
                          >
                            <IconPlus />
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* 右カラム: 本日の訪問・診察リスト */}
        <Card
          onDragOver={(e: React.DragEvent) => {
            e.preventDefault()
            if (draggedPatientId) setIsDragOverDropZone(true)
          }}
          onDragLeave={() => setIsDragOverDropZone(false)}
          onDrop={handleDropToList}
          className={`transition-all ${isDragOverDropZone ? 'ring-2 ring-slate-400 bg-slate-50' : ''}`}
        >
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <IconBuilding />
              <span className="text-sm font-medium text-gray-700">本日の訪問・診察リスト ({examinations.length}名)</span>
            </div>
          </div>
          <div className="p-2 max-h-[500px] overflow-y-auto">
            {examinations.length === 0 ? (
              <div
                className={`text-center py-8 border-2 border-dashed rounded-lg ${
                  isDragOverDropZone ? 'border-slate-400 bg-slate-50' : 'border-gray-300'
                }`}
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">患者をドラッグ&ドロップで追加</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {examinations.map((exam) => {
                  const patient = patients.find(p => p.id === exam.patientId)
                  if (!patient) return null
                  const isDragging = draggedExamId === exam.id
                  const isDragOver = dragOverExamId === exam.id

                  return (
                    <li
                      key={exam.id}
                      draggable
                      onDragStart={e => handleExamDragStart(e, exam.id)}
                      onDragOver={e => handleExamDragOver(e, exam.id)}
                      onDrop={e => handleExamDrop(e, exam.id)}
                      onDragEnd={handleDragEnd}
                      className={`p-3 border rounded-lg transition-all ${
                        isDragging
                          ? 'border-slate-400 bg-slate-50 opacity-50'
                          : isDragOver
                            ? 'border-slate-500 bg-slate-100 shadow-lg transform scale-[1.02]'
                            : 'border-gray-200 bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {/* ドラッグハンドル */}
                          <span className="cursor-grab text-gray-400 hover:text-gray-600">
                            <IconDragHandle />
                          </span>
                          <Badge variant="primary">{patient.building}</Badge>
                          <span className="text-xs text-gray-600">
                            {patient.floor} - {patient.room}
                          </span>
                          <Badge variant="default">未診察</Badge>
                        </div>
                        <button onClick={() => onRemoveExamination(exam.id)} className="text-gray-400 hover:text-red-600">
                          ×
                        </button>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">{getPatientName(patient)}</div>
                      {patient.notes && <div className="text-xs text-orange-600 mb-2">⚠ {patient.notes}</div>}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">担当医:</div>
                          <div className="flex items-center gap-1">
                            <select
                              value={exam.doctorId || ''}
                              onChange={e =>
                                onUpdateExamination(exam.id, {
                                  doctorId: e.target.value ? Number(e.target.value) : null,
                                } as Partial<Examination>)
                              }
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                            >
                              <option value="">未選択</option>
                              {doctors.map(d => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onStartConsultation(exam.id, 'doctor')}
                              disabled={!exam.doctorId}
                            >
                              診察(医)
                            </Button>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">担当DH:</div>
                          <div className="flex items-center gap-1">
                            <select
                              value={exam.hygienistId || ''}
                              onChange={e =>
                                onUpdateExamination(exam.id, {
                                  hygienistId: e.target.value ? Number(e.target.value) : null,
                                } as Partial<Examination>)
                              }
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                            >
                              <option value="">未選択</option>
                              {hygienists.map(h => (
                                <option key={h.id} value={h.id}>
                                  {h.name}
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onStartConsultation(exam.id, 'dh')}
                              disabled={!exam.hygienistId}
                            >
                              指導(衛)
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
