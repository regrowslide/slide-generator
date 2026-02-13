'use server'

import prisma from 'src/lib/prisma'

// 原材料マスタの初期データ投入
export const seedIngredientMasters = async () => {
  await prisma.rcIngredientMaster.deleteMany()

  const masters = [
    // 野菜類
    {name: 'にんじん', price: 200, yield: 85, category: '野菜', supplier: '一般仕入', sortOrder: 1},
    {name: 'たまねぎ', price: 180, yield: 90, category: '野菜', supplier: '一般仕入', sortOrder: 2},
    {name: 'じゃがいも', price: 220, yield: 85, category: '野菜', supplier: '一般仕入', sortOrder: 3},
    {name: 'だいこん', price: 150, yield: 80, category: '野菜', supplier: '一般仕入', sortOrder: 4},
    {name: 'キャベツ', price: 160, yield: 85, category: '野菜', supplier: '一般仕入', sortOrder: 5},
    {name: 'ほうれんそう', price: 600, yield: 75, category: '野菜', supplier: '一般仕入', sortOrder: 6},
    {name: 'こまつな', price: 500, yield: 80, category: '野菜', supplier: '一般仕入', sortOrder: 7},
    {name: 'ブロッコリー', price: 550, yield: 70, category: '野菜', supplier: '一般仕入', sortOrder: 8},
    {name: 'トマト', price: 400, yield: 95, category: '野菜', supplier: '一般仕入', sortOrder: 9},
    {name: 'ピーマン', price: 500, yield: 85, category: '野菜', supplier: '一般仕入', sortOrder: 10},
    {name: 'なす', price: 450, yield: 90, category: '野菜', supplier: '一般仕入', sortOrder: 11},
    {name: 'ごぼう', price: 350, yield: 80, category: '野菜', supplier: '一般仕入', sortOrder: 12},
    {name: 'れんこん', price: 600, yield: 80, category: '野菜', supplier: '一般仕入', sortOrder: 13},
    {name: 'もやし', price: 200, yield: 95, category: '野菜', supplier: '一般仕入', sortOrder: 14},
    {name: 'ねぎ', price: 350, yield: 80, category: '野菜', supplier: '一般仕入', sortOrder: 15},

    // 肉類
    {name: '鶏もも肉', price: 900, yield: 90, category: '肉類', supplier: '一般仕入', sortOrder: 16},
    {name: '鶏むね肉', price: 650, yield: 90, category: '肉類', supplier: '一般仕入', sortOrder: 17},
    {name: '鶏ひき肉', price: 750, yield: 100, category: '肉類', supplier: '一般仕入', sortOrder: 18},
    {name: '豚バラ肉', price: 1200, yield: 90, category: '肉類', supplier: '一般仕入', sortOrder: 19},
    {name: '豚ロース', price: 1400, yield: 90, category: '肉類', supplier: '一般仕入', sortOrder: 20},
    {name: '豚ひき肉', price: 800, yield: 100, category: '肉類', supplier: '一般仕入', sortOrder: 21},
    {name: '牛バラ肉', price: 2200, yield: 85, category: '肉類', supplier: '一般仕入', sortOrder: 22},
    {name: '牛ひき肉', price: 1600, yield: 100, category: '肉類', supplier: '一般仕入', sortOrder: 23},
    {name: '合挽き肉', price: 1000, yield: 100, category: '肉類', supplier: '一般仕入', sortOrder: 24},

    // 魚介類
    {name: 'さけ（切身）', price: 1800, yield: 85, category: '魚介類', supplier: '一般仕入', sortOrder: 25},
    {name: 'さば（切身）', price: 1200, yield: 80, category: '魚介類', supplier: '一般仕入', sortOrder: 26},
    {name: 'えび', price: 2500, yield: 70, category: '魚介類', supplier: '一般仕入', sortOrder: 27},
    {name: 'いか', price: 1500, yield: 75, category: '魚介類', supplier: '一般仕入', sortOrder: 28},
    {name: 'ツナ缶', price: 1200, yield: 100, category: '魚介類', supplier: '一般仕入', sortOrder: 29},

    // 豆腐・大豆製品
    {name: '木綿豆腐', price: 250, yield: 100, category: '大豆製品', supplier: '一般仕入', sortOrder: 30},
    {name: '絹ごし豆腐', price: 260, yield: 100, category: '大豆製品', supplier: '一般仕入', sortOrder: 31},
    {name: '油揚げ', price: 800, yield: 100, category: '大豆製品', supplier: '一般仕入', sortOrder: 32},
    {name: '厚揚げ', price: 500, yield: 100, category: '大豆製品', supplier: '一般仕入', sortOrder: 33},

    // 乳製品・卵
    {name: '鶏卵', price: 400, yield: 90, category: '卵・乳製品', supplier: '一般仕入', sortOrder: 34},
    {name: '牛乳', price: 200, yield: 100, category: '卵・乳製品', supplier: '一般仕入', sortOrder: 35},
    {name: 'バター', price: 1800, yield: 100, category: '卵・乳製品', supplier: '一般仕入', sortOrder: 36},
    {name: '生クリーム', price: 1500, yield: 100, category: '卵・乳製品', supplier: '一般仕入', sortOrder: 37},

    // 調味料
    {name: '食塩', price: 100, yield: 100, category: '調味料', supplier: '一般仕入', sortOrder: 38},
    {name: '上白糖', price: 250, yield: 100, category: '調味料', supplier: '一般仕入', sortOrder: 39},
    {name: '濃口しょうゆ', price: 400, yield: 100, category: '調味料', supplier: '一般仕入', sortOrder: 40},
    {name: '味噌（合わせ）', price: 500, yield: 100, category: '調味料', supplier: '一般仕入', sortOrder: 41},
    {name: '本みりん', price: 500, yield: 100, category: '調味料', supplier: '一般仕入', sortOrder: 42},
    {name: '料理酒', price: 300, yield: 100, category: '調味料', supplier: '一般仕入', sortOrder: 43},
    {name: '穀物酢', price: 300, yield: 100, category: '調味料', supplier: '一般仕入', sortOrder: 44},
    {name: 'サラダ油', price: 350, yield: 100, category: '調味料', supplier: '一般仕入', sortOrder: 45},
    {name: 'ごま油', price: 800, yield: 100, category: '調味料', supplier: '一般仕入', sortOrder: 46},
    {name: 'マヨネーズ', price: 600, yield: 100, category: '調味料', supplier: '一般仕入', sortOrder: 47},

    // 穀物・乾物
    {name: '白米', price: 400, yield: 100, category: '穀物', supplier: '一般仕入', sortOrder: 48},
    {name: 'うどん（ゆで）', price: 300, yield: 100, category: '穀物', supplier: '一般仕入', sortOrder: 49},
    {name: 'パスタ（乾燥）', price: 350, yield: 100, category: '穀物', supplier: '一般仕入', sortOrder: 50},
    {name: '片栗粉', price: 300, yield: 100, category: '穀物', supplier: '一般仕入', sortOrder: 51},
    {name: '小麦粉（薄力）', price: 250, yield: 100, category: '穀物', supplier: '一般仕入', sortOrder: 52},
  ]

  const result = await prisma.rcIngredientMaster.createMany({
    data: masters,
  })

  return result
}
