'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Plus, Edit2, Trash2, Save, X, Box, ChevronRight, FolderOpen, Search, ChevronLeft } from 'lucide-react'
import useSelectedClient from '../../(globalHooks)/useSelectedClient'
import useMyNavigation from '@cm/hooks/globalHooks/useMyNavigation'
import Link from 'next/link'
import useModal from '@cm/components/utils/modal/useModal'
import {
  getAnalysisBoxes,
  createAnalysisBox,
  updateAnalysisBox,
  deleteAnalysisBox,
} from '../../_actions/analysis-box-actions'
import type { HakobunAnalysisBox } from '../../types'

interface BoxFormData {
  name: string
  description: string
}

const initialFormData: BoxFormData = {
  name: '',
  description: '',
}

const PAGE_SIZE = 10

export default function AnalysisBoxListPage() {
  const { selectedClient } = useSelectedClient()
  const { getHref } = useMyNavigation()
  const [boxes, setBoxes] = useState<(HakobunAnalysisBox & { sessions?: { _count: { records: number } }[] })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<BoxFormData>(initialFormData)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // モーダル用
  const formModal = useModal<{editingId: number | null}>()

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // 分析BOX一覧取得
  const fetchBoxes = useCallback(async () => {
    if (!selectedClient?.id) return
    setIsLoading(true)
    try {
      const result = await getAnalysisBoxes({
        hakobunClientId: selectedClient.id,
        search: searchQuery || undefined,
        take: PAGE_SIZE,
        skip: (currentPage - 1) * PAGE_SIZE,
      })
      if (result.success && result.data) {
        setBoxes(result.data.boxes as any)
        setTotalCount(result.data.totalCount)
      }
    } finally {
      setIsLoading(false)
    }
  }, [selectedClient?.id, searchQuery, currentPage])

  useEffect(() => {
    fetchBoxes()
  }, [fetchBoxes])

  // 検索実行
  const handleSearch = () => {
    setCurrentPage(1)
    setSearchQuery(searchInput)
  }

  // 新規追加モーダルを開く
  const openAddModal = () => {
    setFormData(initialFormData)
    formModal.handleOpen({editingId: null})
  }

  // 編集モーダルを開く
  const openEditModal = (box: HakobunAnalysisBox) => {
    setFormData({
      name: box.name,
      description: box.description || '',
    })
    formModal.handleOpen({editingId: box.id})
  }

  // 保存
  const handleSave = async () => {
    if (!formData.name) {
      alert('名前を入力してください')
      return
    }
    if (!selectedClient?.id) {
      alert('クライアントを選択してください')
      return
    }

    try {
      if (formModal.open?.editingId) {
        await updateAnalysisBox(formModal.open.editingId, {
          name: formData.name,
          description: formData.description || undefined,
        })
      } else {
        await createAnalysisBox({
          name: formData.name,
          description: formData.description || undefined,
          hakobunClientId: selectedClient.id,
        })
      }
      formModal.handleClose()
      setFormData(initialFormData)
      fetchBoxes()
    } catch (error) {
      alert('保存に失敗しました')
    }
  }

  // 削除
  const handleDelete = async (id: number) => {
    if (!confirm('この分析BOXを削除しますか？\n関連するSESSIONと分析結果もすべて削除されます。')) return

    try {
      await deleteAnalysisBox(id)
      fetchBoxes()
    } catch (error) {
      alert('削除に失敗しました')
    }
  }

  // クライアント未選択
  if (!selectedClient) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">クライアントを選択してください</p>
          <p className="text-gray-400 text-sm mt-2">画面上部のセレクターからクライアントを選択すると、分析BOXが表示されます</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-4xl mx-auto gap-6">
        {/* ヘッダー */}
        <R_Stack className="justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">分析BOX</h1>
            <p className="text-sm text-gray-500 mt-1">分析をまとめる単位です。イベントやキャンペーンごとに作成してください。</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新規分析BOX
          </button>
        </R_Stack>

        {/* 検索 */}
        <R_Stack className="gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="名前で検索..."
            className="flex-1 p-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-1"
          >
            <Search className="w-4 h-4" />
            検索
          </button>
        </R_Stack>

        {/* 分析BOX一覧 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">分析BOX一覧 ({totalCount}件)</h2>
          {isLoading ? (
            <p className="text-gray-500 text-center py-8">読み込み中...</p>
          ) : boxes.length === 0 ? (
            <div className="text-center py-12">
              <Box className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">分析BOXがまだ登録されていません</p>
              <p className="text-gray-400 text-sm mt-1">「新規分析BOX」ボタンから追加してください</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {boxes.map(box => {
                const sessionCount = box.sessions?.length || 0
                const recordCount = box.sessions?.reduce((sum, s: any) => sum + (s._count?.records || 0), 0) || 0
                return (
                  <Link
                    key={box.id}
                    href={getHref(`/hakobun/analysis-box/${box.id}`)}
                    className="block border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <R_Stack className="justify-between items-center">
                      <R_Stack className="items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Box className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{box.name}</p>
                          {box.description && (
                            <p className="text-sm text-gray-500 mt-0.5">{box.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            SESSION: {sessionCount}件 / レコード: {recordCount}件
                          </p>
                        </div>
                      </R_Stack>
                      <R_Stack className="gap-2 items-center">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            openEditModal(box)
                          }}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDelete(box.id)
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </R_Stack>
                    </R_Stack>
                  </Link>
                )
              })}
            </div>
          )}

          {/* ページネーション */}
          {totalPages > 1 && (
            <R_Stack className="justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                前へ
              </button>
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages} ページ
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                次へ
                <ChevronRight className="w-4 h-4" />
              </button>
            </R_Stack>
          )}
        </div>
      </C_Stack>

      {/* 分析BOX追加/編集モーダル */}
      <formModal.Modal
        open={!!formModal.open}
        setopen={formModal.setopen}
        title={formModal.open?.editingId ? '分析BOX編集' : '新規分析BOX'}
      >
        <C_Stack className="gap-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名前 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="例: 2024年1月イベント"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="分析BOXの説明を入力してください"
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <R_Stack className="justify-end gap-2">
            <button
              onClick={() => {
                formModal.handleClose()
                setFormData(initialFormData)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </R_Stack>
        </C_Stack>
      </formModal.Modal>
    </div>
  )
}
