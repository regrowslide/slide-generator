'use client'

import React from 'react'
import {Table, LayoutGrid} from 'lucide-react'
import { R_Stack} from '@cm/components/styles/common-components/common-components'

export type ViewMode = 'table' | 'archetype'

export interface ViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  className?: string
}

/**
 * テーブルビュー/アーキタイプビュー切替コンポーネント
 */
export const ViewToggle: React.FC<ViewToggleProps> = ({viewMode, onViewModeChange, className}) => {
  return (
    <R_Stack className={`gap-2 ${className || ''}`}>
      <button
        onClick={() => onViewModeChange('table')}
        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
          viewMode === 'table'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title="テーブルビュー"
      >
        <Table className="w-4 h-4" />
        テーブル
      </button>
      <button
        onClick={() => onViewModeChange('archetype')}
        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
          viewMode === 'archetype'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title="アーキタイプビュー"
      >
        <LayoutGrid className="w-4 h-4" />
        アーキタイプ
      </button>
    </R_Stack>
  )
}

