import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {AnalysisResult, Extract} from '@app/(apps)/hakobun/types'

interface BatchSaveRequest {
  client_id: string
  voices: {
    voice_id: string
    raw_text: string
    result: AnalysisResult
  }[]
  corrections?: {
    voice_id: string
    extract_index: number
    original_sentence: string
    original_general_category?: string
    original_category?: string
    original_sentiment?: string
    correct_general_category?: string
    correct_category: string
    correct_sentiment: string
    reviewer_comment?: string
  }[]
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchSaveRequest = await request.json()
    const {client_id, voices, corrections = []} = body

    if (!client_id || !voices || !Array.isArray(voices) || voices.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'client_id と voices（配列）は必須です',
        },
        {status: 400}
      )
    }

    // クライアント存在確認
    const client = await prisma.hakobunClient.findUnique({
      where: {clientId: client_id},
      include: {
        industry: true,
      },
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

    if (!client.industryId || !client.industry) {
      return NextResponse.json(
        {
          success: false,
          error: 'クライアントに業種が紐づけられていません',
        },
        {status: 400}
      )
    }

    // 1. Voiceを全てupsert
    const voiceResults = await Promise.all(
      voices.map(voice =>
        prisma.hakobunVoice.upsert({
          where: {
            voiceId: voice.voice_id,
          },
          update: {
            rawText: voice.raw_text,
            processedAt: new Date(),
            resultJson: voice.result as any,
          },
          create: {
            voiceId: voice.voice_id,
            rawText: voice.raw_text,
            processedAt: new Date(),
            resultJson: voice.result as any,
            hakobunClientId: client.id,
          },
        })
      )
    )

    // 2. 一般カテゴリと詳細カテゴリを全てupsert
    const generalCategoryMap = new Map<string, number>() // name -> id
    const categoryMap = new Map<string, number>() // generalCategoryId + name -> id

    // 全てのextractから一般カテゴリとカテゴリを収集（修正前・修正後両方）
    const allGeneralCategories = new Set<string>()
    const allCategories = new Map<string, {generalCategory: string; name: string}>() // key: generalCategory + name

    // 分析結果から収集
    voices.forEach(voice => {
      voice.result.extracts.forEach(extract => {
        allGeneralCategories.add(extract.general_category)
        const key = `${extract.general_category}::${extract.category}`
        if (!allCategories.has(key)) {
          allCategories.set(key, {
            generalCategory: extract.general_category,
            name: extract.category,
          })
        }
      })
    })

    // 修正データからも収集（修正後のカテゴリ）
    corrections.forEach(correction => {
      if (correction.correct_general_category) {
        allGeneralCategories.add(correction.correct_general_category)
        const key = `${correction.correct_general_category}::${correction.correct_category}`
        if (!allCategories.has(key)) {
          allCategories.set(key, {
            generalCategory: correction.correct_general_category,
            name: correction.correct_category,
          })
        }
      }
    })

    // 一般カテゴリをupsert
    for (const gcName of allGeneralCategories) {
      const existing = await prisma.hakobunIndustryGeneralCategory.findFirst({
        where: {
          industryId: client.industryId,
          name: gcName,
        },
      })

      if (existing) {
        generalCategoryMap.set(gcName, existing.id)
      } else {
        // 新規作成
        const maxSortOrder = await prisma.hakobunIndustryGeneralCategory.findFirst({
          where: {industryId: client.industryId},
          orderBy: {sortOrder: 'desc'},
        })
        const newGc = await prisma.hakobunIndustryGeneralCategory.create({
          data: {
            industryId: client.industryId,
            name: gcName,
            sortOrder: (maxSortOrder?.sortOrder || 0) + 1,
          },
        })
        generalCategoryMap.set(gcName, newGc.id)
      }
    }

    // 詳細カテゴリをupsert
    for (const [key, catData] of allCategories.entries()) {
      const generalCategoryId = generalCategoryMap.get(catData.generalCategory)
      if (!generalCategoryId) continue

      const existing = await prisma.hakobunIndustryCategory.findFirst({
        where: {
          generalCategoryId,
          name: catData.name,
        },
      })

      if (existing) {
        categoryMap.set(key, existing.id)
      } else {
        // 新規作成
        const maxSortOrder = await prisma.hakobunIndustryCategory.findFirst({
          where: {generalCategoryId},
          orderBy: {sortOrder: 'desc'},
        })
        const newCat = await prisma.hakobunIndustryCategory.create({
          data: {
            generalCategoryId,
            name: catData.name,
            sortOrder: (maxSortOrder?.sortOrder || 0) + 1,
            enabled: true,
          },
        })
        categoryMap.set(key, newCat.id)
      }
    }

    // 3. Correctionは修正が入っている行のみ保存
    let savedCorrectionsCount = 0
    if (corrections.length > 0) {
      const correctionData = corrections.map(c => ({
        rawSegment: c.original_sentence,
        originalGeneralCategory: c.original_general_category || null,
        originalCategory: c.original_category || null,
        originalSentiment: c.original_sentiment || null,
        correctGeneralCategory: c.correct_general_category || null,
        correctCategory: c.correct_category,
        correctSentiment: c.correct_sentiment,
        reviewerComment: c.reviewer_comment || null,
        archived: false,
        hakobunClientId: client.id,
      }))

      const result = await prisma.hakobunCorrection.createMany({
        data: correctionData,
      })
      savedCorrectionsCount = result.count
    }

    return NextResponse.json({
      success: true,
      saved_voices: voiceResults.length,
      saved_general_categories: generalCategoryMap.size,
      saved_categories: categoryMap.size,
      saved_corrections: savedCorrectionsCount,
    })
  } catch (error) {
    console.error('Batch save error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}

