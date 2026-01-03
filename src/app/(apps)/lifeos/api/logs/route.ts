import { NextRequest, NextResponse } from 'next/server'
import { logStore, getOrCreateCategory } from '../../lib/store'
import { ArchetypeType, EnrichedSchema } from '../../types'

/**
 * ログ一覧取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryName = searchParams.get('category') || undefined
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const logs = await logStore.getAll({ categoryName, limit, offset })
    const total = await logStore.count({ categoryName })

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
      { status: 500 }
    )
  }
}

/**
 * ログ作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, schema, archetype, data, description } = body

    if (!category || !archetype) {
      return NextResponse.json(
        {
          success: false,
          error: 'カテゴリとアーキタイプが必要です',
        },
        { status: 400 }
      )
    }

    // カテゴリを取得または作成
    const categoryRecord = await getOrCreateCategory(
      category,
      (schema || {}) as EnrichedSchema,
      `${category}に関するログ`
    )

    // ログを作成（schemaフィールドは削除、カテゴリのスキーマを参照）
    const log = await logStore.create({
      archetype: archetype as ArchetypeType,
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
      { status: 500 }
    )
  }
}
