'use client'

import React from 'react'
import { Eye, EyeOff, Building2, Trash2, Loader2 } from 'lucide-react'

interface BulkEditToolbarProps {
  filterPublic: 'all' | 'public' | 'private'
  filterClient: string
  clients: any[]
  filteredWorksCount: number
  selectedCount: number
  isPending: boolean
  onFilterPublicChange: (value: 'all' | 'public' | 'private') => void
  onFilterClientChange: (value: string) => void
  onBulkUpdate: (updates: any) => void
  onBulkDelete: () => void
}

/**
 * 一括編集ツールバーコンポーネント
 */
export const BulkEditToolbar: React.FC<BulkEditToolbarProps> = ({
  filterPublic,
  filterClient,
  clients,
  filteredWorksCount,
  selectedCount,
  isPending,
  onFilterPublicChange,
  onFilterClientChange,
  onBulkUpdate,
  onBulkDelete,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-4">
        {/* フィルター */}
        <select
          value={filterPublic}
          onChange={e => onFilterPublicChange(e.target.value as 'all' | 'public' | 'private')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">すべて</option>
          <option value="public">公開中のみ</option>
          <option value="private">非公開のみ</option>
        </select>

        <select
          value={filterClient}
          onChange={e => onFilterClientChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全クライアント</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name || '名称未設定'}
            </option>
          ))}
        </select>

        <span className="text-sm text-gray-500">
          {filteredWorksCount}件中 {selectedCount}件選択
        </span>
      </div>

      {/* 一括操作ボタン */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}

          <button
            onClick={() => onBulkUpdate({ isPublic: true })}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50"
          >
            <Eye className="h-4 w-4" />
            公開する
          </button>

          <button
            onClick={() => onBulkUpdate({ isPublic: false })}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <EyeOff className="h-4 w-4" />
            非公開
          </button>

          <button
            onClick={() => onBulkUpdate({ allowShowClient: true })}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50"
          >
            <Building2 className="h-4 w-4" />
            名称表示ON
          </button>

          <button
            onClick={() => onBulkUpdate({ allowShowClient: false })}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <Building2 className="h-4 w-4" />
            名称表示OFF
          </button>

          <button
            onClick={onBulkDelete}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            削除
          </button>
        </div>
      )}
    </div>
  )
}

