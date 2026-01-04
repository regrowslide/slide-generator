import { NextResponse } from 'next/server'
import { getStats } from '../../lib/store'

/**
 * 統計情報取得
 */
export async function GET() {
  try {
    const stats = await getStats()

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
