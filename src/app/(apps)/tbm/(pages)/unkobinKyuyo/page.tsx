import UnkoBinKyuyoCC from '@app/(apps)/tbm/(pages)/unkobinKyuyo/UnkoBinKyuyoCC'

import { FitMargin } from '@cm/components/styles/common-components/common-components'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'
import { dateSwitcherTemplate } from '@cm/lib/methods/redirect-method'

import { initServerComopnent } from 'src/non-common/serverSideFunction'

import { fetchUnkoBinKyuyoData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoBinKyuyoData'
import prisma from 'src/lib/prisma'

export default async function Page(props) {
  const query = await props.searchParams
  const { session, scopes } = await initServerComopnent({ query })
  const { tbmBaseId } = scopes.getTbmScopes()
  const { redirectPath, whereQuery } = await dateSwitcherTemplate({ query })

  if (redirectPath) return <Redirector {...{ redirectPath }} />

  const { unkoBinKyuyoList, userList, routeGroupList, vehicleList } = await fetchUnkoBinKyuyoData({
    firstDayOfMonth: whereQuery.gte,
    whereQuery,
    tbmBaseId,
    userId: undefined,
  })

  // 営業所情報を取得
  const tbmBase = await prisma.tbmBase.findUnique({ where: { id: tbmBaseId } })

  return (
    <FitMargin className={`pt-4`}>
      <NewDateSwitcher {...{ monthOnly: true }} />
      <UnkoBinKyuyoCC
        {...{
          unkoBinKyuyoList,
          userList,
          routeGroupList,
          vehicleList,
          tbmBase,
          whereQuery,
        }}
      />
    </FitMargin>
  )
}
