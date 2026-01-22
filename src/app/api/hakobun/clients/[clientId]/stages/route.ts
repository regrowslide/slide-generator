import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'

// ステージ一覧取得
export async function GET(request: NextRequest, {params}: {params: Promise<{clientId: string}>}) {
  try {
    const {clientId} = await params

    const stages = await prisma.hakobunClientStage.findMany({
      where: {hakobunClientId: parseInt(clientId)},
      orderBy: {sortOrder: 'asc'},
    })

    return NextResponse.json({
      success: true,
      stages,
    })
  } catch (error) {
    console.error('Get stages error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

// ステージ作成
export async function POST(request: NextRequest, {params}: {params: Promise<{clientId: string}>}) {
  try {
    const {clientId} = await params
    const body = await request.json()
    const {name, description} = body

    if (!name) {
      return NextResponse.json(
        {success: false, error: 'ステージ名は必須です'},
        {status: 400}
      )
    }

    // 最大sortOrderを取得
    const maxSortOrder = await prisma.hakobunClientStage.aggregate({
      where: {hakobunClientId: parseInt(clientId)},
      _max: {sortOrder: true},
    })

    const stage = await prisma.hakobunClientStage.create({
      data: {
        name,
        description: description || null,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
        hakobunClientId: parseInt(clientId),
      },
    })

    return NextResponse.json({
      success: true,
      stage,
    })
  } catch (error) {
    console.error('Create stage error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

// ステージ更新
export async function PUT(request: NextRequest, {params}: {params: Promise<{clientId: string}>}) {
  try {
    const body = await request.json()
    const {id, name, description, sortOrder, enabled} = body

    if (!id) {
      return NextResponse.json(
        {success: false, error: 'IDは必須です'},
        {status: 400}
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description || null
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder
    if (enabled !== undefined) updateData.enabled = enabled

    const stage = await prisma.hakobunClientStage.update({
      where: {id},
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      stage,
    })
  } catch (error) {
    console.error('Update stage error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

// ステージ削除
export async function DELETE(request: NextRequest, {params}: {params: Promise<{clientId: string}>}) {
  try {
    const {searchParams} = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {success: false, error: 'IDは必須です'},
        {status: 400}
      )
    }

    await prisma.hakobunClientStage.delete({
      where: {id: parseInt(id)},
    })

    return NextResponse.json({success: true})
  } catch (error) {
    console.error('Delete stage error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
