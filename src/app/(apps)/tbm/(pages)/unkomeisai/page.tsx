import UnkoMeisaiCC from '@app/(apps)/tbm/(pages)/unkomeisai/UnkoMeisaiCC'

import { FitMargin } from '@cm/components/styles/common-components/common-components'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'
import { dateSwitcherTemplate } from '@cm/lib/methods/redirect-method'

import { initServerComopnent } from 'src/non-common/serverSideFunction'

import { fetchUnkoMeisaiData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import prisma from 'src/lib/prisma'


export default async function Page(props) {

  const query = await props.searchParams
  const { session, scopes } = await initServerComopnent({ query })
  const { tbmBaseId } = scopes.getTbmScopes()
  const { redirectPath, whereQuery } = await dateSwitcherTemplate({ query })

  // ページあたり表示件数をURLパラメータから取得（undefinedの場合は全件表示）
  const itemsPerPage = query.itemsPerPage ? parseInt(query.itemsPerPage as string) : 50

  // フィルターパラメータをURLから取得
  const tbmRouteGroupId = query.tbmRouteGroupId ? parseInt(query.tbmRouteGroupId as string) : undefined
  const userId = query.userId ? parseInt(query.userId as string) : undefined
  const tbmCustomerId = query.tbmCustomerId ? parseInt(query.tbmCustomerId as string) : undefined
  const tbmVehicleId = query.tbmVehicleId ? parseInt(query.tbmVehicleId as string) : undefined

  if (redirectPath) return <Redirector {...{ redirectPath }} />



  const { monthlyTbmDriveList, ConfigForMonth } = await fetchUnkoMeisaiData({
    firstDayOfMonth: whereQuery.gte,
    whereQuery,
    tbmBaseId,
    userId,
    tbmRouteGroupId,
    tbmCustomerId,
    tbmVehicleId,
  })




  // フィルター用のマスタデータを取得
  const [tbmRouteGroupList, userList, tbmCustomerList, tbmVehicleList, tbmBase] = await Promise.all([
    prisma.tbmRouteGroup.findMany({
      where: {
        OR: [
          { tbmBaseId },
          { TbmRouteGroupShare: { some: { tbmBaseId } } },
        ],
      },
      orderBy: { code: 'asc' },
      include: {
        Mid_TbmRouteGroup_TbmCustomer: { include: { TbmCustomer: true } },
      },
    }),
    prisma.user.findMany({
      where: { tbmBaseId },
      orderBy: { code: 'asc' },
    }),
    prisma.tbmCustomer.findMany({
      where: {},
      orderBy: { code: 'asc' },
    }),
    prisma.tbmVehicle.findMany({
      where: { tbmBaseId },
      orderBy: { vehicleNumber: 'asc' },
    }),
    prisma.tbmBase.findUnique({ where: { id: tbmBaseId } }),
  ])




  return (
    <FitMargin className={`pt-4`}>
      <NewDateSwitcher {...{ monthOnly: true }} />
      <UnkoMeisaiCC
        {...{
          monthlyTbmDriveList,
          tbmRouteGroupList,
          userList,
          tbmCustomerList,
          tbmVehicleList,
          tbmBase,
          whereQuery,
          itemsPerPage,
          currentFilters: {
            tbmRouteGroupId,
            userId,
            tbmCustomerId,
            tbmVehicleId,
          },
        }}
      />
    </FitMargin>
  )
}
