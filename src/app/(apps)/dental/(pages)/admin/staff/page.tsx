import {getUserClinicId} from '@app/(apps)/dental/lib/get-user-clinic'
import {getDentalStaffList} from '@app/(apps)/dental/_actions/staff-actions'
import {toStaff} from '@app/(apps)/dental/lib/types'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import StaffMasterClient from './StaffMasterClient'

export default async function Page(props: {searchParams: Promise<Record<string, string>>}) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  const clinicId = (await getUserClinicId(session.id)) ?? 0

  const staffRaw = await getDentalStaffList({dentalClinicId: clinicId})
  const staff = staffRaw.map(toStaff)

  return <StaffMasterClient staff={staff} clinicId={clinicId} />
}
