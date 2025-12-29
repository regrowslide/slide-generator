'use server'

import prisma from 'src/lib/prisma'
import { TimeHandler } from '@app/(apps)/tbm/(class)/TimeHandler'
import { GetListDataParams, HaishaListData } from '../types/haisha-page-types'

// ============================================================================
// キャッシュ設定（マスタデータは変更頻度が低いためキャッシュ）
// ============================================================================

// 車両リストのキャッシュ（同一リクエスト内でのメモ化）
const vehicleListCache = new Map<number, Promise<any[]>>()

const getCachedVehicleList = (tbmBaseId: number) => {
  if (!vehicleListCache.has(tbmBaseId)) {
    vehicleListCache.set(
      tbmBaseId,
      prisma.tbmVehicle.findMany({
        select: { id: true, code: true, vehicleNumber: true, shape: true, type: true },
        where: { tbmBaseId },
        orderBy: { code: 'asc' },
      })
    )
  }
  return vehicleListCache.get(tbmBaseId)!
}

// ============================================================================
// メイン関数
// ============================================================================

export const getListData = async (props: GetListDataParams): Promise<HaishaListData> => {
  const { tbmBaseId, whereQuery, mode, takeSkip, sortBy = 'departureTime', tbmCustomerId, routeNameFilter } = props

  // 共有便を含む便グループのフィルター条件
  const routeGroupBaseFilter = {
    OR: [
      { tbmBaseId }, // 所有している便
      { TbmRouteGroupShare: { some: { tbmBaseId, isActive: true } } }, // 共有されている便
    ],
  }

  const commonWhere = {
    name: { contains: routeNameFilter },
    ...routeGroupBaseFilter,
  }

  // 表示期限のフィルタリング: 指定月の初日時点で表示期限を超過している便は非表示
  const firstDayOfMonth = whereQuery.gte
  const displayExpiryDateFilter = firstDayOfMonth
    ? {
      OR: [{ displayExpiryDate: null }, { displayExpiryDate: { gte: firstDayOfMonth } }],
    }
    : {}

  // 顧客フィルター（共通で使用）
  const customerFilter = tbmCustomerId
    ? {
      Mid_TbmRouteGroup_TbmCustomer: {
        tbmCustomerId,
      },
    }
    : {}

  // ソート条件を動的に生成
  const getOrderBy = () => {
    const baseOrder = [{ date: 'asc' as const }]
    switch (sortBy) {
      case 'routeCode':
        return [...baseOrder, { TbmRouteGroup: { code: 'asc' as const } }]
      case 'customerCode':
      case 'departureTime':
      default:
        return baseOrder
    }
  }

  const getRouteGroupOrderBy = () => {
    return [{ code: 'asc' as const }, { name: 'asc' as const }]
  }

  // ============================================================================
  // 全クエリを並列実行（パフォーマンス改善の核心）
  // ============================================================================
  const [tbmBase, rawTbmDriveSchedule, userList, tbmRouteGroupRaw, carList, userWorkStatusCount, maxCount] =
    await Promise.all([
      // 1. 拠点情報
      prisma.tbmBase.findUnique({
        select: { id: true, name: true },
        where: { id: tbmBaseId },
      }),

      // 2. 配車スケジュール
      prisma.tbmDriveSchedule.findMany({
        select: {
          id: true,
          date: true,
          remark: true,
          userId: true,
          tbmRouteGroupId: true,
          tbmBaseId: true,
          tbmVehicleId: true,
          TbmRouteGroup: {
            select: {
              id: true,
              code: true,
              color: true,
              name: true,
              routeName: true,
              seikyuKbn: true,
              departureTime: true,
              finalArrivalTime: true,
              allowDuplicate: true,
              isShared: true, // 共有フラグ
              tbmBaseId: true, // 共有元営業所の判定用
              TbmBase: {
                select: {
                  id: true,
                  name: true,
                },
              },
              Mid_TbmRouteGroup_TbmCustomer: {
                select: {
                  TbmCustomer: {
                    select: {
                      id: true,
                      code: true,
                      name: true,
                    },
                  },
                },
              },
              // 親便かどうかを判定するため
              RelatedRouteGroupsAsParent: {
                select: {
                  id: true,
                  daysOffset: true,
                  childRouteGroupId: true,
                },
              },
              // 子便かどうかを判定するため
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
          },
          finished: true,
          confirmed: true,
          approved: true,
          User: { select: { id: true, name: true } },
          // TbmVehicle: 最小限のフィールドのみ取得（OdometerInputは配車ページでは不要）
          TbmVehicle: {
            select: {
              id: true,
              code: true,
              vehicleNumber: true,
              shape: true,
              type: true,
            },
          },
        },
        where: {
          date: { gte: whereQuery.gte, lte: whereQuery.lt },
          TbmRouteGroup: {
            ...displayExpiryDateFilter,
            ...customerFilter,
            ...routeGroupBaseFilter, // 共有便を含める
          },
        },
        orderBy: getOrderBy(),
      }),

      // 3. ユーザーリスト
      prisma.user.findMany({
        select: {
          id: true,
          code: true,
          name: true,
          tbmBaseId: true,
          UserWorkStatus: {
            select: { id: true, date: true, workStatus: true, userId: true },
            where: { date: whereQuery },
          },
        },
        where: {
          tbmBaseId,
        },
        orderBy: { code: 'asc' },
        ...(mode === 'DRIVER' ? { ...takeSkip } : {}),
      }),

      // 4. 便グループ
      prisma.tbmRouteGroup.findMany({
        select: {
          id: true,
          code: true,
          name: true,
          routeName: true,
          seikyuKbn: true,
          departureTime: true,
          finalArrivalTime: true,
          allowDuplicate: true,
          serviceNumber: true,
          tbmBaseId: true,
          isShared: true, // 共有フラグ
          TbmBase: {
            select: {
              id: true,
              name: true,
            },
          },
          TbmRouteGroupShare: {
            select: {
              id: true,
              tbmBaseId: true,
              isActive: true,
              TbmBase: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          Mid_TbmRouteGroup_TbmCustomer: {
            select: {
              TbmCustomer: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
            },
          },
          TbmRouteGroupCalendar: {
            select: { id: true, date: true, holidayType: true, remark: true },
            where: {
              date: whereQuery,

            },
          },
          // 関連便データを取得
          RelatedRouteGroupsAsParent: {
            select: {
              id: true,
              daysOffset: true,
              childRouteGroupId: true,
              childRouteGroup: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
            orderBy: { daysOffset: 'asc' },
          },
          // 子便としての関連便データを取得
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
            orderBy: { daysOffset: 'asc' },
          },
        },
        where: {
          ...commonWhere,
          ...displayExpiryDateFilter,
          ...customerFilter,
          ...routeGroupBaseFilter,

        },
        orderBy: getRouteGroupOrderBy(),
        ...(mode === 'ROUTE' ? { ...takeSkip } : {}),
      }),

      // 5. 車両リスト（キャッシュ利用）
      getCachedVehicleList(tbmBaseId),

      // 6. 勤務状況カウント
      prisma.userWorkStatus.groupBy({
        by: ['userId', 'workStatus'],
        orderBy: { workStatus: 'desc' },
        _count: { _all: true },
        where: { date: whereQuery },
      }),

      // 7. 最大件数（モードに応じて）
      mode === 'ROUTE'
        ? prisma.tbmRouteGroup.count({
          where: {
            ...commonWhere,
            ...customerFilter,
          },
        })
        : prisma.user.count({ where: { name: { contains: routeNameFilter }, tbmBaseId } }),
    ])

  // ============================================================================
  // データ加工処理（クライアントサイドソートと重複検知）
  // ============================================================================

  // 重複検知：同じ日付で、同じ「便、車両、ドライバー」の組み合わせをチェック
  let processedSchedules = rawTbmDriveSchedule.map(schedule => {
    // 自身が重複許可の場合は重複フラグを立てない
    if (schedule.TbmRouteGroup.allowDuplicate) {
      return {
        ...schedule,
        duplicated: false,
      }
    }

    // 自身が重複許可でない場合、同じ組み合わせの便が他にあるかチェック
    const duplicated = rawTbmDriveSchedule.some(
      otherSchedule =>
        otherSchedule.id !== schedule.id &&
        otherSchedule.date.getTime() === schedule.date.getTime() &&
        otherSchedule.tbmRouteGroupId === schedule.tbmRouteGroupId &&
        !otherSchedule.TbmRouteGroup.allowDuplicate
    )

    return {
      ...schedule,
      duplicated,
    }
  })

  // ソート処理
  if (sortBy === 'departureTime') {
    processedSchedules = processedSchedules.sort((a, b) => {
      const dateCompare = a.date.getTime() - b.date.getTime()
      if (dateCompare !== 0) return dateCompare
      return TimeHandler.compareTimeStrings(a.TbmRouteGroup.departureTime, b.TbmRouteGroup.departureTime)
    })
  } else if (sortBy === 'customerCode') {
    processedSchedules = processedSchedules.sort((a, b) => {
      const dateCompare = a.date.getTime() - b.date.getTime()
      if (dateCompare !== 0) return dateCompare
      const customerCodeA = a.TbmRouteGroup.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.code || ''
      const customerCodeB = b.TbmRouteGroup.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.code || ''
      return customerCodeA.localeCompare(customerCodeB)
    })
  }

  // 便グループのソート処理
  let sortedRouteGroup = tbmRouteGroupRaw
  if (sortBy === 'departureTime') {
    sortedRouteGroup = [...tbmRouteGroupRaw].sort((a, b) => {
      return TimeHandler.compareTimeStrings(a.departureTime, b.departureTime)
    })
  } else if (sortBy === 'customerCode') {
    sortedRouteGroup = [...tbmRouteGroupRaw].sort((a, b) => {
      const customerCodeA = a.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.code || ''
      const customerCodeB = b.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.code || ''
      const codeCompare = customerCodeA.localeCompare(customerCodeB)
      if (codeCompare === 0) {
        return (a.code || '').localeCompare(b.code || '')
      }
      return codeCompare
    })
  }



  const result = {
    tbmBase,
    TbmDriveSchedule: processedSchedules,
    userList,
    tbmRouteGroup: sortedRouteGroup,
    carList,
    maxCount,
    userWorkStatusCount,
  } as unknown as HaishaListData

  return result
}
