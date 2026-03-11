'use server'

import { KidsCategoryService } from '../lib/services/KidsCategoryService'
import { KidsRoutineService } from '../lib/services/KidsRoutineService'

// ── Read ──

export async function getAllCategories(childId: number) {
  return KidsCategoryService.getAllCategories(childId)
}

// ── Create ──

export async function createCategory(childId: number, name: string, emoji: string) {
  return KidsCategoryService.createCategory(childId, name, emoji)
}

export async function createRoutine(
  categoryId: number,
  data: { name: string; emoji: string; sticker: string }
) {
  return KidsRoutineService.createRoutine(categoryId, data)
}

export async function createRoutinesFromSuggestions(
  childId: number,
  suggestions: Array<{
    name: string
    emoji: string
    sticker: string
    categoryId: number
    sortOrder: number
  }>
) {
  return KidsRoutineService.createRoutinesFromSuggestions(childId, suggestions)
}

// ── Update ──

export async function updateCategory(
  categoryId: number,
  data: { name?: string; emoji?: string; isArchived?: boolean }
) {
  return KidsCategoryService.updateCategory(categoryId, data)
}

export async function updateRoutine(
  routineId: number,
  data: { name?: string; emoji?: string; sticker?: string; isArchived?: boolean }
) {
  return KidsRoutineService.updateRoutine(routineId, data)
}

export async function reorderCategories(orderedIds: number[]) {
  return KidsCategoryService.reorderCategories(orderedIds)
}

export async function reorderRoutines(orderedIds: number[]) {
  return KidsRoutineService.reorderRoutines(orderedIds)
}

// ── Delete ──

export async function deleteCategory(categoryId: number) {
  return KidsCategoryService.deleteCategory(categoryId)
}

export async function deleteRoutine(routineId: number) {
  return KidsRoutineService.deleteRoutine(routineId)
}
