import { initServerComopnent } from 'src/non-common/serverSideFunction'
import RegrowMockUnifiedNew from './RegrowMockUnifiedNew'

export default async function RegrowMockPage(props: { searchParams: Promise<any> }) {
  const query = await props.searchParams
  const { session } = await initServerComopnent({ query })

  return <RegrowMockUnifiedNew />
}
