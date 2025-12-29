import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'

// クライアントの全データを関係性とともに取得
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)
    const clientId = searchParams.get('client_id')

    if (!clientId) {
      return NextResponse.json(
        {
          success: false,
          error: 'client_id は必須です',
        },
        {status: 400}
      )
    }

    const client = await prisma.hakobunClient.findUnique({
      where: {clientId},
    })

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: `クライアント "${clientId}" が見つかりません`,
        },
        {status: 404}
      )
    }

    // 全データを並列取得
    const [rules, voices, corrections] = await Promise.all([
      prisma.hakobunRule.findMany({
        where: {hakobunClientId: client.id},
        orderBy: [{priority: 'asc'}, {createdAt: 'desc'}],
      }),
      prisma.hakobunVoice.findMany({
        where: {hakobunClientId: client.id},
        orderBy: {createdAt: 'desc'},
        take: 1000,
      }),
      prisma.hakobunCorrection.findMany({
        where: {
          hakobunClientId: client.id,
          archived: false,
        },
        orderBy: {createdAt: 'desc'},
        take: 1000,
      }),
    ])

    return NextResponse.json({
      success: true,
      client,
      data: {
        rules,
        voices,
        corrections,
      },
      summary: {
        rulesCount: rules.length,
        voicesCount: voices.length,
        correctionsCount: corrections.length,
      },
    })
  } catch (error) {
    console.error('Get data overview error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
