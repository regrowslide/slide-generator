import { TBM_CODE } from '@app/(apps)/tbm/(class)/TBM_CODE'
import { forSelectConfig } from '@cm/types/select-types'
import { TbmVehicle } from '@prisma/generated/prisma/client'

export class VehicleCl {
  tbmVehicle: TbmVehicle

  constructor(tbmVehicle: TbmVehicle) {
    this.tbmVehicle = tbmVehicle
  }

  get name() {
    const { type, shape, vehicleNumber } = this.tbmVehicle
    return [`[${type ?? '-'}]`, vehicleNumber, shape].filter(Boolean).join(` `)
  }

  get shortName() {
    const { type, shape, frameNo, vehicleNumber } = this.tbmVehicle
    return [`[${type ?? '-'}]`, vehicleNumber].filter(Boolean).join(` `)
  }
  get nameWithFrame() {
    const { type, shape, frameNo, vehicleNumber } = this.tbmVehicle
    return [`【${frameNo}】`, `[${type ?? '-'}]`, vehicleNumber].filter(Boolean).join(` `)
  }

  static getVehicleForSelectConfig = ({ tbmBaseId, withFrame = true }: { tbmBaseId?: number; withFrame?: boolean }) => {
    const result: forSelectConfig = {
      select: {
        id: `number`,
        code: `string`,
        frameNo: 'string',
        vehicleNumber: `string`,
        chassisNumber: `string`,
        type: `string`,
        shape: `string`,
        name: false,
      },
      where: ({ latestFormData }) => {
        return {
          tbmBaseId: latestFormData?.tbmBaseId ?? tbmBaseId,
          activeStatus: TBM_CODE.ACTIVE_KBN.raw.ACTIVE.code,
        }
      },
      orderBy: [{ id: `asc` }],
      nameChanger(op) {


        if (op) {
          const vehicle = op as unknown as TbmVehicle

          return { ...op, label: withFrame ? new VehicleCl(vehicle).nameWithFrame : new VehicleCl(vehicle).name }
        }

        return op
      },
    }

    return result
  }
}
