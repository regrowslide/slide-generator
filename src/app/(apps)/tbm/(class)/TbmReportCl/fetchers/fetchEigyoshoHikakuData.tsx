'use server'

import { calculateSalesBySchedules } from '@app/(apps)/tbm/(lib)/calculation'
import { tbmTableKeyValue } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { getFilteredSchedulesByMonth } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/shared/getFilteredSchedules'
import { TbmBase, TbmCustomer } from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

export type CustomerSalesKey = 'code' | 'customerName' | 'postalFee' | 'generalFee' | 'driverFee' | 'futaiFee' | 'totalExclTax' | 'taxAmount' | 'grandTotal'

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
    futaiFee: number
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





  // 全スケジュールを一度だけ取得（営業所フィルタなし）
  const allFilteredSchedules = firstDayOfMonth
    ? await getFilteredSchedulesByMonth({
      targetMonth: firstDayOfMonth,
      whereQuery,
    })
    : []

  // 各営業所ごとに、所属ドライバが走った便でフィルタ・集計
  const eigyoshoHikakuDataList = allTbmBases.map((tbmBase) => {
    // ドライバの所属営業所でフィルタ（便の所属ではなくドライバの所属）
    const filteredSchedules = allFilteredSchedules.filter(
      (schedule) => schedule.User?.tbmBaseId === tbmBase.id
    )

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
          return s.TbmRouteGroup.name.includes('土・日曜運行')
        })






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
              cellValue: sales.driverFee,
              style: { fontSize: 12, minWidth: widthBase },
            },
            futaiFee: {
              label: '付帯料金',
              cellValue: sales.futaiFee,
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

    // 総合計を計算（全フィルタ済みスケジュールで calculateSalesBySchedules を使用）
    const salesTotal = calculateSalesBySchedules(filteredSchedules)
    const grandTotal = {
      postalFee: 0,  // calculateSalesBySchedules では郵便/一般を分けていないため0
      generalFee: salesTotal.tollExclTax,  // 通行料合計
      driverFee: salesTotal.driverFee,  // 運賃
      futaiFee: salesTotal.futaiFee,  // 付帯料金
      totalExclTax: salesTotal.totalExclTax,
      taxAmount: salesTotal.taxAmount,
      grandTotal: salesTotal.grandTotal,
    }

    return {
      tbmBase,
      customerSalesRecords,
      grandTotal,
    }
  })

  return eigyoshoHikakuDataList
}





















