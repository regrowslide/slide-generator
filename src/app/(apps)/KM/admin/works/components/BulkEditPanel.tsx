'use client'

import { useState, useTransition } from 'react'
import {
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  Trash2,
  Star,
  Building2,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { bulkUpdateKaizenWorks, bulkDeleteKaizenWorks } from '../actions'

interface BulkEditPanelProps {
  clients: any[]
  works: any[]
}

export const BulkEditPanel = ({ clients, works }: BulkEditPanelProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [filterPublic, setFilterPublic] = useState<'all' | 'public' | 'private'>('all')
  const [filterClient, setFilterClient] = useState<string>('')

  // フィルタリング
  const filteredWorks = works.filter(work => {
    if (filterPublic === 'public' && !work.isPublic) return false
    if (filterPublic === 'private' && work.isPublic) return false
    if (filterClient && work.kaizenClientId !== Number(filterClient)) return false
    return true
  })

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredWorks.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredWorks.map(w => w.id)))
    }
  }

  const handleBulkUpdate = (updates: any) => {
    if (selectedIds.size === 0) return

    startTransition(async () => {
      const result = await bulkUpdateKaizenWorks(Array.from(selectedIds), updates)
      if (result.success) {
        setSelectedIds(new Set())
      } else {
        alert('更新に失敗しました: ' + result.error)
      }
    })
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    if (!confirm(`${selectedIds.size}件の実績を削除しますか？この操作は取り消せません。`)) return

    startTransition(async () => {
      const result = await bulkDeleteKaizenWorks(Array.from(selectedIds))
      if (result.success) {
        setSelectedIds(new Set())
      } else {
        alert('削除に失敗しました: ' + result.error)
      }
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* ツールバー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          {/* フィルター */}
          <select
            value={filterPublic}
            onChange={e => setFilterPublic(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="public">公開中のみ</option>
            <option value="private">非公開のみ</option>
          </select>

          <select
            value={filterClient}
            onChange={e => setFilterClient(e.target.value)}
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
            {filteredWorks.length}件中 {selectedIds.size}件選択
          </span>
        </div>

        {/* 一括操作ボタン */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}

            <button
              onClick={() => handleBulkUpdate({ isPublic: true })}
              disabled={isPending}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50"
            >
              <Eye className="h-4 w-4" />
              公開する
            </button>

            <button
              onClick={() => handleBulkUpdate({ isPublic: false })}
              disabled={isPending}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <EyeOff className="h-4 w-4" />
              非公開
            </button>

            <button
              onClick={() => handleBulkUpdate({ allowShowClient: true })}
              disabled={isPending}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50"
            >
              <Building2 className="h-4 w-4" />
              名称表示ON
            </button>

            <button
              onClick={() => handleBulkUpdate({ allowShowClient: false })}
              disabled={isPending}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <Building2 className="h-4 w-4" />
              名称表示OFF
            </button>

            <button
              onClick={handleBulkDelete}
              disabled={isPending}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              削除
            </button>
          </div>
        )}
      </div>

      {/* テーブル */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">
                <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-200 rounded">
                  {selectedIds.size === filteredWorks.length && filteredWorks.length > 0 ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">公開</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">名称</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">タイトル</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">クライアント</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">業種</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ソリューション</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">企業規模</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">期間</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">評価</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">課題</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">成果</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredWorks.map(work => (
              <tr
                key={work.id}
                className={`hover:bg-gray-50 ${selectedIds.has(work.id) ? 'bg-blue-50' : ''}`}
              >
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleSelect(work.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {selectedIds.has(work.id) ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  {work.isPublic ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      <Eye className="h-3 w-3" />
                      公開
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                      <EyeOff className="h-3 w-3" />
                      非公開
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {work.allowShowClient ? (
                    <span className="text-green-600 text-xs">表示</span>
                  ) : (
                    <span className="text-gray-400 text-xs">非表示</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-[200px]">
                    <div className="text-sm font-medium text-gray-900 truncate">{work.title || '-'}</div>
                    <div className="text-xs text-gray-500 truncate">{work.subtitle}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">
                    {work.KaizenClient?.name || '-'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {work.jobCategory && (
                    <span className="inline-block px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs">
                      {work.jobCategory}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {work.systemCategory && (
                    <span className="inline-block px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs">
                      {work.systemCategory}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">{work.companyScale || '-'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">{work.projectDuration || '-'}</span>
                </td>
                <td className="px-4 py-3">
                  {work.toolPoint && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium text-amber-600">{work.toolPoint}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-[150px]">
                    {work.beforeChallenge ? (
                      <p className="text-xs text-gray-600 truncate">{work.beforeChallenge}</p>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        未入力
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-[150px]">
                    {work.quantitativeResult ? (
                      <p className="text-xs text-green-600 font-medium truncate">
                        {work.quantitativeResult.split('\n')[0]}
                      </p>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        未入力
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredWorks.length === 0 && (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <p>該当する実績がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
