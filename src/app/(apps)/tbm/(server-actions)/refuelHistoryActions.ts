'use server'

import prisma from 'src/lib/prisma'
import {revalidatePath} from 'next/cache'

export type RefuelHistoryUpdateData = {
  id: number
  date?: Date | string
  odometer?: number
  amount?: number
  type?: string
}

/**
 * 給油履歴を更新
 */
export async function updateRefuelHistory(data: RefuelHistoryUpdateData) {
  try {
    const {id, ...updateData} = data

    // 日付の変換
    const processedData: any = {...updateData}
    if (updateData.date) {
      processedData.date = typeof updateData.date === 'string' ? new Date(updateData.date) : updateData.date
    }

    const result = await prisma.tbmRefuelHistory.update({
      where: {id},
      data: processedData,
    })

    // 燃費管理ページを再検証
    revalidatePath('/tbm/nempiKanri')

    return {success: true, data: result}
  } catch (error: any) {
    console.error('Error updating RefuelHistory:', error)
    return {success: false, error: error.message}
  }
}
