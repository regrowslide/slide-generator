import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'

// 詳細カテゴリ更新
export async function PUT(request: NextRequest, props) {
  const params = await props.params

  try {
    const detailCategoryId = parseInt(params.detailCategoryId)

    if (!detailCategoryId || isNaN(detailCategoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なdetailCategoryIdです',
        },
        {status: 400}
      )
    }

    const body = await request.json()
    const {name, description, sortOrder, enabled} = body

    // カテゴリの存在確認
    const existing = await prisma.hakobunIndustryCategory.findUnique({
      where: {id: detailCategoryId},
    })

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: '詳細カテゴリが見つかりません',
        },
        {status: 404}
      )
    }

    const updateData: {
      name?: string
      description?: string | null
      sortOrder?: number
      enabled?: boolean
    } = {}

    if (name !== undefined) {
      if (!name) {
        return NextResponse.json(
          {
            success: false,
            error: 'nameは空にできません',
          },
          {status: 400}
        )
      }
      updateData.name = name
    }

    if (description !== undefined) {
      updateData.description = description || null
    }

    if (sortOrder !== undefined) {
      updateData.sortOrder = sortOrder
    }

    if (enabled !== undefined) {
      updateData.enabled = enabled
    }

    const category = await prisma.hakobunIndustryCategory.update({
      where: {id: detailCategoryId},
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

// 詳細カテゴリ削除
export async function DELETE(request: NextRequest, props) {
  const params = await props.params

  try {
    const detailCategoryId = parseInt(params.detailCategoryId)

    if (!detailCategoryId || isNaN(detailCategoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なdetailCategoryIdです',
        },
        {status: 400}
      )
    }

    // カテゴリの存在確認
    const existing = await prisma.hakobunIndustryCategory.findUnique({
      where: {id: detailCategoryId},
    })

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: '詳細カテゴリが見つかりません',
        },
        {status: 404}
      )
    }

    await prisma.hakobunIndustryCategory.delete({
      where: {id: detailCategoryId},
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}













