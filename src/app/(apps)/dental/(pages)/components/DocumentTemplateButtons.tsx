'use client'

import { DOCUMENT_TEMPLATES } from '@app/(apps)/dental/lib/constants'
import type { DocumentRequirement } from '@app/(apps)/dental/lib/types'
import type { SavedTemplateStatus } from '@app/(apps)/dental/_actions/saved-document-actions'

type Variant = 'sidebar' | 'grid' | 'inline'

type Props = {
  /** calculateDocumentRequirementsの結果 */
  docRequirements: Record<string, DocumentRequirement>
  /** 保存済みテンプレートの状態 */
  savedTemplateStatuses?: SavedTemplateStatus[]
  /** 現在選択中のtemplateId（sidebarバリアントで使用） */
  selectedType?: string
  /** ボタンクリック時のコールバック */
  onSelect: (templateId: string) => void
  /** 表示バリアント */
  variant?: Variant
  /** 必要文書のみ表示するか */
  requiredOnly?: boolean
  /** 操作不可 */
  disabled?: boolean
}

/** 3状態バッジ: DL済 > 清書済 > 下書き */
const StatusBadge = ({ status, compact = false }: { status: SavedTemplateStatus | undefined; compact?: boolean }) => {
  if (!status) return null
  if (status.downloadedAt) {
    return <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-bold text-green-600 bg-green-100 px-1 rounded`}>DL</span>
  }
  if (status.pdfUrl) {
    return <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-bold text-blue-600 bg-blue-100 px-1 rounded`}>PDF</span>
  }
  return <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} text-gray-500`}>✓</span>
}

/**
 * 文書テンプレートボタン共通コンポーネント
 * バッジで3状態を表示: 下書き(✓) / 清書済(PDF) / DL済(DL)
 */
const DocumentTemplateButtons = ({
  docRequirements,
  savedTemplateStatuses = [],
  selectedType,
  onSelect,
  variant = 'grid',
  requiredOnly = false,
  disabled = false,
}: Props) => {
  const entries = Object.entries(DOCUMENT_TEMPLATES)
  const filtered = requiredOnly
    ? entries.filter(([key]) => docRequirements[key]?.required)
    : entries

  if (filtered.length === 0) return null

  const getStatus = (key: string) => savedTemplateStatuses.find(s => s.templateId === key)

  // サイドバー: document-create用の縦並びナビ
  if (variant === 'sidebar') {
    return (
      <div className="flex flex-col gap-1">
        {filtered.map(([key, tpl]) => {
          const isRequired = docRequirements[key]?.required
          const status = getStatus(key)
          const isSelected = selectedType === key
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              disabled={disabled}
              className={[
                'text-left px-2 py-2 rounded text-xs transition-colors',
                isSelected
                  ? 'bg-blue-600 text-white font-bold'
                  : isRequired
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-semibold'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100',
                disabled ? 'cursor-default' : '',
              ].join(' ')}
            >
              <span className="flex items-center gap-1 leading-tight">
                {isSelected
                  ? status && <span className="text-white text-[10px]">{status.downloadedAt ? 'DL' : status.pdfUrl ? 'PDF' : '✓'}</span>
                  : <StatusBadge status={status} compact />
                }
                {tpl.name}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  // インライン: visit-detail用の横並び小ボタン
  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-1">
        {filtered.map(([key, tpl]) => {
          const status = getStatus(key)
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              disabled={disabled}
              className="px-2 py-0.5 text-xs rounded border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1"
            >
              <StatusBadge status={status} compact />
              {tpl.name}
            </button>
          )
        })}
      </div>
    )
  }

  // grid: consultation用のカード型ボタン
  return (
    <div className="flex flex-wrap gap-3">
      {filtered.map(([key, tpl]) => {
        const isRequired = docRequirements[key]?.required
        const status = getStatus(key)
        return (
          <div key={key} className={`flex flex-col items-start gap-1 ${!isRequired ? 'opacity-50' : ''}`}>
            <button
              onClick={() => onSelect(key)}
              disabled={disabled}
              className={[
                'flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all',
                isRequired
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-gray-300 bg-gray-50 text-gray-500',
                disabled ? 'cursor-default' : 'cursor-pointer',
              ].join(' ')}
            >
              <StatusBadge status={status} />
              {isRequired && !status && <span className="text-emerald-600">*</span>}
              <span className="font-medium text-sm">{tpl.name}</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default DocumentTemplateButtons
