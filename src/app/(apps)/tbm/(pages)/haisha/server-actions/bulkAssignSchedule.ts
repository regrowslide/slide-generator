'use server'

import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {getMidnight, addDays} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import prisma from 'src/lib/prisma'

interface BulkAssignParams {
  tbmBaseId: number
  tbmRouteGroupId: number
  userId: number | null
  tbmVehicleId: number | null
  dates: Date[]
  includeRelatedRoutes?: boolean // 関連便も同時に作成するかどうか
}

interface RelatedRouteGroup {
  id: number
  daysOffset: number
  childRouteGroupId: number
  childRouteGroup: {
    id: number
    name: string
  }
}

/**
 * 指定した便の関連便を取得する
 */
export async function getRelatedRouteGroups(tbmRouteGroupId: number): Promise<RelatedRouteGroup[]> {
  const relatedRoutes = await prisma.tbmRelatedRouteGroup.findMany({
    where: {tbmRouteGroupId: tbmRouteGroupId},
    include: {childRouteGroup: {select: {id: true, name: true}}},
    orderBy: {daysOffset: 'asc'},
  })
  return relatedRoutes as RelatedRouteGroup[]
}

/**
 * 複数日に対して一括で配車スケジュールを割り当てるサーバーアクション
 *
 * @param params 一括割り当てパラメータ
 * @returns 処理結果
 */
export async function bulkAssignSchedule(params: BulkAssignParams) {
  const {tbmBaseId, tbmRouteGroupId, userId, tbmVehicleId, dates, includeRelatedRoutes = false} = params

  // パラメータチェック
  if (!tbmBaseId || !tbmRouteGroupId) {
    return {
      success: false,
      message: '必要なパラメータが不足しています',
    }
  }

  // 日付が指定されていない場合はエラー
  if (!dates || dates.length === 0) {
    return {
      success: false,
      message: '日付が選択されていません',
    }
  }

  try {
    // 選択された日付をUTC 0時に正規化
    const normalizedDates = dates.map(date => getMidnight(date))

    // 日付文字列の配列を作成（クエリ用）
    const dateStrings = normalizedDates.map(date => formatDate(date, 'YYYY-MM-DD'))

    // 関連便情報を取得（必要な場合）
    let relatedRoutes: RelatedRouteGroup[] = []
    if (includeRelatedRoutes) {
      relatedRoutes = await getRelatedRouteGroups(tbmRouteGroupId)
    }

    // 親便と関連便の全ルートIDを収集
    const allRouteIds = [tbmRouteGroupId, ...relatedRoutes.map(r => r.childRouteGroupId)]

    // 関連便の日付も含めた全日付を収集
    const allDatesForQuery: Date[] = [...normalizedDates]
    if (includeRelatedRoutes && relatedRoutes.length > 0) {
      for (const date of normalizedDates) {
        for (const related of relatedRoutes) {
          const relatedDate = addDays(new Date(date), related.daysOffset)
          allDatesForQuery.push(getMidnight(relatedDate))
        }
      }
    }

    // 既存のスケジュールを取得（親便と関連便両方）
    const existingSchedules = await prisma.tbmDriveSchedule.findMany({
      where: {
        tbmRouteGroupId: {in: allRouteIds},
        date: {in: allDatesForQuery},
      },
    })

    // 既存スケジュールのマップを作成（ルートID_日付文字列 -> スケジュールID）
    const existingScheduleMap = existingSchedules.reduce(
      (acc, schedule) => {
        const key = `${schedule.tbmRouteGroupId}_${formatDate(schedule.date, 'YYYY-MM-DD')}`
        acc[key] = schedule.id
        return acc
      },
      {} as Record<string, number>
    )

    // トランザクションクエリの配列を準備
    const transactionQueries: transactionQuery<'tbmDriveSchedule', 'create' | 'update'>[] = []

    // 親便のスケジュール作成/更新
    for (const date of normalizedDates) {
      const dateString = formatDate(date, 'YYYY-MM-DD')
      const existingKey = `${tbmRouteGroupId}_${dateString}`
      const existingId = existingScheduleMap[existingKey]

      if (existingId) {
        transactionQueries.push({
          model: 'tbmDriveSchedule',
          method: 'update',
          queryObject: {
            where: {id: existingId},
            data: {
              ...(userId !== null ? {userId} : {}),
              ...(tbmVehicleId !== null ? {tbmVehicleId} : {}),
            },
          },
        })
      } else {
        transactionQueries.push({
          model: 'tbmDriveSchedule',
          method: 'create',
          queryObject: {
            data: {
              date,
              tbmRouteGroupId,
              tbmBaseId,
              ...(userId !== null ? {userId} : {}),
              ...(tbmVehicleId !== null ? {tbmVehicleId} : {}),
              sortOrder: 0,
            },
          },
        })
      }

      // 関連便のスケジュール作成/更新
      if (includeRelatedRoutes) {
        for (const related of relatedRoutes) {
          const relatedDate = getMidnight(addDays(new Date(date), related.daysOffset))
          const relatedDateString = formatDate(relatedDate, 'YYYY-MM-DD')
          const relatedExistingKey = `${related.childRouteGroupId}_${relatedDateString}`
          const relatedExistingId = existingScheduleMap[relatedExistingKey]

          if (relatedExistingId) {
            transactionQueries.push({
              model: 'tbmDriveSchedule',
              method: 'update',
              queryObject: {
                where: {id: relatedExistingId},
                data: {
                  ...(userId !== null ? {userId} : {}),
                  ...(tbmVehicleId !== null ? {tbmVehicleId} : {}),
                },
              },
            })
          } else {
            transactionQueries.push({
              model: 'tbmDriveSchedule',
              method: 'create',
              queryObject: {
                data: {
                  date: relatedDate,
                  tbmRouteGroupId: related.childRouteGroupId,
                  tbmBaseId,
                  ...(userId !== null ? {userId} : {}),
                  ...(tbmVehicleId !== null ? {tbmVehicleId} : {}),
                  sortOrder: 0,
                },
              },
            })
          }
        }
      }
    }

    // トランザクション実行
    const result = await doTransaction({transactionQueryList: transactionQueries})

    const totalCount = includeRelatedRoutes ? dates.length * (1 + relatedRoutes.length) : dates.length

    return {
      success: result.success,
      message: result.success
        ? `${totalCount}件の配車スケジュールを更新しました${includeRelatedRoutes && relatedRoutes.length > 0 ? `（関連便${relatedRoutes.length}件を含む）` : ''}`
        : '配車スケジュールの更新に失敗しました',
      result: result.result,
    }
  } catch (error) {
    console.error('一括割り当て処理でエラーが発生しました:', error)
    return {
      success: false,
      message: '一括割り当て処理でエラーが発生しました',
      error,
    }
  }
}
