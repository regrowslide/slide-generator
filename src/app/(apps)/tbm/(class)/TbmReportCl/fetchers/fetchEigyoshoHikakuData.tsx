'use server'

import { MEIAI_SUM_ORIGIN } from '@app/(apps)/tbm/(lib)/calculation'
import { fetchUnkoMeisaiData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { tbmTableKeyValue } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { TbmBase, TbmCustomer } from '@prisma/generated/prisma/client'
import { unkoMeisaiKey } from '@app/(apps)/tbm/(class)/TbmReportCl/cols/createUnkoMeisaiRow'
import prisma from 'src/lib/prisma'

export type CustomerSalesKey = 'code' | 'customerName' | 'postalFee' | 'generalFee' | 'driverFee' | 'totalSales'

export type CustomerSalesRecord = {
  customer: TbmCustomer | null
  keyValue: {
    [key in CustomerSalesKey]: tbmTableKeyValue
  }
}

export type EigyoshoHikakuData = {
  tbmBase: TbmBase
  customerSalesRecords: CustomerSalesRecord[]
  grandTotal: {
    postalFee: number
    generalFee: number
    driverFee: number
    totalSales: number
  }
}

export const fetchEigyoshoHikakuData = async ({
  firstDayOfMonth,
  whereQuery,
}: {
  firstDayOfMonth: Date | undefined
  whereQuery: { gte?: Date | undefined; lte?: Date | undefined }
}): Promise<EigyoshoHikakuData[]> => {
  // すべての営業所を取得（テスト営業所を除外）
  const allTbmBases = await prisma.tbmBase.findMany({
    orderBy: { code: 'asc' },
    where: { name: { not: 'テスト営業所' } },
  })

  // 各営業所ごとにデータを取得・集計
  const eigyoshoHikakuDataList = await Promise.all(
    allTbmBases.map(async (tbmBase) => {
      const { monthlyTbmDriveList } = await fetchUnkoMeisaiData({
        firstDayOfMonth,
        whereQuery,
        tbmBaseId: tbmBase.id,
        userId: undefined,
      })

      // 荷主ごとにグループ化
      const customerMap = new Map<number, typeof monthlyTbmDriveList>()

      monthlyTbmDriveList.forEach((row) => {
        const { schedule } = row
        const customerId = schedule.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.tbmCustomerId

        if (customerId) {
          if (!customerMap.has(customerId)) {
            customerMap.set(customerId, [])
          }
          customerMap.get(customerId)!.push(row)
        }
      })

      // 荷主別に集計
      const widthBase = 120

      const customerSalesRecords: CustomerSalesRecord[] = Array.from(customerMap.entries()).map(
        ([customerId, schedules]) => {
          const customer =
            schedules[0]?.schedule.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer ?? null

          const MEIAI_SUM = (dataKey: unkoMeisaiKey) => MEIAI_SUM_ORIGIN(schedules, dataKey)

          const postalFee = MEIAI_SUM('L_postalFee')
          const generalFee = MEIAI_SUM('N_generalFee')
          const driverFee = MEIAI_SUM('Q_driverFee') + MEIAI_SUM('Q_futaiFee')
          const totalSales = postalFee + generalFee + driverFee

          return {
            customer,
            keyValue: {
              code: {
                label: 'コード',
                cellValue: customer?.code ?? '',
                style: { fontSize: 12, minWidth: 80 },
              },
              customerName: {
                label: '荷主名',
                cellValue: customer?.name ?? '',
                style: { fontSize: 12, minWidth: 150 },
              },
              postalFee: {
                label: '通行料（郵便）',
                cellValue: postalFee,
                style: { fontSize: 12, minWidth: widthBase },
              },
              generalFee: {
                label: '通行料（一般）',
                cellValue: generalFee,
                style: { fontSize: 12, minWidth: widthBase },
              },
              driverFee: {
                label: '運賃',
                cellValue: driverFee,
                style: { fontSize: 12, minWidth: widthBase },
              },
              totalSales: {
                label: '請求額合計',
                cellValue: totalSales,
                style: { fontSize: 12, minWidth: widthBase },
              },
            },
          }
        }
      )

      // かな > コードの昇順でソート
      customerSalesRecords.sort((a, b) => {
        const kanaA = a.customer?.kana ?? ''
        const kanaB = b.customer?.kana ?? ''
        const codeA = a.customer?.code ?? ''
        const codeB = b.customer?.code ?? ''

        const kanaCompare = kanaA.localeCompare(kanaB, 'ja')
        if (kanaCompare !== 0) {
          return kanaCompare
        }

        return codeA.localeCompare(codeB, 'ja')
      })

      // 総合計を計算
      const grandTotal = customerSalesRecords.reduce(
        (acc, record) => {
          return {
            postalFee: acc.postalFee + (Number(record.keyValue.postalFee.cellValue) || 0),
            generalFee: acc.generalFee + (Number(record.keyValue.generalFee.cellValue) || 0),
            driverFee: acc.driverFee + (Number(record.keyValue.driverFee.cellValue) || 0),
            totalSales: acc.totalSales + (Number(record.keyValue.totalSales.cellValue) || 0),
          }
        },
        { postalFee: 0, generalFee: 0, driverFee: 0, totalSales: 0 }
      )

      return {
        tbmBase,
        customerSalesRecords,
        grandTotal,
      }
    })
  )

  return eigyoshoHikakuDataList
}





