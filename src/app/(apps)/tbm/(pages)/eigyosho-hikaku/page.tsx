import { fetchEigyoshoHikakuData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchEigyoshoHikakuData'

import { C_Stack, FitMargin } from '@cm/components/styles/common-components/common-components'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'
import { dateSwitcherTemplate } from '@cm/lib/methods/redirect-method'

import { initServerComopnent } from 'src/non-common/serverSideFunction'
import EigyoshoHikakuClient from './EigyoshoHikakuClient'

export default async function Page(props) {
 const query = await props.searchParams
 const { session, scopes } = await initServerComopnent({ query })
 const { redirectPath, whereQuery } = await dateSwitcherTemplate({ query })

 if (redirectPath) return <Redirector {...{ redirectPath }} />

 const eigyoshoHikakuDataList = await fetchEigyoshoHikakuData({
  firstDayOfMonth: whereQuery.gte,
  whereQuery,
  tbmBaseId: undefined,
 })



 return (
  <FitMargin className={`p-4`}>
   <C_Stack>
    <div>
     <NewDateSwitcher {...{ monthOnly: true }} />
     <div className="mb-2 text-xs text-gray-600">
      <ul className="list-disc pl-4">
       <li>
        <b>営業所ごとの売上比較：</b>荷主ごとの請求額（通行料 + 運賃）を営業所別に表示
       </li>
       <li className="text-blue-600">
        <b>荷主行をクリック</b>すると運行明細が表示されます
       </li>
      </ul>
     </div>
    </div>

    <EigyoshoHikakuClient
     eigyoshoHikakuDataList={eigyoshoHikakuDataList}
     firstDayOfMonth={whereQuery.gte}
     whereQuery={whereQuery}
    />
   </C_Stack>
  </FitMargin>
 )
}

