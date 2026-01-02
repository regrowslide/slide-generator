'use client'

import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { SentimentType, TableRow, PendingGeneralCategory, PendingCategory } from '../types'
import { Loader2, Save, Plus, Clock, Download } from 'lucide-react'
import { cn } from '@cm/shadcn/lib/utils'

/** 分析結果テーブル */
export interface ResultsTableProps {
  tableRows: TableRow[]
  results: { extracts: { general_category: string; category: string }[] }[]
  mergedGeneralCategories: {
    id: number
    name: string
    categories: { id: number; name: string }[]
  }[]
  categoryDiff: {
    newGeneralCategories: string[]
    newCategories: string[]
  }
  pendingGeneralCategories: PendingGeneralCategory[]
  pendingCategories: PendingCategory[]
  isSavingAll: boolean
  isNewGeneratedGeneralCategory: (name: string) => boolean
  isNewGeneratedCategory: (name: string) => boolean
  isPendingGeneralCategory: (name: string) => boolean
  isPendingCategory: (name: string) => boolean
  getSentimentColor: (sentiment: SentimentType) => string
  updateTableRow: (rowIndex: number, updates: Partial<TableRow>) => void
  onSaveAll: () => void
  onOpenModal: (type: 'general' | 'category', rowIndex: number, initialName?: string) => void
  canExportCsv: boolean
  onExportCsv: () => void
  /** 個別保存（閲覧ページで使用） */
  onSaveRow?: (rowIndex: number) => void
}

