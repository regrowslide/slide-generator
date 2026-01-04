'use client'

import React from 'react'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

export interface PlanConfirmationCardProps {
  plan: {
    title: string
    description?: string
    items: Array<{
      id: string
      label: string
      status: 'confirmed' | 'pending' | 'rejected'
    }>
  }
  onConfirm?: (itemId: string) => void
  onReject?: (itemId: string) => void
  onConfirmAll?: () => void
  onRejectAll?: () => void
}

export const PlanConfirmationCard: React.FC<PlanConfirmationCardProps> = ({
  plan,
  onConfirm,
  onReject,
  onConfirmAll,
  onRejectAll,
}) => {
  const { title, description, items } = plan

  const confirmedCount = items.filter((item) => item.status === 'confirmed').length
  const pendingCount = items.filter((item) => item.status === 'pending').length
  const rejectedCount = items.filter((item) => item.status === 'rejected').length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'border-green-200 bg-green-50'
      case 'rejected':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-yellow-200 bg-yellow-50'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
          <div className="text-xs text-gray-600">承認済み</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-xs text-gray-600">保留中</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          <div className="text-xs text-gray-600">却下</div>
        </div>
      </div>

      {/* 項目リスト */}
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(item.status)}`}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(item.status)}
              <span className="text-sm font-medium text-gray-900">{item.label}</span>
            </div>
            {item.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => onConfirm?.(item.id)}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  承認
                </button>
                <button
                  onClick={() => onReject?.(item.id)}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  却下
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 一括操作 */}
      {pendingCount > 0 && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={onConfirmAll}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            すべて承認
          </button>
          <button
            onClick={onRejectAll}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            すべて却下
          </button>
        </div>
      )}
    </div>
  )
}

