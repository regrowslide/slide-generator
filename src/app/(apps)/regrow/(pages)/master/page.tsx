import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {getStores} from '../../_actions/store-actions'
import {getStaffs} from '../../_actions/staff-actions'
import RegrowMasterClient from './RegrowMasterClient'

export default async function RegrowMasterPage(props: {searchParams: Promise<any>}) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  const stores = await getStores()
  const staffs = await getStaffs()

  return <RegrowMasterClient stores={stores} staffs={staffs} />
}
