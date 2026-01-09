'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckSquare, Square } from 'lucide-react'
import { bulkUpdateKaizenWorks, bulkDeleteKaizenWorks } from '../actions'
import { WorkEditForm } from './WorkEditForm'
import { BulkEditToolbar } from './BulkEditToolbar'
import { WorkTableRow } from './WorkTableRow'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import { useWorksBulkFilter } from '@app/(apps)/KM/hooks/useWorksBulkFilter'
import { useDragAndDrop } from '@app/(apps)/KM/hooks/useDragAndDrop'

interface BulkEditPanelProps {
  clients: any[]
  works: any[]
  onWorksUpdate?: (works: any[]) => void
}

export const BulkEditPanel = ({ clients, works, onWorksUpdate }: BulkEditPanelProps) => {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [editingWork, setEditingWork] = useState<any | null>(null)

  const {
    filterPublic,
    filterClient,
    filteredWorks,
    setFilterPublic,
    setFilterClient,
  } = useWorksBulkFilter({ works })

  const { draggedWorkId, handleDragStart, handleDrop } = useDragAndDrop({
    works,
    onWorksUpdate,
  })

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredWorks.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredWorks.map(w => w.id)))
    }
  }

  const handleBulkUpdate = (updates: any) => {
    if (selectedIds.size === 0) return

    startTransition(async () => {
      const result = await bulkUpdateKaizenWorks(Array.from(selectedIds), updates)
      if (result.success) {
        setSelectedIds(new Set())
        router.refresh()
      } else {
        alert('更新に失敗しました: ' + result.error)
      }
    })
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    if (!confirm(`${selectedIds.size}件の実績を削除しますか？この操作は取り消せません。`)) return

    startTransition(async () => {
      const result = await bulkDeleteKaizenWorks(Array.from(selectedIds))
      if (result.success) {
        setSelectedIds(new Set())
        router.refresh()
      } else {
        alert('削除に失敗しました: ' + result.error)
      }
    })
  }

  return (
    <div className="flex flex-col h-full">
      <BulkEditToolbar
        filterPublic={filterPublic}
        filterClient={filterClient}
        clients={clients}
        filteredWorksCount={filteredWorks.length}
        selectedCount={selectedIds.size}
        isPending={isPending}
        onFilterPublicChange={setFilterPublic}
        onFilterClientChange={setFilterClient}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDelete}
      />

      {/* テーブル */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[1200px] [&_th]:min-w-[100px]">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-2 py-3 text-left w-6s min-w-6!"></th>
              <th className="px-4 py-3 text-left min-w-6!">
                <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-200 rounded">
                  {selectedIds.size === filteredWorks.length && filteredWorks.length > 0 ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">公開</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">名称</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">タイトル</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">クライアント</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">業種</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ソリューション</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">企業規模</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">期間</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">評価</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">課題</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">成果</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredWorks.map((work, index) => (
              <WorkTableRow
                key={work.id}
                work={work}
                index={index}
                isSelected={selectedIds.has(work.id)}
                isDragging={draggedWorkId === work.id}
                onToggleSelect={() => toggleSelect(work.id)}
                onEdit={() => setEditingWork(work)}
                onDragStart={() => handleDragStart(work.id)}
                onDrop={() => handleDrop(work.id, filteredWorks)}
              />
            ))}
          </tbody>
        </table>

        {filteredWorks.length === 0 && (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <p>該当する実績がありません</p>
          </div>
        )}
      </div>

      {/* 編集モーダル */}
      <ShadModal {...{ open: !!editingWork, onOpenChange: setEditingWork }}>

        <WorkEditForm
          work={editingWork}
          clients={clients}
          onClose={() => {
            setEditingWork(null)
            router.refresh()
          }}
        />

      </ShadModal>
    </div>
  )
}
