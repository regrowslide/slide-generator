'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Search, Calendar, Trash2, Download } from 'lucide-react'
import { toast } from 'react-toastify'
import { DBCategory, DBLog } from '@app/(apps)/lifeos/types'
import { useArchetype } from '@app/(apps)/lifeos/hooks/useArchetype'
import { LogTableView } from '@app/(apps)/lifeos/components/LogTableView'
import { LogEditModal } from '@app/(apps)/lifeos/components/LogEditModal'
import { ViewToggle, ViewMode } from '@app/(apps)/lifeos/components/ViewToggle'
import { getLogSchema } from '@app/(apps)/lifeos/lib/schemaUtils'
import Link from 'next/link'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import BasicModal from '@cm/components/utils/modal/BasicModal'

export default function LogsPage() {
  const [logs, setLogs] = useState<DBLog[]>([])
  const [categories, setCategories] = useState<DBCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [editingLog, setEditingLog] = useState<DBLog | null>(null)

  console.log(editingLog)  //logs

  // ログ一覧取得
  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/lifeos/api/logs')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setLogs(data.logs || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      toast.error('ログの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // カテゴリ一覧取得
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/lifeos/api/categories')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCategories(data.categories || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
    fetchCategories()
  }, [fetchLogs, fetchCategories])



  // フィルタリング
  const filteredLogs = logs.filter((log) => {
    // 検索クエリでフィルタ
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const categoryName = log.category?.name || ''
      const matchesSearch =
        categoryName.toLowerCase().includes(query) ||
        JSON.stringify(log.data).toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    // カテゴリでフィルタ
    if (selectedCategoryId && log.categoryId !== selectedCategoryId) return false

    // 日付でフィルタ
    if (dateFilter !== 'all') {
      const logDate = new Date(log.createdAt)
      const now = new Date()
      const diffTime = now.getTime() - logDate.getTime()
      const diffDays = diffTime / (1000 * 60 * 60 * 24)

      switch (dateFilter) {
        case 'today':
          if (diffDays >= 1) return false
          break
        case 'week':
          if (diffDays >= 7) return false
          break
        case 'month':
          if (diffDays >= 30) return false
          break
      }
    }

    return true
  })

  // カテゴリごとにグループ化
  const logsByCategory = useMemo(() => {
    const grouped: Record<number, { category: DBCategory; logs: DBLog[] }> = {}

    filteredLogs.forEach((log) => {
      const categoryId = log.categoryId
      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          category: log.category || categories.find(c => c.id === categoryId) || {
            id: categoryId,
            name: '未分類',
            description: null,
            schema: {},
            createdAt: new Date(),
            updatedAt: null,
            sortOrder: 0,
          },
          logs: [],
        }
      }
      grouped[categoryId].logs.push(log)
    })

    // カテゴリのsortOrderでソート（なければ名前でソート）
    return Object.values(grouped).sort((a, b) => {
      const orderA = a.category.sortOrder || 0
      const orderB = b.category.sortOrder || 0
      if (orderA !== orderB) return orderA - orderB
      return a.category.name.localeCompare(b.category.name, 'ja')
    })
  }, [filteredLogs, categories])

  // ログを削除
  const handleDelete = async (id: number) => {
    if (!confirm('このログを削除しますか？')) return

    try {
      const response = await fetch(`/lifeos/api/logs/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success('ログを削除しました')
          fetchLogs()
        } else {
          toast.error(data.error || '削除に失敗しました')
        }
      } else {
        toast.error('削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete log:', error)
      toast.error('削除に失敗しました')
    }
  }

  // ログを保存
  const handleSaveLog = async (logId: number, data: Record<string, unknown>) => {
    try {
      const response = await fetch(`/lifeos/api/logs/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success('ログを更新しました')
          fetchLogs()
        } else {
          toast.error(result.error || '更新に失敗しました')
        }
      } else {
        toast.error('更新に失敗しました')
      }
    } catch (error) {
      console.error('Failed to save log:', error)
      toast.error('更新に失敗しました')
    }
  }

  // カテゴリスキーマを更新
  const handleUpdateCategorySchema = async (categoryId: number, schema: any) => {
    try {
      const response = await fetch(`/lifeos/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success('スキーマを更新しました')
          fetchCategories()
          fetchLogs()
        } else {
          toast.error(result.error || 'スキーマ更新に失敗しました')
        }
      } else {
        toast.error('スキーマ更新に失敗しました')
      }
    } catch (error) {
      console.error('Failed to update category schema:', error)
      toast.error('スキーマ更新に失敗しました')
    }
  }

  // CSVエクスポート
  const handleExport = () => {
    const csvData = filteredLogs.map((log) => ({
      カテゴリ: log.category?.name || '',
      データ: JSON.stringify(log.data),
      作成日時: new Date(log.createdAt).toLocaleString('ja-JP'),
    }))

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map((row) => Object.values(row).join(',')),
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `lifeos-logs-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }




  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-7xl mx-auto gap-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ログ一覧</h1>
            <p className="text-gray-600 mt-1">保存されたログを閲覧・管理します</p>
          </div>
          <R_Stack className="gap-2">
            {filteredLogs.length > 0 && (
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                CSVエクスポート
              </button>
            )}
            <Link
              href="/lifeos/chat"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              新しいログを追加
            </Link>
          </R_Stack>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <R_Stack className="gap-4 flex-wrap">
            {/* 検索バー */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ログを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* カテゴリフィルター */}
            <div className="min-w-[200px]">
              <select
                value={selectedCategoryId ?? ''}
                onChange={(e) => setSelectedCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべてのカテゴリ</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ビュー切替 */}
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />

            {/* 日付フィルター */}
            <div className="min-w-[150px]">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべての期間</option>
                <option value="today">今日</option>
                <option value="week">過去1週間</option>
                <option value="month">過去1ヶ月</option>
              </select>
            </div>
          </R_Stack>
        </div>

        {/* ログ一覧 */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">読み込み中...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
            <p className="text-gray-400 mb-4">
              {searchQuery || selectedCategoryId !== null || dateFilter !== 'all'
                ? '検索結果が見つかりませんでした'
                : 'ログがありません'}
            </p>
            <Link
              href="/lifeos/chat"
              className="text-blue-600 hover:text-blue-700 inline-block"
            >
              チャットでログを追加する
            </Link>
          </div>
        ) : (
          <C_Stack className="gap-6">
            <div className="text-sm text-gray-600">
              {filteredLogs.length} 件のログが見つかりました
            </div>

            {logsByCategory.map(({ category, logs: categoryLogs }) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* カテゴリヘッダー */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {categoryLogs.length} 件
                    </div>
                  </div>
                </div>

                {/* カテゴリごとのログ表示 */}
                <div className="p-6">
                  {viewMode === 'table' ? (
                    <LogTableView logs={categoryLogs} onEdit={setEditingLog} />
                  ) : (
                    <C_Stack className="gap-4">
                      {categoryLogs.map((log) => {
                        const schema = getLogSchema(log)
                        const logData = {
                          id: String(log.id),
                          category: {
                            id: String(log.categoryId),
                            name: log.category?.name || '',
                            schema,
                          },
                          schema,
                          archetype: log.archetype,
                          data: log.data,
                          createdAt: log.createdAt,
                          updatedAt: log.updatedAt || undefined,
                        }

                        const { Component } = useArchetype({ archetype: log.archetype })

                        return (
                          <div
                            key={log.id}
                            className="bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                                    {log.archetype}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(log.createdAt).toLocaleString('ja-JP')}
                                  </div>
                                </div>
                              </div>
                              <R_Stack className="gap-2">
                                <button
                                  onClick={() => setEditingLog(log)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="編集"
                                >
                                  編集
                                </button>
                                <button
                                  onClick={() => handleDelete(log.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="削除"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </R_Stack>
                            </div>

                            {/* アーキタイプコンポーネントで表示 */}
                            <div className="mt-4">
                              <Component log={logData as any} />
                            </div>
                          </div>
                        )
                      })}
                    </C_Stack>
                  )}
                </div>
              </div>
            ))}
          </C_Stack>
        )}
        <BasicModal
          open={!!editingLog}
          setopen={setEditingLog}
          title="ログ編集"
          description={`カテゴリ: ${editingLog?.category?.name} (変更不可)`}
          style={{ width: '600px', maxWidth: '95vw' }}

        >
          <LogEditModal
            log={editingLog}
            category={editingLog?.category || null}
            onSave={handleSaveLog}
            onUpdateCategorySchema={handleUpdateCategorySchema}
            onClose={() => setEditingLog(null)}
          />


        </BasicModal>


      </C_Stack>
    </div>
  )
}

