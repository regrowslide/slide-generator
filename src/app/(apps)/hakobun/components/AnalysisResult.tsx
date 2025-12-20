'use client'

import React from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { AnalysisResult as AnalysisResultType, Extract } from '../types'
import { MessageSquare, Tag, TrendingUp, TrendingDown, Lightbulb, Flame } from 'lucide-react'

interface AnalysisResultProps {
  result: AnalysisResultType
}

// 感情に応じたアイコンと色
const getSentimentStyle = (sentiment: string) => {
  switch (sentiment) {
    case '好意的':
      return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' }
    case '不満':
      return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' }
    case 'リクエスト':
      return { icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-300' }
    default:
      return { icon: Tag, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-300' }
  }
}

// 熱量に応じた色
const getMagnitudeStyle = (magnitude: number) => {
  if (magnitude >= 76) return { color: 'text-red-600', bg: 'bg-red-500' }
  if (magnitude >= 51) return { color: 'text-orange-600', bg: 'bg-orange-500' }
  if (magnitude >= 26) return { color: 'text-yellow-600', bg: 'bg-yellow-500' }
  if (magnitude >= 6) return { color: 'text-blue-600', bg: 'bg-blue-400' }
  return { color: 'text-gray-500', bg: 'bg-gray-400' }
}

// 抽出要素コンポーネント
const ExtractItem: React.FC<{ extract: Extract; index: number }> = ({ extract, index }) => {
  const sentimentStyle = getSentimentStyle(extract.sentiment)
  const magnitudeStyle = getMagnitudeStyle(extract.magnitude)
  const SentimentIcon = sentimentStyle.icon

  return (
    <div className={`bg-white border-2 ${sentimentStyle.border} rounded-lg p-4 shadow-sm`}>
      <C_Stack className="gap-3">
        {/* ヘッダー：番号とカテゴリ */}
        <R_Stack className="items-center justify-between flex-wrap gap-2">
          <R_Stack className="items-center gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm font-bold">
              {index + 1}
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 text-white text-sm font-medium rounded-full">
              <Tag className="w-3 h-3" />
              {extract.category}
            </span>
          </R_Stack>

          {/* 感情と熱量 */}
          <R_Stack className="items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 ${sentimentStyle.bg} ${sentimentStyle.color} text-xs font-medium rounded-full`}
            >
              <SentimentIcon className="w-3 h-3" />
              {extract.sentiment}
            </span>

            {/* 熱量バー */}
            <div className="flex items-center gap-1">
              <Flame className={`w-4 h-4 ${magnitudeStyle.color}`} />
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${magnitudeStyle.bg} transition-all`} style={{ width: `${extract.magnitude}%` }} />
              </div>
              <span className={`text-xs font-medium ${magnitudeStyle.color}`}>{extract.magnitude}</span>
            </div>
          </R_Stack>
        </R_Stack>

        {/* 文節テキスト */}
        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
          <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
          <p className="text-gray-800">{extract.sentence}</p>
        </div>

        {/* ポジネガ表示 */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>ポジネガ:</span>
          <span
            className={`px-2 py-0.5 rounded ${extract.posi_nega === 'positive'
                ? 'bg-green-100 text-green-700'
                : extract.posi_nega === 'negative'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
          >
            {extract.posi_nega}
          </span>
          {extract.is_new_generated && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">新規カテゴリ</span>
          )}
        </div>
      </C_Stack>
    </div>
  )
}

export const AnalysisResultView: React.FC<AnalysisResultProps> = ({ result }) => {
  // 感情別の統計
  const sentimentStats = result.extracts.reduce(
    (acc, ext) => {
      acc[ext.sentiment] = (acc[ext.sentiment] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // 平均熱量
  const avgMagnitude = result.extracts.length > 0 ? Math.round(result.extracts.reduce((sum, ext) => sum + ext.magnitude, 0) / result.extracts.length) : 0

  return (
    <C_Stack className="gap-6">
      {/* サマリー */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <R_Stack className="flex-wrap gap-6">
          <div>
            <p className="text-xs text-gray-500">Voice ID</p>
            <p className="font-mono text-sm">{result.voice_id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">処理日時</p>
            <p className="text-sm">{new Date(result.process_timestamp).toLocaleString('ja-JP')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">文節数</p>
            <p className="text-sm font-bold">{result.extracts.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">平均熱量</p>
            <p className="text-sm font-bold">{avgMagnitude}</p>
          </div>
        </R_Stack>

        {/* 感情別統計 */}
        <R_Stack className="mt-3 gap-3">
          {sentimentStats['好意的'] && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">好意的: {sentimentStats['好意的']}</span>
          )}
          {sentimentStats['不満'] && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">不満: {sentimentStats['不満']}</span>
          )}
          {sentimentStats['リクエスト'] && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">リクエスト: {sentimentStats['リクエスト']}</span>
          )}
        </R_Stack>
      </div>

      {/* 抽出要素一覧 */}
      <C_Stack className="gap-4">
        {result.extracts.map((extract, index) => (
          <ExtractItem key={index} extract={extract} index={index} />
        ))}
      </C_Stack>
    </C_Stack>
  )
}
