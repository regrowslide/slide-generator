import {getDentalScoringHistories} from '@app/(apps)/dental/_actions/scoring-history-actions'
import {getDentalPatients} from '@app/(apps)/dental/_actions/patient-actions'
import {getUserClinicId} from '@app/(apps)/dental/lib/get-user-clinic'
import {toPatient, toScoringHistory} from '@app/(apps)/dental/lib/types'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import ScoringLedgerClient from './ScoringLedgerClient'

export default async function Page(props: {searchParams: Promise<Record<string, string>>}) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})
  const clinicId = (await getUserClinicId(session.id)) ?? 0

  const [rawHistories, rawPatients] = await Promise.all([
    getDentalScoringHistories({dentalClinicId: clinicId}),
    getDentalPatients({dentalClinicId: clinicId}),
  ])

  const histories = rawHistories.map(toScoringHistory)
  const patients = rawPatients.map(toPatient)

  return <ScoringLedgerClient histories={histories} patients={patients} />
}
