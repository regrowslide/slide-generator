import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'

// 分析結果（Voice）一覧取得
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

    const voices = await prisma.hakobunVoice.findMany({
      where: {hakobunClientId: client.id},
      orderBy: {createdAt: 'desc'},
      take: 1000, // 最大1000件
    })

    return NextResponse.json({
      success: true,
      voices,
    })
  } catch (error) {
    console.error('Get voices error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
