import { redirect } from 'next/navigation'
import { getDentalVisitPlan } from '@app/(apps)/dental/_actions/visit-plan-actions'
import { getDentalStaffList } from '@app/(apps)/dental/_actions/staff-actions'
import { getUserDentalClinic } from '@app/(apps)/dental/_actions/clinic-actions'
import { getDentalPatients } from '@app/(apps)/dental/_actions/patient-actions'
import { toExamination, toFacility, toPatient, toStaff, toClinic } from '@app/(apps)/dental/lib/types'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import FinalReviewClient from './FinalReviewClient'

type Props = {
  searchParams: Promise<{ visitPlanId?: string }>
}

export default async function Page(props: Props) {
  const query = await props.searchParams
  const { session } = await initServerComopnent({ query })

  const visitPlanId = Number(query.visitPlanId)
  if (!visitPlanId) redirect('/dental/schedule')

  const visitPlan = await getDentalVisitPlan(visitPlanId)
  if (!visitPlan) redirect('/dental/schedule')

  const facility = visitPlan.DentalFacility ? toFacility(visitPlan.DentalFacility) : null
  const examinations = (visitPlan.DentalExamination || []).map(toExamination)
  const visitDate = visitPlan.visitDate.toISOString().split('T')[0]

  const rawPatients = await getDentalPatients({ where: { dentalFacilityId: visitPlan.dentalFacilityId } })
  const patients = rawPatients.map(toPatient)

  const clinicRaw = await getUserDentalClinic(session?.id)
  const clinicId = clinicRaw?.id ?? 0

  const rawStaff = await getDentalStaffList({ dentalClinicId: clinicId })
  const staffList = rawStaff.map(toStaff)
  const clinic = clinicRaw ? toClinic(clinicRaw) : null

  return (
    <FinalReviewClient
      visitPlanId={visitPlanId}
      visitDate={visitDate}
      facility={facility}
      examinations={examinations}
      patients={patients}
      staff={staffList}
      clinic={clinic}
    />
  )
}
