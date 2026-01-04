/**
 * UIアーキタイプレジストリ
 * データ型とUIコンポーネントのマッピング定義
 */

import React from 'react'
import {ArchetypeType, LifeOSData} from '../../types'
import {MetricTracker} from './MetricTracker'
import {TaskList} from './TaskList'
import {TimelineLog} from './TimelineLog'
import {AttributeCard} from './AttributeCard'
import {Heatmap} from './Heatmap'

export interface ArchetypeProps {
  log: LifeOSData
}

export type ArchetypeComponent = React.ComponentType<ArchetypeProps>

/**
 * アーキタイプコンポーネントのマッピング
 */
export const archetypeRegistry: Record<ArchetypeType, ArchetypeComponent> = {
  'metric-tracker': MetricTracker,
  'task-list': TaskList,
  'timeline-log': TimelineLog,
  'attribute-card': AttributeCard,
  heatmap: Heatmap,
}

/**
 * データ型から適切なアーキタイプを取得
 */
export const getArchetype = (type: ArchetypeType): ArchetypeComponent => {
  const component = archetypeRegistry[type]
  if (!component) {
    throw new Error(`Unknown archetype type: ${type}`)
  }
  return component
}

/**
 * アーキタイプが存在するかチェック
 */
export const hasArchetype = (type: string): type is ArchetypeType => {
  return type in archetypeRegistry
}
