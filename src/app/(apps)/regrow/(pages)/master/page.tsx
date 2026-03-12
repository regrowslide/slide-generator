import { redirect } from 'next/navigation'
import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { getAllStores } from '../../_actions/store-actions'
import { getCurrentUserRgRole } from '../../_actions/staff-actions'
import RegrowMasterClient from './RegrowMasterClient'

export default async function RegrowMasterPage(props: { searchParams: Promise<any> }) {
  const query = await props.searchParams
  const { session } = await initServerComopnent({ query })

  const userId = session?.id ?? null


  const stores = await getAllStores()

  return <div className={`p-4`}><RegrowMasterClient stores={stores} /></div>
}
