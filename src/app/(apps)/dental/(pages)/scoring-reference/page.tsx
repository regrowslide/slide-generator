import {initServerComopnent} from 'src/non-common/serverSideFunction'
import ScoringReferenceClient from './ScoringReferenceClient'

export default async function Page(props: {searchParams: Promise<Record<string, string>>}) {
  const query = await props.searchParams
  await initServerComopnent({query})

  return <ScoringReferenceClient />
}
