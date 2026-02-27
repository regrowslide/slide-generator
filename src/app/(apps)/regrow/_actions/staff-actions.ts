'use server'

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

// ============================================================
// 権限取得（ログインユーザーのRgロール）
// ============================================================

export const getCurrentUserRgRole = async (userId: number): Promise<StaffRole> =>
  RegrowUserService.getRgRoleByUserId(userId)
