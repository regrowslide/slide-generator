import { getIncludeType, includeProps, roopMakeRelationalInclude } from '@cm/class/builders/QueryBuilderVariables'
import { Prisma } from '@prisma/generated/prisma/client'

export class QueryBuilder {
  static getInclude = (includeProps: includeProps) => {
    const tbmRouteGroup: Prisma.TbmRouteGroupFindManyArgs = {
      include: {
        Mid_TbmRouteGroup_TbmCustomer: {
          include: { TbmCustomer: {} },
        },

        TbmBase: {},
      },
    }

    const tbmBase: Prisma.TbmBaseFindManyArgs = {
      include: {
        TbmRouteGroup: {
          include: {
            // TbmRoute: tbmRoute
          },
        },
      },
    }

    const include: getIncludeType = {
      tbmRouteGroup,
      tbmBase,
      user: { include: { TbmBase: {}, TbmVehicle: {} } } as Prisma.UserFindManyArgs,
      tbmVehicle: {
        include: {
          TbmBase: {},
          TbmVehicleMaintenanceRecord: {},
          TbmFuelCard: {},
        },
      } as Prisma.TbmVehicleFindManyArgs,
      tbmRefuelHistory: { include: { TbmVehicle: {}, User: {} } } as Prisma.TbmRefuelHistoryFindManyArgs,
      tbmCarWashHistory: { include: { TbmVehicle: {}, User: {} } } as Prisma.TbmCarWashHistoryFindManyArgs,
      tbmDriveSchedule: {
        include: {
          TbmVehicle: {},
          TbmBase: {},
          User: {},
          TbmRouteGroup: {},
        },
      } as Prisma.TbmDriveScheduleFindManyArgs,
      odometerInput: {
        include: {
          TbmVehicle: {},
          User: {},
        },
      } as Prisma.OdometerInputFindManyArgs,
    }

    Object.keys(include).forEach(key => {
      roopMakeRelationalInclude({
        parentName: key,
        parentObj: include[key],
      })
    })

    return include
  }
}
