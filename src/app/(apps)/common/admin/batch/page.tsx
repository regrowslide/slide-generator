'use client'


import { C_Stack, Padding, R_Stack } from '@cm/components/styles/common-components/common-components'
import { CssString } from '@cm/components/styles/cssString'
import BasicTabs, { tabComponent } from '@cm/components/utils/tabs/BasicTabs'
import { MarkDownDisplay } from '@cm/components/utils/texts/MarkdownDisplay'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { cl } from '@cm/lib/methods/common'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { PrismaModelNames } from '@cm/types/prisma-types'
import { toast } from 'react-toastify'
import { BATCH_MASTER, BatchConfig, BatchCountArgs } from 'src/non-common/cron/batchMaster'
import useSWR from 'swr'
import { fetchAlt } from '@cm/lib/http/fetch-client'
import { basePath } from '@cm/lib/methods/common'
import useModal from '@cm/components/utils/modal/useModal'
import React, { useState } from 'react'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

/**
 * SSEメッセージをパースする
 */
const parseSSEMessage = (text: string) => {
  const messages: any[] = []
  const lines = text.split('\n\n')
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const data = JSON.parse(line.slice(6))
        messages.push(data)
      } catch {
        // パースエラーは無視
      }
    }
  }
  return messages
}


type CronExecutionLog = {
  id: number
  batchId: string
  batchName: string
  startedAt: Date | string
  completedAt: Date | string | null
  duration: number | null
  status: 'success' | 'failure' | 'running'
  errorMessage: string | null
  result: string | null
  createdAt: Date | string
}

