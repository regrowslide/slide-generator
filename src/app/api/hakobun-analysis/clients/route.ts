import {NextRequest, NextResponse} from 'next/server'
import prisma from '@/lib/prisma'
import {ClientsResponse} from '@appDir/(apps)/hakobun-analysis/types'

// クライアント一覧取得
export async function GET() {
  try {
    const clients = await prisma.hakobunClient.findMany({
      orderBy: {name: 'asc'},
    })

    return NextResponse.json({
      success: true,
      clients,
    } as ClientsResponse)
  } catch (error) {
    console.error('Get clients error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as ClientsResponse,
      {status: 500}
    )
  }
}

// クライアント作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {client_id, name} = body

    if (!client_id || !name) {
      return NextResponse.json(
        {
          success: false,
          error: 'client_id, name は必須です',
        },
        {status: 400}
      )
    }

    const client = await prisma.hakobunClient.create({
      data: {
        clientId: client_id,
        name,
      },
    })

    return NextResponse.json({
      success: true,
      client,
    })
  } catch (error) {
    console.error('Create client error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

// クライアント更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {id, name} = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'id は必須です',
        },
        {status: 400}
      )
    }

    const client = await prisma.hakobunClient.update({
      where: {id},
      data: {
        ...(name && {name}),
      },
    })

    return NextResponse.json({
      success: true,
      client,
    })
  } catch (error) {
    console.error('Update client error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

// クライアント削除
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

    await prisma.hakobunClient.delete({
      where: {id: parseInt(id)},
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete client error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
