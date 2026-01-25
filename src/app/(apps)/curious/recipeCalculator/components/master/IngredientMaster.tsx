'use client'

import { useState, useMemo, useEffect, useTransition } from 'react'
import { Database, Plus, Search, Loader2 } from 'lucide-react'
import { Button } from '@shadcn/ui/button'
import useModal from '@cm/components/utils/modal/useModal'
import type { RcIngredientMaster } from '../../types'
import {
  getIngredientMasters,
  createIngredientMaster,
  updateIngredientMaster,
  deleteIngredientMaster,
} from '../../server-actions/ingredient-master-actions'
import { IngredientMasterTable } from './IngredientTable'
import { IngredientForm } from './IngredientForm'

export const IngredientMaster = () => {
  const [masterData, setMasterData] = useState<RcIngredientMaster[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingItem, setEditingItem] = useState<RcIngredientMaster | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const modal = useModal()

  // 初回データ取得
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      const data = await getIngredientMasters()
      setMasterData(data as RcIngredientMaster[])
      setIsLoading(false)
    }
    loadData()
  }, [])

  // 検索フィルタ
  const filteredData = useMemo(() => {
    if (!searchTerm) return masterData
    const term = searchTerm.toLowerCase()
    return masterData.filter(
      (item) =>
        item.name.toLowerCase().includes(term) || item.category.toLowerCase().includes(term) || item.supplier.toLowerCase().includes(term)
    )
  }, [masterData, searchTerm])



  // モーダルを開く
  const openModal = (item: RcIngredientMaster | null = null) => {
    setEditingItem(item)
    modal.handleOpen()
  }

  // 保存処理
  const handleSave = (newItem: { name: string; price: number; yield: number; category: string; supplier: string }) => {
    startTransition(async () => {
      if (editingItem) {
        const updated = await updateIngredientMaster(editingItem.id, newItem)
        setMasterData((prev) => prev.map((item) => (item.id === editingItem.id ? (updated as RcIngredientMaster) : item)))
      } else {
        const created = await createIngredientMaster(newItem)
        setMasterData((prev) => [...prev, created as RcIngredientMaster])
      }
      modal.handleClose()
      setEditingItem(null)
    })
  }

  // 削除処理
  const handleDelete = (id: number) => {
    if (window.confirm('削除しますか？')) {
      startTransition(async () => {
        await deleteIngredientMaster(id)
        setMasterData((prev) => prev.filter((item) => item.id !== id))
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-white">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          原材料マスタ
          {isPending && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
        </h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="検索..."
              className="pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => openModal()} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新規
          </Button>
        </div>
      </div>

      {/* テーブル */}
      <div className="flex-1 overflow-auto">
        <IngredientMasterTable data={filteredData} onEdit={openModal} onDelete={handleDelete} />
      </div>

      {/* モーダル */}
      <modal.Modal>
        <IngredientForm editingItem={editingItem} onSave={handleSave} onClose={modal.handleClose} />
      </modal.Modal>
    </div>
  )
}
