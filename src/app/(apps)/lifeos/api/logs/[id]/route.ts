import {NextRequest, NextResponse} from 'next/server'
import {logStore} from '../../../lib/store'

interface RouteParams {
  params: Promise<{id: string}>
}

/**
 * ログ取得
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

    const log = await logStore.getById(numId)

    if (!log) {
      return NextResponse.json(
        {
          success: false,
          error: 'ログが見つかりません',
        },
        {status: 404}
      )
    }

    return NextResponse.json({
      success: true,
      log,
    })
  } catch (error) {
    console.error('Failed to fetch log:', error)
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
 * ログ更新
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
    const {data, description, archetype, categoryId} = body

    const log = await logStore.update(numId, {
      data,
      description,
      archetype,
      categoryId,
    })

    if (!log) {
      return NextResponse.json(
        {
          success: false,
          error: 'ログが見つかりません',
        },
        {status: 404}
      )
    }

    return NextResponse.json({
      success: true,
      log,
    })
  } catch (error) {
    console.error('Failed to update log:', error)
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
 * ログ削除
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

    const success = await logStore.delete(numId)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'ログが見つかりません',
        },
        {status: 404}
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Failed to delete log:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
