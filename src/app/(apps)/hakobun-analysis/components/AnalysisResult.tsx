'use client'

import React from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { AnalysisResult as AnalysisResultType, Segment, Extract } from '../types'
import { ChevronDown, ChevronRight, MessageSquare, Tag, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface AnalysisResultProps {
  result: AnalysisResultType
}

// 感情に応じたアイコンと色
const getSentimentStyle = (sentiment: string) => {
  switch (sentiment) {
    case '好意的':
      return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' }
    case '不満':
      return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100' }
    default:
      return { icon: Minus, color: 'text-gray-600', bg: 'bg-gray-100' }
  }
}

// 抽出要素コンポーネント
const ExtractItem: React.FC<{ extract: Extract; index: number }> = ({ extract, index }) => {
  const sentimentStyle = getSentimentStyle(extract.sentiment)
  const SentimentIcon = sentimentStyle.icon

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <R_Stack className="items-start gap-3">
        {/* 番号 */}
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
          {index + 1}
        </div>

        <C_Stack className="flex-1 gap-2">
          {/* テキストフラグメント */}
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
            <p className="text-gray-800 font-medium">&ldquo;{extract.text_fragment}&rdquo;</p>
          </div>

          {/* カテゴリと感情 */}
          <R_Stack className="flex-wrap gap-2">
            {/* カテゴリタグ */}
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              <Tag className="w-3 h-3" />
              {extract.general_category} &gt; {extract.specific_category}
            </span>

            {/* 感情タグ */}
            <span className={`inline-flex items-center gap-1 px-2 py-1 ${sentimentStyle.bg} ${sentimentStyle.color} text-xs rounded-full`}>
              <SentimentIcon className="w-3 h-3" />
              {extract.sentiment}
            </span>

            {/* 新規生成フラグ */}
            {extract.is_new_generated && (
              <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                新規カテゴリ
              </span>
            )}
          </R_Stack>

          {/* カテゴリID */}
          <p className="text-xs text-gray-400">ID: {extract.category_id}</p>
        </C_Stack>
      </R_Stack>
    </div>
  )
}

// セグメントコンポーネント
const SegmentItem: React.FC<{ segment: Segment }> = ({ segment }) => {
  const [isExpanded, setIsExpanded] = React.useState(true)

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* セグメントヘッダー */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-2"
      >
        {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
        <span className="font-medium text-gray-700">セグメント {segment.segment_id}</span>
        <span className="text-sm text-gray-500 ml-2">({segment.extracts.length}件の抽出要素)</span>
      </button>

      {/* セグメント内容 */}
      {isExpanded && (
        <C_Stack className="p-4 gap-4 bg-white">
          {/* 入力テキスト */}
          <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
            <p className="text-sm text-gray-600 mb-1 font-medium">入力テキスト:</p>
            <p className="text-gray-800">{segment.input_text}</p>
          </div>

          {/* 抽出要素 */}
          <C_Stack className="gap-3">
            {segment.extracts.map((extract, index) => (
              <ExtractItem key={index} extract={extract} index={index} />
            ))}
          </C_Stack>
        </C_Stack>
      )}
    </div>
  )
}

export const AnalysisResultView: React.FC<AnalysisResultProps> = ({ result }) => {
  const totalExtracts = result.segments.reduce((sum, seg) => sum + seg.extracts.length, 0)

  return (
    <C_Stack className="gap-6">
      {/* サマリー */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <R_Stack className="flex-wrap gap-4">
          <div>
            <p className="text-xs text-gray-500">Voice ID</p>
            <p className="font-mono text-sm">{result.voice_id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">処理日時</p>
            <p className="text-sm">{new Date(result.process_timestamp).toLocaleString('ja-JP')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">セグメント数</p>
            <p className="text-sm font-bold">{result.segments.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">抽出要素数</p>
            <p className="text-sm font-bold">{totalExtracts}</p>
          </div>
        </R_Stack>
      </div>

      {/* セグメント一覧 */}
      <C_Stack className="gap-4">
        {result.segments.map(segment => (
          <SegmentItem key={segment.segment_id} segment={segment} />
        ))}
      </C_Stack>
    </C_Stack>
  )
}
