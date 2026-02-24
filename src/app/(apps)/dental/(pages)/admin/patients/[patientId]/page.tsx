import {getDentalPatient} from '@app/(apps)/dental/_actions/patient-actions'
import {getDentalFacilities} from '@app/(apps)/dental/_actions/facility-actions'
import {getDentalExaminations} from '@app/(apps)/dental/_actions/examination-actions'
import {getUserClinicId} from '@app/(apps)/dental/lib/get-user-clinic'
import {toPatient, toFacility, toExamination} from '@app/(apps)/dental/lib/types'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {redirect} from 'next/navigation'
import PatientDetailClient from './PatientDetailClient'

type PageProps = {
  params: Promise<{patientId: string}>
  searchParams: Promise<Record<string, string>>
}

export default async function Page(props: PageProps) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  const clinicId = (await getUserClinicId(session.id)) ?? 0

  const {patientId} = await props.params
  const id = Number(patientId)
  if (isNaN(id)) redirect('/dental/admin/patients')

  const [patientRaw, facilitiesRaw, examinationsRaw] = await Promise.all([
    getDentalPatient(id),
    getDentalFacilities({dentalClinicId: clinicId}),
    getDentalExaminations({where: {dentalPatientId: id}}),
  ])

  if (!patientRaw) redirect('/dental/admin/patients')

  const patient = toPatient(patientRaw)
  const facilities = facilitiesRaw.map(toFacility)
  const facility = facilities.find(f => f.id === patient.facilityId)
  const examinations = examinationsRaw.map(toExamination)

  return <PatientDetailClient patient={patient} facility={facility} examinations={examinations} />
}
