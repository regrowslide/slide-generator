'use client'

import React, {useEffect, useRef} from 'react'
import {LogEntry} from '../types'
import {C_Stack} from '@cm/components/styles/common-components/common-components'

interface ProcessLogProps {
  logs: LogEntry[]
}

export const ProcessLog: React.FC<ProcessLogProps> = ({logs}) => {
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({behavior: 'smooth'})
  }, [logs])

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✗'
      case 'warning':
        return '⚠'
      default:
        return '•'
    }
  }

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      case 'warning':
        return 'text-yellow-400'
      default:
        return 'text-gray-300'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit', second: '2-digit'})
  }

  return (
    <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg h-64 overflow-y-auto">
      <C_Stack className="gap-1">
        {logs.length === 0 ? (
          <div className="text-gray-500">ログがありません</div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="flex items-start gap-2">
              <span className={`${getLogColor(log.type)} flex-shrink-0`}>{getLogIcon(log.type)}</span>
              <span className="text-gray-500 flex-shrink-0">[{formatTime(log.timestamp)}]</span>
              <span className={log.type === 'error' ? 'text-red-400' : 'text-gray-300'}>{log.message}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </C_Stack>
    </div>
  )
}

