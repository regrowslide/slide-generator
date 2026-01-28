'use client'

import React, {useState, useEffect, useCallback, useMemo} from 'react'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Building2,
  ChevronDown,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Factory,
  Search,
  ChevronLeft,
} from 'lucide-react'
import useModal from '@cm/components/utils/modal/useModal'

// ページサイズ
const PAGE_SIZE = 20

interface Industry {
  id: number
  code: string
  name: string
}

interface Stage {
  id: number
  name: string
  description: string | null
  sortOrder: number
  enabled: boolean
}

interface Client {
  id: number
  clientId: string
  name: string
  industryId: number | null
  industry: Industry | null
  HakobunClientStage: Stage[]
}

interface ClientFormData {
  client_id: string
  name: string
  industryId: number | null
}

interface StageFormData {
  name: string
  description: string
}

const initialFormData: ClientFormData = {
  client_id: '',
  name: '',
  industryId: null,
}

const initialStageFormData: StageFormData = {
  name: '',
  description: '',
}

export default function ClientsManagementPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [industries, setIndustries] = useState<Industry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<ClientFormData>(initialFormData)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  // 検索・ページネーション
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // クライアント追加/編集モーダル用
  const clientModal = useModal<{editingId: number | null}>()

  // ステージ編集用
  const stageModal = useModal<{clientId: number; stage?: Stage}>()
  const [stageFormData, setStageFormData] = useState<StageFormData>(initialStageFormData)

  // 業種一覧取得
  useEffect(() => {
    fetch('/api/hakobun/industries')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIndustries(data.industries)
        }
      })
  }, [])

  // クライアント一覧取得
  const fetchClients = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/hakobun/clients')
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

  // フィルタリングとページネーション
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients
    const query = searchQuery.toLowerCase()
    return clients.filter(
      client =>
        client.name.toLowerCase().includes(query) ||
        client.clientId.toLowerCase().includes(query)
    )
  }, [clients, searchQuery])

  const totalPages = Math.ceil(filteredClients.length / PAGE_SIZE)
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredClients.slice(start, start + PAGE_SIZE)
  }, [filteredClients, currentPage])

  // 検索時はページをリセット
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // 新規追加モーダルを開く
  const openAddModal = () => {
    setFormData(initialFormData)
    clientModal.handleOpen({editingId: null})
  }

  // 編集モーダルを開く
  const openEditModal = (client: Client) => {
    setFormData({
      client_id: client.clientId,
      name: client.name,
      industryId: client.industryId,
    })
    clientModal.handleOpen({editingId: client.id})
  }

  // クライアント保存
  const handleSave = async () => {
    if (!formData.client_id || !formData.name) {
      alert('必須項目を入力してください')
      return
    }

    try {
      if (clientModal.open?.editingId) {
        // 更新
        const res = await fetch('/api/hakobun/clients', {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: clientModal.open.editingId,
            name: formData.name,
            industryId: formData.industryId,
          }),
        })
        const data = await res.json()
        if (!data.success) {
          alert(data.error || '更新に失敗しました')
          return
        }
      } else {
        // 新規作成
        const res = await fetch('/api/hakobun/clients', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            client_id: formData.client_id,
            name: formData.name,
            industryId: formData.industryId,
          }),
        })
        const data = await res.json()
        if (!data.success) {
          alert(data.error || '作成に失敗しました')
          return
        }
      }
      clientModal.handleClose()
      setFormData(initialFormData)
      fetchClients()
    } catch (error) {
      alert('保存に失敗しました')
    }
  }

  // クライアント削除
  const handleDelete = async (id: number) => {
    if (!confirm('このクライアントを削除しますか？\n関連するカテゴリ、ルール、分析結果もすべて削除されます。')) return

    try {
      const res = await fetch(`/api/hakobun/clients?id=${id}`, {method: 'DELETE'})
      const data = await res.json()
      if (!data.success) {
        alert(data.error || '削除に失敗しました')
        return
      }
      fetchClients()
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

  // ステージ追加モーダルを開く
  const openAddStageModal = (clientId: number) => {
    setStageFormData(initialStageFormData)
    stageModal.handleOpen({clientId})
  }

  // ステージ編集モーダルを開く
  const openEditStageModal = (clientId: number, stage: Stage) => {
    setStageFormData({
      name: stage.name,
      description: stage.description || '',
    })
    stageModal.handleOpen({clientId, stage})
  }

  // ステージ保存
  const handleSaveStage = async () => {
    if (!stageModal.open || !stageFormData.name) {
      alert('ステージ名は必須です')
      return
    }

    try {
      if (stageModal.open.stage) {
        // 更新
        const res = await fetch(`/api/hakobun/clients/${stageModal.open.clientId}/stages`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: stageModal.open.stage.id,
            name: stageFormData.name,
            description: stageFormData.description,
          }),
        })
        const data = await res.json()
        if (!data.success) {
          alert(data.error || '更新に失敗しました')
          return
        }
      } else {
        // 新規作成
        const res = await fetch(`/api/hakobun/clients/${stageModal.open.clientId}/stages`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            name: stageFormData.name,
            description: stageFormData.description,
          }),
        })
        const data = await res.json()
        if (!data.success) {
          alert(data.error || '作成に失敗しました')
          return
        }
      }
      stageModal.handleClose()
      setStageFormData(initialStageFormData)
      fetchClients()
    } catch (error) {
      alert('保存に失敗しました')
    }
  }

  // ステージ削除
  const handleDeleteStage = async (clientId: number, stageId: number) => {
    if (!confirm('このステージを削除しますか？')) return

    try {
      const res = await fetch(`/api/hakobun/clients/${clientId}/stages?id=${stageId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!data.success) {
        alert(data.error || '削除に失敗しました')
        return
      }
      fetchClients()
    } catch (error) {
      alert('削除に失敗しました')
    }
  }

  // ステージ有効/無効切り替え
  const handleToggleStageEnabled = async (clientId: number, stage: Stage) => {
    try {
      const res = await fetch(`/api/hakobun/clients/${clientId}/stages`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: stage.id,
          enabled: !stage.enabled,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        alert(data.error || '更新に失敗しました')
        return
      }
      fetchClients()
    } catch (error) {
      alert('有効/無効の切り替えに失敗しました')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <C_Stack className="max-w-5xl mx-auto gap-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <R_Stack className="justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">クライアント管理</h1>
              <p className="text-sm text-gray-500 mt-1">
                クライアントの基本情報と業種紐付け、ステージマスタを管理します。
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新規クライアント
            </button>
          </R_Stack>
        </div>

        {/* クライアント一覧 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <R_Stack className="justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              クライアント一覧 ({filteredClients.length}件{searchQuery && ` / 全${clients.length}件`})
            </h2>
            {/* 検索フィールド */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="名称・IDで検索..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
              />
            </div>
          </R_Stack>
          {isLoading ? (
            <p className="text-gray-500 text-center py-8">読み込み中...</p>
          ) : clients.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">クライアントがまだ登録されていません</p>
              <p className="text-gray-400 text-sm mt-1">「新規クライアント」ボタンから追加してください</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">検索結果がありません</p>
          ) : (
            <div className="space-y-3">
              {paginatedClients.map(client => (
                <div key={client.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* クライアントヘッダー */}
                  <div className="bg-gray-50 px-4 py-3">
                    <R_Stack className="justify-between items-center">
                      <R_Stack className="items-center gap-3">
                        <button
                          onClick={() => toggleExpand(client.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {expandedIds.has(client.id) ? (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <R_Stack className="items-center gap-2">
                            <p className="font-medium text-gray-900">{client.name}</p>
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                              {client.clientId}
                            </span>
                          </R_Stack>
                          <R_Stack className="gap-3 text-xs text-gray-500 mt-0.5">
                            {client.industry ? (
                              <R_Stack className="items-center gap-1">
                                <Factory className="w-3 h-3" />
                                <span>{client.industry.name}</span>
                              </R_Stack>
                            ) : (
                              <span className="text-orange-500">業種未設定</span>
                            )}
                            <span>{client.HakobunClientStage?.length || 0}ステージ</span>
                          </R_Stack>
                        </div>
                      </R_Stack>
                      <R_Stack className="gap-1">
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                          title="編集"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </R_Stack>
                    </R_Stack>
                  </div>

                  {/* ステージマスタ（展開時） */}
                  {expandedIds.has(client.id) && (
                    <div className="bg-white border-t border-gray-200 p-4">
                      <R_Stack className="justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-gray-700">ステージマスタ</h3>
                        <button
                          onClick={() => openAddStageModal(client.id)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          ステージ追加
                        </button>
                      </R_Stack>
                      {client.HakobunClientStage && client.HakobunClientStage.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {client.HakobunClientStage.map(stage => (
                            <div
                              key={stage.id}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                                stage.enabled
                                  ? 'bg-white border-gray-200'
                                  : 'bg-gray-100 border-gray-200 opacity-60'
                              }`}
                            >
                              <span
                                className={`text-sm ${!stage.enabled ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                              >
                                {stage.name}
                              </span>
                              <R_Stack className="gap-0.5">
                                <button
                                  onClick={() => handleToggleStageEnabled(client.id, stage)}
                                  className={`p-1 rounded transition-colors ${
                                    stage.enabled
                                      ? 'text-green-600 hover:bg-green-50'
                                      : 'text-gray-400 hover:bg-gray-100'
                                  }`}
                                  title={stage.enabled ? '無効にする' : '有効にする'}
                                >
                                  {stage.enabled ? (
                                    <ToggleRight className="w-4 h-4" />
                                  ) : (
                                    <ToggleLeft className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => openEditStageModal(client.id, stage)}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                  title="編集"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStage(client.id, stage.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  title="削除"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </R_Stack>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">ステージがまだ登録されていません</p>
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
      </C_Stack>

      {/* クライアント追加/編集モーダル */}
      <clientModal.Modal
        open={!!clientModal.open}
        setopen={clientModal.setopen}
        title={clientModal.open?.editingId ? 'クライアント編集' : '新規クライアント'}
      >
        <C_Stack className="gap-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                クライアントID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.client_id}
                onChange={e => setFormData({...formData, client_id: e.target.value})}
                disabled={!!clientModal.open?.editingId}
                placeholder="cafe_sample_01"
                className="w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">半角英数字とアンダースコアのみ</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                クライアント名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="サンプルカフェ"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">業種</label>
            <select
              value={formData.industryId || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  industryId: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">選択してください</option>
              {industries.map(ind => (
                <option key={ind.id} value={ind.id}>
                  {ind.name}（{ind.code}）
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              業種を選択すると、その業種のカテゴリマスタがAI分析時に使用されます
            </p>
          </div>
          <R_Stack className="justify-end gap-2">
            <button
              onClick={() => {
                clientModal.handleClose()
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
      </clientModal.Modal>

      {/* ステージ追加/編集モーダル */}
      <stageModal.Modal
        open={!!stageModal.open}
        setopen={stageModal.setopen}
        title={stageModal.open?.stage ? 'ステージ編集' : '新規ステージ'}
      >
        <C_Stack className="gap-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ステージ名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={stageFormData.name}
              onChange={e => setStageFormData({...stageFormData, name: e.target.value})}
              placeholder="例: 認知、興味、検討..."
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
            <textarea
              value={stageFormData.description}
              onChange={e => setStageFormData({...stageFormData, description: e.target.value})}
              placeholder="このステージの説明"
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <R_Stack className="justify-end gap-2">
            <button
              onClick={() => {
                stageModal.handleClose()
                setStageFormData(initialStageFormData)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSaveStage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              保存
            </button>
          </R_Stack>
        </C_Stack>
      </stageModal.Modal>
    </div>
  )
}
