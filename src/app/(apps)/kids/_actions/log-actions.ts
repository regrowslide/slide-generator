'use server'

import { KidsLogService } from '../lib/services/KidsLogService'

// ── Read ──

export async function getTodayCompletedIds(childId: number) {
  return KidsLogService.getTodayCompletedIds(childId)
}

export async function getAchievements(childId: number) {
  return KidsLogService.getAchievements(childId)
}

export async function getAchievementCount(childId: number) {
  return KidsLogService.getAchievementCount(childId)
}

export async function getStreak(childId: number) {
  return KidsLogService.getStreak(childId)
}

// ── Create / Toggle ──

export async function toggleRoutine(
  routineId: number,
  childId: number,
  routineName: string,
  routineSticker: string
) {
  return KidsLogService.toggleRoutine(routineId, childId, routineName, routineSticker)
}

// ── Delete ──

export async function resetToday(childId: number) {
  return KidsLogService.resetToday(childId)
}