export function ResultsTable({
  tableRows,
  results,
  mergedGeneralCategories,
  categoryDiff,
  pendingGeneralCategories,
  pendingCategories,
  isSavingAll,
  isNewGeneratedGeneralCategory,
  isNewGeneratedCategory,
  isPendingGeneralCategory,
  isPendingCategory,
  getSentimentColor,
  updateTableRow,
  onSaveAll,
  onOpenModal,
  canExportCsv,
  onExportCsv,
  onSaveRow,
}: ResultsTableProps) {
  const hasPendingItems = pendingGeneralCategories.length > 0 || pendingCategories.length > 0
  const hasNewItems = categoryDiff.newGeneralCategories.length > 0 || categoryDiff.newCategories.length > 0

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <R_Stack className="justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">
            分析結果とフィードバック ({tableRows.length}行)
            {tableRows.filter((r) => r.isModified).length > 0 && (
              <span className="ml-2 text-sm font-normal text-yellow-600">
                ({tableRows.filter((r) => r.isModified).length}件の変更あり)
              </span>
            )}
            {tableRows.filter((r) => r.isModified).length === 0 && tableRows.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                (全てのレコードを保存します)
              </span>
            )}
          </h2>
          <R_Stack className="gap-2">
            {canExportCsv && (
              <button
                onClick={onExportCsv}
                className="px-6 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                CSVエクスポート
              </button>
            )}
            <button
              onClick={onSaveAll}
              disabled={isSavingAll || tableRows.length === 0}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                !isSavingAll && tableRows.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSavingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  一括保存
                </>
              )}
            </button>
          </R_Stack>
        </R_Stack>

        {/* 保留中カテゴリ凡例 */}
        {hasPendingItems && (
          <div className="mt-3 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
            <p className="text-sm font-medium text-cyan-800 mb-2 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              保留中のカテゴリ（一括保存時にDBに登録されます）
            </p>
            <div className="flex flex-wrap gap-2">
              {pendingGeneralCategories.map((pgc) => (
                <span
                  key={`pgc-${pgc.tempId}`}
                  className="px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-800 border-2 border-cyan-500 rounded-full"
                >
                  一般: {pgc.name}
                </span>
              ))}
              {pendingCategories.map((pc) => (
                <span
                  key={`pc-${pc.tempId}`}
                  className="px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 border-2 border-teal-400 rounded-full"
                >
                  カテゴリ: {pc.name} ({pc.generalCategoryName})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI新規生成カテゴリ凡例 */}
        {hasNewItems && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-800 mb-2">
              ✨ AI分析で新規生成されたカテゴリ（DB未登録・保留中にも未追加）
            </p>
            <div className="flex flex-wrap gap-2">
              {categoryDiff.newGeneralCategories.map((name) => (
                <span
                  key={`gc-${name}`}
                  className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 border-2 border-yellow-500 rounded-full"
                >
                  一般: {name}
                </span>
              ))}
              {categoryDiff.newCategories.map((name) => (
                <span
                  key={`c-${name}`}
                  className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 border-2 border-purple-400 rounded-full"
                >
                  カテゴリ: {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* テーブル */}
      <div
        className={cn(
          '[&_th]:p-2',
          '[&_td]:p-2',
          '[&_td]:min-w-[120px]',
          'overflow-x-auto'
        )}
      >
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[200px]">
                原文
              </th>
              <th className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[150px]">
                トピック単位
              </th>
              <th className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                一般カテゴリ
              </th>
              <th className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                カテゴリ
              </th>
              <th className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                感情
              </th>
              <th className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r-2 border-gray-300">
                熱量
              </th>
              <th className="text-left text-xs font-medium text-blue-700 uppercase tracking-wider border-l-2 border-blue-300 bg-blue-50">
                修正一般カテゴリ
              </th>
              <th className="text-left text-xs font-medium text-blue-700 uppercase tracking-wider bg-blue-50">
                修正カテゴリ
              </th>
              <th className="text-left text-xs font-medium text-blue-700 uppercase tracking-wider bg-blue-50">
                修正感情
              </th>
              <th className="text-left text-xs font-medium text-blue-700 uppercase tracking-wider bg-blue-50">
                コメント
              </th>
              {/* 個別保存ボタン列（閲覧ページで使用） */}
              {onSaveRow && (
                <th className="text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[80px]">
                  操作
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableRows.map((row, rowIndex) => (
              <ResultRow
                key={`${row.resultIndex}-${row.extractIndex}`}
                row={row}
                rowIndex={rowIndex}
                results={results}
                mergedGeneralCategories={mergedGeneralCategories}
                isNewGeneratedGeneralCategory={isNewGeneratedGeneralCategory}
                isNewGeneratedCategory={isNewGeneratedCategory}
                isPendingGeneralCategory={isPendingGeneralCategory}
                isPendingCategory={isPendingCategory}
                getSentimentColor={getSentimentColor}
                updateTableRow={updateTableRow}
                onOpenModal={onOpenModal}
                onSaveRow={onSaveRow}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** テーブル行 */
interface ResultRowProps {
  row: TableRow
  rowIndex: number
  results: { extracts: { general_category: string; category: string }[] }[]
  mergedGeneralCategories: {
    id: number
    name: string
    categories: { id: number; name: string }[]
  }[]
  isNewGeneratedGeneralCategory: (name: string) => boolean
  isNewGeneratedCategory: (name: string) => boolean
  isPendingGeneralCategory: (name: string) => boolean
  isPendingCategory: (name: string) => boolean
  getSentimentColor: (sentiment: SentimentType) => string
  updateTableRow: (rowIndex: number, updates: Partial<TableRow>) => void
  onOpenModal: (type: 'general' | 'category', rowIndex: number, initialName?: string) => void
  onSaveRow?: (rowIndex: number) => void
}

function ResultRow({
  row,
  rowIndex,
  results,
  mergedGeneralCategories,
  isNewGeneratedGeneralCategory,
  isNewGeneratedCategory,
  isPendingGeneralCategory,
  isPendingCategory,
  getSentimentColor,
  updateTableRow,
  onOpenModal,
  onSaveRow,
}: ResultRowProps) {
  const isNewGC = isNewGeneratedGeneralCategory(row.extract.general_category)
  const isNewC = isNewGeneratedCategory(row.extract.category)
  const isPendingGC = isPendingGeneralCategory(row.extract.general_category)
  const isPendingC = isPendingCategory(row.extract.category)

  return (
    <tr className={row.isModified ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
      {/* 原文 */}
      <td className="text-sm text-gray-900 border-r border-gray-200 max-w-[250px]">
        <div className="break-words text-gray-500 text-xs leading-relaxed">
          {row.extract.raw_text || '-'}
        </div>
      </td>

      {/* トピック単位 */}
      <td className="text-sm text-gray-900 border-r border-gray-200 max-w-[200px]">
        <div className="break-words font-medium">{row.extract.sentence}</div>
      </td>

      {/* 一般カテゴリ（AI分析結果） - 新規/保留中はハイライト */}
      <td className="text-sm border-r border-gray-200">
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            isNewGC
              ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500 animate-pulse'
              : isPendingGC
                ? 'bg-cyan-100 text-cyan-800 border-2 border-cyan-500'
                : 'bg-gray-100 text-gray-700'
          )}
        >
          {isNewGC && '✨ '}
          {isPendingGC && '⏳ '}
          {row.extract.general_category || 'その他'}
        </span>
      </td>

      {/* カテゴリ（AI分析結果） - 新規/保留中はハイライト */}
      <td className="text-sm border-r border-gray-200">
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            isNewC
              ? 'bg-purple-100 text-purple-800 border-2 border-purple-400 animate-pulse'
              : isPendingC
                ? 'bg-teal-100 text-teal-800 border-2 border-teal-400'
                : 'bg-blue-100 text-blue-800'
          )}
        >
          {isNewC && '✨ '}
          {isPendingC && '⏳ '}
          {row.extract.category}
        </span>
      </td>

      {/* 感情 */}
      <td className="text-sm border-r border-gray-200">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(
            row.extract.sentiment
          )}`}
        >
          {row.extract.sentiment}
        </span>
      </td>

      {/* 熱量 */}
      <td className="text-sm border-r-2 border-gray-300">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${row.extract.magnitude}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 w-8 text-right">{row.extract.magnitude}</span>
        </div>
      </td>

      {/* 修正一般カテゴリ */}
      <td
        className={cn(
          'text-sm border-l-2 border-blue-300',
          row.feedbackGeneralCategory !== (row.extract.general_category || 'その他')
            ? 'bg-blue-50'
            : 'bg-gray-50'
        )}
      >
        <div className="flex items-center gap-1">
          <select
            value={row.feedbackGeneralCategory}
            onChange={(e) => updateTableRow(rowIndex, { feedbackGeneralCategory: e.target.value })}
            className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {mergedGeneralCategories.map((gc) => (
              <option key={gc.id} value={gc.name}>
                {gc.id < 0 ? `⏳ ${gc.name} (保留中)` : gc.name}
              </option>
            ))}
            {mergedGeneralCategories.length === 0 && (
              <>
                <option value="接客・サービス">接客・サービス</option>
                <option value="店内">店内</option>
                <option value="料理・ドリンク">料理・ドリンク</option>
                <option value="備品・設備">備品・設備</option>
                <option value="値段">値段</option>
                <option value="立地">立地</option>
                <option value="その他">その他</option>
              </>
            )}
          </select>
          <button
            onClick={() => onOpenModal('general', rowIndex)}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
            title="新規一般カテゴリを追加"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </td>

      {/* 修正カテゴリ */}
      <td
        className={cn(
          'text-sm',
          row.feedbackCategory !== row.extract.category ? 'bg-blue-50' : 'bg-gray-50'
        )}
      >
        <div className="flex items-center gap-1">
          {row.extract.is_new_generated && (
            <span className="text-purple-600 font-bold text-xs" title="新規生成カテゴリ">
              ✨
            </span>
          )}
          <select
            value={row.feedbackCategory}
            onChange={(e) => updateTableRow(rowIndex, { feedbackCategory: e.target.value })}
            className={cn(
              'flex-1 text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white',
              row.extract.is_new_generated ? 'border-purple-400 border-2 bg-purple-50' : 'border-gray-300'
            )}
          >
            <option value="">選択してください</option>
            {/* 選択中の一般カテゴリに紐づく既存カテゴリ（DB + 保留中） */}
            {mergedGeneralCategories
              .find((gc) => gc.name === row.feedbackGeneralCategory)
              ?.categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.id < 0 ? `⏳ ${cat.name} (保留中)` : cat.name}
                </option>
              ))}
            {/* 選択中の一般カテゴリに紐づく新規カテゴリ（AI生成） */}
            {results
              .flatMap((result) => result.extracts)
              .filter((extract) => extract.general_category === row.feedbackGeneralCategory)
              .map((extract) => extract.category)
              .filter((category, index, self) => self.indexOf(category) === index)
              .filter((category) => {
                const generalCategory = mergedGeneralCategories.find(
                  (gc) => gc.name === row.feedbackGeneralCategory
                )
                return !generalCategory?.categories.some((c) => c.name === category)
              })
              .map((category, i) => (
                <option key={`new-${i}`} value={category}>
                  ✨ {category} (AI生成)
                </option>
              ))}
          </select>
          <button
            onClick={() => onOpenModal('category', rowIndex, row.feedbackCategory)}
            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
            title="新規詳細カテゴリを追加"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </td>

      {/* 修正感情 */}
      <td
        className={cn(
          'text-sm',
          row.feedbackSentiment !== row.extract.sentiment ? 'bg-blue-50' : 'bg-gray-50'
        )}
      >
        <select
          value={row.feedbackSentiment}
          onChange={(e) =>
            updateTableRow(rowIndex, { feedbackSentiment: e.target.value as SentimentType })
          }
          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="好意的">好意的</option>
          <option value="不満">不満</option>
          <option value="リクエスト">リクエスト</option>
          <option value="その他">その他</option>
        </select>
      </td>

      {/* コメント */}
      <td
        className={cn(
          'text-sm min-w-[400px]',
          row.feedbackComment.trim() !== '' ? 'bg-blue-50' : 'bg-gray-50'
        )}
      >
        <textarea
          value={row.feedbackComment}
          onChange={(e) => updateTableRow(rowIndex, { feedbackComment: e.target.value })}
          placeholder="コメント（任意）"
          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-y"
          rows={2}
        />
      </td>

      {/* 個別保存ボタン（閲覧ページで使用） */}
      {onSaveRow && (
        <td className="text-sm bg-gray-50">
          {row.isModified && row.correctionId && (
            <button
              onClick={() => onSaveRow(rowIndex)}
              className="px-3 py-1 text-xs font-medium rounded transition-colors bg-blue-600 text-white hover:bg-blue-700"
              title="この行を保存"
            >
              保存
            </button>
          )}
        </td>
      )}
    </tr>
  )
}

