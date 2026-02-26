import {getDentalExamination} from '@app/(apps)/dental/_actions/examination-actions'
import {getDentalPatients} from '@app/(apps)/dental/_actions/patient-actions'
import {getUserDentalClinic} from '@app/(apps)/dental/_actions/clinic-actions'
import {getDentalFacilities} from '@app/(apps)/dental/_actions/facility-actions'
import {getDentalSavedDocument} from '@app/(apps)/dental/_actions/saved-document-actions'
import {getUserClinicId} from '@app/(apps)/dental/lib/get-user-clinic'
import {toPatient, toExamination, toClinic, toFacility} from '@app/(apps)/dental/lib/types'
import type {Examination, Patient} from '@app/(apps)/dental/lib/types'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import DocumentCreateClient from './DocumentCreateClient'

type Props = {
  searchParams: Promise<{examinationId?: string; templateId?: string; savedDocumentId?: string}>
}

export default async function Page(props: Props) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  const clinicId = (await getUserClinicId(session.id)) ?? 0

  const savedDocumentId = query.savedDocumentId ? Number(query.savedDocumentId) : null
  const examinationId = query.examinationId ? Number(query.examinationId) : null
  const templateId = query.templateId || ''

  const [clinicRaw, rawFacilities] = await Promise.all([
    getUserDentalClinic(session.id),
    getDentalFacilities({dentalClinicId: clinicId}),
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
        const rawPatients = await getDentalPatients({where: {id: rawExam.dentalPatientId}})
        if (rawPatients[0]) patient = toPatient(rawPatients[0])
      }
    }
  } else if (examinationId) {
    const rawExam = await getDentalExamination(examinationId)
    if (rawExam) {
      examination = toExamination(rawExam)
      const rawPatients = await getDentalPatients({where: {id: rawExam.dentalPatientId}})
      if (rawPatients[0]) patient = toPatient(rawPatients[0])
    }
  }

  const facilities = rawFacilities.map(toFacility)
  const clinicData = clinicRaw ? toClinic(clinicRaw) : null

  return (
    <DocumentCreateClient
      examination={examination}
      patient={patient}
      clinic={clinicData}
      facilities={facilities}
      initialTemplateId={savedTemplateId}
      savedDocumentId={savedDocumentId}
      savedTemplateData={savedTemplateData}
    />
  )
}
