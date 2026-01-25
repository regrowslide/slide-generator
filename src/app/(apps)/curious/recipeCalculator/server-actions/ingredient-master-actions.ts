'use server'

import type {RcIngredientMaster} from '@prisma/generated/prisma/client'
import prisma from 'src/lib/prisma'

export type IngredientMasterInput = {
  name: string
  price: number
  yield: number
  category: string
  supplier: string
}

// 原材料マスタ一覧取得
export const getIngredientMasters = async (): Promise<RcIngredientMaster[]> => {
  const result = await prisma.rcIngredientMaster.findMany({
    orderBy: [{category: 'asc'}, {name: 'asc'}],
  })
  return result
}

// 原材料マスタ検索
export const searchIngredientMasters = async (searchTerm: string): Promise<RcIngredientMaster[]> => {
  const result = await prisma.rcIngredientMaster.findMany({
    where: {
      OR: [{name: {contains: searchTerm}}, {category: {contains: searchTerm}}, {supplier: {contains: searchTerm}}],
    },
    orderBy: [{category: 'asc'}, {name: 'asc'}],
  })
  return result
}

// 原材料マスタ作成
export const createIngredientMaster = async (data: IngredientMasterInput): Promise<RcIngredientMaster> => {
  const result = await prisma.rcIngredientMaster.create({
    data: {
      name: data.name,
      price: data.price,
      yield: data.yield,
      category: data.category,
      supplier: data.supplier,
    },
  })
  return result
}

// 原材料マスタ更新
export const updateIngredientMaster = async (id: number, data: Partial<IngredientMasterInput>): Promise<RcIngredientMaster> => {
  const result = await prisma.rcIngredientMaster.update({
    where: {id},
    data,
  })
  return result
}

// 原材料マスタ削除
export const deleteIngredientMaster = async (id: number) => {
  return await prisma.rcIngredientMaster.delete({
    where: {id},
  })
}

// 名前でファジーマッチング検索（AI解析用）
// 目的：キロ単価を取得して原価計算するため、類似商品でもOK
export const findIngredientByFuzzyName = async (rawName: string): Promise<RcIngredientMaster | null> => {
  // 1. 完全一致検索
  // const exactMatch = await prisma.rcIngredientMaster.findFirst({
  //   where: {name: rawName},
  // })
  // if (exactMatch) return exactMatch

  // 2. AIによる類似商品検索（DBマスタから）
  const masters = await prisma.rcIngredientMaster.findMany({})
  if (masters.length > 0) {
    const aiMatch = await findSimilarIngredientByAI(rawName, masters)

    if (aiMatch) return aiMatch
  }

  return null
}

// AIを使って類似商品を検索（Gemini API）
// 重要：完全一致ではなく、キロ単価の参考になる類似商品を見つける
const findSimilarIngredientByAI = async (
  targetName: string,
  masters: RcIngredientMaster[]
): Promise<RcIngredientMaster | null> => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  // マスタリストを作成（最大50件）
  const masterList = masters
    .slice(0, 50)
    .map(m => `${m.id}:${m.name}（${m.category}）`)
    .join('\n')

  const prompt = `あなたは食品原価計算のアシスタントです。
検索対象の食材に対して、商品をマスタから選んでください。

【検索対象】
"${targetName}"

【マスタリスト（ID:名前（カテゴリ））】
${masterList}

【判定基準】

- ただし、料理上別々の商品である場合はNG。（例：「鶏むね肉」→「鶏肉」、「エビ」→「エビフライ」、「醤油」→「カレールー」、「玉ねぎ」→「ピクルス」はすべてNG）
- 同じ食材であれば採用（例：「北海道産玉ねぎ」→「玉ねぎ」でOK）

【回答】
該当するIDを1つだけ返してください。全く関係ない食材しかない場合のみ "null" と返してください。
料理上別々の商品である場合は "null" と返してください。`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{parts: [{text: prompt}]}],
          generationConfig: {temperature: 0, maxOutputTokens: 20},
        }),
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!isNaN(Number(content))) {
      console.log({targetName, content}) //logs
    }

    if (!content || content.toLowerCase() === 'null') return null

    const matchId = parseInt(content.replace(/[^0-9]/g, ''), 10)
    if (isNaN(matchId)) return null

    return masters.find(m => m.id === matchId) || null
  } catch {
    return null
  }
}
