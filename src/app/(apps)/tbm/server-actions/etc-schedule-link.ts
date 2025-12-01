'use server'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

/**
 * 特定の月と車両IDに基づいて運行スケジュールを取得する
 */
export async function getDriveSchedules(vehicleId: number, month: Date) {
  try {
    const startDate = new Date(month)
    startDate.setDate(1) // 月の初日

    const endDate = new Date(month)
    endDate.setMonth(endDate.getMonth() + 1)
    endDate.setDate(0) // 月の最終日

    // 表示期限のフィルタリング: 指定月の初日時点で表示期限を超過している便は非表示
    // 期限未入力のものは有効なデータだとみなして表示する
    const displayExpiryDateFilter = {
      OR: [
        {displayExpiryDate: null},
        {displayExpiryDate: {gte: startDate}},
      ],
    }

    const {result} = await doStandardPrisma('tbmDriveSchedule', 'findMany', {
      where: {
        tbmVehicleId: vehicleId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        TbmRouteGroup: displayExpiryDateFilter,
      },
      include: {
        TbmRouteGroup: true,
        TbmEtcMeisai: true,
        User: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    return {success: true, data: result}
  } catch (error) {
    console.error('運行スケジュール取得中にエラーが発生しました:', error)
    return {success: false, message: '運行スケジュール取得中にエラーが発生しました'}
  }
}

/**
 * ETCグループと運行スケジュールを紐付ける
 */
export async function linkEtcToSchedule(etcMeisaiId: number | null, driveScheduleId: number | null) {
  try {
    // 現在のEtcMeisaiの状態を取得
    const {result: currentEtcMeisai} = await doStandardPrisma('tbmEtcMeisai', 'findUnique', {
      where: {id: etcMeisaiId || undefined},
      include: {TbmDriveSchedule: true},
    })

    if (!currentEtcMeisai) {
      return {success: false, message: '指定されたETCグループが見つかりません'}
    }

    // 紐付け解除または新しい紐付けを設定
    if (driveScheduleId === null) {
      if (etcMeisaiId !== null) {
        // 紐付け解除の場合
        await doStandardPrisma('tbmEtcMeisai', 'update', {
          where: {id: etcMeisaiId},
          data: {tbmDriveScheduleId: null},
        })
      }
    } else {
      // 新しい紐付けの場合（1対多の関係なので既存の紐付けを解除する必要はない）
      if (etcMeisaiId !== null) {
        await doStandardPrisma('tbmEtcMeisai', 'update', {
          where: {id: etcMeisaiId},
          data: {tbmDriveScheduleId: driveScheduleId},
        })
      }
    }

    return {
      success: true,
      message: driveScheduleId ? '運行スケジュールと紐付けました' : '紐付けを解除しました',
    }
  } catch (error) {
    console.error('ETC-運行スケジュール紐付け中にエラーが発生しました:', error)
    return {success: false, message: '紐付け処理中にエラーが発生しました'}
  }
}

/**
 * 運行スケジュールに紐付けられているETCグループを取得
 */
export async function getEtcMeisaiBySchedule(driveScheduleId: number) {
  try {
    const {result} = await doStandardPrisma('tbmEtcMeisai', 'findMany', {
      where: {tbmDriveScheduleId: driveScheduleId},
      include: {
        TbmVehicle: true,
        EtcCsvRaw: true,
      },
      orderBy: {
        groupIndex: 'asc',
      },
    })

    return {success: true, data: result}
  } catch (error) {
    console.error('ETCグループ取得中にエラーが発生しました:', error)
    return {success: false, message: 'ETCグループ取得中にエラーが発生しました'}
  }
}

/**
 * 特定の月と車両IDに基づいて未紐付けのETCグループを取得
 */
export async function getUnlinkedEtcMeisai(vehicleId: number, month: Date) {
  try {
    const startDate = new Date(month)
    startDate.setDate(1) // 月の初日

    const endDate = new Date(month)
    endDate.setMonth(endDate.getMonth() + 1)
    endDate.setDate(0) // 月の最終日

    const {result} = await doStandardPrisma('tbmEtcMeisai', 'findMany', {
      where: {
        tbmVehicleId: vehicleId,
        month: {
          gte: startDate,
          lte: endDate,
        },
        tbmDriveScheduleId: null, // 未紐付けのみ
      },
      include: {
        EtcCsvRaw: true,
      },
      orderBy: {
        groupIndex: 'asc',
      },
    })

    return {success: true, data: result}
  } catch (error) {
    console.error('未紐付けETCグループ取得中にエラーが発生しました:', error)
    return {success: false, message: '未紐付けETCグループ取得中にエラーが発生しました'}
  }
}

/**
 * 特定の運行スケジュールとETCグループを紐付ける（運行スケジュールページからの操作用）
 */
export async function linkScheduleToEtc(driveScheduleId: number, etcMeisaiId: number | null) {
  // 内部的には同じ処理を使用
  return await linkEtcToSchedule(etcMeisaiId, driveScheduleId)
}
