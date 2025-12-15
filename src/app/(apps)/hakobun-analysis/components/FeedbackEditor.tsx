'use client'

import React from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { AnalysisResult, HakobunCategory, ExtractEdit, SentimentType } from '../types'
import { MessageSquare, Tag, Edit3, Send, Check, AlertCircle } from 'lucide-react'

interface FeedbackEditorProps {
  result: AnalysisResult
  categories: HakobunCategory[]
  editedExtracts: ExtractEdit[]
  onUpdateExtract: (segmentId: number, extractIndex: number, updates: Partial<ExtractEdit>) => void
  onSubmitFeedback: () => void
  isSubmitting?: boolean
}

const sentimentOptions: SentimentType[] = ['好意的', '不満', '中立']

// 感情に応じた色
const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case '好意的':
      return 'border-green-500 bg-green-50'
    case '不満':
      return 'border-red-500 bg-red-50'
    default:
      return 'border-gray-500 bg-gray-50'
  }
}

export const FeedbackEditor: React.FC<FeedbackEditorProps> = ({
  result,
  categories,
  editedExtracts,
  onUpdateExtract,
  onSubmitFeedback,
  isSubmitting = false,
}) => {
  const modifiedCount = editedExtracts.filter(e => e.isModified).length

  // カテゴリをグループ化
  const categoryGroups = categories.reduce(
    (acc, cat) => {
      if (!acc[cat.generalCategory]) {
        acc[cat.generalCategory] = []
      }
      acc[cat.generalCategory].push(cat)
      return acc
    },
    {} as Record<string, HakobunCategory[]>
  )

  return (
    <C_Stack className="gap-6">
      {/* ヘッダー */}
      <R_Stack className="justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">フィードバック編集</h2>
          <p className="text-sm text-gray-500">AIの分析結果を確認し、必要に応じて修正してください</p>
        </div>
        <R_Stack className="gap-4 items-center">
          {modifiedCount > 0 && (
            <span className="flex items-center gap-1 text-sm text-orange-600">
              <Edit3 className="w-4 h-4" />
              {modifiedCount}件の修正
            </span>
          )}
          <button
            onClick={onSubmitFeedback}
            disabled={modifiedCount === 0 || isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? '送信中...' : 'フィードバック送信'}
          </button>
        </R_Stack>
      </R_Stack>

      {/* セグメント別編集 */}
      {result.segments.map(segment => (
        <div key={segment.segment_id} className="border border-gray-300 rounded-lg overflow-hidden">
          {/* セグメントヘッダー */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="font-medium text-gray-700">セグメント {segment.segment_id}</p>
            <p className="text-sm text-gray-500 mt-1">{segment.input_text}</p>
          </div>

          {/* 抽出要素編集 */}
          <C_Stack className="p-4 gap-4">
            {segment.extracts.map((extract, extractIndex) => {
              const editData = editedExtracts.find(e => e.segmentId === segment.segment_id && e.extractIndex === extractIndex)

              if (!editData) return null

              return (
                <div
                  key={extractIndex}
                  className={`p-4 rounded-lg border-2 ${editData.isModified ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white'}`}
                >
                  <C_Stack className="gap-4">
                    {/* テキストフラグメント */}
                    <R_Stack className="items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <p className="text-gray-800 font-medium">&ldquo;{extract.text_fragment}&rdquo;</p>
                      {editData.isModified && <Check className="w-4 h-4 text-orange-500" />}
                    </R_Stack>

                    {/* 現在の値 */}
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>
                        AI判定: {extract.general_category} &gt; {extract.specific_category} ({extract.sentiment})
                      </span>
                    </div>

                    {/* 編集フォーム */}
                    <R_Stack className="flex-wrap gap-4">
                      {/* カテゴリ選択 */}
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-600 mb-1">カテゴリ</label>
                        <select
                          value={editData.editedCategoryCode}
                          onChange={e => onUpdateExtract(segment.segment_id, extractIndex, { editedCategoryCode: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(categoryGroups).map(([generalCat, cats]) => (
                            <optgroup key={generalCat} label={generalCat}>
                              {cats.map(cat => (
                                <option key={cat.categoryCode} value={cat.categoryCode}>
                                  {cat.specificCategory}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                          {/* 元のカテゴリがマスターにない場合 */}
                          {!categories.find(c => c.categoryCode === extract.category_id) && (
                            <option value={extract.category_id}>
                              [元の値] {extract.specific_category}
                            </option>
                          )}
                        </select>
                      </div>

                      {/* 感情選択 */}
                      <div className="min-w-[150px]">
                        <label className="block text-xs font-medium text-gray-600 mb-1">感情</label>
                        <R_Stack className="gap-2">
                          {sentimentOptions.map(sentiment => (
                            <button
                              key={sentiment}
                              onClick={() => onUpdateExtract(segment.segment_id, extractIndex, { editedSentiment: sentiment })}
                              className={`px-3 py-2 rounded-lg text-sm border-2 transition-colors ${editData.editedSentiment === sentiment
                                  ? getSentimentColor(sentiment)
                                  : 'border-gray-200 bg-white hover:bg-gray-50'
                                }`}
                            >
                              {sentiment}
                            </button>
                          ))}
                        </R_Stack>
                      </div>
                    </R_Stack>

                    {/* コメント */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">コメント（任意）</label>
                      <input
                        type="text"
                        value={editData.comment}
                        onChange={e => onUpdateExtract(segment.segment_id, extractIndex, { comment: e.target.value })}
                        placeholder="修正理由や補足情報"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </C_Stack>
                </div>
              )
            })}
          </C_Stack>
        </div>
      ))}

      {/* 注意書き */}
      <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">フィードバックについて</p>
          <p>
            送信されたフィードバックは「修正データペア」として保存され、次回以降の分析精度向上に活用されます。
            修正した項目のみが保存されます。
          </p>
        </div>
      </div>
    </C_Stack>
  )
}
