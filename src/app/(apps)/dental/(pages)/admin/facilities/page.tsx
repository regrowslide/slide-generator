import {getUserClinicId} from '@app/(apps)/dental/lib/get-user-clinic'
import {getDentalFacilities} from '@app/(apps)/dental/_actions/facility-actions'
import {toFacility} from '@app/(apps)/dental/lib/types'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import FacilityMasterClient from './FacilityMasterClient'

export default async function Page(props: {searchParams: Promise<Record<string, string>>}) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  const clinicId = (await getUserClinicId(session.id)) ?? 0

  const facilitiesRaw = await getDentalFacilities({dentalClinicId: clinicId})
  const facilities = facilitiesRaw.map(toFacility)

  return <FacilityMasterClient facilities={facilities} clinicId={clinicId} />
}
