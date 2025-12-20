//classを切り替える

import { setCustomParams } from '@cm/components/DataLogic/helpers/SetCustomParams'

import { getScopes } from 'src/non-common/scope-lib/getScopes'
import { PageBuilder } from '../../(builders)/PageBuilder'
import { ColBuilder } from '../../(builders)/ColBuilder'
import { QueryBuilder } from '../../(builders)/QueryBuilder'

import { ViewParamBuilder } from '../../(builders)/ViewParamBuilder'
import { getMasterPageCommonConfig } from '@cm/components/DataLogic/helpers/getMasterPageCommonConfig'
import { globalIds } from 'src/non-common/searchParamStr'
import prisma from 'src/lib/prisma'

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

  // グローバルクライアントIDを取得
  const globalClientId = query?.[globalIds.globalHakobunClientId] as string | undefined
  let clientIdFilter: number | undefined

  if (globalClientId) {
    // クライアントID（文字列）からクライアントのID（数値）を取得
    const client = await prisma.hakobunClient.findUnique({
      where: { clientId: globalClientId },
      select: { id: true },
    })
    if (client) {
      clientIdFilter = client.id
    }
  }

  //---------------個別設定-------------
  const customParams = await setCustomParams({
    dataModelName: params.dataModelName,
    variants: [
      {
        modelNames: [`user`],
        setParams: async () => {
          return {
            additional: {
              payload: [],
              where: { apps: { has: `` } },
            },
          }
        },
      },
      // クライアントマスタ
      {
        modelNames: ['hakobunClient'],
        setParams: async () => {
          return {
            additional: {
              payload: [],
              orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
            },
          }
        },
      },
      // カテゴリマスタ（グローバルクライアントIDでフィルタリング）
      {
        modelNames: ['hakobunCategory'],
        setParams: async () => {
          return {
            additional: {
              payload: [],
              where: clientIdFilter ? { hakobunClientId: clientIdFilter } : {},
              orderBy: [{ generalCategory: 'asc' }, { specificCategory: 'asc' }],
            },
          }
        },
      },
      // ルールマスタ（グローバルクライアントIDでフィルタリング）
      {
        modelNames: ['hakobunRule'],
        setParams: async () => {
          return {
            additional: {
              payload: [],
              where: clientIdFilter ? { hakobunClientId: clientIdFilter } : {},
              orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
            },
          }
        },
      },
    ],
  })
  return customParams
}