export default function Page() {
  const { toggleLoad } = useGlobal()
  const { Modal, handleOpen, handleClose, open } = useModal<{ batchId: string; batchName: string }>()

  // 実行中のバッチIDと進捗メッセージを管理
  const [runningBatches, setRunningBatches] = useState<Record<string, string>>({})

  const batch: {
    [key: string]: BatchConfig[]
  } = {}

  Object.keys(BATCH_MASTER).forEach(key => {
    const item = BATCH_MASTER[key]

    if (!batch[item.app]) {
      batch[item.app] = []
    }
    batch[item.app].push({
      id: item.id,
      name: item.name,
      description: item.description,
      purpose: item.purpose,
      app: item.app,
      effectOn: item.effectOn,
      schedule: item.schedule,

      prismaArgs: item.prismaArgs,
      handler: item.handler,
    })
  })

  // 全バッチIDのリストを作成
  const allBatchIds = Object.values(batch).flat().map(b => b.id)

  // 各バッチのログデータを取得
  const { data: batchLogs, mutate: mutateBatchLogs } = useSWR(
    allBatchIds.length > 0 ? `batch-logs-${allBatchIds.join(',')}` : null,
    async () => {
      const logs = await Promise.all(
        allBatchIds.map(async batchId => {
          try {
            const res = await fetchAlt(`${basePath}/api/cron/logs/${batchId}`, {}, { method: 'GET' })
            return { batchId, ...res }
          } catch (error) {
            return { batchId, latest: null, history: [] }
          }
        })
      )
      return Object.fromEntries(logs.map(log => [log.batchId, log]))
    }
  )


  // 全バッチのデータ件数を取得（prismaArgsが設定されているもののみ）
  const allBatches = Object.values(batch).flat()
  const batchCountKey = JSON.stringify(allBatches.map(b => ({ id: b.id, prismaArgs: b.prismaArgs })))
  const { data: batchCounts, mutate: mutateBatchCounts } = useSWR(batchCountKey, async () => {
    const countList = await Promise.all(
      allBatches.map(async action => {
        const prismaArgs = action.prismaArgs as BatchCountArgs | undefined
        if (prismaArgs?.model) {
          try {
            const args = prismaArgs.where ? { where: prismaArgs.where } : undefined
            const res = await doStandardPrisma(prismaArgs.model as PrismaModelNames, 'count', args as never)
            return {
              id: action.id,
              count: res.result,
            }
          } catch (error) {
            console.error(`Failed to get count for ${action.name}:`, error)
            return undefined
          }
        }
        return undefined
      })
    )
    return Object.fromEntries(countList.filter(d => d !== undefined).map(d => [d.id, d.count]))
  })

  const { paddingTd, borderCerlls } = CssString.table

  const getStatusColor = (status: string, variant: 'text' | 'bg' = 'text') => {
    switch (status) {
      case 'success':
        return variant === 'text' ? 'text-green-600' : 'text-green-600 bg-green-50'
      case 'failure':
        return variant === 'text' ? 'text-red-600' : 'text-red-600 bg-red-50'
      case 'running':
        return variant === 'text' ? 'text-blue-600' : 'text-blue-600 bg-blue-50'
      default:
        return variant === 'text' ? 'text-gray-600' : 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return '成功'
      case 'failure':
        return '失敗'
      case 'running':
        return '実行中'
      default:
        return '-'
    }
  }

  // 当日かどうかをチェックする関数
  const isToday = (date: Date | string) => {
    const today = new Date()
    const checkDate = new Date(date)
    return checkDate.toDateString() === today.toDateString()
  }

  const renderTable = (actions: BatchConfig[], title: string) => {
    const hasEffectOn = actions.some(action => action.effectOn)

    return (
      <div>
        <h2 className={`text-xl font-bold mb-4`}>{title}</h2>
        <div className={``}>
          <table className={cl(paddingTd, borderCerlls, ` w-full`)}>
            <thead>
              <tr>
                <th style={{ width: '400px' }}>バッチ処理</th>

                <th style={{ width: '400px' }}>用途</th>

                <th style={{ minWidth: '200px' }}>最終実行時刻と結果</th>
                <th style={{ maxWidth: '30px' }}>実行</th>
              </tr>
            </thead>
            <tbody className={``}>
              {actions.map((action, idx) => {
                const count = batchCounts?.[action.id]
                const logData = batchLogs?.[action.id]
                const latestLog = logData?.latest as CronExecutionLog | null

                const handleClick = async () => {
                  if (!action.handler) {
                    toast.error(`${action.name}の実行関数が設定されていません`)
                    return
                  }

                  // 実行中状態を設定
                  setRunningBatches(prev => ({ ...prev, [action.id]: '処理を開始しています...' }))

                  let isCompleted = false

                  try {
                    // ストリーミングレスポンスで進捗を取得
                    const response = await fetch(`${basePath}/api/cron/execute/${action.id}?stream=true`)

                    if (!response.body) {
                      throw new Error('レスポンスボディがありません')
                    }

                    const reader = response.body.getReader()
                    const decoder = new TextDecoder()

                    while (true) {
                      const { done, value } = await reader.read()
                      if (done) break

                      const text = decoder.decode(value, { stream: true })
                      const messages = parseSSEMessage(text)

                      for (const data of messages) {
                        if (data.type === 'progress') {
                          // 進捗メッセージを更新
                          setRunningBatches(prev => ({ ...prev, [action.id]: data.message }))
                        } else if (data.type === 'complete') {
                          isCompleted = true
                          // 完了処理
                          setRunningBatches(prev => {
                            const newState = { ...prev }
                            delete newState[action.id]
                            return newState
                          })

                          if (data.success) {
                            toast.success(`${action.name}が完了しました`)
                          } else {
                            toast.error(`${action.name}の実行中にエラーが発生しました: ${data.error || data.message}`)
                          }
                          // ログデータを再取得
                          mutateBatchLogs()
                          // データカウントを再取得
                          if (action.prismaArgs?.model) {
                            mutateBatchCounts()
                          }
                        }
                      }
                    }

                    // ストリームが終了したが complete メッセージを受け取っていない場合
                    if (!isCompleted) {
                      setRunningBatches(prev => {
                        const newState = { ...prev }
                        delete newState[action.id]
                        return newState
                      })
                      // ログデータを再取得（完了したかもしれないので）
                      mutateBatchLogs()
                      // データカウントを再取得
                      if (action.prismaArgs?.model) {
                        mutateBatchCounts()
                      }
                    }
                  } catch (error: any) {
                    // エラー時は実行中状態をクリア
                    setRunningBatches(prev => {
                      const newState = { ...prev }
                      delete newState[action.id]
                      return newState
                    })
                    toast.error(`${action.name}の実行中にエラーが発生しました: ${error.message}`)
                  }
                }

                const handleLogClick = () => {
                  handleOpen({ batchId: action.id, batchName: action.name })
                }

                return (
                  <tr key={idx} className={`  `}>
                    <td className={`min-w-[320px]`}>
                      <R_Stack className={` justify-between`}>
                        {action.name}
                        {count !== undefined && (
                          <span className={`text-sm text-blue-500 font-bold`}>{count.toLocaleString()}</span>
                        )}
                      </R_Stack>
                      <MarkDownDisplay className={`text-gray-500 text-sm`}>{action.description || ''}</MarkDownDisplay>
                    </td>

                    <td className={`text-sm`}>
                      <MarkDownDisplay >{action.purpose || ''}</MarkDownDisplay>
                    </td>

                    <td className={`min-w-[200px]`}>
                      {latestLog ? (
                        <button
                          onClick={handleLogClick}
                          className={`text-left hover:underline cursor-pointer w-full`}
                        >


                          {/* 時刻とステータス */}
                          <div className={`text-sm ${getStatusColor(latestLog.status, 'text')}`}>

                            <div>
                              {/* アラート表示（batch実行のみ） */}
                              {action.effectOn === 'batch' && (!isToday(latestLog.completedAt || latestLog.startedAt) || latestLog.status === 'failure') && (
                                <span className={`text-amber-600 font-bold mb-1 text-sm`}>
                                  ⚠️
                                </span>
                              )}

                              <span>{formatDate(new Date(latestLog.completedAt || latestLog.startedAt), 'YYYY-MM-DD HH:mm:ss')}</span>
                            </div>
                          </div>
                          <R_Stack>
                            <div className={`font-bold`}>{getStatusText(latestLog.status)}</div>
                            {latestLog.duration && (
                              <div className={`text-xs text-gray-500`}>{latestLog.duration}ms</div>
                            )}
                          </R_Stack>

                          {/* メッセージ表示 */}
                          {latestLog.status === 'success' && latestLog.result && (
                            <div className={`text-xs text-gray-600 mt-1 line-clamp-2  truncate max-w-[200px]`}>
                              {(() => {
                                try {
                                  const parsed = typeof latestLog.result === 'string'

                                    ? JSON.parse(latestLog.result)
                                    : latestLog.result
                                  const count = parsed?.result?.count
                                  return [
                                    count && `${count}件`,
                                    parsed?.message,].filter(Boolean).join(' ')
                                } catch {
                                  return typeof latestLog.result === 'string' ? latestLog.result : ''
                                }
                              })()}
                            </div>
                          )}
                          {latestLog.status === 'failure' && latestLog.errorMessage && (
                            <div className={`text-xs text-red-600 mt-1 line-clamp-2`}>
                              {latestLog.errorMessage}
                            </div>
                          )}
                        </button>
                      ) : (
                        <span className={`text-gray-400 text-sm`}>実行履歴なし</span>
                      )}
                    </td>
                    <td className={`min-w-[180px] text-center`}>
                      {runningBatches[action.id] ? (
                        <div className={`flex flex-col items-center gap-1`}>
                          <div className={`flex items-center gap-2`}>
                            <div className={`animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full`} />
                            <span className={`text-blue-600 font-bold`}>実行中</span>
                          </div>
                          <span className={`text-xs text-gray-500`}>{runningBatches[action.id]}</span>
                        </div>
                      ) : (
                        <button className={`t-link w-[100px] `} onClick={handleClick}>
                          実行
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderBatchTable = (actions: BatchConfig[], appName: string) => {
    const batchActions = actions.filter(action => action.effectOn === 'batch')
    const clickActions = actions.filter(action => action.effectOn === 'click' || !action.effectOn)

    return (
      <C_Stack className={` gap-10`}>
        {batchActions.length > 0 && (
          <div>
            {renderTable(batchActions, 'バッチ実行処理')}
            <small>*自動で実行される</small>
          </div>
        )}

        {clickActions.length > 0 && (
          <div>
            {renderTable(clickActions, 'クリック実行処理')}
            <small>*初回のみ手動で実行</small>
          </div>
        )}
      </C_Stack>
    )
  }

  const tabComponents = Object.keys(batch).map(key => {
    const actions = batch[key as keyof typeof batch] as BatchConfig[]
    if (actions.length > 0) {
      return {
        label: key,
        component: <div>{renderBatchTable(actions, key)}</div>,
      }
    }
  }).filter(Boolean) as tabComponent[]





  // モーダル内の履歴データを取得
  const selectedBatchId = open?.batchId
  const { data: historyData } = useSWR(
    selectedBatchId ? `batch-history-${selectedBatchId}` : null,
    async () => {
      if (!selectedBatchId) return null
      const res = await fetchAlt(`${basePath}/api/cron/logs/${selectedBatchId}?limit=50`, {}, { method: 'GET' })
      return res
    }
  )

  return (
    <Padding>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">バッチ処理管理</h1>
          <p className="text-gray-600">各アプリのバッチ処理を一覧で確認・実行できます</p>
        </div>

        <BasicTabs id="batch-tabs" TabComponentArray={tabComponents} headingText="アプリを選択" />
      </div>

      <Modal
        title={open ? `${open.batchName} - 実行履歴` : ''}
        description="過去50件の実行履歴を表示します"
        style={{ maxWidth: '90vw', width: '1000px' }}
      >
        {historyData?.history && historyData.history.length > 0 ? (
          <div className={`max-h-[70vh] overflow-auto`}>
            <table className={cl(paddingTd, borderCerlls, `w-full`)}>
              <thead className={`sticky top-0 bg-white`}>
                <tr>
                  <th>実行開始時刻</th>
                  <th>完了時刻</th>
                  <th>実行時間</th>
                  <th>ステータス</th>
                  <th>エラーメッセージ</th>
                  <th>結果</th>
                </tr>
              </thead>
              <tbody>
                {historyData.history.map((log: CronExecutionLog) => (
                  <tr key={log.id}>
                    <td className={`text-sm`}>
                      {formatDate(new Date(log.startedAt), 'YYYY-MM-DD(ddd) HH:mm:ss')}
                    </td>
                    <td className={`text-sm`}>
                      {log.completedAt ? formatDate(new Date(log.completedAt), 'YYYY-MM-DD(ddd) HH:mm:ss') : '-'}
                    </td>
                    <td className={`text-sm`}>
                      {log.duration ? `${log.duration}ms` : '-'}
                    </td>
                    <td className={`text-center`}>
                      <span className={`px-2 py-1 rounded ${getStatusColor(log.status, 'bg')}`}>
                        {getStatusText(log.status)}
                      </span>
                    </td>
                    <td className={`text-sm max-w-[300px] wrap-break-word`}>
                      {log.errorMessage ? (
                        <div className={`text-red-600`}>{log.errorMessage}</div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className={`text-sm max-w-[300px] wrap-break-word`}>
                      {log.result ? (
                        <details>
                          <summary className={`cursor-pointer text-blue-600 hover:underline`}>
                            結果を表示
                          </summary>
                          <pre className={`mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-[200px]`}>
                            {typeof log.result === 'string' ? log.result : JSON.stringify(log.result, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={`text-center text-gray-500 py-8`}>
            実行履歴がありません
          </div>
        )}
      </Modal>
    </Padding>
  )
}
