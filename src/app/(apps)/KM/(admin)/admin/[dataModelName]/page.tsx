import {setCustomParams} from '@cm/components/DataLogic/helpers/SetCustomParams'

import {PageBuilder} from '@app/(apps)/KM/class/PageBuilder'
import {ColBuilder} from '@app/(apps)/KM/class/ColBuilder'
import {QueryBuilder} from '@app/(apps)/KM/class/QueryBuilder'

import {ViewParamBuilder} from '@app/(apps)/KM/class/ViewParamBuilder'
import {getMasterPageCommonConfig} from '@cm/components/DataLogic/helpers/getMasterPageCommonConfig'

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

const parameters = async (props: {params; query; session; scopes}) => {
  const {params, query, session, scopes} = props

  //---------------個別設定-------------
  const customParams = await setCustomParams({
    dataModelName: params.dataModelName,
    variants: [
      {
        modelNames: ['kaizenClient'],
        setParams: async () => {
          return {
            additional: {orderBy: [{public: 'desc'}]},
          }
        },
      },
      {
        modelNames: ['kaizenWork'],
        setParams: async () => {
          return {
            myForm: {
              style: {width: 1500},
            },
            additional: {
              orderBy: [{date: 'desc'}],
            },
          }
        },
      },
    ],
  })
  return customParams
}
