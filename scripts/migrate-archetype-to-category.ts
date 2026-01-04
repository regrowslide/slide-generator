/**
 * マイグレーションスクリプト: archetypeをログからカテゴリに移行
 *
 * 実行方法:
 * npx tsx scripts/migrate-archetype-to-category.ts
 *
 * このスクリプトは:
 * 1. 既存のログからarchetypeを取得
 * 2. カテゴリごとにarchetypeを集約
 * 3. カテゴリのarchetypesフィールドを更新
 * 4. ログのarchetypeフィールドは削除（Prismaマイグレーションで実施）
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateArchetypesToCategories() {
  console.log('archetype移行を開始します...')

  try {
    // すべてのログを取得（archetypeフィールドが存在する場合）
    const logs = await prisma.lifeOSLog.findMany({
      include: {
        category: true,
      },
    })

    console.log(`${logs.length}件のログを取得しました`)

    // カテゴリごとにarchetypeを集約
    const categoryArchetypes: Record<number, Set<string>> = {}

    for (const log of logs) {
      const categoryId = log.categoryId

      // Prismaスキーマからarchetypeフィールドが削除される前のデータを処理
      // @ts-ignore - マイグレーション前のフィールドにアクセス
      const archetype = (log as any).archetype

      if (archetype && typeof archetype === 'string') {
        if (!categoryArchetypes[categoryId]) {
          categoryArchetypes[categoryId] = new Set()
        }
        categoryArchetypes[categoryId].add(archetype)
      }
    }

    console.log(`${Object.keys(categoryArchetypes).length}件のカテゴリでarchetypeを集約しました`)

    // カテゴリのarchetypesフィールドを更新
    for (const [categoryIdStr, archetypeSet] of Object.entries(categoryArchetypes)) {
      const categoryId = parseInt(categoryIdStr, 10)
      const archetypes = Array.from(archetypeSet)

      await prisma.lifeOSCategory.update({
        where: { id: categoryId },
        data: {
          archetypes: archetypes as any,
        },
      })

      const category = await prisma.lifeOSCategory.findUnique({
        where: { id: categoryId },
      })

      console.log(`カテゴリID ${categoryId} (${category?.name}): ${archetypes.join(', ')} を設定しました`)
    }

    console.log('archetype移行が完了しました')
  } catch (error) {
    console.error('マイグレーションエラー:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// スクリプト実行
migrateArchetypesToCategories()
  .then(() => {
    console.log('マイグレーションが正常に完了しました')
    process.exit(0)
  })
  .catch((error) => {
    console.error('マイグレーションが失敗しました:', error)
    process.exit(1)
  })

