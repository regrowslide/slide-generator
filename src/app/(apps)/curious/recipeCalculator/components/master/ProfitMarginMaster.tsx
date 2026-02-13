'use client'

import {useState, useTransition} from 'react'
import {Plus, Pencil, Trash2, X, Check, Settings} from 'lucide-react'
import type {ProfitMarginStandard} from '../../types'
import {
  getProfitMarginStandards,
  createProfitMarginStandard,
  updateProfitMarginStandard,
  deleteProfitMarginStandard,
} from '../../server-actions/profit-margin-actions'
import {seedProfitMarginStandards} from '../../server-actions/seed-profit-margin'

interface ProfitMarginMasterProps {
  initialStandards: ProfitMarginStandard[]
}

type FormData = {
  minPackCount: number
  maxPackCount: number | null
  minProfitAmount: number
  minProfitRate: number
}

const initialFormData: FormData = {
  minPackCount: 1,
  maxPackCount: null,
  minProfitAmount: 200,
  minProfitRate: 30,
}

export const ProfitMarginMaster = ({initialStandards}: ProfitMarginMasterProps) => {
  const [standards, setStandards] = useState(initialStandards)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isPending, startTransition] = useTransition()

  // フォームリセット
  const resetForm = () => {
    setFormData(initialFormData)
    setEditingId(null)
  }

  // モーダルを開く（新規）
  const handleOpenCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  // モーダルを開く（編集）
  const handleOpenEditModal = (standard: ProfitMarginStandard) => {
    setFormData({
      minPackCount: standard.minPackCount,
      maxPackCount: standard.maxPackCount,
      minProfitAmount: standard.minProfitAmount,
      minProfitRate: standard.minProfitRate,
    })
    setEditingId(standard.id)
    setIsModalOpen(true)
  }

  // モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  // 保存処理
  const handleSave = () => {
    startTransition(async () => {
      if (editingId) {
        await updateProfitMarginStandard(editingId, formData)
      } else {
        await createProfitMarginStandard(formData)
      }
      const updated = await getProfitMarginStandards()
      setStandards(updated)
      handleCloseModal()
    })
  }

  // 削除処理
  const handleDelete = (id: number) => {
    if (!window.confirm('この粗利基準を削除しますか？')) return

    startTransition(async () => {
      await deleteProfitMarginStandard(id)
      const updated = await getProfitMarginStandards()
      setStandards(updated)
    })
  }

  // 初期データ投入
  const handleSeed = () => {
    if (!window.confirm('既存データを削除して初期データを投入しますか？')) return

    startTransition(async () => {
      await seedProfitMarginStandards()
      const updated = await getProfitMarginStandards()
      setStandards(updated)
    })
  }

  // 食数範囲の表示フォーマット
  const formatPackRange = (min: number, max: number | null) => {
    if (max === null) return `${min}食〜`
    return `${min}〜${max}食`
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-800">粗利基準マスタ</h2>
        </div>
        <div className="flex items-center gap-2">
          {standards.length === 0 && (
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
        食数（製造パック数）に応じた粗利の最低基準を設定します。
        見積作成時に基準を下回るとアラートが表示されます。
      </p>

      {/* テーブル */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">食数範囲</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">最低粗利額</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">最低粗利率</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-slate-600 w-28">操作</th>
            </tr>
          </thead>
          <tbody>
            {standards.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-500">
                  粗利基準が登録されていません
                </td>
              </tr>
            ) : (
              standards.map((standard) => (
                <tr key={standard.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm">{formatPackRange(standard.minPackCount, standard.maxPackCount)}</td>
                  <td className="px-4 py-3 text-sm text-right">¥{standard.minProfitAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right">{standard.minProfitRate}%</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(standard)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="編集"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(standard.id)}
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
                {editingId ? '粗利基準を編集' : '粗利基準を登録'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* モーダル本体 */}
            <div className="px-6 py-4 space-y-4">
              {/* 食数下限 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">食数下限</label>
                <input
                  type="number"
                  value={formData.minPackCount}
                  onChange={(e) => setFormData({...formData, minPackCount: Number(e.target.value)})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  min={1}
                />
              </div>

              {/* 食数上限 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  食数上限
                  <span className="text-slate-400 font-normal ml-2">（空欄で上限なし）</span>
                </label>
                <input
                  type="number"
                  value={formData.maxPackCount ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxPackCount: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  min={1}
                  placeholder="上限なし"
                />
              </div>

              {/* 最低粗利額 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">最低粗利額（円）</label>
                <input
                  type="number"
                  value={formData.minProfitAmount}
                  onChange={(e) => setFormData({...formData, minProfitAmount: Number(e.target.value)})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  min={0}
                />
              </div>

              {/* 最低粗利率 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">最低粗利率（%）</label>
                <input
                  type="number"
                  value={formData.minProfitRate}
                  onChange={(e) => setFormData({...formData, minProfitRate: Number(e.target.value)})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  min={0}
                  max={100}
                  step={0.1}
                />
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
                disabled={isPending}
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
