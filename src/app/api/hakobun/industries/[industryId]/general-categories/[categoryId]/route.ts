import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'

// 一般カテゴリ更新
export async function PUT(request: NextRequest, props) {
  const params = await props.params
  try {
    const industryId = parseInt(params.industryId)
    const categoryId = parseInt(params.categoryId)

    if (!industryId || isNaN(industryId) || !categoryId || isNaN(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なIDです',
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

    // カテゴリの存在確認
    const existing = await prisma.hakobunIndustryGeneralCategory.findUnique({
      where: {id: categoryId},
    })

    if (!existing || existing.industryId !== industryId) {
      return NextResponse.json(
        {
          success: false,
          error: '一般カテゴリが見つかりません',
        },
        {status: 404}
      )
    }

    const generalCategory = await prisma.hakobunIndustryGeneralCategory.update({
      where: {id: categoryId},
      data: {
        name,
        description: description !== undefined ? description : null,
        sortOrder: sortOrder !== undefined ? sortOrder : existing.sortOrder,
      },
    })

    return NextResponse.json({
      success: true,
      generalCategory,
    })
  } catch (error) {
    console.error('Update general category error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

// 一般カテゴリ削除
export async function DELETE(request: NextRequest, props) {
  const params = await props.params

  try {
    const industryId = parseInt(params.industryId)
    const categoryId = parseInt(params.categoryId)

    if (!industryId || isNaN(industryId) || !categoryId || isNaN(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なIDです',
        },
        {status: 400}
      )
    }

    // カテゴリの存在確認
    const existing = await prisma.hakobunIndustryGeneralCategory.findUnique({
      where: {id: categoryId},
    })

    if (!existing || existing.industryId !== industryId) {
      return NextResponse.json(
        {
          success: false,
          error: '一般カテゴリが見つかりません',
        },
        {status: 404}
      )
    }

    await prisma.hakobunIndustryGeneralCategory.delete({
      where: {id: categoryId},
    })

    return NextResponse.json({
      success: true,
      message: '一般カテゴリを削除しました',
    })
  } catch (error) {
    console.error('Delete general category error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
