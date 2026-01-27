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

    const totalCount = await prisma.hakobunAnalysisSession.count({ where })

    return { success: true, data: { sessions, totalCount } }
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
