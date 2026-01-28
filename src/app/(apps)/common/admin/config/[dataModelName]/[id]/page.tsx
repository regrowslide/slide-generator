import {PageBuilder} from '@app/(apps)/common/class/PageBuilder'
import {ColBuilder} from '@app/(apps)/common/class/ColBuilder'
import {QueryBuilder} from '@app/(apps)/common/class/QueryBuilder'
import {ViewParamBuilder} from '@app/(apps)/common/class/ViewParamBuilder'

import {setCustomParams} from '@cm/components/DataLogic/helpers/SetCustomParams'
import {getMasterPageCommonConfig} from '@cm/components/DataLogic/helpers/getMasterPageCommonConfig'

export default async function CommonMasterDetailPage(props) {
  return getMasterPageCommonConfig({
    nextPageProps: props,
    parameters,
    ColBuilder,
    ViewParamBuilder,
    PageBuilder,
    QueryBuilder,
  })
}

const parameters = async ({params, query, session, scopes}) => {
  return await setCustomParams({
    dataModelName: params.dataModelName,
    variants: [
      {
        modelNames: ['store', 'user', 'roleMaster'],
        setParams: async () => {
          return {
            myTable: {
              delete: scopes.admin ? {} : false,
              create: scopes.admin ? {} : false,
              update: scopes.admin ? {} : false,
            },
          }
        },
      },
    ],
  })
}
