'use server'

import prisma from 'src/lib/prisma'
import {revalidatePath} from 'next/cache'

// 実績入力データ型
export interface KaizenWorkInput {
  id?: number
  date?: Date | string | null
  title?: string | null
  subtitle?: string | null
  status?: string | null
  beforeChallenge?: string | null
  description?: string | null
  quantitativeResult?: string | null
  points?: string | null
  clientName?: string | null
  organization?: string | null
  companyScale?: string | null
  dealPoint?: number | null
  toolPoint?: number | null
  impression?: string | null
  reply?: string | null
  jobCategory?: string | null
  systemCategory?: string | null
  collaborationTool?: string | null
  projectDuration?: string | null
  kaizenClientId?: number | null
  allowShowClient?: boolean | null
  isPublic?: boolean | null
}

// クライアント入力データ型
export interface KaizenClientInput {
  id?: number
  name?: string | null
  organization?: string | null
  iconUrl?: string | null
  bannerUrl?: string | null
  website?: string | null
  note?: string | null
  public?: boolean | null
}

// 実績の作成・更新
export async function upsertKaizenWork(data: KaizenWorkInput) {
  try {
    const {id, ...rest} = data

    // 日付の変換
    const processedData = {
      ...rest,
      date: rest.date ? new Date(rest.date) : null,
    }

    if (id) {
      // 更新
      const result = await prisma.kaizenWork.update({
        where: {id},
        data: processedData,
      })
      revalidatePath('/KM/admin/works')
      revalidatePath('/KM')
      return {success: true, data: result}
    } else {
      // 新規作成
      const result = await prisma.kaizenWork.create({
        data: processedData,
      })
      revalidatePath('/KM/admin/works')
      revalidatePath('/KM')
      return {success: true, data: result}
    }
  } catch (error) {
    console.error('Error upserting KaizenWork:', error)
    return {success: false, error: String(error)}
  }
}

// 実績の一括更新
export async function bulkUpdateKaizenWorks(ids: number[], updates: Partial<KaizenWorkInput>) {
  try {
    const result = await prisma.kaizenWork.updateMany({
      where: {id: {in: ids}},
      data: updates,
    })
    revalidatePath('/KM/admin/works')
    revalidatePath('/KM')
    return {success: true, count: result.count}
  } catch (error) {
    console.error('Error bulk updating KaizenWorks:', error)
    return {success: false, error: String(error)}
  }
}

// 実績の削除
export async function deleteKaizenWork(id: number) {
  try {
    await prisma.kaizenWork.delete({
      where: {id},
    })
    revalidatePath('/KM/admin/works')
    revalidatePath('/KM')
    return {success: true}
  } catch (error) {
    console.error('Error deleting KaizenWork:', error)
    return {success: false, error: String(error)}
  }
}

// 実績の一括削除
export async function bulkDeleteKaizenWorks(ids: number[]) {
  try {
    const result = await prisma.kaizenWork.deleteMany({
      where: {id: {in: ids}},
    })
    revalidatePath('/KM/admin/works')
    revalidatePath('/KM')
    return {success: true, count: result.count}
  } catch (error) {
    console.error('Error bulk deleting KaizenWorks:', error)
    return {success: false, error: String(error)}
  }
}

// クライアントの作成・更新
export async function upsertKaizenClient(data: KaizenClientInput) {
  try {
    const {id, ...rest} = data

    if (id) {
      // 更新
      const result = await prisma.kaizenClient.update({
        where: {id},
        data: rest,
      })
      revalidatePath('/KM/admin/works')
      return {success: true, data: result}
    } else {
      // 新規作成
      const result = await prisma.kaizenClient.create({
        data: rest,
      })
      revalidatePath('/KM/admin/works')
      return {success: true, data: result}
    }
  } catch (error) {
    console.error('Error upserting KaizenClient:', error)
    return {success: false, error: String(error)}
  }
}

// クライアントの削除
export async function deleteKaizenClient(id: number) {
  try {
    await prisma.kaizenClient.delete({
      where: {id},
    })
    revalidatePath('/KM/admin/works')
    return {success: true}
  } catch (error) {
    console.error('Error deleting KaizenClient:', error)
    return {success: false, error: String(error)}
  }
}
