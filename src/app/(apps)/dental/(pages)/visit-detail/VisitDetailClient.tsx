'use client'

import {useState, useMemo} from 'react'
import {useRouter} from 'next/navigation'
import {DndContext, closestCenter, MouseSensor, useSensor, useSensors} from '@dnd-kit/core'
import type {DragEndEvent} from '@dnd-kit/core'
import {SortableContext, verticalListSortingStrategy, useSortable, arrayMove} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import {HREF} from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {
  createDentalExamination,
  updateDentalExamination,
  deleteDentalExamination,
  reorderDentalExaminations,
} from '@app/(apps)/dental/_actions/examination-actions'
import {STAFF_ROLES, EXAMINATION_STATUS} from '@app/(apps)/dental/lib/constants'
import {getPatientName, calculateExamPoints, calculateDocumentRequirements} from '@app/(apps)/dental/lib/helpers'
import type {Facility, Patient, Examination, Staff} from '@app/(apps)/dental/lib/types'
import DocumentTemplateButtons from '../components/DocumentTemplateButtons'
import type { SavedTemplateStatus } from '@app/(apps)/dental/_actions/saved-document-actions'

type Props = {
  visitPlanId: number
  visitDate: string
  facility: Facility
  patients: Patient[]
  examinations: Examination[]
  staff: Staff[]
  savedTemplateStatusesMap?: Record<number, SavedTemplateStatus[]>
}

type SortableExamItemProps = {
  exam: Examination
  patient: Patient
  doctors: Staff[]
  hygienists: Staff[]
  visitDate: string
  savedTemplateStatuses: SavedTemplateStatus[]
  onUpdateExam: (examId: number, data: {doctorId?: string | null; hygienistId?: string | null}) => void
  onRemoveExam: (examId: number) => void
  onStartConsultation: (examId: number) => void
  onNavigateDocument: (examId: number, templateId: string) => void
}

