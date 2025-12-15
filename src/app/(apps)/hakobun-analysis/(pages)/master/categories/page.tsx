'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { HakobunCategory, HakobunClient } from '../../../types'
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, Layers } from 'lucide-react'
import Link from 'next/link'

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
  const [clients, setClients] = useState<HakobunClient[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [categories, setCategories] = useState<HakobunCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData)

  // クライアント一覧取得
  useEffect(() => {
    fetch('/api/hakobun-analysis/clients')
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
      const res = await fetch(`/api/hakobun-analysis/categories?client_id=${clientId}`)
      const data = await res.json()
      if (data.success) {
        setCategories(data.categories)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedClientId) {
      fetchCategories(selectedClientId)
    }
  }, [selectedClientId, fetchCategories])

  // 保存
  const handleSave = async () => {
    if (!selectedClientId || !formData.category_code || !formData.general_category || !formData.specific_category) {
      alert('必須項目を入力してください')
      return
    }

    try {
      if (editingId) {
        // 更新
        await fetch('/api/hakobun-analysis/categories', {
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
        await fetch('/api/hakobun-analysis/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: selectedClientId,
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
      fetchCategories(selectedClientId)
    } catch (error) {
      alert('保存に失敗しました')
    }
  }

  // 削除
  const handleDelete = async (id: number) => {
    if (!confirm('このカテゴリを削除しますか？')) return

    try {
      await fetch(`/api/hakobun-analysis/categories?id=${id}`, { method: 'DELETE' })
      fetchCategories(selectedClientId)
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

  // カテゴリをグループ化
  const groupedCategories = categories.reduce(
    (acc, cat) => {
      if (!acc[cat.generalCategory]) {
        acc[cat.generalCategory] = []
      }
      acc[cat.generalCategory].push(cat)
      return acc
    },
    {} as Record<string, HakobunCategory[]>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-5xl mx-auto gap-6">
        {/* ヘッダー */}
        <R_Stack className="justify-between items-center">
          <R_Stack className="items-center gap-4">
            <Link href="/hakobun-analysis" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-6 h-6 text-blue-600" />
                カテゴリマスター管理
              </h1>
              <p className="text-gray-600 text-sm">分析に使用するカテゴリを管理します</p>
            </div>
          </R_Stack>
        </R_Stack>

        {/* クライアント選択 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">クライアント選択</label>
          <select
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
            className="w-full max-w-md p-2 border border-gray-300 rounded-lg"
          >
            <option value="">クライアントを選択</option>
            {clients.map(client => (
              <option key={client.id} value={client.clientId}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {selectedClientId && (
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

            {/* カテゴリ一覧 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">カテゴリ一覧 ({categories.length}件)</h2>
              {isLoading ? (
                <p className="text-gray-500 text-center py-8">読み込み中...</p>
              ) : categories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">カテゴリがまだ登録されていません</p>
              ) : (
                <C_Stack className="gap-4">
                  {Object.entries(groupedCategories).map(([generalCat, cats]) => (
                    <div key={generalCat} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 font-medium text-gray-700">{generalCat}</div>
                      <div className="divide-y divide-gray-100">
                        {cats.map(cat => (
                          <div key={cat.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                            <div>
                              <R_Stack className="items-center gap-2">
                                <span className="text-xs font-mono bg-gray-200 px-2 py-0.5 rounded">{cat.categoryCode}</span>
                                <span className="font-medium">{cat.specificCategory}</span>
                              </R_Stack>
                              {cat.description && <p className="text-sm text-gray-500 mt-1">{cat.description}</p>}
                            </div>
                            <R_Stack className="gap-2">
                              <button
                                onClick={() => handleEdit(cat)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(cat.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </R_Stack>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </C_Stack>
              )}
            </div>
          </>
        )}
      </C_Stack>
    </div>
  )
}
