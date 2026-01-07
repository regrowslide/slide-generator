/**
 * ドラッグ&ドロップ機能用のカスタムフック
 */

import { useState, useCallback } from 'react'
import { updateWorkSortOrder } from '../../(admin)/admin/works/actions'

interface UseDragAndDropOptions {
  works: any[]
  onWorksUpdate?: (works: any[]) => void
}

export const useDragAndDrop = ({ works, onWorksUpdate }: UseDragAndDropOptions) => {
  const [draggedWorkId, setDraggedWorkId] = useState<number | null>(null)

  const handleDragStart = useCallback((workId: number) => {
    setDraggedWorkId(workId)
  }, [])

  const handleDrop = useCallback(async (
    targetWorkId: number,
    filteredWorks: any[]
  ) => {
    if (!draggedWorkId || draggedWorkId === targetWorkId) {
      setDraggedWorkId(null)
      return
    }

    const draggedWork = works.find(w => w.id === draggedWorkId)
    if (!draggedWork) {
      setDraggedWorkId(null)
      return
    }

    const targetIndex = filteredWorks.findIndex(w => w.id === targetWorkId)
    const draggedIndex = filteredWorks.findIndex(w => w.id === draggedWorkId)

    if (targetIndex === -1 || draggedIndex === -1) {
      setDraggedWorkId(null)
      return
    }

    // 新しいsortOrderを計算
    const worksToUpdate = [...filteredWorks]
    const [removed] = worksToUpdate.splice(draggedIndex, 1)
    worksToUpdate.splice(targetIndex, 0, removed)

    const newSortOrders = worksToUpdate.map((work, index) => ({
      id: work.id,
      sortOrder: index * 10,
    }))

    // サーバーに送信
    const result = await updateWorkSortOrder(newSortOrders, draggedWorkId, draggedWork.kaizenClientId)
    setDraggedWorkId(null)

    if (result.success) {
      // stateを更新して反映
      const updatedWorks = works.map(work => {
        const updated = newSortOrders.find(so => so.id === work.id)
        if (updated) {
          return { ...work, sortOrder: updated.sortOrder }
        }
        return work
      })

      // sortOrderでソート
      updatedWorks.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      onWorksUpdate?.(updatedWorks)
    }
  }, [draggedWorkId, works, onWorksUpdate])

  return {
    draggedWorkId,
    handleDragStart,
    handleDrop,
  }
}

