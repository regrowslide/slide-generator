'use client'

import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Plus, X, Clock } from 'lucide-react'

/** カテゴリ作成モーダル */
export interface CategoryModalProps {
  type: 'general' | 'category'
  name: string
  setName: (value: string) => void
  description: string
  onCancel: () => void
  onCreate: () => void
}

export function CategoryModal({
  type,
  name,
  setName,
  description,
  onCancel,
  onCreate,
}: CategoryModalProps) {
  return (
    <C_Stack className="gap-4">
      <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
        <p className="text-sm text-cyan-800 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          追加したカテゴリは「一括保存」を実行するまでDBには保存されません
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          カテゴリ名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={type === 'general' ? '例: 接客・サービス' : '例: オシャレ・雰囲気が良い'}
        />
      </div>

      <R_Stack className="justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          キャンセル
        </button>
        <button
          onClick={onCreate}
          disabled={!name.trim()}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          追加（保留）
        </button>
      </R_Stack>
    </C_Stack>
  )
}

