'use server'

import {RegrowStaffService} from '../lib/services/RegrowStaffService'
import type {RgStaff, RgStore} from '@prisma/generated/prisma/client'

// ============================================================
// Create
// ============================================================

export const createStaff = async (data: {
  staffName: string
  storeId: number
  role?: string
}): Promise<RgStaff> => RegrowStaffService.createStaff(data)

// ============================================================
// Read
// ============================================================

export const getStaffs = async (
  where?: Partial<{storeId: number; isActive: boolean}>
): Promise<(RgStaff & {RgStore: RgStore})[]> => RegrowStaffService.getStaffs(where)

// ============================================================
// Update
// ============================================================

export const updateStaff = async (
  id: number,
  data: Partial<{staffName: string; storeId: number; role: string; isActive: boolean; sortOrder: number}>
): Promise<RgStaff> => RegrowStaffService.updateStaff(id, data)

// ============================================================
// Delete
// ============================================================

export const deleteStaff = async (id: number): Promise<void> => RegrowStaffService.deleteStaff(id)

// ============================================================
// Upsert（名前+店舗名で検索、なければ作成）
// ============================================================

export const upsertStaffByName = async (staffName: string, storeName: string): Promise<RgStaff> =>
  RegrowStaffService.upsertStaffByName(staffName, storeName)
