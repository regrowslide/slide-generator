'use client'

import React, { useState, useEffect } from 'react'
import { Save, X, Plus, AlertTriangle } from 'lucide-react'
import { DBLog, EnrichedSchema, DBCategory, EnrichedSchemaField } from '../types'
import { mergeLogWithSchema, formatFieldValue, getFieldLabel } from '../lib/schemaUtils'
import useModal from '@cm/components/utils/modal/useModal'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

export interface LogEditModalProps {
  log: DBLog | null
  category: DBCategory | null
  onSave: (logId: number, data: Record<string, unknown>) => Promise<void>
  onUpdateCategorySchema?: (categoryId: number, schema: EnrichedSchema) => Promise<void>
  onClose: () => void
}

/**
 * ログ編集モーダルコンポーネント
 */
export const LogEditModal: React.FC<LogEditModalProps> = ({
  log,
  category,
  onSave,
  onUpdateCategorySchema,
  onClose,
}) => {
  const { Modal, handleOpen, handleClose, open } = useModal({ defaultOpen: false })
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [newEnumValue, setNewEnumValue] = useState<Record<string, string>>({}) // フィールドキー -> 新しいenum値

  useEffect(() => {
    if (log) {
      setFormData({ ...log.data })
      handleOpen()
    } else {
      handleClose()
    }
  }, [log,])

  if (!log || !category) return null

  const categorySchema = category.schema || {}
  const merged = mergeLogWithSchema(log, categorySchema)

  // スキーマフィールドをsortOrderでソート
  const schemaEntries = Object.entries(categorySchema)
    .filter(([, field]) => !field.hidden)
    .sort(([, a], [, b]) => (a.sortOrder || 0) - (b.sortOrder || 0))

  const handleFieldChange = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleAddEnumValue = async (fieldKey: string, newValue: string) => {
    if (!newValue.trim()) return

    const field = categorySchema[fieldKey]
    if (!field || field.displayType !== 'enum' || !field.enum) return

    // カテゴリスキーマのenumに追加
    const updatedSchema = {
      ...categorySchema,
      [fieldKey]: {
        ...field,
        enum: [...field.enum, newValue.trim()],
      },
    }

    if (onUpdateCategorySchema) {
      await onUpdateCategorySchema(category.id, updatedSchema)
    }

    // フォームデータにも追加
    handleFieldChange(fieldKey, newValue.trim())
    setNewEnumValue((prev) => ({ ...prev, [fieldKey]: '' }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(log.id, formData)
      handleClose()
      onClose()
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const renderFieldInput = (key: string, field: EnrichedSchemaField) => {
    const value = formData[key]
    const isEmpty = value === null || value === undefined || value === ''

    switch (field.displayType) {
      case 'number':
        return (
          <input
            type="number"
            value={typeof value === 'number' ? value : ''}
            onChange={(e) => handleFieldChange(key, e.target.value ? parseFloat(e.target.value) : undefined)}
            min={field.min}
            max={field.max}
            step={field.step}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )

      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => handleFieldChange(key, e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-sm text-gray-600">{value ? 'はい' : 'いいえ'}</span>
          </div>
        )

      case 'date':
      case 'datetime': {

        const dataValue = new Date(value as string)
        return (
          <input
            type={field.displayType === 'datetime' ? 'datetime-local' : 'date'}
            value={field.displayType === 'datetime' ? formatDate(dataValue, 'YYYY-MM-DDTHH:mm') : formatDate(dataValue)}


            onChange={(e) => handleFieldChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )
      }


      case 'enum':
        return (
          <div className="space-y-2">
            <select
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              {field.enum?.map((option, i) => (
                <option key={i} value={option}>
                  {getFieldLabel(field, option)}

                </option>
              ))}
            </select>
            {/* enum追加UI */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newEnumValue[key] || ''}
                onChange={(e) => setNewEnumValue((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder="新しい選択肢を追加..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={() => handleAddEnumValue(key, newEnumValue[key] || '')}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm"
                title="選択肢を追加"
              >
                <Plus className="w-4 h-4" />
                追加
              </button>
            </div>
          </div>
        )

      case 'textarea':
        return (
          <textarea
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )

      default:
        return (
          <input
            type="text"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )
    }
  }

  return (

    <C_Stack className="gap-4">
      {/* スキーマフィールド */}
      {schemaEntries.map(([key, field]) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
            {field.unit && <span className="text-gray-500 ml-1">({field.unit})</span>}
          </label>
          {field.description && (
            <p className="text-xs text-gray-500 mb-2">{field.description}</p>
          )}
          {renderFieldInput(key, field)}
        </div>
      ))}

      {/* 孤立フィールド（読み取り専用） */}
      {Object.keys(merged.orphanFields).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800 mb-2">未定義フィールド (読み取り専用)</p>
              {Object.entries(merged.orphanFields).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <label className="block text-xs font-medium text-yellow-700 mb-1">{key}</label>
                  <div className="px-3 py-2 bg-white border border-yellow-300 rounded text-sm text-gray-600">
                    {formatFieldValue({ type: 'string' }, value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* フッター */}
      <R_Stack className="justify-end gap-2 pt-4 border-t">
        <button
          onClick={handleClose}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
          disabled={isSaving}
        >
          <X className="w-4 h-4" />
          キャンセル
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          disabled={isSaving}
        >
          <Save className="w-4 h-4" />
          {isSaving ? '保存中...' : '保存'}
        </button>
      </R_Stack>
    </C_Stack>

  )
}

