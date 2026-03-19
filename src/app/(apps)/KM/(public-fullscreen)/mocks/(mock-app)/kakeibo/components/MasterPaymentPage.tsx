'use client'

import { useState } from 'react'
import { useKakeiboMockData } from '../context/MockDataContext'
import type { PaymentMethod } from './types'

export default function MasterPaymentPage() {
  const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } =
    useKakeiboMockData()

  // 編集状態
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<PaymentMethod>>({})

  // 新規追加状態
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newAccount, setNewAccount] = useState('')

  // 編集開始
  const startEdit = (pm: PaymentMethod) => {
    setEditingId(pm.id)
    setEditValues({
      name: pm.name,
      dueDate: pm.dueDate,
      account: pm.account,
    })
  }

  // 編集保存
  const saveEdit = (id: string) => {
    updatePaymentMethod(id, editValues)
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
      deletePaymentMethod(id)
    }
  }

  // 新規追加
  const handleAdd = () => {
    if (!newName.trim()) return

    const newPm: PaymentMethod = {
      id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newName.trim(),
      dueDate: newDueDate ? Number(newDueDate) : null,
      account: newAccount.trim() || null,
    }

    addPaymentMethod(newPm)
    resetAddForm()
  }

  // 追加フォームリセット
  const resetAddForm = () => {
    setIsAdding(false)
    setNewName('')
    setNewDueDate('')
    setNewAccount('')
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">支払方法管理</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
          <div className="grid grid-cols-12 gap-2 text-xs font-bold text-emerald-700">
            <div className="col-span-4">名称</div>
            <div className="col-span-3">引落日</div>
            <div className="col-span-4">引落口座</div>
            <div className="col-span-1"></div>
          </div>
        </div>

        {/* 一覧 */}
        <div className="divide-y divide-gray-50">
          {paymentMethods.map((pm) => (
            <div key={pm.id} className="px-4 py-3">
              {editingId === pm.id ? (
                // 編集モード
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4">
                      <label className="text-xs text-gray-400">名称</label>
                      <input
                        type="text"
                        value={editValues.name ?? ''}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-xs text-gray-400">引落日</label>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={editValues.dueDate ?? ''}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            dueDate: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        placeholder="なし"
                      />
                    </div>
                    <div className="col-span-5">
                      <label className="text-xs text-gray-400">引落口座</label>
                      <input
                        type="text"
                        value={editValues.account ?? ''}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            account: e.target.value || null,
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        placeholder="なし"
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
                      onClick={() => saveEdit(pm.id)}
                      className="px-3 py-1 text-xs text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                // 表示モード
                <div className="flex items-center">
                  <div
                    className="grid grid-cols-12 gap-2 flex-1 cursor-pointer hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
                    onClick={() => startEdit(pm)}
                  >
                    <div className="col-span-4 text-sm font-medium text-gray-800">{pm.name}</div>
                    <div className="col-span-3 text-sm text-gray-500">
                      {pm.dueDate != null ? `${pm.dueDate}日` : '-'}
                    </div>
                    <div className="col-span-4 text-sm text-gray-500">{pm.account ?? '-'}</div>
                  </div>
                  <button
                    onClick={() => handleDelete(pm.id, pm.name)}
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
        {isAdding ? (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-2">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4">
                <label className="text-xs text-gray-400">名称</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="例: クレカC"
                  autoFocus
                />
              </div>
              <div className="col-span-3">
                <label className="text-xs text-gray-400">引落日</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="なし"
                />
              </div>
              <div className="col-span-5">
                <label className="text-xs text-gray-400">引落口座</label>
                <input
                  type="text"
                  value={newAccount}
                  onChange={(e) => setNewAccount(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="なし"
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
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="px-3 py-1 text-xs text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 disabled:bg-gray-300 transition-colors"
              >
                追加
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full px-4 py-2.5 text-xs text-teal-600 bg-gray-50 border-t border-gray-100 hover:bg-teal-50 transition-colors"
          >
            + 追加
          </button>
        )}
      </div>
    </div>
  )
}
