'use client'

import { tbmOperationGroup } from '@app/(apps)/tbm/(builders)/PageBuilders/tbmOperationGroup/tbmOperationGroup'
import { useGlobalPropType } from '@cm/hooks/globalHooks/useGlobal'
import { Fields } from '@cm/class/Fields/Fields'
import GlobalIdSelector from '@cm/components/GlobalIdSelector/GlobalIdSelector'
import TbmVehicleDetail from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/TbmVehicleDetail'
import TbmRouteGroupDetail from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/TbmRouteGroupDetail'
import TbmUserDetail from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/TbmUserDetail'
import { DataModelBuilder, roleMaster } from '@cm/class/builders/PageBuilderVariables'
import { globalIds } from 'src/non-common/searchParamStr'

export class PageBuilder {
  // static tbmBase = tbmBase
  static tbmVehicle = {
    form: TbmVehicleDetail,
  }
  static tbmRouteGroup = {
    form: TbmRouteGroupDetail,
  }
  static roleMaster: DataModelBuilder = roleMaster

  static user = {
    form: TbmUserDetail,
  }
  static tbmOperationGroup = tbmOperationGroup

  static getGlobalIdSelector = (props: { useGlobalProps: useGlobalPropType }) => {
    const { useGlobalProps } = props
    const { admin, getTbmScopes } = useGlobalProps.accessScopes()
    const { userId, isShocho, tbmBaseId } = getTbmScopes()

    const columns = admin
      ? new Fields([
        {
          id: globalIds.globalTbmBaseId,
          label: '営',
          forSelect: {
            config: {
              modelName: 'tbmBase',
            }
          },
          form: { style: { width: 85 } }
        },

        {
          id: globalIds.globalUserId,
          label: 'ド',
          forSelect: {
            config: {
              modelName: 'user',
            }
          },
          form: { style: { width: 85 } }
        },
      ]).transposeColumns()
      : new Fields([{
        id: globalIds.globalTbmBaseId,
        label: '営',
        forSelect: {
          config: {
            modelName: 'tbmBase',
          }
        }
      }]).transposeColumns()

    if (admin || isShocho) {
      return () => <GlobalIdSelector {...{ useGlobalProps, columns }} />
    }
  }
}
