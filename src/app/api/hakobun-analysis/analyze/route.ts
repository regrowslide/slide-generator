import {NextRequest, NextResponse} from 'next/server'
import prisma from '@/lib/prisma'
import {AnalyzeRequest, AnalyzeResponse, AnalysisResult} from '@appDir/(apps)/hakobun-analysis/types'
import {v4 as uuidv4} from 'uuid'

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json()
    const {client_id, raw_text, voice_id, timestamp} = body

    if (!client_id || !raw_text) {
      return NextResponse.json(
        {
          success: false,
          error: 'client_id と raw_text は必須です',
        } as AnalyzeResponse,
        {status: 400}
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEY環境変数が設定されていません',
        } as AnalyzeResponse,
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
        } as AnalyzeResponse,
        {status: 404}
      )
    }

    // ===== Phase 1: コンテキスト取得 (Retrieval) =====

    // 1. カテゴリマスター取得
    const categories = await prisma.hakobunCategory.findMany({
      where: {hakobunClientId: client.id},
      orderBy: {categoryCode: 'asc'},
    })

    // 2. 直近修正事例50件取得（アーカイブ済みは除外）
    const corrections = await prisma.hakobunCorrection.findMany({
      where: {
        hakobunClientId: client.id,
        archived: false,
      },
      orderBy: {createdAt: 'desc'},
      take: 50,
    })

    // 3. 全ルール取得
    const rules = await prisma.hakobunRule.findMany({
      where: {hakobunClientId: client.id},
      orderBy: [{priority: 'asc'}, {createdAt: 'desc'}],
    })

    // ===== Phase 2: 動的プロンプト構築 =====
    const systemPrompt = buildSystemPrompt(categories, corrections, rules)

    // ===== Phase 3: Gemini API呼び出し =====
    const generatedVoiceId = voice_id || uuidv4()

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
                text: `${systemPrompt}\n\n【分析対象テキスト】\n${raw_text}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API Error:', errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Gemini API Error: ${response.status} ${response.statusText}`,
        } as AnalyzeResponse,
        {status: response.status}
      )
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini APIからの応答が空です',
        } as AnalyzeResponse,
        {status: 500}
      )
    }

    // JSON部分を抽出
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        {
          success: false,
          error: 'AIからの応答をJSONとして解析できませんでした',
        } as AnalyzeResponse,
        {status: 500}
      )
    }

    const jsonText = jsonMatch[1] || jsonMatch[0]
    let parsedResult: AnalysisResult

    try {
      parsedResult = JSON.parse(jsonText)
      // voice_idとtimestampを設定
      parsedResult.voice_id = generatedVoiceId
      parsedResult.process_timestamp = timestamp || new Date().toISOString()
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        {
          success: false,
          error: 'AIの応答をJSONとしてパースできませんでした',
        } as AnalyzeResponse,
        {status: 500}
      )
    }

    // ===== 結果をDBに保存 =====
    await prisma.hakobunVoice.create({
      data: {
        voiceId: generatedVoiceId,
        rawText: raw_text,
        processedAt: new Date(),
        resultJson: parsedResult as any,
        hakobunClientId: client.id,
      },
    })

    return NextResponse.json({
      success: true,
      result: parsedResult,
    } as AnalyzeResponse)
  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as AnalyzeResponse,
      {status: 500}
    )
  }
}

// 動的プロンプト構築関数
function buildSystemPrompt(
  categories: {categoryCode: string; generalCategory: string; specificCategory: string; description: string | null}[],
  corrections: {rawSegment: string; correctCategoryCode: string; sentiment: string}[],
  rules: {targetCategory: string; ruleDescription: string; priority: string}[]
): string {
  const categoryList =
    categories.length > 0
      ? categories
          .map(
            c => `${c.categoryCode}: ${c.generalCategory} > ${c.specificCategory}${c.description ? ` (${c.description})` : ''}`
          )
          .join('\n')
      : '（カテゴリマスターが未登録です。適切なカテゴリを生成してください）'

  const ruleList =
    rules.length > 0
      ? rules.map(r => `- [${r.priority}] ${r.targetCategory}: ${r.ruleDescription}`).join('\n')
      : '（ルールが未登録です）'

  const correctionList =
    corrections.length > 0
      ? corrections
          .slice(0, 20)
          .map(c => `入力「${c.rawSegment}」→ ${c.correctCategoryCode} (${c.sentiment})`)
          .join('\n')
      : '（修正事例がまだありません）'

  return `あなたは顧客の声分析の専門家です。お客様からのフィードバックテキストを分析し、構造化されたJSONデータを生成してください。

【厳守ルール】
${ruleList}

【直近の正解事例（Few-Shot）】
${correctionList}

【出力形式】
以下の3階層JSONモデルに従って出力してください：
- Raw（全体）> Segment（文節）> Extract（抽出要素）

\`\`\`json
{
  "voice_id": "（自動生成されます）",
  "process_timestamp": "（自動生成されます）",
  "segments": [
    {
      "segment_id": 1,
      "input_text": "文節のテキスト",
      "extracts": [
        {
          "text_fragment": "抽出した具体的なフレーズ",
          "sentiment": "好意的 | 不満 | 中立",
          "category_id": "cat_XX",
          "general_category": "大カテゴリ",
          "specific_category": "小カテゴリ",
          "is_new_generated": false
        }
      ]
    }
  ]
}
\`\`\`

【カテゴリ一覧】
${categoryList}

【重要な指示】
1. テキストを意味のある文節（Segment）に分割してください
2. 各文節から評価対象となる要素（Extract）を抽出してください
3. カテゴリはマスター一覧から選択してください
4. マスターに該当するカテゴリがない場合のみ、is_new_generated: true として新しいカテゴリを提案してください
5. sentiment（感情）は「好意的」「不満」「中立」のいずれかを選択してください
6. 必ずJSON形式のみで回答してください（説明文は不要）`
}
