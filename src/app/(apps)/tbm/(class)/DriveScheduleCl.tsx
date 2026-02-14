import {driveInputPageType} from '@app/(apps)/tbm/(pages)/driver/driveInput/driveInput-page-type'

export class DriveScheduleCl {
  static getStatus(driveScheduleList: driveInputPageType['driveScheduleList']) {
    const unkoCompleted = driveScheduleList.every(d => d.finished)
    const carInputCompleted = driveScheduleList.every(d => {
      const oi = d?.OdometerInput
      return oi && oi.odometerStart > 0 && oi.odometerEnd > 0
    })

    const gyomushuryo = driveScheduleList.every(d => d.confirmed)

    return {unkoCompleted, carInputCompleted, gyomushuryo}
  }
}
