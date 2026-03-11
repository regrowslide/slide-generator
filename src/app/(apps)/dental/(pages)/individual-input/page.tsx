import { getDentalFacilities } from '@app/(apps)/dental/_actions/facility-actions'
import { getDentalPatients } from '@app/(apps)/dental/_actions/patient-actions'
import { getDentalStaffList } from '@app/(apps)/dental/_actions/staff-actions'
import { getUserClinicId } from '@app/(apps)/dental/lib/get-user-clinic'
import { toFacility, toPatient, toStaff } from '@app/(apps)/dental/lib/types'
import { initServerComopnent } from 'src/non-common/serverSideFunction'


export default async function Page(props: { searchParams: Promise<Record<string, string>> }) {
  const query = await props.searchParams
  const { session } = await initServerComopnent({ query })
  const clinicId = (await getUserClinicId(session.id)) ?? 0

  const [rawFacilities, rawPatients, rawStaff] = await Promise.all([
    getDentalFacilities({ dentalClinicId: clinicId }),
    getDentalPatients({ dentalClinicId: clinicId }),
    getDentalStaffList({ dentalClinicId: clinicId }),
  ])

  const facilities = rawFacilities.map(toFacility)
  const patients = rawPatients.map(toPatient)
  const staffList = rawStaff.map(toStaff)

  return <div>個別入力</div>
  // return <IndividualInputClient facilities={facilities} patients={patients} staff={staffList} clinicId={clinicId} />
}
