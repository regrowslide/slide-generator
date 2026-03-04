'use server'

import prisma from 'src/lib/prisma'
import {RegrowUserService} from '../lib/services/RegrowUserService'
import type {User, RgStore} from '@prisma/generated/prisma/client'
import type {StaffMaster, StaffRole} from '../types'

// ============================================================
// Read
// ============================================================

export const getAllUsers = async (): Promise<(User & {RgStoreRg: RgStore | null})[]> =>
  RegrowUserService.getAllUsers()

export const getStaffMaster = async (): Promise<StaffMaster[]> =>
  RegrowUserService.getStaffMaster()

// ============================================================
// Create
// ============================================================

export const createRegrowUser = async (data: {name: string; email?: string; password?: string}): Promise<User> =>
  RegrowUserService.createUser(data)

// ============================================================
// Update
// ============================================================

export const updateUserRgStore = async (userId: number, rgStoreId: number | null): Promise<User> =>
  RegrowUserService.updateRgStore(userId, rgStoreId)

export const updateUserActive = async (userId: number, active: boolean): Promise<User> =>
  RegrowUserService.updateActive(userId, active)

// ============================================================
// 権限取得（ログインユーザーのRgロール）
// ============================================================

export const getCurrentUserRgRole = async (userId: number): Promise<StaffRole> =>
  RegrowUserService.getRgRoleByUserId(userId)

// ============================================================
// Delete
// ============================================================

export const deleteRegrowUser = async (userId: number): Promise<void> =>
  RegrowUserService.deleteUser(userId)

// ============================================================
// バッチ紐付け（既存データのuserId/storeIdを一括セット）
// ============================================================

type BatchLinkResult = {
  staffRecordUpdated: number
  staffRecordSkipped: number
  manualDataUpdated: number
  manualDataSkipped: number
}

/** 既存RgStaffRecord/RgStaffManualDataにuserId/storeIdを一括紐付け */
export const batchLinkStaffData = async (): Promise<BatchLinkResult> => {
  // regrow User（rgStoreId付き）を全件取得
  const rgUsers = await prisma.user.findMany({
    where: {apps: {has: 'regrow'}, rgStoreId: {not: null}, active: true},
    include: {RgStoreRg: true},
  })

  // staffName_storeId → userId マップ
  const userMap = new Map<string, number>()
  for (const u of rgUsers) {
    if (u.RgStoreRg) {
      userMap.set(`${u.name}_${u.rgStoreId}`, u.id)
    }
  }

  // 店舗名→IDマップ
  const stores = await prisma.rgStore.findMany()
  const storeNameToId = new Map(stores.map((s) => [s.name, s.id]))

  // 1. RgStaffRecord の userId 紐付け（userId=NULL のもの）
  const unlinkedRecords = await prisma.rgStaffRecord.findMany({
    where: {userId: null},
    include: {RgStore: true},
  })

  let staffRecordUpdated = 0
  let staffRecordSkipped = 0
  for (const record of unlinkedRecords) {
    const userId = userMap.get(`${record.staffName}_${record.storeId}`)
    if (userId) {
      await prisma.rgStaffRecord.update({
        where: {id: record.id},
        data: {userId},
      })
      staffRecordUpdated++
    } else {
      staffRecordSkipped++
    }
  }

  // 2. RgStaffManualData の storeId/userId 紐付け
  // storeId=0 または未設定のものを対象（storeName列が残っている既存データ向け）
  const allManualData = await prisma.rgStaffManualData.findMany({
    where: {userId: null},
  })

  let manualDataUpdated = 0
  let manualDataSkipped = 0
  for (const md of allManualData) {
    const userId = userMap.get(`${md.staffName}_${md.storeId}`)
    if (userId) {
      await prisma.rgStaffManualData.update({
        where: {id: md.id},
        data: {userId},
      })
      manualDataUpdated++
    } else {
      manualDataSkipped++
    }
  }

  return {staffRecordUpdated, staffRecordSkipped, manualDataUpdated, manualDataSkipped}
}
