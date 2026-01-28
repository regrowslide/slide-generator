'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { HakobunIndustry, HakobunIndustryGeneralCategory, HakobunIndustryCategory } from '../../../types'
import { Plus, Edit2, Trash2, Save, X, ArrowUp, ArrowDown, ChevronDown, ChevronRight, ToggleLeft, ToggleRight, Search, ChevronLeft } from 'lucide-react'

interface GeneralCategoryFormData {
  name: string
  description: string
  sortOrder: number
}

interface DetailCategoryFormData {
  name: string
  description: string
  sortOrder: number
}

const initialFormData: GeneralCategoryFormData = {
  name: '',
  description: '',
  sortOrder: 0,
}

const initialDetailFormData: DetailCategoryFormData = {
  name: '',
  description: '',
  sortOrder: 0,
}

// ページサイズ
const PAGE_SIZE = 20

export default function GeneralCategoriesManagementPage() {
  const [industries, setIndustries] = useState<HakobunIndustry[]>([])
  const [selectedIndustryId, setSelectedIndustryId] = useState<number | null>(null)
  const [generalCategories, setGeneralCategories] = useState<HakobunIndustryGeneralCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<GeneralCategoryFormData>(initialFormData)

  // 検索・ページネーション
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // 展開中の一般カテゴリID（Setで管理し、全て展開状態にする）
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<number>>(new Set())

  // 詳細カテゴリ編集用
  const [showDetailForm, setShowDetailForm] = useState(false)
  const [editingDetailId, setEditingDetailId] = useState<number | null>(null)
  const [detailFormData, setDetailFormData] = useState<DetailCategoryFormData>(initialDetailFormData)
  const [editingGeneralCategoryId, setEditingGeneralCategoryId] = useState<number | null>(null)

  // 業種一覧取得
  useEffect(() => {
    fetch('/api/hakobun/industries')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIndustries(data.industries)
          // 最初の業種を選択
          if (data.industries.length > 0) {
            setSelectedIndustryId(data.industries[0].id)
          }
        }
      })
      .catch(error => {
        console.error('Failed to fetch industries:', error)
      })
  }, [])

  // 一般カテゴリ一覧取得
  const fetchGeneralCategories = useCallback(async (industryId: number) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/hakobun/industries/${industryId}/general-categories`)
      const data = await res.json()
      if (data.success) {
        setGeneralCategories(data.generalCategories)
        // 全ての一般カテゴリを展開状態にする
        const allIds = new Set<number>(data.generalCategories.map((gc: HakobunIndustryGeneralCategory) => gc.id))
        setExpandedCategoryIds(allIds)
      }
    } catch (error) {
      console.error('Failed to fetch general categories:', error)
      alert('一般カテゴリの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedIndustryId) {
      fetchGeneralCategories(selectedIndustryId)
    }
  }, [selectedIndustryId, fetchGeneralCategories])

  // フィルタリングとページネーション
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return generalCategories
    const query = searchQuery.toLowerCase()
    return generalCategories.filter(
      cat =>
        cat.name.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query)) ||
        (cat.categories && cat.categories.some(detail => detail.name.toLowerCase().includes(query)))
    )
  }, [generalCategories, searchQuery])

  const totalPages = Math.ceil(filteredCategories.length / PAGE_SIZE)
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredCategories.slice(start, start + PAGE_SIZE)
  }, [filteredCategories, currentPage])

  // 検索時はページをリセット
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // 一般カテゴリ保存
  const handleSave = async () => {
    if (!selectedIndustryId || !formData.name) {
      alert('必須項目を入力してください（業種が選択されていません）')
      return
    }

    try {
      if (editingId) {
        // 更新
        const res = await fetch(`/api/hakobun/industries/${selectedIndustryId}/general-categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            sortOrder: formData.sortOrder,
          }),
        })
        const data = await res.json()
        if (!data.success) {
          alert(data.error || '更新に失敗しました')
          return
        }
      } else {
        // 新規作成
        const res = await fetch(`/api/hakobun/industries/${selectedIndustryId}/general-categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            sortOrder: formData.sortOrder,
          }),
        })
        const data = await res.json()
        if (!data.success) {
          alert(data.error || '作成に失敗しました')
          return
        }
      }
      setShowForm(false)
      setEditingId(null)
      setFormData(initialFormData)
      if (selectedIndustryId) {
        fetchGeneralCategories(selectedIndustryId)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました')
    }
  }

  // 一般カテゴリ削除
  const handleDelete = async (id: number) => {
    if (!confirm('この一般カテゴリを削除しますか？\n関連する詳細カテゴリもすべて削除されます。')) return

    if (!selectedIndustryId) return

    try {
      const res = await fetch(`/api/hakobun/industries/${selectedIndustryId}/general-categories/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!data.success) {
        alert(data.error || '削除に失敗しました')
        return
      }
      if (selectedIndustryId) {
        fetchGeneralCategories(selectedIndustryId)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('削除に失敗しました')
    }
  }

  // 一般カテゴリ編集開始
  const handleEdit = (category: HakobunIndustryGeneralCategory) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      description: category.description || '',
      sortOrder: category.sortOrder,
    })
    setShowForm(true)
  }

  // 一般カテゴリ並び順変更
  const handleMoveOrder = async (id: number, direction: 'up' | 'down') => {
    if (!selectedIndustryId) return

    const currentIndex = generalCategories.findIndex(cat => cat.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= generalCategories.length) return

    const targetCategory = generalCategories[newIndex]
    const currentCategory = generalCategories[currentIndex]

    try {
      // 両方のsortOrderを更新
      await Promise.all([
        fetch(`/api/hakobun/industries/${selectedIndustryId}/general-categories/${currentCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: currentCategory.name,
            description: currentCategory.description,
            sortOrder: targetCategory.sortOrder,
          }),
        }),
        fetch(`/api/hakobun/industries/${selectedIndustryId}/general-categories/${targetCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: targetCategory.name,
            description: targetCategory.description,
            sortOrder: currentCategory.sortOrder,
          }),
        }),
      ])

      if (selectedIndustryId) {
        fetchGeneralCategories(selectedIndustryId)
      }
    } catch (error) {
      console.error('Move order error:', error)
      alert('並び順の変更に失敗しました')
    }
  }

  // ========== 詳細カテゴリ関連 ==========

  // 詳細カテゴリ追加フォーム表示
  const handleShowDetailForm = (generalCategoryId: number) => {
    const generalCategory = generalCategories.find(gc => gc.id === generalCategoryId)
    const maxSortOrder = generalCategory?.categories?.length
      ? Math.max(...generalCategory.categories.map(c => c.sortOrder))
      : -1

    setEditingGeneralCategoryId(generalCategoryId)
    setEditingDetailId(null)
    setDetailFormData({
      ...initialDetailFormData,
      sortOrder: maxSortOrder + 1,
    })
    setShowDetailForm(true)
    setExpandedCategoryIds(prev => new Set(prev).add(generalCategoryId))
  }

  // 詳細カテゴリ編集開始
  const handleEditDetail = (generalCategoryId: number, category: HakobunIndustryCategory) => {
    setEditingGeneralCategoryId(generalCategoryId)
    setEditingDetailId(category.id)
    setDetailFormData({
      name: category.name,
      description: category.description || '',
      sortOrder: category.sortOrder,
    })
    setShowDetailForm(true)
  }

  // 詳細カテゴリ保存
  const handleSaveDetail = async () => {
    if (!selectedIndustryId || !editingGeneralCategoryId || !detailFormData.name) {
      alert('必須項目を入力してください')
      return
    }

    try {
      if (editingDetailId) {
        // 更新
        const res = await fetch(
          `/api/hakobun/industries/${selectedIndustryId}/general-categories/${editingGeneralCategoryId}/categories/${editingDetailId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: detailFormData.name,
              description: detailFormData.description,
              sortOrder: detailFormData.sortOrder,
            }),
          }
        )
        const data = await res.json()
        if (!data.success) {
          alert(data.error || '更新に失敗しました')
          return
        }
      } else {
        // 新規作成
        const res = await fetch(
          `/api/hakobun/industries/${selectedIndustryId}/general-categories/${editingGeneralCategoryId}/categories`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: detailFormData.name,
              description: detailFormData.description,
              sortOrder: detailFormData.sortOrder,
            }),
          }
        )
        const data = await res.json()
        if (!data.success) {
          alert(data.error || '作成に失敗しました')
          return
        }
      }
      setShowDetailForm(false)
      setEditingDetailId(null)
      setEditingGeneralCategoryId(null)
      setDetailFormData(initialDetailFormData)
      if (selectedIndustryId) {
        fetchGeneralCategories(selectedIndustryId)
      }
    } catch (error) {
      console.error('Save detail error:', error)
      alert('保存に失敗しました')
    }
  }

  // 詳細カテゴリ削除
  const handleDeleteDetail = async (generalCategoryId: number, detailCategoryId: number) => {
    if (!confirm('この詳細カテゴリを削除しますか？')) return

    if (!selectedIndustryId) return

    try {
      const res = await fetch(
        `/api/hakobun/industries/${selectedIndustryId}/general-categories/${generalCategoryId}/categories/${detailCategoryId}`,
        { method: 'DELETE' }
      )
      const data = await res.json()
      if (!data.success) {
        alert(data.error || '削除に失敗しました')
        return
      }
      if (selectedIndustryId) {
        fetchGeneralCategories(selectedIndustryId)
      }
    } catch (error) {
      console.error('Delete detail error:', error)
      alert('削除に失敗しました')
    }
  }

  // 詳細カテゴリ有効/無効切り替え
  const handleToggleDetailEnabled = async (generalCategoryId: number, category: HakobunIndustryCategory) => {
    if (!selectedIndustryId) return

    try {
      const res = await fetch(
        `/api/hakobun/industries/${selectedIndustryId}/general-categories/${generalCategoryId}/categories/${category.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enabled: !category.enabled,
          }),
        }
      )
      const data = await res.json()
      if (!data.success) {
        alert(data.error || '更新に失敗しました')
        return
      }
      if (selectedIndustryId) {
        fetchGeneralCategories(selectedIndustryId)
      }
    } catch (error) {
      console.error('Toggle enabled error:', error)
      alert('有効/無効の切り替えに失敗しました')
    }
  }

  const selectedIndustry = industries.find(ind => ind.id === selectedIndustryId)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-6xl mx-auto gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-4">カテゴリ管理</h1>
          <p className="text-gray-600 mb-4">
            業種ごとに一般カテゴリ（大分類）と詳細カテゴリ（小分類）を管理します。これらのカテゴリはAI分析時に使用されます。
          </p>

          {/* 業種選択 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">業種選択</label>
            <select
              value={selectedIndustryId || ''}
              onChange={e => {
                setSelectedIndustryId(parseInt(e.target.value))
                setShowForm(false)
                setShowDetailForm(false)
                setEditingId(null)
                setEditingDetailId(null)
                setFormData(initialFormData)
                setDetailFormData(initialDetailFormData)
                setExpandedCategoryIds(new Set())
              }}
              className="w-full max-w-md p-2 border border-gray-300 rounded-lg"
            >
              <option value="">業種を選択してください</option>
              {industries.map(industry => (
                <option key={industry.id} value={industry.id}>
                  {industry.name} ({industry.code})
                </option>
              ))}
            </select>
          </div>

          {selectedIndustryId && selectedIndustry && (
            <>
              {/* 追加ボタン */}
              <R_Stack className="justify-end mb-4">
                <button
                  onClick={() => {
                    setShowForm(true)
                    setEditingId(null)
                    setFormData({
                      ...initialFormData,
                      sortOrder: generalCategories.length > 0 ? Math.max(...generalCategories.map(c => c.sortOrder)) + 1 : 0,
                    })
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  新規一般カテゴリ追加
                </button>
              </R_Stack>

              {/* 一般カテゴリフォーム */}
              {showForm && (
                <div className="bg-gray-50 rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-lg font-bold mb-4">{editingId ? '一般カテゴリ編集' : '新規一般カテゴリ'}</h2>
                  <C_Stack className="gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        カテゴリ名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="例: 接客・サービス"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                      <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="例: スタッフの対応、接客態度、サービス全般に関する評価"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">並び順</label>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={e => setFormData({ ...formData, sortOrder: parseFloat(e.target.value) || 0 })}
                        className="w-full max-w-xs p-2 border border-gray-300 rounded-lg"
                        min="0"
                        step="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">数値が小さいほど上に表示されます</p>
                    </div>
                    <R_Stack className="justify-end gap-2">
                      <button
                        onClick={() => {
                          setShowForm(false)
                          setEditingId(null)
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
                </div>
              )}

              {/* 詳細カテゴリフォーム */}
              {showDetailForm && (
                <div className="bg-green-50 rounded-lg shadow-sm p-6 mb-6 border border-green-200">
                  <h2 className="text-lg font-bold mb-4">{editingDetailId ? '詳細カテゴリ編集' : '新規詳細カテゴリ'}</h2>
                  <C_Stack className="gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        カテゴリ名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={detailFormData.name}
                        onChange={e => setDetailFormData({ ...detailFormData, name: e.target.value })}
                        placeholder="例: オシャレ・雰囲気が良い"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                      <textarea
                        value={detailFormData.description}
                        onChange={e => setDetailFormData({ ...detailFormData, description: e.target.value })}
                        placeholder="このカテゴリの説明や分類基準"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        rows={2}
                      />
                    </div>
                    <R_Stack className="justify-end gap-2">
                      <button
                        onClick={() => {
                          setShowDetailForm(false)
                          setEditingDetailId(null)
                          setEditingGeneralCategoryId(null)
                          setDetailFormData(initialDetailFormData)
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        キャンセル
                      </button>
                      <button
                        onClick={handleSaveDetail}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" />
                        保存
                      </button>
                    </R_Stack>
                  </C_Stack>
                </div>
              )}

              {/* カテゴリ一覧 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <R_Stack className="justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">
                    {selectedIndustry.name} のカテゴリ一覧 ({filteredCategories.length}件{searchQuery && ` / 全${generalCategories.length}件`})
                  </h2>
                  {/* 検索フィールド */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="カテゴリ名で検索..."
                      className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
                    />
                  </div>
                </R_Stack>
                {isLoading ? (
                  <p className="text-gray-500 text-center py-8">読み込み中...</p>
                ) : generalCategories.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">一般カテゴリがまだ登録されていません</p>
                ) : filteredCategories.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">検索結果がありません</p>
                ) : (
                  <div className="space-y-2">
                    {paginatedCategories.map((cat, index) => (
                      <div key={cat.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* 一般カテゴリ行 */}
                        <div className="bg-gray-50 px-4 py-3">
                          <R_Stack className="justify-between items-center">
                            <R_Stack className="items-center gap-3">
                              {/* 展開ボタン */}
                              <button
                                onClick={() => {
                                  setExpandedCategoryIds(prev => {
                                    const newSet = new Set(prev)
                                    if (newSet.has(cat.id)) {
                                      newSet.delete(cat.id)
                                    } else {
                                      newSet.add(cat.id)
                                    }
                                    return newSet
                                  })
                                }}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                {expandedCategoryIds.has(cat.id) ? (
                                  <ChevronDown className="w-5 h-5 text-gray-600" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-gray-600" />
                                )}
                              </button>

                              {/* 並び順 */}
                              <R_Stack className="items-center gap-0">
                                <button
                                  onClick={() => handleMoveOrder(cat.id, 'up')}
                                  disabled={index === 0}
                                  className={`p-1 rounded transition-colors ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                                  title="上に移動"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleMoveOrder(cat.id, 'down')}
                                  disabled={index === generalCategories.length - 1}
                                  className={`p-1 rounded transition-colors ${index === generalCategories.length - 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                                  title="下に移動"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </R_Stack>

                              {/* カテゴリ情報 */}
                              <div>
                                <R_Stack className="items-center gap-2">
                                  <span className="font-medium text-gray-900">{cat.name}</span>
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    {cat.categories?.length || 0}件
                                  </span>
                                </R_Stack>
                                {cat.description && (
                                  <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                                )}
                              </div>
                            </R_Stack>

                            <R_Stack className="gap-1">
                              <button
                                onClick={() => handleShowDetailForm(cat.id)}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1"
                                title="詳細カテゴリを追加"
                              >
                                <Plus className="w-3 h-3" />
                                詳細追加
                              </button>
                              <button
                                onClick={() => handleEdit(cat)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="編集"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(cat.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                title="削除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </R_Stack>
                          </R_Stack>
                        </div>

                        {/* 詳細カテゴリ一覧（展開時） */}
                        {expandedCategoryIds.has(cat.id) && (
                          <div className="bg-white border-t border-gray-200">
                            {cat.categories && cat.categories.length > 0 ? (
                              <div className="divide-y divide-gray-100">
                                {cat.categories.map(detailCat => (
                                  <div
                                    key={detailCat.id}
                                    className={`px-4 py-2 pl-12 hover:bg-gray-50 ${!detailCat.enabled ? 'opacity-60' : ''
                                      }`}
                                  >
                                    <R_Stack className="justify-between items-center">
                                      <div>
                                        <span
                                          className={`text-sm ${!detailCat.enabled ? 'text-gray-400 line-through' : 'text-gray-800'
                                            }`}
                                        >
                                          {detailCat.name}
                                        </span>
                                        {detailCat.description && (
                                          <p className="text-xs text-gray-500">{detailCat.description}</p>
                                        )}
                                      </div>
                                      <R_Stack className="gap-1">
                                        <button
                                          onClick={() => handleToggleDetailEnabled(cat.id, detailCat)}
                                          className={`p-1.5 rounded transition-colors ${detailCat.enabled
                                            ? 'text-green-600 hover:bg-green-50'
                                            : 'text-gray-400 hover:bg-gray-100'
                                            }`}
                                          title={detailCat.enabled ? '無効にする' : '有効にする'}
                                        >
                                          {detailCat.enabled ? (
                                            <ToggleRight className="w-4 h-4" />
                                          ) : (
                                            <ToggleLeft className="w-4 h-4" />
                                          )}
                                        </button>
                                        <button
                                          onClick={() => handleEditDetail(cat.id, detailCat)}
                                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                          title="編集"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteDetail(cat.id, detailCat.id)}
                                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                          title="削除"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </R_Stack>
                                    </R_Stack>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="px-4 py-4 pl-12 text-sm text-gray-500">
                                詳細カテゴリがまだ登録されていません
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ページネーション */}
                {totalPages > 1 && (
                  <R_Stack className="justify-center items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600">
                      {currentPage} / {totalPages} ページ
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </R_Stack>
                )}
              </div>
            </>
          )}
        </div>
      </C_Stack>
    </div>
  )
}
