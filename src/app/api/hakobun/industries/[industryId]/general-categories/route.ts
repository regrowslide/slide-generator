import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'

// 業種別一般カテゴリ取得
export async function GET(request: NextRequest, {params}: {params: {industryId: string}}) {
  try {
    const industryId = parseInt(params.industryId)

    if (!industryId || isNaN(industryId)) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なindustryIdです',
        },
        {status: 400}
      )
    }

    const generalCategories = await prisma.hakobunIndustryGeneralCategory.findMany({
      where: {industryId},
      orderBy: {sortOrder: 'asc'},
    })

    return NextResponse.json({
      success: true,
      generalCategories,
    })
  } catch (error) {
    console.error('Get industry general categories error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

// 一般カテゴリ作成
export async function POST(request: NextRequest, {params}: {params: {industryId: string}}) {
  try {
    const industryId = parseInt(params.industryId)

    if (!industryId || isNaN(industryId)) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なindustryIdです',
        },
        {status: 400}
      )
    }

    const body = await request.json()
    const {name, description, sortOrder} = body

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: 'nameは必須です',
        },
        {status: 400}
      )
    }

    // 業種の存在確認
    const industry = await prisma.hakobunIndustry.findUnique({
      where: {id: industryId},
    })

    if (!industry) {
      return NextResponse.json(
        {
          success: false,
          error: '業種が見つかりません',
        },
        {status: 404}
      )
    }

    const generalCategory = await prisma.hakobunIndustryGeneralCategory.create({
      data: {
        industryId,
        name,
        description: description || null,
        sortOrder: sortOrder ?? 0,
      },
    })

    return NextResponse.json({
      success: true,
      generalCategory,
    })
  } catch (error) {
    console.error('Create general category error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
