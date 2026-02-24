import {getDentalPatient} from '@app/(apps)/dental/_actions/patient-actions'
import {toPatient} from '@app/(apps)/dental/lib/types'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {redirect} from 'next/navigation'
import PatientEditClient from './PatientEditClient'

type PageProps = {
  params: Promise<{patientId: string}>
  searchParams: Promise<Record<string, string>>
}

export default async function Page(props: PageProps) {
  const query = await props.searchParams
  await initServerComopnent({query})

  const {patientId} = await props.params
  const id = Number(patientId)
  if (isNaN(id)) redirect('/dental/admin/patients')

  const patientRaw = await getDentalPatient(id)
  if (!patientRaw) redirect('/dental/admin/patients')

  const patient = toPatient(patientRaw)

  return <PatientEditClient patient={patient} />
}
