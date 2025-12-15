'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { HakobunClient } from '../../../types'
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, Database, Building2 } from 'lucide-react'
import Link from 'next/link'

interface ClientFormData {
  client_id: string
  name: string
}

const initialFormData: ClientFormData = {
  client_id: '',
  name: '',
}

export default function ClientsManagementPage() {
  const [clients, setClients] = useState<HakobunClient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<ClientFormData>(initialFormData)

  // クライアント一覧取得
  const fetchClients = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/hakobun-analysis/clients')
      const data = await res.json()
      if (data.success) {
        setClients(data.clients)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  // 保存
  const handleSave = async () => {
    if (!formData.client_id || !formData.name) {
      alert('必須項目を入力してください')
      return
    }

    try {
      if (editingId) {
        // 更新
        await fetch('/api/hakobun-analysis/clients', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            name: formData.name,
          }),
        })
      } else {
        // 新規作成
        await fetch('/api/hakobun-analysis/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: formData.client_id,
            name: formData.name,
          }),
        })
      }
      setShowForm(false)
      setEditingId(null)
      setFormData(initialFormData)
      fetchClients()
    } catch (error) {
      alert('保存に失敗しました')
    }
  }

  // 削除
  const handleDelete = async (id: number) => {
    if (!confirm('このクライアントを削除しますか？\n関連するカテゴリ、ルール、分析結果もすべて削除されます。')) return

    try {
      await fetch(`/api/hakobun-analysis/clients?id=${id}`, { method: 'DELETE' })
      fetchClients()
    } catch (error) {
      alert('削除に失敗しました')
    }
  }

  // 編集開始
  const handleEdit = (client: HakobunClient) => {
    setEditingId(client.id)
    setFormData({
      client_id: client.clientId,
      name: client.name,
    })
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-4xl mx-auto gap-6">
        {/* ヘッダー */}
        <R_Stack className="justify-between items-center">
          <R_Stack className="items-center gap-4">
            <Link href="/hakobun-analysis" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Database className="w-6 h-6 text-green-600" />
                クライアント管理
              </h1>
              <p className="text-gray-600 text-sm">分析対象のクライアント（組織）を管理します</p>
            </div>
          </R_Stack>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingId(null)
              setFormData(initialFormData)
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新規クライアント
          </button>
        </R_Stack>

        {/* フォーム */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">{editingId ? 'クライアント編集' : '新規クライアント'}</h2>
            <C_Stack className="gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">クライアントID *</label>
                  <input
                    type="text"
                    value={formData.client_id}
                    onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                    disabled={!!editingId}
                    placeholder="cafe_sample_01"
                    className="w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">半角英数字とアンダースコアのみ</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">クライアント名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="サンプルカフェ"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </R_Stack>
            </C_Stack>
          </div>
        )}

        {/* クライアント一覧 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">クライアント一覧 ({clients.length}件)</h2>
          {isLoading ? (
            <p className="text-gray-500 text-center py-8">読み込み中...</p>
          ) : clients.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">クライアントがまだ登録されていません</p>
              <p className="text-gray-400 text-sm mt-1">「新規クライアント」ボタンから追加してください</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {clients.map(client => (
                <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <R_Stack className="justify-between items-center">
                    <R_Stack className="items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-500 font-mono">{client.clientId}</p>
                      </div>
                    </R_Stack>
                    <R_Stack className="gap-2">
                      <button
                        onClick={() => handleEdit(client)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </R_Stack>
                  </R_Stack>
                </div>
              ))}
            </div>
          )}
        </div>
      </C_Stack>
    </div>
  )
}
