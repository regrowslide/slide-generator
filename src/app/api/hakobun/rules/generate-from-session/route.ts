import { NextRequest, NextResponse } from 'next/server'
import prisma from 'src/lib/prisma'
import { callGeminiForJson, type GeminiResponseSchema } from '@app/api/google/actions/geminiAPI'

// AIが生成するルールのスキーマ
const GENERATED_RULE_SCHEMA: GeminiResponseSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      targetCategory: { type: 'string', description: '対象カテゴリ名' },
      ruleDescription: { type: 'string', description: 'ルール内容（分類の判断基準や注意点）' },
      priority: { type: 'string', enum: ['High', 'Medium', 'Low'], description: '優先度' },
      isNew: { type: 'boolean', description: '新規ルールならtrue、既存ルールのマージならfalse' },
      mergedWithRuleId: { type: 'number', description: '既存ルールとマージする場合のルールID（新規の場合はnull）' },
    },
    required: ['targetCategory', 'ruleDescription', 'priority', 'isNew'],
  },
}

interface GeneratedRule {
  targetCategory: string
  ruleDescription: string
  priority: 'High' | 'Medium' | 'Low'
  isNew: boolean
  mergedWithRuleId?: number | null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, hakobunClientId, saveRules = false } = body

    if (!sessionId || !hakobunClientId) {
      return NextResponse.json(
        { success: false, error: 'sessionIdとhakobunClientIdは必須です' },
        { status: 400 }
      )
    }

    // 修正されたレコードを取得（結合サブレコード含む）
    const modifiedRecords = await prisma.hakobunAnalysisRecord.findMany({
      where: {
        sessionId,
        isModified: true,
      },
      include: {
        mergedRecords: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    if (modifiedRecords.length === 0) {
      return NextResponse.json({
        success: true,
        generatedRules: [],
        savedCount: 0,
        message: '修正されたレコードがないため、ルール生成をスキップしました',
      })
    }

    // 既存ルールを取得
    const existingRules = await prisma.hakobunRule.findMany({
      where: { hakobunClientId },
      orderBy: { createdAt: 'desc' },
    })

    // フィードバック事例を整形（結合情報・評価情報含む）
    const feedbackExamples = modifiedRecords.map((record: any, index: number) => {
      const original = {
        stage: record.analysisStage,
        sentiment: record.analysisSentiment,
        generalCategory: record.analysisGeneralCategory,
        category: record.analysisCategory,
        topic: record.analysisTopic,
      }
      const corrected = {
        stage: record.feedbackStage || record.analysisStage,
        sentiment: record.feedbackSentiment || record.analysisSentiment,
        generalCategory: record.feedbackGeneralCategory || record.analysisGeneralCategory,
        category: record.feedbackCategory || record.analysisCategory,
        topic: record.feedbackTopic || record.analysisTopic,
      }

      // 評価情報
      const evaluationText = record.evaluation
        ? `評価: ${record.evaluation}${record.evaluation === 'C' ? '（NG - 重点的に分析が必要）' : record.evaluation === 'B' ? '（要注意）' : '（問題なし）'}`
        : '評価: 未評価'

      // 結合されたサブレコードの情報
      const mergedRecordsInfo = record.mergedRecords && record.mergedRecords.length > 0
        ? record.mergedRecords.map((sub: any, subIdx: number) =>
          `  結合サブ${subIdx + 1}: "${sub.rawText}"${sub.mergeComment ? `（結合理由: ${sub.mergeComment}）` : ''}`
        ).join('\n')
        : ''

      let example = `
【事例${index + 1}】
原文: ${record.rawText}
${evaluationText}
修正前: ステージ=${original.stage}, 感情=${original.sentiment}, 一般カテゴリ=${original.generalCategory}, カテゴリ=${original.category}
修正後: ステージ=${corrected.stage}, 感情=${corrected.sentiment}, 一般カテゴリ=${corrected.generalCategory}, カテゴリ=${corrected.category}
レビュアーコメント: ${record.reviewerComment || '（なし）'}`.trim()

      if (mergedRecordsInfo) {
        example += `\n結合されたレコード:\n${mergedRecordsInfo}`
      }

      return example
    }).join('\n\n')

    // 既存ルールを整形
    const existingRulesText = existingRules.length > 0
      ? existingRules.map(rule => `
- ID: ${rule.id}
  対象カテゴリ: ${rule.targetCategory}
  ルール内容: ${rule.ruleDescription}
  優先度: ${rule.priority}
`).join('')
      : '（既存ルールはありません）'

    // プロンプト作成
    const prompt = `
あなたは顧客の声分析システムの分類ルールを管理するエキスパートです。

## タスク
以下のフィードバック事例（人間レビュアーによる修正データ）を分析し、今後のAI分析に活用できる分類ルールを生成してください。

## フィードバック事例
${feedbackExamples}

## 既存ルール一覧
${existingRulesText}

## ルール生成の指針
1. フィードバック事例から、AIが間違いやすいパターンや判断基準を抽出してください
2. 既存ルールと重複・類似する場合は、既存ルールを更新（マージ）してください
   - その場合は isNew: false とし、mergedWithRuleId に既存ルールのIDを設定
3. 新規パターンの場合は新しいルールを作成してください
   - その場合は isNew: true とし、mergedWithRuleId は設定しない
4. ルール内容は具体的かつ実用的に記述してください
   - 「〜の場合は〜に分類する」のような形式
   - 判断に迷いやすいケースの基準を明確に
5. 優先度は以下の基準で設定：
   - High: 頻繁に発生する誤分類パターン、重要なカテゴリ
   - Medium: 時々発生する誤分類パターン
   - Low: 稀なケース、補足的なルール
6. 評価C（NG）のレコードは特に重点的に分析し、なぜ誤分類が発生したかを明確にルール化してください
7. 結合されたレコードがある場合、AIが過度に分割しているパターンを検出し、「このような場合は分割せず1つのトピックとして扱う」というルールを生成してください

## 出力形式
JSON配列で出力してください。各要素は以下の形式：
{
  "targetCategory": "対象カテゴリ名",
  "ruleDescription": "ルール内容",
  "priority": "High" | "Medium" | "Low",
  "isNew": true/false,
  "mergedWithRuleId": 既存ルールID（新規の場合はnull）
}

## 注意
- フィードバック事例から有意義なルールが抽出できない場合は、空の配列を返してください
- 1つの事例から複数のルールを生成しても構いません
- レビュアーコメントに分析の考え方が記載されている場合は、それを重視してください
`

    // Gemini APIでルール生成
    const result = await callGeminiForJson<GeneratedRule[]>(
      prompt,
      GENERATED_RULE_SCHEMA,
      {
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        },
      }
    )

    if (!result.success || !result.data) {
      console.error('ルール生成APIエラー:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error || 'ルール生成に失敗しました',
      })
    }

    const generatedRules = result.data

    // ルールが空の場合
    if (!generatedRules || generatedRules.length === 0) {
      return NextResponse.json({
        success: true,
        generatedRules: [],
        savedCount: 0,
        modifiedRecordsCount: modifiedRecords.length,
        message: '有意義なルールを抽出できませんでした',
      })
    }

    // プレビューモードの場合は保存せずに返す
    if (!saveRules) {
      return NextResponse.json({
        success: true,
        generatedRules,
        savedCount: 0,
        modifiedRecordsCount: modifiedRecords.length,
        isPreview: true,
      })
    }

    // ルールをDBに保存
    let savedCount = 0
    let mergedCount = 0
    for (const rule of generatedRules) {
      try {
        if (rule.isNew) {
          // 新規ルールを作成
          await prisma.hakobunRule.create({
            data: {
              targetCategory: rule.targetCategory,
              ruleDescription: rule.ruleDescription,
              priority: rule.priority,
              hakobunClientId,
            },
          })
          savedCount++
        } else if (rule.mergedWithRuleId) {
          // 既存ルールを更新
          await prisma.hakobunRule.update({
            where: { id: rule.mergedWithRuleId },
            data: {
              ruleDescription: rule.ruleDescription,
              priority: rule.priority,
            },
          })
          mergedCount++
        }
      } catch (saveError) {
        console.error('ルール保存エラー:', saveError, rule)
      }
    }

    return NextResponse.json({
      success: true,
      generatedRules,
      savedCount,
      mergedCount,
      modifiedRecordsCount: modifiedRecords.length,
    })
  } catch (error) {
    console.error('ルール生成APIエラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'ルール生成に失敗しました',
      },
      { status: 500 }
    )
  }
}
