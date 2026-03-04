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

export const updateRegrowUser = async (
  userId: number,
  data: {name?: string; email?: string; password?: string}
): Promise<User> => RegrowUserService.updateUser(userId, data)

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
  // regrow Userを全件取得
  const rgUsers = await prisma.user.findMany({
    where: {apps: {has: 'regrow'}, active: true},
  })

  // staffName → userId マップ（同名ユーザーがいる場合はスキップ）
  const userMap = new Map<string, number>()
  const duplicateNames = new Set<string>()
  for (const u of rgUsers) {
    if (userMap.has(u.name)) {
      duplicateNames.add(u.name)
    } else {
      userMap.set(u.name, u.id)
    }
  }
  // 重複した名前は自動マッチから除外（バッチ処理なので安全側に倒す）
  for (const name of duplicateNames) {
    userMap.delete(name)
  }

  // 1. RgStaffRecord の userId 紐付け（userId=NULL のもの）
  const unlinkedRecords = await prisma.rgStaffRecord.findMany({
    where: {userId: null},
    include: {RgStore: true},
  })

  let staffRecordUpdated = 0
  let staffRecordSkipped = 0
  for (const record of unlinkedRecords) {
    const userId = userMap.get(record.staffName)
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

  // 2. RgStaffManualData の userId 紐付け
  const allManualData = await prisma.rgStaffManualData.findMany({
    where: {userId: null},
  })

  let manualDataUpdated = 0
  let manualDataSkipped = 0
  for (const md of allManualData) {
    const userId = userMap.get(md.staffName)
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
