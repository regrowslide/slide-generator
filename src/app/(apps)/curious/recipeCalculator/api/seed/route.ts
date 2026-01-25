import {NextResponse} from 'next/server'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

// 初期マスタデータ
const SEED_DATA = [
  {name: '玉ねぎ', price: 150, yield: 90, category: '野菜', supplier: '青果市場A'},
  {name: '豚肉（バラ）', price: 1200, yield: 80, category: '肉類', supplier: '食肉卸B'},
  {name: '人参', price: 200, yield: 85, category: '野菜', supplier: '青果市場A'},
  {name: 'カレールー（業務用）', price: 800, yield: 100, category: '調味料', supplier: '業務スーパーC'},
  {name: 'じゃがいも', price: 180, yield: 85, category: '野菜', supplier: '青果市場A'},
  {name: '鶏もも肉', price: 850, yield: 85, category: '肉類', supplier: '食肉卸B'},
  {name: '牛乳', price: 200, yield: 100, category: '乳製品', supplier: '問屋D'},
  {name: 'にんにく', price: 2500, yield: 95, category: '野菜', supplier: '青果市場A'},
  {name: '生姜', price: 1800, yield: 90, category: '野菜', supplier: '青果市場A'},
  {name: '小麦粉', price: 150, yield: 100, category: '粉類', supplier: '業務スーパーC'},
  {name: 'バター', price: 1200, yield: 100, category: '乳製品', supplier: '問屋D'},
  {name: 'トマト缶', price: 300, yield: 100, category: '缶詰', supplier: '業務スーパーC'},
]

export async function POST() {
  try {
    // 既存データの件数を確認
    const existingCount = (await doStandardPrisma('rcIngredientMaster', 'count', {})) as unknown as number

    if (existingCount > 0) {
      return NextResponse.json({
        success: false,
        message: `既にデータが存在します（${existingCount}件）`,
      })
    }

    // シードデータを挿入
    for (const data of SEED_DATA) {
      await doStandardPrisma('rcIngredientMaster', 'create', {data})
    }

    return NextResponse.json({
      success: true,
      message: `${SEED_DATA.length}件のマスタデータを作成しました`,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POSTメソッドでシードデータを作成できます',
    seedData: SEED_DATA,
  })
}
