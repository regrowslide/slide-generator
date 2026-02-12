import { setCustomParams } from '@cm/components/DataLogic/helpers/SetCustomParams'
import { getScopes } from 'src/non-common/scope-lib/getScopes'
import { PageBuilder } from '@app/(apps)/yamanokai/(builders)/PageBuilders/PageBuilder'
import { ColBuilder } from '@app/(apps)/yamanokai/(builders)/ColBuilders/ColBuilder'
import { QueryBuilder } from '@app/(apps)/yamanokai/(builders)/QueryBuilder'
import { ViewParamBuilder } from '@app/(apps)/yamanokai/(builders)/ViewParamBuilder'
import { getMasterPageCommonConfig } from '@cm/components/DataLogic/helpers/getMasterPageCommonConfig'

export default async function RoleMasterPage(props) {
  return getMasterPageCommonConfig({
    nextPageProps: props,
    parameters,
    ColBuilder,
    ViewParamBuilder,
    PageBuilder,
    QueryBuilder,
  })
}

const parameters = async (props: { params; query; session; scopes: ReturnType<typeof getScopes> }) => {
  const { params, query, session, scopes } = props

  const customParams = await setCustomParams({
    dataModelName: 'roleMaster',
    variants: [
      {
        modelNames: ['roleMaster'],
        setParams: async () => ({
          myTable: {
            update: scopes.admin,
            create: scopes.admin,
            delete: scopes.admin,
          },
          additional: {
            where: { apps: { has: 'yamanokai' } },
          },
        }),
      },
    ],
  })
  return customParams
}
