
import { getTbmBase_MonthConfig } from '@app/(apps)/tbm/(server-actions)/getBasics'
import { getNenpiDataByCar } from '@app/(apps)/tbm/(server-actions)/getNenpiDataByCar'
import { FitMargin } from '@cm/components/styles/common-components/common-components'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'
import { dateSwitcherTemplate } from '@cm/lib/methods/redirect-method'
import prisma from 'src/lib/prisma'

import { initServerComopnent } from 'src/non-common/serverSideFunction'
import React from 'react'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'
import VehicleCard from './components/VehicleCard'


export default async function Page(props) {
  const query = await props.searchParams
  const { session, scopes } = await initServerComopnent({ query })
  const { tbmBaseId } = scopes.getTbmScopes()
  const { redirectPath, whereQuery } = await dateSwitcherTemplate({ query })
  if (redirectPath) return <Redirector {...{ redirectPath }} />

  const { TbmBase_MonthConfig } = await getTbmBase_MonthConfig({ yearMonth: whereQuery.gte, tbmBaseId })
  const { nenpiKanriDataListByCar } = await getNenpiDataByCar({ tbmBaseId, whereQuery, TbmBase_MonthConfig })

  const vehicleList = await prisma.tbmVehicle.findMany({
    where: { tbmBaseId },
    orderBy: [{ code: 'asc' }, { id: 'asc' }],
    include: {
      TbmRefuelHistory: {
        where: { date: whereQuery },
        orderBy: [{ date: 'asc' }, { id: 'asc' }],
      },
    },
  })

  const lastRefuelHistoryByCar = await prisma.tbmVehicle.findMany({
    where: { tbmBaseId },
    orderBy: [{ code: 'asc' }, { id: 'asc' }],
    include: { TbmRefuelHistory: { where: { date: { lt: whereQuery.gte } } } },
  })

  return (
    <FitMargin className={`pt-4`}>
      <NewDateSwitcher {...{ monthOnly: true }} />
      <AutoGridContainer maxCols={{ lg: 2, '2xl': 3 }} className={`mx-auto w-fit gap-8`}>
        {vehicleList.map((vehicle, idx) => {
          const nenpiKanriData = nenpiKanriDataListByCar.find(data => data?.vehicle?.id === vehicle.id)

          const prevRefuelHistory = [
            ...lastRefuelHistoryByCar
              .filter(v => v.id === vehicle.id)
              .map(v => v.TbmRefuelHistory)
              .flat(),
          ]
          prevRefuelHistory.sort((a, b) => {
            const sortByodometer = b.odometer - a.odometer
            const sortByDate = b.date.getTime() - a.date.getTime()
            if (sortByodometer === 0) {
              return sortByDate
            }
            return sortByodometer
          })

          return (
            <VehicleCard
              key={idx}
              vehicle={vehicle}
              nenpiKanriData={nenpiKanriData}
              prevRefuelHistory={prevRefuelHistory}
              whereQuery={whereQuery}
            />
          )
        })}
      </AutoGridContainer>
    </FitMargin>
  )
}
