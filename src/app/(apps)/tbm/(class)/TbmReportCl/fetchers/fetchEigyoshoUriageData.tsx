'use server'

export type eigyoshoRecordKey =
  | `CD`
  | `name`
  | `count`
  | `C_postalHighway`
  | `D_generalHighway`
  | `E_totalHighway`
  | `F_postalFee`
  | `G_generalFee`
  | `H_totalFee`
  | `I_thirtyPercent`
  | `J_highwayMinusFee`
  | `K`
  | `L_highwayExcess`
  | `M_salaryFare`
  | `N_monthlyFare`
  | `O_totalExclTax`
  | `O_taxAmount`
  | `O_grandTotal`
  | `P_fuelUsage`
  | `Q_fuelCost`
  | `R_carWash`
  | `S_mileage`
  | `T`
  | `U_mileage`
  | `V_mileage`

import { MEIAI_SUM_ORIGIN, RUISEKI_SUM_ORIGIN, calculateSalesBySchedules } from '@app/(apps)/tbm/(lib)/calculation'
import { getTbmBase_MonthConfig } from '@app/(apps)/tbm/(server-actions)/getBasics'

import { carHistoryKey, fetchRuisekiKyoriKichoData } from '@app/(apps)/tbm/(server-actions)/fetchRuisekiKyoriKichoData'
import { getMidnight } from '@cm/class/Days/date-utils/calculations'
import prisma from 'src/lib/prisma'
import { User } from '@prisma/generated/prisma/client'

import { fetchUnkoMeisaiData, tbmTableKeyValue } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { unkoMeisaiKey } from '@app/(apps)/tbm/(class)/TbmReportCl/cols/createUnkoMeisaiRow'

export type EigyoshoUriageRecord = {
  user: User
  keyValue: {
    [key in eigyoshoRecordKey]: tbmTableKeyValue
  }
}

