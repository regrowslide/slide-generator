import { getIncludeType, includeProps, roopMakeRelationalInclude } from '@cm/class/builders/QueryBuilderVariables'
import { Prisma } from '@prisma/generated/prisma/client'

export class QueryBuilder {
  static getInclude = (includeProps: includeProps): getIncludeType => {
    const include: getIncludeType = {
      user: {
        include: {
          UserRole: { include: { RoleMaster: {} } },
        },
      } as Prisma.UserFindManyArgs,
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
