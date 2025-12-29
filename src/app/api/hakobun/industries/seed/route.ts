import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'

// 業種・一般カテゴリ・詳細カテゴリの初期データ
const SEED_DATA = {
  restaurant: {
    code: 'restaurant',
    name: '飲食店',
    generalCategories: [
      {
        sortOrder: 1,
        name: '接客・サービス',
        description: 'スタッフの対応、接客態度、サービス全般に関する評価',
        categories: [
          {name: '店員の対応が良い', description: '笑顔、丁寧さ、気配り'},
          {name: '店員の対応が悪い', description: '無愛想、態度が悪い'},
          {name: '待ち時間が短い', description: '料理提供、会計など'},
          {name: '待ち時間が長い', description: '料理提供、会計など'},
        ],
      },
      {
        sortOrder: 2,
        name: '店内',
        description: '店舗の雰囲気、内装、清潔感、座席など店内環境に関する評価',
        categories: [
          {name: 'オシャレ・雰囲気が良い', description: '内装、照明、音楽など'},
          {name: '清潔感がある', description: '店内の清掃状態'},
          {name: '席が広い・ゆったり', description: '座席スペース'},
          {name: '席が狭い・窮屈', description: '座席スペース'},
          {name: '落ち着く', description: '居心地の良さ'},
          {name: '騒がしい', description: '周囲の騒音レベル'},
        ],
      },
      {
        sortOrder: 3,
        name: '料理・ドリンク',
        description: '食べ物・飲み物の味、品質、メニューに関する評価',
        categories: [
          {name: '料理が美味しい', description: '味の評価'},
          {name: '料理がまずい', description: '味の評価'},
          {name: '量が多い', description: 'ボリューム'},
          {name: '量が少ない', description: 'ボリューム'},
          {name: 'メニューが豊富', description: '選択肢の多さ'},
          {name: '盛り付けが綺麗', description: '見た目'},
          {name: 'ドリンクが美味しい', description: '飲み物の評価'},
        ],
      },
      {
        sortOrder: 4,
        name: '備品・設備',
        description: 'Wi-Fi、電源、BGM、空調など設備に関する評価',
        categories: [
          {name: 'Wi-Fiがある', description: '無料Wi-Fi完備'},
          {name: '電源がある', description: 'コンセント完備'},
          {name: 'BGMが良い', description: '音楽の選曲'},
          {name: 'BGMがうるさい', description: '音量が大きすぎる'},
          {name: '空調が快適', description: '温度管理'},
          {name: 'トイレが綺麗', description: 'トイレの清潔さ'},
        ],
      },
      {
        sortOrder: 5,
        name: '値段',
        description: '価格、コストパフォーマンスに関する評価',
        categories: [
          {name: 'コスパが良い', description: '値段に対する満足度'},
          {name: 'コスパが悪い', description: '値段に対する不満'},
          {name: '安い', description: '絶対的な価格'},
          {name: '高い', description: '絶対的な価格'},
        ],
      },
      {
        sortOrder: 6,
        name: '立地',
        description: '場所、アクセス、わかりやすさに関する評価',
        categories: [
          {name: 'アクセスが良い', description: '駅近、交通の便'},
          {name: 'アクセスが悪い', description: '駅から遠い'},
          {name: '場所がわかりやすい', description: '見つけやすさ'},
          {name: '場所がわかりにくい', description: '見つけにくい'},
          {name: '駐車場がある', description: '車でのアクセス'},
        ],
      },
      {
        sortOrder: 7,
        name: 'その他',
        description: '上記に該当しない評価',
        categories: [
          {name: 'また来たい', description: 'リピート意向'},
          {name: 'おすすめ', description: '他者への推薦'},
        ],
      },
    ],
  },
  sports_event: {
    code: 'sports_event',
    name: 'スポーツイベント',
    generalCategories: [
      {
        sortOrder: 1,
        name: '試合・競技',
        description: '試合内容、選手のパフォーマンス、勝敗',
        categories: [
          {name: '試合が面白かった', description: '試合内容への満足'},
          {name: '選手のプレーが良かった', description: '選手のパフォーマンス'},
          {name: '迫力があった', description: '臨場感'},
          {name: '接戦だった', description: '試合展開'},
        ],
      },
      {
        sortOrder: 2,
        name: '座席・観覧環境',
        description: '座席の快適さ、見やすさ、混雑状況',
        categories: [
          {name: '座席が見やすい', description: '視界の良さ'},
          {name: '座席が見にくい', description: '視界の悪さ'},
          {name: '座席が快適', description: '座り心地'},
          {name: '座席が狭い', description: 'スペース'},
          {name: '混雑していた', description: '人の多さ'},
          {name: '空いていた', description: '人の少なさ'},
        ],
      },
      {
        sortOrder: 3,
        name: 'スタッフ・サービス',
        description: '案内スタッフ、運営対応、サービス全般',
        categories: [
          {name: 'スタッフの対応が良い', description: '案内、接客'},
          {name: 'スタッフの対応が悪い', description: '案内、接客'},
          {name: '運営がスムーズ', description: '進行、誘導'},
          {name: '運営に問題があった', description: '進行、誘導'},
        ],
      },
      {
        sortOrder: 4,
        name: '飲食・売店',
        description: '会場内の飲食、売店の品揃え・価格',
        categories: [
          {name: 'フードが美味しい', description: '会場の食事'},
          {name: 'ドリンクが充実', description: '飲み物の種類'},
          {name: '売店が混雑', description: '待ち時間'},
          {name: '価格が高い', description: '飲食の値段'},
        ],
      },
      {
        sortOrder: 5,
        name: 'アクセス・立地',
        description: '会場へのアクセス、駐車場、最寄り駅',
        categories: [
          {name: 'アクセスが良い', description: '交通の便'},
          {name: 'アクセスが悪い', description: '交通の便'},
          {name: '駐車場が便利', description: '車でのアクセス'},
          {name: '駐車場が混雑', description: '駐車場の状況'},
        ],
      },
      {
        sortOrder: 6,
        name: 'グッズ・物販',
        description: '応援グッズ、記念品、物販の品揃え',
        categories: [
          {name: 'グッズが充実', description: '品揃え'},
          {name: 'グッズが売り切れ', description: '在庫'},
          {name: '限定グッズがある', description: '特別商品'},
        ],
      },
      {
        sortOrder: 7,
        name: '料金・チケット',
        description: 'チケット価格、購入方法、席種',
        categories: [
          {name: 'チケットが安い', description: '価格'},
          {name: 'チケットが高い', description: '価格'},
          {name: '購入が簡単', description: '購入方法'},
          {name: '購入が難しい', description: '購入方法'},
        ],
      },
      {
        sortOrder: 8,
        name: '施設・設備',
        description: 'トイレ、空調、Wi-Fi、音響など',
        categories: [
          {name: 'トイレが綺麗', description: '清潔さ'},
          {name: 'トイレが混雑', description: '待ち時間'},
          {name: '音響が良い', description: '場内放送'},
          {name: '空調が快適', description: '温度管理'},
        ],
      },
      {
        sortOrder: 9,
        name: 'その他',
        description: '上記に該当しない評価',
        categories: [
          {name: 'また行きたい', description: 'リピート意向'},
          {name: '友人に勧めたい', description: '他者への推薦'},
        ],
      },
    ],
  },
}

