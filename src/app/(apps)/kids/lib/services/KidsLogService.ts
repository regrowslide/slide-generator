import prisma from 'src/lib/prisma'
import { toJst } from '@cm/class/Days/date-utils/calculations'

export class KidsLogService {
  // ── Read ──

  /** 今日のJST日付文字列を取得 */
  static getTodayDateString(): string {
    const now = toJst(new Date())
    return now.toISOString().split('T')[0]
  }

  /** 今日の完了済みルーチンIDリストを取得 */
  static async getTodayCompletedIds(childId: number): Promise<number[]> {
    const today = this.getTodayDateString()
    const logs = await prisma.kidsRoutineLog.findMany({
      where: { childId, date: today },
      select: { routineId: true },
    })
    return logs.map((l) => l.routineId)
  }

  /** 実績履歴を取得（新しい順） */
  static async getAchievements(childId: number, limit = 500) {
    return prisma.kidsAchievement.findMany({
      where: { childId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  /** 実績の総数 */
  static async getAchievementCount(childId: number) {
    return prisma.kidsAchievement.count({
      where: { childId },
    })
  }

  /** 連続日数情報を取得 */
  static async getStreak(childId: number) {
    const streak = await prisma.kidsStreak.findUnique({
      where: { childId },
    })
    return {
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      lastCompletedDate: streak?.lastCompletedDate ?? null,
    }
  }

  // ── Create / Toggle ──

  /** ルーチン完了をトグル（ON/OFF） */
  static async toggleRoutine(
    routineId: number,
    childId: number,
    routineName: string,
    routineSticker: string
  ) {
    const today = this.getTodayDateString()

    // 既存ログを確認
    const existing = await prisma.kidsRoutineLog.findUnique({
      where: {
        routineId_childId_date: { routineId, childId, date: today },
      },
    })

    if (existing) {
      // OFF: ログを削除（実績は残す）
      await prisma.kidsRoutineLog.delete({
        where: { id: existing.id },
      })
      return { completed: false }
    } else {
      // ON: ログ作成 + 実績追加
      await prisma.$transaction([
        prisma.kidsRoutineLog.create({
          data: { routineId, childId, date: today },
        }),
        prisma.kidsAchievement.create({
          data: {
            childId,
            sticker: routineSticker,
            name: routineName,
            date: today,
          },
        }),
      ])

      // 連続日数を更新
      await this.updateStreak(childId)

      return { completed: true }
    }
  }

  /** 今日のルーチンを全リセット（実績は残す） */
  static async resetToday(childId: number) {
    const today = this.getTodayDateString()
    await prisma.kidsRoutineLog.deleteMany({
      where: { childId, date: today },
    })
  }

  // ── Streak ──

  /** 連続日数を更新 */
  private static async updateStreak(childId: number) {
    const today = this.getTodayDateString()

    // アクティブなルーチン総数を取得
    const totalRoutines = await prisma.kidsRoutine.count({
      where: {
        KidsCategory: { childId, isArchived: false },
        isArchived: false,
      },
    })

    // 今日の完了数
    const completedToday = await prisma.kidsRoutineLog.count({
      where: { childId, date: today },
    })

    // 全完了でなければストリーク更新しない
    if (completedToday < totalRoutines) return

    const streak = await prisma.kidsStreak.findUnique({ where: { childId } })
    if (!streak) return

    let newStreak = 1

    if (streak.lastCompletedDate) {
      // 前日の日付を計算
      const lastDate = new Date(streak.lastCompletedDate + 'T00:00:00+09:00')
      const todayDate = new Date(today + 'T00:00:00+09:00')
      const diffDays = Math.round(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === 1) {
        // 連続
        newStreak = streak.currentStreak + 1
      } else if (diffDays === 0) {
        // 同日（既に更新済み）
        newStreak = streak.currentStreak
      }
      // diffDays > 1 の場合はリセット（newStreak = 1のまま）
    }

    await prisma.kidsStreak.update({
      where: { childId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        lastCompletedDate: today,
      },
    })
  }
}
