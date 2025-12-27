import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'

// 業種一覧取得
export async function GET(request: NextRequest) {
  try {
    const industries = await prisma.hakobunIndustry.findMany({
      include: {
        generalCategories: {
          orderBy: {sortOrder: 'asc'},
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

