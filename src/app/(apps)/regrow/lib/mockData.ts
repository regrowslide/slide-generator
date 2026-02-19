/**
 * Regrowアプリのモックデータ生成
 * 2026年1月、2月、3月の3ヶ月分のデータを生成
 */

import type {MonthlyData, StaffRecord, StoreTotals, StoreName, YearMonth} from '../types'

// スタッフ名リスト（各店舗5名）
const STAFF_BY_STORE: Record<StoreName, string[]> = {
  新潟西店: ['田中 美咲', '佐藤 結衣', '鈴木 あかり', '高橋 さくら', '伊藤 花音'],
  三条店: ['渡辺 愛', '山本 優花', '中村 彩香', '小林 美月', '加藤 陽菜'],
  新潟中央店: ['吉田 莉子', '山田 美羽', '佐々木 心春', '松本 優奈', '井上 結愛'],
}

/**
 * ランダムな整数を生成（範囲指定）
 */
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * ランダムな小数を生成（範囲指定、小数点1桁）
 */
const randomFloat = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10
}

/**
 * 月係数を取得（季節変動を反映）
 * 1-2月: 低調（0.9-1.0）
 * 3-5月: 春の繁忙期（1.1-1.3）
 * 6-8月: 夏季（1.0-1.1）
 * 9-11月: 秋の繁忙期（1.2-1.4）
 * 12月: 年末繁忙（1.5）
 */
const getMonthMultiplier = (yearMonth: YearMonth): number => {
  const month = parseInt(yearMonth.split('-')[1])
  const multipliers: Record<number, number> = {
    1: 0.9,
    2: 1.0,
    3: 1.1,
    4: 1.2,
    5: 1.3,
    6: 1.0,
    7: 1.05,
    8: 1.1,
    9: 1.2,
    10: 1.3,
    11: 1.4,
    12: 1.5,
  }
  return multipliers[month] || 1.0
}

/**
 * スタッフレコードを生成
 */
const generateStaffRecords = (yearMonth: YearMonth): StaffRecord[] => {
  const multiplier = getMonthMultiplier(yearMonth)
  const records: StaffRecord[] = []
  let rank = 1

  // 各店舗のスタッフデータを生成
  Object.entries(STAFF_BY_STORE).forEach(([storeName, staffNames]) => {
    staffNames.forEach((staffName) => {
      const customerCount = randomInt(20, 50) // 対応客数
      const newCustomerCount = randomInt(5, Math.floor(customerCount * 0.3)) // 新規客数（30%以下）
      const nominationCount = randomInt(Math.floor(customerCount * 0.3), Math.floor(customerCount * 0.7)) // 指名数（30-70%）
      const baseSales = customerCount * randomInt(6000, 9000) // 売上（客数×客単価）
      const sales = Math.floor(baseSales * multiplier) // 月係数を適用

      records.push({
        rank,
        staffName,
        storeName: storeName as StoreName,
        sales,
        customerCount,
        newCustomerCount,
        nominationCount,
        unitPrice: Math.floor(sales / customerCount),
      })

      rank++
    })
  })

  // 売上順にソート
  records.sort((a, b) => b.sales - a.sales)

  // ランクを再割り当て
  records.forEach((record, index) => {
    record.rank = index + 1
  })

  return records
}

/**
 * 店舗合計を生成
 */
const generateStoreTotals = (staffRecords: StaffRecord[]): StoreTotals[] => {
  const storeNames: StoreName[] = ['新潟西店', '三条店', '新潟中央店']

  return storeNames.map((storeName) => {
    const storeStaff = staffRecords.filter((r) => r.storeName === storeName)
    const sales = storeStaff.reduce((sum, r) => sum + r.sales, 0)
    const customerCount = storeStaff.reduce((sum, r) => sum + r.customerCount, 0)
    const nominationCount = storeStaff.reduce((sum, r) => sum + r.nominationCount, 0)

    return {
      storeName,
      sales,
      customerCount,
      nominationCount,
      unitPrice: Math.floor(sales / customerCount),
    }
  })
}

/**
 * 店舗別コメントを生成
 */
