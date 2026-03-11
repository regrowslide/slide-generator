import prisma from 'src/lib/prisma'

export class KidsCategoryService {
  // ── Read ──

  /** 子どもIDからカテゴリ一覧を取得（アーカイブ含む） */
  static async getAllCategories(childId: number) {
    return prisma.kidsCategory.findMany({
      where: { childId },
      orderBy: { sortOrder: 'asc' },
      include: {
        KidsRoutine: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
  }

  // ── Create ──

  static async createCategory(childId: number, name: string, emoji: string) {
    const maxSort = await prisma.kidsCategory.aggregate({
      where: { childId },
      _max: { sortOrder: true },
    })
    return prisma.kidsCategory.create({
      data: {
        childId,
        name,
        emoji,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
    })
  }

  // ── Update ──

  static async updateCategory(
    categoryId: number,
    data: { name?: string; emoji?: string; isArchived?: boolean }
  ) {
    return prisma.kidsCategory.update({
      where: { id: categoryId },
      data,
    })
  }

  /** カテゴリの並び替え */
  static async reorderCategories(orderedIds: number[]) {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.kidsCategory.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    )
  }

  // ── Delete ──

  static async deleteCategory(categoryId: number) {
    return prisma.kidsCategory.delete({
      where: { id: categoryId },
    })
  }
}
