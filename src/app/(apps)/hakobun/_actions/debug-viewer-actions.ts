'use server'

import prisma from 'src/lib/prisma'

// ============================================
// クライアントデータビューア用 Server Actions
// ============================================

// クライアント選択ドロップダウン用
export interface ClientOption {
  id: number
  clientId: string
  name: string
}

// データカウント
export interface DataCounts {
  stages: number
  corrections: number
  rules: number
  voices: number
  analysisBoxes: number
  totalSessions: number
  totalRecords: number
}

// クライアント全データ取得結果
export interface ClientFullData {
  client: {
    id: number
    clientId: string
    name: string
    createdAt: Date
    updatedAt: Date | null
    inputDataExplain: string | null
    analysisStartDate: Date | null
    analysisEndDate: Date | null
    industryId: number | null
  }
  industry: {
    id: number
    code: string
    name: string
    generalCategories: {
      id: number
      name: string
      description: string | null
      sortOrder: number
      categories: {
        id: number
        name: string
        description: string | null
        sortOrder: number
        enabled: boolean
      }[]
    }[]
  } | null
  stages: {
    id: number
    name: string
    description: string | null
    sortOrder: number
    enabled: boolean
  }[]
  corrections: {
    id: number
    createdAt: Date
    rawSegment: string
    originalGeneralCategory: string | null
    originalCategory: string | null
    originalSentiment: string | null
    correctGeneralCategory: string | null
    correctCategory: string
    correctSentiment: string
    reviewerComment: string | null
    archived: boolean
  }[]
  rules: {
    id: number
    createdAt: Date
    targetCategory: string
    ruleDescription: string
    priority: string
  }[]
  voices: {
    id: number
    voiceId: string
    rawText: string
    processedAt: Date | null
    createdAt: Date
  }[]
  analysisBoxes: {
    id: number
    name: string
    description: string | null
    createdAt: Date
    sessions: {
      id: number
      name: string
      status: string
      analyzedAt: Date | null
      createdAt: Date
      records: {
        id: number
        rawText: string
        analysisStage: string | null
        analysisSentiment: string | null
        analysisGeneralCategory: string | null
        analysisCategory: string | null
        feedbackStage: string | null
        feedbackSentiment: string | null
        feedbackGeneralCategory: string | null
        feedbackCategory: string | null
        isModified: boolean
        isEnabled: boolean
      }[]
      _count: {
        records: number
      }
    }[]
  }[]
  counts: DataCounts
}

// --- クライアント一覧取得（ドロップダウン用）---
export const getClientsForViewer = async (): Promise<{
  success: boolean
  data?: ClientOption[]
  error?: string
}> => {
  try {
    const clients = await prisma.hakobunClient.findMany({
      select: {
        id: true,
        clientId: true,
        name: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: clients }
  } catch (error) {
    console.error('クライアント一覧取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'クライアント一覧の取得に失敗しました',
    }
  }
}

// --- クライアントの全関連データを一括取得 ---
export const getClientFullData = async (
  clientId: number
): Promise<{
  success: boolean
  data?: ClientFullData
  error?: string
}> => {
  try {
    // クライアント基本情報と業種（3階層）
    const client = await prisma.hakobunClient.findUnique({
      where: { id: clientId },
      include: {
        industry: {
          include: {
            generalCategories: {
              orderBy: { sortOrder: 'asc' },
              include: {
                categories: {
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    })

    if (!client) {
      return { success: false, error: 'クライアントが見つかりません' }
    }

    // ステージマスタ
    const stages = await prisma.hakobunClientStage.findMany({
      where: { hakobunClientId: clientId },
      select: {
        id: true,
        name: true,
        description: true,
        sortOrder: true,
        enabled: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    // 修正データペア（最新100件）
    const corrections = await prisma.hakobunCorrection.findMany({
      where: { hakobunClientId: clientId },
      select: {
        id: true,
        createdAt: true,
        rawSegment: true,
        originalGeneralCategory: true,
        originalCategory: true,
        originalSentiment: true,
        correctGeneralCategory: true,
        correctCategory: true,
        correctSentiment: true,
        reviewerComment: true,
        archived: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // ルール一覧
    const rules = await prisma.hakobunRule.findMany({
      where: { hakobunClientId: clientId },
      select: {
        id: true,
        createdAt: true,
        targetCategory: true,
        ruleDescription: true,
        priority: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // 顧客の声（最新100件）
    const voices = await prisma.hakobunVoice.findMany({
      where: { hakobunClientId: clientId },
      select: {
        id: true,
        voiceId: true,
        rawText: true,
        processedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // 分析BOX → SESSION → Record（各SESSION最大50件）
    const analysisBoxes = await prisma.hakobunAnalysisBox.findMany({
      where: { hakobunClientId: clientId },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          include: {
            records: {
              select: {
                id: true,
                rawText: true,
                analysisStage: true,
                analysisSentiment: true,
                analysisGeneralCategory: true,
                analysisCategory: true,
                feedbackStage: true,
                feedbackSentiment: true,
                feedbackGeneralCategory: true,
                feedbackCategory: true,
                isModified: true,
                isEnabled: true,
              },
              orderBy: { sortOrder: 'asc' },
              take: 50,
            },
            _count: {
              select: { records: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // カウント情報
    const [correctionsCount, voicesCount, totalSessionsCount, totalRecordsCount] = await Promise.all(
      [
        prisma.hakobunCorrection.count({ where: { hakobunClientId: clientId } }),
        prisma.hakobunVoice.count({ where: { hakobunClientId: clientId } }),
        prisma.hakobunAnalysisSession.count({
          where: { analysisBox: { hakobunClientId: clientId } },
        }),
        prisma.hakobunAnalysisRecord.count({
          where: { session: { analysisBox: { hakobunClientId: clientId } } },
        }),
      ]
    )

    const counts: DataCounts = {
      stages: stages.length,
      corrections: correctionsCount,
      rules: rules.length,
      voices: voicesCount,
      analysisBoxes: analysisBoxes.length,
      totalSessions: totalSessionsCount,
      totalRecords: totalRecordsCount,
    }

    // データを整形
    const result: ClientFullData = {
      client: {
        id: client.id,
        clientId: client.clientId,
        name: client.name,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
        inputDataExplain: client.inputDataExplain,
        analysisStartDate: client.analysisStartDate,
        analysisEndDate: client.analysisEndDate,
        industryId: client.industryId,
      },
      industry: client.industry,
      stages,
      corrections,
      rules,
      voices,
      analysisBoxes,
      counts,
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('クライアント全データ取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'データ取得に失敗しました',
    }
  }
}
