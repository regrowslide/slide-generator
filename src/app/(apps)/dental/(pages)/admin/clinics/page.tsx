import {getDentalClinicList} from '@app/(apps)/dental/_actions/clinic-actions'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {redirect} from 'next/navigation'
import ClinicListClient from './ClinicListClient'

export default async function Page(props: {searchParams: Promise<Record<string, string>>}) {
  const query = await props.searchParams
  const {scopes} = await initServerComopnent({query})
  const {isSystemAdmin} = scopes.getDentalScopes()

  if (!isSystemAdmin) redirect('/dental')

  const clinics = await getDentalClinicList()

  return <ClinicListClient clinics={clinics} />
}
