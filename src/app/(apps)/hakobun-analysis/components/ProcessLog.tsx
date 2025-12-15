'use client'

import React, { useRef, useEffect } from 'react'
import { C_Stack } from '@cm/components/styles/common-components/common-components'
import { LogEntry } from '../types'
import { Info, CheckCircle, AlertCircle, AlertTriangle, Trash2 } from 'lucide-react'

interface ProcessLogProps {
  logs: LogEntry[]
  onClear?: () => void
  compact?: boolean
}

const getLogStyle = (type: LogEntry['type']) => {
  switch (type) {
    case 'success':
      return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
    case 'error':
      return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
    case 'warning':
      return { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' }
    default:
      return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
  }
}

export const ProcessLog: React.FC<ProcessLogProps> = ({ logs, onClear, compact = false }) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  // 新しいログが追加されたら自動スクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  if (compact) {
    return (
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-4 max-w-md w-full">
          {logs.slice(-3).map(log => {
            const style = getLogStyle(log.type)
            const Icon = style.icon
            return (
              <div key={log.id} className={`flex items-center gap-2 text-sm ${style.color}`}>
                <Icon className="w-4 h-4" />
                <span>{log.message}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <C_Stack className="gap-2">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">処理ログ</h3>
        {onClear && logs.length > 0 && (
          <button onClick={onClear} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <Trash2 className="w-3 h-3" />
            クリア
          </button>
        )}
      </div>

      {/* ログ一覧 */}
      <div ref={scrollRef} className="max-h-[200px] overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-2">
        {logs.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">ログはまだありません</p>
        ) : (
          <C_Stack className="gap-1">
            {logs.map(log => {
              const style = getLogStyle(log.type)
              const Icon = style.icon
              return (
                <div key={log.id} className={`flex items-start gap-2 p-2 rounded ${style.bg} ${style.border} border`}>
                  <Icon className={`w-4 h-4 ${style.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${style.color}`}>{log.message}</p>
                    <p className="text-xs text-gray-400">{log.timestamp.toLocaleTimeString('ja-JP')}</p>
                  </div>
                </div>
              )
            })}
          </C_Stack>
        )}
      </div>
    </C_Stack>
  )
}
