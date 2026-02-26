import 'dotenv/config'
import {PrismaClient} from '@prisma/generated/prisma/client'
import {PrismaPg} from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({adapter})

// ============================================================
// スタッフ名リスト（mockData.tsと同じ）
// ============================================================

const STAFF_BY_STORE: Record<string, string[]> = {
  港北店: ['青山 美咲', '白石 結衣', '桜井 あかり', '星野 さくら', '森川 花音'],
  青葉店: ['水野 愛', '朝日 優花', '月島 彩香', '春田 美月', '秋山 陽菜'],
  中央店: ['南 莉子', '北川 美羽', '東山 心春', '西村 優奈', '風間 結愛'],
}

// ============================================================
// ユーティリティ
// ============================================================

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const randomFloat = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10
}

const getMonthMultiplier = (month: number): number => {
  const multipliers: Record<number, number> = {
    1: 0.9, 2: 1.0, 3: 1.1, 4: 1.2, 5: 1.3, 6: 1.0,
    7: 1.05, 8: 1.1, 9: 1.2, 10: 1.3, 11: 1.4, 12: 1.5,
  }
  return multipliers[month] || 1.0
}

// ============================================================
// 店舗コメント（mockData.tsと同じ）
// ============================================================

const STORE_COMMENTS: Record<number, Record<string, string>> = {
  1: {
    港北店: '年始の客足はやや落ち着いていましたが、リピーター様の来店が安定しています。\n新規顧客の獲得に向けて、SNS発信を強化中です。',
    青葉店: '地域密着型のキャンペーンが好評でした。\n指名率が高く、スタッフの技術力が評価されています。',
    中央店: '駅前という立地を活かし、新規のお客様が増えています。\nCS登録率を向上させ、リピート率の改善に取り組んでいます。',
  },
  2: {
    港北店: 'バレンタインキャンペーンが功を奏し、売上が前月比10%増となりました。\nスタッフ間の連携も良好で、サービス品質が向上しています。',
    青葉店: '新メニューの導入により、客単価が上昇傾向です。\nスタッフの接客スキル向上研修を実施し、お客様満足度が高まっています。',
    中央店: '新規顧客の定着率が向上しています。\nスタッフの稼働率が高く、予約が取りづらい状況が続いているため、シフト調整を検討中です。',
  },
  3: {
    港北店: '春の繁忙期に入り、売上が好調です。\n新規スタッフの育成も順調で、サービス提供体制が強化されています。',
    青葉店: '春のキャンペーンが大成功し、過去最高の売上を記録しました。\nリピート率も向上しており、安定した顧客基盤が構築されつつあります。',
    中央店: '駅前の好立地を活かし、新年度に向けた新規顧客が急増しています。\nスタッフ全員の稼働率が高水準を維持しています。',
  },
  4: {
    港北店: '新年度の需要が継続し、安定した売上を維持しています。\n春の新規顧客のリピート率向上に注力しています。',
    青葉店: '4月も好調を維持。GW前のキャンペーン準備を進めています。\nスタッフのモチベーションも高く、良い雰囲気です。',
    中央店: '新社会人のお客様が増加中。平日夜の予約が好調です。\n週末の予約枠拡大を検討しています。',
  },
  5: {
    港北店: 'GWキャンペーンが成功し、5月も高水準の売上を達成しました。\n新規顧客の獲得数が過去最高を記録しています。',
    青葉店: 'GW期間中は予約満杯となり、多くのお客様にご来店いただきました。\nスタッフ全員で協力し、質の高いサービスを提供できました。',
    中央店: '5月は母の日需要もあり、ギフト券の販売が好調でした。\nリピーター様の紹介による新規来店も増加しています。',
  },
  6: {
    港北店: '梅雨入りで来店数はやや減少しましたが、リピーター様の定着率は高水準を維持しています。\n雨の日特典が好評です。',
    青葉店: '夏に向けたメニュー改定を実施。新メニューの反応が良好です。\nスタッフのスキルアップ研修を継続しています。',
    中央店: '6月は安定した売上。夏季キャンペーンの準備を進めています。\n新規スタッフの教育も順調に進んでいます。',
  },
  7: {
    港北店: '夏季キャンペーン開始。涼感メニューが人気です。\n学生のお客様が増加し、若年層の顧客獲得に成功しています。',
    青葉店: '7月は夏休み需要で好調。平日の予約も増加傾向です。\nスタッフの稼働率が適正水準を維持できています。',
    中央店: '駅前立地を活かし、観光客のお客様も増加しました。\n多言語対応の取り組みも効果を発揮しています。',
  },
  8: {
    港北店: 'お盆期間は予約満杯。帰省客の来店も多くありました。\n夏季限定メニューが好評で、リピート予約も多数いただいています。',
    青葉店: '8月も引き続き好調。スタッフの夏季休暇調整もスムーズに実施できました。\n顧客満足度調査で高評価をいただいています。',
    中央店: '夏季繁忙期のピーク。新規顧客とリピーター様のバランスが良好です。\n秋のキャンペーン企画を開始しています。',
  },
  9: {
    港北店: '秋の新メニュー導入により、客単価が上昇しています。\nシルバーウィーク期間も予約が好調でした。',
    青葉店: '9月は敬老の日需要もあり、幅広い年齢層のお客様にご来店いただきました。\nスタッフの接客力向上が売上に貢献しています。',
    中央店: '秋の繁忙期に向けて準備万端。新規顧客の獲得施策が奏功しています。\nCS登録率も過去最高水準です。',
  },
  10: {
    港北店: '10月は秋の繁忙期で売上が急伸。ハロウィンキャンペーンも好評です。\nスタッフのチームワークが素晴らしく、高品質なサービスを提供できています。',
    青葉店: '秋の繁忙期で過去最高の売上を更新。リピート率も向上しています。\n年末に向けてさらなる飛躍を目指します。',
    中央店: '駅前の好立地と秋の需要増が相乗効果を発揮。予約が取りづらい状況が続いています。\nスタッフ増員を検討中です。',
  },
  11: {
    港北店: '11月も引き続き好調。年末に向けたキャンペーン準備を進めています。\n新規顧客の獲得とリピート率の両立ができています。',
    青葉店: '秋の繁忙期が継続し、11月も高水準の売上を維持。\nスタッフ全員が目標達成に向けて一丸となっています。',
    中央店: '年末商戦に向けた準備期間。予約状況は好調を維持しています。\nギフト券販売も順調に推移しています。',
  },
  12: {
    港北店: '12月は年末繁忙期で今年最高の売上を達成！\nクリスマスキャンペーンが大成功し、多くのお客様にご来店いただきました。',
    青葉店: '年末繁忙期で予約満杯状態。一年の総決算として素晴らしい成果を上げることができました。\n来年に向けてさらなる飛躍を目指します。',
    中央店: '12月は過去最高の売上と顧客満足度を達成。年末年始の需要を完璧に取り込めました。\nスタッフ全員に感謝です。',
  },
}

