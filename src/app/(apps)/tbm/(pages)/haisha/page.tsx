import HaishaTable from '@app/(apps)/tbm/(pages)/haisha/components/HaishaTable'
import { Days } from '@cm/class/Days/Days'
import { getMidnight } from '@cm/class/Days/date-utils/calculations'
import Redirector from '@cm/components/utils/Redirector'

import { dateSwitcherTemplate } from '@cm/lib/methods/redirect-method'
import prisma from 'src/lib/prisma'

import { initServerComopnent } from 'src/non-common/serverSideFunction'

export default async function Page(props) {
  const query = await props.searchParams
  const { session, scopes } = await initServerComopnent({ query })
  const { tbmBaseId } = scopes.getTbmScopes()

  const { firstDayOfMonth, lastDayOfMonth } = Days.month.getMonthDatum(new Date())
  const { redirectPath, whereQuery } = await dateSwitcherTemplate({
    query,
    defaultWhere: {
      mode: 'ROUTE',
      from: firstDayOfMonth,
      to: lastDayOfMonth,
    },
  })
  if (redirectPath) {
    return <Redirector {...{ redirectPath }} />
  }

  const today = whereQuery?.gte ?? getMidnight()

  const currentMonthData = Days.month.getMonthDatum(today)

  const tbmBase = await prisma.tbmBase.findUnique({ where: { id: tbmBaseId } })



  return (
    <div className="print-target ">
      <HaishaTable {...{ tbmBase, days: currentMonthData.days, whereQuery }} />
    </div>
  )
}
