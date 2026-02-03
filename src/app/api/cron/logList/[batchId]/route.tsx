import { NextRequest, NextResponse } from 'next/server'
import prisma from 'src/lib/prisma'

/**
 * バッチ実行ログ取得API
 * GET /api/cron/logList/[batchId]
 *
 * クエリパラメータ:
 * - limit: 取得件数（デフォルト: 50）
 */
export const GET = async (req: NextRequest, { params }: { params: Promise<{ batchId: string }> }) => {
  const { batchId } = await params
  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') || '50', 10)

  try {
    // 最新のログ（1件）
    const latestLog = await prisma.cronExecutionLog.findFirst({
      where: { batchId },
      orderBy: { startedAt: 'desc' },
    })
    //
    // 履歴ログ（最大limit件）
    const historyLogList = await prisma.cronExecutionLog.findMany({
      where: { batchId },
      orderBy: { startedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({
      success: true,
      latest: latestLog,
      history: historyLogList,
    })
  } catch (error: any) {
    console.error(`[CRON LOG] Error fetching logList for batch: ${batchId}`, error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch logList: ${error.message}`,
        latest: null,
        history: [],
      },
      { status: 500 }
    )
  }
}
