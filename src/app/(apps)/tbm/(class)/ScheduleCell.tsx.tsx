import { TbmBase, TbmDriveSchedule, User } from '@prisma/generated/prisma/client'

export class ScheduleCell {
  ScheduleCell

  constructor(
    ScheduleCell: TbmDriveSchedule & {
      User: User
      TbmBase: TbmBase
    }
  ) {
    this.ScheduleCell = ScheduleCell
  }
}
