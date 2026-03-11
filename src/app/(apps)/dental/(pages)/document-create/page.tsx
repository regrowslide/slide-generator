import { redirect } from 'next/navigation'
import { getDentalExamination, getDentalExaminations } from '@app/(apps)/dental/_actions/examination-actions'
import { getDentalStaffList } from '@app/(apps)/dental/_actions/staff-actions'
import { getDentalScoringHistories } from '@app/(apps)/dental/_actions/scoring-history-actions'
import { getDentalPatients } from '@app/(apps)/dental/_actions/patient-actions'
import { getUserDentalClinic } from '@app/(apps)/dental/_actions/clinic-actions'
import { getDentalFacilities } from '@app/(apps)/dental/_actions/facility-actions'
import { getDentalSavedDocument, getSavedTemplateStatuses } from '@app/(apps)/dental/_actions/saved-document-actions'
import { getUserClinicId } from '@app/(apps)/dental/lib/get-user-clinic'
import { toPatient, toExamination, toClinic, toFacility, toStaff, toScoringHistory } from '@app/(apps)/dental/lib/types'
import type { Examination, Patient } from '@app/(apps)/dental/lib/types'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import DocumentCreateClient from './DocumentCreateClient'

type Props = {
  searchParams: Promise<{ examinationId?: string; templateId?: string; savedDocumentId?: string }>
}

export default async function Page(props: Props) {
  const query = await props.searchParams
  const { session } = await initServerComopnent({ query })
  const clinicId = (await getUserClinicId(session.id)) ?? 0

  const savedDocumentId = query.savedDocumentId ? Number(query.savedDocumentId) : null
  const examinationId = query.examinationId ? Number(query.examinationId) : null
  const templateId = query.templateId || ''



  // 新規作成モードの場合、examinationIdとtemplateIdが必須
  if (!savedDocumentId) {
    if (!examinationId) redirect('/dental/schedule')
    // if (!templateId) redirect('/dental/schedule')
  }

  const [clinicRaw, rawFacilities] = await Promise.all([
    getUserDentalClinic(session.id),
    getDentalFacilities({ dentalClinicId: clinicId }),
  ])

  let examination: Examination | null = null
  let patient: Patient | null = null
  let savedTemplateData: Record<string, unknown> | null = null
  let savedTemplateId = templateId

  // 保存済み文書の編集モード
  if (savedDocumentId) {
    const savedDoc = await getDentalSavedDocument(savedDocumentId)
    if (savedDoc) {
      savedTemplateId = savedDoc.templateId
      savedTemplateData = (savedDoc.templateData as Record<string, unknown>) || null

      const rawExam = await getDentalExamination(savedDoc.dentalExaminationId)
      if (rawExam) {
        examination = toExamination(rawExam)
        const rawPatients = await getDentalPatients({ where: { id: rawExam.dentalPatientId } })
        if (rawPatients[0]) patient = toPatient(rawPatients[0])
      }
    }
  } else if (examinationId) {
    const rawExam = await getDentalExamination(examinationId)
    if (rawExam) {
      examination = toExamination(rawExam)
      const rawPatients = await getDentalPatients({ where: { id: rawExam.dentalPatientId } })
      if (rawPatients[0]) patient = toPatient(rawPatients[0])
    }
  }

  const facilities = rawFacilities.map(toFacility)
  const clinicData = clinicRaw ? toClinic(clinicRaw) : null

  // ConsultationClient readOnly表示用の追加データ取得
  let staffList: ReturnType<typeof toStaff>[] = []
  let allExaminations: ReturnType<typeof toExamination>[] = []
  let scoringHistories: ReturnType<typeof toScoringHistory>[] = []
  let visitPlanId = 0
  let visitDate = ''

  if (examination) {
    const rawExam = examinationId
      ? await getDentalExamination(examinationId)
      : savedDocumentId
        ? await getDentalExamination(examination.id)
        : null

    if (rawExam) {
      visitPlanId = rawExam.dentalVisitPlanId
      visitDate = rawExam.DentalVisitPlan?.visitDate.toISOString().split('T')[0] || ''

      const [rawStaff, rawScoringHistories, rawAllExams] = await Promise.all([
        getDentalStaffList({ dentalClinicId: clinicId }),
        getDentalScoringHistories({ where: { dentalPatientId: rawExam.dentalPatientId } }),
        getDentalExaminations({ where: { dentalVisitPlanId: rawExam.dentalVisitPlanId } }),
      ])
      staffList = rawStaff.map(toStaff)
      scoringHistories = rawScoringHistories.map(toScoringHistory)
      allExaminations = rawAllExams.map(toExamination)
    }
  }

  // 保存済みテンプレートの状態取得
  const savedTemplateStatuses = examination ? await getSavedTemplateStatuses(examination.id) : []

  return (
    <DocumentCreateClient
      examination={examination}
      patient={patient}
      clinic={clinicData}
      facilities={facilities}
      initialTemplateId={savedTemplateId}
      savedDocumentId={savedDocumentId}
      savedTemplateData={savedTemplateData}
      staff={staffList}
      allExaminations={allExaminations}
      scoringHistories={scoringHistories}
      visitPlanId={visitPlanId}
      visitDate={visitDate}
      savedTemplateStatuses={savedTemplateStatuses}
    />
  )
}
