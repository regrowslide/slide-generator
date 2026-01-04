import {NextRequest, NextResponse} from 'next/server'
import {categoryStore} from '../../lib/store'

/**
 * カテゴリ一覧取得
 */
export async function GET() {
  try {
    const categories = await categoryStore.getAll()

    return NextResponse.json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error('Failed to fetch categories:', error)
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
 * カテゴリ作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {name, description, schema, archetypes} = body

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: 'カテゴリ名が必要です',
        },
        {status: 400}
      )
    }

    // 既存カテゴリの確認
    const existing = await categoryStore.getByName(name)
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `カテゴリ「${name}」は既に存在します`,
        },
        {status: 400}
      )
    }

    const category = await categoryStore.create({
      name,
      description: description || '',
      schema: schema || {},
      archetypes: archetypes || [],
    })

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
