'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Building2,
  FileText,
  Eye,
  EyeOff,
  Edit,
  Star,
  Plus,
  GripVertical,
} from 'lucide-react'
import { WorkEditForm } from './WorkEditForm'
import { WorkPreview } from './WorkPreview'
import { ClientEditForm } from './ClientEditForm'
import { updateWorkSortOrder } from '../actions'

interface ClientWorkTreeProps {
  clients: any[]
  works: any[]
  selectedWorkId: number | null
  onSelectWork: (id: number | null) => void
}

export const ClientWorkTree = ({
  clients,
  works,
  selectedWorkId,
  onSelectWork,
}: ClientWorkTreeProps) => {
  const [expandedClients, setExpandedClients] = useState<Set<number>>(new Set())
  const [editingWork, setEditingWork] = useState<any | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [creatingForClient, setCreatingForClient] = useState<number | null>(null)
  const [editingClient, setEditingClient] = useState<any | null>(null)
  const [draggedWorkId, setDraggedWorkId] = useState<number | null>(null)

  // クライアントごとに実績をグループ化（sortOrderでソート）
  const worksByClient = clients.map(client => ({
    client,
    works: works
      .filter(w => w.kaizenClientId === client.id)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
  }))

  // クライアントに紐づかない実績（sortOrderでソート）
  const unassignedWorks = works
    .filter(w => !w.kaizenClientId)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

  // ドラッグ開始
  const handleDragStart = (workId: number) => {
    setDraggedWorkId(workId)
  }

  // ドロップ処理
  const handleDrop = async (targetWorkId: number, targetClientId: number | null) => {
    if (!draggedWorkId || draggedWorkId === targetWorkId) {
      setDraggedWorkId(null)
      return
    }

    const draggedWork = works.find(w => w.id === draggedWorkId)
    if (!draggedWork) {
      setDraggedWorkId(null)
      return
    }

    // 移動先のクライアントの実績を取得（sortOrderでソート）
    const targetClientWorks = works
      .filter(w => w.kaizenClientId === targetClientId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

    const targetIndex = targetClientWorks.findIndex(w => w.id === targetWorkId)
    if (targetIndex === -1) {
      setDraggedWorkId(null)
      return
    }

    // 新しいsortOrderを計算
    const newSortOrders: { id: number; sortOrder: number }[] = []

    if (draggedWork.kaizenClientId === targetClientId) {
      // 同じクライアント内での移動
      const draggedIndex = targetClientWorks.findIndex(w => w.id === draggedWorkId)
      const worksToUpdate = [...targetClientWorks]
      const [removed] = worksToUpdate.splice(draggedIndex, 1)
      worksToUpdate.splice(targetIndex, 0, removed)

      worksToUpdate.forEach((work, index) => {
        newSortOrders.push({ id: work.id, sortOrder: index * 10 })
      })
    } else {
      // 別のクライアントへの移動
      // 移動先のクライアントの実績を再ソート
      const worksToUpdate = [...targetClientWorks]
      worksToUpdate.splice(targetIndex, 0, draggedWork)

      worksToUpdate.forEach((work, index) => {
        newSortOrders.push({ id: work.id, sortOrder: index * 10 })
      })

      // 移動元のクライアントの実績を再ソート
      const sourceWorks = works
        .filter(w => w.kaizenClientId === draggedWork.kaizenClientId && w.id !== draggedWorkId)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

      sourceWorks.forEach((work, index) => {
        newSortOrders.push({ id: work.id, sortOrder: index * 10 })
      })
    }

    // サーバーに送信
    await updateWorkSortOrder(newSortOrders, draggedWorkId, targetClientId)
    setDraggedWorkId(null)

    // ページをリロードして反映
    window.location.reload()
  }

  const toggleClient = (clientId: number) => {
    const newExpanded = new Set(expandedClients)
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId)
    } else {
      newExpanded.add(clientId)
    }
    setExpandedClients(newExpanded)
  }

  const selectedWork = works.find(w => w.id === selectedWorkId)

  return (
    <div className="flex h-full">
      {/* 左側: ツリービュー */}
      <div className="w-1/3 min-w-[300px] border-r border-gray-200 overflow-y-auto bg-gray-50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">クライアント × 実績</h2>
            <button
              onClick={() => setEditingClient(null)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">クライアント追加</span>
            </button>
          </div>

          {/* クライアント一覧 */}
          <div className="space-y-1">
            {worksByClient.map(({ client, works: clientWorks }) => (
              <div key={client.id} className="rounded-lg overflow-hidden">
                {/* クライアントヘッダー */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleClient(client.id)}
                    className="flex-1 flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 transition-colors text-left"
                  >
                    {expandedClients.has(client.id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="flex-1 font-medium text-gray-900 truncate">
                      {client.name || '名称未設定'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${client.public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {clientWorks.length}件
                    </span>
                  </button>
                  <button
                    onClick={() => setEditingClient(client)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="クライアント編集"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>

                {/* 実績一覧 */}
                {expandedClients.has(client.id) && (
                  <div className="pl-6 pb-2 space-y-1">
                    {clientWorks.map((work, index) => (
                      <WorkTreeItem
                        key={work.id}
                        work={work}
                        isSelected={selectedWorkId === work.id}
                        isDragging={draggedWorkId === work.id}
                        onSelect={() => onSelectWork(work.id)}
                        onEdit={() => setEditingWork(work)}
                        onDragStart={() => handleDragStart(work.id)}
                        onDrop={() => handleDrop(work.id, client.id)}
                      />
                    ))}
                    {/* 新規作成ボタン */}
                    <button
                      onClick={() => setCreatingForClient(client.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>このクライアントに実績を追加</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* 未分類の実績 */}
            {unassignedWorks.length > 0 && (
              <div className="rounded-lg overflow-hidden mt-4">
                <div className="px-3 py-2 bg-gray-200 text-gray-700 font-medium text-sm">
                  未分類の実績 ({unassignedWorks.length}件)
                </div>
                <div className="space-y-1 pt-1">
                  {unassignedWorks.map(work => (
                    <WorkTreeItem
                      key={work.id}
                      work={work}
                      isSelected={selectedWorkId === work.id}
                      isDragging={draggedWorkId === work.id}
                      onSelect={() => onSelectWork(work.id)}
                      onEdit={() => setEditingWork(work)}
                      onDragStart={() => handleDragStart(work.id)}
                      onDrop={() => handleDrop(work.id, null)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 右側: 詳細パネル */}
      <div className="flex-1 overflow-y-auto">
        {selectedWork ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{selectedWork.title}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  プレビュー
                </button>
                <button
                  onClick={() => setEditingWork(selectedWork)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  編集
                </button>
              </div>
            </div>

            {/* 詳細情報 */}
            <WorkDetailView work={selectedWork} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>左のツリーから実績を選択してください</p>
          </div>
        )}
      </div>

      {/* 編集モーダル */}
      {editingWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <WorkEditForm
              work={editingWork}
              clients={clients}
              onClose={() => setEditingWork(null)}
            />
          </div>
        </div>
      )}

      {/* 新規作成モーダル */}
      {creatingForClient !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <WorkEditForm
              work={{ kaizenClientId: creatingForClient }}
              clients={clients}
              onClose={() => setCreatingForClient(null)}
              isNew
            />
          </div>
        </div>
      )}

      {/* プレビューモーダル */}
      {showPreview && selectedWork && (
        <WorkPreview work={selectedWork} onClose={() => setShowPreview(false)} />
      )}

      {/* クライアント編集モーダル */}
      {editingClient !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <ClientEditForm
              client={editingClient}
              onClose={() => setEditingClient(null)}
              onSuccess={() => window.location.reload()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// 実績ツリーアイテム
const WorkTreeItem = ({
  work,
  isSelected,
  isDragging,
  onSelect,
  onEdit,
  onDragStart,
  onDrop,
}: {
  work: any
  isSelected: boolean
  isDragging: boolean
  onSelect: () => void
  onEdit: () => void
  onDragStart: () => void
  onDrop: () => void
}) => {
  const [isDraggedOver, setIsDraggedOver] = useState(false)

  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.effectAllowed = 'move'
        onDragStart()
      }}
      onDragOver={e => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setIsDraggedOver(true)
      }}
      onDragLeave={() => setIsDraggedOver(false)}
      onDrop={e => {
        e.preventDefault()
        setIsDraggedOver(false)
        onDrop()
      }}
      onClick={onSelect}
      className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-blue-100 border-l-4 border-blue-600' : isDraggedOver ? 'bg-blue-50 border-l-4 border-blue-400' : 'hover:bg-gray-100'
        } ${isDragging ? 'opacity-50' : ''}`}
    >
      <GripVertical className="h-5 w-5 text-gray-500 flex-shrink-0 cursor-move hover:text-gray-700" />
      <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{work.title || '無題'}</div>
        <div className="text-xs text-gray-500 truncate">{work.subtitle}</div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {work.isPublic ? (
          <Eye className="h-3 w-3 text-green-600" />
        ) : (
          <EyeOff className="h-3 w-3 text-gray-400" />
        )}
        {work.toolPoint && (
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-amber-600">{work.toolPoint}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// 実績詳細ビュー
const WorkDetailView = ({ work }: { work: any }) => {
  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="py-2 border-b border-gray-100">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm text-gray-900">{value || '-'}</div>
    </div>
  )

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* 左カラム */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">基本情報</h3>
          <InfoRow label="タイトル" value={work.title} />
          <InfoRow label="サブタイトル" value={work.subtitle} />
          <InfoRow label="日付" value={work.date ? new Date(work.date).toLocaleDateString('ja-JP') : null} />
          <InfoRow label="ステータス" value={work.status} />
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">カテゴリ</h3>
          <InfoRow label="業種" value={work.jobCategory} />
          <InfoRow label="ソリューション" value={work.systemCategory} />
          <InfoRow label="連携サービス" value={work.collaborationTool} />
          <InfoRow label="企業規模" value={work.companyScale} />
          <InfoRow label="プロジェクト期間" value={work.projectDuration} />
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">評価</h3>
          <div className="flex gap-4">
            <div>
              <div className="text-xs text-gray-500">取引評価</div>
              <div className="text-lg font-bold text-amber-600">{work.dealPoint || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">成果物評価</div>
              <div className="text-lg font-bold text-amber-600">{work.toolPoint || '-'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 右カラム */}
      <div className="space-y-4">
        <div className="bg-red-50 rounded-lg p-4">
          <h3 className="font-semibold text-red-700 mb-2">導入前の課題</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{work.beforeChallenge || '-'}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-700 mb-2">定量成果</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{work.quantitativeResult || '-'}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-700 mb-2">提供ソリューション</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{work.description || '-'}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="font-semibold text-purple-700 mb-2">技術的工夫</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{work.points || '-'}</p>
        </div>

        {work.impression && (
          <div className="bg-amber-50 rounded-lg p-4">
            <h3 className="font-semibold text-amber-700 mb-2">お客様の声</h3>
            <p className="text-sm text-gray-700 italic whitespace-pre-wrap">「{work.impression}」</p>
            {work.reply && (
              <div className="mt-2 pt-2 border-t border-amber-200">
                <div className="text-xs text-amber-600 font-medium">改善マニアより</div>
                <p className="text-sm text-gray-600 mt-1">{work.reply}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
