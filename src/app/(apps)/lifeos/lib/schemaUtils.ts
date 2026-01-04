/**
 * スキーマ・データマージユーティリティ
 * ログのdataとカテゴリのスキーマを照合し、表示用データを生成
 */

import {DBLog, EnrichedSchema, MergedLogData, EnrichedSchemaField} from '../types'

/**
 * スキーマ変更の検出結果
 */
export interface SchemaChange {
  newFields: Record<string, EnrichedSchemaField> // 新規フィールド
  updatedFields: Record<string, {old: EnrichedSchemaField; new: EnrichedSchemaField}> // 更新されたフィールド（enum追加等）
  hasChanges: boolean // 変更があるかどうか
}

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

/**
 * 既存スキーマとAI抽出スキーマの差分を検出
 * @param existingSchema 既存カテゴリのスキーマ
 * @param extractedSchema AIが抽出したスキーマ
 * @returns スキーマ変更情報
 */
export function detectSchemaChanges(existingSchema: EnrichedSchema, extractedSchema: EnrichedSchema): SchemaChange {
  const result: SchemaChange = {
    newFields: {},
    updatedFields: {},
    hasChanges: false,
  }

  // 新規フィールドの検出
  for (const [key, field] of Object.entries(extractedSchema)) {
    if (!(key in existingSchema)) {
      result.newFields[key] = field
      result.hasChanges = true
    }
  }

  // 更新されたフィールドの検出（主にenumの追加）
  for (const [key, existingField] of Object.entries(existingSchema)) {
    if (key in extractedSchema) {
      const extractedField = extractedSchema[key]

      // enumフィールドの場合、選択肢の追加を検出
      if (
        existingField.displayType === 'enum' &&
        extractedField.displayType === 'enum' &&
        existingField.enum &&
        extractedField.enum
      ) {
        const existingEnumSet = new Set(existingField.enum)
        const extractedEnumSet = new Set(extractedField.enum)
        const newEnumValues = extractedField.enum.filter(val => !existingEnumSet.has(val))

        if (newEnumValues.length > 0) {
          // enumに新しい選択肢が追加されている
          result.updatedFields[key] = {
            old: existingField,
            new: extractedField,
          }
          result.hasChanges = true
        }
      }

      // その他のフィールドメタデータの変更も検出（label, unit, description等）
      // ただし、既存スキーマを優先するため、ここでは検出のみ
    }
  }

  return result
}

/**
 * 既存スキーマに新規フィールドをマージ
 * @param existingSchema 既存スキーマ
 * @param newFields 新規フィールド
 * @param updatedFields 更新されたフィールド
 * @returns マージされたスキーマ
 */
export function mergeSchemaFields(
  existingSchema: EnrichedSchema,
  newFields: Record<string, EnrichedSchemaField>,
  updatedFields?: Record<string, {old: EnrichedSchemaField; new: EnrichedSchemaField}>
): EnrichedSchema {
  const merged = {...existingSchema}

  // 新規フィールドを追加
  for (const [key, field] of Object.entries(newFields)) {
    // sortOrderが設定されていない場合、既存フィールドの最大値+1を設定
    if (field.sortOrder === undefined) {
      const maxSortOrder = Math.max(
        ...Object.values(merged)
          .map(f => f.sortOrder || 0)
          .concat([-1])
      )
      field.sortOrder = maxSortOrder + 1
    }
    merged[key] = field
  }

  // 更新されたフィールドをマージ（主にenumの追加）
  if (updatedFields) {
    for (const [key, {old, new: newField}] of Object.entries(updatedFields)) {
      if (key in merged) {
        // enumフィールドの場合、既存の選択肢に新しい選択肢を追加
        if (old.displayType === 'enum' && newField.displayType === 'enum' && old.enum && newField.enum) {
          const existingEnumSet = new Set(old.enum)
          const newEnumValues = newField.enum.filter(val => !existingEnumSet.has(val))
          merged[key] = {
            ...old,
            enum: [...old.enum, ...newEnumValues],
            enumLabels: {
              ...old.enumLabels,
              ...newField.enumLabels,
            },
          }
        } else {
          // その他の更新は新しいフィールドで上書き（ただし既存のメタデータを優先）
          merged[key] = {
            ...old,
            ...newField,
            sortOrder: old.sortOrder, // sortOrderは既存を維持
          }
        }
      }
    }
  }

  return merged
}
