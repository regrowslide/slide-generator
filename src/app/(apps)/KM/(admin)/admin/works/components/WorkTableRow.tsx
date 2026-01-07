'use client'

import React, { useState } from 'react'
import { CheckSquare, Square, Eye, EyeOff, Star, AlertTriangle, GripVertical } from 'lucide-react'

interface WorkTableRowProps {
  work: any
  index: number
  isSelected: boolean
  isDragging: boolean
  onToggleSelect: () => void
  onEdit: () => void
  onDragStart: () => void
  onDrop: () => void
}

/**
 * テーブル行コンポーネント
 */
export const WorkTableRow: React.FC<WorkTableRowProps> = ({
  work,
  index,
  isSelected,
  isDragging,
  onToggleSelect,
  onEdit,
  onDragStart,
  onDrop,
}) => {
  const [isDraggedOver, setIsDraggedOver] = useState(false)

  return (
    <tr
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
      className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''} ${isDragging ? 'opacity-50' : ''} ${isDraggedOver ? 'bg-blue-50 border-t-2 border-blue-400' : ''}`}
    >
      <td className="px-2 py-3">
        <GripVertical className="h-5 w-5 text-gray-500 cursor-move hover:text-gray-700 transition-colors" />
      </td>
      <td className="px-4 py-3">
        <button
          onClick={onToggleSelect}
          className="p-1 hover:bg-gray-200 rounded"
        >
          {isSelected ? (
            <CheckSquare className="h-5 w-5 text-blue-600" />
          ) : (
            <Square className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
        >
          編集
        </button>
      </td>
      <td className="px-4 py-3">
        {work.isPublic ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            <Eye className="h-3 w-3" />
            公開
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            <EyeOff className="h-3 w-3" />
            非公開
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {work.allowShowClient ? (
          <span className="text-green-600 text-xs">表示</span>
        ) : (
          <span className="text-gray-400 text-xs">非表示</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="max-w-[200px]">
          <div className="text-sm font-medium text-gray-900 truncate">{work.title || '-'}</div>
          <div className="text-xs text-gray-500 truncate">{work.subtitle}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-gray-700">
          {work.KaizenClient?.name || '-'}
        </span>
      </td>
      <td className="px-4 py-3">
        {work.jobCategory && (
          <span className="inline-block px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs">
            {work.jobCategory}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {work.systemCategory && (
          <span className="inline-block px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs">
            {work.systemCategory}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-gray-700">{work.companyScale || '-'}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-gray-700">{work.projectDuration || '-'}</span>
      </td>
      <td className="px-4 py-3">
        {work.toolPoint && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-amber-600">{work.toolPoint}</span>
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="max-w-[150px]">
          {work.beforeChallenge ? (
            <p className="text-xs text-gray-600 truncate">{work.beforeChallenge}</p>
          ) : (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              未入力
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="max-w-[150px]">
          {work.quantitativeResult ? (
            <p className="text-xs text-green-600 font-medium truncate">
              {work.quantitativeResult.split('\n')[0]}
            </p>
          ) : (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              未入力
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}

