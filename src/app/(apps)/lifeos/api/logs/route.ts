import {NextRequest, NextResponse} from 'next/server'
import {logStore, getOrCreateCategory} from '../../lib/store'
import {ArchetypeType, EnrichedSchema} from '../../types'

/**
 * ログ一覧取得
 */
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)
    const categoryName = searchParams.get('category') || undefined
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const logs = await logStore.getAll({categoryName, limit, offset})
    const total = await logStore.count({categoryName})

    return NextResponse.json({
      success: true,
      logs,
      total,
    })
  } catch (error) {
    console.error('Failed to fetch logs:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

/**
 * ログ作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {category, schema, archetype, data, description} = body

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'カテゴリが必要です',
        },
        {status: 400}
      )
    }

    // カテゴリを取得または作成
    const categoryRecord = await getOrCreateCategory(
      category,
      (schema || {}) as EnrichedSchema,
      `${category}に関するログ`,
      archetype ? [archetype as ArchetypeType] : []
    )

    // 既存カテゴリの場合、archetypeが含まれていない場合は追加
    if (archetype && categoryRecord.archetypes && !categoryRecord.archetypes.includes(archetype as ArchetypeType)) {
      await categoryStore.update(categoryRecord.id, {
        archetypes: [...categoryRecord.archetypes, archetype as ArchetypeType],
      })
      // 更新後のカテゴリを再取得
      const updatedCategory = await categoryStore.getById(categoryRecord.id)
      if (updatedCategory) {
        Object.assign(categoryRecord, updatedCategory)
      }
    }

    // ログを作成（archetypeフィールドは削除、カテゴリのarchetypesを参照）
    const log = await logStore.create({
      data: data || {},
      description: description || undefined,
      categoryId: categoryRecord.id,
    })

    return NextResponse.json({
      success: true,
      log,
    })
  } catch (error) {
    console.error('Failed to create log:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
