'use client'

import React from 'react'
import {Edit, AlertTriangle} from 'lucide-react'
import {DBLog, EnrichedSchema} from '../types'
import {mergeLogWithSchema, formatFieldValue, getFieldLabel} from '../lib/schemaUtils'

export interface LogTableViewProps {
  logs: DBLog[]
  onEdit?: (log: DBLog) => void
}

/**
 * ログをテーブル形式で表示するコンポーネント
 */
export const LogTableView: React.FC<LogTableViewProps> = ({logs, onEdit}) => {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
        <p className="text-gray-400">ログがありません</p>
      </div>
    )
  }

  // 最初のログからカテゴリのスキーマを取得（全ログが同じカテゴリと仮定）
  const firstLog = logs[0]
  const categorySchema = firstLog.category?.schema || {}

  // スキーマフィールドをsortOrderでソート
  const schemaEntries = Object.entries(categorySchema)
    .filter(([, field]) => !field.hidden)
    .sort(([, a], [, b]) => (a.sortOrder || 0) - (b.sortOrder || 0))

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {schemaEntries.map(([key, field]) => (
                <th
                  key={key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => {
              const merged = mergeLogWithSchema(log, categorySchema)
              const hasOrphanFields = Object.keys(merged.orphanFields).length > 0
              const hasMissingFields = merged.missingFields.length > 0

              return (
                <tr
                  key={log.id}
                  className={`hover:bg-gray-50 ${hasOrphanFields || hasMissingFields ? 'bg-yellow-50' : ''}`}
                >
                  {schemaEntries.map(([key, field]) => {
                    const fieldData = merged.definedFields[key]
                    const value = fieldData?.value
                    const isEmpty = value === null || value === undefined || value === ''

                    return (
                      <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isEmpty ? (
                          <span className="text-gray-400 italic">未入力</span>
                        ) : (
                          <span>{formatFieldValue(field, value)}</span>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {(hasOrphanFields || hasMissingFields) && (
                        <div className="flex items-center gap-1 text-yellow-600" title="未定義フィールドまたは未入力フィールドがあります">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(log)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title="編集"
                        >
                          <Edit className="w-4 h-4" />
                          編集
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 孤立フィールドの警告表示 */}
      {logs.some((log) => {
        const merged = mergeLogWithSchema(log, categorySchema)
        return Object.keys(merged.orphanFields).length > 0
      }) && (
        <div className="bg-yellow-50 border-t border-yellow-200 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">未定義フィールドの警告</p>
              <p className="text-xs">
                一部のログに、現在のスキーマに定義されていないフィールドが含まれています。
                これらは読み取り専用として表示されます。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

