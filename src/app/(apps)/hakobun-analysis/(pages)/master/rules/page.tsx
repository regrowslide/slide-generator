'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { HakobunRule, HakobunClient, PriorityType } from '../../../types'
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, BookOpen } from 'lucide-react'
import Link from 'next/link'

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
  const [clients, setClients] = useState<HakobunClient[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [rules, setRules] = useState<HakobunRule[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<RuleFormData>(initialFormData)

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

  // ルール一覧取得
  const fetchRules = useCallback(async (clientId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/hakobun-analysis/rules?client_id=${clientId}`)
      const data = await res.json()
      if (data.success) {
        setRules(data.rules)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedClientId) {
      fetchRules(selectedClientId)
    }
  }, [selectedClientId, fetchRules])

  // 保存
  const handleSave = async () => {
    if (!selectedClientId || !formData.target_category || !formData.rule_description) {
      alert('必須項目を入力してください')
      return
    }

    try {
      if (editingId) {
        // 更新
        await fetch('/api/hakobun-analysis/rules', {
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
        await fetch('/api/hakobun-analysis/rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: selectedClientId,
            target_category: formData.target_category,
            rule_description: formData.rule_description,
            priority: formData.priority,
          }),
        })
      }
      setShowForm(false)
      setEditingId(null)
      setFormData(initialFormData)
      fetchRules(selectedClientId)
    } catch (error) {
      alert('保存に失敗しました')
    }
  }

  // 削除
  const handleDelete = async (id: number) => {
    if (!confirm('このルールを削除しますか？')) return

    try {
      await fetch(`/api/hakobun-analysis/rules?id=${id}`, { method: 'DELETE' })
      fetchRules(selectedClientId)
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
                <BookOpen className="w-6 h-6 text-purple-600" />
                ルール管理
              </h1>
              <p className="text-gray-600 text-sm">AIの判断基準となるルールを管理します</p>
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
              <h2 className="text-lg font-bold mb-4">ルール一覧 ({rules.length}件)</h2>
              {isLoading ? (
                <p className="text-gray-500 text-center py-8">読み込み中...</p>
              ) : rules.length === 0 ? (
                <p className="text-gray-500 text-center py-8">ルールがまだ登録されていません</p>
              ) : (
                <C_Stack className="gap-3">
                  {rules.map(rule => (
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
            </div>
          </>
        )}
      </C_Stack>
    </div>
  )
}
