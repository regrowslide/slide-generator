'use client'

import { useState } from 'react'
import { useKakeiboMockData } from '../context/MockDataContext'
import { CATEGORY_TYPE_LABELS } from './constants'
import type { Category, CategoryType } from './types'

// カテゴリ区分の表示順
const TYPE_ORDER: CategoryType[] = [
  'income',
  'savings_investment',
  'fixed_expense',
  'variable_expense',
  'special_expense',
]

export default function MasterCategoryPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useKakeiboMockData()

  // 編集中のカテゴリID → フィールド名
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Category>>({})

  // 新規追加用の一時状態（区分ごと）
  const [addingType, setAddingType] = useState<CategoryType | null>(null)
  const [newName, setNewName] = useState('')
  const [newWeeklyBudget, setNewWeeklyBudget] = useState('')
  const [newMonthlyBudget, setNewMonthlyBudget] = useState('')

  // 編集開始
  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditValues({
      name: cat.name,
      weeklyBudget: cat.weeklyBudget,
      monthlyBudget: cat.monthlyBudget,
    })
  }

  // 編集保存
  const saveEdit = (id: string) => {
    updateCategory(id, editValues)
    setEditingId(null)
    setEditValues({})
  }

  // 編集キャンセル
  const cancelEdit = () => {
    setEditingId(null)
    setEditValues({})
  }

  // 削除
  const handleDelete = (id: string, name: string) => {
    if (confirm(`「${name}」を削除しますか？`)) {
      deleteCategory(id)
    }
  }

  // 新規追加
  const handleAdd = (type: CategoryType) => {
    if (!newName.trim()) return

    const sameTypeCategories = categories.filter((c) => c.type === type)
    const maxOrder = sameTypeCategories.length > 0
      ? Math.max(...sameTypeCategories.map((c) => c.order))
      : 0

    const newCategory: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newName.trim(),
      type,
      weeklyBudget: newWeeklyBudget ? Number(newWeeklyBudget) : null,
      monthlyBudget: newMonthlyBudget ? Number(newMonthlyBudget) : null,
      order: maxOrder + 1,
    }

    addCategory(newCategory)
    resetAddForm()
  }

  // 追加フォームリセット
  const resetAddForm = () => {
    setAddingType(null)
    setNewName('')
    setNewWeeklyBudget('')
    setNewMonthlyBudget('')
  }

  // 区分ごとにグループ化
  const groupedCategories = TYPE_ORDER.map((type) => ({
    type,
    label: CATEGORY_TYPE_LABELS[type],
    items: categories.filter((c) => c.type === type).sort((a, b) => a.order - b.order),
  }))

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-lg font-bold text-gray-800">カテゴリ管理</h2>

      {groupedCategories.map((group) => (
        <div key={group.type} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* 区分ヘッダー */}
          <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
            <h3 className="text-sm font-bold text-emerald-700">{group.label}</h3>
          </div>

          {/* カテゴリ一覧 */}
          <div className="divide-y divide-gray-50">
            {group.items.map((cat) => (
              <div key={cat.id} className="px-4 py-3">
                {editingId === cat.id ? (
                  // 編集モード
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editValues.name ?? ''}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      placeholder="カテゴリ名"
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-gray-400">週予算</label>
                        <input
                          type="number"
                          value={editValues.weeklyBudget ?? ''}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              weeklyBudget: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                          placeholder="未設定"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-400">月予算</label>
                        <input
                          type="number"
                          value={editValues.monthlyBudget ?? ''}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              monthlyBudget: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                          placeholder="未設定"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={() => saveEdit(cat.id)}
                        className="px-3 py-1 text-xs text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  // 表示モード
                  <div className="flex items-center justify-between">
                    <div
                      className="flex-1 cursor-pointer hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
                      onClick={() => startEdit(cat)}
                    >
                      <div className="text-sm font-medium text-gray-800">{cat.name}</div>
                      <div className="flex gap-3 mt-0.5">
                        {cat.weeklyBudget != null && (
                          <span className="text-xs text-gray-400">
                            週 ¥{cat.weeklyBudget.toLocaleString()}
                          </span>
                        )}
                        {cat.monthlyBudget != null && (
                          <span className="text-xs text-gray-400">
                            月 ¥{cat.monthlyBudget.toLocaleString()}
                          </span>
                        )}
                        {cat.weeklyBudget == null && cat.monthlyBudget == null && (
                          <span className="text-xs text-gray-300">予算未設定</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="ml-2 p-1.5 text-gray-300 hover:text-red-400 transition-colors"
                      title="削除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 追加フォーム */}
          {addingType === group.type ? (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="カテゴリ名（例: 🎵 習い事）"
                autoFocus
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-400">週予算</label>
                  <input
                    type="number"
                    value={newWeeklyBudget}
                    onChange={(e) => setNewWeeklyBudget(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="未設定"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400">月予算</label>
                  <input
                    type="number"
                    value={newMonthlyBudget}
                    onChange={(e) => setNewMonthlyBudget(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="未設定"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={resetAddForm}
                  className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleAdd(group.type)}
                  disabled={!newName.trim()}
                  className="px-3 py-1 text-xs text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 disabled:bg-gray-300 transition-colors"
                >
                  追加
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                resetAddForm()
                setAddingType(group.type)
              }}
              className="w-full px-4 py-2.5 text-xs text-teal-600 bg-gray-50 border-t border-gray-100 hover:bg-teal-50 transition-colors"
            >
              + 追加
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
