import {Prisma} from '@prisma/generated/prisma/client'
import {includeProps} from '@cm/class/builders/QueryBuilderVariables'

export class QueryBuilder {
  static getInclude = (includeProps: includeProps) => {
    const user: Prisma.UserFindManyArgs = {
      include: {
        Store: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        DamageNameMaster: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }

    return {
      user,
    }
  }
}
