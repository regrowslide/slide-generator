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

export const getStores = async (): Promise<RgStore[]> => RegrowStoreService.getStores()

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