const generateStoreComments = (yearMonth: YearMonth): Record<StoreName, string> => {
  const month = parseInt(yearMonth.split('-')[1])

  const comments: Record<number, Record<StoreName, string>> = {
    1: {
      新潟西店: '年始の客足はやや落ち着いていましたが、リピーター様の来店が安定しています。\n新規顧客の獲得に向けて、SNS発信を強化中です。',
      三条店: '地域密着型のキャンペーンが好評でした。\n指名率が高く、スタッフの技術力が評価されています。',
      新潟中央店: '駅前という立地を活かし、新規のお客様が増えています。\nCS登録率を向上させ、リピート率の改善に取り組んでいます。',
    },
    2: {
      新潟西店: 'バレンタインキャンペーンが功を奏し、売上が前月比10%増となりました。\nスタッフ間の連携も良好で、サービス品質が向上しています。',
      三条店: '新メニューの導入により、客単価が上昇傾向です。\nスタッフの接客スキル向上研修を実施し、お客様満足度が高まっています。',
      新潟中央店: '新規顧客の定着率が向上しています。\nスタッフの稼働率が高く、予約が取りづらい状況が続いているため、シフト調整を検討中です。',
    },
    3: {
      新潟西店: '春の繁忙期に入り、売上が好調です。\n新規スタッフの育成も順調で、サービス提供体制が強化されています。',
      三条店: '春のキャンペーンが大成功し、過去最高の売上を記録しました。\nリピート率も向上しており、安定した顧客基盤が構築されつつあります。',
      新潟中央店: '駅前の好立地を活かし、新年度に向けた新規顧客が急増しています。\nスタッフ全員の稼働率が高水準を維持しています。',
    },
    4: {
      新潟西店: '新年度の需要が継続し、安定した売上を維持しています。\n春の新規顧客のリピート率向上に注力しています。',
      三条店: '4月も好調を維持。GW前のキャンペーン準備を進めています。\nスタッフのモチベーションも高く、良い雰囲気です。',
      新潟中央店: '新社会人のお客様が増加中。平日夜の予約が好調です。\n週末の予約枠拡大を検討しています。',
    },
    5: {
      新潟西店: 'GWキャンペーンが成功し、5月も高水準の売上を達成しました。\n新規顧客の獲得数が過去最高を記録しています。',
      三条店: 'GW期間中は予約満杯となり、多くのお客様にご来店いただきました。\nスタッフ全員で協力し、質の高いサービスを提供できました。',
      新潟中央店: '5月は母の日需要もあり、ギフト券の販売が好調でした。\nリピーター様の紹介による新規来店も増加しています。',
    },
    6: {
      新潟西店: '梅雨入りで来店数はやや減少しましたが、リピーター様の定着率は高水準を維持しています。\n雨の日特典が好評です。',
      三条店: '夏に向けたメニュー改定を実施。新メニューの反応が良好です。\nスタッフのスキルアップ研修を継続しています。',
      新潟中央店: '6月は安定した売上。夏季キャンペーンの準備を進めています。\n新規スタッフの教育も順調に進んでいます。',
    },
    7: {
      新潟西店: '夏季キャンペーン開始。涼感メニューが人気です。\n学生のお客様が増加し、若年層の顧客獲得に成功しています。',
      三条店: '7月は夏休み需要で好調。平日の予約も増加傾向です。\nスタッフの稼働率が適正水準を維持できています。',
      新潟中央店: '駅前立地を活かし、観光客のお客様も増加しました。\n多言語対応の取り組みも効果を発揮しています。',
    },
    8: {
      新潟西店: 'お盆期間は予約満杯。帰省客の来店も多くありました。\n夏季限定メニューが好評で、リピート予約も多数いただいています。',
      三条店: '8月も引き続き好調。スタッフの夏季休暇調整もスムーズに実施できました。\n顧客満足度調査で高評価をいただいています。',
      新潟中央店: '夏季繁忙期のピーク。新規顧客とリピーター様のバランスが良好です。\n秋のキャンペーン企画を開始しています。',
    },
    9: {
      新潟西店: '秋の新メニュー導入により、客単価が上昇しています。\nシルバーウィーク期間も予約が好調でした。',
      三条店: '9月は敬老の日需要もあり、幅広い年齢層のお客様にご来店いただきました。\nスタッフの接客力向上が売上に貢献しています。',
      新潟中央店: '秋の繁忙期に向けて準備万端。新規顧客の獲得施策が奏功しています。\nCS登録率も過去最高水準です。',
    },
    10: {
      新潟西店: '10月は秋の繁忙期で売上が急伸。ハロウィンキャンペーンも好評です。\nスタッフのチームワークが素晴らしく、高品質なサービスを提供できています。',
      三条店: '秋の繁忙期で過去最高の売上を更新。リピート率も向上しています。\n年末に向けてさらなる飛躍を目指します。',
      新潟中央店: '駅前の好立地と秋の需要増が相乗効果を発揮。予約が取りづらい状況が続いています。\nスタッフ増員を検討中です。',
    },
    11: {
      新潟西店: '11月も引き続き好調。年末に向けたキャンペーン準備を進めています。\n新規顧客の獲得とリピート率の両立ができています。',
      三条店: '秋の繁忙期が継続し、11月も高水準の売上を維持。\nスタッフ全員が目標達成に向けて一丸となっています。',
      新潟中央店: '年末商戦に向けた準備期間。予約状況は好調を維持しています。\nギフト券販売も順調に推移しています。',
    },
    12: {
      新潟西店: '12月は年末繁忙期で今年最高の売上を達成！\nクリスマスキャンペーンが大成功し、多くのお客様にご来店いただきました。',
      三条店: '年末繁忙期で予約満杯状態。一年の総決算として素晴らしい成果を上げることができました。\n来年に向けてさらなる飛躍を目指します。',
      新潟中央店: '12月は過去最高の売上と顧客満足度を達成。年末年始の需要を完璧に取り込めました。\nスタッフ全員に感謝です。',
    },
  }

  return (
    comments[month] || {
      新潟西店: '',
      三条店: '',
      新潟中央店: '',
    }
  )
}

