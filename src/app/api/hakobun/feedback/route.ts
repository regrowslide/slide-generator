import {Days} from './../../../../cm/class/Days/Days'
import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {FeedbackRequest, FeedbackResponse} from '@app/(apps)/hakobun/types'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'

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
        rawSegment: c.original_sentence,

        // 修正前の情報（日本語名称で記録）
        originalGeneralCategory: c.original_general_category || null,
        originalCategory: c.original_category || null,
        originalSentiment: c.original_sentiment || null,

        // 修正後の情報（日本語名称で記録）
        correctGeneralCategory: c.correct_general_category || null,
        correctCategory: c.correct_category,
        correctSentiment: c.correct_sentiment,

        // 後方互換性のため（非推奨フィールド）
        correctCategoryCode: c.correct_category,
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
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = searchParams.get('limit')

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

    const where: any = {
      hakobunClientId: client.id,
      ...(includeArchived ? {} : {archived: false}),
    }

    // 期間フィルタ
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = getMidnight(new Date(startDate))
      }
      if (endDate) {
        where.createdAt.lt = Days.day.add(getMidnight(new Date(endDate)), 1)
      }
    }

    const corrections = await prisma.hakobunCorrection.findMany({
      where,
      orderBy: {createdAt: 'desc'},
      ...(limit ? {take: parseInt(limit)} : {}),
    })

    return NextResponse.json({
      success: true,
      corrections,
      count: corrections.length,
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
