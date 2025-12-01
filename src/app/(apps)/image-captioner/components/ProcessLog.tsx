'use client'

import React, {useEffect, useRef} from 'react'
import {LogEntry} from '../types'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {CheckCircle2, XCircle, AlertCircle, Info} from 'lucide-react'

interface ProcessLogProps {
  logs: LogEntry[]
  compact?: boolean // コンパクト表示モード（画像カード上に表示）
}

export const ProcessLog: React.FC<ProcessLogProps> = ({logs, compact = false}) => {
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!compact) {
      logEndRef.current?.scrollIntoView({behavior: 'smooth'})
    }
  }, [logs, compact])

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getLogBgColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getLogTextColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      default:
        return 'text-blue-800'
    }
  }

  const getLogLabel = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return '成功'
      case 'error':
        return 'エラー'
      case 'warning':
        return '警告'
      default:
        return '情報'
    }
  }

  if (compact) {
    // コンパクト表示（画像カード上に表示）
    const recentLogs = logs.slice(-5) // 最新5件のみ表示
    if (recentLogs.length === 0) return null

    return (
      <div className="absolute top-2 left-2 right-2 z-10 space-y-1 max-h-32 overflow-y-auto">
        {recentLogs.map(log => (
          <div
            key={log.id}
            className={`${getLogBgColor(log.type)} border rounded-lg p-2 shadow-md backdrop-blur-sm bg-opacity-95`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">{getLogIcon(log.type)}</div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium ${getLogTextColor(log.type)}`}>
                  {getLogLabel(log.type)}: {log.message}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 通常表示（フルサイズ）
  return (
    <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
      <C_Stack className="gap-2">
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">処理ログがありません</div>
        ) : (
          logs.map(log => (
            <div
              key={log.id}
              className={`${getLogBgColor(log.type)} border rounded-lg p-3 transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getLogIcon(log.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${getLogTextColor(log.type)}`}>
                      {getLogLabel(log.type)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {log.timestamp.toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className={`text-sm ${getLogTextColor(log.type)}`}>{log.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </C_Stack>
    </div>
  )
}

