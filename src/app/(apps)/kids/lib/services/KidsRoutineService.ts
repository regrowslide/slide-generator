import prisma from 'src/lib/prisma'

export class KidsRoutineService {
  // ── Read ──

  static async getRoutineById(routineId: number) {
    return prisma.kidsRoutine.findUnique({
      where: { id: routineId },
      include: { KidsCategory: { select: { childId: true } } },
    })
  }

  // ── Create ──

  static async createRoutine(
    categoryId: number,
    data: { name: string; emoji: string; sticker: string }
  ) {
    const maxSort = await prisma.kidsRoutine.aggregate({
      where: { categoryId },
      _max: { sortOrder: true },
    })
    return prisma.kidsRoutine.create({
      data: {
        categoryId,
        name: data.name,
        emoji: data.emoji,
        sticker: data.sticker,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
    })
  }

  /** AI提案ルーチンの一括追加（適切なカテゴリに配置） */
  static async createRoutinesFromSuggestions(
    childId: number,
    suggestions: Array<{
      name: string
      emoji: string
      sticker: string
      categoryId: number
      sortOrder: number
    }>
  ) {
    return prisma.$transaction(
      suggestions.map((s) =>
        prisma.kidsRoutine.create({
          data: {
            categoryId: s.categoryId,
            name: s.name,
            emoji: s.emoji,
            sticker: s.sticker,
            sortOrder: s.sortOrder,
          },
        })
      )
    )
  }

  // ── Update ──

  static async updateRoutine(
    routineId: number,
    data: { name?: string; emoji?: string; sticker?: string; isArchived?: boolean }
  ) {
    return prisma.kidsRoutine.update({
      where: { id: routineId },
      data,
    })
  }

  /** ルーチンの並び替え */
  static async reorderRoutines(orderedIds: number[]) {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.kidsRoutine.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    )
  }

  // ── Delete ──

  static async deleteRoutine(routineId: number) {
    return prisma.kidsRoutine.delete({
      where: { id: routineId },
    })
  }
}
