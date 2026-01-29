import {redirect} from 'next/navigation'
import {ProfitMarginMaster} from '../../components/master/ProfitMarginMaster'
import {getProfitMarginStandards} from '../../server-actions/profit-margin-actions'
import {initServerComopnent} from 'src/non-common/serverSideFunction'

export default async function ProfitMarginMasterPage(props: {searchParams: Promise<Record<string, string>>}) {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  // 管理者権限チェック（roleがadminでない場合はリダイレクト）
  if (session?.role !== 'admin') {
    redirect('/curious/recipeCalculator/calculator')
  }

  const standards = await getProfitMarginStandards()

  return (
    <div className="max-w-4xl mx-auto">
      <ProfitMarginMaster initialStandards={standards} />
    </div>
  )
}
