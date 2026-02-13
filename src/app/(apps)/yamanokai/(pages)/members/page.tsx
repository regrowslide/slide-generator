import { setCustomParams } from '@cm/components/DataLogic/helpers/SetCustomParams'
import { getScopes } from 'src/non-common/scope-lib/getScopes'
import { PageBuilder } from '@app/(apps)/yamanokai/(builders)/PageBuilders/PageBuilder'
import { ColBuilder } from '@app/(apps)/yamanokai/(builders)/ColBuilders/ColBuilder'
import { QueryBuilder } from '@app/(apps)/yamanokai/(builders)/QueryBuilder'
import { ViewParamBuilder } from '@app/(apps)/yamanokai/(builders)/ViewParamBuilder'
import { getMasterPageCommonConfig } from '@cm/components/DataLogic/helpers/getMasterPageCommonConfig'

export default async function MembersPage(props) {
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
  const { isSystemAdmin } = scopes.getYamanokaiScopes()

  const customParams = await setCustomParams({
    dataModelName: 'user',
    variants: [
      {
        modelNames: ['user'],
        setParams: async () => ({
          myTable: {
            pagination: { countPerPage: 100 },
            update: isSystemAdmin,
            create: isSystemAdmin,
            delete: isSystemAdmin,
          },
          additional: {
            where: { apps: { has: 'yamanokai' } },
            payload: { apps: ['yamanokai'] },
            orderBy: [{ name: 'asc' }],
          },
        }),
      },
    ],
  })
  return customParams
}
