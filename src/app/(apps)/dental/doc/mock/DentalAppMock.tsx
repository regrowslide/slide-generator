'use client'

import {useState, useCallback} from 'react'

import {
  useFacilityManager,
  usePatientManager,
  useVisitPlanManager,
  useExaminationManager,
  useStaffManager,
  useScoringHistoryManager,
  useDocumentManager,
  useClinicManager,
} from './hooks'
import {Sidebar} from './Sidebar'
import {FacilityMasterPage, PatientMasterPage, StaffMasterPage, ClinicSettingsPage} from './MasterPages'
import {SchedulePage, VisitPlanDetailPage} from './SchedulePages'
import {ConsultationPage} from './ClinicalPages'
import {DocumentCreatePage} from './DocumentPages'
import {
  DashboardPage,
  PatientEditPage,
  PatientDetailPage,
  IndividualInputPage,
  FinalReviewPage,
  ScoringReferencePage,
  ScoringLedgerPage,
  DocumentListPage,
  TemplateMasterPage,
  FacilityPortalPage,
  BatchPrintPage,
  SummaryPage,
} from './ReportPages'
import {DOCUMENT_TEMPLATES, EXAMINATION_STATUS} from './constants'
import {formatDate, nextId} from './helpers'
import type {Examination, VisitPlan, Patient} from './types'

/**
 * 訪問歯科アプリ メインコンポーネント
 */
