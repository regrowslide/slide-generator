import {getDentalExamination} from '@app/(apps)/dental/_actions/examination-actions'
import {getDentalPatients} from '@app/(apps)/dental/_actions/patient-actions'
import {getUserDentalClinic} from '@app/(apps)/dental/_actions/clinic-actions'
import {getDentalFacilities} from '@app/(apps)/dental/_actions/facility-actions'
import {getUserClinicId} from '@app/(apps)/dental/lib/get-user-clinic'
import {toPatient, toExamination, toClinic, toFacility} from '@app/(apps)/dental/lib/types'
import type {Examination, Patient} from '@app/(apps)/dental/lib/types'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import DocumentCreateClient from './DocumentCreateClient'

type Props = {
  searchParams: Promise<{examinationId?: string; templateId?: string}>
}

export default async function Page(props: Props) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  const clinicId = (await getUserClinicId(session.id)) ?? 0

  const examinationId = query.examinationId ? Number(query.examinationId) : null
  const templateId = query.templateId || ''

  const [clinicRaw, rawFacilities] = await Promise.all([
    getUserDentalClinic(session.id),
    getDentalFacilities({dentalClinicId: clinicId}),
  ])

  let examination: Examination | null = null
  let patient: Patient | null = null
  if (examinationId) {
    const rawExam = await getDentalExamination(examinationId)
    if (rawExam) {
      examination = toExamination(rawExam)
      const rawPatients = await getDentalPatients({where: {id: rawExam.dentalPatientId}})
      if (rawPatients[0]) {
        patient = toPatient(rawPatients[0])
      }
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
      initialTemplateId={templateId}
    />
  )
}
