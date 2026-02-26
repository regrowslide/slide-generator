'use client'

import {useState, useTransition} from 'react'
import {Plus, Pencil, Trash2, X, Check, Percent} from 'lucide-react'
import type {RcCategoryYieldMaster} from '../../types'
import {
  getCategoryYields,
  createCategoryYield,
  updateCategoryYield,
  deleteCategoryYield,
} from '../../server-actions/category-yield-actions'
import {seedCategoryYields} from '../../server-actions/seed-category-yield'

interface CategoryYieldMasterProps {
  initialData: RcCategoryYieldMaster[]
}

type FormData = {
  categoryName: string
  yieldRate: number
  isFallback: boolean
}

const initialFormData: FormData = {
  categoryName: '',
  yieldRate: 100,
  isFallback: false,
}

export const CategoryYieldMaster = ({initialData}: CategoryYieldMasterProps) => {
  const [data, setData] = useState(initialData)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isPending, startTransition] = useTransition()

  const resetForm = () => {
    setFormData(initialFormData)
    setEditingId(null)
  }

  const handleOpenCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: RcCategoryYieldMaster) => {
    setFormData({
      categoryName: item.categoryName,
      yieldRate: item.yieldRate,
      isFallback: item.isFallback,
    })
    setEditingId(item.id)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleSave = () => {
    startTransition(async () => {
      if (editingId) {
        await updateCategoryYield(editingId, formData)
      } else {
        await createCategoryYield(formData)
      }
      const updated = await getCategoryYields()
      setData(updated)
      handleCloseModal()
    })
  }

  const handleDelete = (id: number) => {
    if (!window.confirm('このカテゴリ歩留率を削除しますか？')) return

    startTransition(async () => {
      await deleteCategoryYield(id)
      const updated = await getCategoryYields()
      setData(updated)
    })
  }

  const handleSeed = () => {
    if (!window.confirm('既存データを削除して初期データを投入しますか？')) return

    startTransition(async () => {
      await seedCategoryYields()
      const updated = await getCategoryYields()
      setData(updated)
    })
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Percent className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-800">カテゴリ歩留率マスタ</h2>
        </div>
        <div className="flex items-center gap-2">
          {data.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={isPending}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors text-sm"
            >
              初期データ投入
            </button>
          )}
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新規登録
          </button>
        </div>
      </div>

      {/* 説明 */}
      <p className="text-sm text-slate-600">
        食材カテゴリごとの歩留率を設定します。AI解析時にマスタ未登録の食材に対してカテゴリに基づく歩留率が自動適用されます。
      </p>

      {/* テーブル */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">カテゴリ名</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">歩留率(%)</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600">フォールバック</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600 w-28">操作</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-500">
                  カテゴリ歩留率が登録されていません
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm">{item.categoryName}</td>
                  <td className="px-4 py-3 text-sm text-right">{item.yieldRate}%</td>
                  <td className="px-4 py-3 text-sm text-center">
                    {item.isFallback && (
                      <span className="inline-block bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                        デフォルト
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="編集"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'カテゴリ歩留率を編集' : 'カテゴリ歩留率を登録'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* モーダル本体 */}
            <div className="px-6 py-4 space-y-4">
              {/* カテゴリ名 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">カテゴリ名</label>
                <input
                  type="text"
                  value={formData.categoryName}
                  onChange={(e) => setFormData({...formData, categoryName: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="例: お肉、葉物野菜"
                />
              </div>

              {/* 歩留率 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">歩留率（%）</label>
                <input
                  type="number"
                  value={formData.yieldRate}
                  onChange={(e) => setFormData({...formData, yieldRate: Number(e.target.value)})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              {/* フォールバック */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFallback"
                  checked={formData.isFallback}
                  onChange={(e) => setFormData({...formData, isFallback: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="isFallback" className="text-sm text-slate-700">
                  フォールバック（どのカテゴリにも該当しない場合に使用）
                </label>
              </div>
            </div>

            {/* モーダルフッター */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                disabled={isPending}
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={isPending || !formData.categoryName}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Check className="w-4 h-4" />
                {isPending ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
