'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Check, Mail, Plus, Trash2, X } from 'lucide-react'
import { useFrankartMockData } from '../context/MockDataContext'
import {
  DEAL_STATUS_CONFIG,
  LEAD_SOURCE_CONFIG,
  CONTRACT_STATUS_CONFIG,
  DEAL_STATUSES,
  LEAD_SOURCES,
  CONTRACT_STATUSES,
} from './constants'
import type { DealStatus, LeadSource, ContractStatus } from './types'

type EditingCell = { dealId: string; field: string } | null

const DealListPage: React.FC = () => {
  const router = useRouter()
  const { deals, staff, updateDeal, addDeal, deleteDeal, companies, meetings } = useFrankartMockData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DealStatus | 'all'>('all')
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [editingCell, setEditingCell] = useState<EditingCell>(null)
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null)

  // 編集中セルにフォーカス
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingCell])

  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      if (search && !d.title.includes(search) && !d.companyName.includes(search)) return false
      if (statusFilter !== 'all' && d.status !== statusFilter) return false
      if (sourceFilter !== 'all' && d.leadSource !== sourceFilter) return false
      if (assigneeFilter !== 'all' && !d.assigneeIds.includes(assigneeFilter)) return false
      return true
    })
  }, [deals, search, statusFilter, sourceFilter, assigneeFilter])

  const [showNewDealForm, setShowNewDealForm] = useState(false)
  const [newDeal, setNewDeal] = useState({
    title: '',
    companyId: '',
    leadSource: 'web' as LeadSource,
    assigneeIds: [] as string[],
    amount: 0,
    description: '',
  })

  const handleDealClick = (dealId: string) => {
    router.push(`/KM/mocks/frankart/deals/${dealId}`)
  }

  const handleAddDeal = () => {
    if (!newDeal.title || !newDeal.companyId) return
    const company = companies.find(c => c.id === newDeal.companyId)
    addDeal({
      id: `deal-${Date.now()}`,
      title: newDeal.title,
      companyId: newDeal.companyId,
      companyName: company?.name || '',
      contactIds: [],
      industry: company?.industry || '',
      status: 'entry',
      leadSource: newDeal.leadSource || 'web',
      matchingService: '',
      referralAdvisor: '',
      assigneeIds: newDeal.assigneeIds,
      amount: newDeal.amount || 0,
      probability: 0,
      entryDate: new Date().toISOString().split('T')[0],
      nextFollowUp: '',
      thanksEmailDone: false,
      techAttendee: '',
      ndaStatus: 'none',
      contractStatus: 'none',
      contractRenewalDate: '',
      advisorFeeRequired: false,
      advisorFeeAmount: 0,
      description: newDeal.description || '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    })
    setNewDeal({ title: '', companyId: '', leadSource: 'web', assigneeIds: [], amount: 0, description: '' })
    setShowNewDealForm(false)
  }

  // 自社担当者名を解決
  const getAssigneeNames = (deal: typeof deals[0]) => {
    return deal.assigneeIds
      .map(id => staff.find(s => s.id === id)?.name)
      .filter(Boolean) as string[]
  }

  // インライン編集の保存
  const saveEdit = (dealId: string, field: string, value: string | number | boolean | string[]) => {
    const updates: Record<string, unknown> = { [field]: value, updatedAt: new Date().toISOString().split('T')[0] }
    updateDeal(dealId, updates)
    setEditingCell(null)
  }

  // NDA/契約ステータスのサイクル切替
  const cycleContractStatus = (dealId: string, field: 'ndaStatus' | 'contractStatus', current: ContractStatus) => {
    const idx = CONTRACT_STATUSES.indexOf(current)
    const next = CONTRACT_STATUSES[(idx + 1) % CONTRACT_STATUSES.length]
    saveEdit(dealId, field, next)
  }

  const isEditing = (dealId: string, field: string) =>
    editingCell?.dealId === dealId && editingCell?.field === field

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* 検索 + フィルタ */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="案件名・企業名で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400"
            />
          </div>
          <button
            onClick={() => setShowNewDealForm(!showNewDealForm)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            新規案件
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DealStatus | 'all')}
              className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            >
              <option value="all">全ステータス</option>
              {DEAL_STATUSES.map((s) => (
                <option key={s} value={s}>{DEAL_STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as LeadSource | 'all')}
            className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
          >
            <option value="all">全リード元</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>{LEAD_SOURCE_CONFIG[s].label}</option>
            ))}
          </select>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
          >
            <option value="all">全担当者</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 新規案件フォーム */}
      {showNewDealForm && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-800">新規案件を追加</h3>
            <button onClick={() => setShowNewDealForm(false)} className="p-1 text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">案件名 *</label>
              <input
                type="text"
                value={newDeal.title}
                onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400"
                placeholder="案件名を入力"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">取引先 *</label>
              <select
                value={newDeal.companyId}
                onChange={(e) => setNewDeal({ ...newDeal, companyId: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400"
              >
                <option value="">選択してください</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">リード元</label>
              <select
                value={newDeal.leadSource}
                onChange={(e) => setNewDeal({ ...newDeal, leadSource: e.target.value as LeadSource })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400"
              >
                {LEAD_SOURCES.map((s) => (
                  <option key={s} value={s}>{LEAD_SOURCE_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">見込金額</label>
              <input
                type="number"
                value={newDeal.amount || ''}
                onChange={(e) => setNewDeal({ ...newDeal, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400"
                placeholder="0"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-500 mb-1">担当者</label>
              <div className="flex flex-wrap gap-1.5">
                {staff.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      const ids = newDeal.assigneeIds.includes(s.id)
                        ? newDeal.assigneeIds.filter(id => id !== s.id)
                        : [...newDeal.assigneeIds, s.id]
                      setNewDeal({ ...newDeal, assigneeIds: ids })
                    }}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                      newDeal.assigneeIds.includes(s.id)
                        ? 'bg-slate-700 text-white border-slate-700'
                        : 'border-stone-200 text-stone-500 hover:border-stone-300'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-500 mb-1">説明</label>
              <input
                type="text"
                value={newDeal.description}
                onChange={(e) => setNewDeal({ ...newDeal, description: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400"
                placeholder="案件の説明"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowNewDealForm(false)}
              className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleAddDeal}
              disabled={!newDeal.title || !newDeal.companyId}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              追加
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-stone-500">{filteredDeals.length}件の案件</p>

      {/* テーブル */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-3 py-3 text-left text-xs font-medium text-stone-500 sticky left-0 bg-stone-50 z-10">ステータス</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-stone-500">案件名</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-stone-500">取引先</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-stone-500">業種</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-stone-500">担当</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-stone-500">見込金額</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-stone-500">確度</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-stone-500">リード元</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-stone-500">次回商談</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-stone-500">次回フォロー</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-stone-500">NDA</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-stone-500">契約</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-stone-500">お礼</th>
                <th className="px-3 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredDeals.map((deal) => {
                const statusConf = DEAL_STATUS_CONFIG[deal.status]
                const sourceConf = LEAD_SOURCE_CONFIG[deal.leadSource]
                const ndaConf = CONTRACT_STATUS_CONFIG[deal.ndaStatus]
                const contractConf = CONTRACT_STATUS_CONFIG[deal.contractStatus]

                return (
                  <tr key={deal.id} className="hover:bg-stone-50 transition-colors group">
                    {/* ステータス（インライン編集） */}
                    <td className="px-3 py-2.5 sticky left-0 bg-white group-hover:bg-stone-50 z-10">
                      {isEditing(deal.id, 'status') ? (
                        <select
                          ref={inputRef as React.RefObject<HTMLSelectElement>}
                          value={deal.status}
                          onChange={(e) => saveEdit(deal.id, 'status', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          className="text-xs px-1.5 py-0.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
                        >
                          {DEAL_STATUSES.map((s) => (
                            <option key={s} value={s}>{DEAL_STATUS_CONFIG[s].label}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingCell({ dealId: deal.id, field: 'status' }) }}
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${statusConf.bg} ${statusConf.color} hover:opacity-80 cursor-pointer`}
                          title="クリックで変更"
                        >
                          {statusConf.label}
                        </button>
                      )}
                    </td>

                    {/* 案件名（クリックで案件ルームへ） */}
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => handleDealClick(deal.id)}
                        className="font-medium text-stone-800 hover:text-slate-600 hover:underline text-left"
                      >
                        {deal.title}
                      </button>
                    </td>

                    {/* 取引先（表示のみ） */}
                    <td className="px-3 py-2.5 text-stone-600 cursor-pointer" onClick={() => handleDealClick(deal.id)}>{deal.companyName}</td>

                    {/* 業種（表示のみ） */}
                    <td className="px-3 py-2.5 text-stone-500 cursor-pointer" onClick={() => handleDealClick(deal.id)}>{deal.industry}</td>

                    {/* 担当（インライン編集・複数選択） */}
                    <td className="px-3 py-2.5">
                      {isEditing(deal.id, 'assigneeIds') ? (
                        <div className="flex flex-wrap gap-1">
                          {staff.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                const ids = deal.assigneeIds.includes(s.id)
                                  ? deal.assigneeIds.filter(id => id !== s.id)
                                  : [...deal.assigneeIds, s.id]
                                updateDeal(deal.id, { assigneeIds: ids, updatedAt: new Date().toISOString().split('T')[0] })
                              }}
                              className={`px-1.5 py-0.5 text-xs rounded-full border transition-colors ${
                                deal.assigneeIds.includes(s.id)
                                  ? 'bg-slate-700 text-white border-slate-700'
                                  : 'border-stone-200 text-stone-500 hover:border-stone-300'
                              }`}
                            >
                              {s.name}
                            </button>
                          ))}
                          <button
                            onClick={() => setEditingCell(null)}
                            className="px-1.5 py-0.5 text-xs text-stone-400 hover:text-stone-600"
                          >
                            完了
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingCell({ dealId: deal.id, field: 'assigneeIds' }) }}
                          className="text-stone-600 hover:text-slate-800 hover:bg-slate-100 px-1 py-0.5 rounded cursor-pointer"
                          title="クリックで変更"
                        >
                          {getAssigneeNames(deal).join('、') || '—'}
                        </button>
                      )}
                    </td>

                    {/* 見込金額（インライン編集） */}
                    <td className="px-3 py-2.5 text-right">
                      {isEditing(deal.id, 'amount') ? (
                        <input
                          ref={inputRef as React.RefObject<HTMLInputElement>}
                          type="number"
                          defaultValue={deal.amount}
                          onBlur={(e) => saveEdit(deal.id, 'amount', Number(e.target.value))}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(deal.id, 'amount', Number((e.target as HTMLInputElement).value)) }}
                          className="w-24 text-xs px-1.5 py-0.5 border border-slate-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingCell({ dealId: deal.id, field: 'amount' }) }}
                          className="font-medium text-stone-700 hover:bg-slate-100 px-1 py-0.5 rounded cursor-pointer"
                          title="クリックで変更"
                        >
                          {(deal.amount / 10000).toLocaleString()}万
                        </button>
                      )}
                    </td>

                    {/* 確度（インライン編集） */}
                    <td className="px-3 py-2.5">
                      {isEditing(deal.id, 'probability') ? (
                        <input
                          ref={inputRef as React.RefObject<HTMLInputElement>}
                          type="number"
                          min={0}
                          max={100}
                          defaultValue={deal.probability}
                          onBlur={(e) => saveEdit(deal.id, 'probability', Number(e.target.value))}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(deal.id, 'probability', Number((e.target as HTMLInputElement).value)) }}
                          className="w-14 text-xs px-1.5 py-0.5 border border-slate-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingCell({ dealId: deal.id, field: 'probability' }) }}
                          className="flex items-center gap-1 mx-auto hover:bg-slate-100 px-1 py-0.5 rounded cursor-pointer"
                          title="クリックで変更"
                        >
                          <div className="w-12 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-slate-500 to-slate-700 rounded-full"
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                          <span className="text-xs text-stone-500">{deal.probability}%</span>
                        </button>
                      )}
                    </td>

                    {/* リード元（表示のみ） */}
                    <td className="px-3 py-2.5 cursor-pointer" onClick={() => handleDealClick(deal.id)}>
                      <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">{sourceConf.label}</span>
                    </td>

                    {/* 次回商談（表示のみ） */}
                    <td className="px-3 py-2.5 cursor-pointer" onClick={() => handleDealClick(deal.id)}>
                      {(() => {
                        const today = new Date().toISOString().split('T')[0]
                        const next = meetings
                          .filter((m) => m.dealId === deal.id && m.date >= today)
                          .sort((a, b) => a.date.localeCompare(b.date))[0]
                        return next ? (
                          <span className="text-xs text-stone-600">{next.date} {next.time}</span>
                        ) : (
                          <span className="text-xs text-stone-300">—</span>
                        )
                      })()}
                    </td>

                    {/* 次回フォロー（インライン編集） */}
                    <td className="px-3 py-2.5">
                      {isEditing(deal.id, 'nextFollowUp') ? (
                        <input
                          ref={inputRef as React.RefObject<HTMLInputElement>}
                          type="date"
                          defaultValue={deal.nextFollowUp}
                          onBlur={(e) => saveEdit(deal.id, 'nextFollowUp', e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(deal.id, 'nextFollowUp', (e.target as HTMLInputElement).value) }}
                          className="text-xs px-1.5 py-0.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingCell({ dealId: deal.id, field: 'nextFollowUp' }) }}
                          className="text-xs text-stone-500 hover:bg-slate-100 px-1 py-0.5 rounded cursor-pointer"
                          title="クリックで変更"
                        >
                          {deal.nextFollowUp || '—'}
                        </button>
                      )}
                    </td>

                    {/* NDA（クリックでサイクル切替） */}
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); cycleContractStatus(deal.id, 'ndaStatus', deal.ndaStatus) }}
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${ndaConf.bg} ${ndaConf.color} hover:opacity-80 cursor-pointer`}
                        title="クリックで切替"
                      >
                        {ndaConf.label}
                      </button>
                    </td>

                    {/* 契約（クリックでサイクル切替） */}
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); cycleContractStatus(deal.id, 'contractStatus', deal.contractStatus) }}
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${contractConf.bg} ${contractConf.color} hover:opacity-80 cursor-pointer`}
                        title="クリックで切替"
                      >
                        {contractConf.label}
                      </button>
                    </td>

                    {/* お礼メール（トグル） */}
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); saveEdit(deal.id, 'thanksEmailDone', !deal.thanksEmailDone) }}
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          deal.thanksEmailDone
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-stone-300 hover:bg-stone-100'
                        }`}
                        title={deal.thanksEmailDone ? 'お礼メール送信済み' : 'お礼メール未送信'}
                      >
                        {deal.thanksEmailDone ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* 削除 */}
                    <td className="px-3 py-2.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); if (window.confirm('この案件を削除しますか？')) deleteDeal(deal.id) }}
                        className="p-1 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredDeals.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            <p>該当する案件がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DealListPage
