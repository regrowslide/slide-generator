'use client'

import React, {useState, useEffect, useCallback} from 'react'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Plus, Edit2, Trash2, Save, X, Factory, Copy, ChevronDown, ChevronRight} from 'lucide-react'
import Link from 'next/link'
import useMyNavigation from '@cm/hooks/globalHooks/useMyNavigation'
import useModal from '@cm/components/utils/modal/useModal'

interface Industry {
  id: number
  code: string
  name: string
  generalCategories: {
    id: number
    name: string
    description: string | null
    categories: {
      id: number
      name: string
    }[]
  }[]
  _count: {
    clients: number
  }
}

interface IndustryFormData {
  code: string
  name: string
  copyFromIndustryId: number | null
}

const initialFormData: IndustryFormData = {
  code: '',
  name: '',
  copyFromIndustryId: null,
}

export default function IndustriesManagementPage() {
  const {getHref} = useMyNavigation()
  const [industries, setIndustries] = useState<Industry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  // モーダル用
  const formModal = useModal<{editingId: number | null; isCopy?: boolean}>()
  const [formData, setFormData] = useState<IndustryFormData>(initialFormData)

  // 業種一覧取得
  const fetchIndustries = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/hakobun/industries')
      const data = await res.json()
      if (data.success) {
        setIndustries(data.industries)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIndustries()
  }, [fetchIndustries])

  // 新規追加モーダルを開く
  const openAddModal = () => {
    setFormData(initialFormData)
    formModal.handleOpen({editingId: null})
  }

  // 編集モーダルを開く
  const openEditModal = (industry: Industry) => {
    setFormData({
      code: industry.code,
      name: industry.name,
      copyFromIndustryId: null,
    })
    formModal.handleOpen({editingId: industry.id})
  }

  // コピーモーダルを開く
  const openCopyModal = (industry: Industry) => {
    setFormData({
      code: `${industry.code}_copy`,
      name: `${industry.name}（コピー）`,
      copyFromIndustryId: industry.id,
    })
    formModal.handleOpen({editingId: null, isCopy: true})
  }

  // 保存
  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      alert('コードと名称は必須です')
      return
    }

    try {
      if (formModal.open?.editingId) {
        // 更新
        const res = await fetch('/api/hakobun/industries', {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: formModal.open.editingId,
            code: formData.code,
            name: formData.name,
          }),
        })
        const data = await res.json()
        if (!data.success) {
          alert(data.error || '更新に失敗しました')
          return
        }
      } else {
        // 新規作成
        const res = await fetch('/api/hakobun/industries', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            code: formData.code,
            name: formData.name,
            copyFromIndustryId: formData.copyFromIndustryId,
          }),
        })
        const data = await res.json()
        if (!data.success) {
          alert(data.error || '作成に失敗しました')
          return
        }
      }
      formModal.handleClose()
      setFormData(initialFormData)
      fetchIndustries()
    } catch (error) {
      alert('保存に失敗しました')
    }
  }

  // 削除
  const handleDelete = async (id: number) => {
    if (!confirm('この業種を削除しますか？\n関連する一般カテゴリ・詳細カテゴリもすべて削除されます。')) return

    try {
      const res = await fetch(`/api/hakobun/industries?id=${id}`, {method: 'DELETE'})
      const data = await res.json()
      if (!data.success) {
        alert(data.error || '削除に失敗しました')
        return
      }
      fetchIndustries()
    } catch (error) {
      alert('削除に失敗しました')
    }
  }

  // 展開トグル
  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-5xl mx-auto gap-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <R_Stack className="justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">業種マスタ管理</h1>
              <p className="text-sm text-gray-500 mt-1">
                業種ごとに一般カテゴリとカテゴリを管理します。業種データのコピー機能で既存業種をテンプレートとして使用できます。
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新規業種
            </button>
          </R_Stack>
        </div>

        {/* 業種一覧 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">業種一覧 ({industries.length}件)</h2>
          {isLoading ? (
            <p className="text-gray-500 text-center py-8">読み込み中...</p>
          ) : industries.length === 0 ? (
            <div className="text-center py-12">
              <Factory className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">業種がまだ登録されていません</p>
              <p className="text-gray-400 text-sm mt-1">「新規業種」ボタンから追加してください</p>
            </div>
          ) : (
            <div className="space-y-3">
              {industries.map(industry => (
                <div key={industry.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* 業種ヘッダー */}
                  <div className="bg-gray-50 px-4 py-3">
                    <R_Stack className="justify-between items-center">
                      <R_Stack className="items-center gap-3">
                        <button
                          onClick={() => toggleExpand(industry.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {expandedIds.has(industry.id) ? (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Factory className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <R_Stack className="items-center gap-2">
                            <p className="font-medium text-gray-900">{industry.name}</p>
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                              {industry.code}
                            </span>
                          </R_Stack>
                          <R_Stack className="gap-3 text-xs text-gray-500 mt-0.5">
                            <span>{industry.generalCategories.length}一般カテゴリ</span>
                            <span>
                              {industry.generalCategories.reduce((sum, gc) => sum + gc.categories.length, 0)}
                              詳細カテゴリ
                            </span>
                            <span>{industry._count.clients}クライアント</span>
                          </R_Stack>
                        </div>
                      </R_Stack>
                      <R_Stack className="gap-1">
                        <Link
                          href={getHref('/hakobun/master/general-categories')}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          カテゴリ管理
                        </Link>
                        <button
                          onClick={() => openCopyModal(industry)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="コピーして新規作成"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(industry)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="編集"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(industry.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                          title="削除"
                          disabled={industry._count.clients > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </R_Stack>
                    </R_Stack>
                  </div>

                  {/* 一般カテゴリ一覧（展開時） */}
                  {expandedIds.has(industry.id) && (
                    <div className="bg-white border-t border-gray-200 divide-y divide-gray-100">
                      {industry.generalCategories.length === 0 ? (
                        <div className="px-4 py-4 pl-12 text-sm text-gray-500">
                          一般カテゴリがまだ登録されていません
                        </div>
                      ) : (
                        industry.generalCategories.map(gc => (
                          <div key={gc.id} className="px-4 py-2 pl-12">
                            <R_Stack className="items-center gap-2">
                              <span className="font-medium text-gray-800">{gc.name}</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                {gc.categories.length}件
                              </span>
                            </R_Stack>
                            {gc.description && <p className="text-xs text-gray-500 mt-0.5">{gc.description}</p>}
                            {gc.categories.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {gc.categories.slice(0, 5).map(cat => (
                                  <span key={cat.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    {cat.name}
                                  </span>
                                ))}
                                {gc.categories.length > 5 && (
                                  <span className="text-xs text-gray-400">...他{gc.categories.length - 5}件</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </C_Stack>

      {/* 業種追加/編集モーダル */}
      <formModal.Modal
        open={!!formModal.open}
        setopen={formModal.setopen}
        title={
          formModal.open?.editingId
            ? '業種編集'
            : formModal.open?.isCopy
              ? '業種コピー'
              : '新規業種'
        }
      >
        <C_Stack className="gap-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                業種コード <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
                placeholder="restaurant"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">半角英数字とアンダースコアのみ</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                業種名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="飲食店"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {!formModal.open?.editingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリをコピー（任意）</label>
              <select
                value={formData.copyFromIndustryId || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    copyFromIndustryId: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">コピーしない</option>
                {industries.map(ind => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}（{ind.generalCategories.length}一般カテゴリ）
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                既存業種の一般カテゴリと詳細カテゴリをコピーして新規業種を作成します
              </p>
            </div>
          )}

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
