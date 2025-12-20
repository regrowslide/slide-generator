import { getTbmBase_MonthConfig } from '@app/(apps)/tbm/(server-actions)/getBasics'
import { fetchRuisekiKyoriKichoData } from '@app/(apps)/tbm/(server-actions)/fetchRuisekiKyoriKichoData'
import { getMidnight } from '@cm/class/Days/date-utils/calculations'
import { FitMargin, R_Stack } from '@cm/components/styles/common-components/common-components'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import EmptyPlaceholder from '@cm/components/utils/loader/EmptyPlaceHolder'
import Redirector from '@cm/components/utils/Redirector'
import { dateSwitcherTemplate } from '@cm/lib/methods/redirect-method'
import UserCarTable from './components/UserCarTable'

import { initServerComopnent } from 'src/non-common/serverSideFunction'
import { Card } from '@cm/shadcn/ui/card'

export default async function Page(props) {
  const query = await props.searchParams
  const { session, scopes } = await initServerComopnent({ query })
  const { tbmBaseId } = scopes.getTbmScopes()
  const { redirectPath, whereQuery } = await dateSwitcherTemplate({ query })
  if (redirectPath) return <Redirector {...{ redirectPath }} />

  const yearMonth = whereQuery.gte ?? getMidnight()

  const { TbmBase_MonthConfig } = await getTbmBase_MonthConfig({ yearMonth, tbmBaseId })

  const userListWithCarHistory = await fetchRuisekiKyoriKichoData({
    tbmBaseId,
    whereQuery,
    TbmBase_MonthConfig,
  })

  return (
    <FitMargin className={`pt-4`}>
      <NewDateSwitcher {...{ monthOnly: true }} />
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto w-fit`}>
        {userListWithCarHistory.map(data => {
          const { user, } = data
          const { id: userId } = user

          const allCars = data.allCars.filter(carData => {
            return carData.sokoKyoriInPeriod > 0 && carData.heikinNempiInPeriod
          })


          return (
            <Card key={userId} className={` w-[580px]`}>
              <R_Stack className={` justify-between`}>
                <h2>{user.name}</h2>
                <span className="text-sm text-gray-500">{user.code}</span>
              </R_Stack>
              {allCars.length > 0 ? (
                <UserCarTable allCars={allCars} whereQuery={whereQuery as { gte: Date; lte: Date }} />
              ) : (
                <EmptyPlaceholder>データがありません</EmptyPlaceholder>
              )}
            </Card>
          )
        })}
      </div>
    </FitMargin>
  )
}
