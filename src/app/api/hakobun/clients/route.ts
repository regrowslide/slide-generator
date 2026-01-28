import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {ClientsResponse} from '@app/(apps)/hakobun/types'

// クライアント一覧取得
export async function GET() {
  try {
    const clients = await prisma.hakobunClient.findMany({
      include: {
        industry: true,
        HakobunClientStage: {
          orderBy: {sortOrder: 'asc'},
        },
      },
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
    const {client_id, name, industryId} = body

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
        industryId: industryId || null,
      },
    })

    // デフォルトステージを作成
    const defaultStages = []
    for (let i = 0; i < defaultStages.length; i++) {
      await prisma.hakobunClientStage.create({
        data: {
          name: defaultStages[i],
          sortOrder: i,
          hakobunClientId: client.id,
        },
      })
    }

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
    const {id, name, inputDataExplain, analysisStartDate, analysisEndDate, industryId} = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'id は必須です',
        },
        {status: 400}
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (inputDataExplain !== undefined) updateData.inputDataExplain = inputDataExplain || null
    if (analysisStartDate !== undefined) updateData.analysisStartDate = analysisStartDate ? new Date(analysisStartDate) : null
    if (analysisEndDate !== undefined) updateData.analysisEndDate = analysisEndDate ? new Date(analysisEndDate) : null
    if (industryId !== undefined) updateData.industryId = industryId || null

    const client = await prisma.hakobunClient.update({
      where: {id},
      data: updateData,
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
