'use server'

import {RegrowStoreService} from '../lib/services/RegrowStoreService'
import type {RgStore} from '@prisma/generated/prisma/client'

// ============================================================
// Create
// ============================================================

export const createStore = async (data: {name: string; fullName?: string}): Promise<RgStore> =>
  RegrowStoreService.createStore(data)

// ============================================================
// Read
// ============================================================

/** 有効な店舗のみ取得（レポート画面用） */
export const getStores = async (): Promise<RgStore[]> => RegrowStoreService.getStores()

/** 全店舗取得（マスタ管理画面用、無効含む） */
export const getAllStores = async (): Promise<RgStore[]> => RegrowStoreService.getAllStores()

// ============================================================
// Update
// ============================================================

export const updateStore = async (
  id: number,
  data: Partial<{name: string; fullName: string | null; isActive: boolean; sortOrder: number}>
): Promise<RgStore> => RegrowStoreService.updateStore(id, data)

// ============================================================
// Delete
// ============================================================

export const deleteStore = async (id: number): Promise<void> => RegrowStoreService.deleteStore(id)
