import { NextRequest, NextResponse } from 'next/server'
import { processNaturalLanguage } from '../../actions'

/**
 * 自然言語処理API Route Handler
 * テキスト入力からカテゴリーとスキーマを生成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { input } = body

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: '入力テキストが必要です',
        },
        { status: 400 }
      )
    }

    // Server Actionを呼び出し
    const result = await processNaturalLanguage(input)

    return NextResponse.json(result)
  } catch (error) {
    console.error('自然言語処理エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

