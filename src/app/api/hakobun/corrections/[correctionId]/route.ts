import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'

/**
 * Correctionを更新
 */
export async function PATCH(
  request: NextRequest,
  {params}: {params: {correctionId: string}}
) {
  try {
    const correctionId = parseInt(params.correctionId)
    if (isNaN(correctionId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'correctionId が不正です',
        },
        {status: 400}
      )
    }

    const body = await request.json()
    const {
      correct_general_category,
      correct_category,
      correct_sentiment,
      reviewer_comment,
    } = body

    // Correctionが存在するか確認
    const existingCorrection = await prisma.hakobunCorrection.findUnique({
      where: {id: correctionId},
    })

    if (!existingCorrection) {
      return NextResponse.json(
        {
          success: false,
          error: `Correction ID ${correctionId} が見つかりません`,
        },
        {status: 404}
      )
    }

    // 更新
    const updatedCorrection = await prisma.hakobunCorrection.update({
      where: {id: correctionId},
      data: {
        ...(correct_general_category !== undefined && {
          correctGeneralCategory: correct_general_category || null,
        }),
        ...(correct_category !== undefined && {
          correctCategory: correct_category,
        }),
        ...(correct_sentiment !== undefined && {
          correctSentiment: correct_sentiment,
        }),
        ...(reviewer_comment !== undefined && {
          reviewerComment: reviewer_comment || null,
        }),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      correction: updatedCorrection,
    })
  } catch (error) {
    console.error('Update correction error:', error)
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
 * Correctionを削除（アーカイブ）
 */
export async function DELETE(
  request: NextRequest,
  {params}: {params: {correctionId: string}}
) {
  try {
    const correctionId = parseInt(params.correctionId)
    if (isNaN(correctionId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'correctionId が不正です',
        },
        {status: 400}
      )
    }

    // Correctionが存在するか確認
    const existingCorrection = await prisma.hakobunCorrection.findUnique({
      where: {id: correctionId},
    })

    if (!existingCorrection) {
      return NextResponse.json(
        {
          success: false,
          error: `Correction ID ${correctionId} が見つかりません`,
        },
        {status: 404}
      )
    }

    // アーカイブ（削除ではなくarchivedフラグを立てる）
    const archivedCorrection = await prisma.hakobunCorrection.update({
      where: {id: correctionId},
      data: {
        archived: true,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      correction: archivedCorrection,
    })
  } catch (error) {
    console.error('Archive correction error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

