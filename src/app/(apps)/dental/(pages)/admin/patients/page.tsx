import {getDentalFacilities} from '@app/(apps)/dental/_actions/facility-actions'
import {getDentalPatients} from '@app/(apps)/dental/_actions/patient-actions'
import {getUserClinicId} from '@app/(apps)/dental/lib/get-user-clinic'
import {toFacility, toPatient} from '@app/(apps)/dental/lib/types'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import PatientMasterClient from './PatientMasterClient'

export default async function Page(props: {searchParams: Promise<Record<string, string>>}) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  const clinicId = (await getUserClinicId(session.id)) ?? 0

  const [facilitiesRaw, patientsRaw] = await Promise.all([
    getDentalFacilities({dentalClinicId: clinicId}),
    getDentalPatients({dentalClinicId: clinicId}),
  ])

  const facilities = facilitiesRaw.map(toFacility)
  const patients = patientsRaw.map(toPatient)

  return <PatientMasterClient facilities={facilities} patients={patients} />
}
