'use client'

import React from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { AnalysisResult, HakobunCategory, ExtractEdit, SentimentType } from '../types'
import { MessageSquare, Edit3, Send, Check, AlertCircle, Flame } from 'lucide-react'

interface FeedbackEditorProps {
  result: AnalysisResult
  categories: HakobunCategory[]
  editedExtracts: ExtractEdit[]
  onUpdateExtract: (extractIndex: number, updates: Partial<ExtractEdit>) => void
  onSubmitFeedback: () => void
  isSubmitting?: boolean
}

const sentimentOptions: SentimentType[] = ['好意的', '不満', 'リクエスト']

// 感情に応じた色
const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case '好意的':
      return 'border-green-500 bg-green-50'
    case '不満':
      return 'border-red-500 bg-red-50'
    case 'リクエスト':
      return 'border-blue-500 bg-blue-50'
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

  // ユニークなカテゴリ名のリスト（既存のカテゴリ選択肢として）
  const uniqueCategories = Array.from(new Set(categories.map(c => c.specificCategory)))

  return (
    <C_Stack className="gap-6">
      {/* ヘッダー */}
      <R_Stack className="justify-between items-center flex-wrap gap-4">
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

      {/* 抽出要素編集 */}
      <C_Stack className="gap-4">
        {result.extracts.map((extract, extractIndex) => {
          const editData = editedExtracts.find(e => e.extractIndex === extractIndex)

          if (!editData) return null

          return (
            <div
              key={extractIndex}
              className={`p-4 rounded-lg border-2 ${editData.isModified ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white'}`}
            >
              <C_Stack className="gap-4">
                {/* ヘッダー */}
                <R_Stack className="items-center justify-between flex-wrap gap-2">
                  <R_Stack className="items-center gap-2">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm font-bold">
                      {extractIndex + 1}
                    </div>
                    {editData.isModified && (
                      <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                        <Check className="w-3 h-3" />
                        修正あり
                      </span>
                    )}
                  </R_Stack>

                  {/* 熱量表示 */}
                  <R_Stack className="items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600">熱量: {extract.magnitude}</span>
                  </R_Stack>
                </R_Stack>

                {/* 文節テキスト */}
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-800">{extract.sentence}</p>
                </div>

                {/* 現在のAI判定 */}
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    AI判定: {extract.category} / {extract.sentiment} / {extract.posi_nega}
                  </span>
                </div>

                {/* 編集フォーム */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* カテゴリ入力 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">カテゴリ名（10〜16文字）</label>
                    <input
                      type="text"
                      value={editData.editedCategory}
                      onChange={e => onUpdateExtract(extractIndex, { editedCategory: e.target.value })}
                      placeholder="カテゴリ名を入力"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      list={`category-suggestions-${extractIndex}`}
                    />
                    <datalist id={`category-suggestions-${extractIndex}`}>
                      {uniqueCategories.map((cat, i) => (
                        <option key={i} value={cat} />
                      ))}
                    </datalist>
                    <p className="text-xs text-gray-400 mt-1">
                      現在: {editData.editedCategory.length}文字
                      {editData.editedCategory.length < 10 && ' （短すぎます）'}
                      {editData.editedCategory.length > 16 && ' （長すぎます）'}
                    </p>
                  </div>

                  {/* 感情選択 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">感情</label>
                    <R_Stack className="gap-2 flex-wrap">
                      {sentimentOptions.map(sentiment => (
                        <button
                          key={sentiment}
                          onClick={() => onUpdateExtract(extractIndex, { editedSentiment: sentiment })}
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
                </div>

                {/* コメント */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">コメント（任意）</label>
                  <input
                    type="text"
                    value={editData.comment}
                    onChange={e => onUpdateExtract(extractIndex, { comment: e.target.value })}
                    placeholder="修正理由や補足情報"
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </C_Stack>
            </div>
          )
        })}
      </C_Stack>

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