// ============================================================
// お客様の声（mockData.tsと同じ）
// ============================================================

const CUSTOMER_VOICES: Record<number, string> = {
  1: `【港北店】\n・スタッフの方がとても丁寧で、リラックスできました。また来ます！\n・施術の技術が高く、肩こりがすっかり楽になりました。\n\n【青葉店】\n・アットホームな雰囲気で居心地が良かったです。\n・予約が取りやすく、通いやすいのが助かります。\n\n【中央店】\n・駅から近くて便利です。仕事帰りに立ち寄れるのが嬉しい。\n・新しいメニューを試してみたいです。`,
  2: `【港北店】\n・バレンタインキャンペーンがお得で嬉しかったです！\n・いつも担当してくださるスタッフの方の技術が素晴らしいです。\n\n【青葉店】\n・新メニューのヘッドスパが最高でした。リピート決定です。\n・スタッフ全員が笑顔で迎えてくださり、癒されます。\n\n【中央店】\n・予約が取りづらいのが少し残念ですが、それだけ人気なんですね。\n・施術後の説明が丁寧で、自宅でのケア方法も教えていただけて助かります。`,
  3: `【港北店】\n・春のキャンペーンでお得に施術を受けられました。ありがとうございます！\n・新しいスタッフの方も技術が高く、安心して任せられます。\n\n【青葉店】\n・過去最高のサービスでした。友人にもおすすめしたいです。\n・リピーター特典があると嬉しいです。\n\n【中央店】\n・新年度に向けて心身ともにリフレッシュできました。\n・スタッフの皆さんの一体感が伝わってきて、良い雰囲気です。`,
  4: `【港北店】\n・新年度の疲れがすっかり取れました。定期的に通いたいです。\n・清潔感のある店内で、とても快適に過ごせました。\n\n【青葉店】\n・スタッフの対応が素晴らしく、毎回楽しみにしています。\n・技術力の高さに毎回驚かされます。\n\n【中央店】\n・駅チカで通いやすく、仕事帰りに最適です。\n・次回もぜひ利用させていただきます。`,
  5: `【港北店】\n・GWキャンペーンがお得で、家族で利用させていただきました。\n・母の日のギフト券をプレゼントして、とても喜ばれました。\n\n【青葉店】\n・新メニューを試してみましたが、大満足です！\n・スタッフの皆さんがいつも明るくて元気をもらえます。\n\n【中央店】\n・予約システムが便利で、スムーズに予約できました。\n・施術の質が高く、コストパフォーマンスも良いと思います。`,
  6: `【港北店】\n・雨の日特典がありがたかったです。また利用します。\n・梅雨のむくみ対策メニューが効果抜群でした。\n\n【青葉店】\n・いつも丁寧なカウンセリングをしてくださり、安心です。\n・リラックスできる空間で、日頃の疲れが癒されます。\n\n【中央店】\n・新しいスタッフの方も技術が高く、安心して任せられます。\n・夏に向けたメニューが楽しみです。`,
  7: `【港北店】\n・夏季限定の涼感メニューが最高でした！\n・学生割引があって助かります。友達にも勧めたいです。\n\n【青葉店】\n・暑い夏でも店内が快適で、リラックスできました。\n・スタッフの対応がいつも素晴らしいです。\n\n【中央店】\n・駅前で便利なので、買い物ついでに立ち寄れます。\n・夏のキャンペーンがお得で嬉しかったです。`,
  8: `【港北店】\n・お盆に帰省した際に利用しました。変わらぬ高品質で安心しました。\n・夏バテ解消メニューが効果的でした。\n\n【青葉店】\n・いつも予約が取りづらいですが、それだけ人気な証拠ですね。\n・スタッフの技術が本当に素晴らしいです。\n\n【中央店】\n・夏休み期間中でも予約が取れて良かったです。\n・施術後のアフターケアのアドバイスが役立っています。`,
  9: `【港北店】\n・秋の新メニューが素晴らしかったです。季節ごとの変化が楽しみです。\n・シルバーウィーク期間も営業していて助かりました。\n\n【青葉店】\n・敬老の日に母を連れて行きましたが、とても喜んでいました。\n・スタッフの気配りが素晴らしく、居心地が良いです。\n\n【中央店】\n・秋の乾燥対策メニューが効果的でした。\n・予約が取りやすくなったのが嬉しいです。`,
  10: `【港北店】\n・ハロウィンキャンペーンが楽しかったです！\n・秋は特に予約が多いようですが、対応が素晴らしかったです。\n\n【青葉店】\n・いつも高品質なサービスを提供してくださりありがとうございます。\n・友人の紹介で来ましたが、大正解でした。\n\n【中央店】\n・駅前の立地が本当に便利です。仕事帰りの癒しの場所です。\n・スタッフ全員の技術力が高く、誰に当たっても安心です。`,
  11: `【港北店】\n・年末に向けて疲れを取りに来ました。効果抜群です。\n・ギフト券を購入しましたが、喜ばれました。\n\n【青葉店】\n・秋の繁忙期でも丁寧な対応をしてくださり感謝しています。\n・リピーター特典が嬉しいです。\n\n【中央店】\n・予約システムが使いやすく、スムーズに予約できました。\n・年末年始の予約も早めに取れて安心です。`,
  12: `【港北店】\n・クリスマスキャンペーンが素晴らしかったです！\n・一年の疲れがすっかり取れました。来年もよろしくお願いします。\n\n【青葉店】\n・今年も大変お世話になりました。来年も通い続けます。\n・年末の忙しい時期でも丁寧な対応に感謝です。\n\n【中央店】\n・年末年始の営業時間が助かりました。\n・今年最後の施術で、最高のリフレッシュができました。来年も楽しみです。`,
}