const SortableExamItem = ({exam, patient, doctors, hygienists, visitDate, savedTemplateStatuses, onUpdateExam, onRemoveExam, onStartConsultation, onNavigateDocument}: SortableExamItemProps) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: exam.id})
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const statusLabel =
    exam.status === EXAMINATION_STATUS.DONE
      ? '完了'
      : exam.status === EXAMINATION_STATUS.IN_PROGRESS
        ? '診療中'
        : '未診察'
  const statusColor =
    exam.status === EXAMINATION_STATUS.DONE
      ? 'bg-emerald-100 text-emerald-800'
      : exam.status === EXAMINATION_STATUS.IN_PROGRESS
        ? 'bg-blue-100 text-blue-800'
        : 'bg-gray-100 text-gray-600'

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`p-3 border border-gray-200 rounded-lg bg-white hover:shadow-sm ${isDragging ? 'shadow-lg ring-2 ring-slate-300' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* ドラッグハンドル */}
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 px-1">
            ⠿
          </button>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">{patient.building}</span>
          <span className="text-xs text-gray-600">
            {patient.floor} - {patient.room}
          </span>
          <span className={`px-2 py-0.5 text-xs rounded ${statusColor}`}>{statusLabel}</span>
        </div>
        <button onClick={() => onRemoveExam(exam.id)} className="text-gray-400 hover:text-red-600">
          x
        </button>
      </div>
      <div className="text-sm font-semibold text-gray-900 mb-1">{getPatientName(patient)}</div>
      {patient.notes && <div className="text-xs text-orange-600 mb-2">! {patient.notes}</div>}

      {/* 担当選択 */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs text-gray-500 mb-1">担当医:</div>
          <select
            value={exam.doctorId || ''}
            onChange={e => onUpdateExam(exam.id, {doctorId: e.target.value || null})}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          >
            <option value="">未選択</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">担当DH:</div>
          <select
            value={exam.hygienistId || ''}
            onChange={e => onUpdateExam(exam.id, {hygienistId: e.target.value || null})}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          >
            <option value="">未選択</option>
            {hygienists.map(h => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 合計点数 */}
      {Object.keys(exam.procedureItems || {}).length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-gray-500">合計:</span>
          <span className="text-sm font-bold text-slate-700">{calculateExamPoints(exam, visitDate).toLocaleString()} 点</span>
        </div>
      )}

      {/* 必要文書ボタン */}
      {Object.keys(exam.procedureItems || {}).length > 0 && (() => {
        const docReqs = calculateDocumentRequirements({procedureItems: exam.procedureItems, dhSeconds: 0})
        const hasRequired = Object.values(docReqs).some(d => d.required)
        if (!hasRequired) return null
        return (
          <div className="mt-1">
            <DocumentTemplateButtons
              docRequirements={docReqs}
              savedTemplateStatuses={savedTemplateStatuses}
              onSelect={(templateId) => onNavigateDocument(exam.id, templateId)}
              variant="inline"
              requiredOnly
            />
          </div>
        )
      })()}

      {/* 診療開始ボタン */}
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => onStartConsultation(exam.id)}
          className="flex-1 px-3 py-1.5 bg-slate-700 text-white text-xs rounded hover:bg-slate-800"
        >
          診療開始
        </button>
      </div>
    </li>
  )
}

const VisitDetailClient = ({visitPlanId, visitDate, facility, patients, examinations, staff, savedTemplateStatusesMap = {}}: Props) => {
  const router = useRouter()
  const {query} = useGlobal()
  const [localExams, setLocalExams] = useState(examinations)

  // 既に追加済みの患者ID
  const addedPatientIds = useMemo(() => localExams.map(e => e.patientId), [localExams])

  // 施設の患者を建物×フロアでグループ化
  const groupedPatients = useMemo(() => {
    const groups: Record<string, Patient[]> = {}
    patients.forEach(p => {
      const key = `${p.building} - ${p.floor}`
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    })
    return groups
  }, [patients])

  const doctors = staff.filter(s => s.role === STAFF_ROLES.DOCTOR)
  const hygienists = staff.filter(s => s.role === STAFF_ROLES.HYGIENIST)

  // 患者追加
  const handleAddPatient = async (patientId: number) => {
    if (addedPatientIds.includes(patientId)) return
    const maxSortOrder = localExams.length > 0 ? Math.max(...localExams.map(e => e.sortOrder)) : 0
    await createDentalExamination({
      dentalVisitPlanId: visitPlanId,
      dentalPatientId: patientId,
      status: EXAMINATION_STATUS.WAITING,
      sortOrder: maxSortOrder + 1,
    })
    router.refresh()
  }

  // 担当変更
  const handleUpdateExam = async (examId: number, data: {doctorId?: string | null; hygienistId?: string | null}) => {
    await updateDentalExamination(examId, data)
    setLocalExams(prev => prev.map(e => (e.id === examId ? {...e, ...data} : e)))
  }

  // 削除
  const handleRemoveExam = async (examId: number) => {
    if (!window.confirm('この患者を訪問計画から削除しますか？')) return
    await deleteDentalExamination(examId)
    setLocalExams(prev => prev.filter(e => e.id !== examId))
  }

  // DnD sensors（distance: 5でselectクリックとの誤作動防止）
  const sensors = useSensors(useSensor(MouseSensor, {activationConstraint: {distance: 5}}))

  // DnD並び替え
  const handleDragEnd = async (event: DragEndEvent) => {
    const {active, over} = event
    if (!over || active.id === over.id) return

    const oldIndex = localExams.findIndex(e => e.id === active.id)
    const newIndex = localExams.findIndex(e => e.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newExams = arrayMove(localExams, oldIndex, newIndex)
    setLocalExams(newExams)

    await reorderDentalExaminations(newExams.map((e, i) => ({id: e.id, sortOrder: i + 1})))
  }

  // 診療開始
  const handleStartConsultation = (examId: number) => {
    router.push(HREF(`/dental/consultation`, {examinationId: examId}, query))
  }

  // 文書作成へ遷移
  const handleNavigateDocument = (examId: number, templateId: string) => {
    router.push(HREF(`/dental/document-create`, {examinationId: examId, templateId}, query))
  }

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(HREF('/dental/schedule', {}, query))}
            className="text-gray-400 hover:text-gray-600"
          >
            &lt;
          </button>
          <div>
            <div className="text-xs text-gray-500">{visitDate}</div>
            <h2 className="text-xl font-bold text-gray-900">{facility.name}</h2>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 左カラム: 施設登録患者リスト */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">施設登録患者リスト</span>
            <p className="text-xs text-gray-500 mt-1">+ボタンで訪問計画に追加</p>
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
                        className={`flex items-center justify-between px-2 py-2 rounded border ${
                          isAdded ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getPatientName(patient)}</div>
                          <div className="text-xs text-gray-500">{patient.room}号室</div>
                        </div>
                        {isAdded ? (
                          <span className="text-emerald-600 text-sm">追加済</span>
                        ) : (
                          <button
                            onClick={() => handleAddPatient(patient.id)}
                            className="text-gray-400 hover:text-slate-600 p-1"
                          >
                            +
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 右カラム: 本日の訪問・診察リスト */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">
              本日の訪問・診察リスト ({localExams.length}名)
            </span>
          </div>
          <div className="p-2 max-h-[500px] overflow-y-auto">
            {localExams.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-sm text-gray-500">患者を左のリストから追加してください</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={localExams.map(e => e.id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-2">
                    {localExams.map(exam => {
                      const patient = patients.find(p => p.id === exam.patientId)
                      if (!patient) return null
                      return (
                        <SortableExamItem
                          key={exam.id}
                          exam={exam}
                          patient={patient}
                          doctors={doctors}
                          hygienists={hygienists}
                          visitDate={visitDate}
                          savedTemplateStatuses={savedTemplateStatusesMap[exam.id] || []}
                          onUpdateExam={handleUpdateExam}
                          onRemoveExam={handleRemoveExam}
                          onStartConsultation={handleStartConsultation}
                          onNavigateDocument={handleNavigateDocument}
                        />
                      )
                    })}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisitDetailClient
