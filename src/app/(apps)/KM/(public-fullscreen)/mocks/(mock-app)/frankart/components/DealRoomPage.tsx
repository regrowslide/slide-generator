'use client'

import React, { useState, useRef } from 'react'
import { ArrowLeft, Handshake, MessageSquare, CheckSquare, FileText, Folder, Shield, Mail, Check, X, Pencil } from 'lucide-react'
import { useFrankartMockData } from '../context/MockDataContext'
import {
  DEAL_STATUS_CONFIG,
  DEAL_STATUSES,
  LEAD_SOURCE_CONFIG,
  LEAD_SOURCES,
  CONTRACT_STATUS_CONFIG,
  CONTRACT_STATUSES,
} from './constants'
import type { DealStatus, LeadSource, ContractStatus } from './types'
import DealRoomChat from './DealRoomChat'
import DealRoomTodo from './DealRoomTodo'
import DealRoomEstimate from './DealRoomEstimate'
import DealRoomFiles from './DealRoomFiles'
import DealRoomContract from './DealRoomContract'
import DealRoomEmail from './DealRoomEmail'
import DealRoomMeetings from './DealRoomMeetings'

type TabId = 'meetings' | 'chat' | 'todo' | 'estimate' | 'files' | 'contract' | 'email'

type Props = {
  onNavigate: (page: string) => void
}

// 編集可能フィールドコンポーネント
const EditableField = ({
  label,
  value,
  onSave,
  type = 'text',
  options,
  suffix,
  displayValue,
}: {
  label: string
  value: string | number
  onSave: (val: string | number) => void
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea'
  options?: { value: string; label: string }[]
  suffix?: string
  displayValue?: string
}) => {
  const [editing, setEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(null)

  const startEdit = () => {
    setLocalValue(value)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const save = () => {
    onSave(type === 'number' ? Number(localValue) : localValue)
    setEditing(false)
  }

  const cancel = () => {
    setLocalValue(value)
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') save()
    if (e.key === 'Escape') cancel()
  }

  if (editing) {
    return (
      <div className="flex items-start gap-2">
        <span className="text-xs text-stone-500 w-24 shrink-0 pt-1.5">{label}</span>
        <div className="flex-1 flex items-center gap-1">
          {type === 'select' && options ? (
            <select
              ref={inputRef as React.RefObject<HTMLSelectElement>}
              value={localValue}
              onChange={(e) => { setLocalValue(e.target.value); onSave(e.target.value); setEditing(false) }}
              onBlur={() => setEditing(false)}
              className="flex-1 text-sm px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : type === 'textarea' ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => { if (e.key === 'Escape') cancel() }}
              rows={2}
              className="flex-1 text-sm px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none"
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={type}
              value={localValue}
              onChange={(e) => setLocalValue(type === 'number' ? e.target.value : e.target.value)}
              onBlur={save}
              onKeyDown={handleKeyDown}
              className="flex-1 text-sm px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
              min={type === 'number' ? 0 : undefined}
            />
          )}
          {suffix && <span className="text-xs text-stone-400">{suffix}</span>}
        </div>
      </div>
    )
  }

  const display = displayValue ?? (suffix ? `${value}${suffix}` : String(value || '—'))

  return (
    <div className="flex items-start gap-2 group">
      <span className="text-xs text-stone-500 w-24 shrink-0 pt-0.5">{label}</span>
      <button
        onClick={startEdit}
        className="flex-1 text-sm text-stone-800 text-left hover:bg-slate-50 px-1.5 py-0.5 -mx-1.5 rounded transition-colors flex items-center gap-1 min-h-[24px]"
      >
        <span className="flex-1">{display}</span>
        <Pencil className="w-3 h-3 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </button>
    </div>
  )
}

// トグルフィールド
const ToggleField = ({
  label,
  value,
  onToggle,
  trueLabel = 'はい',
  falseLabel = 'いいえ',
}: {
  label: string
  value: boolean
  onToggle: () => void
  trueLabel?: string
  falseLabel?: string
}) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-stone-500 w-24 shrink-0">{label}</span>
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
        value
          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
      }`}
    >
      {value ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {value ? trueLabel : falseLabel}
    </button>
  </div>
)

// バッジフィールド（ContractStatus用）
const BadgeField = ({
  label,
  value,
  config,
  statuses,
  onSave,
}: {
  label: string
  value: ContractStatus
  config: Record<ContractStatus, { label: string; color: string; bg: string }>
  statuses: ContractStatus[]
  onSave: (val: ContractStatus) => void
}) => {
  const [editing, setEditing] = useState(false)
  const conf = config[value]

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-500 w-24 shrink-0">{label}</span>
        <div className="flex gap-1 flex-wrap">
          {statuses.map((s) => {
            const c = config[s]
            return (
              <button
                key={s}
                onClick={() => { onSave(s); setEditing(false) }}
                className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                  value === s
                    ? `${c.bg} ${c.color} border-current`
                    : 'border-stone-200 text-stone-400 hover:border-stone-300'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-xs text-stone-500 w-24 shrink-0">{label}</span>
      <button
        onClick={() => setEditing(true)}
        className={`px-2 py-0.5 text-xs font-medium rounded-full ${conf.bg} ${conf.color} hover:opacity-80`}
      >
        {conf.label}
      </button>
      <Pencil className="w-3 h-3 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  )
}

const DealRoomPage: React.FC<Props> = ({ onNavigate }) => {
  const { deals, selectedDealId, selectDeal, updateDeal, chatMessages, todos, estimates, files, staff, meetings, companies } = useFrankartMockData()
  const [activeTab, setActiveTab] = useState<TabId>('meetings')

  const deal = deals.find((d) => d.id === selectedDealId)

  if (!deal) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-stone-500 mb-4">案件が選択されていません</p>
        <button
          onClick={() => onNavigate('deal-list')}
          className="text-sm text-slate-600 hover:text-slate-800 underline"
        >
          案件一覧に戻る
        </button>
      </div>
    )
  }

  const statusConf = DEAL_STATUS_CONFIG[deal.status]

  const chatCount = chatMessages.filter((m) => m.dealId === deal.id).length
  const todoCount = todos.filter((t) => t.dealId === deal.id && !t.completed).length
  const estCount = estimates.filter((e) => e.dealId === deal.id).length
  const fileCount = files.filter((f) => f.dealId === deal.id).length

  const meetingCount = meetings.filter((m) => m.dealId === deal.id).length

  const tabs: { id: TabId; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'meetings', label: '商談', icon: Handshake, count: meetingCount },
    { id: 'chat', label: 'チャット', icon: MessageSquare, count: chatCount },
    { id: 'todo', label: 'ToDo', icon: CheckSquare, count: todoCount },
    { id: 'estimate', label: '見積', icon: FileText, count: estCount },
    { id: 'contract', label: '契約・NDA', icon: Shield, count: 0 },
    { id: 'files', label: 'ファイル', icon: Folder, count: fileCount },
    { id: 'email', label: 'メール', icon: Mail, count: 0 },
  ]

  // 取引先担当者名を解決
  const getContactNames = (d: typeof deal) => {
    const company = companies.find(c => c.id === d.companyId)
    if (!company) return []
    return d.contactIds
      .map(id => company.contacts.find(ct => ct.id === id)?.name)
      .filter(Boolean) as string[]
  }

  // 自社担当者名を解決
  const getAssigneeNames = (d: typeof deal) => {
    return d.assigneeIds
      .map(id => staff.find(s => s.id === id)?.name)
      .filter(Boolean) as string[]
  }

  // 更新ヘルパー
  const update = (field: string, value: unknown) => {
    const updates: Record<string, unknown> = { [field]: value, updatedAt: new Date().toISOString().split('T')[0] }
    updateDeal(deal.id, updates)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* 戻るボタン */}
      <button
        onClick={() => { selectDeal(null); onNavigate('deal-list') }}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        案件一覧に戻る
      </button>

      {/* 案件ヘッダー */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-stone-800">{deal.title}</h2>
          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusConf.bg} ${statusConf.color}`}>
            {statusConf.label}
          </span>
        </div>

        {/* 詳細グリッド */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 基本情報 */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">基本情報</h3>
            <EditableField label="案件名" value={deal.title} onSave={(v) => update('title', v)} />
            <EditableField label="取引先" value={deal.companyName} onSave={(v) => update('companyName', v)} />
            {/* 先方担当（複数選択） */}
            <div className="flex items-start gap-2">
              <span className="text-xs text-stone-500 w-24 shrink-0 pt-1">先方担当</span>
              <div className="flex flex-wrap gap-1">
                {(() => {
                  const company = companies.find(c => c.id === deal.companyId)
                  return company?.contacts.map((ct) => (
                    <button
                      key={ct.id}
                      onClick={() => {
                        const ids = deal.contactIds.includes(ct.id)
                          ? deal.contactIds.filter(id => id !== ct.id)
                          : [...deal.contactIds, ct.id]
                        update('contactIds', ids)
                      }}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        deal.contactIds.includes(ct.id)
                          ? 'bg-slate-700 text-white border-slate-700'
                          : 'border-stone-200 text-stone-500 hover:border-stone-300'
                      }`}
                    >
                      {ct.name}
                    </button>
                  )) || <span className="text-xs text-stone-400">取引先を選択してください</span>
                })()}
              </div>
            </div>
            <EditableField label="業種" value={deal.industry} onSave={(v) => update('industry', v)} />
            {/* 担当者（複数選択） */}
            <div className="flex items-start gap-2">
              <span className="text-xs text-stone-500 w-24 shrink-0 pt-1">担当者</span>
              <div className="flex flex-wrap gap-1">
                {staff.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      const ids = deal.assigneeIds.includes(s.id)
                        ? deal.assigneeIds.filter(id => id !== s.id)
                        : [...deal.assigneeIds, s.id]
                      update('assigneeIds', ids)
                    }}
                    className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                      deal.assigneeIds.includes(s.id)
                        ? 'bg-slate-700 text-white border-slate-700'
                        : 'border-stone-200 text-stone-500 hover:border-stone-300'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            <EditableField label="概要" value={deal.description} onSave={(v) => update('description', v)} type="textarea" />
          </div>

          {/* 営業情報 */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">営業情報</h3>
            <EditableField
              label="ステータス"
              value={deal.status}
              onSave={(v) => update('status', v)}
              type="select"
              options={DEAL_STATUSES.map((s) => ({ value: s, label: DEAL_STATUS_CONFIG[s].label }))}
              displayValue={statusConf.label}
            />
            <EditableField
              label="リード元"
              value={deal.leadSource}
              onSave={(v) => update('leadSource', v)}
              type="select"
              options={LEAD_SOURCES.map((s) => ({ value: s, label: LEAD_SOURCE_CONFIG[s].label }))}
              displayValue={LEAD_SOURCE_CONFIG[deal.leadSource].label}
            />
            {deal.leadSource === 'matching' && (
              <EditableField label="サービス名" value={deal.matchingService} onSave={(v) => update('matchingService', v)} />
            )}
            {deal.leadSource === 'advisor' && (
              <EditableField label="紹介顧問" value={deal.referralAdvisor} onSave={(v) => update('referralAdvisor', v)} />
            )}
            <EditableField label="エントリー日" value={deal.entryDate} onSave={(v) => update('entryDate', v)} type="date" />
            <EditableField label="見込金額" value={deal.amount} onSave={(v) => update('amount', v)} type="number" suffix="円" displayValue={`${deal.amount.toLocaleString()}円`} />
            <EditableField label="確度" value={deal.probability} onSave={(v) => update('probability', v)} type="number" suffix="%" />
            <EditableField label="次回フォロー" value={deal.nextFollowUp} onSave={(v) => update('nextFollowUp', v)} type="date" />
          </div>

          {/* 契約・管理 */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">契約・管理</h3>
            <BadgeField label="NDA" value={deal.ndaStatus} config={CONTRACT_STATUS_CONFIG} statuses={CONTRACT_STATUSES} onSave={(v) => update('ndaStatus', v)} />
            <BadgeField label="契約" value={deal.contractStatus} config={CONTRACT_STATUS_CONFIG} statuses={CONTRACT_STATUSES} onSave={(v) => update('contractStatus', v)} />
            <EditableField label="契約更新日" value={deal.contractRenewalDate} onSave={(v) => update('contractRenewalDate', v)} type="date" />
            <EditableField label="技術同席" value={deal.techAttendee} onSave={(v) => update('techAttendee', v)} />
            <ToggleField label="お礼メール" value={deal.thanksEmailDone} onToggle={() => update('thanksEmailDone', !deal.thanksEmailDone)} trueLabel="送信済" falseLabel="未送信" />
            <ToggleField label="顧問報酬" value={deal.advisorFeeRequired} onToggle={() => update('advisorFeeRequired', !deal.advisorFeeRequired)} trueLabel="あり" falseLabel="なし" />
            {deal.advisorFeeRequired && (
              <EditableField label="報酬額" value={deal.advisorFeeAmount} onSave={(v) => update('advisorFeeAmount', v)} type="number" suffix="円" displayValue={`${deal.advisorFeeAmount.toLocaleString()}円`} />
            )}
          </div>
        </div>
      </div>

      {/* タブ */}
      <div className="flex gap-1 border-b border-stone-200">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                active
                  ? 'border-slate-700 text-slate-800'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-slate-200 text-slate-700' : 'bg-stone-100 text-stone-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {activeTab === 'meetings' && <DealRoomMeetings dealId={deal.id} />}
      {activeTab === 'chat' && <DealRoomChat dealId={deal.id} />}
      {activeTab === 'todo' && <DealRoomTodo dealId={deal.id} />}
      {activeTab === 'estimate' && <DealRoomEstimate dealId={deal.id} />}
      {activeTab === 'files' && <DealRoomFiles dealId={deal.id} />}
      {activeTab === 'contract' && <DealRoomContract dealId={deal.id} />}
      {activeTab === 'email' && <DealRoomEmail dealId={deal.id} />}
    </div>
  )
}

export default DealRoomPage
