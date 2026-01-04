/**
 * LifeOS アダプター層
 * スキーマとデータをUIコンポーネントが期待する形式に変換する
 */

import { EnrichedSchema, EnrichedSchemaField, ArchetypeType } from '../types'

/**
 * AttributeCard用のデータ形式
 */
export interface AttributeCardData {
  title: string
  attributes: Array<{
    label: string
    value: string | number | boolean
    type?: 'text' | 'number' | 'boolean' | 'date' | 'url'
  }>
}

/**
 * MetricTracker用のデータ形式
 */
export interface MetricTrackerData {
  title: string
  metrics: Array<{
    label: string
    value: number
    unit?: string
    min?: number
    max?: number
  }>
}

/**
 * TaskList用のデータ形式
 */
export interface TaskListData {
  title: string
  tasks: Array<{
    id: string
    label: string
    status: 'pending' | 'in-progress' | 'completed'
    priority?: 'low' | 'medium' | 'high'
  }>
}

/**
 * TimelineLog用のデータ形式
 */
export interface TimelineLogData {
  title: string
  events: Array<{
    timestamp: string
    label: string
    description?: string
  }>
}

/**
 * スキーマとデータをAttributeCard用に変換
 */
export function transformToAttributeCard(
  schema: EnrichedSchema,
  data: Record<string, unknown>,
  title: string
): AttributeCardData {
  const attributes = Object.entries(schema).map(([key, field]) => {
    const value = data[key]
    let displayValue: string | number | boolean

    // 値の型変換
    if (value === null || value === undefined) {
      displayValue = ''
    } else if (typeof value === 'boolean') {
      displayValue = value
    } else if (typeof value === 'number') {
      // 単位がある場合は付加
      displayValue = field.unit ? value : value
    } else {
      displayValue = String(value)
    }

    return {
      label: field.label || key,
      value: displayValue,
      type: mapDisplayType(field.displayType),
    }
  })

  return {
    title,
    attributes,
  }
}

/**
 * スキーマとデータをMetricTracker用に変換
 */
export function transformToMetricTracker(
  schema: EnrichedSchema,
  data: Record<string, unknown>,
  title: string
): MetricTrackerData {
  const metrics = Object.entries(schema)
    .filter(([, field]) => field.type === 'number')
    .map(([key, field]) => {
      const value = data[key]
      return {
        label: field.label || key,
        value: typeof value === 'number' ? value : 0,
        unit: field.unit,
        min: field.min,
        max: field.max,
      }
    })

  return {
    title,
    metrics,
  }
}

/**
 * スキーマとデータをTaskList用に変換
 */
export function transformToTaskList(
  schema: EnrichedSchema,
  data: Record<string, unknown>,
  title: string
): TaskListData {
  // タスク形式のデータを変換
  const titleField = data.title || data.task || data.name || title
  const statusField = data.status as string
  const priorityField = data.priority as string

  const tasks = [
    {
      id: String(data.id || Date.now()),
      label: String(titleField),
      status: mapTaskStatus(statusField),
      priority: mapTaskPriority(priorityField),
    },
  ]

  return {
    title,
    tasks,
  }
}

/**
 * スキーマとデータをTimelineLog用に変換
 */
export function transformToTimelineLog(
  schema: EnrichedSchema,
  data: Record<string, unknown>,
  title: string
): TimelineLogData {
  const timestamp = data.timestamp || data.date || data.createdAt || new Date().toISOString()
  const label = data.title || data.activity || data.event || title
  const description = data.description || data.note || data.content

  const events = [
    {
      timestamp: String(timestamp),
      label: String(label),
      description: description ? String(description) : undefined,
    },
  ]

  return {
    title,
    events,
  }
}

/**
 * Archetype別にデータを変換
 */
export function transformToArchetypeData(
  archetype: ArchetypeType,
  schema: EnrichedSchema,
  data: Record<string, unknown>,
  title: string
): AttributeCardData | MetricTrackerData | TaskListData | TimelineLogData {
  switch (archetype) {
    case 'metric-tracker':
      return transformToMetricTracker(schema, data, title)
    case 'task-list':
      return transformToTaskList(schema, data, title)
    case 'timeline-log':
      return transformToTimelineLog(schema, data, title)
    case 'attribute-card':
    case 'heatmap':
    default:
      return transformToAttributeCard(schema, data, title)
  }
}

/**
 * displayTypeをUI用の型にマッピング
 */
function mapDisplayType(
  displayType?: EnrichedSchemaField['displayType']
): 'text' | 'number' | 'boolean' | 'date' | 'url' {
  switch (displayType) {
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'date':
      return 'date'
    case 'url':
      return 'url'
    case 'enum':
    case 'text':
    default:
      return 'text'
  }
}

/**
 * タスクステータスをマッピング
 */
function mapTaskStatus(status?: string): 'pending' | 'in-progress' | 'completed' {
  if (!status) return 'pending'
  const normalized = status.toLowerCase()
  if (normalized.includes('complete') || normalized.includes('done') || normalized.includes('完了')) {
    return 'completed'
  }
  if (normalized.includes('progress') || normalized.includes('進行') || normalized.includes('着手')) {
    return 'in-progress'
  }
  return 'pending'
}

/**
 * タスク優先度をマッピング
 */
function mapTaskPriority(priority?: string): 'low' | 'medium' | 'high' | undefined {
  if (!priority) return undefined
  const normalized = priority.toLowerCase()
  if (normalized.includes('high') || normalized.includes('高')) {
    return 'high'
  }
  if (normalized.includes('low') || normalized.includes('低')) {
    return 'low'
  }
  return 'medium'
}

/**
 * 旧形式のスキーマを拡張スキーマに変換（互換性用）
 */
export function convertToEnrichedSchema(
  schema: Record<string, unknown>
): EnrichedSchema {
  const enriched: EnrichedSchema = {}

  for (const [key, value] of Object.entries(schema)) {
    if (typeof value === 'object' && value !== null) {
      const field = value as Record<string, unknown>
      enriched[key] = {
        type: (field.type as EnrichedSchemaField['type']) || 'string',
        label: (field.label as string) || formatLabel(key),
        displayType: (field.displayType as EnrichedSchemaField['displayType']) || inferDisplayType(field),
        unit: field.unit as string | undefined,
        required: field.required as boolean | undefined,
        enum: field.enum as string[] | undefined,
        min: field.min as number | undefined,
        max: field.max as number | undefined,
        description: field.description as string | undefined,
      }
    } else {
      // 単純な型の場合
      enriched[key] = {
        type: 'string',
        label: formatLabel(key),
        displayType: 'text',
      }
    }
  }

  return enriched
}

/**
 * キー名からラベルを生成
 */
function formatLabel(key: string): string {
  // camelCase/snake_caseをスペース区切りに変換
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\s+/, '')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * フィールドからdisplayTypeを推測
 */
function inferDisplayType(field: Record<string, unknown>): EnrichedSchemaField['displayType'] {
  const type = field.type as string
  if (type === 'number') return 'number'
  if (type === 'boolean') return 'boolean'
  if (type === 'date') return 'date'
  if (field.enum) return 'enum'
  return 'text'
}

