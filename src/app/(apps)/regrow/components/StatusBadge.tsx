'use client'

/**
 * ステータスバッジコンポーネント
 * ✅完了 / ⚠️未完了 / 🔄進行中
 */

import React from 'react'
import type {Status} from '../types'

type StatusBadgeProps = {
  status: Status
  size?: 'sm' | 'md' | 'lg'
}

export const StatusBadge = ({status, size = 'md'}: StatusBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  const statusConfig = {
    completed: {
      icon: '✅',
      label: '完了',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    },
    incomplete: {
      icon: '⚠️',
      label: '未完了',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
    },
    'in-progress': {
      icon: '🔄',
      label: '進行中',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
    },
  }

  const config = statusConfig[status]

  return (
    <span className={`inline-flex items-center gap-1 rounded font-medium ${sizeClasses[size]} ${config.bgColor} ${config.textColor}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}
