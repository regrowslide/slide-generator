'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { HakobunCategory, HakobunClient } from '../../../types'
import { Plus, Edit2, Trash2, Save, X, ToggleLeft, ToggleRight } from 'lucide-react'
import useSelectedClient from '../../../(globalHooks)/useSelectedClient'
import useMyNavigation from '@cm/hooks/globalHooks/useMyNavigation'

interface CategoryFormData {
  category_code: string
  general_category: string
  specific_category: string
  description: string
}

const initialFormData: CategoryFormData = {
  category_code: '',
  general_category: '',
  specific_category: '',
  description: '',
}

export default function CategoriesManagementPage() {
  const { selectedClient } = useSelectedClient()
  const globalClientId = selectedClient?.clientId
  const { getHref } = useMyNavigation()
  const [clients, setClients] = useState<HakobunClient[]>([])
  const [categories, setCategories] = useState<HakobunCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData)

  // クライアント一覧取得
  useEffect(() => {
    fetch('/api/hakobun/clients')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setClients(data.clients)
        }
      })
  }, [])

  // カテゴリ一覧取得
  const fetchCategories = useCallback(async (clientId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/hakobun/categories?client_id=${clientId}`)
      const data = await res.json()
      if (data.success) {
        setCategories(data.categories)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (globalClientId) {

      fetchCategories(globalClientId)
    }
  }, [globalClientId, fetchCategories])

  // 保存
  const handleSave = async () => {
    if (!globalClientId || !formData.category_code || !formData.general_category || !formData.specific_category) {
      alert('必須項目を入力してください（クライアントが選択されていません）')
      return
    }

    try {
      if (editingId) {


        // 更新
        await fetch('/api/hakobun/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            general_category: formData.general_category,
            specific_category: formData.specific_category,
            description: formData.description,
          }),
        })
      } else {
        // 新規作成
        await fetch('/api/hakobun/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: globalClientId,
            category_code: formData.category_code,
            general_category: formData.general_category,
            specific_category: formData.specific_category,
            description: formData.description,
          }),
        })
      }
      setShowForm(false)
      setEditingId(null)
      setFormData(initialFormData)
      if (globalClientId) {
        fetchCategories(globalClientId)
      }
    } catch (error) {
      alert('保存に失敗しました')
    }
  }

  // 削除
  const handleDelete = async (id: number) => {
    if (!confirm('このカテゴリを削除しますか？')) return

    try {
      await fetch(`/api/hakobun/categories?id=${id}`, { method: 'DELETE' })
      if (globalClientId) {
        fetchCategories(globalClientId)
      }
    } catch (error) {
      alert('削除に失敗しました')
    }
  }

  // 編集開始
  const handleEdit = (category: HakobunCategory) => {
    setEditingId(category.id)
    setFormData({
      category_code: category.categoryCode,
      general_category: category.generalCategory,
      specific_category: category.specificCategory,
      description: category.description || '',
    })
    setShowForm(true)
  }

  // 有効/無効の切り替え
  const handleToggleEnabled = async (id: number, currentEnabled: boolean) => {
    try {
      await fetch('/api/hakobun/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          enabled: !currentEnabled,
        }),
      })
      if (globalClientId) {
        fetchCategories(globalClientId)
      }
    } catch (error) {
      alert('有効/無効の切り替えに失敗しました')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-6xl mx-auto gap-6">


        {!!globalClientId && (
          <>
            {/* 追加ボタン */}
            <R_Stack className="justify-end">
              <button
                onClick={() => {
                  setShowForm(true)
                  setEditingId(null)
                  setFormData(initialFormData)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新規カテゴリ追加
              </button>
            </R_Stack>

            {/* フォーム */}
            {showForm && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold mb-4">{editingId ? 'カテゴリ編集' : '新規カテゴリ'}</h2>
                <C_Stack className="gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリコード *</label>
                      <input
                        type="text"
                        value={formData.category_code}
                        onChange={e => setFormData({ ...formData, category_code: e.target.value })}
                        disabled={!!editingId}
                        placeholder="cat_01"
                        className="w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">大カテゴリ *</label>
                      <input
                        type="text"
                        value={formData.general_category}
                        onChange={e => setFormData({ ...formData, general_category: e.target.value })}
                        placeholder="店内"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">小カテゴリ *</label>
                    <input
                      type="text"
                      value={formData.specific_category}
                      onChange={e => setFormData({ ...formData, specific_category: e.target.value })}
                      placeholder="オシャレ・雰囲気が良い"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="このカテゴリの説明や分類基準"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows={2}
                    />
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

            {/* カテゴリ一覧テーブル */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">カテゴリ一覧 ({categories.length}件)</h2>
              {isLoading ? (
                <p className="text-gray-500 text-center py-8">読み込み中...</p>
              ) : categories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">カテゴリがまだ登録されていません</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">カテゴリコード</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">大カテゴリ</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">小カテゴリ</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">説明</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">状態</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">アクション</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => (
                        <tr
                          key={cat.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 ${cat.enabled === false ? 'opacity-60' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono bg-gray-200 px-2 py-0.5 rounded">{cat.categoryCode}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{cat.generalCategory}</td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-medium ${cat.enabled === false ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {cat.specificCategory}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm ${cat.enabled === false ? 'text-gray-400' : 'text-gray-600'}`}>
                              {cat.description || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs px-2 py-1 rounded ${cat.enabled === false ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                              {cat.enabled === false ? '無効' : '有効'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <R_Stack className="justify-center gap-2">
                              <button
                                onClick={() => handleToggleEnabled(cat.id, cat.enabled)}
                                className={`p-2 rounded transition-colors ${cat.enabled
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-gray-400 hover:bg-gray-50'
                                  }`}
                                title={cat.enabled ? '無効にする' : '有効にする'}
                              >
                                {cat.enabled ? (
                                  <ToggleRight className="w-5 h-5" />
                                ) : (
                                  <ToggleLeft className="w-5 h-5" />
                                )}
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
      </C_Stack>
    </div>
  )
}
