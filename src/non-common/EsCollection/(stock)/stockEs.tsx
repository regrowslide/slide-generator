import { Days } from '@cm/class/Days/Days'
import { getMidnight } from '@cm/class/Days/date-utils/calculations'
import {
  EasySearchObject,
  EasySearchObjectExclusiveGroup,
  easySearchType,
  Ex_exclusive0,
  makeEasySearchGroups,
  makeEasySearchGroupsProp,
  toRowGroup,
} from '@cm/class/builders/QueryBuilderVariables'

import { Prisma } from '@prisma/generated/prisma/client'

import { getStockConfig } from './getStockConfig'
import { StockCl } from 'src/non-common/EsCollection/(stock)/StockCl'

export const stockEs = async () => {
  const config = await getStockConfig()

  const barometerCols = StockCl.getBarometerObject(config)

  const stock = async (props: easySearchType) => {
    type exclusiveKeyStrings = 'today'
    type CONDITION_TYPE = Prisma.StockWhereInput
    type exclusiveGroups = EasySearchObjectExclusiveGroup<exclusiveKeyStrings, CONDITION_TYPE>
    const { session, query, dataModelName, easySearchExtraProps } = props
    const { whereQuery } = easySearchExtraProps ?? {}

    type keys = {
      [key in string]: EasySearchObject
    }

    const ex_miniKabu = {
      ex_miniKabu: {
        label: `小型`,
        CONDITION: {
          last_Close: { lt: 1000 },
        },
      },
      ex_not_miniKabu: {
        label: `その他`,
        CONDITION: {
          NOT: { last_Close: { lt: 1000 } },
        },
      },
    }
    const ex_fav = {
      ex_fav: { label: `fav`, CONDITION: { favorite: { gt: 0 } } },
      ex_not_fav: { label: `その他`, CONDITION: { favorite: { lte: 0 } } },
    }

    const dataArr: makeEasySearchGroupsProp[] = []
    toRowGroup(1, dataArr, [
      //

      { exclusiveGroup: Ex_exclusive0, name: `リセット`, additionalProps: { refresh: true } },
      { exclusiveGroup: ex_miniKabu, name: `` },
      { exclusiveGroup: ex_fav, name: `` },

      ...Object.values(barometerCols).map(d => {
        const key = `last_${d.id}`
        return {
          name: ``,
          exclusiveGroup: {
            [key]: {
              label: d.label,
              description: d.description,
              CONDITION: { [key]: true },
            },
          },
        }
      }),
    ])
    const result = makeEasySearchGroups(dataArr) as keys

    return result
  }
  const stockHistory = async (props: easySearchType) => {
    type exclusiveKeyStrings = 'today'
    type CONDITION_TYPE = Prisma.StockHistoryWhereInput
    type exclusiveGroups = EasySearchObjectExclusiveGroup<exclusiveKeyStrings, CONDITION_TYPE>
    const { session, query, dataModelName, easySearchExtraProps } = props
    // const {whereQuery} = easySearchExtraProps ?? {}

    type keys = {
      [key in string]: EasySearchObject
    }

    const ex_today = {
      today: { label: `今日`, CONDITION: { Date: { gte: Days.day.subtract(getMidnight(), 1) } } },
    }

    const dataArr: makeEasySearchGroupsProp[] = []
    toRowGroup(1, dataArr, [
      //
      { exclusiveGroup: Ex_exclusive0, name: `リセット`, additionalProps: { refresh: true } },
      { exclusiveGroup: ex_today, name: `` },

      ...Object.values(barometerCols).map(d => {
        const key = d.id
        return {
          name: '',
          exclusiveGroup: {
            [key]: {
              label: d.label,
              description: d.description,
              CONDITION: { [key]: true },
            },
          },
        }
      }),
    ])
    const result = makeEasySearchGroups(dataArr) as keys

    return result
  }

  return {
    stock,
    stockHistory,
  }
}
