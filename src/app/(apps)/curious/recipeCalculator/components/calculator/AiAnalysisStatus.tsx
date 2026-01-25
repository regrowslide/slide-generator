'use client'

import {Loader2} from 'lucide-react'

interface AiAnalysisStatusProps {
  isAnalyzing: boolean
  aiLog: string
  scanProgress: number
  ingredientCount: number
}

export const AiAnalysisStatus = ({isAnalyzing, aiLog, scanProgress, ingredientCount}: AiAnalysisStatusProps) => {
  if (isAnalyzing) {
    return (
      <div className="flex items-center gap-2 text-blue-600 font-medium">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{aiLog}</span>
        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-300" style={{width: `${scanProgress}%`}} />
        </div>
      </div>
    )
  }

  return (
    <span className="text-slate-500">
      {ingredientCount > 0
        ? 'AI解析完了 - 単位変換・マスタ照合・Web検索が実行されました。'
        : '「AIレシピ解析を実行」ボタンを押すと、仕様書に基づくデモが始まります。'}
    </span>
  )
}
