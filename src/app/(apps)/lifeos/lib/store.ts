/**
 * LifeOS データストア
 * PostgreSQL (Prisma) を使用してデータを永続化
 */

import prisma from 'src/lib/prisma'
import {EnrichedSchema, ArchetypeType, DBCategory, DBLog} from '../types'

/**
 * カテゴリ関連の操作
 */
export const categoryStore = {
  /**
   * すべてのカテゴリを取得
   */
  getAll: async (): Promise<DBCategory[]> => {
    const categories = await prisma.lifeOSCategory.findMany({
      orderBy: {name: 'asc'},
    })
    return categories.map(cat => ({
      ...cat,
      schema: cat.schema as unknown as EnrichedSchema,
    }))
  },

  /**
   * IDでカテゴリを取得
   */
  getById: async (id: number): Promise<DBCategory | null> => {
    const category = await prisma.lifeOSCategory.findUnique({
      where: {id},
    })
    if (!category) return null
    return {
      ...category,
      schema: category.schema as unknown as EnrichedSchema,
    }
  },

  /**
   * 名前でカテゴリを取得
   */
  getByName: async (name: string): Promise<DBCategory | null> => {
    const category = await prisma.lifeOSCategory.findUnique({
      where: {name},
    })
    if (!category) return null
    return {
      ...category,
      schema: category.schema as unknown as EnrichedSchema,
    }
  },

  /**
   * カテゴリを作成
   */
  create: async (data: {name: string; description?: string; schema: EnrichedSchema}): Promise<DBCategory> => {
    const category = await prisma.lifeOSCategory.create({
      data: {
        name: data.name,
        description: data.description,
        schema: data.schema as any,
      },
    })
    return {
      ...category,
      schema: category.schema as unknown as EnrichedSchema,
    }
  },

  /**
   * カテゴリを更新
   */
  update: async (
    id: number,
    data: {
      name?: string
      description?: string
      schema?: EnrichedSchema
    }
  ): Promise<DBCategory | null> => {
    try {
      const category = await prisma.lifeOSCategory.update({
        where: {id},
        data: {
          name: data.name,
          description: data.description,
          schema: data.schema as any,
        },
      })
      return {
        ...category,
        schema: category.schema as unknown as EnrichedSchema,
      }
    } catch {
      return null
    }
  },

  /**
   * カテゴリを削除
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await prisma.lifeOSCategory.delete({
        where: {id},
      })
      return true
    } catch {
      return false
    }
  },
}

/**
 * ログ関連の操作
 */
export const logStore = {
  /**
   * すべてのログを取得
   */
  getAll: async (filter?: {categoryId?: number; categoryName?: string; limit?: number; offset?: number}): Promise<DBLog[]> => {
    const where: any = {}

    if (filter?.categoryId) {
      where.categoryId = filter.categoryId
    }
    if (filter?.categoryName) {
      where.category = {name: filter.categoryName}
    }

    const logs = await prisma.lifeOSLog.findMany({
      where,
      orderBy: {createdAt: 'desc'},
      take: filter?.limit || 100,
      skip: filter?.offset || 0,
      include: {category: true},
    })

    return logs.map(log => ({
      ...log,
      archetype: log.archetype as ArchetypeType,
      // schemaフィールドは削除（カテゴリのスキーマを参照）
      data: log.data as Record<string, unknown>,
      category: log.category
        ? {
            ...log.category,
            schema: log.category.schema as unknown as EnrichedSchema,
          }
        : undefined,
    }))
  },

  /**
   * IDでログを取得
   */
  getById: async (id: number): Promise<DBLog | null> => {
    const log = await prisma.lifeOSLog.findUnique({
      where: {id},
      include: {category: true},
    })
    if (!log) return null
    return {
      ...log,
      archetype: log.archetype as ArchetypeType,
      // schemaフィールドは削除（カテゴリのスキーマを参照）
      data: log.data as Record<string, unknown>,
      category: log.category
        ? {
            ...log.category,
            schema: log.category.schema as unknown as EnrichedSchema,
          }
        : undefined,
    }
  },

  /**
   * ログを作成
   */
  create: async (data: {
    archetype: ArchetypeType
    data: Record<string, unknown>
    description?: string
    categoryId: number
  }): Promise<DBLog> => {
    const log = await prisma.lifeOSLog.create({
      data: {
        archetype: data.archetype,
        data: data.data as any,
        description: data.description,
        categoryId: data.categoryId,
      },
      include: {category: true},
    })
    return {
      ...log,
      archetype: log.archetype as ArchetypeType,
      // schemaフィールドは削除（カテゴリのスキーマを参照）
      data: log.data as Record<string, unknown>,
      category: log.category
        ? {
            ...log.category,
            schema: log.category.schema as unknown as EnrichedSchema,
          }
        : undefined,
    }
  },

  /**
   * ログを更新
   */
  update: async (
    id: number,
    data: {
      archetype?: ArchetypeType
      data?: Record<string, unknown>
      description?: string
      categoryId?: number
    }
  ): Promise<DBLog | null> => {
    try {
      const log = await prisma.lifeOSLog.update({
        where: {id},
        data: {
          archetype: data.archetype,
          data: data.data as any,
          description: data.description,
          categoryId: data.categoryId,
        },
        include: {category: true},
      })
      return {
        ...log,
        archetype: log.archetype as ArchetypeType,
        // schemaフィールドは削除（カテゴリのスキーマを参照）
        data: log.data as Record<string, unknown>,
        category: log.category
          ? {
              ...log.category,
              schema: log.category.schema as unknown as EnrichedSchema,
            }
          : undefined,
      }
    } catch {
      return null
    }
  },

  /**
   * ログを削除
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await prisma.lifeOSLog.delete({
        where: {id},
      })
      return true
    } catch {
      return false
    }
  },

  /**
   * ログ件数を取得
   */
  count: async (filter?: {categoryId?: number; categoryName?: string}): Promise<number> => {
    const where: any = {}
    if (filter?.categoryId) {
      where.categoryId = filter.categoryId
    }
    if (filter?.categoryName) {
      where.category = {name: filter.categoryName}
    }
    return prisma.lifeOSLog.count({where})
  },
}

/**
 * 統計情報を取得
 */
export const getStats = async () => {
  const [totalLogs, totalCategories, recentLogs, categories] = await Promise.all([
    prisma.lifeOSLog.count(),
    prisma.lifeOSCategory.count(),
    prisma.lifeOSLog.findMany({
      orderBy: {createdAt: 'desc'},
      take: 5,
      include: {category: true},
    }),
    prisma.lifeOSCategory.findMany({
      include: {_count: {select: {logs: true}}},
    }),
  ])

  return {
    totalLogs,
    totalCategories,
    recentLogs: recentLogs.map(log => ({
      ...log,
      archetype: log.archetype as ArchetypeType,
      // schemaフィールドは削除（カテゴリのスキーマを参照）
      data: log.data as Record<string, unknown>,
      category: log.category
        ? {
            ...log.category,
            schema: log.category.schema as unknown as EnrichedSchema,
          }
        : undefined,
    })),
    categoryCounts: categories.map(cat => ({
      category: cat.name,
      count: cat._count.logs,
    })),
  }
}

/**
 * カテゴリ名からカテゴリを取得または作成
 */
export const getOrCreateCategory = async (name: string, schema: EnrichedSchema, description?: string): Promise<DBCategory> => {
  const existing = await categoryStore.getByName(name)
  if (existing) return existing

  return categoryStore.create({
    name,
    description,
    schema,
  })
}
