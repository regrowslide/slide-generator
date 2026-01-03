'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Plus, Edit2, Trash2, Save, X, Search } from 'lucide-react'
import { toast } from 'react-toastify'
import { DBCategory, EnrichedSchema } from '@app/(apps)/lifeos/types'
import { SchemaFieldEditor } from '@app/(apps)/lifeos/components/SchemaFieldEditor'
import BasicModal from '@cm/components/utils/modal/BasicModal'
import useModal from '@cm/components/utils/modal/useModal'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<DBCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    description?: string
    schema: EnrichedSchema
  }>({
    name: '',
    description: '',
    schema: {},
  })

  // カテゴリ一覧取得
  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    try {
      // TODO: 実際のAPIを呼び出す
      const response = await fetch('/lifeos/api/categories')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCategories(data.categories || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('カテゴリの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // 新規作成フォームを開く
  const openCreateForm = () => {
    setEditingId(null)
    setFormData({ name: '', description: '', schema: {} })
    setShowForm(true)
  }

  // 編集フォームを開く
  const openEditForm = (category: DBCategory) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      description: category.description || '',
      schema: category.schema || {},
    })
    setShowForm(true)
  }

  // フォームを閉じる
  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', description: '', schema: {} })
  }

  // カテゴリを保存
  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast.error('カテゴリ名を入力してください')
      return
    }

    try {
      const url = editingId ? `/lifeos/api/categories/${editingId}` : '/lifeos/api/categories'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success(editingId ? 'カテゴリを更新しました' : 'カテゴリを作成しました')
          closeForm()
          fetchCategories()
        } else {
          toast.error(data.error || '保存に失敗しました')
        }
      } else {
        toast.error('保存に失敗しました')
      }
    } catch (error) {
      console.error('Failed to save category:', error)
      toast.error('保存に失敗しました')
    }
  }

  // カテゴリを削除
  const handleDelete = async (id: number) => {
    if (!confirm('このカテゴリを削除しますか？')) return

    try {
      const response = await fetch(`/lifeos/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success('カテゴリを削除しました')
          fetchCategories()
        } else {
          toast.error(data.error || '削除に失敗しました')
        }
      } else {
        toast.error('削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      toast.error('削除に失敗しました')
    }
  }

  // 検索フィルタ
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const { Modal: CategoryModal, open, setopen } = useModal()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-6xl mx-auto gap-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">カテゴリ管理</h1>
            <p className="text-gray-600 mt-1">ログのカテゴリを管理します</p>
          </div>
          <button
            onClick={openCreateForm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            新規作成
          </button>
        </div>

        {/* 検索バー */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="カテゴリ名または説明で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* カテゴリ一覧 */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">読み込み中...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
            <p className="text-gray-400">
              {searchQuery ? '検索結果が見つかりませんでした' : 'カテゴリがありません'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                  </div>
                  <R_Stack className="gap-2">
                    <button
                      onClick={() => openEditForm(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="編集"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </R_Stack>
                </div>
                <div className="text-xs text-gray-500">
                  スキーマ: {Object.keys(category.schema || {}).length} フィールド
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 作成/編集フォームモーダル */}
        <ShadModal
          open={!!showForm}
          onOpenChange={setShowForm}
        >
          <div >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'カテゴリを編集' : 'カテゴリを作成'}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 text-gray-400 hover:text-gray-600 rounded transition-colors"
                aria-label="閉じる"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <C_Stack className="gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 健康管理、タスク管理"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="カテゴリの説明を入力..."
                />
              </div>

              <div>
                <SchemaFieldEditor
                  schema={formData.schema || {}}
                  onChange={(schema) => setFormData({ ...formData, schema })}
                />
              </div>

              <R_Stack className="justify-end gap-2">
                <button
                  onClick={closeForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </R_Stack>
            </C_Stack>
          </div>
        </ShadModal>
      </C_Stack>
    </div>
  )
}

