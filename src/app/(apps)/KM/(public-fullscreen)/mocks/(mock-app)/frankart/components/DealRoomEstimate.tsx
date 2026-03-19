'use client'

import React, { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Trash2, Eye, Printer, X } from 'lucide-react'
import { useFrankartMockData } from '../context/MockDataContext'
import { ESTIMATE_STATUS_CONFIG } from './constants'
import type { EstimateStatus, EstimateItem } from './types'

type Props = { dealId: string }

const DealRoomEstimate: React.FC<Props> = ({ dealId }) => {
  const { estimates, addEstimate, updateEstimateStatus, deleteEstimate, deals, selectedDealId } = useFrankartMockData()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)

  const deal = deals.find((d) => d.id === selectedDealId || d.id === dealId)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newItems, setNewItems] = useState<EstimateItem[]>([
    { id: 'new-1', name: '', quantity: 1, unitPrice: 0, amount: 0 },
  ])

  const dealEstimates = estimates.filter((e) => e.dealId === dealId)

  // 品目追加
  const addItem = () => {
    setNewItems([...newItems, { id: `new-${Date.now()}`, name: '', quantity: 1, unitPrice: 0, amount: 0 }])
  }

  // 品目更新
  const updateItem = (index: number, field: keyof EstimateItem, value: string | number) => {
    setNewItems((prev) => {
      const updated = [...prev]
      const item = { ...updated[index], [field]: value }
      if (field === 'quantity' || field === 'unitPrice') {
        item.amount = Number(item.quantity) * Number(item.unitPrice)
      }
      updated[index] = item
      return updated
    })
  }

  // 品目削除
  const removeItem = (index: number) => {
    setNewItems((prev) => prev.filter((_, i) => i !== index))
  }

  // 見積作成
  const handleCreate = () => {
    if (!newTitle.trim() || newItems.length === 0) return
    const validItems = newItems.filter((i) => i.name.trim())
    const totalAmount = validItems.reduce((sum, i) => sum + i.amount, 0)
    addEstimate({
      id: `est-${Date.now()}`,
      dealId,
      title: newTitle.trim(),
      status: 'draft',
      items: validItems,
      totalAmount,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    })
    setNewTitle('')
    setNewItems([{ id: 'new-1', name: '', quantity: 1, unitPrice: 0, amount: 0 }])
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      {/* 新規作成ボタン */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          新規見積
        </button>
      </div>

      {/* 新規作成フォーム */}
      {showForm && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4">
          <input
            type="text"
            placeholder="見積タイトル"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
          />
          {/* 品目テーブル */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-stone-500 border-b border-stone-200">
                <th className="pb-2 pr-2">品目名</th>
                <th className="pb-2 pr-2 w-20 text-center">数量</th>
                <th className="pb-2 pr-2 w-28 text-right">単価</th>
                <th className="pb-2 pr-2 w-28 text-right">金額</th>
                <th className="pb-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {newItems.map((item, idx) => (
                <tr key={item.id} className="border-b border-stone-100">
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(idx, 'name', e.target.value)}
                      placeholder="品目名"
                      className="w-full px-2 py-1.5 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-stone-200 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-slate-400"
                      min={1}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-stone-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </td>
                  <td className="py-2 pr-2 text-right text-stone-700">{item.amount.toLocaleString()}</td>
                  <td className="py-2">
                    <button onClick={() => removeItem(idx)} className="p-1 text-stone-300 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addItem} className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />品目を追加
          </button>
          <div className="flex items-center justify-between pt-2 border-t border-stone-200">
            <span className="font-medium text-stone-800">
              合計: {newItems.reduce((s, i) => s + i.amount, 0).toLocaleString()}円
            </span>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-lg">
                キャンセル
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40"
              >
                作成する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 見積一覧 */}
      {dealEstimates.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-5 py-8 text-center text-stone-400 text-sm">
          見積はありません
        </div>
      ) : (
        dealEstimates.map((est) => {
          const statusConf = ESTIMATE_STATUS_CONFIG[est.status]
          const expanded = expandedId === est.id
          return (
            <div key={est.id} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedId(expanded ? null : est.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConf.bg} ${statusConf.color}`}>
                    {statusConf.label}
                  </span>
                  <span className="font-medium text-stone-800 text-sm">{est.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-stone-700">{est.totalAmount.toLocaleString()}円</span>
                  {expanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                </div>
              </button>
              {expanded && (
                <div className="px-5 pb-4 border-t border-stone-100">
                  {/* ステータス変更 */}
                  <div className="flex items-center gap-2 py-3 mb-2">
                    <span className="text-xs text-stone-500">ステータス:</span>
                    {(['draft', 'sent', 'approved', 'rejected'] as EstimateStatus[]).map((s) => {
                      const c = ESTIMATE_STATUS_CONFIG[s]
                      return (
                        <button
                          key={s}
                          onClick={() => updateEstimateStatus(est.id, s)}
                          className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                            est.status === s
                              ? `${c.bg} ${c.color} border-current`
                              : 'border-stone-200 text-stone-400 hover:border-stone-300'
                          }`}
                        >
                          {c.label}
                        </button>
                      )
                    })}
                  </div>
                  {/* 品目テーブル */}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-stone-500 border-b border-stone-200">
                        <th className="pb-2">品目</th>
                        <th className="pb-2 text-center w-16">数量</th>
                        <th className="pb-2 text-right w-28">単価</th>
                        <th className="pb-2 text-right w-28">金額</th>
                      </tr>
                    </thead>
                    <tbody>
                      {est.items.map((item) => (
                        <tr key={item.id} className="border-b border-stone-100">
                          <td className="py-2 text-stone-700">{item.name}</td>
                          <td className="py-2 text-center text-stone-600">{item.quantity}</td>
                          <td className="py-2 text-right text-stone-600">{item.unitPrice.toLocaleString()}</td>
                          <td className="py-2 text-right font-medium text-stone-800">{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-stone-300">
                        <td colSpan={3} className="py-2 text-right font-medium text-stone-700">合計</td>
                        <td className="py-2 text-right font-bold text-stone-800">{est.totalAmount.toLocaleString()}円</td>
                      </tr>
                    </tfoot>
                  </table>
                  <div className="flex justify-between items-center mt-3 text-xs text-stone-400">
                    <span>作成: {est.createdAt} / 更新: {est.updatedAt}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPreviewId(previewId === est.id ? null : est.id)}
                        className="text-slate-500 hover:text-slate-700 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />プレビュー
                      </button>
                      <button
                        onClick={() => deleteEstimate(est.id)}
                        className="text-red-400 hover:text-red-600 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />削除
                      </button>
                    </div>
                  </div>
                  {/* 帳票プレビュー */}
                  {previewId === est.id && (
                    <div className="mt-4 border border-stone-300 rounded-lg bg-white shadow-md">
                      {/* プレビューヘッダー */}
                      <div className="flex items-center justify-between px-4 py-2 bg-stone-50 border-b border-stone-200 rounded-t-lg">
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <Printer className="w-3.5 h-3.5" />
                          帳票プレビュー
                        </div>
                        <button onClick={() => setPreviewId(null)} className="text-stone-400 hover:text-stone-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {/* 見積書本体 */}
                      <div className="print-target p-8 font-serif" style={{ fontFamily: '"Yu Mincho", "Hiragino Mincho Pro", serif' }}>
                        <h2 className="text-center text-2xl tracking-[0.5em] font-bold text-stone-800 mb-8">
                          御 見 積 書
                        </h2>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <p className="text-lg font-bold text-stone-800 border-b-2 border-stone-800 pb-1 inline-block">
                              {deal?.companyName ?? '—'} 御中
                            </p>
                          </div>
                          <div className="text-right text-sm text-stone-600 space-y-1">
                            <p>発行日: {est.updatedAt}</p>
                            <p>見積番号: {est.id.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm text-stone-600">
                            件名: <span className="font-bold text-stone-800">{est.title}</span>
                          </p>
                        </div>
                        <div className="bg-slate-700 text-white text-center py-2 text-lg font-bold mb-0 rounded-t">
                          合計金額: ¥{(est.totalAmount + Math.floor(est.totalAmount * 0.1)).toLocaleString()}（税込）
                        </div>
                        {/* 品目テーブル */}
                        <table className="w-full text-sm border-collapse border border-stone-300">
                          <thead>
                            <tr className="bg-stone-100">
                              <th className="border border-stone-300 px-3 py-2 text-center w-12">No.</th>
                              <th className="border border-stone-300 px-3 py-2 text-left">品目</th>
                              <th className="border border-stone-300 px-3 py-2 text-center w-16">数量</th>
                              <th className="border border-stone-300 px-3 py-2 text-right w-28">単価</th>
                              <th className="border border-stone-300 px-3 py-2 text-right w-28">金額</th>
                            </tr>
                          </thead>
                          <tbody>
                            {est.items.map((item, idx) => (
                              <tr key={item.id}>
                                <td className="border border-stone-300 px-3 py-2 text-center text-stone-500">{idx + 1}</td>
                                <td className="border border-stone-300 px-3 py-2">{item.name}</td>
                                <td className="border border-stone-300 px-3 py-2 text-center">{item.quantity}</td>
                                <td className="border border-stone-300 px-3 py-2 text-right">¥{item.unitPrice.toLocaleString()}</td>
                                <td className="border border-stone-300 px-3 py-2 text-right">¥{item.amount.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {/* 小計・消費税・合計 */}
                        <div className="flex justify-end mt-0">
                          <table className="text-sm border-collapse border border-stone-300 w-64">
                            <tbody>
                              <tr>
                                <td className="border border-stone-300 px-3 py-1.5 text-right bg-stone-50">小計</td>
                                <td className="border border-stone-300 px-3 py-1.5 text-right">¥{est.totalAmount.toLocaleString()}</td>
                              </tr>
                              <tr>
                                <td className="border border-stone-300 px-3 py-1.5 text-right bg-stone-50">消費税（10%）</td>
                                <td className="border border-stone-300 px-3 py-1.5 text-right">¥{Math.floor(est.totalAmount * 0.1).toLocaleString()}</td>
                              </tr>
                              <tr className="font-bold">
                                <td className="border border-stone-300 px-3 py-2 text-right bg-stone-100">合計</td>
                                <td className="border border-stone-300 px-3 py-2 text-right">¥{(est.totalAmount + Math.floor(est.totalAmount * 0.1)).toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        {/* 備考 */}
                        <div className="mt-6 text-sm text-stone-600 space-y-1">
                          <p>有効期限: 発行日から30日間</p>
                        </div>
                        {/* 発行者情報 */}
                        <div className="mt-8 flex justify-end">
                          <div className="text-sm text-stone-700 text-right space-y-0.5">
                            <p className="font-bold text-base">株式会社フランクアート</p>
                            <p>〒100-0001 東京都千代田区1-1-1</p>
                            <p>TEL: 03-0000-0000</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

export default DealRoomEstimate
