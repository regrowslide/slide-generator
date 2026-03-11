'use server'

import Anthropic from '@anthropic-ai/sdk'
import type { SuggestedRoutine } from '../types'

const client = new Anthropic()

/** AIにルーチンを提案させる */
export async function suggestRoutines(
  childAge: string,
  existingRoutines: string[],
  existingCategories: string[],
  request?: string
): Promise<SuggestedRoutine[]> {
  const existingList = existingRoutines.length > 0
    ? `\n既存のルーチン: ${existingRoutines.join(', ')}`
    : ''

  const categoryList = existingCategories.length > 0
    ? `\n既存のカテゴリ: ${existingCategories.join(', ')}`
    : ''

  const userRequest = request ? `\nユーザーの要望: ${request}` : ''

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `あなたは子どもの生活習慣アプリの専門家です。
${childAge}歳の子ども向けのルーチン（毎日の生活習慣）を3〜5個提案してください。
${existingList}${categoryList}${userRequest}

既存のルーチンと重複しないものを提案してください。
既存のカテゴリに当てはまるものはそのカテゴリに、当てはまらないものは新しいカテゴリを提案してください。

以下のJSON配列形式で回答してください。それ以外のテキストは不要です:
[
  {
    "name": "ひらがなで書いたルーチン名",
    "emoji": "未完了時の絵文字1つ",
    "sticker": "完了時のバッジ絵文字1つ",
    "categoryName": "カテゴリ名（ひらがな）",
    "categoryEmoji": "カテゴリの絵文字1つ"
  }
]`,
      },
    ],
  })

  const text =
    message.content[0].type === 'text' ? message.content[0].text : ''

  // JSON部分を抽出してパース
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return []

  try {
    const suggestions: SuggestedRoutine[] = JSON.parse(jsonMatch[0])
    return suggestions
  } catch {
    return []
  }
}
