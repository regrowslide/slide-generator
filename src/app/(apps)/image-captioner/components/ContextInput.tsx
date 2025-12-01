'use client'

import React from 'react'
import {C_Stack} from '@cm/components/styles/common-components/common-components'

interface ContextInputProps {
  value: string
  onChange: (value: string) => void
  onAnalyze: () => void
  isProcessing: boolean
}

export const ContextInput: React.FC<ContextInputProps> = ({value, onChange, onAnalyze, isProcessing}) => {
  return (
    <C_Stack className="gap-4 w-full">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          画面操作のシナリオ
        </label>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="例：ログイン画面でユーザー名とパスワードを入力し、「ログイン」ボタンをクリックしてダッシュボードに遷移する..."
          className="min-h-[120px] w-full p-2 border rounded"
          disabled={isProcessing}
        />
        <p className="text-xs text-gray-500 mt-2">
          画面操作の流れを説明してください。AIが各画像に適切な注釈（吹き出しなど）を生成する際の参考にします。
        </p>
      </div>
      <button
        onClick={onAnalyze}
        disabled={isProcessing || !value.trim()}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? '分析中...' : 'Gemini 2.5で画像を分析'}
      </button>
    </C_Stack>
  )
}

