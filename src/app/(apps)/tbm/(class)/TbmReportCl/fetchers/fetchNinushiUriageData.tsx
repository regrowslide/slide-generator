'use server'

import { MEIAI_SUM_ORIGIN, calculateSalesBySchedules } from '@app/(apps)/tbm/(lib)/calculation'
import { fetchUnkoMeisaiData, tbmTableKeyValue } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { TbmCustomer } from '@prisma/generated/prisma/client'
import { unkoMeisaiKey } from '@app/(apps)/tbm/(class)/TbmReportCl/cols/createUnkoMeisaiRow'

export type nioshuUriageRecordKey = `kana` | `code` | `customerName` | `postalFee` | `generalFee` | `driverFee`

export type NioshuUriageRecord = {
  customer: TbmCustomer | null
  keyValue: {
    [key in nioshuUriageRecordKey]: tbmTableKeyValue
  }
}

export const fetchNinushiUriageData = async ({ firstDayOfMonth, whereQuery, tbmBaseId }) => {
  const { monthlyTbmDriveList } = await fetchUnkoMeisaiData({
    firstDayOfMonth,
    whereQuery,
    tbmBaseId,
    userId: undefined,
  })

  // 荷主ごとにグループ化
  const customerMap = new Map<number, typeof monthlyTbmDriveList>()

  monthlyTbmDriveList.forEach(row => {
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
  const NioshuUriageRecords: NioshuUriageRecord[] = Array.from(customerMap.entries()).map(([customerId, schedules]) => {
    const customer = schedules[0]?.schedule.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer ?? null

    const MEIAI_SUM = (dataKey: unkoMeisaiKey) => MEIAI_SUM_ORIGIN(schedules, dataKey)

    // 統一計算（seikyu互換）
    const rawSchedules = schedules.map(s => s.schedule)
    const sales = calculateSalesBySchedules(rawSchedules)

    const postalFee = MEIAI_SUM(`L_postalFee`)  // 分割表示維持
    const generalFee = MEIAI_SUM(`N_generalFee`)  // 分割表示維持
    const driverFee = sales.driverFeeTotal  // 統一計算（運賃+付帯）

    const widthBase = 120

    return {
      customer,
      keyValue: {
        code: {
          label: 'コード',
          cellValue: customer?.code ?? '',
          style: { fontSize: 12, minWidth: widthBase },
        },
        customerName: {
          label: 'お得意先',
          cellValue: customer?.name ?? '',
          style: { fontSize: 12, minWidth: widthBase },
        },
        kana: {
          label: 'かな',
          cellValue: customer?.kana ?? '',
          style: { fontSize: 12, minWidth: widthBase },
        },
        postalFee: {
          label: '通行料1',
          cellValue: postalFee,
          style: { fontSize: 12, minWidth: widthBase },
        },
        generalFee: {
          label: '通行料2',
          cellValue: generalFee,
          style: { fontSize: 12, minWidth: widthBase },
        },
        driverFee: {
          label: '運賃',
          cellValue: driverFee,
          style: { fontSize: 12, minWidth: widthBase },
        },
      },
    }
  })

  // かな > コードの昇順でソート
  NioshuUriageRecords.sort((a, b) => {
    const kanaA = a.customer?.kana ?? ''
    const kanaB = b.customer?.kana ?? ''
    const codeA = a.customer?.code ?? ''
    const codeB = b.customer?.code ?? ''

    // まずかなで比較
    const kanaCompare = kanaA.localeCompare(kanaB, 'ja')
    if (kanaCompare !== 0) {
      return kanaCompare
    }

    // かなが同じ場合はコードで比較
    return codeA.localeCompare(codeB, 'ja')
  })

  return {
    NioshuUriageRecords,
  }
}
