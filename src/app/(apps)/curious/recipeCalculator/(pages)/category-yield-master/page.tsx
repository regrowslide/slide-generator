import {CategoryYieldMaster} from '../../components/master/CategoryYieldMaster'
import {getCategoryYields} from '../../server-actions/category-yield-actions'
import {initServerComopnent} from 'src/non-common/serverSideFunction'

export default async function CategoryYieldMasterPage(props: {searchParams: Promise<Record<string, string>>}) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  const data = await getCategoryYields()

  return (
    <div className="max-w-4xl mx-auto">
      <CategoryYieldMaster initialData={data} />
    </div>
  )
}
