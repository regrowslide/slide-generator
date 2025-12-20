import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

interface GenerateDraftRequest {
  client_id: string
  corrections: Array<{
    id: number
    rawSegment: string
    correctCategoryCode: string
    sentiment: string
    reviewerComment?: string | null
  }>
}

interface RuleDraft {
  target_category: string
  rule_description: string
  priority: 'High' | 'Medium' | 'Low'
  reasoning: string
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateDraftRequest = await request.json()
    const {client_id, corrections} = body

    if (!client_id || !corrections || corrections.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'client_id と corrections は必須です',
        },
        {status: 400}
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEY環境変数が設定されていません',
        },
        {status: 500}
      )
    }

    // クライアント存在確認
    const client = await prisma.hakobunClient.findUnique({
      where: {clientId: client_id},
    })

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: `クライアント "${client_id}" が見つかりません`,
        },
        {status: 404}
      )
    }

    // 全ての修正事例をフォーマット
    const examples = corrections
      .slice(0, 50) // 最大50件の例を使用
      .map(
        (c, idx) =>
          `例${idx + 1}:
入力テキスト: "${c.rawSegment}"
正解カテゴリ: "${c.correctCategoryCode}"
感情: ${c.sentiment}${c.reviewerComment ? `\n修正理由: ${c.reviewerComment}` : ''}`
      )
      .join('\n\n')

    // カテゴリごとの件数を集計
    const categoryStats = corrections.reduce(
      (acc, c) => {
        acc[c.correctCategoryCode] = (acc[c.correctCategoryCode] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    const categoryStatsSummary = Object.entries(categoryStats)
      .map(([cat, count]) => `- ${cat}: ${count}件`)
      .join('\n')

    const prompt = `あなたは、顧客の声分析システムのルール作成アシスタントです。

以下の修正事例（人間がAIの誤分類を修正したデータ）を分析して、AIが同じ誤りを繰り返さないためのルールを複数生成してください。

【修正事例の統計】
${categoryStatsSummary}

【修正事例一覧】
${examples}

【要件】
1. これらの修正事例全体を俯瞰し、共通するパターンや判断基準を抽出してください
2. 1つのカテゴリに対して複数のルールが必要な場合は、それぞれ別のルールとして生成してください
3. 複数のカテゴリに共通するルールがあれば、それも生成してください
4. ルールは具体的で実用的なものにしてください
5. 優先度を以下の基準で判定してください:
   - High: 複数件発生している誤分類パターン、または重要な判断基準
   - Medium: 数件発生している誤分類パターン
   - Low: 1件のみだが、明確なパターンがある誤分類
6. 意味のあるルールのみを生成してください（冗長なルールは不要）

【出力形式】
以下のJSON配列形式で出力してください（説明文は含めず、JSONのみを出力）:
[
  {
    "target_category": "対象カテゴリ名",
    "rule_description": "具体的なルール説明（100文字程度）",
    "priority": "High" | "Medium" | "Low",
    "reasoning": "このルールを生成した理由（200文字程度）"
  }
]`

    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API Error:', errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Gemini API Error: ${response.status}`,
        },
        {status: response.status}
      )
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: 'AIからの応答が空です',
        },
        {status: 500}
      )
    }

    // JSON配列部分を抽出（複数のパターンに対応）
    let jsonStr: string | null = null

    // パターン1: 全体がJSON配列
    if (text.startsWith('[')) {
      jsonStr = text
    } else {
      // パターン2: テキスト中にJSON配列がある
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        jsonStr = jsonMatch[0]
      }
    }

    if (!jsonStr) {
      console.error('JSON extraction failed. Response:', text)
      return NextResponse.json(
        {
          success: false,
          error: 'AIの応答からJSONを抽出できませんでした',
          rawResponse: text.substring(0, 500), // デバッグ用に先頭500文字を返す
        },
        {status: 500}
      )
    }

    let drafts: RuleDraft[] = []
    try {
      const parsed = JSON.parse(jsonStr)
      // 配列でない場合は配列に変換
      drafts = Array.isArray(parsed) ? parsed : [parsed]
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'JSON string:', jsonStr)
      return NextResponse.json(
        {
          success: false,
          error: 'AIの応答のJSONパースに失敗しました',
          rawResponse: jsonStr.substring(0, 500),
        },
        {status: 500}
      )
    }

    return NextResponse.json({
      success: true,
      drafts,
    })
  } catch (error) {
    console.error('Generate draft error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
