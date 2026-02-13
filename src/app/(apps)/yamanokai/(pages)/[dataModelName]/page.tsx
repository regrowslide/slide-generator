import { setCustomParams } from '@cm/components/DataLogic/helpers/SetCustomParams'
import { getScopes } from 'src/non-common/scope-lib/getScopes'
import { PageBuilder } from '@app/(apps)/yamanokai/(builders)/PageBuilders/PageBuilder'
import { ColBuilder } from '@app/(apps)/yamanokai/(builders)/ColBuilders/ColBuilder'
import { QueryBuilder } from '@app/(apps)/yamanokai/(builders)/QueryBuilder'
import { ViewParamBuilder } from '@app/(apps)/yamanokai/(builders)/ViewParamBuilder'
import { getMasterPageCommonConfig } from '@cm/components/DataLogic/helpers/getMasterPageCommonConfig'

export default async function DynamicMasterPage(props) {
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
    dataModelName: params.dataModelName,
    variants: [
      {
        modelNames: ['yamanokaiDepartment'],
        setParams: async () => ({
          myTable: {
            update: isSystemAdmin,
            create: isSystemAdmin,
            delete: isSystemAdmin,
          },
          additional: {
            orderBy: [{ sortOrder: 'asc' }],
          },
        }),
      },
    ],
  })
  return customParams
}
