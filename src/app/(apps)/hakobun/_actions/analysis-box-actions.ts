'use server'

import prisma from 'src/lib/prisma'
import type {
  CreateAnalysisBoxInput,
  CreateAnalysisSessionInput,
  CreateAnalysisRecordInput,
  UpdateAnalysisRecordFeedbackInput,
} from '../types'

// ============================================
// 分析BOX CRUD
// ============================================

// 分析BOX作成
export const createAnalysisBox = async (input: CreateAnalysisBoxInput) => {
  try {
    const box = await prisma.hakobunAnalysisBox.create({
      data: {
        name: input.name,
        description: input.description,
        hakobunClientId: input.hakobunClientId,
      },
      include: {
        sessions: true,
      },
    })
    return { success: true, data: box }
  } catch (error) {
    console.error('分析BOX作成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '分析BOXの作成に失敗しました',
    }
  }
}

// 分析BOX一覧取得
export const getAnalysisBoxes = async (params: {
  hakobunClientId: number
  search?: string
  take?: number
  skip?: number
}) => {
  try {
    const where = {
      hakobunClientId: params.hakobunClientId,
      ...(params.search && {
        name: { contains: params.search },
      }),
    }

    const boxes = await prisma.hakobunAnalysisBox.findMany({
      where,
      include: {
        sessions: {
          include: {
            _count: {
              select: { records: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: params.take,
      skip: params.skip,
    })

    const totalCount = await prisma.hakobunAnalysisBox.count({ where })

    return { success: true, data: { boxes, totalCount } }
  } catch (error) {
    console.error('分析BOX一覧取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '分析BOX一覧の取得に失敗しました',
    }
  }
}

// 分析BOX詳細取得
export const getAnalysisBoxById = async (id: number) => {
  try {
    const box = await prisma.hakobunAnalysisBox.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            _count: {
              select: { records: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        HakobunClient: true,
      },
    })

    if (!box) {
      return { success: false, error: '分析BOXが見つかりません' }
    }

    return { success: true, data: box }
  } catch (error) {
    console.error('分析BOX詳細取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '分析BOXの取得に失敗しました',
    }
  }
}

// 分析BOX更新
export const updateAnalysisBox = async (
  id: number,
  data: { name?: string; description?: string }
) => {
  try {
    const box = await prisma.hakobunAnalysisBox.update({
      where: { id },
      data,
      include: {
        sessions: true,
      },
    })
    return { success: true, data: box }
  } catch (error) {
    console.error('分析BOX更新エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '分析BOXの更新に失敗しました',
    }
  }
}

// 分析BOX削除
export const deleteAnalysisBox = async (id: number) => {
  try {
    await prisma.hakobunAnalysisBox.delete({
      where: { id },
    })
    return { success: true }
  } catch (error) {
    console.error('分析BOX削除エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '分析BOXの削除に失敗しました',
    }
  }
}

// ============================================
// 分析SESSION CRUD
// ============================================

// 分析SESSION作成
export const createAnalysisSession = async (input: CreateAnalysisSessionInput) => {
  try {
    const session = await prisma.hakobunAnalysisSession.create({
      data: {
        name: input.name,
        analysisBoxId: input.analysisBoxId,
        status: 'pending',
      },
      include: {
        records: true,
      },
    })
    return { success: true, data: session }
  } catch (error) {
    console.error('分析SESSION作成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '分析SESSIONの作成に失敗しました',
    }
  }
}

// 分析SESSION一覧取得（BOXに紐づく）
export const getAnalysisSessions = async (params: {
  analysisBoxId: number
  search?: string
  take?: number
  skip?: number
}) => {
  try {
    const where = {
      analysisBoxId: params.analysisBoxId,
      ...(params.search && {
        name: { contains: params.search },
      }),
    }

    const sessions = await prisma.hakobunAnalysisSession.findMany({
      where,
      include: {
        _count: {
          select: { records: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: params.take,
      skip: params.skip,
    })

    // isConfirmed, confirmedAt を含む形式で返す
    const sessionsWithConfirmed = sessions.map(session => ({
      ...session,
      isConfirmed: session.isConfirmed,
      confirmedAt: session.confirmedAt,
    }))

    const totalCount = await prisma.hakobunAnalysisSession.count({ where })

    return { success: true, data: { sessions: sessionsWithConfirmed, totalCount } }
  } catch (error) {
    console.error('分析SESSION一覧取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '分析SESSION一覧の取得に失敗しました',
    }
  }
}

// 分析SESSION詳細取得
export const getAnalysisSessionById = async (id: number) => {
  try {
    const session = await prisma.hakobunAnalysisSession.findUnique({
      where: { id },
      include: {
        records: {
          orderBy: { sortOrder: 'asc' },
        },
        analysisBox: {
          include: {
            HakobunClient: true,
          },
        },
      },
    })

    if (!session) {
      return { success: false, error: '分析SESSIONが見つかりません' }
    }

    return { success: true, data: session }
  } catch (error) {
    console.error('分析SESSION詳細取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '分析SESSIONの取得に失敗しました',
    }
  }
}

// 分析SESSIONステータス更新
export const updateAnalysisSessionStatus = async (
  id: number,
  status: 'pending' | 'analyzing' | 'completed' | 'error',
  errorMessage?: string
) => {
  try {
    const session = await prisma.hakobunAnalysisSession.update({
      where: { id },
      data: {
        status,
        analyzedAt: status === 'completed' ? new Date() : undefined,
        errorMessage: status === 'error' ? errorMessage : null,
      },
    })
    return { success: true, data: session }
  } catch (error) {
    console.error('分析SESSIONステータス更新エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ステータス更新に失敗しました',
    }
  }
}

// 分析SESSION削除
export const deleteAnalysisSession = async (id: number) => {
  try {
    await prisma.hakobunAnalysisSession.delete({
      where: { id },
    })
    return { success: true }
  } catch (error) {
    console.error('分析SESSION削除エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '分析SESSIONの削除に失敗しました',
    }
  }
}

// ============================================
// 分析レコード CRUD
// ============================================

// 分析レコード一括作成（分析完了時）
export const createAnalysisRecords = async (records: CreateAnalysisRecordInput[]) => {
  try {
    const createdRecords = await prisma.hakobunAnalysisRecord.createMany({
      data: records.map((r, index) => ({
        rawText: r.rawText,
        analysisStage: r.analysisStage,
        analysisSentiment: r.analysisSentiment,
        analysisGeneralCategory: r.analysisGeneralCategory,
        analysisCategory: r.analysisCategory,
        analysisTopic: r.analysisTopic,
        isProposedGeneralCategory: r.isProposedGeneralCategory ?? false,
        isProposedCategory: r.isProposedCategory ?? false,
        sessionId: r.sessionId,
        sortOrder: index,
      })),
    })

    // SESSIONのステータスを更新
    if (records.length > 0) {
      await prisma.hakobunAnalysisSession.update({
        where: { id: records[0].sessionId },
        data: {
          status: 'completed',
          analyzedAt: new Date(),
        },
      })
    }

    return { success: true, data: { count: createdRecords.count } }
  } catch (error) {
    console.error('分析レコード一括作成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '分析レコードの作成に失敗しました',
    }
  }
}

// 分析レコード一覧取得（SESSIONに紐づく）
export const getAnalysisRecords = async (params: {
  sessionId: number
  take?: number
  skip?: number
}) => {
  try {
    const records = await prisma.hakobunAnalysisRecord.findMany({
      where: {
        sessionId: params.sessionId,
      },
      orderBy: { sortOrder: 'asc' },
      take: params.take,
      skip: params.skip,
    })

    const totalCount = await prisma.hakobunAnalysisRecord.count({
      where: { sessionId: params.sessionId },
    })

    return { success: true, data: { records, totalCount } }
  } catch (error) {
    console.error('分析レコード一覧取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '分析レコード一覧の取得に失敗しました',
    }
  }
}

// 分析レコードフィードバック更新
export const updateAnalysisRecordFeedback = async (
  id: number,
  feedback: UpdateAnalysisRecordFeedbackInput
) => {
  try {
    const record = await prisma.hakobunAnalysisRecord.update({
      where: { id },
      data: {
        feedbackStage: feedback.feedbackStage,
        feedbackSentiment: feedback.feedbackSentiment,
        feedbackGeneralCategory: feedback.feedbackGeneralCategory,
        feedbackCategory: feedback.feedbackCategory,
        feedbackTopic: feedback.feedbackTopic,
        reviewerComment: feedback.reviewerComment,
        isModified: feedback.isModified,
      },
    })
    return { success: true, data: record }
  } catch (error) {
    console.error('分析レコードフィードバック更新エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'フィードバック更新に失敗しました',
    }
  }
}

// 分析レコード一括フィードバック更新
export const updateAnalysisRecordsFeedback = async (
  updates: Array<{ id: number; feedback: UpdateAnalysisRecordFeedbackInput }>
) => {
  try {
    const results = await Promise.all(
      updates.map((update) =>
        prisma.hakobunAnalysisRecord.update({
          where: { id: update.id },
          data: {
            feedbackStage: update.feedback.feedbackStage,
            feedbackSentiment: update.feedback.feedbackSentiment,
            feedbackGeneralCategory: update.feedback.feedbackGeneralCategory,
            feedbackCategory: update.feedback.feedbackCategory,
            feedbackTopic: update.feedback.feedbackTopic,
            reviewerComment: update.feedback.reviewerComment,
            isModified: update.feedback.isModified,
          },
        })
      )
    )
    return { success: true, data: { count: results.length } }
  } catch (error) {
    console.error('分析レコード一括フィードバック更新エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '一括フィードバック更新に失敗しました',
    }
  }
}

// 分析レコード削除
export const deleteAnalysisRecord = async (id: number) => {
  try {
    await prisma.hakobunAnalysisRecord.delete({
      where: { id },
    })
    return { success: true }
  } catch (error) {
    console.error('分析レコード削除エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '分析レコードの削除に失敗しました',
    }
  }
}

// ============================================
// 新規提案カテゴリの承認/却下
// ============================================

// 新規提案カテゴリを承認（マスタに登録）
export const approveProposedCategory = async (
  recordId: number,
  industryId: number
) => {
  try {
    // レコード取得
    const record = await prisma.hakobunAnalysisRecord.findUnique({
      where: { id: recordId },
    })

    if (!record) {
      return { success: false, error: 'レコードが見つかりません' }
    }

    const generalCategoryName = record.analysisGeneralCategory
    const categoryName = record.analysisCategory

    // 一般カテゴリの処理
    if (record.isProposedGeneralCategory && generalCategoryName) {
      // 既存の一般カテゴリをチェック
      const existingGc = await prisma.hakobunIndustryGeneralCategory.findFirst({
        where: {
          industryId,
          name: generalCategoryName,
        },
      })

      if (!existingGc) {
        // 最大sortOrderを取得
        const maxSortOrderGc = await prisma.hakobunIndustryGeneralCategory.findFirst({
          where: { industryId },
          orderBy: { sortOrder: 'desc' },
        })

        // 一般カテゴリを作成
        await prisma.hakobunIndustryGeneralCategory.create({
          data: {
            name: generalCategoryName,
            industryId,
            sortOrder: (maxSortOrderGc?.sortOrder ?? 0) + 1,
          },
        })
      }
    }

    // カテゴリの処理
    if (record.isProposedCategory && categoryName && generalCategoryName) {
      // 親の一般カテゴリを取得
      const parentGc = await prisma.hakobunIndustryGeneralCategory.findFirst({
        where: {
          industryId,
          name: generalCategoryName,
        },
      })

      if (parentGc) {
        // 既存のカテゴリをチェック
        const existingCategory = await prisma.hakobunIndustryCategory.findFirst({
          where: {
            generalCategoryId: parentGc.id,
            name: categoryName,
          },
        })

        if (!existingCategory) {
          // 最大sortOrderを取得
          const maxSortOrderC = await prisma.hakobunIndustryCategory.findFirst({
            where: { generalCategoryId: parentGc.id },
            orderBy: { sortOrder: 'desc' },
          })

          // カテゴリを作成
          await prisma.hakobunIndustryCategory.create({
            data: {
              name: categoryName,
              generalCategoryId: parentGc.id,
              sortOrder: (maxSortOrderC?.sortOrder ?? 0) + 1,
            },
          })
        }
      }
    }

    // レコードの承認状態を更新
    const updatedRecord = await prisma.hakobunAnalysisRecord.update({
      where: { id: recordId },
      data: {
        proposalApproved: true,
      },
    })

    return { success: true, data: updatedRecord }
  } catch (error) {
    console.error('新規提案カテゴリ承認エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '承認処理に失敗しました',
    }
  }
}

// 新規提案カテゴリを却下（該当フィールドをnullに）
export const rejectProposedCategory = async (recordId: number) => {
  try {
    const record = await prisma.hakobunAnalysisRecord.findUnique({
      where: { id: recordId },
    })

    if (!record) {
      return { success: false, error: 'レコードが見つかりません' }
    }

    // 却下時は該当フィールドをnullにする
    const updateData: {
      proposalApproved: boolean
      analysisGeneralCategory?: null
      analysisCategory?: null
    } = {
      proposalApproved: false,
    }

    if (record.isProposedGeneralCategory) {
      updateData.analysisGeneralCategory = null
    }

    if (record.isProposedCategory) {
      updateData.analysisCategory = null
    }

    const updatedRecord = await prisma.hakobunAnalysisRecord.update({
      where: { id: recordId },
      data: updateData,
    })

    return { success: true, data: updatedRecord }
  } catch (error) {
    console.error('新規提案カテゴリ却下エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '却下処理に失敗しました',
    }
  }
}

// ============================================
// CSV出力用データ取得
// ============================================

// SESSION単位のレコード全件取得（CSV出力用）
export const getSessionRecordsForExport = async (sessionId: number) => {
  try {
    const records = await prisma.hakobunAnalysisRecord.findMany({
      where: { sessionId },
      orderBy: { sortOrder: 'asc' }, // 画面表示と同じ順序
    })

    return { success: true, data: records }
  } catch (error) {
    console.error('CSV出力用レコード取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'レコード取得に失敗しました',
    }
  }
}

// BOX単位のレコード全件取得（CSV出力用）
export const getBoxRecordsForExport = async (boxId: number) => {
  try {
    // BOXに紐づく全SESSIONのレコードを取得
    const records = await prisma.hakobunAnalysisRecord.findMany({
      where: {
        session: {
          analysisBoxId: boxId,
        },
      },
      include: {
        session: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' }, // 画面表示と同じ順序
    })

    return { success: true, data: records }
  } catch (error) {
    console.error('CSV出力用BOXレコード取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'BOXレコード取得に失敗しました',
    }
  }
}

// ============================================
// セッション確定機能
// ============================================

// セッションを確定する
export const confirmAnalysisSession = async (sessionId: number, hakobunClientId: number) => {
  try {
    // SESSIONを確定状態に更新
    const session = await prisma.hakobunAnalysisSession.update({
      where: { id: sessionId },
      data: {
        isConfirmed: true,
        confirmedAt: new Date(),
      },
    })

    // フィードバックが修正されたレコードを取得（ルール自動生成用）
    const modifiedRecords = await prisma.hakobunAnalysisRecord.findMany({
      where: {
        sessionId,
        isModified: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return {
      success: true,
      data: {
        session,
        modifiedRecordsCount: modifiedRecords.length,
      },
    }
  } catch (error) {
    console.error('セッション確定エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'セッションの確定に失敗しました',
    }
  }
}

// 確定済みセッションのレコード取得（CSV出力用・createdAt順）
export const getConfirmedSessionRecordsForExport = async (sessionId: number) => {
  try {
    // セッションが確定済みかチェック
    const session = await prisma.hakobunAnalysisSession.findUnique({
      where: { id: sessionId },
      select: { isConfirmed: true },
    })

    if (!session?.isConfirmed) {
      return {
        success: false,
        error: '未確定のセッションはエクスポートできません',
      }
    }

    // createdAt順でレコード取得
    const records = await prisma.hakobunAnalysisRecord.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    })

    return { success: true, data: records }
  } catch (error) {
    console.error('確定済みレコード取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'レコード取得に失敗しました',
    }
  }
}

// 複数セッションのレコード取得（セッション横断CSV出力用・createdAt順・全体通し連番）
export const getMultiSessionRecordsForExport = async (sessionIds: number[]) => {
  try {
    // 全セッションが確定済みかチェック
    const sessions = await prisma.hakobunAnalysisSession.findMany({
      where: { id: { in: sessionIds } },
      select: { id: true, isConfirmed: true, name: true },
    })

    const unconfirmedSessions = sessions.filter(s => !s.isConfirmed)
    if (unconfirmedSessions.length > 0) {
      return {
        success: false,
        error: `未確定のセッションが含まれています: ${unconfirmedSessions.map(s => s.name).join(', ')}`,
      }
    }

    // createdAt順でレコード取得（全セッション横断）
    const records = await prisma.hakobunAnalysisRecord.findMany({
      where: { sessionId: { in: sessionIds } },
      include: {
        session: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return { success: true, data: records }
  } catch (error) {
    console.error('複数セッションレコード取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'レコード取得に失敗しました',
    }
  }
}

// フィードバック修正データを取得（ルール生成用）
export const getModifiedRecordsForRuleGeneration = async (sessionId: number) => {
  try {
    const records = await prisma.hakobunAnalysisRecord.findMany({
      where: {
        sessionId,
        isModified: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return { success: true, data: records }
  } catch (error) {
    console.error('フィードバックレコード取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'レコード取得に失敗しました',
    }
  }
}

// クライアントの既存ルールを取得
export const getClientRules = async (hakobunClientId: number) => {
  try {
    const rules = await prisma.hakobunRule.findMany({
      where: { hakobunClientId },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: rules }
  } catch (error) {
    console.error('ルール取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ルール取得に失敗しました',
    }
  }
}

// ルールを保存（新規作成または既存更新）
export const saveGeneratedRules = async (
  hakobunClientId: number,
  rules: Array<{
    targetCategory: string
    ruleDescription: string
    priority: string
    isNew: boolean
    mergedWithRuleId?: number
  }>
) => {
  try {
    let savedCount = 0

    for (const rule of rules) {
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
        savedCount++
      }
    }

    return { success: true, data: { savedCount } }
  } catch (error) {
    console.error('ルール保存エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ルール保存に失敗しました',
    }
  }
}
