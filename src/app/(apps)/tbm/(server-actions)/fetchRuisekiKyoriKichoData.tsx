'use server'
import prisma from 'src/lib/prisma'
import { TbmVehicle, User } from '@prisma/generated/prisma/client'
import { TbmReportCl } from '@app/(apps)/tbm/(class)/TbmReportCl'

export type carHistoryKey = `sokoKyoriInPeriod` | `heikinNempiInPeriod` | `sokyuyuRyoInPeriod` | `fuelCostInPeriod`

const keiyuPerLiter = 160

export const fetchRuisekiKyoriKichoData = async ({ tbmBaseId, whereQuery, TbmBase_MonthConfig }) => {
  // ユーザーリストと期間内の運行スケジュールを取得
  const userList = await prisma.user.findMany({
    where: { tbmBaseId },
    include: {
      TbmVehicle: {},
      TbmDriveSchedule: {
        where: {
          date: whereQuery,
          approved: TbmReportCl.allowNonApprovedSchedule ? undefined : true,
        },
        include: {
          TbmVehicle: {},
        },
      },
    },
  })

  // 期間内のオドメーター入力データを一括取得（ユーザーIDと車両IDでフィルタするため）
  const odometerInputList = await prisma.odometerInput.findMany({
    where: {
      date: whereQuery,
      User: { tbmBaseId },
    },
  })

  // 期間内の給油履歴データを一括取得（ユーザーIDと車両IDでフィルタするため）
  const refuelHistoryList = await prisma.tbmRefuelHistory.findMany({
    where: {
      date: whereQuery,
      User: { tbmBaseId },
    },
    orderBy: [{ date: 'asc' }, { id: 'asc' }],
  })

  const userListWithCarHistory = userList.map(user => {
    const { id: userId, TbmDriveSchedule } = user

    // このユーザーが期間内に運転した車両を特定（重複排除）
    const allCars = TbmDriveSchedule.reduce((acc, cur) => {
      const { TbmVehicle } = cur

      if (TbmVehicle && !acc.find(v => v.id === TbmVehicle?.id)) {
        acc.push(TbmVehicle)
      }
      return acc
    }, [] as TbmVehicle[]).sort((a, b) => (a.code ?? '')?.localeCompare(b.code ?? ''))

    // 各車両について、このユーザーの走行データを集計
    const allCarsWithData = allCars.map(car => {
      // このユーザーがこの車両で期間内に走った距離を集計
      const userOdometerInputs = odometerInputList.filter(
        input => input.userId === userId && input.tbmVehicleId === car.id
      )
      const sokoKyoriInPeriod = userOdometerInputs.reduce((acc, input) => {
        // odometerStartが0または未入力の場合（初回入力など）は計算しない
        // odometerEnd < odometerStart（マイナスになる場合）も計算しない
        if (!input.odometerStart || input.odometerStart <= 0 || input.odometerEnd < input.odometerStart) {
          return acc
        }
        return acc + (input.odometerEnd - input.odometerStart)
      }, 0)

      // このユーザーがこの車両で期間内に給油した量を集計
      const userRefuelHistory = refuelHistoryList.filter(
        refuel => refuel.userId === userId && refuel.tbmVehicleId === car.id
      )
      const sokyuyuRyoInPeriod = userRefuelHistory.reduce((acc, refuel) => {
        return acc + refuel.amount
      }, 0)

      // 平均燃費の計算（給油量が0の場合は0）
      const heikinNempiInPeriod = sokyuyuRyoInPeriod > 0 ? sokoKyoriInPeriod / sokyuyuRyoInPeriod : 0

      // 使用金額の計算
      const fuelCostInPeriod = sokyuyuRyoInPeriod * (TbmBase_MonthConfig?.keiyuPerLiter ?? keiyuPerLiter)

      return {
        car,
        sokoKyoriInPeriod,
        heikinNempiInPeriod,
        sokyuyuRyoInPeriod,
        fuelCostInPeriod,
        refuelHistory: userRefuelHistory.sort((a, b) => a.date.getTime() - b.date.getTime()),
      }
    })

    return { user, allCars: allCarsWithData }
  })

  type RefuelHistoryItem = {
    id: number
    date: Date
    odometer: number
    amount: number
    tbmVehicleId: number
    userId: number
  }

  type UserWithCarHistory = {
    user: User & { TbmVehicle: TbmVehicle }

    allCars: {
      car: TbmVehicle
      sokoKyoriInPeriod: number
      heikinNempiInPeriod: number
      sokyuyuRyoInPeriod: number
      fuelCostInPeriod: number
      refuelHistory: RefuelHistoryItem[]
    }[]
  }

  return userListWithCarHistory as UserWithCarHistory[]
}
