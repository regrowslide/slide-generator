'use client'

import React from 'react'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { HakobunClient } from '../types'
import { Loader2, Send } from 'lucide-react'

interface VoiceAnalyzerProps {
  clients: HakobunClient[]
  selectedClientId: string | null
  rawText: string
  isAnalyzing: boolean
  onClientSelect: (clientId: string) => void
  onTextChange: (text: string) => void
  onAnalyze: () => void
}

export const VoiceAnalyzer: React.FC<VoiceAnalyzerProps> = ({
  clients,
  selectedClientId,
  rawText,
  isAnalyzing,
  onClientSelect,
  onTextChange,
  onAnalyze,
}) => {
  return (
    <C_Stack className="gap-6 w-full">
      {/* クライアント選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">クライアント選択</label>
        <select
          value={selectedClientId || ''}
          onChange={e => onClientSelect(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isAnalyzing}
        >
          <option value="">クライアントを選択してください</option>
          {clients.map(client => (
            <option key={client.id} value={client.clientId}>
              {client.name} ({client.clientId})
            </option>
          ))}
        </select>
      </div>

      {/* テキスト入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">顧客の声（分析対象テキスト）</label>
        <textarea
          value={rawText}
          onChange={e => onTextChange(e.target.value)}
          placeholder="例：ランチとは雰囲気が違うしよかったんですが、とにかく音楽がでかい！あと、ハンバーグが昼とあんまり見栄えに変化がなくて…その分値段の差がちょっとキツいなと感じました。"
          className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          disabled={isAnalyzing}
        />
        <p className="text-xs text-gray-500 mt-2">
          お客様からのフィードバックテキストを入力してください。長文・短文どちらも対応しています。
        </p>
      </div>

      {/* 分析ボタン */}
      <R_Stack className="justify-end">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || !selectedClientId || !rawText.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              分析中...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Geminiで分析実行
            </>
          )}
        </button>
      </R_Stack>
    </C_Stack>
  )
}
