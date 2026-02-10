'use client'

import { EigyoshoHikakuData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchEigyoshoHikakuData'
import { cn } from '@cm/shadcn/lib/utils'
import EigyoshoCard from './components/EigyoshoCard'

type EigyoshoHikakuClientProps = {
  eigyoshoHikakuDataList: EigyoshoHikakuData[]
  firstDayOfMonth: Date | undefined
  whereQuery: { gte?: Date | undefined; lte?: Date | undefined }
}

export default function EigyoshoHikakuClient({
  eigyoshoHikakuDataList,
  firstDayOfMonth,
  whereQuery,
}: EigyoshoHikakuClientProps) {
  return (
    <div className={cn(' w-full items-start overflow-x-auto max-w-[95vw] mx-auto h-[85vh] grid grid-cols-2 gap-16')}>
      {eigyoshoHikakuDataList.map(data => (
        <EigyoshoCard key={data.tbmBase.id} data={data} firstDayOfMonth={firstDayOfMonth} whereQuery={whereQuery} />
      ))}
    </div>
  )
}
