'use server'

import { obj__initializeProperty } from '@cm/class/ObjHandler/transformers'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { StockConfig } from '@prisma/generated/prisma/client'

export type config = `riseWindowSize` | `riseThreshold` | `crashWindowSize` | `crashThreshold`

export type stockConfig_type = `上昇` | `下降` | `クラッシュ`
export type stockConfig_name = `期間(日)` | `閾値(%)`

export async function getStockConfig() {
  const { result: config } = await doStandardPrisma(`stockConfig`, `findMany`, {})
  const conifgObject = {}
  config.forEach((data: StockConfig) => {
    const { type, name, value } = data

    obj__initializeProperty(conifgObject, type, {})
    obj__initializeProperty(conifgObject[type], name, value)
  })

  return {
    上昇期間: conifgObject['01']['01'],
    上昇閾値: conifgObject['01']['02'],
    下降期間: conifgObject['02']['01'],
    下降閾値: conifgObject['02']['02'],
    クラッシュ期間: conifgObject['03']['01'],
    クラッシュ閾値: conifgObject['03']['02'],
  }
}
