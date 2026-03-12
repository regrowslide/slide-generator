import prisma from 'src/lib/prisma'
import {DEFAULT_CATEGORIES} from '../constants'

export class KidsChildService {
  // ── Read ──

  /** 保護者のユーザーIDから子ども一覧を取得 */
  static async getChildrenByUserId(userId: string) {
    return prisma.kidsChild.findMany({
      where: {userId},
      orderBy: {sortOrder: 'asc'},
    })
  }

  /** 子ども詳細（カテゴリ＋ルーチン付き） */
  static async getChildWithCategories(childId: number) {
    return prisma.kidsChild.findUnique({
      where: {id: childId},
      include: {
        KidsCategory: {
          where: {isArchived: false},
          orderBy: {sortOrder: 'asc'},
          include: {
            KidsRoutine: {
              where: {isArchived: false},
              orderBy: {sortOrder: 'asc'},
            },
          },
        },
      },
    })
  }

  /** 子どもが指定ユーザーの子かどうか確認 */
  static async isOwnChild(childId: number, userId: string) {
    const child = await prisma.kidsChild.findFirst({
      where: {id: childId, userId},
      select: {id: true},
    })
    return !!child
  }

  // ── Create ──

  /** 子どもを作成し、デフォルトカテゴリ＋ルーチンも自動生成 */
  static async createChild(userId: string, name: string, emoji: string) {
    const childCount = await prisma.kidsChild.count({where: {userId}})

    const child = await prisma.kidsChild.create({
      data: {
        userId,
        name,
        emoji,
        sortOrder: childCount,
      },
    })

    // デフォルトカテゴリ＋ルーチンを一括作成
    for (let ci = 0; ci < DEFAULT_CATEGORIES.length; ci++) {
      const catDef = DEFAULT_CATEGORIES[ci]
      const category = await prisma.kidsCategory.create({
        data: {
          childId: child.id,
          name: catDef.name,
          emoji: catDef.emoji,
          sortOrder: ci,
        },
      })

      await prisma.kidsRoutine.createMany({
        data: catDef.routines.map((r, ri) => ({
          categoryId: category.id,
          name: r.name,
          emoji: r.emoji,
          sticker: r.sticker,
          sortOrder: ri,
        })),
      })
    }

    // 連続日数レコードを作成
    await prisma.kidsStreak.create({
      data: {childId: child.id},
    })

    return child
  }

  // ── Update ──

  static async updateChild(childId: number, data: {name?: string; emoji?: string}) {
    return prisma.kidsChild.update({
      where: {id: childId},
      data,
    })
  }

  // ── Delete ──

  static async deleteChild(childId: number) {
    return prisma.kidsChild.delete({
      where: {id: childId},
    })
  }
}
