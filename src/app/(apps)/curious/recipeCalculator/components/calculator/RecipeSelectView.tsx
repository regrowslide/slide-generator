'use client'

import {Plus, History, ChevronRight} from 'lucide-react'
import type {RecipeWithIngredients} from '../../types'

interface RecipeSelectViewProps {
  recipes: RecipeWithIngredients[]
  onStartNew: () => void
  onSelectRecipe: (recipe: RecipeWithIngredients) => void
}

export const RecipeSelectView = ({recipes, onStartNew, onSelectRecipe}: RecipeSelectViewProps) => {
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">AI原価計算</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 新規作成カード */}
          <button
            onClick={onStartNew}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">新規作成</h3>
            <p className="text-sm text-slate-500 text-center">
              テキスト・画像・PDFからレシピを解析し、
              <br />
              原価計算を行います
            </p>
          </button>

          {/* 過去のレシピカード */}
          <div className="flex flex-col p-6 border-2 border-slate-200 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <History className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">過去のレシピから選択</h3>
            </div>

            {recipes.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 py-8">
                <p>まだレシピがありません</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2">
                {recipes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onSelectRecipe(r)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{r.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            r.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : r.status === 'analyzing'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.status === 'completed' ? '完了' : r.status === 'analyzing' ? '解析中' : '下書き'}
                        </span>
                        <span className="text-xs text-slate-400">{r.RcRecipeIngredient.length}材料</span>
                        {r.sellingPrice && (
                          <span className="text-xs text-slate-500">¥{Math.round(r.sellingPrice).toLocaleString()}/パック</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
