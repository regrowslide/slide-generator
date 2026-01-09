import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'

// 詳細カテゴリ一覧取得
export async function GET(request: NextRequest, props) {
  const params = await props.params

  try {
    const generalCategoryId = parseInt(params.categoryId)

    if (!generalCategoryId || isNaN(generalCategoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なgeneralCategoryIdです',
        },
        {status: 400}
      )
    }

    const categories = await prisma.hakobunIndustryCategory.findMany({
      where: {generalCategoryId},
      orderBy: {sortOrder: 'asc'},
    })

    return NextResponse.json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

// 詳細カテゴリ作成
export async function POST(request: NextRequest, props) {
  const params = await props.params

  try {
    const generalCategoryId = parseInt(params.categoryId)

    if (!generalCategoryId || isNaN(generalCategoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なgeneralCategoryIdです',
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

    // 一般カテゴリの存在確認
    const generalCategory = await prisma.hakobunIndustryGeneralCategory.findUnique({
      where: {id: generalCategoryId},
    })

    if (!generalCategory) {
      return NextResponse.json(
        {
          success: false,
          error: '一般カテゴリが見つかりません',
        },
        {status: 404}
      )
    }

    const category = await prisma.hakobunIndustryCategory.create({
      data: {
        generalCategoryId,
        name,
        description: description || null,
        sortOrder: sortOrder ?? 0,
        enabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}















