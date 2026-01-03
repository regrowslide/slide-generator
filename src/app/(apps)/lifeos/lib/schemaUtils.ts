/**
 * スキーマ・データマージユーティリティ
 * ログのdataとカテゴリのスキーマを照合し、表示用データを生成
 */

import {DBLog, EnrichedSchema, MergedLogData} from '../types'

/**
 * ログとスキーマをマージして表示用データを生成
 * @param log ログデータ（schemaフィールドなし）
 * @param categorySchema カテゴリのスキーマ
 * @returns マージされたデータ
 */
export function mergeLogWithSchema(log: DBLog, categorySchema: EnrichedSchema): MergedLogData {
  const result: MergedLogData = {
    definedFields: {}, // スキーマに定義されているフィールド
    orphanFields: {}, // スキーマにないフィールド（警告表示）
    missingFields: [], // データにないフィールド（空白表示）
  }

  // スキーマのフィールドを処理（sortOrderでソート）
  const schemaEntries = Object.entries(categorySchema).sort(([, a], [, b]) => {
    return (a.sortOrder || 0) - (b.sortOrder || 0)
  })

  for (const [key, field] of schemaEntries) {
    if (field.hidden) continue // 論理削除されたフィールドはスキップ

    if (key in log.data) {
      result.definedFields[key] = {field, value: log.data[key]}
    } else {
      result.missingFields.push({key, field})
    }
  }

  // データにあってスキーマにないフィールド
  for (const [key, value] of Object.entries(log.data)) {
    if (!(key in categorySchema)) {
      result.orphanFields[key] = value
    }
  }

  return result
}

/**
 * ログのスキーマを取得（カテゴリから）
 * @param log ログデータ
 * @returns スキーマ（カテゴリがない場合は空オブジェクト）
 */
export function getLogSchema(log: DBLog): EnrichedSchema {
  return log.category?.schema || {}
}

/**
 * スキーマフィールドの表示ラベルを取得
 * @param field スキーマフィールド
 * @param value 値（enumの場合のラベル取得用）
 * @returns 表示用ラベル
 */
export function getFieldLabel(field: {label: string; enumLabels?: Record<string, string>}, value?: unknown): string {
  if (field.enumLabels && typeof value === 'string' && value in field.enumLabels) {
    return field.enumLabels[value]
  }
  return field.label
}

/**
 * フィールドの値を表示用文字列に変換
 * @param field スキーマフィールド
 * @param value 値
 * @returns 表示用文字列
 */
export function formatFieldValue(field: {type: string; unit?: string; displayType?: string}, value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  switch (field.type) {
    case 'number':
      const numValue = typeof value === 'number' ? value : parseFloat(String(value))
      if (isNaN(numValue)) return String(value)
      return field.unit ? `${numValue}${field.unit}` : String(numValue)
    case 'boolean':
      return value ? 'はい' : 'いいえ'
    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString('ja-JP')
      }
      if (typeof value === 'string') {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('ja-JP')
        }
      }
      return String(value)
    default:
      return String(value)
  }
}

