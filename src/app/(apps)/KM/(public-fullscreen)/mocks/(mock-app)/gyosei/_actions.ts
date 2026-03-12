'use server'

import { callGeminiForJson } from '@app/api/google/actions/geminiAPI'
import type { GeminiResponseSchema, GeminiInlineData } from '@app/api/google/actions/geminiAPI'
import prisma from 'src/lib/prisma'
import { put, del } from '@vercel/blob'
import ExcelJS from 'exceljs'
import { knockEmailApi } from 'src/cm/lib/methods/knockEmailApi'

// ===== 型定義 =====

export type TaskItem = {
  category: string // 交付申請/実績報告/中間報告/経費管理/その他
  task: string // タスク内容
  deadline: string // 期限
  responsible: string // 担当者
  priority: 'high' | 'medium' | 'low' // 優先度
  notes: string // 備考
}

export type AnalysisResult = {
  success: boolean
  tasks?: TaskItem[]
  reportGuide?: string
  error?: string
}

// 交付申請の状況
export type GrantStatus = 'not-applied' | 'applied' | 'decided'

// ===== スキーマ定義 =====

const analysisSchema: GeminiResponseSchema = {
  type: 'object',
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', description: '交付申請/実績報告/中間報告/経費管理/その他' },
          task: { type: 'string', description: 'タスク内容' },
          deadline: { type: 'string', description: '期限（具体的な日付または「交付決定後○日以内」等）' },
          responsible: { type: 'string', description: '担当者（申請者/行政書士/税理士/金融機関等）' },
          priority: { type: 'string', description: 'high/medium/low' },
          notes: { type: 'string', description: '備考・注意点' },
        },
        required: ['category', 'task', 'deadline', 'responsible', 'priority', 'notes'],
      },
    },
    reportGuide: {
      type: 'string',
      description: '実績報告ガイド（マークダウン形式）',
    },
  },
  required: ['tasks', 'reportGuide'],
}

// ===== セッション管理 =====

/** セッション作成、UUID返却 */
export async function createGyoseiSession(): Promise<string> {
  const session = await prisma.gyoseiSession.create({ data: {} })
  return session.uuid
}

/** セッション+ファイル取得 */
export async function getGyoseiSession(uuid: string) {
  const session = await prisma.gyoseiSession.findUnique({
    where: { uuid },
    include: { GyoseiFile: { orderBy: { sortOrder: 'asc' } } },
  })
  return session
}

/** STEP3入力データ保存 */
export async function updateGyoseiStep3(
  uuid: string,
  data: { grantStatus: string; adoptionDate?: string; grantDecisionDate?: string }
) {
  await prisma.gyoseiSession.update({
    where: { uuid },
    data: {
      grantStatus: data.grantStatus,
      adoptionDate: data.adoptionDate || null,
      grantDecisionDate: data.grantDecisionDate || null,
    },
  })
}

// ===== ファイルアップロード =====

/** Vercel Blobにアップロード + GyoseiFileレコード作成 */
export async function uploadGyoseiFile(formData: FormData): Promise<{
  name: string
  blobUrl: string
  fileId: number
}> {
  const file = formData.get('file') as File
  const sessionUuid = formData.get('sessionUuid') as string
  const fileType = formData.get('fileType') as string // plan / guidelines / guide
  const sortOrder = Number(formData.get('sortOrder') ?? 0)

  if (!file || !sessionUuid || !fileType) {
    throw new Error('必要なパラメータが不足しています')
  }

  // セッション取得
  const session = await prisma.gyoseiSession.findUnique({
    where: { uuid: sessionUuid },
  })
  if (!session) throw new Error('セッションが見つかりません')

  // Vercel Blobにアップロード
  const buffer = Buffer.from(await file.arrayBuffer())
  const blob = await put(
    `gyosei/${sessionUuid}/${fileType}_${sortOrder}_${file.name}`,
    buffer,
    { access: 'public', contentType: 'application/pdf' }
  )

  // DBレコード作成
  const record = await prisma.gyoseiFile.create({
    data: {
      fileName: file.name,
      blobUrl: blob.url,
      fileType,
      sortOrder,
      gyoseiSessionId: session.id,
    },
  })

  return { name: file.name, blobUrl: blob.url, fileId: record.id }
}

