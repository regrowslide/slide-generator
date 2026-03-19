import type { DealStatus, LeadSource, EstimateStatus, FileType, ContractStatus } from './types'

// ステータスラベル・色マップ（10段階）
export const DEAL_STATUS_CONFIG: Record<DealStatus, { label: string; color: string; bg: string }> = {
  'entry': { label: 'エントリー済', color: 'text-sky-700', bg: 'bg-sky-100' },
  'pre-meeting': { label: '商談準備', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  'meeting': { label: '商談中', color: 'text-amber-700', bg: 'bg-amber-100' },
  'proposal': { label: '提案中', color: 'text-purple-700', bg: 'bg-purple-100' },
  'estimate-sent': { label: '見積提出', color: 'text-blue-700', bg: 'bg-blue-100' },
  'won': { label: '受注', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  'in-progress': { label: '進行中', color: 'text-teal-700', bg: 'bg-teal-100' },
  'completed': { label: '完了', color: 'text-stone-700', bg: 'bg-stone-200' },
  'lost': { label: '失注', color: 'text-red-700', bg: 'bg-red-100' },
  'on-hold': { label: '保留', color: 'text-orange-700', bg: 'bg-orange-100' },
}

export const LEAD_SOURCE_CONFIG: Record<LeadSource, { label: string }> = {
  matching: { label: 'マッチング' },
  advisor: { label: '顧問紹介' },
  web: { label: 'Web問合せ' },
  exhibition: { label: '展示会' },
  'cold-call': { label: 'テレアポ' },
  existing: { label: '既存顧客' },
}

export const CONTRACT_STATUS_CONFIG: Record<ContractStatus, { label: string; color: string; bg: string }> = {
  none: { label: '未着手', color: 'text-stone-500', bg: 'bg-stone-100' },
  preparing: { label: '準備中', color: 'text-amber-700', bg: 'bg-amber-100' },
  sent: { label: '送付済', color: 'text-blue-700', bg: 'bg-blue-100' },
  signed: { label: '締結済', color: 'text-emerald-700', bg: 'bg-emerald-100' },
}

export const ESTIMATE_STATUS_CONFIG: Record<EstimateStatus, { label: string; color: string; bg: string }> = {
  draft: { label: '下書き', color: 'text-slate-700', bg: 'bg-slate-100' },
  sent: { label: '送付済', color: 'text-blue-700', bg: 'bg-blue-100' },
  approved: { label: '承認済', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  rejected: { label: '却下', color: 'text-red-700', bg: 'bg-red-100' },
}

export const FILE_TYPE_CONFIG: Record<FileType, { label: string; icon: string }> = {
  estimate: { label: '見積書', icon: '📄' },
  contract: { label: '契約書', icon: '📋' },
  nda: { label: 'NDA', icon: '🔒' },
  minutes: { label: '議事録', icon: '📝' },
  proposal: { label: '提案書', icon: '📊' },
  rfp: { label: 'RFP', icon: '📑' },
  other: { label: 'その他', icon: '📎' },
}

export const DEAL_STATUSES: DealStatus[] = ['entry', 'pre-meeting', 'meeting', 'proposal', 'estimate-sent', 'won', 'in-progress', 'completed', 'lost', 'on-hold']
export const LEAD_SOURCES: LeadSource[] = ['matching', 'advisor', 'web', 'exhibition', 'cold-call', 'existing']
export const CONTRACT_STATUSES: ContractStatus[] = ['none', 'preparing', 'sent', 'signed']
