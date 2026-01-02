import { forSelectConfig } from '@cm/types/select-types'
import { TbmRouteGroup } from '@prisma/generated/prisma/client'

export class RouteGroupCl {
  tbmRouteGroup: TbmRouteGroup & {
    TbmRouteGroupShare?: Array<{
      id: number
      tbmBaseId: number
      TbmBase?: { id: number; name: string; code?: string | null }
    }>
  }

  constructor(
    tbmRouteGroup: TbmRouteGroup & {
      TbmRouteGroupShare?: Array<{
        id: number
        tbmBaseId: number
        TbmBase?: { id: number; name: string; code?: string | null }
      }>
    }
  ) {
    this.tbmRouteGroup = tbmRouteGroup
  }

  get name() {
    const op = this.tbmRouteGroup
    const shareIndicator = this.isShared ? ' 🔗' : ''

    return [
      //
      `[${op.id}]`,
      op.name,
      shareIndicator,
      op.routeName && `\n(${op.routeName})`,
    ].join(` `)
  }

  get shortName() {
    const { name } = this.tbmRouteGroup
    const shareIndicator = this.isShared ? ' 🔗' : ''
    return name + shareIndicator
  }

  get isShared() {
    return this?.tbmRouteGroup?.isShared || false
  }

  get shareCount() {
    return this.tbmRouteGroup.TbmRouteGroupShare?.length || 0
  }

  get sharedBases() {
    return this.tbmRouteGroup.TbmRouteGroupShare?.map(share => share.TbmBase).filter(Boolean) || []
  }

  isOwner(currentBaseId: number) {
    return this?.tbmRouteGroup?.tbmBaseId === currentBaseId
  }

  isSharedTo(baseId: number) {
    return this.tbmRouteGroup.TbmRouteGroupShare?.some(share => share.tbmBaseId === baseId) || false
  }
  static getRouteGroupForSelectConfig = ({ tbmBaseId }: { tbmBaseId?: number }) => {
    const result: forSelectConfig = {
      modelName: 'tbmRouteGroup',
      select: {
        id: 'number',
        name: 'string',
        routeName: 'string',
        isShared: 'boolean',
        // TbmRouteGroupShare: {
        //   include: {TbmBase: {select: {id: 'number', name: 'string'}}},
        // },
      },
      where: {
        OR: [
          { tbmBaseId }, // 所有している便
          { TbmRouteGroupShare: { some: { tbmBaseId } } }, // 共有されている便
        ],
      },
      orderBy: [{ id: 'asc' }],
      nameChanger(op) {
        if (op) {
          const routeGroup = op as unknown as TbmRouteGroup & {
            TbmRouteGroupShare?: Array<{
              id: number
              tbmBaseId: number
              TbmBase?: { id: number; name: string; code?: string | null }
            }>
          }
          return {
            ...op,
            label: new RouteGroupCl(routeGroup).name,
          }
        }
        return op
      },
    }

    return result
  }
}
