import prisma from 'src/lib/prisma'
import {sampleWorks} from './(public)/works-sample/components/sampleData'

/**
 * Slateエディタ形式のJSONをプレーンテキストに変換
 */
function parseSlateJson(input: string | null): string | null {
  if (!input) return null
  try {
    const parsed = JSON.parse(input)
    if (Array.isArray(parsed)) {
      return parsed
        .map(block => {
          if (block.children) {
            return block.children.map((child: any) => child.text || '').join('')
          }
          return ''
        })
        .join('\n')
    }
    return input
  } catch {
    return input // JSONでない場合はそのまま返す
  }
}

/**
 * 日付文字列をDateオブジェクトに変換
 */
function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  try {
    return new Date(dateStr)
  } catch {
    return null
  }
}

export async function seedKM() {
  console.log('KMシーディングデータ作成を開始します...')

  try {
    let existingClients: any[] = []
    let existingWorks: any[] = []

    // 1. 既存のKaizenClientデータを取得してupsert
    try {
      console.log('\n=== KaizenClient データの処理 ===')
      existingClients = await prisma.kaizenClient.findMany({
        orderBy: {id: 'asc'},
      })

      console.log(`既存のKaizenClient: ${existingClients.length}件`)

      for (const client of existingClients) {
        const clientData = {
          name: client.name,
          organization: client.organization,
          iconUrl: client.iconUrl,
          bannerUrl: client.bannerUrl,
          website: client.website,
          note: client.note,
          public: client.public,
          introductionRequestedAt: client.introductionRequestedAt,
          sortOrder: client.sortOrder,
        }

        await prisma.kaizenClient.upsert({
          where: {id: client.id},
          update: clientData,
          create: {
            id: client.id,
            ...clientData,
          },
        })
        console.log(`  KaizenClient ID ${client.id}: ${client.name || '(名前なし)'} をupsertしました`)
      }
    } catch (error: any) {
      if (error.code === 'P2021') {
        console.log('  KaizenClientテーブルが存在しません。スキップします。')
      } else {
        throw error
      }
    }

    // 2. 既存のKaizenWorkデータを取得してupsert
    try {
      console.log('\n=== KaizenWork データの処理 ===')
      existingWorks = await prisma.kaizenWork.findMany({
        include: {
          KaizenWorkImage: true,
        },
        orderBy: {id: 'asc'},
      })

      console.log(`既存のKaizenWork: ${existingWorks.length}件`)

      for (const work of existingWorks) {
        // Slate JSONをプレーンテキストに変換
        const description = parseSlateJson(work.description)
        const points = parseSlateJson(work.points)
        const impression = parseSlateJson(work.impression)
        const reply = parseSlateJson(work.reply)

        const workData = {
          date: work.date,
          title: work.title,
          subtitle: work.subtitle,
          status: work.status,
          beforeChallenge: work.beforeChallenge,
          description: description,
          quantitativeResult: work.quantitativeResult,
          points: points,
          clientName: work.clientName,
          organization: work.organization,
          companyScale: work.companyScale,
          dealPoint: work.dealPoint,
          toolPoint: work.toolPoint,
          impression: impression,
          reply: reply,
          jobCategory: work.jobCategory,
          systemCategory: work.systemCategory,
          collaborationTool: work.collaborationTool,
          projectDuration: work.projectDuration,
          kaizenClientId: work.kaizenClientId,
          showName: work.showName,
          allowShowClient: work.allowShowClient,
          isPublic: work.isPublic,
          correctionRequest: work.correctionRequest,
          sortOrder: work.sortOrder,
        }

        const upsertedWork = await prisma.kaizenWork.upsert({
          where: {id: work.id},
          update: workData,
          create: {
            id: work.id,
            uuid: work.uuid,
            ...workData,
          },
        })

        console.log(`  KaizenWork ID ${work.id}: ${work.title || '(タイトルなし)'} をupsertしました`)

        // KaizenWorkImageもupsert
        for (const image of work.KaizenWorkImage) {
          await prisma.kaizenWorkImage.upsert({
            where: {url: image.url},
            update: {
              kaizenWorkId: upsertedWork.id,
              sortOrder: image.sortOrder,
            },
            create: {
              url: image.url,
              kaizenWorkId: upsertedWork.id,
              sortOrder: image.sortOrder,
            },
          })
        }
      }
    } catch (error: any) {
      if (error.code === 'P2021') {
        console.log('  KaizenWorkテーブルが存在しません。スキップします。')
      } else {
        throw error
      }
    }

    // 3. サンプルデータを追加（ID 200番台を使用）
    console.log('\n=== サンプルデータの追加 ===')
    let sampleWorkId = 200
    let addedSampleCount = 0

    try {
      for (const sample of sampleWorks) {
        // サンプルデータ用のKaizenClientを取得または作成
        let client = await prisma.kaizenClient.findFirst({
          where: {
            name: sample.clientName,
            organization: sample.organization || null,
          },
        })

        if (!client) {
          client = await prisma.kaizenClient.create({
            data: {
              name: sample.clientName,
              organization: sample.organization || null,
              public: sample.allowShowClient,
              sortOrder: 0,
            },
          })
          console.log(`  新しいKaizenClientを作成: ${sample.clientName}`)
        }

        // ステータスを文字列に変換
        const statusMap: Record<string, string> = {
          完了: '完了',
          進行中: '進行中',
          公開中: '公開中',
        }
        const status = statusMap[sample.status] || sample.status

        const workData = {
          id: sampleWorkId,
          date: parseDate(sample.date),
          title: sample.title,
          subtitle: sample.subtitle,
          status: status,
          beforeChallenge: sample.beforeChallenge,
          description: sample.description,
          quantitativeResult: sample.quantitativeResult,
          points: sample.points,
          clientName: sample.clientName,
          organization: sample.organization || null,
          companyScale: sample.companyScale,
          dealPoint: sample.dealPoint,
          toolPoint: sample.toolPoint,
          impression: sample.customerVoice || null,
          reply: sample.reply || null,
          jobCategory: sample.jobCategory,
          systemCategory: sample.systemCategory,
          collaborationTool: sample.collaborationTool,
          projectDuration: sample.projectDuration,
          kaizenClientId: client.id,
          allowShowClient: sample.allowShowClient,
          isPublic: false,
          sortOrder: 0,
        }

        const upsertedWork = await prisma.kaizenWork.upsert({
          where: {id: sampleWorkId},
          update: workData,
          create: workData,
        })

        console.log(`  サンプルWork ID ${sampleWorkId}: ${sample.title} をupsertしました`)

        // 画像があれば追加
        if (sample.images && sample.images.length > 0) {
          for (const imageUrl of sample.images) {
            await prisma.kaizenWorkImage.upsert({
              where: {
                url: imageUrl,
              },
              update: {
                kaizenWorkId: upsertedWork.id,
                sortOrder: 0,
              },
              create: {
                url: imageUrl,
                kaizenWorkId: upsertedWork.id,
                sortOrder: 0,
              },
            })
          }
        }

        sampleWorkId++
        addedSampleCount++
      }
    } catch (error: any) {
      if (error.code === 'P2021') {
        console.log('  テーブルが存在しないため、サンプルデータの追加をスキップします。')
        console.log('  先にPrismaマイグレーションを実行してください: npx prisma migrate dev')
      } else {
        throw error
      }
    }

    console.log('\n=== シーディング完了 ===')
    console.log(`KaizenClient: ${existingClients.length}件`)
    console.log(
      `KaizenWork: ${existingWorks.length}件（既存）+ ${addedSampleCount}件（サンプル）= ${existingWorks.length + addedSampleCount}件`
    )
    if (addedSampleCount > 0) {
      console.log(`サンプルデータのID範囲: 200-${sampleWorkId - 1}`)
    }
  } catch (error) {
    console.error('シーディングエラー:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
