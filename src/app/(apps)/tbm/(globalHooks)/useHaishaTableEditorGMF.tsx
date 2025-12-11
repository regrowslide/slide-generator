import { ColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'

import { requestResultType } from '@cm/types/types'
import { Button } from '@cm/components/styles/common-components/Button'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { useGlobalModalForm } from '@cm/components/utils/modal/useGlobalModalForm'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { atomKey } from '@cm/hooks/useJotai'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { doTransaction, transactionQuery } from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import { toastByResult } from '@cm/lib/ui/notifications'
import { Prisma, TbmDriveSchedule, TbmRelatedRouteGroup, TbmRouteGroup, User } from '@prisma/client'
import { addDays } from '@cm/class/Days/date-utils/calculations'

import React from 'react'

type formData = {
  id: number
  date: Date
  userId: number
  tbmVehicleId: number
  tbmRouteGroupId: number
  tbmBaseId: number
}

// 関連便データを取得する関数
const fetchRelatedRouteGroups = async (tbmRouteGroupId: number): Promise<TbmRelatedRouteGroup[]> => {
  const res = await doStandardPrisma('tbmRelatedRouteGroup', 'findMany', {
    where: { tbmRouteGroupId: tbmRouteGroupId },
    include: { childRouteGroup: true },
    orderBy: { daysOffset: 'asc' },
  })
  return res.result ?? []
}

const useHaishaTableEditorGMF = (props: {
  afterUpdate?: (props: { res: requestResultType; tbmDriveSchedule: TbmDriveSchedule }) => void
  afterDelete?: (props: { res: requestResultType; tbmDriveSchedule: TbmDriveSchedule }) => void
}) => {
  const { afterUpdate = item => null, afterDelete = item => null } = props

  const atomKey = `haishaTableEditorGMF` as atomKey

  return useGlobalModalForm<{
    user: User
    date: Date
    tbmDriveSchedule?: any
    tbmBase?: any
    tbmRouteGroup: TbmRouteGroup & {
      RelatedRouteGroupsAsParent?: TbmRelatedRouteGroup[]
    }
  }>(atomKey, null, {
    mainJsx: ({ GMF_OPEN, setGMF_OPEN }) => {
      const useGlobalProps = useGlobal()
      const { user, date, tbmDriveSchedule, tbmBase, tbmRouteGroup } = GMF_OPEN ?? {}

      const { BasicForm, latestFormData } = useBasicFormProps({
        columns: ColBuilder.tbmDriveSchedule({
          useGlobalProps,
          ColBuilderExtraProps: {
            tbmBase,
            tbmDriveSchedule: tbmDriveSchedule ?? {
              date,
              userId: user?.id,
              tbmRouteGroupId: tbmRouteGroup?.id,
            },
          },
        }),
      })
      return (
        <BasicForm
          {...{
            latestFormData,
            onSubmit: async (data: formData) => {
              // 新規作成の場合のみ関連便をチェック
              const isNewSchedule = !tbmDriveSchedule?.id

              if (isNewSchedule && data.tbmRouteGroupId) {
                // 関連便を取得
                const relatedRouteGroups = await fetchRelatedRouteGroups(data.tbmRouteGroupId)

                if (relatedRouteGroups.length > 0) {
                  // 関連便がある場合、確認ダイアログを表示
                  const relatedNames = relatedRouteGroups
                    .map((r: any) => `${r.childRouteGroup?.name}（${r.daysOffset > 0 ? r.daysOffset + '日後' : r.daysOffset === 0 ? '同日' : Math.abs(r.daysOffset) + '日前'}）`)
                    .join('\n')

                  const shouldCreateRelated = confirm(
                    `関連する${relatedRouteGroups.length}個の便を同時に設定しますか？\n\n${relatedNames}`
                  )

                  if (shouldCreateRelated) {
                    // トランザクションで親便と関連便を同時に作成
                    const transactionQueryList: transactionQuery<'tbmDriveSchedule', 'create'>[] = []

                    // 親便のスケジュール
                    transactionQueryList.push({
                      model: 'tbmDriveSchedule',
                      method: 'create',
                      queryObject: {
                        data: data,
                      },
                    })

                    // 関連便のスケジュール
                    for (const related of relatedRouteGroups) {
                      const relatedDate = addDays(new Date(data.date), related.daysOffset)
                      transactionQueryList.push({
                        model: 'tbmDriveSchedule',
                        method: 'create',
                        queryObject: {
                          data: {
                            date: relatedDate,
                            userId: data.userId,
                            tbmVehicleId: data.tbmVehicleId,
                            tbmRouteGroupId: related.childRouteGroupId,
                            tbmBaseId: data.tbmBaseId,
                          },
                        },
                      })
                    }

                    const res = await doTransaction({ transactionQueryList })
                    toastByResult(res)

                    afterUpdate?.({ res, tbmDriveSchedule })
                    setGMF_OPEN(null)
                    return
                  }
                }
              }

              // 通常の処理（関連便なし、または関連便作成を選ばなかった場合）
              const queryObject: Prisma.TbmDriveScheduleUpsertArgs = {
                where: { id: tbmDriveSchedule?.id ?? 0 },
                create: data,
                update: data,
                include: {
                  TbmVehicle: {
                    include: { OdometerInput: {} },
                  },
                  TbmRouteGroup: {},
                },
              }

              const res = await doStandardPrisma(`tbmDriveSchedule`, `upsert`, queryObject)
              toastByResult(res)

              afterUpdate?.({ res, tbmDriveSchedule })
              setGMF_OPEN(null)
            },
          }}
        >
          <R_Stack className={`w-full justify-end gap-6`}>
            <Button
              color={`red`}
              type={`button`}
              {...{
                onClick: async () => {
                  if (confirm(`削除しますか？`)) {
                    const res = await doStandardPrisma(`tbmDriveSchedule`, `delete`, {
                      where: { id: tbmDriveSchedule?.id ?? 0 },
                    })
                    toastByResult(res)

                    setGMF_OPEN(null)
                    afterDelete?.({ res, tbmDriveSchedule })
                  }
                },
              }}
            >
              削除
            </Button>
            <Button>設定</Button>
          </R_Stack>
        </BasicForm>
      )
    },
  })
}

export default useHaishaTableEditorGMF