// ============================================================
// メイン処理
// ============================================================

const main = async () => {
  console.log('Seeding regrow data...')

  // 1. 店舗作成
  const stores = await Promise.all([
    prisma.rgStore.create({data: {name: '港北店', fullName: 'asian relaxation villa港北店', sortOrder: 1}}),
    prisma.rgStore.create({data: {name: '青葉店', fullName: 'asian relaxation villa青葉店', sortOrder: 2}}),
    prisma.rgStore.create({data: {name: '中央店', fullName: 'asian relaxation villa中央店', sortOrder: 3}}),
  ])
  console.log(`  店舗作成: ${stores.length}件`)

  const storeMap = new Map(stores.map((s) => [s.name, s]))

  // 2. スタッフ作成（各店舗5名）
  const allStaff: Array<{id: number; staffName: string; storeId: number; storeName: string}> = []
  let staffSort = 1
  for (const [storeName, staffNames] of Object.entries(STAFF_BY_STORE)) {
    const store = storeMap.get(storeName)!
    for (const staffName of staffNames) {
      const staff = await prisma.rgStaff.create({
        data: {
          staffName,
          storeId: store.id,
          role: staffSort === 1 ? 'admin' : staffSort <= 3 ? 'manager' : 'viewer',
          sortOrder: staffSort,
        },
      })
      allStaff.push({id: staff.id, staffName: staff.staffName, storeId: store.id, storeName})
      staffSort++
    }
  }
  console.log(`  スタッフ作成: ${allStaff.length}名`)

  // 3. 12ヶ月分のデータ作成
  for (let m = 1; m <= 12; m++) {
    const yearMonth = `2026-${String(m).padStart(2, '0')}`
    const multiplier = getMonthMultiplier(m)

    // 月次レポート作成
    const report = await prisma.rgMonthlyReport.create({
      data: {
        yearMonth,
        importedAt: new Date(`2026-${String(m).padStart(2, '0')}-15`),
        importedFileName: `担当者別分析表_${yearMonth}.xlsx`,
      },
    })

    // スタッフレコード生成
    type StaffRecordData = {
      staffId: number
      storeId: number
      storeName: string
      staffName: string
      sales: number
      customerCount: number
      newCustomerCount: number
      nominationCount: number
      unitPrice: number
    }
    const staffRecordsRaw: StaffRecordData[] = allStaff.map((staff) => {
      const customerCount = randomInt(20, 50)
      const newCustomerCount = randomInt(5, Math.floor(customerCount * 0.3))
      const nominationCount = randomInt(Math.floor(customerCount * 0.3), Math.floor(customerCount * 0.7))
      const baseSales = customerCount * randomInt(6000, 9000)
      const sales = Math.floor(baseSales * multiplier)
      return {
        staffId: staff.id,
        storeId: staff.storeId,
        storeName: staff.storeName,
        staffName: staff.staffName,
        sales,
        customerCount,
        newCustomerCount,
        nominationCount,
        unitPrice: Math.floor(sales / customerCount),
      }
    })

    // 売上順にソートしてランク付与
    staffRecordsRaw.sort((a, b) => b.sales - a.sales)

    await prisma.rgStaffRecord.createMany({
      data: staffRecordsRaw.map((r, i) => ({
        monthlyReportId: report.id,
        staffId: r.staffId,
        storeId: r.storeId,
        rank: i + 1,
        sales: r.sales,
        customerCount: r.customerCount,
        newCustomerCount: r.newCustomerCount,
        nominationCount: r.nominationCount,
        unitPrice: r.unitPrice,
      })),
    })

    // 店舗合計作成
    for (const [storeName, store] of storeMap.entries()) {
      const storeStaff = staffRecordsRaw.filter((r) => r.storeName === storeName)
      const sales = storeStaff.reduce((sum, r) => sum + r.sales, 0)
      const customerCount = storeStaff.reduce((sum, r) => sum + r.customerCount, 0)
      const nominationCount = storeStaff.reduce((sum, r) => sum + r.nominationCount, 0)

      await prisma.rgStoreTotals.create({
        data: {
          monthlyReportId: report.id,
          storeId: store.id,
          sales,
          customerCount,
          nominationCount,
          unitPrice: customerCount > 0 ? Math.floor(sales / customerCount) : 0,
          sortOrder: store.sortOrder,
        },
      })
    }

    // 店舗KPI作成
    const comments = STORE_COMMENTS[m] || {}
    for (const [storeName, store] of storeMap.entries()) {
      await prisma.rgStoreKpi.create({
        data: {
          monthlyReportId: report.id,
          storeId: store.id,
          utilizationRate: randomFloat(75, 95),
          returnRate: null,
          csRegistrationCount: randomInt(10, 30),
          comment: comments[storeName] || '',
          sortOrder: store.sortOrder,
        },
      })
    }

    // スタッフ手動データ作成
    for (const staff of allStaff) {
      await prisma.rgStaffManualData.create({
        data: {
          monthlyReportId: report.id,
          staffId: staff.id,
          utilizationRate: randomFloat(70, 100),
          csRegistrationCount: randomInt(2, 8),
        },
      })
    }

    // お客様の声作成
    await prisma.rgCustomerVoice.create({
      data: {
        monthlyReportId: report.id,
        content: CUSTOMER_VOICES[m] || '',
      },
    })

    console.log(`  ${yearMonth} データ作成完了`)
  }

  console.log('Regrow seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
