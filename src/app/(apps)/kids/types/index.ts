import type {
  KidsChild,
  KidsCategory,
  KidsRoutine,
  KidsRoutineLog,
  KidsAchievement,
  KidsStreak,
} from '@prisma/generated/prisma/client'

// DBモデルの再エクスポート
export type {
  KidsChild,
  KidsCategory,
  KidsRoutine,
  KidsRoutineLog,
  KidsAchievement,
  KidsStreak,
}

// カテゴリ + ルーチン結合型
export type CategoryWithRoutines = KidsCategory & {
  KidsRoutine: KidsRoutine[]
}

// 子ども + カテゴリ + ルーチン結合型
export type ChildWithCategories = KidsChild & {
  KidsCategory: CategoryWithRoutines[]
}

// 今日の完了状態
export type TodayStatus = {
  completedRoutineIds: Set<number>
  totalRoutines: number
  completedCount: number
}

// 実績エントリ
export type AchievementEntry = {
  id: number
  sticker: string
  name: string
  date: string
  createdAt: Date
}

// 連続日数
export type StreakInfo = {
  currentStreak: number
  longestStreak: number
  lastCompletedDate: string | null
}

// AI提案のルーチン
export type SuggestedRoutine = {
  name: string
  emoji: string
  sticker: string
  categoryName: string
  categoryEmoji: string
}

// デフォルトルーチン定義
export type DefaultRoutineItem = {
  name: string
  emoji: string
  sticker: string
}

export type DefaultCategoryDef = {
  name: string
  emoji: string
  routines: DefaultRoutineItem[]
}

// 権限
export type KidsScopes = {
  isParent: boolean // ログインユーザーがこの子の保護者か
}
