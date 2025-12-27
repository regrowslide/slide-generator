'use client'

import React, {useState, useEffect, useCallback} from 'react'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {HakobunIndustry, HakobunIndustryGeneralCategory} from '../../../types'
import {Plus, Edit2, Trash2, Save, X, ArrowUp, ArrowDown} from 'lucide-react'

interface GeneralCategoryFormData {
  name: string
  description: string
  sortOrder: number
}

const initialFormData: GeneralCategoryFormData = {
  name: '',
  description: '',
  sortOrder: 0,
}

export default function GeneralCategoriesManagementPage() {
  const [industries, setIndustries] = useState<HakobunIndustry[]>([])
  const [selectedIndustryId, setSelectedIndustryId] = useState<number | null>(null)
  const [generalCategories, setGeneralCategories] = useState<HakobunIndustryGeneralCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<GeneralCategoryFormData>(initialFormData)

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

  // 保存
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
          headers: {'Content-Type': 'application/json'},
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
          headers: {'Content-Type': 'application/json'},
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

  // 削除
  const handleDelete = async (id: number) => {
    if (!confirm('この一般カテゴリを削除しますか？')) return

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

  // 編集開始
  const handleEdit = (category: HakobunIndustryGeneralCategory) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      description: category.description || '',
      sortOrder: category.sortOrder,
    })
    setShowForm(true)
  }

  // 並び順変更
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
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            name: currentCategory.name,
            description: currentCategory.description,
            sortOrder: targetCategory.sortOrder,
          }),
        }),
        fetch(`/api/hakobun/industries/${selectedIndustryId}/general-categories/${targetCategory.id}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
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

  const selectedIndustry = industries.find(ind => ind.id === selectedIndustryId)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-6xl mx-auto gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-4">一般カテゴリ管理</h1>
          <p className="text-gray-600 mb-4">
            業種ごとに一般カテゴリを管理します。一般カテゴリはAI分析時に使用されるプリセットカテゴリです。
          </p>

          {/* 業種選択 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">業種選択</label>
            <select
              value={selectedIndustryId || ''}
              onChange={e => {
                setSelectedIndustryId(parseInt(e.target.value))
                setShowForm(false)
                setEditingId(null)
                setFormData(initialFormData)
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

              {/* フォーム */}
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
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="例: 接客・サービス"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                      <textarea
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
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
                        onChange={e => setFormData({...formData, sortOrder: parseFloat(e.target.value) || 0})}
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

              {/* 一般カテゴリ一覧テーブル */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold mb-4">
                  {selectedIndustry.name} の一般カテゴリ一覧 ({generalCategories.length}件)
                </h2>
                {isLoading ? (
                  <p className="text-gray-500 text-center py-8">読み込み中...</p>
                ) : generalCategories.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">一般カテゴリがまだ登録されていません</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-20">並び順</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">カテゴリ名</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">説明</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">アクション</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generalCategories.map((cat, index) => (
                          <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-center">
                              <R_Stack className="justify-center items-center gap-1">
                                <button
                                  onClick={() => handleMoveOrder(cat.id, 'up')}
                                  disabled={index === 0}
                                  className={`p-1 rounded transition-colors ${
                                    index === 0
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-gray-600 hover:bg-gray-200'
                                  }`}
                                  title="上に移動"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <span className="text-sm font-medium text-gray-700 w-8">{cat.sortOrder}</span>
                                <button
                                  onClick={() => handleMoveOrder(cat.id, 'down')}
                                  disabled={index === generalCategories.length - 1}
                                  className={`p-1 rounded transition-colors ${
                                    index === generalCategories.length - 1
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-gray-600 hover:bg-gray-200'
                                  }`}
                                  title="下に移動"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                              </R_Stack>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-600">{cat.description || '-'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <R_Stack className="justify-center gap-2">
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </C_Stack>
    </div>
  )
}

