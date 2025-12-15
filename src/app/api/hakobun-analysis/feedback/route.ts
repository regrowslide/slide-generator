import {NextRequest, NextResponse} from 'next/server'
import prisma from '@/lib/prisma'
import {FeedbackRequest, FeedbackResponse} from '@appDir/(apps)/hakobun-analysis/types'

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json()
    const {client_id, voice_id, corrections} = body

    if (!client_id || !voice_id || !corrections || corrections.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'client_id, voice_id, corrections は必須です',
        } as FeedbackResponse,
        {status: 400}
      )
    }

    // クライアント存在確認
    const client = await prisma.hakobunClient.findUnique({
      where: {clientId: client_id},
    })

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: `クライアント "${client_id}" が見つかりません`,
        } as FeedbackResponse,
        {status: 404}
      )
    }

    // 修正データペアを一括作成
    const createdCorrections = await prisma.hakobunCorrection.createMany({
      data: corrections.map(c => ({
        rawSegment: c.original_text_fragment,
        correctCategoryCode: c.correct_category_code,
        sentiment: c.correct_sentiment,
        reviewerComment: c.reviewer_comment || null,
        archived: false,
        hakobunClientId: client.id,
      })),
    })

    return NextResponse.json({
      success: true,
      saved_count: createdCorrections.count,
    } as FeedbackResponse)
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as FeedbackResponse,
      {status: 500}
    )
  }
}

// 修正データペア一覧取得
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)
    const clientId = searchParams.get('client_id')
    const includeArchived = searchParams.get('include_archived') === 'true'

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

    const corrections = await prisma.hakobunCorrection.findMany({
      where: {
        hakobunClientId: client.id,
        ...(includeArchived ? {} : {archived: false}),
      },
      orderBy: {createdAt: 'desc'},
    })

    return NextResponse.json({
      success: true,
      corrections,
    })
  } catch (error) {
    console.error('Get corrections error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
