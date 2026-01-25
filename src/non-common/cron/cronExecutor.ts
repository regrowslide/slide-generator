import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {isCron} from 'src/non-common/serverSideFunction'
import {BatchConfig} from './batchMaster'

/**
 * 実行ログのステータス
 */
type ExecutionStatus = 'running' | 'success' | 'failure'

/**
 * 実行ログを作成
 */
const createExecutionLog = async (batchConfig: BatchConfig) => {
  return await prisma.cronExecutionLog.create({
    data: {
      batchId: batchConfig.id,
      batchName: batchConfig.name,
      status: 'running' as ExecutionStatus,
    },
  })
}

/**
 * 実行ログを更新（成功）
 */
const updateExecutionLogForSuccess = async (logId: number, startTime: number, result: any) => {
  const duration = Date.now() - startTime
  const resultString = result ? JSON.stringify(result).slice(0, 5000) : null // 5000文字まで

  await prisma.cronExecutionLog.update({
    where: {id: logId},
    data: {
      status: 'success' as ExecutionStatus,
      completedAt: new Date(),
      duration,
      result: resultString,
    },
  })
}

/**
 * 実行ログを更新（失敗）
 */
const updateExecutionLogForFailure = async (logId: number, startTime: number, error: Error) => {
  const duration = Date.now() - startTime

  await prisma.cronExecutionLog.update({
    where: {id: logId},
    data: {
      status: 'failure' as ExecutionStatus,
      completedAt: new Date(),
      duration,
      errorMessage: error.message?.slice(0, 2000), // 2000文字まで
    },
  })
}

/**
 * Cronバッチを実行する共通ラッパー
 * - 認証チェック
 * - 実行ログの記録（開始/完了/エラー）
 * - エラーハンドリング
 */
/**
 * SSEメッセージの型
 */
type SSEMessage = {
  type: 'progress' | 'complete'
  message?: string
  success?: boolean
  result?: any
  error?: string
  batchId?: string
  duration?: number
}

/**
 * SSEメッセージを文字列としてフォーマット
 */
const formatSSEMessage = (data: SSEMessage): string => {
  return `data: ${JSON.stringify(data)}\n\n`
}

/**
 * SSEメッセージをエンコード
 */
const encodeSSEMessage = (data: SSEMessage): Uint8Array => {
  const encoder = new TextEncoder()
  return encoder.encode(formatSSEMessage(data))
}

/**
 * ストリーミング対応のCronバッチ実行
 * - 15秒ごとに進捗メッセージを送信
 * - 完了時に結果を送信
 */
