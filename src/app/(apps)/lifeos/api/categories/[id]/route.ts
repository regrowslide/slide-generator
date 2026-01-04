import {NextRequest, NextResponse} from 'next/server'
import {categoryStore} from '../../../lib/store'

interface RouteParams {
  params: Promise<{id: string}>
}

/**
 * カテゴリ取得
 */
export async function GET(request: NextRequest, {params}: RouteParams) {
  try {
    const {id} = await params
    const numId = parseInt(id, 10)

    if (isNaN(numId)) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なIDです',
        },
        {status: 400}
      )
    }

    const category = await categoryStore.getById(numId)

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'カテゴリが見つかりません',
        },
        {status: 404}
      )
    }

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (error) {
    console.error('Failed to fetch category:', error)
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
 * カテゴリ更新
 */
export async function PUT(request: NextRequest, {params}: RouteParams) {
  try {
    const {id} = await params
    const numId = parseInt(id, 10)

    if (isNaN(numId)) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なIDです',
        },
        {status: 400}
      )
    }

    const body = await request.json()
    const {name, description, schema, archetypes} = body

    const category = await categoryStore.update(numId, {
      name,
      description,
      schema,
      archetypes,
    })

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'カテゴリが見つかりません',
        },
        {status: 404}
      )
    }

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (error) {
    console.error('Failed to update category:', error)
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
 * カテゴリ削除
 */
export async function DELETE(request: NextRequest, {params}: RouteParams) {
  try {
    const {id} = await params
    const numId = parseInt(id, 10)

    if (isNaN(numId)) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なIDです',
        },
        {status: 400}
      )
    }

    const success = await categoryStore.delete(numId)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'カテゴリが見つかりません',
        },
        {status: 404}
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
