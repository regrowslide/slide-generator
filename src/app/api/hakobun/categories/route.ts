import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {CategoriesResponse} from '@app/(apps)/hakobun/types'

// カテゴリ一覧取得
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)
    const clientId = searchParams.get('client_id')

    if (!clientId) {
      return NextResponse.json(
        {
          success: false,
          error: 'client_id は必須です',
        } as CategoriesResponse,
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
        } as CategoriesResponse,
        {status: 404}
      )
    }

    const categories = await prisma.hakobunCategory.findMany({
      where: {hakobunClientId: client.id},
      orderBy: [{generalCategory: 'asc'}, {specificCategory: 'asc'}],
    })

    return NextResponse.json({
      success: true,
      categories,
    } as CategoriesResponse)
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as CategoriesResponse,
      {status: 500}
    )
  }
}

// カテゴリ作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {client_id, category_code, general_category, specific_category, description} = body

    if (!client_id || !category_code || !general_category || !specific_category) {
      return NextResponse.json(
        {
          success: false,
          error: 'client_id, category_code, general_category, specific_category は必須です',
        },
        {status: 400}
      )
    }

    const client = await prisma.hakobunClient.findUnique({
      where: {clientId: client_id},
    })

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: `クライアント "${client_id}" が見つかりません`,
        },
        {status: 404}
      )
    }

    const category = await prisma.hakobunCategory.create({
      data: {
        categoryCode: category_code,
        generalCategory: general_category,
        specificCategory: specific_category,
        description: description || null,
        enabled: true, // デフォルトで有効
        hakobunClientId: client.id,
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

// カテゴリ更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {id, general_category, specific_category, description, enabled} = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'id は必須です',
        },
        {status: 400}
      )
    }

    const category = await prisma.hakobunCategory.update({
      where: {id},
      data: {
        ...(general_category && {generalCategory: general_category}),
        ...(specific_category && {specificCategory: specific_category}),
        ...(description !== undefined && {description}),
        ...(enabled !== undefined && {enabled}),
      },
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

// カテゴリ削除
export async function DELETE(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'id は必須です',
        },
        {status: 400}
      )
    }

    await prisma.hakobunCategory.delete({
      where: {id: parseInt(id)},
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