/**
 * お客様の声を生成
 */
const generateCustomerVoice = (yearMonth: YearMonth): string => {
  const month = parseInt(yearMonth.split('-')[1])

  const voices: Record<number, string> = {
    1: `【新潟西店】
・スタッフの方がとても丁寧で、リラックスできました。また来ます！
・施術の技術が高く、肩こりがすっかり楽になりました。

【三条店】
・アットホームな雰囲気で居心地が良かったです。
・予約が取りやすく、通いやすいのが助かります。

【新潟中央店】
・駅から近くて便利です。仕事帰りに立ち寄れるのが嬉しい。
・新しいメニューを試してみたいです。`,
    2: `【新潟西店】
・バレンタインキャンペーンがお得で嬉しかったです！
・いつも担当してくださるスタッフの方の技術が素晴らしいです。

【三条店】
・新メニューのヘッドスパが最高でした。リピート決定です。
・スタッフ全員が笑顔で迎えてくださり、癒されます。

【新潟中央店】
・予約が取りづらいのが少し残念ですが、それだけ人気なんですね。
・施術後の説明が丁寧で、自宅でのケア方法も教えていただけて助かります。`,
    3: `【新潟西店】
・春のキャンペーンでお得に施術を受けられました。ありがとうございます！
・新しいスタッフの方も技術が高く、安心して任せられます。

【三条店】
・過去最高のサービスでした。友人にもおすすめしたいです。
・リピーター特典があると嬉しいです。

【新潟中央店】
・新年度に向けて心身ともにリフレッシュできました。
・スタッフの皆さんの一体感が伝わってきて、良い雰囲気です。`,
    4: `【新潟西店】
・新年度の疲れがすっかり取れました。定期的に通いたいです。
・清潔感のある店内で、とても快適に過ごせました。

【三条店】
・スタッフの対応が素晴らしく、毎回楽しみにしています。
・技術力の高さに毎回驚かされます。

【新潟中央店】
・駅チカで通いやすく、仕事帰りに最適です。
・次回もぜひ利用させていただきます。`,
    5: `【新潟西店】
・GWキャンペーンがお得で、家族で利用させていただきました。
・母の日のギフト券をプレゼントして、とても喜ばれました。

【三条店】
・新メニューを試してみましたが、大満足です！
・スタッフの皆さんがいつも明るくて元気をもらえます。

【新潟中央店】
・予約システムが便利で、スムーズに予約できました。
・施術の質が高く、コストパフォーマンスも良いと思います。`,
    6: `【新潟西店】
・雨の日特典がありがたかったです。また利用します。
・梅雨のむくみ対策メニューが効果抜群でした。

【三条店】
・いつも丁寧なカウンセリングをしてくださり、安心です。
・リラックスできる空間で、日頃の疲れが癒されます。

【新潟中央店】
・新しいスタッフの方も技術が高く、安心して任せられます。
・夏に向けたメニューが楽しみです。`,
    7: `【新潟西店】
・夏季限定の涼感メニューが最高でした！
・学生割引があって助かります。友達にも勧めたいです。

【三条店】
・暑い夏でも店内が快適で、リラックスできました。
・スタッフの対応がいつも素晴らしいです。

【新潟中央店】
・駅前で便利なので、買い物ついでに立ち寄れます。
・夏のキャンペーンがお得で嬉しかったです。`,
    8: `【新潟西店】
・お盆に帰省した際に利用しました。変わらぬ高品質で安心しました。
・夏バテ解消メニューが効果的でした。

【三条店】
・いつも予約が取りづらいですが、それだけ人気な証拠ですね。
・スタッフの技術が本当に素晴らしいです。

【新潟中央店】
・夏休み期間中でも予約が取れて良かったです。
・施術後のアフターケアのアドバイスが役立っています。`,
    9: `【新潟西店】
・秋の新メニューが素晴らしかったです。季節ごとの変化が楽しみです。
・シルバーウィーク期間も営業していて助かりました。

【三条店】
・敬老の日に母を連れて行きましたが、とても喜んでいました。
・スタッフの気配りが素晴らしく、居心地が良いです。

【新潟中央店】
・秋の乾燥対策メニューが効果的でした。
・予約が取りやすくなったのが嬉しいです。`,
    10: `【新潟西店】
・ハロウィンキャンペーンが楽しかったです！
・秋は特に予約が多いようですが、対応が素晴らしかったです。

【三条店】
・いつも高品質なサービスを提供してくださりありがとうございます。
・友人の紹介で来ましたが、大正解でした。

【新潟中央店】
・駅前の立地が本当に便利です。仕事帰りの癒しの場所です。
・スタッフ全員の技術力が高く、誰に当たっても安心です。`,
    11: `【新潟西店】
・年末に向けて疲れを取りに来ました。効果抜群です。
・ギフト券を購入しましたが、喜ばれました。

【三条店】
・秋の繁忙期でも丁寧な対応をしてくださり感謝しています。
・リピーター特典が嬉しいです。

【新潟中央店】
・予約システムが使いやすく、スムーズに予約できました。
・年末年始の予約も早めに取れて安心です。`,
    12: `【新潟西店】
・クリスマスキャンペーンが素晴らしかったです！
・一年の疲れがすっかり取れました。来年もよろしくお願いします。

【三条店】
・今年も大変お世話になりました。来年も通い続けます。
・年末の忙しい時期でも丁寧な対応に感謝です。

【新潟中央店】
・年末年始の営業時間が助かりました。
・今年最後の施術で、最高のリフレッシュができました。来年も楽しみです。`,
  }

  return voices[month] || ''
}

