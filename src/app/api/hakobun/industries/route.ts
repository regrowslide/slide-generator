import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'

// 業種一覧取得
export async function GET(request: NextRequest) {
  try {
    const industries = await prisma.hakobunIndustry.findMany({
      include: {
        generalCategories: {
          include: {
            categories: {
              orderBy: {sortOrder: 'asc'},
            },
          },
          orderBy: {sortOrder: 'asc'},
        },
        _count: {
          select: {
            clients: true,
          },
        },
      },
      orderBy: {code: 'asc'},
    })

    return NextResponse.json({
      success: true,
      industries,
    })
  } catch (error) {
    console.error('Get industries error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

// 業種新規作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {code, name, copyFromIndustryId} = body

    if (!code || !name) {
      return NextResponse.json(
        {success: false, error: 'コードと名称は必須です'},
        {status: 400}
      )
    }

    // コードの重複チェック
    const existing = await prisma.hakobunIndustry.findUnique({
      where: {code},
    })
    if (existing) {
      return NextResponse.json(
        {success: false, error: 'このコードは既に使用されています'},
        {status: 400}
      )
    }

    // 業種作成
    const industry = await prisma.hakobunIndustry.create({
      data: {
        code,
        name,
      },
    })

    // コピー元がある場合はカテゴリをコピー
    if (copyFromIndustryId) {
      const sourceIndustry = await prisma.hakobunIndustry.findUnique({
        where: {id: copyFromIndustryId},
        include: {
          generalCategories: {
            include: {
              categories: true,
            },
            orderBy: {sortOrder: 'asc'},
          },
        },
      })

      if (sourceIndustry) {
        for (const gc of sourceIndustry.generalCategories) {
          const newGc = await prisma.hakobunIndustryGeneralCategory.create({
            data: {
              name: gc.name,
              description: gc.description,
              sortOrder: gc.sortOrder,
              industryId: industry.id,
            },
          })

          // 詳細カテゴリもコピー
          for (const cat of gc.categories) {
            await prisma.hakobunIndustryCategory.create({
              data: {
                name: cat.name,
                description: cat.description,
                sortOrder: cat.sortOrder,
                enabled: cat.enabled,
                generalCategoryId: newGc.id,
              },
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      industry,
    })
  } catch (error) {
    console.error('Create industry error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

// 業種更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {id, code, name} = body

    if (!id) {
      return NextResponse.json(
        {success: false, error: 'IDは必須です'},
        {status: 400}
      )
    }

    // コードの重複チェック（自身以外）
    if (code) {
      const existing = await prisma.hakobunIndustry.findFirst({
        where: {
          code,
          NOT: {id},
        },
      })
      if (existing) {
        return NextResponse.json(
          {success: false, error: 'このコードは既に使用されています'},
          {status: 400}
        )
      }
    }

    const industry = await prisma.hakobunIndustry.update({
      where: {id},
      data: {
        ...(code && {code}),
        ...(name && {name}),
      },
    })

    return NextResponse.json({
      success: true,
      industry,
    })
  } catch (error) {
    console.error('Update industry error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

// 業種削除
export async function DELETE(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {success: false, error: 'IDは必須です'},
        {status: 400}
      )
    }

    // 紐づくクライアントがあるか確認
    const clientCount = await prisma.hakobunClient.count({
      where: {industryId: parseInt(id)},
    })
    if (clientCount > 0) {
      return NextResponse.json(
        {success: false, error: `この業種には${clientCount}件のクライアントが紐づいています。先にクライアントの業種を変更してください。`},
        {status: 400}
      )
    }

    await prisma.hakobunIndustry.delete({
      where: {id: parseInt(id)},
    })

    return NextResponse.json({success: true})
  } catch (error) {
    console.error('Delete industry error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

