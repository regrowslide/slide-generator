import {getDentalFacilities} from '@app/(apps)/dental/_actions/facility-actions'
import {getDentalVisitPlans} from '@app/(apps)/dental/_actions/visit-plan-actions'
import {getUserClinicId} from '@app/(apps)/dental/lib/get-user-clinic'
import {toFacility, toVisitPlan} from '@app/(apps)/dental/lib/types'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import ScheduleClient from './ScheduleClient'

export default async function Page(props: {searchParams: Promise<Record<string, string>>}) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  const clinicId = (await getUserClinicId(session.id)) ?? 0

  const [rawFacilities, rawVisitPlans] = await Promise.all([
    getDentalFacilities({dentalClinicId: clinicId}),
    getDentalVisitPlans({dentalClinicId: clinicId}),
  ])

  const facilities = rawFacilities.map(toFacility)
  const visitPlans = rawVisitPlans.map(v => ({
    ...toVisitPlan(v),
    facilityName: v.DentalFacility?.name || '',
  }))

  return <ScheduleClient facilities={facilities} visitPlans={visitPlans} clinicId={clinicId} />
}