/** Blob削除 + レコード削除 */
export async function removeGyoseiFile(fileId: number, blobUrl: string) {
  await del(blobUrl)
  await prisma.gyoseiFile.delete({ where: { id: fileId } })
}

// ===== AI分析 =====

/** DB上のセッションからBlob URLを取得し、Geminiに送信して分析 */
export async function analyzeSubsidyPlanII(input: {
  sessionUuid: string
}): Promise<AnalysisResult> {
  const session = await prisma.gyoseiSession.findUnique({
    where: { uuid: input.sessionUuid },
    include: { GyoseiFile: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!session) {
    return { success: false, error: 'セッションが見つかりません' }
  }

  // ステータス更新
  await prisma.gyoseiSession.update({
    where: { uuid: input.sessionUuid },
    data: { status: 'analyzing' },
  })

  // Blob URLからPDFをfetchしてBase64に変換
  const inlineData: GeminiInlineData[] = []

  for (const file of session.GyoseiFile) {
    try {
      const res = await fetch(file.blobUrl)
      const arrayBuffer = await res.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      inlineData.push({ mimeType: 'application/pdf', data: base64 })
    } catch (e) {
      console.error(`ファイル取得失敗: ${file.fileName}`, e)
    }
  }

  if (inlineData.length === 0) {
    await prisma.gyoseiSession.update({
      where: { uuid: input.sessionUuid },
      data: { status: 'error' },
    })
    return { success: false, error: 'アップロードされたファイルを読み込めませんでした' }
  }

  // ファイル分類
  const planFiles = session.GyoseiFile.filter(f => f.fileType === 'plan')
  const guidelinesFiles = session.GyoseiFile.filter(f => f.fileType === 'guidelines')
  const guideFiles = session.GyoseiFile.filter(f => f.fileType === 'guide')

  const grantStatus = (session.grantStatus || 'not-applied') as GrantStatus

  // 状況テキスト
  const statusTextMap: Record<GrantStatus, string> = {
    'not-applied': '交付申請未申請（採択のみ）',
    'applied': '交付申請済み（交付決定待ち）',
    'decided': `交付決定済み${session.grantDecisionDate ? `（交付決定日: ${session.grantDecisionDate}）` : ''}`,
  }
  const statusText = statusTextMap[grantStatus]

  const dateInfo = session.adoptionDate ? `採択日: ${session.adoptionDate}` : '採択日: 不明'

  const grantStatusInstruction = grantStatus === 'decided'
    ? `交付決定日${session.grantDecisionDate || '(不明)'}を基準に補助対象期間の開始を考慮`
    : grantStatus === 'applied'
      ? '交付申請済みのため、交付決定待ちの間に準備すべき事項を含めてリストアップ'
      : '交付決定前のため、交付申請手続きを最優先でリストアップ'

  const prompt = `あなたは補助金の専門家（行政書士）です。以下の情報を分析し、補助金採択後に必要な「やることリスト」と「実績報告ガイド」を作成してください。

## 入力情報
- 添付PDF: 補助金の計画書（事業計画書）${planFiles.length > 1 ? `（${planFiles.length}ファイル）` : ''}
- 添付PDF: 公募要領${guidelinesFiles.length > 1 ? `（${guidelinesFiles.length}ファイル）` : ''}
  ※公募要領の内容を参照して、手続き要件や期限を確認してください。
${guideFiles.length > 0 ? `- 手引きPDF: ${guideFiles.map((f) => f.fileName).join(', ')}\n` : ''}
## 申請者の状況
- ${dateInfo}
- ${statusText}

## やることリスト出力要件
以下のカテゴリに分類して、優先度と時系列を考慮してタスクを洗い出してください：

1. **交付申請** — 採択後の交付申請に必要な手続き
2. **経費管理** — 補助事業期間中の経費処理・証憑管理
3. **中間報告** — 中間検査・報告が必要な場合の手続き
4. **実績報告** — 事業完了後の実績報告・確定検査
5. **その他** — 上記に該当しないが重要な手続き

### 優先度の基準
- **high**: 期限が厳格/未対応だと補助金取消リスクがあるもの
- **medium**: 期間中に対応が必要だが多少の猶予があるもの
- **low**: 推奨事項/ベストプラクティス

### 注意事項
- 見落としがちな注意点（相見積もりの要否、経費の支払時期制限、写真撮影等）も含める
- 期限は可能な限り具体的に（${session.adoptionDate ? `採択日${session.adoptionDate}を基準に具体的な日付で算出` : '「採択通知後○日以内」等'}）
- ${grantStatusInstruction}
- 担当者は「申請者」「行政書士」「税理士」「金融機関」等で分類
- 最低15個以上のタスクを生成すること

## 実績報告ガイド出力要件
実績報告に関する詳細なガイドをマークダウン形式で作成してください：
- 実績報告の概要と目的
- 必要書類のチェックリスト
- 提出期限と注意事項
- よくあるミスと対策
- 経費の証拠書類の保管方法`

  try {
    const result = await callGeminiForJson<{ tasks: TaskItem[]; reportGuide: string }>(
      prompt,
      analysisSchema,
      {
        model: 'gemini-2.5-flash',
        inlineData,
        generationConfig: {
          maxOutputTokens: 16384,
          temperature: 0.3,
        },
      }
    )

    if (!result.success || !result.data?.tasks) {
      await prisma.gyoseiSession.update({
        where: { uuid: input.sessionUuid },
        data: { status: 'error' },
      })
      return {
        success: false,
        error: result.error || 'AIからの応答を取得できませんでした。もう一度お試しください。',
      }
    }

    // 結果をDBに保存
    await prisma.gyoseiSession.update({
      where: { uuid: input.sessionUuid },
      data: {
        status: 'completed',
        analysisResult: { tasks: result.data.tasks, reportGuide: result.data.reportGuide },
      },
    })

    return {
      success: true,
      tasks: result.data.tasks,
      reportGuide: result.data.reportGuide,
    }
  } catch (e) {
    console.error('AI分析エラー:', e)
    await prisma.gyoseiSession.update({
      where: { uuid: input.sessionUuid },
      data: { status: 'error' },
    })
    return {
      success: false,
      error: 'AIの分析中にエラーが発生しました。もう一度お試しください。',
    }
  }
}

// ===== Excel生成 + メール送信 =====

const PRIORITY_LABELS: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

/** Excel生成してメール送信 */
export async function sendExcelByEmail(
  uuid: string,
  email: string
): Promise<{ success: boolean; message: string }> {
  const session = await prisma.gyoseiSession.findUnique({
    where: { uuid },
  })

  if (!session || !session.analysisResult) {
    return { success: false, message: 'セッションまたは分析結果が見つかりません' }
  }

  const { tasks, reportGuide } = session.analysisResult as {
    tasks: TaskItem[]
    reportGuide: string
  }

  // Excelワークブック作成
  const wb = new ExcelJS.Workbook()

  // タスク一覧シート
  const taskSheet = wb.addWorksheet('やることリスト')
  const headers = ['優先度', 'カテゴリ', 'タスク', '期限', '担当', '備考']
  const colWidths = [8, 12, 40, 25, 12, 30]
  taskSheet.columns = headers.map((header, i) => ({ header, width: colWidths[i] }))
  for (const t of tasks) {
    taskSheet.addRow([
      PRIORITY_LABELS[t.priority] || t.priority,
      t.category,
      t.task,
      t.deadline,
      t.responsible,
      t.notes,
    ])
  }

  // 実績報告ガイドシート
  if (reportGuide) {
    const guideSheet = wb.addWorksheet('実績報告ガイド')
    guideSheet.getColumn(1).width = 100
    for (const line of reportGuide.split('\n')) {
      guideSheet.addRow([line])
    }
  }

  // Bufferとして出力
  const excelBuffer = Buffer.from(await wb.xlsx.writeBuffer())

  // メールアドレスをDBに保存
  await prisma.gyoseiSession.update({
    where: { uuid },
    data: { email },
  })

  // メール送信
  const result = await knockEmailApi({
    subject: '【AI行政書士君 II】やることリスト（Excel）',
    text: `AI行政書士君 IIをご利用いただきありがとうございます。\n\n分析結果のExcelファイルを添付いたします。\n\n※本メールは自動送信です。\n※本ツールで生成された情報は参考情報としてご活用ください。`,
    to: [email],
    attachments: [
      {
        filename: 'やることリスト.xlsx',
        content: excelBuffer,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    ],
  })

  return {
    success: result.success,
    message: result.success ? '送信しました' : `送信に失敗しました: ${result.message}`,
  }
}
