'use client'

import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Loader2, Send, Sparkles } from 'lucide-react'

/** 入力セクション */
export interface InputSectionProps {
  rawTexts: string
  setRawTexts: (value: string) => void
  allowCategoryGeneration: boolean
  setAllowCategoryGeneration: (value: boolean) => void
  isAnalyzing: boolean
  selectedClientId: string | undefined
  onAnalyze: () => void
}

export function InputSection({
  rawTexts,
  setRawTexts,
  allowCategoryGeneration,
  setAllowCategoryGeneration,
  isAnalyzing,
  selectedClientId,
  onAnalyze,
}: InputSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <C_Stack className="gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            感想文テキスト（改行区切りで複数入力）
          </label>
          <textarea
            value={rawTexts}
            onChange={(e) => setRawTexts(e.target.value)}
            placeholder="例：&#10;ランチとは雰囲気が違うしよかったんですが、とにかく音楽がでかい！&#10;ハンバーグが昼とあんまり見栄えに変化がなくて…その分値段の差がちょっとキツいなと感じました。&#10;抹茶チーズケーキ絶品です！"
            className="w-full min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
            disabled={isAnalyzing}
          />
          <p className="text-xs text-gray-500 mt-2">
            複数の感想文を改行で区切って入力してください。各行が1つの分析対象として処理されます。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allowCategoryGeneration"
            checked={allowCategoryGeneration}
            onChange={(e) => setAllowCategoryGeneration(e.target.checked)}
            disabled={isAnalyzing}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="allowCategoryGeneration" className="text-sm text-gray-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            カテゴリ生成提案を許可する（マスターにないカテゴリを提案）
          </label>
        </div>

        <R_Stack className="justify-end">
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || !selectedClientId || !rawTexts.trim()}
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
                一括分析実行
              </>
            )}
          </button>
        </R_Stack>
      </C_Stack>
    </div>
  )
}

