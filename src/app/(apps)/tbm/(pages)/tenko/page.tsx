'use client'

import TenkoPaperHeader from '@app/(apps)/tbm/(pages)/tenko/TenkoPaperHeader'
import TenkoPaperBody from '@app/(apps)/tbm/(pages)/tenko/TenkoPaperBody'
import { TimeHandler } from '@app/(apps)/tbm/(class)/TimeHandler'
import { toUtc } from '@cm/class/Days/date-utils/calculations'

import { Button } from '@cm/components/styles/common-components/Button'
import { C_Stack } from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import { TbmDriveSchedule, TbmRouteGroup, TbmVehicle, User } from '@prisma/generated/prisma/client'
import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { cn } from '@cm/shadcn/lib/utils'

export default function TenkoPage(props) {
  const { query } = useGlobal()

  const printRef = useRef<any>(null)

  const prinfFunc = useReactToPrint({
    contentRef: printRef,
    pageStyle: '@page {size:A3 landscape;margin: 10mm;}', // A3横サイズに変更
    suppressErrors: true,
  })

  const date = toUtc(query.date || query.month)
  const tbmBaseId = Number(query.tbmBaseId)

  const { data = [] } = useDoStandardPrisma(`tbmDriveSchedule`, `findMany`, {
    where: { date: date, tbmBaseId },
    include: { User: {}, TbmVehicle: {}, TbmRouteGroup: {} },
  })

  const drives: (TbmDriveSchedule & {
    User: User
    TbmVehicle: TbmVehicle
    TbmRouteGroup: TbmRouteGroup
  })[] = data

  // 出発時刻順にソート（24時間超え対応）
  const OrderByPickUpTime = drives.sort((a, b) => {
    // まずドライバーの社員コード順
    const userCodeCompare = (a.User?.code || '').localeCompare(b.User?.code || '')
    // if (userCodeCompare !== 0) return userCodeCompare

    // 同じドライバーの場合は出発時刻順
    return TimeHandler.compareTimeStrings(
      a.TbmRouteGroup.departureTime || a.TbmRouteGroup.pickupTime,
      b.TbmRouteGroup.departureTime || b.TbmRouteGroup.pickupTime
    )
  })

  // A3横サイズに対応したレイアウト
  const wrapperStyle = {
    width: 1800, // A3横幅に合わせて拡大
    minWidth: 1800,
    maxWidth: 1800,
    margin: 'auto',
    padding: 10,
  }

  const tableStyle = {
    width: wrapperStyle.width - 80,
    minWidth: wrapperStyle.width - 80,
    maxWidth: wrapperStyle.width - 80,
    margin: 'auto',
  }

  return (
    <div>
      <div className={`p-2`}>
        <Button color="red" onClick={() => prinfFunc()}>
          印刷
        </Button>
        <div className={cn(` w-fit mx-auto `)}>
          <div style={wrapperStyle} ref={printRef}>
            <C_Stack className={`mx-auto text-xs print-target gap-0.5 p-1`}>
              {/* ヘッダー */}
              <>
                <div>
                  <TenkoPaperHeader {...{ date, tableStyle }} />
                </div>
                <div className={'[&_*]:border-gray-700 '}>
                  <TenkoPaperBody {...{ OrderByPickUpTime, tableStyle }} />
                </div>
              </>
            </C_Stack>
          </div>
        </div>
      </div>
    </div>
  )
}
