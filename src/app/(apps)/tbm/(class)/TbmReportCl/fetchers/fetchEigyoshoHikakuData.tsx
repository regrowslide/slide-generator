'use server'

import { calculateSalesBySchedules } from '@app/(apps)/tbm/(lib)/calculation'
import { getDriveScheduleList } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { tbmTableKeyValue } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { TbmBase, TbmCustomer } from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'
import { Days } from '@cm/class/Days/Days'
import { BillingHandler } from '@app/(apps)/tbm/(class)/TimeHandler'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { toUtc } from '@cm/class/Days/date-utils/calculations'

export type CustomerSalesKey = 'code' | 'customerName' | 'postalFee' | 'generalFee' | 'driverFee' | 'totalExclTax' | 'taxAmount' | 'grandTotal'

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
    totalExclTax: number
    taxAmount: number
    grandTotal: number
  }
}

export const fetchEigyoshoHikakuData = async ({
  firstDayOfMonth,
  whereQuery,
  tbmBaseId,
}: {
  firstDayOfMonth: Date | undefined
  whereQuery: { gte?: Date | undefined; lte?: Date | undefined }
  tbmBaseId: number | undefined
}): Promise<EigyoshoHikakuData[]> => {
  // すべての営業所を取得（テスト営業所を除外）
  const allTbmBases = await prisma.tbmBase.findMany({
    orderBy: { code: 'asc' },
    where: { name: { not: 'テスト営業所' } },
  })





  // 各営業所ごとにデータを取得・集計
  const eigyoshoHikakuDataList = await Promise.all(
    allTbmBases.map(async (tbmBase) => {
      // getDriveScheduleList を直接使用（請求書ページと同じロジック）
      // 月末日跨ぎ運行対応のため、前日も含めて取得
      const allSchedules = await getDriveScheduleList({
        firstDayOfMonth,
        whereQuery: {
          ...whereQuery,
          gte: whereQuery.gte ? Days.day.subtract(whereQuery.gte, 1) : undefined,
        },
        tbmBaseId: tbmBase.id,
        userId: undefined,
      })

      // getBillingMonth() でフィルタリング（請求書ページと同じロジック）
      const targetMonth = firstDayOfMonth
        ? toUtc(new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 1))
        : null

      const filteredSchedules = targetMonth
        ? allSchedules.filter((schedule) => {
          const billingMonth = BillingHandler.getBillingMonth(
            targetMonth,
            schedule.date,
            schedule.TbmRouteGroup.departureTime,
            schedule.TbmRouteGroup.id
          )
          return formatDate(billingMonth, 'YYYYMM') === formatDate(targetMonth, 'YYYYMM')
        })
        : allSchedules

      // 荷主ごとにグループ化
      const customerMap = new Map<number, typeof filteredSchedules>()

      filteredSchedules.forEach((schedule) => {
        const customerId = schedule.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.tbmCustomerId

        if (customerId) {
          if (!customerMap.has(customerId)) {
            customerMap.set(customerId, [])
          }
          customerMap.get(customerId)!.push(schedule)
        }
      })

      // 荷主別に集計
      const widthBase = 120

      const customerSalesRecords: CustomerSalesRecord[] = Array.from(customerMap.entries()).map(
        ([customerId, schedules]) => {
          const customer =
            schedules[0]?.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer ?? null

          // 正式な売上計算（請求書ページと同一ロジック）
          const sales = calculateSalesBySchedules(schedules)

          const filtered = schedules.filter(s => {
            return s.TbmRouteGroup.name.includes('下3  土・日曜運行')
          })
          if (filtered.length > 0) {
            filtered.forEach(s => {
              console.log(s.date)  //logs
            })
          }

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
                cellValue: 0, // calculateSalesBySchedules では郵便/一般を分けていないため0
                style: { fontSize: 12, minWidth: widthBase },
              },
              generalFee: {
                label: '通行料（一般）',
                cellValue: sales.tollExclTax, // 通行料合計（郵便+一般）
                style: { fontSize: 12, minWidth: widthBase },
              },
              driverFee: {
                label: '運賃',
                cellValue: sales.driverFeeTotal,
                style: { fontSize: 12, minWidth: widthBase },
              },
              totalExclTax: {
                label: '小計（税抜）',
                cellValue: sales.totalExclTax,
                style: { fontSize: 12, minWidth: widthBase },
              },
              taxAmount: {
                label: '消費税',
                cellValue: sales.taxAmount,
                style: { fontSize: 12, minWidth: widthBase },
              },
              grandTotal: {
                label: '請求額合計（税込）',
                cellValue: sales.grandTotal,
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
            totalExclTax: acc.totalExclTax + (Number(record.keyValue.totalExclTax.cellValue) || 0),
            taxAmount: acc.taxAmount + (Number(record.keyValue.taxAmount.cellValue) || 0),
            grandTotal: acc.grandTotal + (Number(record.keyValue.grandTotal.cellValue) || 0),
          }
        },
        { postalFee: 0, generalFee: 0, driverFee: 0, totalExclTax: 0, taxAmount: 0, grandTotal: 0 }
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





















