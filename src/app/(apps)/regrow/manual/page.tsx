import { initServerComopnent } from 'src/non-common/serverSideFunction'
import RegrowManualClient from './RegrowManualClient'

export default async function RegrowManualPage(props: { searchParams: Promise<any> }) {
  const query = await props.searchParams
  await initServerComopnent({ query })

  return <RegrowManualClient />
}
