'use server'

import { callGeminiForJson } from '@app/api/google/actions/geminiAPI'
import type { GeminiResponseSchema } from '@app/api/google/actions/geminiAPI'

// ===== 型定義 =====

export type TaskItem = {
  category: string // 交付申請/実績報告/中間報告/経費管理/その他
  task: string // タスク内容
  deadline: string // 期限（「採択通知後○日以内」等）
  responsible: string // 担当者（申請者/行政書士/税理士等）
  notes: string // 備考
}

export type AnalysisResult = {
  success: boolean
  tasks?: TaskItem[]
  summary?: string
  error?: string
}

// ===== スキーマ定義 =====

// Gemini APIはトップレベルarrayだと"Maximum array nesting exceeded"になるためobjectでラップ
const taskListSchema: GeminiResponseSchema = {
  type: 'object',
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', description: '交付申請/実績報告/中間報告/経費管理/その他' },
          task: { type: 'string', description: 'タスク内容' },
          deadline: { type: 'string', description: '期限（「採択通知後○日以内」「○月○日まで」等）' },
          responsible: { type: 'string', description: '担当者（申請者/行政書士/税理士/金融機関等）' },
          notes: { type: 'string', description: '備考・注意点' },
        },
        required: ['category', 'task', 'deadline', 'responsible', 'notes'],
      },
    },
  },
  required: ['tasks'],
}

// ===== Server Action =====

export async function analyzeSubsidyPlan(
  planFileBase64: string,
  guidelinesUrl: string
): Promise<AnalysisResult> {
  // Base64のdata:接頭辞を除去
  const base64Data = planFileBase64.replace(/^data:application\/pdf;base64,/, '')

  const prompt = `あなたは補助金の専門家です。以下の情報を分析し、補助金採択後に必要な「やることリスト」を作成してください。

## 入力情報
- 添付PDF: 補助金の計画書（事業計画書）
- 公募要領URL: ${guidelinesUrl}
  ※上記URLの内容も参照して、手続き要件や期限を確認してください。

## 出力要件
以下のカテゴリに分類して、時系列順にタスクを洗い出してください：

1. **交付申請** - 採択後の交付申請に必要な手続き
2. **経費管理** - 補助事業期間中の経費処理・証憑管理
3. **中間報告** - 中間検査・報告が必要な場合の手続き
4. **実績報告** - 事業完了後の実績報告・確定検査
5. **その他** - 上記に該当しないが重要な手続き

## 注意事項
- 見落としがちな注意点（相見積もりの要否、経費の支払時期制限、写真撮影等）も含める
- 期限は可能な限り具体的に（「採択通知後30日以内」「事業完了後60日以内」等）
- 担当者は「申請者」「行政書士」「税理士」「金融機関」等で分類
- 最低10個以上のタスクを生成すること`

  const result = await callGeminiForJson<{ tasks: TaskItem[] }>(prompt, taskListSchema, {
    model: 'gemini-2.5-flash',
    inlineData: [{ mimeType: 'application/pdf', data: base64Data }],
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.3,
    },
  })

  if (!result.success || !result.data?.tasks) {
    return {
      success: false,
      error: result.error || 'AIからの応答を取得できませんでした。もう一度お試しください。',
    }
  }

  const tasks = result.data.tasks
  return {
    success: true,
    tasks,
    summary: `${tasks.length}件のタスクを生成しました。`,
  }
}
