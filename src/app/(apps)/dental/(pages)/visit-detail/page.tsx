import {redirect} from 'next/navigation'
import {getDentalVisitPlan} from '@app/(apps)/dental/_actions/visit-plan-actions'
import {getDentalPatients} from '@app/(apps)/dental/_actions/patient-actions'
import {getDentalStaffList} from '@app/(apps)/dental/_actions/staff-actions'
import {getUserClinicId} from '@app/(apps)/dental/lib/get-user-clinic'
import {getSavedTemplateStatuses, type SavedTemplateStatus} from '@app/(apps)/dental/_actions/saved-document-actions'
import {toFacility, toPatient, toStaff, toExamination} from '@app/(apps)/dental/lib/types'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import VisitDetailClient from './VisitDetailClient'

type Props = {
  searchParams: Promise<{visitPlanId?: string}>
}

export default async function Page(props: Props) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  const clinicId = (await getUserClinicId(session.id)) ?? 0

  const visitPlanId = Number(query.visitPlanId)
  if (!visitPlanId) redirect('/dental/schedule')

  const visitPlan = await getDentalVisitPlan(visitPlanId)
  if (!visitPlan) redirect('/dental/schedule')

  const facilityId = visitPlan.dentalFacilityId
  const facility = visitPlan.DentalFacility ? toFacility(visitPlan.DentalFacility) : null
  if (!facility) redirect('/dental/schedule')

  const [rawPatients, rawStaff] = await Promise.all([
    getDentalPatients({where: {dentalFacilityId: facilityId}}),
    getDentalStaffList({dentalClinicId: clinicId}),
  ])

  const patients = rawPatients.map(toPatient)
  const staffList = rawStaff.map(toStaff)
  const examinations = (visitPlan.DentalExamination || []).map(toExamination)

  // 各診察の保存済みテンプレート状態を取得
  const savedTemplateStatusesMap: Record<number, SavedTemplateStatus[]> = {}
  await Promise.all(
    examinations.map(async (exam) => {
      savedTemplateStatusesMap[exam.id] = await getSavedTemplateStatuses(exam.id)
    })
  )

  return (
    <VisitDetailClient
      visitPlanId={visitPlan.id}
      visitDate={visitPlan.visitDate.toISOString().split('T')[0]}
      facility={facility}
      patients={patients}
      examinations={examinations}
      staff={staffList}
      savedTemplateStatusesMap={savedTemplateStatusesMap}
    />
  )
}
