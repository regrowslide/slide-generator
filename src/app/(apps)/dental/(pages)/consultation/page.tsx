import { redirect } from 'next/navigation'
import { getDentalExamination, getDentalExaminations, getPatientPastExaminations } from '@app/(apps)/dental/_actions/examination-actions'
import { getDentalStaffList } from '@app/(apps)/dental/_actions/staff-actions'
import { getUserDentalClinic } from '@app/(apps)/dental/_actions/clinic-actions'
import { getDentalScoringHistories } from '@app/(apps)/dental/_actions/scoring-history-actions'
import { getSavedTemplateStatuses } from '@app/(apps)/dental/_actions/saved-document-actions'
import { toExamination, toStaff, toClinic, toPatient, toFacility, toScoringHistory } from '@app/(apps)/dental/lib/types'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import ConsultationClient from './ConsultationClient'

type Props = {
  searchParams: Promise<{ examinationId?: string; mode?: string }>
}

export default async function Page(props: Props) {
  const query = await props.searchParams
  const { session } = await initServerComopnent({ query })

  const examinationId = Number(query.examinationId)
  if (!examinationId) redirect('/dental/schedule')

  const rawExam = await getDentalExamination(examinationId)
  if (!rawExam) redirect('/dental/schedule')

  const examination = toExamination(rawExam)
  const patient = rawExam.DentalPatient ? toPatient(rawExam.DentalPatient) : null
  if (!patient) redirect('/dental/schedule')

  const facility = rawExam.DentalVisitPlan?.DentalFacility
    ? toFacility(rawExam.DentalVisitPlan.DentalFacility)
    : null

  const visitDate = rawExam.DentalVisitPlan?.visitDate.toISOString().split('T')[0] || ''

  const clinicRaw = await getUserDentalClinic(session?.id)
  const clinicId = clinicRaw?.id ?? 0

  const [rawStaff, rawScoringHistories, rawAllExams, rawPastExams, savedTemplateStatuses] = await Promise.all([
    getDentalStaffList({ dentalClinicId: clinicId }),
    getDentalScoringHistories({ where: { dentalPatientId: patient.id } }),
    getDentalExaminations({ where: { dentalVisitPlanId: rawExam.dentalVisitPlanId } }),
    getPatientPastExaminations(patient.id, examinationId),
    getSavedTemplateStatuses(examinationId),
  ])

  const staffList = rawStaff.map(toStaff)
  const clinic = clinicRaw ? toClinic(clinicRaw) : null
  if (!clinic) redirect('/dental/schedule')

  const scoringHistories = rawScoringHistories.map(toScoringHistory)
  const allExaminations = rawAllExams.map(toExamination)
  const pastExaminations = rawPastExams.map(toExamination)

  const consultationMode = (query.mode === 'dh' ? 'dh' : 'doctor') as 'doctor' | 'dh'

  return (
    <ConsultationClient
      examination={examination}
      patient={patient}
      staff={staffList}
      clinic={clinic}
      visitDate={visitDate}
      consultationMode={consultationMode}
      allExaminations={allExaminations}
      scoringHistories={scoringHistories}
      visitPlanId={rawExam.dentalVisitPlanId}
      pastExaminations={pastExaminations}
      savedTemplateStatuses={savedTemplateStatuses}
    />
  )
}
