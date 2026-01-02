import { fetchAlt } from '@cm/lib/http/fetch-client'
import { basePath } from '@cm/lib/methods/common'
import { modelExists } from '@cm/lib/methods/prisma-schema'
import { getScopes } from 'src/non-common/scope-lib/getScopes'
import { globalSelectorPrefix } from 'src/non-common/searchParamStr'

export const FakeOrKeepSession = async ({ query, realSession }) => {
  const tempScopes = getScopes(realSession, { query })
  const globalUserId = tempScopes.getGlobalUserId()
  const globalKeys = Object.keys(query ?? {}).filter(key => key.includes(globalSelectorPrefix))

  const models = globalKeys.map(key => key.replace(globalSelectorPrefix, '').replace('Id', ''))

  let fakeUser: any = null
  const getFakeUsers: any = await Promise.all(
    models.map(async model => {
      const isValidModel = modelExists(model)
      if (!isValidModel) return undefined

      const payload = {
        model: model,
        method: `findUnique`,
        queryObject: {
          where: { id: Number(globalUserId ?? 0) },
        },
        fetchKey: 'middleware fetching',
      }

      if (fakeUser === null && !!globalUserId) {
        const res = await fetchAlt(`${basePath}/api/prisma/universal`, payload)

        const { result: data } = res ?? {}
        return data
      } else {
        return undefined
      }
    })
  )
  fakeUser = getFakeUsers.find(u => u)

  const result = fakeUser ?? realSession

  return { ...result, ...(tempScopes?.admin ? { role: '管理者' } : {}) }
}
