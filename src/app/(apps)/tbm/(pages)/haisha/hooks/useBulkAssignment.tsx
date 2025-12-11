'use client'

import { useState } from 'react'
import { toastByResult } from '@cm/lib/ui/notifications'
import { bulkAssignSchedule, getRelatedRouteGroups } from '../server-actions/bulkAssignSchedule'
import { BulkAssignmentFormData } from '../types/haisha-page-types'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

interface UseBulkAssignmentParams {
  tbmBaseId: number
  tbmRouteGroupId: number
  onComplete?: () => void
}

interface UseBulkAssignmentReturn {
  isLoading: boolean
  handleBulkAssign: (formData: BulkAssignmentFormData) => Promise<void>
  deleteSchedule: (scheduleId: number) => Promise<void>
}

/**
 * 一括割り当て処理を行うカスタムフック
 */
export function useBulkAssignment({ tbmBaseId, tbmRouteGroupId, onComplete }: UseBulkAssignmentParams): UseBulkAssignmentReturn {
  const [isLoading, setIsLoading] = useState(false)

  /**
   * 一括割り当て処理を実行
   */
  const handleBulkAssign = async (formData: BulkAssignmentFormData) => {
    const { userId, tbmVehicleId, selectedDates } = formData

    // バリデーション（日付の選択のみ必須）
    if (selectedDates.length === 0) {
      toastByResult({
        success: false,
        message: '日付を選択してください',
      })
      return
    }

    setIsLoading(true)

    try {
      // 関連便を取得してチェック
      const relatedRoutes = await getRelatedRouteGroups(tbmRouteGroupId)

      let includeRelatedRoutes = false

      // 関連便がある場合は確認ダイアログを表示
      if (relatedRoutes.length > 0) {
        const relatedNames = relatedRoutes
          .map(r => `${r.childRouteGroup?.name}（${r.daysOffset > 0 ? r.daysOffset + '日後' : r.daysOffset === 0 ? '同日' : Math.abs(r.daysOffset) + '日前'}）`)
          .join('\n')

        includeRelatedRoutes = confirm(
          `関連する${relatedRoutes.length}個の便を同時に設定しますか？\n\n${relatedNames}`
        )
      }

      // サーバーアクションを呼び出し
      const result = await bulkAssignSchedule({
        tbmBaseId,
        tbmRouteGroupId,
        userId,
        tbmVehicleId,
        dates: selectedDates,
        includeRelatedRoutes,
      })

      // 結果を表示
      toastByResult(result)

      // 成功したら完了コールバックを呼び出し
      if (result.success && onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error('一括割り当て処理でエラーが発生しました:', error)
      toastByResult({
        success: false,
        message: '一括割り当て処理でエラーが発生しました',
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * スケジュールを削除する処理
   */
  const deleteSchedule = async (scheduleId: number) => {
    if (!scheduleId) return

    setIsLoading(true)

    try {
      // サーバーアクションを呼び出し
      const result = await doStandardPrisma('tbmDriveSchedule', 'delete', {
        where: {
          id: scheduleId,
        },
      })

      // 結果を表示
      toastByResult(result)

      // 成功したら完了コールバックを呼び出し
      if (result.success && onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error('スケジュール削除処理でエラーが発生しました:', error)
      toastByResult({
        success: false,
        message: 'スケジュール削除処理でエラーが発生しました',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    handleBulkAssign,
    deleteSchedule,
  }
}
