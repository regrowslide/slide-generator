'use client'

import React, {useState} from 'react'
import {Plus, Trash2, GripVertical, ChevronDown, ChevronUp} from 'lucide-react'
import {EnrichedSchema, EnrichedSchemaField} from '../types'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

export interface SchemaFieldEditorProps {
  schema: EnrichedSchema
  onChange: (schema: EnrichedSchema) => void
}

/**
 * スキーマフィールドエディタコンポーネント
 * カテゴリマスタのスキーマ編集用
 */
export const SchemaFieldEditor: React.FC<SchemaFieldEditorProps> = ({schema, onChange}) => {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set())

  const toggleFieldExpansion = (key: string) => {
    const newExpanded = new Set(expandedFields)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedFields(newExpanded)
  }

  const addField = () => {
    const newKey = `field_${Date.now()}`
    const newField: EnrichedSchemaField = {
      type: 'string',
      label: '新しいフィールド',
      displayType: 'text',
      sortOrder: Object.keys(schema).length,
      required: false,
    }
    onChange({...schema, [newKey]: newField})
    setExpandedFields(new Set([...expandedFields, newKey]))
  }

  const removeField = (key: string) => {
    if (!confirm('このフィールドを削除しますか？')) return
    const newSchema = {...schema}
    // 論理削除（hiddenフラグを設定）
    if (newSchema[key]) {
      newSchema[key] = {...newSchema[key], hidden: true}
    }
    onChange(newSchema)
  }

  const updateField = (key: string, updates: Partial<EnrichedSchemaField>) => {
    const newSchema = {...schema}
    newSchema[key] = {...newSchema[key], ...updates}
    onChange(newSchema)
  }

  const moveField = (key: string, direction: 'up' | 'down') => {
    const entries = Object.entries(schema)
      .filter(([, field]) => !field.hidden)
      .sort(([, a], [, b]) => (a.sortOrder || 0) - (b.sortOrder || 0))

    const index = entries.findIndex(([k]) => k === key)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= entries.length) return

    const newEntries = [...entries]
    ;[newEntries[index], newEntries[newIndex]] = [newEntries[newIndex], newEntries[index]]

    // sortOrderを更新
    const updatedSchema = {...schema}
    newEntries.forEach(([k], i) => {
      updatedSchema[k] = {...updatedSchema[k], sortOrder: i}
    })
    onChange(updatedSchema)
  }

  const schemaEntries = Object.entries(schema)
    .filter(([, field]) => !field.hidden)
    .sort(([, a], [, b]) => (a.sortOrder || 0) - (b.sortOrder || 0))

  return (
    <C_Stack className="gap-4">
      <R_Stack className="justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">スキーマフィールド</h3>
        <button
          onClick={addField}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          フィールド追加
        </button>
      </R_Stack>

      {schemaEntries.length === 0 ? (
        <div className="text-center py-8 text-gray-400 border border-gray-200 rounded-lg">
          フィールドがありません。追加ボタンからフィールドを追加してください。
        </div>
      ) : (
        <C_Stack className="gap-2">
          {schemaEntries.map(([key, field], index) => (
            <div key={key} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => toggleFieldExpansion(key)}
                  className="flex-1 flex items-center gap-2 text-left"
                >
                  {expandedFields.has(key) ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="font-medium text-gray-900">{field.label}</span>
                  <span className="text-xs text-gray-500">({field.type})</span>
                  {field.required && <span className="text-xs text-red-500">必須</span>}
                </button>
                <R_Stack className="gap-1">
                  <button
                    onClick={() => moveField(key, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="上へ移動"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveField(key, 'down')}
                    disabled={index === schemaEntries.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="下へ移動"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeField(key)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </R_Stack>
              </div>

              {expandedFields.has(key) && (
                <div className="mt-4 space-y-3 pl-6 border-l-2 border-gray-200">
                  {/* フィールドキー */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">フィールドキー</label>
                    <input
                      type="text"
                      value={key}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>

                  {/* ラベル */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      ラベル <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(key, {label: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* 型 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        データ型 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) => updateField(key, {type: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="string">文字列</option>
                        <option value="number">数値</option>
                        <option value="boolean">真偽値</option>
                        <option value="date">日付</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        表示タイプ <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={field.displayType}
                        onChange={(e) => updateField(key, {displayType: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="text">テキスト</option>
                        <option value="textarea">テキストエリア</option>
                        <option value="number">数値</option>
                        <option value="boolean">チェックボックス</option>
                        <option value="date">日付</option>
                        <option value="datetime">日時</option>
                        <option value="url">URL</option>
                        <option value="email">メール</option>
                        <option value="enum">選択肢</option>
                        <option value="rating">評価</option>
                      </select>
                    </div>
                  </div>

                  {/* 必須 */}
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={field.required || false}
                        onChange={(e) => updateField(key, {required: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-xs font-medium text-gray-700">必須項目</span>
                    </label>
                  </div>

                  {/* 説明 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">説明</label>
                    <textarea
                      value={field.description || ''}
                      onChange={(e) => updateField(key, {description: e.target.value || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      rows={2}
                    />
                  </div>

                  {/* 数値型オプション */}
                  {field.type === 'number' && (
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">単位</label>
                        <input
                          type="text"
                          value={field.unit || ''}
                          onChange={(e) => updateField(key, {unit: e.target.value || undefined})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="ページ、km等"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">最小値</label>
                        <input
                          type="number"
                          value={field.min || ''}
                          onChange={(e) => updateField(key, {min: e.target.value ? parseFloat(e.target.value) : undefined})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">最大値</label>
                        <input
                          type="number"
                          value={field.max || ''}
                          onChange={(e) => updateField(key, {max: e.target.value ? parseFloat(e.target.value) : undefined})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* enum型オプション */}
                  {field.displayType === 'enum' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">選択肢</label>
                      <EnumEditor
                        enumValues={field.enum || []}
                        enumLabels={field.enumLabels || {}}
                        onChange={(enumValues, enumLabels) =>
                          updateField(key, {enum: enumValues, enumLabels})
                        }
                      />
                    </div>
                  )}

                  {/* プレースホルダー */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">プレースホルダー</label>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(key, {placeholder: e.target.value || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </C_Stack>
      )}
    </C_Stack>
  )
}

/**
 * enum選択肢エディタ
 */
const EnumEditor: React.FC<{
  enumValues: string[]
  enumLabels: Record<string, string>
  onChange: (enumValues: string[], enumLabels: Record<string, string>) => void
}> = ({enumValues, enumLabels, onChange}) => {
  const [newValue, setNewValue] = useState('')
  const [newLabel, setNewLabel] = useState('')

  const addEnum = () => {
    if (!newValue.trim()) return
    const updatedValues = [...enumValues, newValue.trim()]
    const updatedLabels = {...enumLabels}
    if (newLabel.trim()) {
      updatedLabels[newValue.trim()] = newLabel.trim()
    }
    onChange(updatedValues, updatedLabels)
    setNewValue('')
    setNewLabel('')
  }

  const removeEnum = (value: string) => {
    const updatedValues = enumValues.filter((v) => v !== value)
    const updatedLabels = {...enumLabels}
    delete updatedLabels[value]
    onChange(updatedValues, updatedLabels)
  }

  const updateLabel = (value: string, label: string) => {
    const updatedLabels = {...enumLabels}
    if (label.trim()) {
      updatedLabels[value] = label.trim()
    } else {
      delete updatedLabels[value]
    }
    onChange(enumValues, updatedLabels)
  }

  return (
    <C_Stack className="gap-2">
      {enumValues.map((value) => (
        <div key={value} className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            disabled
            className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 text-sm"
          />
          <input
            type="text"
            value={enumLabels[value] || ''}
            onChange={(e) => updateLabel(value, e.target.value)}
            placeholder="表示ラベル（任意）"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={() => removeEnum(value)}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="新しい選択肢の値"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          onKeyPress={(e) => e.key === 'Enter' && addEnum()}
        />
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="表示ラベル（任意）"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          onKeyPress={(e) => e.key === 'Enter' && addEnum()}
        />
        <button
          onClick={addEnum}
          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm"
        >
          <Plus className="w-4 h-4" />
          追加
        </button>
      </div>
    </C_Stack>
  )
}