// 業種・一般カテゴリ・詳細カテゴリの初期データ投入API
export async function POST(request: NextRequest) {
  try {
    console.log('Seeding Hakobun industries with categories...')

    const results: any[] = []

    for (const [key, data] of Object.entries(SEED_DATA)) {
      // 業種を作成/取得
      let industry = await prisma.hakobunIndustry.findUnique({
        where: {code: data.code},
      })

      if (!industry) {
        industry = await prisma.hakobunIndustry.create({
          data: {
            code: data.code,
            name: data.name,
          },
        })
        console.log(`Created industry: ${data.name}`)
      } else {
        console.log(`Industry already exists: ${data.name}`)
      }

      // 各一般カテゴリを作成
      for (const gcData of data.generalCategories) {
        // 既存の一般カテゴリを確認
        let generalCategory = await prisma.hakobunIndustryGeneralCategory.findFirst({
          where: {
            industryId: industry.id,
            name: gcData.name,
          },
        })

        if (!generalCategory) {
          generalCategory = await prisma.hakobunIndustryGeneralCategory.create({
            data: {
              industryId: industry.id,
              sortOrder: gcData.sortOrder,
              name: gcData.name,
              description: gcData.description,
            },
          })
          console.log(`  Created general category: ${gcData.name}`)
        } else {
          console.log(`  General category already exists: ${gcData.name}`)
        }

        // 詳細カテゴリを作成
        if (gcData.categories) {
          let sortOrder = 0
          for (const catData of gcData.categories) {
            // 既存の詳細カテゴリを確認
            const existingCategory = await prisma.hakobunIndustryCategory.findFirst({
              where: {
                generalCategoryId: generalCategory.id,
                name: catData.name,
              },
            })

            if (!existingCategory) {
              await prisma.hakobunIndustryCategory.create({
                data: {
                  generalCategoryId: generalCategory.id,
                  sortOrder: sortOrder,
                  name: catData.name,
                  description: catData.description,
                  enabled: true,
                },
              })
              console.log(`    Created category: ${catData.name}`)
            } else {
              console.log(`    Category already exists: ${catData.name}`)
            }
            sortOrder++
          }
        }
      }

      results.push({industry: data.name, status: 'completed'})
    }

    // 作成されたデータを取得して返す
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
      },
    })

    return NextResponse.json({
      success: true,
      message: '業種・一般カテゴリ・詳細カテゴリの初期データ投入が完了しました',
      results,
      industries,
    })
  } catch (error) {
    console.error('Seed industries error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

// 全データ削除API（開発用）
export async function DELETE(request: NextRequest) {
  try {
    // 詳細カテゴリを削除
    await prisma.hakobunIndustryCategory.deleteMany({})
    console.log('Deleted all industry categories')

    // 一般カテゴリを削除
    await prisma.hakobunIndustryGeneralCategory.deleteMany({})
    console.log('Deleted all general categories')

    // 業種を削除
    await prisma.hakobunIndustry.deleteMany({})
    console.log('Deleted all industries')

    return NextResponse.json({
      success: true,
      message: '全ての業種・カテゴリデータを削除しました',
    })
  } catch (error) {
    console.error('Delete all error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
