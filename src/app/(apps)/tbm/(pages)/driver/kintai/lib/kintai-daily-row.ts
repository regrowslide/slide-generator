import { Days } from '@cm/class/Days/Days'

type OdometerInput = {
  userId: number
  date: Date
  odometerStart: number
  odometerEnd: number
}

type RefuelHistory = {
  userId: number
  date: Date
  amount: number
}

type DriveSchedule = {
  userId: number
  date: Date
  TbmVehicle?: { vehicleNumber: string } | null
  TbmRouteGroup?: { name: string; routeName: string } | null
}

// 走行距離の計算 - そのドライバーがその日に走行した距離をOdometerInputから算出
export const calcOdometerDistance = (odometerInputs: OdometerInput[], userId: number, date: Date): number => {
  return odometerInputs
    .filter(item => item.userId === userId && Days.validate.isSameDate(item.date, date))
    .reduce((acc, item) => acc + (item.odometerEnd - item.odometerStart), 0)
}

// 給油量の計算 - そのドライバーがその日に実施した給油合計をTbmRefuelHistoryから計算
export const calcRefuelAmount = (refuelHistories: RefuelHistory[], userId: number, date: Date): number => {
  return refuelHistories
    .filter(item => item.userId === userId && Days.validate.isSameDate(item.date, date))
    .reduce((acc, item) => acc + item.amount, 0)
}

// 車番の取得 - そのドライバーがその日に走った車両をカンマ区切りで出力
export const getVehicleNumbers = (driveSchedules: DriveSchedule[], userId: number, date: Date): string => {
  return driveSchedules
    .filter(item => item.userId === userId && Days.validate.isSameDate(item.date, date) && item.TbmVehicle)
    .map(item => item.TbmVehicle?.vehicleNumber)
    .filter((value, index, self) => value && self.indexOf(value) === index)
    .join('\n')
}

// 運行内容の取得 - その人の、当日のTbmDriveScheduleの内容をカンマ区切りで出力
export const getDriveContents = (driveSchedules: DriveSchedule[], userId: number, date: Date): string => {
  return driveSchedules
    .filter(item => item.userId === userId && Days.validate.isSameDate(item.date, date))
    .map(item => `${item.TbmRouteGroup?.name}【${item.TbmRouteGroup?.routeName}】`)
    .filter(Boolean)
    .join('\n')
}
