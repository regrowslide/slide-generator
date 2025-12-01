'use client'

import React, { useState } from 'react'
import { ImageItem } from '../types'
import { RefreshCw, Edit2, Check, X } from 'lucide-react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'

interface ImageCardProps {
  image: ImageItem
  onUpdate: (id: string, updates: Partial<ImageItem>) => void
  onRegenerate: (id: string) => void
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onUpdate, onRegenerate }) => {
  const [isEditingAnnotation, setIsEditingAnnotation] = useState(false)
  const [isEditingPrompt, setIsEditingPrompt] = useState(false)
  const [editedAnnotation, setEditedAnnotation] = useState(image.annotation)
  const [editedAnnotationPrompt, setEditedAnnotationPrompt] = useState(image.annotationPrompt)

  const handleSaveAnnotation = () => {
    onUpdate(image.id, { annotation: editedAnnotation })
    setIsEditingAnnotation(false)
  }

  const handleCancelAnnotation = () => {
    setEditedAnnotation(image.annotation)
    setIsEditingAnnotation(false)
  }

  const handleSavePrompt = () => {
    onUpdate(image.id, { annotationPrompt: editedAnnotationPrompt })
    setIsEditingPrompt(false)
  }

  const handleCancelPrompt = () => {
    setEditedAnnotationPrompt(image.annotationPrompt)
    setIsEditingPrompt(false)
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
    <div className="border rounded-lg p-4 bg-white shadow-sm relative">
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

        {/* 注釈 */}
        <div className="border-t pt-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <label className="text-xs font-medium text-gray-600">注釈内容</label>
            {!isEditingAnnotation && (
              <R_Stack className="gap-1">
                <button
                  onClick={() => setIsEditingAnnotation(true)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  title="編集"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRegenerate(image.id)}
                  disabled={image.status === 'analyzing' || image.status === 'generating'}
                  className="p-1 text-gray-500 hover:text-green-600 disabled:text-gray-300 transition-colors"
                  title="再分析"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </R_Stack>
            )}
          </div>

          {isEditingAnnotation ? (
            <C_Stack className="gap-2">
              <textarea
                value={editedAnnotation}
                onChange={e => setEditedAnnotation(e.target.value)}
                className="w-full p-2 border rounded text-sm min-h-[60px]"
                placeholder="注釈内容を入力..."
              />
              <R_Stack className="gap-2 justify-end">
                <button
                  onClick={handleCancelAnnotation}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSaveAnnotation}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </R_Stack>
            </C_Stack>
          ) : (
            <p className={`text-sm text-gray-700 min-h-[40px] ${image.annotation ? 'bg-green-100 rounded-md p-2' : 'text-gray-400 bg-yellow-100'}`}>{image.annotation || '注釈未設定'}</p>
          )}



          {/* 注釈プロンプト */}
          <div className="mt-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              {!isEditingPrompt && (
                <button
                  onClick={() => setIsEditingPrompt(true)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  title="編集"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {isEditingPrompt ? (
              <C_Stack className="gap-2">
                <textarea
                  value={editedAnnotationPrompt}
                  onChange={e => setEditedAnnotationPrompt(e.target.value)}
                  className="w-full p-2 border rounded text-sm min-h-[100px]"
                  placeholder="注釈プロンプトを入力..."
                />
                <R_Stack className="gap-2 justify-end">
                  <button
                    onClick={handleCancelPrompt}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSavePrompt}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </R_Stack>
              </C_Stack>
            ) : (
              <p className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded whitespace-pre-wrap">
                {image.annotationPrompt || '注釈プロンプト未設定'}
              </p>
            )}
          </div>
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

