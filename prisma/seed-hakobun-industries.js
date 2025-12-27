import {PrismaClient} from '@prisma/generated/prisma/client'
import {PrismaPg} from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({adapter})

async function main() {
  console.log('Seeding Hakobun industries...')

  // 飲食店業種を作成
  const restaurant = await prisma.hakobunIndustry.upsert({
    where: {code: 'restaurant'},
    update: {},
    create: {
      code: 'restaurant',
      name: '飲食店',
      generalCategories: {
        create: [
          {
            sortOrder: 1,
            name: '接客・サービス',
            description: 'スタッフの対応、接客態度、サービス全般に関する評価',
          },
          {
            sortOrder: 2,
            name: '店内',
            description: '店舗の雰囲気、内装、清潔感、座席など店内環境に関する評価',
          },
          {
            sortOrder: 3,
            name: '料理・ドリンク',
            description: '食べ物・飲み物の味、品質、メニューに関する評価',
          },
          {
            sortOrder: 4,
            name: '備品・設備',
            description: 'Wi-Fi、電源、BGM、空調など設備に関する評価',
          },
          {
            sortOrder: 5,
            name: '値段',
            description: '価格、コストパフォーマンスに関する評価',
          },
          {
            sortOrder: 6,
            name: '立地',
            description: '場所、アクセス、わかりやすさに関する評価',
          },
          {
            sortOrder: 7,
            name: 'その他',
            description: '上記に該当しない評価',
          },
        ],
      },
    },
  })

  console.log('Created restaurant industry:', restaurant)

  // スポーツイベント業種を作成
  const sportsEvent = await prisma.hakobunIndustry.upsert({
    where: {code: 'sports_event'},
    update: {},
    create: {
      code: 'sports_event',
      name: 'スポーツイベント',
      generalCategories: {
        create: [
          {
            sortOrder: 1,
            name: '試合・競技',
            description: '試合内容、選手のパフォーマンス、勝敗',
          },
          {
            sortOrder: 2,
            name: '座席・観覧環境',
            description: '座席の快適さ、見やすさ、混雑状況',
          },
          {
            sortOrder: 3,
            name: 'スタッフ・サービス',
            description: '案内スタッフ、運営対応、サービス全般',
          },
          {
            sortOrder: 4,
            name: '飲食・売店',
            description: '会場内の飲食、売店の品揃え・価格',
          },
          {
            sortOrder: 5,
            name: 'アクセス・立地',
            description: '会場へのアクセス、駐車場、最寄り駅',
          },
          {
            sortOrder: 6,
            name: 'グッズ・物販',
            description: '応援グッズ、記念品、物販の品揃え',
          },
          {
            sortOrder: 7,
            name: '料金・チケット',
            description: 'チケット価格、購入方法、席種',
          },
          {
            sortOrder: 8,
            name: '施設・設備',
            description: 'トイレ、空調、Wi-Fi、音響など',
          },
          {
            sortOrder: 9,
            name: 'その他',
            description: '上記に該当しない評価',
          },
        ],
      },
    },
  })

  console.log('Created sports_event industry:', sportsEvent)
  console.log('Seeding completed!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