/**
 * 月次データを生成
 */
export const generateMockMonthlyData = (yearMonth: YearMonth): MonthlyData => {
  const staffRecords = generateStaffRecords(yearMonth)
  const storeTotals = generateStoreTotals(staffRecords)
  const storeComments = generateStoreComments(yearMonth)

  // 手動入力データ: 店舗KPI
  const storeKpis = (['新潟西店', '三条店', '新潟中央店'] as StoreName[]).map((storeName) => ({
    storeName,
    utilizationRate: randomFloat(75, 95), // 稼働率 75-95%
    returnRate: null, // 自動計算のためnull
    csRegistrationCount: randomInt(10, 30), // CS登録数
    comment: storeComments[storeName],
  }))

  // 手動入力データ: スタッフ稼働率とCS登録数
  const staffManualData = staffRecords.map((staff) => ({
    staffName: staff.staffName,
    storeName: staff.storeName,
    utilizationRate: randomFloat(70, 100), // 稼働率 70-100%
    csRegistrationCount: randomInt(2, 8), // CS登録数 2-8件
  }))

  // お客様の声
  const customerVoice = {
    content: generateCustomerVoice(yearMonth),
  }

  return {
    yearMonth,
    importedData: {
      staffRecords,
      storeTotals,
      importedAt: new Date(),
      fileName: `担当者別分析表_${yearMonth}.xlsx`,
    },
    manualData: {
      storeKpis,
      staffManualData,
      customerVoice,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * 12ヶ月分（2026-01〜12）のモックデータを定数として生成
 */
const generateAllMockData = (): Record<YearMonth, MonthlyData> => {
  const months: YearMonth[] = Array.from({length: 12}, (_, i) => {
    const month = String(i + 1).padStart(2, '0')
    return `2026-${month}` as YearMonth
  })

  const mockDataMap: Record<string, MonthlyData> = {}

  months.forEach((yearMonth) => {
    mockDataMap[yearMonth] = generateMockMonthlyData(yearMonth)
  })

  return mockDataMap
}

/**
 * モックデータ定数（2026年1月〜12月）
 */
export const MOCK_DATA: Record<YearMonth, MonthlyData> = generateAllMockData()

/**
 * 指定された月のモックデータを取得
 */
export const getMockData = (yearMonth: YearMonth): MonthlyData | null => {
  return MOCK_DATA[yearMonth] || null
}

/**
 * モックデータをlocalStorageに保存（オプション）
 */
export const loadMockData = (): void => {
  Object.entries(MOCK_DATA).forEach(([yearMonth, data]) => {
    const key = `regrow_data_${yearMonth}`
    localStorage.setItem(key, JSON.stringify(data))
  })

  console.log('✅ モックデータを12ヶ月分（2026-01〜12）生成しました')
  console.log('   - 各店舗5名のスタッフデータ')
  console.log('   - 季節変動を反映した売上データ')
  console.log('   - 店舗KPI（稼働率、月別コメント）')
  console.log('   - スタッフ稼働率とCS登録数')
  console.log('   - 月別のお客様の声')
}
