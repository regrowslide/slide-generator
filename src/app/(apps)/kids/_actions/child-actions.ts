'use server'

import { KidsChildService } from '../lib/services/KidsChildService'

// ── Read ──

export async function getChildren(userId: string) {
  return KidsChildService.getChildrenByUserId(userId)
}

export async function getChildWithCategories(childId: number) {
  return KidsChildService.getChildWithCategories(childId)
}

export async function isOwnChild(childId: number, userId: string) {
  return KidsChildService.isOwnChild(childId, userId)
}

// ── Create ──

export async function createChild(userId: string, name: string, emoji: string) {
  return KidsChildService.createChild(userId, name, emoji)
}

// ── Update ──

export async function updateChild(
  childId: number,
  data: { name?: string; emoji?: string }
) {
  return KidsChildService.updateChild(childId, data)
}

// ── Delete ──

export async function deleteChild(childId: number) {
  return KidsChildService.deleteChild(childId)
}
