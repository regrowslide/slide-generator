'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { HakobunRule, HakobunClient, PriorityType } from '../../../types'
import { Plus, Edit2, Trash2, Save, X, Sparkles, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import useSelectedClient from '../../../(globalHooks)/useSelectedClient'
import useMyNavigation from '@cm/hooks/globalHooks/useMyNavigation'
import useModal from '@cm/components/utils/modal/useModal'
import RuleAutoCreateModal from '../../../components/RuleAutoCreateModal'

interface RuleFormData {
  target_category: string
  rule_description: string
  priority: PriorityType
}

const initialFormData: RuleFormData = {
  target_category: '',
  rule_description: '',
  priority: 'Medium',
}

const priorityOptions: PriorityType[] = ['High', 'Medium', 'Low']

// ページサイズ
const PAGE_SIZE = 20

const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-800'
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'Low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function RulesManagementPage() {
  const { selectedClient } = useSelectedClient()
  const globalClientId = selectedClient?.clientId
  const { getHref } = useMyNavigation()
  const [clients, setClients] = useState<HakobunClient[]>([])
  const [rules, setRules] = useState<HakobunRule[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<RuleFormData>(initialFormData)

  // 検索・ページネーション
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // ルール自動作成モーダル
  const autoCreateModal = useModal<boolean>()

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

  // ルール一覧取得
  const fetchRules = useCallback(async (clientId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/hakobun/rules?client_id=${clientId}`)
      const data = await res.json()
      if (data.success) {
        setRules(data.rules)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (globalClientId) {
      fetchRules(globalClientId)
    }
  }, [globalClientId, fetchRules])

  // フィルタリングとページネーション
  const filteredRules = useMemo(() => {
    if (!searchQuery.trim()) return rules
    const query = searchQuery.toLowerCase()
    return rules.filter(
      rule =>
        rule.targetCategory.toLowerCase().includes(query) ||
        rule.ruleDescription.toLowerCase().includes(query)
    )
  }, [rules, searchQuery])

  const totalPages = Math.ceil(filteredRules.length / PAGE_SIZE)
  const paginatedRules = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredRules.slice(start, start + PAGE_SIZE)
  }, [filteredRules, currentPage])

  // 検索時はページをリセット
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // 保存
  const handleSave = async () => {
    if (!globalClientId || !formData.target_category || !formData.rule_description) {
      alert('必須項目を入力してください（クライアントが選択されていません）')
      return
    }

    try {
      if (editingId) {
        // 更新
        await fetch('/api/hakobun/rules', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            target_category: formData.target_category,
            rule_description: formData.rule_description,
            priority: formData.priority,
          }),
        })
      } else {
        // 新規作成
        await fetch('/api/hakobun/rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: globalClientId,
            target_category: formData.target_category,
            rule_description: formData.rule_description,
            priority: formData.priority,
          }),
        })
      }
      setShowForm(false)
      setEditingId(null)
      setFormData(initialFormData)
      if (globalClientId) {
        fetchRules(globalClientId)
      }
    } catch (error) {
      alert('保存に失敗しました')
    }
  }

  // 削除
  const handleDelete = async (id: number) => {
    if (!confirm('このルールを削除しますか？')) return

    try {
      await fetch(`/api/hakobun/rules?id=${id}`, { method: 'DELETE' })
      if (globalClientId) {
        fetchRules(globalClientId)
      }
    } catch (error) {
      alert('削除に失敗しました')
    }
  }

  // 編集開始
  const handleEdit = (rule: HakobunRule) => {
    setEditingId(rule.id)
    setFormData({
      target_category: rule.targetCategory,
      rule_description: rule.ruleDescription,
      priority: rule.priority as PriorityType,
    })
    setShowForm(true)
  }

  // ルール保存時のコールバック
  const handleRuleSaved = () => {
    if (globalClientId) {
      fetchRules(globalClientId)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-5xl mx-auto gap-6">
        {globalClientId && (
          <>
            {/* 追加ボタン */}
            <R_Stack className="justify-end gap-2">
              <button
                onClick={() => autoCreateModal.handleOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                ルール自動作成
              </button>
              <button
                onClick={() => {
                  setShowForm(true)
                  setEditingId(null)
                  setFormData(initialFormData)
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新規ルール追加
              </button>
            </R_Stack>

            {/* フォーム */}
            {showForm && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold mb-4">{editingId ? 'ルール編集' : '新規ルール'}</h2>
                <C_Stack className="gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">対象カテゴリ *</label>
                      <input
                        type="text"
                        value={formData.target_category}
                        onChange={e => setFormData({ ...formData, target_category: e.target.value })}
                        placeholder="備品・設備"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
                      <select
                        value={formData.priority}
                        onChange={e => setFormData({ ...formData, priority: e.target.value as PriorityType })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        {priorityOptions.map(p => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ルール説明 *</label>
                    <textarea
                      value={formData.rule_description}
                      onChange={e => setFormData({ ...formData, rule_description: e.target.value })}
                      placeholder="「音響」「BGM」「空調」「Wi-Fi」に関する記述は、「店内（雰囲気）」ではなく「備品・設備」に分類すること。"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows={3}
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
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                  </R_Stack>
                </C_Stack>
              </div>
            )}

            {/* ルール一覧 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <R_Stack className="justify-between items-center mb-4">
                <h2 className="text-lg font-bold">
                  ルール一覧 ({filteredRules.length}件{searchQuery && ` / 全${rules.length}件`})
                </h2>
                {/* 検索フィールド */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="カテゴリ・説明で検索..."
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
                  />
                </div>
              </R_Stack>
              {isLoading ? (
                <p className="text-gray-500 text-center py-8">読み込み中...</p>
              ) : rules.length === 0 ? (
                <p className="text-gray-500 text-center py-8">ルールがまだ登録されていません</p>
              ) : filteredRules.length === 0 ? (
                <p className="text-gray-500 text-center py-8">検索結果がありません</p>
              ) : (
                <C_Stack className="gap-3">
                  {paginatedRules.map(rule => (
                    <div key={rule.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <R_Stack className="justify-between items-start">
                        <div className="flex-1">
                          <R_Stack className="items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${getPriorityStyle(rule.priority)}`}>
                              {rule.priority}
                            </span>
                            <span className="font-medium text-gray-800">{rule.targetCategory}</span>
                          </R_Stack>
                          <p className="text-gray-600">{rule.ruleDescription}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            作成日: {new Date(rule.createdAt).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                        <R_Stack className="gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(rule)}
                            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </R_Stack>
                      </R_Stack>
                    </div>
                  ))}
                </C_Stack>
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
      </C_Stack>

      {/* ルール自動作成モーダル */}
      <autoCreateModal.Modal
        alertOnClose
        title="ルール自動作成"
        description="過去の修正事例からルールを自動生成します"

      >
        {globalClientId && (
          <div className={`w-[1300px]`}><RuleAutoCreateModal clientId={globalClientId} onRuleSaved={handleRuleSaved} /></div>
        )}
      </autoCreateModal.Modal>
    </div>
  )
}
