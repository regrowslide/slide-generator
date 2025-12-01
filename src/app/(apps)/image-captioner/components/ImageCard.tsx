'use client'

import React, {useState} from 'react'
import {ImageItem} from '../types'
import {RefreshCw, Edit2, Check, X, Tag} from 'lucide-react'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

interface ImageCardProps {
  image: ImageItem
  onUpdate: (id: string, updates: Partial<ImageItem>) => void
  onRegenerate: (id: string) => void
}

export const ImageCard: React.FC<ImageCardProps> = ({image, onUpdate, onRegenerate}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedCaption, setEditedCaption] = useState(image.caption)

  const handleSave = () => {
    onUpdate(image.id, {caption: editedCaption})
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedCaption(image.caption)
    setIsEditing(false)
  }

  const handleTagToggle = (tag: string) => {
    const newTags = image.tags.includes(tag)
      ? image.tags.filter(t => t !== tag)
      : [...image.tags, tag]
    onUpdate(image.id, {tags: newTags})
  }

  const statusColors = {
    pending: 'bg-gray-100 text-gray-600',
    analyzing: 'bg-blue-100 text-blue-600',
    analyzed: 'bg-green-100 text-green-600',
    generating: 'bg-yellow-100 text-yellow-600',
    completed: 'bg-green-100 text-green-600',
    error: 'bg-red-100 text-red-600',
  }

  const statusLabels = {
    pending: '待機中',
    analyzing: '分析中',
    analyzed: '分析完了',
    generating: '生成中',
    completed: '完了',
    error: 'エラー',
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <C_Stack className="gap-3">
        {/* 画像プレビュー */}
        <div className="relative">
          <img src={image.preview} alt={image.file.name} className="w-full h-48 object-contain bg-gray-50 rounded" />
          <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${statusColors[image.status]}`}>
            {statusLabels[image.status]}
          </span>
        </div>

        {/* ファイル名 */}
        <p className="text-sm font-medium text-gray-700 truncate">{image.file.name}</p>

        {/* キャプション */}
        <div className="border-t pt-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <label className="text-xs font-medium text-gray-600">キャプション</label>
            {!isEditing && (
              <R_Stack className="gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  title="編集"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRegenerate(image.id)}
                  disabled={image.status === 'analyzing' || image.status === 'generating'}
                  className="p-1 text-gray-500 hover:text-green-600 disabled:text-gray-300 transition-colors"
                  title="再生成"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </R_Stack>
            )}
          </div>

          {isEditing ? (
            <C_Stack className="gap-2">
              <textarea
                value={editedCaption}
                onChange={e => setEditedCaption(e.target.value)}
                className="w-full p-2 border rounded text-sm min-h-[60px]"
                placeholder="キャプションを入力..."
              />
              <R_Stack className="gap-2 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </R_Stack>
            </C_Stack>
          ) : (
            <p className="text-sm text-gray-700 min-h-[40px]">{image.caption || 'キャプション未設定'}</p>
          )}

          {image.captionPrompt && (
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer">キャプション指示（詳細）</summary>
              <p className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded">{image.captionPrompt}</p>
            </details>
          )}
        </div>

        {/* タグ */}
        <div className="border-t pt-3">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-600">タグ</span>
          </div>
          <R_Stack className="gap-2 flex-wrap">
            {['エージェントモード', 'デバッグ', 'コード修正', 'UI説明'].map(tag => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  image.tags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </R_Stack>
        </div>

        {/* エラー表示 */}
        {image.error && (
          <div className="border-t pt-3">
            <p className="text-xs text-red-600">{image.error}</p>
          </div>
        )}

        {/* 生成された画像 */}
        {image.generatedImageUrl && (
          <div className="border-t pt-3">
            <p className="text-xs font-medium text-gray-600 mb-2">生成された画像</p>
            <img src={image.generatedImageUrl} alt="Generated" className="w-full h-48 object-contain bg-gray-50 rounded" />
          </div>
        )}
      </C_Stack>
    </div>
  )
}