export const fetchEigyoshoUriageData = async ({ firstDayOfMonth, whereQuery, tbmBaseId }) => {
  const { monthlyTbmDriveList, userList } = await fetchUnkoMeisaiData({
    firstDayOfMonth,
    whereQuery,
    tbmBaseId,
    userId: undefined,
  })

  const yearMonth = whereQuery.gte ?? getMidnight()

  const { TbmBase_MonthConfig } = await getTbmBase_MonthConfig({ yearMonth, tbmBaseId })

  const userListWithCarHistory = await fetchRuisekiKyoriKichoData({ tbmBaseId, whereQuery, TbmBase_MonthConfig })

  const carWashHistory = await prisma.tbmCarWashHistory.groupBy({
    by: [`userId`],
    where: {
      TbmVehicle: { tbmBaseId },
      userId: { in: userList.map(user => user.id) },
      date: { gte: whereQuery?.gte, lte: whereQuery?.lte },
    },
    _sum: { price: true },
  })

  const EigyoshoUriageRecords: EigyoshoUriageRecord[] = userList.map(item => {
    const userSchedule = monthlyTbmDriveList.filter(row => {
      const { schedule } = row
      const { User } = schedule
      return User?.id === item?.id
    })

    const carWashSum = carWashHistory.find(d => d.userId === item.id)?._sum?.price ?? 0

    const MEIAI_SUM = (dataKey: unkoMeisaiKey) => MEIAI_SUM_ORIGIN(userSchedule, dataKey)

    const userWithCarHistory = userListWithCarHistory.filter(data => data.user.id === item.id)

    const RUISEKI_SUM = (dataKey: carHistoryKey) => RUISEKI_SUM_ORIGIN(userWithCarHistory, dataKey)

    const user = item

    // 参考値（従来ロジック維持）
    const H_GOUKEI_TSUKORYO = MEIAI_SUM(`L_postalFee`) + MEIAI_SUM(`N_generalFee`)

    // 正式な売上計算（seikyuと同一ロジック）
    const rawSchedules = userSchedule.map(s => s.schedule)
    const sales = calculateSalesBySchedules(rawSchedules)

    const width40 = 40
    const width80 = 80
    const widthBase = 120

    const highwayFeeSum = MEIAI_SUM(`M_postalHighwayFee`) + MEIAI_SUM(`O_generalHighwayFee`)

    return {
      user,
      keyValue: {
        CD: {
          label: 'CD',
          cellValue: user.code,
          style: { fontSize: 12, minWidth: width40 },
        },
        name: {
          label: 'ドライバ',
          cellValue: user.name,
          style: { fontSize: 12, minWidth: width80 },
        },
        count: {
          label: '件数',
          cellValue: userSchedule.length,
          style: { fontSize: 12, minWidth: width40 },
        },
        C_postalHighway: {
          label: `高速代（郵便）`,
          cellValue: MEIAI_SUM(`M_postalHighwayFee`),
          className: 'text-error-main',
          style: { fontSize: 12, minWidth: widthBase },
        },
        D_generalHighway: {
          label: `高速代(一般）`,
          cellValue: MEIAI_SUM(`O_generalHighwayFee`),
          style: { fontSize: 12, minWidth: widthBase },
          className: 'text-blue-main',
        },
        E_totalHighway: {
          label: `合計(高速代)`,
          cellValue: highwayFeeSum,
          style: { fontSize: 12, minWidth: widthBase },
        },
        F_postalFee: {
          label: `通行料(郵便)`,
          style: { fontSize: 12, minWidth: widthBase },
          className: 'text-error-main',
          cellValue: MEIAI_SUM(`L_postalFee`),
        },
        G_generalFee: {
          label: `通行料(一般)`,
          style: { fontSize: 12, minWidth: widthBase },
          className: 'text-blue-main',
          cellValue: MEIAI_SUM(`N_generalFee`),
        },
        H_totalFee: {
          label: `通行料(税抜)`,
          cellValue: sales.tollExclTax,
          style: { fontSize: 12, minWidth: widthBase },
        },
        I_thirtyPercent: {
          label: `高速台30％`,
          cellValue: MEIAI_SUM(`T_thirteenPercentOfPostalHighway`),
          style: { fontSize: 12, minWidth: widthBase },
        },
        J_highwayMinusFee: {
          label: `高速代-通行料`,
          cellValue: MEIAI_SUM(`S_jomuinFutan`),
          style: { fontSize: 12, minWidth: widthBase },
        },
        K: {
          label: `高速超過額`,
          cellValue: MEIAI_SUM(`U_general`),
          style: { fontSize: 12, minWidth: widthBase },
        },
        L_highwayExcess: {
          label: `高速超過額`,
          cellValue: MEIAI_SUM(`V_highwayExcess`),
          style: { fontSize: 12, minWidth: widthBase },
        },
        M_salaryFare: {
          label: `給与算定運賃高`,
          cellValue: MEIAI_SUM(`R_JomuinUnchin`),
          style: { fontSize: 12, minWidth: widthBase },
        },
        N_monthlyFare: {
          label: `当月運賃（円）`,
          cellValue: sales.driverFeeTotal,
          style: { fontSize: 12, minWidth: widthBase },
        },
        O_totalExclTax: {
          label: `小計（税抜）`,
          cellValue: sales.totalExclTax,
          style: { fontSize: 12, minWidth: widthBase },
        },
        O_taxAmount: {
          label: `消費税`,
          cellValue: sales.taxAmount,
          style: { fontSize: 12, minWidth: widthBase },
        },
        O_grandTotal: {
          label: `当月売上高（税込）`,
          cellValue: sales.grandTotal,
          style: { fontSize: 12, minWidth: widthBase },
        },

        P_fuelUsage: {
          label: `当月燃料使用量（L)`,
          cellValue: RUISEKI_SUM(`sokyuyuRyoInPeriod`),
          style: { fontSize: 12, minWidth: widthBase },
        },
        Q_fuelCost: {
          label: `当月燃料代`,
          cellValue: RUISEKI_SUM(`fuelCostInPeriod`),
          style: { fontSize: 12, minWidth: widthBase },
        },
        R_carWash: {
          label: `洗車機代`,
          cellValue: carWashSum,
          style: { fontSize: 12, minWidth: widthBase },
        },
        S_mileage: {
          label: `当月走行距離(㎞)`,
          style: { fontSize: 12, minWidth: widthBase },
          cellValue: RUISEKI_SUM(`sokoKyoriInPeriod`),
        },
        T: {
          label: `有料1`,
          style: { fontSize: 12, minWidth: widthBase },
          cellValue: MEIAI_SUM('M_postalHighwayFee'),
        },
        U_mileage: {
          label: `有料2`,
          style: { fontSize: 12, minWidth: widthBase },
          cellValue: MEIAI_SUM('O_generalHighwayFee'),
        },
        V_mileage: {
          label: `有料合計`,
          style: { fontSize: 12, minWidth: widthBase },
          cellValue: MEIAI_SUM('M_postalHighwayFee') + MEIAI_SUM('O_generalHighwayFee'),
        },
      },
    }
  })

  return {
    userList,
    monthlyTbmDriveList,
    EigyoshoUriageRecords,
    userListWithCarHistory,
    carWashHistory,
  }
}
