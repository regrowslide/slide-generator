import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {AnalysisResult, Extract} from '@app/(apps)/hakobun/types'

/**
 * 一括登録記録を取得
 * VoiceとCorrectionを結合して、batchページと同じ形式で返す
 */
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)
    const clientId = searchParams.get('client_id')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100

    if (!clientId) {
      return NextResponse.json(
        {
          success: false,
          error: 'client_id は必須です',
        },
        {status: 400}
      )
    }

    const client = await prisma.hakobunClient.findUnique({
      where: {clientId},
    })

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: `クライアント "${clientId}" が見つかりません`,
        },
        {status: 404}
      )
    }

    // Voiceを取得（最新順）
    const voices = await prisma.hakobunVoice.findMany({
      where: {hakobunClientId: client.id},
      orderBy: {processedAt: 'desc'},
      take: limit,
    })

    // Correctionを取得（最新順）
    const corrections = await prisma.hakobunCorrection.findMany({
      where: {
        hakobunClientId: client.id,
        archived: false,
      },
      orderBy: {createdAt: 'desc'},
      take: limit * 10, // 1つのVoiceに複数のextractがある可能性があるため多めに取得
    })

    // VoiceとresultJsonから、TableRow形式のデータを生成
    const results: Array<{
      voice_id: string
      extracts: Array<Extract & {correctionId?: number}>
    }> = []

    for (const voice of voices) {
      if (!voice.resultJson) continue

      const result = voice.resultJson as unknown as AnalysisResult

      // このVoiceに紐づくCorrectionをマッピング（rawSegmentでマッチング）
      const extractsWithCorrections = result.extracts.map((extract, extractIndex) => {
        // rawSegmentで一致するCorrectionを探す
        const matchingCorrection = corrections.find(correction => correction.rawSegment === extract.sentence)

        return {
          ...extract,
          correctionId: matchingCorrection?.id,
        }
      })

      results.push({
        voice_id: voice.voiceId,
        extracts: extractsWithCorrections,
      })
    }

    // Correctionの詳細情報も返す（IDで参照できるように）
    const correctionMap = new Map(corrections.map(c => [c.id, c]))

    return NextResponse.json({
      success: true,
      results,
      corrections: Array.from(correctionMap.values()),
      totalVoices: voices.length,
      totalCorrections: corrections.length,
    })
  } catch (error) {
    console.error('Get batch history error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {status: 500}
    )
  }
}
