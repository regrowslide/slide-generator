'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { HakobunCorrection, PriorityType } from '../types'
import { Sparkles, Save, Calendar, FileText, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'

interface RuleDraft {
  target_category: string
  rule_description: string
  priority: PriorityType
  reasoning: string
}

const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-800'
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'Low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

interface RuleAutoCreateModalProps {
  clientId: string
  onRuleSaved?: () => void
}

export default function RuleAutoCreateModal({ clientId, onRuleSaved }: RuleAutoCreateModalProps) {
  const [corrections, setCorrections] = useState<HakobunCorrection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [drafts, setDrafts] = useState<RuleDraft[]>([])
  const [selectedCorrections, setSelectedCorrections] = useState<Set<number>>(new Set())

  // フィルタ設定
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [limit, setLimit] = useState<string>('100')

  // デフォルトで過去30日間を設定
  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    setEndDate(end.toISOString().split('T')[0])
    setStartDate(start.toISOString().split('T')[0])
  }, [])

  // 修正事例取得
  const fetchCorrections = useCallback(async () => {
    if (!clientId) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        client_id: clientId,
        include_archived: 'false',
      })
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      if (limit) params.append('limit', limit)

      const res = await fetch(`/api/hakobun/feedback?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setCorrections(data.corrections || [])
        setSelectedCorrections(new Set())
      }
    } catch (error) {
      alert('修正事例の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [clientId, startDate, endDate, limit])

  useEffect(() => {
    if (clientId && startDate && endDate) {
      fetchCorrections()
    }
  }, [clientId, startDate, endDate, limit, fetchCorrections])

  // ルール草案生成
  const handleGenerateDrafts = async () => {
    if (!clientId) {
      alert('クライアントが選択されていません')
      return
    }

    const selected = corrections.filter(c => selectedCorrections.has(c.id))
    if (selected.length === 0) {
      alert('修正事例を選択してください')
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch('/api/hakobun/rules/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          corrections: selected.map(c => ({
            id: c.id,
            rawSegment: c.rawSegment,
            correctCategoryCode: c.correctCategoryCode,
            sentiment: c.sentiment,
            reviewerComment: c.reviewerComment,
          })),
        }),
      })

      const data = await res.json()

      console.log(data)
      if (data.success) {
        setDrafts(data.drafts || [])
      } else {
        alert(`ルール草案の生成に失敗しました: ${data.error}`)
      }
    } catch (error) {
      alert('ルール草案の生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  // ルール保存
  const handleSaveRule = async (draft: RuleDraft) => {
    if (!clientId) {
      alert('クライアントが選択されていません')
      return
    }

    try {
      const res = await fetch('/api/hakobun/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          target_category: draft.target_category,
          rule_description: draft.rule_description,
          priority: draft.priority,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setDrafts(prev => prev.filter(d => d !== draft))
        alert('ルールを保存しました')
        onRuleSaved?.()
      } else {
        alert(`ルールの保存に失敗しました: ${data.error}`)
      }
    } catch (error) {
      alert('ルールの保存に失敗しました')
    }
  }

  // 全選択/全解除
  const handleSelectAll = () => {
    if (selectedCorrections.size === corrections.length) {
      setSelectedCorrections(new Set())
    } else {
      setSelectedCorrections(new Set(corrections.map(c => c.id)))
    }
  }

  // 個別選択
  const handleToggleSelection = (id: number) => {
    const newSelected = new Set(selectedCorrections)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedCorrections(newSelected)
  }

  return (
    <C_Stack className="gap-6 max-h-[80vh] overflow-y-auto">
      {/* ヘッダー */}
      <R_Stack className="items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">ルール自動作成</h1>
          <p className="text-sm text-gray-500">過去の修正事例からルールを自動生成します</p>
        </div>
      </R_Stack>

      {/* フィルタ設定 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-base font-bold mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          検索条件
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最大件数</label>
            <input
              type="number"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              min="1"
              max="1000"
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchCorrections}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  検索中
                </>
              ) : (
                '検索'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 修正事例一覧 */}
      <div>
        <R_Stack className="justify-between items-center mb-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <FileText className="w-4 h-4" />
            修正事例一覧 ({corrections.length}件)
          </h2>
          <R_Stack className="gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {selectedCorrections.size === corrections.length ? '全解除' : '全選択'}
            </button>
            <button
              onClick={handleGenerateDrafts}
              disabled={isGenerating || selectedCorrections.size === 0}
              className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  ルール草案作成 ({selectedCorrections.size}件)
                </>
              )}
            </button>
          </R_Stack>
        </R_Stack>

        {isLoading ? (
          <p className="text-gray-500 text-center py-6">読み込み中...</p>
        ) : corrections.length === 0 ? (
          <div className="text-center py-6">
            <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">修正事例が見つかりません</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-gray-100">
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 w-10">
                    <input
                      type="checkbox"
                      checked={selectedCorrections.size === corrections.length && corrections.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">元のテキスト</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">正解カテゴリ</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">感情</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">作成日</th>
                </tr>
              </thead>
              <tbody>
                {corrections.map(correction => (
                  <tr
                    key={correction.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${selectedCorrections.has(correction.id) ? 'bg-purple-50' : ''
                      }`}
                    onClick={() => handleToggleSelection(correction.id)}
                  >
                    <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedCorrections.has(correction.id)}
                        onChange={() => handleToggleSelection(correction.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-3 py-2 text-gray-700 max-w-xs truncate">{correction.rawSegment}</td>
                    <td className="px-3 py-2">
                      <span className="text-xs font-mono bg-gray-200 px-1.5 py-0.5 rounded">
                        {correction.correctCategoryCode}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${correction.sentiment === '好意的'
                          ? 'bg-green-100 text-green-700'
                          : correction.sentiment === '不満'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                          }`}
                      >
                        {correction.sentiment}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {new Date(correction.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ルール草案一覧 */}
      {drafts.length > 0 && (
        <div>
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            生成されたルール草案 ({drafts.length}件)
          </h2>
          <C_Stack className="gap-3">
            {drafts.map((draft, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <R_Stack className="justify-between items-start">
                  <div className="flex-1">
                    <R_Stack className="items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${getPriorityStyle(draft.priority)}`}>
                        {draft.priority}
                      </span>
                      <span className="font-medium text-gray-800 text-sm">{draft.target_category}</span>
                    </R_Stack>
                    <p className="text-gray-700 text-sm mb-2">{draft.rule_description}</p>
                    <p className="text-xs text-gray-500 italic">理由: {draft.reasoning}</p>
                  </div>
                  <button
                    onClick={() => handleSaveRule(draft)}
                    className="ml-3 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"
                  >
                    <Save className="w-3 h-3" />
                    保存
                  </button>
                </R_Stack>
              </div>
            ))}
          </C_Stack>
        </div>
      )}
    </C_Stack>
  )
}

