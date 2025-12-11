'use client'
import { ColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import TbmRouteGroupDetail from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/TbmRouteGroupDetail'
import { TbmRouteGroupUpsertController } from '@app/(apps)/tbm/(builders)/PageBuilders/TbmRouteGroupUpsertController'
import { Days } from '@cm/class/Days/Days'
import { getMidnight, toUtc } from '@cm/class/Days/date-utils/calculations'

import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import React from 'react'
import { Fields } from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { Button } from '@cm/components/styles/common-components/Button'
import { autoCreateMonthConfig } from '@app/(apps)/tbm/(pages)/eigyoshoSettei/components/autoCreateMonthConfig'

export default function RouteDisplay({ tbmBase, whereQuery, toggleLoad, currentMonth }) {
  const useGlobalProps = useGlobal()

  const { query, session, addQuery } = useGlobalProps

  const { tbmBaseId } = session.scopes.getTbmScopes()

  const { firstDayOfMonth: yearMonth } = Days.month.getMonthDatum(query.from ? toUtc(query.from) : getMidnight())

  // 並び順選択フォーム
  const { BasicForm, latestFormData } = useBasicFormProps({
    columns: new Fields([
      {
        id: `sortBy`,
        label: `並び順`,
        form: { style: { width: 140 } },
        forSelect: {
          optionsOrOptionFetcher: [
            { name: '出発時間順', label: '出発時間順', value: 'departureTime' },
            { name: '便コード順', label: '便コード順', value: 'routeCode' },
            { name: '荷主コード順', label: '荷主コード順', value: 'customerCode' },
          ],
        },
      },
    ]).transposeColumns(),

    formData: {
      sortBy: query.routeSortBy ?? 'routeCode', // デフォルトは便コード順
    },
  })

  // 並び順変更時の処理
  React.useEffect(() => {
    if (latestFormData.sortBy !== query.routeSortBy) {
      addQuery({ routeSortBy: latestFormData.sortBy })
    }
  }, [latestFormData.sortBy, query.routeSortBy, addQuery])

  // 動的なorderBy生成
  const getOrderBy = () => {
    const sortBy = query.routeSortBy || 'routeCode'

    // 表示期限のソート: 未入力のものを最初に、あとは降順
    const displayExpiryDateOrder = [
      { displayExpiryDate: { sort: 'desc' as const, nulls: 'first' as const } }
    ]

    switch (sortBy) {
      case 'routeCode':
        return [...displayExpiryDateOrder, { code: 'asc' as const }, { name: 'asc' as const }]
      case 'customerCode':
        // 顧客コード順（関連テーブル経由）
        return [...displayExpiryDateOrder, { Mid_TbmRouteGroup_TbmCustomer: { TbmCustomer: { code: 'asc' as const } } }, { code: 'asc' as const }]
      case 'departureTime':
        // 出発時刻順は文字列ソート（24時間超えは考慮しない）
        return [...displayExpiryDateOrder, { departureTime: 'asc' as const }, { code: 'asc' as const }]
      default:
        return [...displayExpiryDateOrder, { code: 'asc' as const }]
    }
  }

  return (
    <C_Stack>
      {/* 並び順選択 */}
      {/* <div className="mb-4"></div> */}

      <R_Stack className={` items-start`}>
        <ChildCreator
          {...{
            ParentData: tbmBase,
            models: { parent: `tbmBase`, children: `tbmRouteGroup` },
            additional: {
              where: {
                tbmBaseId: undefined,
                OR: [
                  { tbmBaseId: tbmBase?.id }, // 所有している便
                  {
                    TbmRouteGroupShare: {
                      some: { tbmBaseId: tbmBase?.id },
                    },
                  }, // 共有されている便
                ],
              },

              include: {
                TbmBase: {},
                TbmDriveSchedule: {
                  where: {
                    date: whereQuery,
                  },
                },
                Mid_TbmRouteGroup_TbmCustomer: { include: { TbmCustomer: true } },
                TbmMonthlyConfigForRouteGroup: { where: { yearMonth: whereQuery } },
                TbmRouteGroupFee: { orderBy: { startDate: `desc` }, take: 1 },
                TbmRouteGroupShare: {
                  include: { TbmBase: true },
                },
                // 関連便情報を取得（親便・子便の判定用）
                RelatedRouteGroupsAsParent: {
                  select: {
                    id: true,
                    daysOffset: true,
                    childRouteGroupId: true,
                  },
                },
                RelatedRouteGroupsAsChild: {
                  select: {
                    id: true,
                    daysOffset: true,
                    tbmRouteGroupId: true,
                    TbmRouteGroup: {
                      select: {
                        id: true,
                        name: true,
                        code: true,
                      },
                    },
                  },
                },
              },
              orderBy: getOrderBy(),
            },
            myForm: { create: TbmRouteGroupUpsertController },
            myTable: {
              customActions: () => {
                return (
                  <R_Stack className={`mx-8`}>
                    <BasicForm latestFormData={latestFormData} alignMode={`row`} />
                    <Button
                      {...{
                        size: 'sm',
                        color: 'blue',
                        onClick: async () => {
                          await autoCreateMonthConfig({ toggleLoad, currentMonth, tbmBaseId: tbmBase?.id })
                        },
                      }}
                    >
                      前月データ引き継ぎ
                    </Button>
                  </R_Stack>
                )
              },
              style: { width: `90vw` },
              pagination: { countPerPage: 10 },
            },
            columns: ColBuilder.tbmRouteGroup({
              useGlobalProps,
              ColBuilderExtraProps: {
                tbmBaseId,
                showMonthConfig: true,
                yearMonth,
              },
            }),

            useGlobalProps,

            EditForm: TbmRouteGroupDetail,
          }}
        />
      </R_Stack>
    </C_Stack>
  )
}
