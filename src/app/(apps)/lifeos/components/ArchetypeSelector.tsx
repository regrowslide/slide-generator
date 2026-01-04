'use client'

import React from 'react'
import {Plus, Trash2} from 'lucide-react'
import {ArchetypeType} from '../types'
import {C_Stack} from '@cm/components/styles/common-components/common-components'

export interface ArchetypeSelectorProps {
  archetypes: ArchetypeType[]
  onChange: (archetypes: ArchetypeType[]) => void
}

const ALL_ARCHETYPES: ArchetypeType[] = [
  'metric-tracker',
  'task-list',
  'timeline-log',
  'attribute-card',
  'heatmap',
]

/**
 * アーキタイプ選択コンポーネント
 * カテゴリマスタのarchetypes編集用
 */
export const ArchetypeSelector: React.FC<ArchetypeSelectorProps> = ({archetypes, onChange}) => {
  const addArchetype = (archetype: ArchetypeType) => {
    if (!archetypes.includes(archetype)) {
      onChange([...archetypes, archetype])
    }
  }

  const removeArchetype = (archetype: ArchetypeType) => {
    onChange(archetypes.filter(a => a !== archetype))
  }

  const availableArchetypes = ALL_ARCHETYPES.filter(a => !archetypes.includes(a))

  return (
    <C_Stack className="gap-3">
      <label className="block text-sm font-medium text-gray-700">アーキタイプ</label>

      {/* 選択済みアーキタイプ */}
      {archetypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {archetypes.map((archetype) => (
            <div
              key={archetype}
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
            >
              <span>{archetype}</span>
              <button
                onClick={() => removeArchetype(archetype)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="削除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 追加可能なアーキタイプ */}
      {availableArchetypes.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">追加可能なアーキタイプ</label>
          <div className="flex flex-wrap gap-2">
            {availableArchetypes.map((archetype) => (
              <button
                key={archetype}
                onClick={() => addArchetype(archetype)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {archetype}
              </button>
            ))}
          </div>
        </div>
      )}

      {archetypes.length === 0 && (
        <p className="text-sm text-gray-500">アーキタイプが選択されていません。上記から追加してください。</p>
      )}
    </C_Stack>
  )
}