export const executeCronBatchWithProgress = async (req: NextRequest, batchConfig: BatchConfig): Promise<Response> => {
  // 認証チェック
  if ((await isCron({req})) === false) {
    return new Response(
      formatSSEMessage({type: 'complete', success: false, error: 'Unauthorized'}),
      {
        status: 401,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    )
  }

  const startTime = Date.now()
  let log: {id: number} | null = null

  const stream = new ReadableStream({
    async start(controller) {
      // 15秒ごとのkeep-alive送信
      const keepAliveInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        controller.enqueue(
          encodeSSEMessage({
            type: 'progress',
            message: `処理継続中... (${elapsed}秒経過)`,
          })
        )
      }, 1000)

      try {
        // 実行開始ログを記録
        log = await createExecutionLog(batchConfig)

        console.log(`[CRON] Starting batch with progress: ${batchConfig.name} (${batchConfig.id})`)

        // handlerの存在チェック
        if (!batchConfig.handler) {
          throw new Error(`Handler not found for batch: ${batchConfig.id}`)
        }

        // 初回の進捗メッセージ送信
        controller.enqueue(
          encodeSSEMessage({
            type: 'progress',
            message: '処理を開始しました...',
          })
        )

        // バッチ処理を実行
        const result = await batchConfig.handler()

        // 結果がオブジェクトで success: false の場合は失敗として扱う
        if (result && typeof result === 'object' && result.success === false) {
          // 実行失敗ログを記録
          const error = new Error(result.message || 'Batch failed')
          await updateExecutionLogForFailure(log.id, startTime, error)

          clearInterval(keepAliveInterval)

          const duration = Date.now() - startTime
          console.error(`[CRON] Failed batch with progress: ${batchConfig.name} (${batchConfig.id}) - ${result.message}`)

          // 失敗メッセージ送信
          controller.enqueue(
            encodeSSEMessage({
              type: 'complete',
              success: false,
              message: result.message || `${batchConfig.name} failed`,
              batchId: batchConfig.id,
              duration,
              error: result.message,
            })
          )
        } else {
          // 実行成功ログを記録
          await updateExecutionLogForSuccess(log.id, startTime, result)

          clearInterval(keepAliveInterval)

          const duration = Date.now() - startTime
          console.log(`[CRON] Completed batch with progress: ${batchConfig.name} (${batchConfig.id}) in ${duration}ms`)

          // 完了メッセージ送信
          controller.enqueue(
            encodeSSEMessage({
              type: 'complete',
              success: true,
              message: `${batchConfig.name} completed`,
              batchId: batchConfig.id,
              duration,
              result,
            })
          )
        }
      } catch (error: any) {
        clearInterval(keepAliveInterval)

        console.error(`[CRON] Error in batch with progress: ${batchConfig.name} (${batchConfig.id})`, error.stack)

        // 実行失敗ログを記録
        if (log) {
          await updateExecutionLogForFailure(log.id, startTime, error)
        }

        const duration = Date.now() - startTime

        // エラーメッセージ送信
        controller.enqueue(
          encodeSSEMessage({
            type: 'complete',
            success: false,
            message: `${batchConfig.name} failed: ${error.message}`,
            batchId: batchConfig.id,
            duration,
            error: error.message,
          })
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

/**
 * Cronバッチを実行する共通ラッパー
 * - 認証チェック
 * - 実行ログの記録（開始/完了/エラー）
 * - エラーハンドリング
 */
export const executeCronBatch = async (req: NextRequest, batchConfig: BatchConfig): Promise<NextResponse> => {


  // 認証チェック
  if ((await isCron({req})) === false) {
    return NextResponse.json({success: false, message: `Unauthorized`, result: null}, {status: 401, statusText: `Unauthorized`})
  }

  const startTime = Date.now()
  let log: {id: number} | null = null



  try {
    // 実行開始ログを記録
    log = await createExecutionLog(batchConfig)

    console.log(`[CRON] Starting batch: ${batchConfig.name} (${batchConfig.id})`)

    // handlerの存在チェック
    if (!batchConfig.handler) {
      throw new Error(`Handler not found for batch: ${batchConfig.id}`)
    }

    // バッチ処理を実行
    const result = await batchConfig.handler()

    // 結果がオブジェクトで success: false の場合は失敗として扱う
    if (result && typeof result === 'object' && result.success === false) {
      // 実行失敗ログを記録
      const error = new Error(result.message || 'Batch failed')
      await updateExecutionLogForFailure(log.id, startTime, error)

      console.error(`[CRON] Failed batch: ${batchConfig.name} (${batchConfig.id}) - ${result.message}`)

      return NextResponse.json(
        {
          success: false,
          message: result.message || `${batchConfig.name} failed`,
          batchId: batchConfig.id,
          duration: Date.now() - startTime,
          result: null,
        },
        {status: 500}
      )
    }

    // 実行成功ログを記録
    await updateExecutionLogForSuccess(log.id, startTime, result)

    console.log(`[CRON] Completed batch: ${batchConfig.name} (${batchConfig.id}) in ${Date.now() - startTime}ms`)

    return NextResponse.json({
      success: true,
      message: `${batchConfig.name} completed`,
      batchId: batchConfig.id,
      duration: Date.now() - startTime,
      result,
    })
  } catch (error: any) {
    console.error(`[CRON] Error in batch: ${batchConfig.name} (${batchConfig.id})`, error.stack)

    // 実行失敗ログを記録
    if (log) {
      await updateExecutionLogForFailure(log.id, startTime, error)
    }

    return NextResponse.json(
      {
        success: false,
        message: `${batchConfig.name} failed: ${error.message}`,
        batchId: batchConfig.id,
        duration: Date.now() - startTime,
        result: null,
      },
      {status: 500}
    )
  }
}