export default function DentalAppMock() {
  // ページ状態
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedVisitPlan, setSelectedVisitPlan] = useState<VisitPlan | null>(null)
  const [selectedExamination, setSelectedExamination] = useState<Examination | null>(null)
  const [consultationMode, setConsultationMode] = useState<string | null>(null)
  // 文書作成ページ用の状態
  const [documentType, setDocumentType] = useState<string | null>(null)
  const [documentData, setDocumentData] = useState<Record<string, unknown> | null>(null)
  // 追加: 患者詳細用
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)

  // データ管理
  const {clinic, updateClinic, updateQualification, hasQualification} = useClinicManager()
  const {facilities, addFacility, updateFacility, deleteFacility} = useFacilityManager()
  const {patients, addPatient, updatePatient, deletePatient} = usePatientManager()
  const {visitPlans, addVisitPlan, deleteVisitPlan} = useVisitPlanManager()
  const {examinations, getExaminationsByVisitPlan, addExamination, updateExamination, removeExamination, reorderExaminations} =
    useExaminationManager()
  const {staff, addStaff, updateStaff, deleteStaff, reorderStaff} = useStaffManager()
  const {scoringHistory} = useScoringHistoryManager()
  const {documents, addDocument} = useDocumentManager()

  // ナビゲーション
  const handleNavigate = (page: string) => {
    setCurrentPage(page)
    setSelectedVisitPlan(null)
    setSelectedExamination(null)
    setSelectedPatientId(null)
  }

  const handleSelectVisitPlan = (plan: VisitPlan) => {
    setSelectedVisitPlan(plan)
    setCurrentPage('visit-detail')
  }

  const handleStartConsultation = (examinationId: number, mode: string) => {
    const exam = examinations.find(e => e.id === examinationId)
    setSelectedExamination(exam || null)
    setConsultationMode(mode)
    setCurrentPage('consultation')
  }

  const handleBackFromConsultation = () => {
    setSelectedExamination(null)
    setConsultationMode(null)
    setCurrentPage('visit-detail')
  }

  // 文書作成ページへの遷移
  const handleOpenDocument = (docType: string, data: Record<string, unknown>) => {
    setDocumentType(docType)
    setDocumentData({
      ...data,
      facility: currentFacility,
    })
    setCurrentPage('document-create')
  }

  // 文書作成ページからの戻り
  const handleBackFromDocument = () => {
    setDocumentType(null)
    setDocumentData(null)
    setCurrentPage('consultation')
  }

  // 患者詳細ページへの遷移
  const handleSelectPatient = (patientId: number) => {
    setSelectedPatientId(patientId)
    setCurrentPage('patient-detail')
  }

  // 患者編集ページへの遷移
  const handleEditPatient = (patientId: number) => {
    setSelectedPatientId(patientId)
    setCurrentPage('patient-edit')
  }

  // 患者情報の保存
  const handleSavePatient = (updatedPatient: Patient) => {
    updatePatient(updatedPatient.id, updatedPatient)
    setCurrentPage('patient-detail')
  }

  // 個別入力からの診察開始
  const handleIndividualStart = ({patientId, facilityId, doctorId, hygienistId}: {patientId: number; facilityId: number; doctorId: number | null; hygienistId: number | null}) => {
    // アドホックなvisitPlanを作成
    const adhocPlan = {
      facilityId,
      visitDate: formatDate(new Date(2026, 0, 18)),
      status: 'in_progress',
    }
    addVisitPlan(adhocPlan)

    // 新しいvisitPlanのIDを推測（最大ID+1）
    const newPlanId = nextId(visitPlans)
    setSelectedVisitPlan({...adhocPlan, id: newPlanId} as VisitPlan)

    // examinationを追加
    const newExam = {
      visitPlanId: newPlanId,
      patientId,
      doctorId,
      hygienistId,
    }
    addExamination(newExam)

    // 新しいexaminationのIDを推測
    const newExamId = nextId(examinations)
    const exam: Examination = {
      ...newExam,
      id: newExamId,
      sortOrder: 1,
      status: EXAMINATION_STATUS.WAITING,
      vitalBefore: null,
      vitalAfter: null,
      treatmentItems: [],
      procedureItems: {},
      visitCondition: '',
      oralFindings: '',
      treatment: '',
      nextPlan: '',
      drStartTime: null,
      drEndTime: null,
      dhStartTime: null,
      dhEndTime: null,
    }
    setSelectedExamination(exam)
    setConsultationMode(doctorId ? 'doctor' : 'dh')
    setCurrentPage('consultation')
  }

  // 最終提示画面への遷移
  const handleShowFinalReview = () => {
    setCurrentPage('final-review')
  }

  // 施設の並び替え
  const handleReorderFacility = useCallback(
    (id: number, direction: 'up' | 'down') => {
      const idx = facilities.findIndex(f => f.id === id)
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= facilities.length) return
      // swap by updating both
      const swapFacility = facilities[swapIdx]
      updateFacility(id, {sortOrder: swapIdx})
      updateFacility(swapFacility.id, {sortOrder: idx})
    },
    [facilities, updateFacility]
  )

  // 現在の訪問計画に紐づく診察一覧
  const currentExaminations = selectedVisitPlan ? getExaminationsByVisitPlan(selectedVisitPlan.id) : []

  // 現在の施設
  const currentFacility = selectedVisitPlan ? facilities.find(f => f.id === selectedVisitPlan.facilityId) : null

  // 現在の患者
  const currentPatient = selectedExamination ? patients.find(p => p.id === selectedExamination.patientId) : null

  // 患者詳細用
  const detailPatient = selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null
  const detailFacility = detailPatient ? facilities.find(f => f.id === detailPatient.facilityId) : undefined

  // ページコンテンツのレンダリング
  const renderContent = () => {
    // 文書作成画面
    if (currentPage === 'document-create' && documentType && documentData) {
      return (
        <DocumentCreatePage
          documentType={documentType}
          documentData={documentData as Record<string, unknown>}
          onBack={handleBackFromDocument}
          onSave={savedDoc => {
            addDocument({
              patientId: (savedDoc as Record<string, unknown>).patientId as number || currentPatient?.id || 0,
              examinationId: (savedDoc as Record<string, unknown>).examinationId as number || selectedExamination?.id || 0,
              templateId: documentType,
              templateName: DOCUMENT_TEMPLATES[documentType]?.name || documentType,
              version: 1,
            })
          }}
        />
      )
    }

    // 最終提示画面
    if (currentPage === 'final-review' && selectedExamination) {
      return (
        <FinalReviewPage
          examination={selectedExamination}
          patient={currentPatient!}
          facility={currentFacility || undefined}
          staff={staff}
          clinic={clinic}
          visitDate={selectedVisitPlan?.visitDate}
          onBack={() => setCurrentPage('consultation')}
          onBackToSchedule={() => handleNavigate('schedule')}
        />
      )
    }

    // 診療画面
    if (currentPage === 'consultation' && selectedExamination && currentPatient) {
      return (
        <ConsultationPage
          examination={selectedExamination}
          patient={currentPatient}
          staff={staff}
          clinic={clinic}
          hasQualification={hasQualification}
          consultationMode={consultationMode as 'doctor' | 'dh'}
          allExaminations={examinations}
          visitDate={selectedVisitPlan?.visitDate || ''}
          onBack={handleBackFromConsultation}
          onUpdate={updateExamination}
          onOpenDocument={handleOpenDocument}
          onShowFinalReview={handleShowFinalReview}
        />
      )
    }

    // 訪問計画詳細画面
    if (currentPage === 'visit-detail' && selectedVisitPlan && currentFacility) {
      return (
        <VisitPlanDetailPage
          visitPlan={selectedVisitPlan}
          facility={currentFacility}
          patients={patients}
          examinations={currentExaminations}
          staff={staff}
          onBack={() => handleNavigate('schedule')}
          onAddExamination={addExamination}
          onUpdateExamination={updateExamination}
          onRemoveExamination={removeExamination}
          onReorderExaminations={reorderExaminations}
          onStartConsultation={handleStartConsultation}
        />
      )
    }

    // 患者編集画面
    if (currentPage === 'patient-edit' && detailPatient) {
      return (
        <PatientEditPage patient={detailPatient} onSave={handleSavePatient} onBack={() => setCurrentPage('patient-detail')} />
      )
    }

    // 患者詳細画面
    if (currentPage === 'patient-detail' && detailPatient) {
      return (
        <PatientDetailPage
          patient={detailPatient}
          facility={detailFacility}
          examinations={examinations}
          scoringHistory={scoringHistory}
          documents={documents}
          onBack={() => handleNavigate('admin-patients')}
          onEdit={() => handleEditPatient(detailPatient.id)}
        />
      )
    }

    // その他のページ
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} visitPlans={visitPlans} examinations={examinations} />
      case 'schedule':
        return (
          <SchedulePage
            facilities={facilities}
            visitPlans={visitPlans}
            onAddPlan={addVisitPlan}
            onSelectPlan={handleSelectVisitPlan}
          />
        )
      case 'individual-input':
        return (
          <IndividualInputPage
            facilities={facilities}
            patients={patients}
            staff={staff}
            onStartConsultation={handleIndividualStart}
          />
        )
      case 'admin-clinic':
        return <ClinicSettingsPage clinic={clinic} onUpdateClinic={updateClinic} onUpdateQualification={updateQualification} />
      case 'admin-facilities':
        return (
          <FacilityMasterPage
            facilities={facilities}
            onAdd={addFacility}
            onUpdate={updateFacility}
            onDelete={deleteFacility}
            onReorder={handleReorderFacility}
          />
        )
      case 'admin-patients':
        return (
          <PatientMasterPage
            facilities={facilities}
            patients={patients}
            onAdd={addPatient}
            onUpdate={updatePatient}
            onDelete={deletePatient}
            onSelectPatient={handleSelectPatient}
            onEditPatient={handleEditPatient}
          />
        )
      case 'admin-staff':
        return (
          <StaffMasterPage
            staff={staff}
            onAdd={addStaff}
            onUpdate={updateStaff}
            onDelete={deleteStaff}
            onReorder={reorderStaff}
          />
        )
      case 'admin-templates':
        return <TemplateMasterPage />
      case 'facility-portal':
        return <FacilityPortalPage facility={facilities[0]} patients={patients} onUpdatePatient={updatePatient} />
      case 'scoring-reference':
        return <ScoringReferencePage />
      case 'scoring-ledger':
        return <ScoringLedgerPage patients={patients} facilities={facilities} scoringHistory={scoringHistory} />
      case 'document-list':
        return <DocumentListPage documents={documents} patients={patients} />
      case 'batch-print':
        return (
          <BatchPrintPage
            facilities={facilities}
            examinations={examinations}
            patients={patients}
            visitPlans={visitPlans}
            documents={documents}
          />
        )
      case 'summary':
        return (
          <SummaryPage
            visitPlans={visitPlans}
            examinations={examinations}
            patients={patients}
            facilities={facilities}
            documents={documents}
          />
        )
      default:
        return <DashboardPage onNavigate={handleNavigate} visitPlans={visitPlans} examinations={examinations} />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  )
}
