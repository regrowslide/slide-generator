'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Building2, Users, Menu, X, Phone, Mail, MapPin,
  MessageCircle, Send, Wrench, ChevronDown, Home, Plus, Pencil, Trash2,
  LayoutDashboard, UserCheck, HardHat, FileUp, Clock, Bell, Calendar,
  CheckCircle2, AlertCircle, TrendingUp, Eye, Download, Upload,
  ChevronRight, ArrowLeft, Loader2,
} from 'lucide-react'
import { uploadEarthFile, deleteEarthFile } from './_actions'
import { EarthDataProvider, useData } from './context/EarthDataContext'
import { Button, FormField, FormInput, FormSelect, Modal, StatusBadge, PriorityBadge, SearchBar, SelectBox, SplashScreen } from './components/ui'
import { MONTHLY_SALES, STORED_FILES, PORTAL_USERS } from './lib/mockData'
import type { Owner, Property, Tenant, ActionItem, RepairRecord, RepairVendor, RepairRequest, ChatMessage, BlobFile, PortalType } from './lib/types'

// =============================================================================
// ユーティリティ
// =============================================================================

const nowTimestamp = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// =============================================================================
// Sidebar + PortalSwitcher
// =============================================================================

const STAFF_MENU = [
  { key: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { key: 'owners', label: 'オーナー管理', icon: Users },
  { key: 'properties', label: '物件管理', icon: Building2 },
  { key: 'vendors', label: '修繕業者管理', icon: HardHat },
  { key: 'tenants', label: '入居者管理', icon: UserCheck },
]

const PortalSwitcher = () => {
  const { portal, setPortal, currentUser } = useData()
  const [open, setOpen] = useState(false)
  const labels: Record<PortalType, string> = { staff: '社内', owner: 'オーナー', vendor: '修繕業者' }
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg text-sm text-white hover:bg-white/30 transition-colors">
        <span>{labels[portal]}：{currentUser.name}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-50 py-1">
          {(Object.keys(PORTAL_USERS) as PortalType[]).map(p => (
            <button key={p} onClick={() => { setPortal(p); setOpen(false) }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors ${portal === p ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700'}`}>
              {labels[p]}：{PORTAL_USERS[p].name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const Sidebar = ({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) => {
  const { activePage, setActivePage, setWorkspacePropertyId } = useData()
  const nav = (key: string) => { setActivePage(key); setWorkspacePropertyId(null); onClose() }
  const content = (
    <nav className="p-3 space-y-1">
      {STAFF_MENU.map(item => {
        const Icon = item.icon
        const active = activePage === item.key
        return (
          <button key={item.key} onClick={() => nav(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Icon className="w-5 h-5" />{item.label}
          </button>
        )
      })}
    </nav>
  )
  return (
    <>
      <aside className="hidden lg:block w-56 border-r border-slate-200 bg-white shrink-0 overflow-y-auto">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={onClose}>
          <div className="absolute inset-0 bg-black/40" />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="font-bold text-slate-800">メニュー</span>
              <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  )
}

// =============================================================================
// ダッシュボード
// =============================================================================

const Dashboard = () => {
  const { actionItems, properties, chatMessages, setActivePage, setWorkspacePropertyId } = useData()
  const pending = actionItems.filter(a => a.status !== '完了')
  const overdue = pending.filter(a => new Date(a.dueDate) < new Date('2026-03-04'))
  const unreadOwnerChats = chatMessages.filter(m => m.chatType === 'owner' && m.senderRole === 'owner').length
  const maxRevenue = Math.max(...MONTHLY_SALES.map(s => s.revenue))

  const goWorkspace = (propertyId: string) => { setWorkspacePropertyId(propertyId); setActivePage('workspace') }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-1"><AlertCircle className="w-5 h-5" /><span className="text-sm font-medium">未完了タスク</span></div>
          <p className="text-2xl font-bold text-slate-800">{pending.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-red-600 mb-1"><Clock className="w-5 h-5" /><span className="text-sm font-medium">期限切れ</span></div>
          <p className="text-2xl font-bold text-slate-800">{overdue.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 mb-1"><Bell className="w-5 h-5" /><span className="text-sm font-medium">未読チャット</span></div>
          <p className="text-2xl font-bold text-slate-800">{unreadOwnerChats}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-green-600 mb-1"><Building2 className="w-5 h-5" /><span className="text-sm font-medium">管理物件</span></div>
          <p className="text-2xl font-bold text-slate-800">{properties.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" />売上推移（月間）</h3>
        <div className="flex items-end gap-2 h-40">
          {MONTHLY_SALES.map(s => (
            <div key={s.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-slate-500">{(s.revenue / 10000).toFixed(0)}万</span>
              <div className="w-full bg-gradient-to-t from-indigo-500 to-blue-400 rounded-t-md transition-all" style={{ height: `${(s.revenue / maxRevenue) * 100}%` }} />
              <span className="text-[10px] text-slate-400">{s.month.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-3">要対応事項</h3>
        <div className="space-y-2">
          {pending.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 8).map(item => {
            const prop = properties.find(p => p.id === item.propertyId)
            const isOverdue = new Date(item.dueDate) < new Date('2026-03-04')
            return (
              <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-indigo-50/50 ${isOverdue ? 'border-red-200 bg-red-50/50' : 'border-slate-200'}`}
                onClick={() => goWorkspace(item.propertyId)}>
                <div className="flex items-center gap-3 min-w-0">
                  <PriorityBadge priority={item.priority} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                    <p className="text-xs text-slate-400">{prop?.name} / 担当: {item.assignee}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>{item.dueDate}</span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// オーナー管理
// =============================================================================

const EMPTY_OWNER: Owner = { id: '', name: '', category: '個人', phone: '', email: '', contractType: '受託管理', propertyCount: 0 }

const OwnerListTab = () => {
  const { owners, setOwners, properties, setActivePage, setWorkspacePropertyId } = useData()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)
  const [editOwner, setEditOwner] = useState<Owner | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Owner | null>(null)

  const filtered = useMemo(() =>
    owners.filter(o => (o.name.includes(search) || o.phone.includes(search) || o.email.includes(search)) && (!filterType || o.contractType === filterType)),
    [owners, search, filterType])

  const ownerProperties = useMemo(() => selectedOwner ? properties.filter(p => p.ownerId === selectedOwner.id) : [], [selectedOwner, properties])

  const nextId = useCallback(() => {
    const max = owners.reduce((m, o) => Math.max(m, parseInt(o.id.replace('O', ''), 10)), 0)
    return `O${String(max + 1).padStart(3, '0')}`
  }, [owners])

  const handleSave = () => {
    if (!editOwner || !editOwner.name.trim()) return
    if (editOwner.id) setOwners(prev => prev.map(o => o.id === editOwner.id ? { ...editOwner, propertyCount: properties.filter(p => p.ownerId === editOwner.id).length } : o))
    else setOwners(prev => [...prev, { ...editOwner, id: nextId(), propertyCount: 0 }])
    setEditOwner(null)
  }

  const handleDelete = () => { if (!deleteTarget) return; setOwners(prev => prev.filter(o => o.id !== deleteTarget.id)); setDeleteTarget(null); setSelectedOwner(null) }

  const goWorkspace = (propertyId: string) => { setSelectedOwner(null); setWorkspacePropertyId(propertyId); setActivePage('workspace') }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="オーナー名・電話番号で検索..." /></div>
        <SelectBox value={filterType} onChange={setFilterType} options={[{ value: '受託管理', label: '受託管理' }, { value: 'サブリース', label: 'サブリース' }]} placeholder="すべての契約タイプ" className="w-full sm:w-44" />
        <Button onClick={() => setEditOwner({ ...EMPTY_OWNER })}><Plus className="w-4 h-4 mr-1" />新規追加</Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">オーナー名</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">区分</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">電話番号</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">契約タイプ</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-600">物件数</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-600 w-24">操作</th>
            </tr></thead>
            <tbody>
              {filtered.map(owner => (
                <tr key={owner.id} className="border-b border-slate-100 hover:bg-indigo-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 cursor-pointer" onClick={() => setSelectedOwner(owner)}>{owner.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell"><StatusBadge status={owner.category} /></td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{owner.phone}</td>
                  <td className="px-4 py-3"><StatusBadge status={owner.contractType} /></td>
                  <td className="px-4 py-3 text-center text-slate-700 font-medium">{properties.filter(p => p.ownerId === owner.id).length}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setEditOwner({ ...owner })} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteTarget(owner)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!selectedOwner} onClose={() => setSelectedOwner(null)} title={selectedOwner?.name ?? ''}>
        {selectedOwner && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-500 mb-3">基本情報</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-slate-400" /><span className="text-slate-600">区分:</span><StatusBadge status={selectedOwner.category} /></div>
                <div className="flex items-center gap-2 text-sm"><StatusBadge status={selectedOwner.contractType} /></div>
                <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-slate-400" /><span className="text-slate-500">{selectedOwner.phone}</span></div>
                <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-slate-400" /><span className="text-slate-500">{selectedOwner.email}</span></div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-500 mb-3">所有物件（{ownerProperties.length}件）</h4>
              <div className="space-y-2">
                {ownerProperties.map(prop => (
                  <div key={prop.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800">{prop.name}</span>
                      <button onClick={() => goWorkspace(prop.id)} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">ワークスペース<ChevronRight className="w-3 h-3" /></button>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1"><MapPin className="w-3 h-3" />{prop.address}</div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-600">総戸数: <b>{prop.totalUnits}</b></span>
                      <span className={prop.vacantUnits > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>空室: {prop.vacantUnits}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!editOwner} onClose={() => setEditOwner(null)} title={editOwner?.id ? 'オーナー編集' : 'オーナー新規追加'}>
        {editOwner && (
          <div className="space-y-4">
            <FormField label="オーナー名"><FormInput value={editOwner.name} onChange={v => setEditOwner({ ...editOwner, name: v })} placeholder="例: 山田太郎" /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="区分"><FormSelect value={editOwner.category} onChange={v => setEditOwner({ ...editOwner, category: v as Owner['category'] })} options={[{ value: '個人', label: '個人' }, { value: '法人', label: '法人' }]} /></FormField>
              <FormField label="契約タイプ"><FormSelect value={editOwner.contractType} onChange={v => setEditOwner({ ...editOwner, contractType: v as Owner['contractType'] })} options={[{ value: '受託管理', label: '受託管理' }, { value: 'サブリース', label: 'サブリース' }]} /></FormField>
            </div>
            <FormField label="電話番号"><FormInput value={editOwner.phone} onChange={v => setEditOwner({ ...editOwner, phone: v })} placeholder="090-1234-5678" /></FormField>
            <FormField label="メールアドレス"><FormInput value={editOwner.email} onChange={v => setEditOwner({ ...editOwner, email: v })} placeholder="owner@example.com" /></FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setEditOwner(null)}>キャンセル</Button>
              <Button onClick={handleSave}>{editOwner.id ? '更新' : '追加'}</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="オーナー削除の確認">
        {deleteTarget && (
          <div>
            <p className="text-sm text-slate-700 mb-4"><b>{deleteTarget.name}</b> を削除しますか？</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>キャンセル</Button>
              <Button variant="danger" onClick={handleDelete}>削除</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// =============================================================================
// 物件管理
// =============================================================================

const EMPTY_PROPERTY: Property = { id: '', ownerId: '', name: '', address: '', type: 'マンション', totalUnits: 0, vacantUnits: 0, assignees: [] }

const PropertyTab = () => {
  const { owners, properties, setProperties, tenants, setTenants, setActivePage, setWorkspacePropertyId } = useData()
  const [ownerFilter, setOwnerFilter] = useState('')
  const [editProperty, setEditProperty] = useState<Property | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null)
  const [tenantModalPropertyId, setTenantModalPropertyId] = useState<string | null>(null)
  const [editTenant, setEditTenant] = useState<Tenant | null>(null)
  const [deleteTenantTarget, setDeleteTenantTarget] = useState<Tenant | null>(null)

  const filtered = useMemo(() => properties.filter(p => !ownerFilter || p.ownerId === ownerFilter), [properties, ownerFilter])
  const ownerOptions = owners.map(o => ({ value: o.id, label: o.name }))

  const tenantModalProperty = tenantModalPropertyId ? properties.find(p => p.id === tenantModalPropertyId) : null
  const tenantModalTenants = useMemo(() => tenantModalPropertyId ? tenants.filter(t => t.propertyId === tenantModalPropertyId) : [], [tenants, tenantModalPropertyId])

  const nextId = useCallback(() => {
    const max = properties.reduce((m, p) => Math.max(m, parseInt(p.id.replace('P', ''), 10)), 0)
    return `P${String(max + 1).padStart(3, '0')}`
  }, [properties])

  const nextTenantId = useCallback(() => {
    const max = tenants.reduce((m, t) => Math.max(m, parseInt(t.id.replace('T', ''), 10)), 0)
    return `T${String(max + 1).padStart(3, '0')}`
  }, [tenants])

  const handleSave = () => {
    if (!editProperty || !editProperty.name.trim() || !editProperty.ownerId) return
    if (editProperty.id) setProperties(prev => prev.map(p => p.id === editProperty.id ? editProperty : p))
    else setProperties(prev => [...prev, { ...editProperty, id: nextId() }])
    setEditProperty(null)
  }

  const handleDelete = () => { if (!deleteTarget) return; setProperties(prev => prev.filter(p => p.id !== deleteTarget.id)); setDeleteTarget(null) }
  const goWorkspace = (propertyId: string) => { setWorkspacePropertyId(propertyId); setActivePage('workspace') }

  const handleTenantSave = () => {
    if (!editTenant || !editTenant.room.trim()) return
    if (editTenant.id) {
      setTenants(prev => prev.map(t => t.id === editTenant.id ? editTenant : t))
    } else {
      setTenants(prev => [...prev, { ...editTenant, id: nextTenantId(), propertyId: tenantModalPropertyId! }])
    }
    setEditTenant(null)
  }

  const handleTenantDelete = () => {
    if (!deleteTenantTarget) return
    setTenants(prev => prev.filter(t => t.id !== deleteTenantTarget.id))
    setDeleteTenantTarget(null)
  }

  const emptyTenant: Tenant = { id: '', propertyId: tenantModalPropertyId || '', room: '', name: '', rent: 0, contractStart: '', contractEnd: '', status: '空室' }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SelectBox value={ownerFilter} onChange={setOwnerFilter} options={ownerOptions} placeholder="すべてのオーナー" className="w-full sm:w-64" />
        <div className="flex-1" />
        <Button onClick={() => setEditProperty({ ...EMPTY_PROPERTY, ownerId: owners[0]?.id ?? '' })}><Plus className="w-4 h-4 mr-1" />新規追加</Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">物件名</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">住所</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">担当者</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-600">総戸数</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-600">空室</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-600 w-32">操作</th>
            </tr></thead>
            <tbody>
              {filtered.map(prop => {
                const owner = owners.find(o => o.id === prop.ownerId)
                return (
                  <tr key={prop.id} className="border-b border-slate-100 hover:bg-indigo-50/50 transition-colors">
                    <td className="px-4 py-3 cursor-pointer" onClick={() => goWorkspace(prop.id)}>
                      <div className="font-medium text-indigo-600 hover:text-indigo-800">{prop.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{owner?.name}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell text-xs">{prop.address}</td>
                    <td className="px-4 py-3 hidden sm:table-cell"><span className="text-xs text-slate-600">{prop.assignees.join(', ')}</span></td>
                    <td className="px-4 py-3 text-center text-slate-700">{prop.totalUnits}</td>
                    <td className="px-4 py-3 text-center"><span className={`font-medium ${prop.vacantUnits > 0 ? 'text-red-600' : 'text-green-600'}`}>{prop.vacantUnits}</span></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setTenantModalPropertyId(prop.id)} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="入居者管理"><UserCheck className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditProperty({ ...prop })} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteTarget(prop)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 物件編集モーダル */}
      <Modal isOpen={!!editProperty} onClose={() => setEditProperty(null)} title={editProperty?.id ? '物件編集' : '物件新規追加'}>
        {editProperty && (
          <div className="space-y-4">
            <FormField label="物件名"><FormInput value={editProperty.name} onChange={v => setEditProperty({ ...editProperty, name: v })} placeholder="サンプルマンションA" /></FormField>
            <FormField label="オーナー"><FormSelect value={editProperty.ownerId} onChange={v => setEditProperty({ ...editProperty, ownerId: v })} options={ownerOptions} /></FormField>
            <FormField label="住所"><FormInput value={editProperty.address} onChange={v => setEditProperty({ ...editProperty, address: v })} placeholder="東京都渋谷区..." /></FormField>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="種別"><FormSelect value={editProperty.type} onChange={v => setEditProperty({ ...editProperty, type: v })} options={[{ value: 'マンション', label: 'マンション' }, { value: 'アパート', label: 'アパート' }, { value: 'ビル', label: 'ビル' }]} /></FormField>
              <FormField label="総戸数"><FormInput type="number" value={editProperty.totalUnits} onChange={v => setEditProperty({ ...editProperty, totalUnits: parseInt(v) || 0 })} /></FormField>
              <FormField label="空室数"><FormInput type="number" value={editProperty.vacantUnits} onChange={v => setEditProperty({ ...editProperty, vacantUnits: parseInt(v) || 0 })} /></FormField>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setEditProperty(null)}>キャンセル</Button>
              <Button onClick={handleSave}>{editProperty.id ? '更新' : '追加'}</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="物件削除の確認">
        {deleteTarget && (
          <div>
            <p className="text-sm text-slate-700 mb-4"><b>{deleteTarget.name}</b> を削除しますか？</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>キャンセル</Button>
              <Button variant="danger" onClick={handleDelete}>削除</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 入居者管理モーダル */}
      <Modal isOpen={!!tenantModalPropertyId} onClose={() => { setTenantModalPropertyId(null); setEditTenant(null); setDeleteTenantTarget(null) }} title={`${tenantModalProperty?.name ?? ''} の入居者管理`}>
        {tenantModalPropertyId && !editTenant && !deleteTenantTarget && (
          <div>
            <div className="flex justify-end mb-3">
              <Button onClick={() => setEditTenant({ ...emptyTenant })}><Plus className="w-4 h-4 mr-1" />追加</Button>
            </div>
            {tenantModalTenants.length === 0 ? <p className="text-sm text-slate-400 text-center py-4">入居者がいません</p> : (
              <div className="space-y-2">
                {tenantModalTenants.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{t.room}</span>
                        <span className="text-sm text-slate-600">{t.name || '—'}</span>
                        <StatusBadge status={t.status} />
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        &yen;{t.rent.toLocaleString()} {t.contractStart ? `/ ${t.contractStart} 〜 ${t.contractEnd}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditTenant({ ...t })} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteTenantTarget(t)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {editTenant && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="部屋番号"><FormInput value={editTenant.room} onChange={v => setEditTenant({ ...editTenant, room: v })} placeholder="101" /></FormField>
              <FormField label="入居者名"><FormInput value={editTenant.name} onChange={v => setEditTenant({ ...editTenant, name: v })} placeholder="山田太郎" /></FormField>
            </div>
            <FormField label="家賃"><FormInput type="number" value={editTenant.rent} onChange={v => setEditTenant({ ...editTenant, rent: parseInt(v) || 0 })} /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="契約開始"><FormInput type="date" value={editTenant.contractStart} onChange={v => setEditTenant({ ...editTenant, contractStart: v })} /></FormField>
              <FormField label="契約終了"><FormInput type="date" value={editTenant.contractEnd} onChange={v => setEditTenant({ ...editTenant, contractEnd: v })} /></FormField>
            </div>
            <FormField label="ステータス">
              <FormSelect value={editTenant.status} onChange={v => setEditTenant({ ...editTenant, status: v as Tenant['status'] })}
                options={[{ value: '入居中', label: '入居中' }, { value: '退去予定', label: '退去予定' }, { value: '空室', label: '空室' }]} />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setEditTenant(null)}>キャンセル</Button>
              <Button onClick={handleTenantSave}>{editTenant.id ? '更新' : '追加'}</Button>
            </div>
          </div>
        )}
        {deleteTenantTarget && (
          <div>
            <p className="text-sm text-slate-700 mb-4"><b>{deleteTenantTarget.room} {deleteTenantTarget.name}</b> を削除しますか？</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTenantTarget(null)}>キャンセル</Button>
              <Button variant="danger" onClick={handleTenantDelete}>削除</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// =============================================================================
// 物件別ワークスペース — タブ
// =============================================================================

// --- 要対応事項タブ ---
const ActionItemSubTab = ({ propertyId }: { propertyId: string }) => {
  const { actionItems, setActionItems } = useData()
  const [statusFilter, setStatusFilter] = useState('')
  const items = useMemo(() => actionItems.filter(a => a.propertyId === propertyId && (!statusFilter || a.status === statusFilter)), [actionItems, propertyId, statusFilter])
  const [editItem, setEditItem] = useState<ActionItem | null>(null)

  const toggleComplete = (id: string) => {
    setActionItems(prev => prev.map(a => a.id === id ? { ...a, status: a.status === '完了' ? '未着手' : '完了' } : a))
  }

  const handleSave = () => {
    if (!editItem || !editItem.title.trim()) return
    if (editItem.id) setActionItems(prev => prev.map(a => a.id === editItem.id ? editItem : a))
    else {
      const newId = `AI${String(actionItems.length + 1).padStart(3, '0')}`
      setActionItems(prev => [...prev, { ...editItem, id: newId, propertyId }])
    }
    setEditItem(null)
  }

  const emptyItem: ActionItem = { id: '', propertyId, title: '', category: 'その他', status: '未着手', priority: '中', dueDate: '', assignee: '', description: '' }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex gap-2 flex-wrap">
          {['', '未着手', '進行中', '完了'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${statusFilter === s ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-300'}`}>{s || 'すべて'}</button>
          ))}
        </div>
        <div className="flex-1" />
        <Button onClick={() => setEditItem({ ...emptyItem })}><Plus className="w-4 h-4 mr-1" />追加</Button>
      </div>
      {items.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">対応事項がありません</p> : (
        <div className="space-y-2">
          {items.map(item => {
            const isOverdue = item.status !== '完了' && new Date(item.dueDate) < new Date('2026-03-04')
            return (
              <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border ${isOverdue ? 'border-red-200 bg-red-50/50' : 'border-slate-200 bg-white'}`}>
                <button onClick={() => toggleComplete(item.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${item.status === '完了' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>
                  {item.status === '完了' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${item.status === '完了' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{item.title}</p>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">{item.category}</span>
                    <span className={isOverdue ? 'text-red-600 font-medium' : ''}>期限: {item.dueDate}</span>
                    <span>担当: {item.assignee}</span>
                  </div>
                </div>
                <PriorityBadge priority={item.priority} />
                <button onClick={() => setEditItem({ ...item })} className="p-1 text-slate-400 hover:text-indigo-600"><Pencil className="w-3.5 h-3.5" /></button>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title={editItem?.id ? '対応事項を編集' : '対応事項を追加'}>
        {editItem && (
          <div className="space-y-4">
            <FormField label="タイトル"><FormInput value={editItem.title} onChange={v => setEditItem({ ...editItem, title: v })} /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="カテゴリ"><FormSelect value={editItem.category} onChange={v => setEditItem({ ...editItem, category: v as ActionItem['category'] })} options={['修繕', '募集', '契約', '報告', '管理', 'クレーム', 'その他'].map(c => ({ value: c, label: c }))} /></FormField>
              <FormField label="優先度"><FormSelect value={editItem.priority} onChange={v => setEditItem({ ...editItem, priority: v as ActionItem['priority'] })} options={['高', '中', '低'].map(p => ({ value: p, label: p }))} /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="期限"><FormInput type="date" value={editItem.dueDate} onChange={v => setEditItem({ ...editItem, dueDate: v })} /></FormField>
              <FormField label="担当者"><FormInput value={editItem.assignee} onChange={v => setEditItem({ ...editItem, assignee: v })} /></FormField>
            </div>
            <FormField label="説明"><FormInput value={editItem.description} onChange={v => setEditItem({ ...editItem, description: v })} /></FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setEditItem(null)}>キャンセル</Button>
              <Button onClick={handleSave}>保存</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// --- 修繕記録タブ ---
const EMPTY_REPAIR: RepairRecord = { id: '', propertyId: '', category: '水漏れ', content: '', status: '未着手', dueDate: '', createdAt: '', logs: [] }

const RepairRecordSubTab = ({ propertyId }: { propertyId: string }) => {
  const { repairRecords, setRepairRecords, repairVendors, repairRequests, setRepairRequests } = useData()
  const records = useMemo(() => repairRecords.filter(r => r.propertyId === propertyId), [repairRecords, propertyId])
  const [selected, setSelected] = useState<RepairRecord | null>(null)
  const [editRecord, setEditRecord] = useState<RepairRecord | null>(null)
  const [showVendorRequest, setShowVendorRequest] = useState(false)
  const [selectedVendorId, setSelectedVendorId] = useState('')

  const handleSave = () => {
    if (!editRecord || !editRecord.content.trim()) return
    if (editRecord.id) {
      setRepairRecords(prev => prev.map(r => r.id === editRecord.id ? editRecord : r))
    } else {
      const newId = `RR${String(repairRecords.length + 1).padStart(3, '0')}`
      const today = new Date().toISOString().slice(0, 10)
      setRepairRecords(prev => [...prev, { ...editRecord, id: newId, propertyId, createdAt: today }])
    }
    setEditRecord(null)
  }

  const handleVendorRequest = () => {
    if (!selected || !selectedVendorId) return
    const newId = `REQ${String(repairRequests.length + 1).padStart(3, '0')}`
    const today = new Date().toISOString().slice(0, 10)
    setRepairRequests(prev => [...prev, {
      id: newId, repairRecordId: selected.id, propertyId: selected.propertyId,
      vendorId: selectedVendorId, status: '依頼中', logs: [{ date: today, comment: '依頼送信' }],
    }])
    setRepairRecords(prev => prev.map(r => r.id === selected.id ? { ...r, repairVendorId: selectedVendorId, status: r.status === '未着手' ? '対応中' : r.status } : r))
    setSelected(prev => prev ? { ...prev, repairVendorId: selectedVendorId } : null)
    setShowVendorRequest(false)
    setSelectedVendorId('')
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setEditRecord({ ...EMPTY_REPAIR })}><Plus className="w-4 h-4 mr-1" />新規追加</Button>
      </div>
      {records.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">修繕記録がありません</p> : (
        <div className="space-y-3">
          {records.map(r => {
            const vendor = r.repairVendorId ? repairVendors.find(v => v.id === r.repairVendorId) : null
            const req = repairRequests.find(rq => rq.repairRecordId === r.id)
            return (
              <div key={r.id} onClick={() => setSelected(r)} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-slate-400" />
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{r.category}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <span className="text-xs text-slate-400">{r.createdAt}</span>
                </div>
                <p className="text-sm text-slate-800">{r.content}</p>
                <div className="flex items-center gap-3 mt-1">
                  {vendor && <p className="text-xs text-slate-400">業者: {vendor.name}</p>}
                  {req && <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">依頼: {req.status}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={!!selected && !showVendorRequest} onClose={() => setSelected(null)} title="修繕記録詳細">
        {selected && (() => {
          const vendor = selected.repairVendorId ? repairVendors.find(v => v.id === selected.repairVendorId) : null
          const req = repairRequests.find(rq => rq.repairRecordId === selected.id)
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-500">カテゴリ:</span> {selected.category}</div>
                <div><span className="text-slate-500">ステータス:</span> <StatusBadge status={selected.status} /></div>
                <div><span className="text-slate-500">期日:</span> {selected.dueDate}</div>
                <div><span className="text-slate-500">登録日:</span> {selected.createdAt}</div>
              </div>
              <div><p className="text-sm text-slate-700">{selected.content}</p></div>
              {req ? (
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <h4 className="text-sm font-bold text-indigo-700 mb-2">業者依頼</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-indigo-600">業者:</span> {vendor?.name}</p>
                    <p><span className="text-indigo-600">ステータス:</span> <StatusBadge status={req.status} /></p>
                    {req.estimateMessage && <p><span className="text-indigo-600">見積もり:</span> {req.estimateMessage}</p>}
                  </div>
                  {req.logs.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {req.logs.map((log, i) => (
                        <div key={i} className="flex gap-2 text-xs p-1.5 bg-white/70 rounded">
                          <span className="text-indigo-400">{log.date}</span>
                          <span className="text-indigo-700">{log.comment}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Button onClick={() => { setShowVendorRequest(true); setSelectedVendorId('') }} size="md">
                  <HardHat className="w-4 h-4 mr-1" />業者に依頼する
                </Button>
              )}
              {selected.logs.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-500 mb-2">対応記録</h4>
                  <div className="space-y-2">
                    {selected.logs.map((log, i) => (
                      <div key={i} className="flex gap-3 text-sm p-2 bg-slate-50 rounded">
                        <span className="text-slate-400 shrink-0">{log.date}</span>
                        <span className="text-slate-700">{log.comment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })()}
      </Modal>

      <Modal isOpen={showVendorRequest} onClose={() => setShowVendorRequest(false)} title="修繕業者に依頼">
        {selected && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg text-sm">
              <p className="text-slate-500 mb-1">修繕内容:</p>
              <p className="text-slate-800 font-medium">{selected.content}</p>
              <p className="text-xs text-slate-400 mt-1">{selected.category} / 期日: {selected.dueDate}</p>
            </div>
            <FormField label="依頼先の修繕業者">
              <FormSelect value={selectedVendorId} onChange={setSelectedVendorId}
                options={[{ value: '', label: '業者を選択...' }, ...repairVendors.map(v => ({ value: v.id, label: `${v.name}（${v.specialty}）` }))]} />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowVendorRequest(false)}>キャンセル</Button>
              <Button onClick={handleVendorRequest}>依頼を送信</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!editRecord} onClose={() => setEditRecord(null)} title={editRecord?.id ? '修繕記録を編集' : '修繕記録を追加'}>
        {editRecord && (
          <div className="space-y-4">
            <FormField label="カテゴリ">
              <FormSelect value={editRecord.category} onChange={v => setEditRecord({ ...editRecord, category: v as RepairRecord['category'] })}
                options={['水漏れ', '補修', '電気', 'その他'].map(c => ({ value: c, label: c }))} />
            </FormField>
            <FormField label="内容"><FormInput value={editRecord.content} onChange={v => setEditRecord({ ...editRecord, content: v })} placeholder="修繕内容を記入..." /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="期日"><FormInput type="date" value={editRecord.dueDate} onChange={v => setEditRecord({ ...editRecord, dueDate: v })} /></FormField>
              <FormField label="ステータス">
                <FormSelect value={editRecord.status} onChange={v => setEditRecord({ ...editRecord, status: v as RepairRecord['status'] })}
                  options={['未着手', '対応中', '完了'].map(s => ({ value: s, label: s }))} />
              </FormField>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setEditRecord(null)}>キャンセル</Button>
              <Button onClick={handleSave}>保存</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// --- チャットUI共通（送信機能 + 予約送信 + 自動スクロール） ---
const ChatPanel = ({ messages, chatType, propertyId, myRole, mySenderName, tenantId, vendorId, repairRequestId, onSend }: {
  messages: ChatMessage[]
  chatType: ChatMessage['chatType']
  propertyId: string
  myRole: ChatMessage['senderRole']
  mySenderName: string
  tenantId?: string
  vendorId?: string
  repairRequestId?: string
  onSend: (msg: ChatMessage) => void
}) => {
  const [input, setInput] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [showSchedule, setShowSchedule] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages.length])

  const handleSend = () => {
    if (!input.trim()) return
    const msg: ChatMessage = {
      id: `CM${Date.now()}`,
      propertyId,
      chatType,
      senderRole: myRole,
      senderName: mySenderName,
      message: input.trim(),
      timestamp: nowTimestamp(),
      ...(scheduledAt ? { scheduledAt } : {}),
      ...(tenantId ? { tenantId } : {}),
      ...(vendorId ? { vendorId } : {}),
      ...(repairRequestId ? { repairRequestId } : {}),
    }
    onSend(msg)
    setInput('')
    setScheduledAt('')
    setShowSchedule(false)
  }

  return (
    <div>
      {messages.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">メッセージがありません</p> : (
        <div ref={scrollRef} className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderRole === myRole ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.senderRole === myRole ? 'bg-indigo-500 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md'}`}>
                <p className={`text-[10px] mb-1 ${msg.senderRole === myRole ? 'text-indigo-200' : 'text-slate-400'}`}>{msg.senderName}</p>
                <p>{msg.message}</p>
                <p className={`text-[10px] mt-1 ${msg.senderRole === myRole ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {msg.timestamp}
                  {msg.scheduledAt && ' (予約送信)'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSchedule && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
          <Calendar className="w-4 h-4 text-amber-600" />
          <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-amber-300 rounded bg-white" />
          <button onClick={() => { setShowSchedule(false); setScheduledAt('') }} className="text-xs text-slate-500 hover:text-slate-700">取消</button>
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-slate-200">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="メッセージを入力..."
          className="flex-1 px-4 py-2 border border-slate-300 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSend() }} />
        <button onClick={() => setShowSchedule(!showSchedule)} className={`p-2 rounded-lg transition-colors ${showSchedule ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-indigo-600'}`} title="送信予約">
          <Calendar className="w-5 h-5" />
        </button>
        <button onClick={handleSend}
          className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-full hover:from-indigo-600 hover:to-blue-700 transition-all shadow-lg shadow-indigo-500/25"
          title={scheduledAt ? '予約送信' : '送信'}>
          <Send className="w-4 h-4" />
        </button>
      </div>
      {scheduledAt && <p className="text-xs text-amber-600 mt-1 text-right">予約送信: {scheduledAt.replace('T', ' ')}</p>}
    </div>
  )
}

const InternalChatSubTab = ({ propertyId }: { propertyId: string }) => {
  const { chatMessages, setChatMessages, currentUser } = useData()
  const msgs = useMemo(() => chatMessages.filter(m => m.propertyId === propertyId && m.chatType === 'internal'), [chatMessages, propertyId])
  const handleSend = (msg: ChatMessage) => setChatMessages(prev => [...prev, msg])
  return <ChatPanel messages={msgs} chatType="internal" propertyId={propertyId} myRole="staff" mySenderName={currentUser.name.replace('（管理者）', '')} onSend={handleSend} />
}

const OwnerChatSubTab = ({ propertyId }: { propertyId: string }) => {
  const { chatMessages, setChatMessages, currentUser } = useData()
  const msgs = useMemo(() => chatMessages.filter(m => m.propertyId === propertyId && m.chatType === 'owner'), [chatMessages, propertyId])
  const handleSend = (msg: ChatMessage) => setChatMessages(prev => [...prev, msg])
  return <ChatPanel messages={msgs} chatType="owner" propertyId={propertyId} myRole="staff" mySenderName={currentUser.name.replace('（管理者）', '')} onSend={handleSend} />
}

// --- 入居者チャットタブ（2段階UI） ---
const TenantChatSubTab = ({ propertyId }: { propertyId: string }) => {
  const { chatMessages, setChatMessages, tenants, currentUser } = useData()
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)

  const activeTenants = useMemo(() => tenants.filter(t => t.propertyId === propertyId && t.status === '入居中'), [tenants, propertyId])
  const tenantMsgs = useMemo(() => selectedTenantId ? chatMessages.filter(m => m.propertyId === propertyId && m.chatType === 'tenant' && m.tenantId === selectedTenantId) : [], [chatMessages, propertyId, selectedTenantId])

  const handleSend = (msg: ChatMessage) => setChatMessages(prev => [...prev, msg])

  if (selectedTenantId) {
    const tenant = tenants.find(t => t.id === selectedTenantId)
    return (
      <div>
        <button onClick={() => setSelectedTenantId(null)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-3">
          <ArrowLeft className="w-4 h-4" />入居者一覧に戻る
        </button>
        <h4 className="text-sm font-bold text-slate-700 mb-3">{tenant?.name}（{tenant?.room}）とのチャット</h4>
        <ChatPanel messages={tenantMsgs} chatType="tenant" propertyId={propertyId} myRole="staff"
          mySenderName={currentUser.name.replace('（管理者）', '')} tenantId={selectedTenantId} onSend={handleSend} />
      </div>
    )
  }

  return (
    <div>
      <h4 className="text-sm font-bold text-slate-700 mb-3">入居者を選択してチャットを開始</h4>
      {activeTenants.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">入居中の入居者がいません</p> : (
        <div className="space-y-2">
          {activeTenants.map(t => {
            const msgCount = chatMessages.filter(m => m.chatType === 'tenant' && m.tenantId === t.id).length
            return (
              <div key={t.id} onClick={() => setSelectedTenantId(t.id)}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.room}号室</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {msgCount > 0 && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">{msgCount}件</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// --- ファイル保管タブ（Vercel Blob対応） ---
const FileStorageSubTab = ({ propertyId }: { propertyId: string }) => {
  const { blobFiles, setBlobFiles, currentUser } = useData()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mockFiles = useMemo(() => STORED_FILES.filter(f => f.propertyId === propertyId), [propertyId])
  const realFiles = useMemo(() => blobFiles.filter(f => f.propertyId === propertyId), [blobFiles, propertyId])

  const typeIcon = (name: string) => {
    if (name.endsWith('.pdf')) return <FileUp className="w-4 h-4 text-red-500" />
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(name)) return <Eye className="w-4 h-4 text-green-500" />
    return <FileUp className="w-4 h-4 text-slate-400" />
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('propertyId', propertyId)
      const result = await uploadEarthFile(formData)
      const newFile: BlobFile = {
        id: `BF${Date.now()}`,
        propertyId,
        name: result.name,
        url: result.url,
        size: result.size,
        uploadedAt: result.uploadedAt,
        uploadedBy: currentUser.name.replace('（管理者）', ''),
      }
      setBlobFiles(prev => [...prev, newFile])
    } catch (err) {
      console.error('アップロードエラー:', err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (file: BlobFile) => {
    try {
      await deleteEarthFile(file.url)
      setBlobFiles(prev => prev.filter(f => f.id !== file.id))
    } catch (err) {
      console.error('削除エラー:', err)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  return (
    <div>
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
      <div className="flex justify-end mb-4">
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />アップロード中...</> : <><Upload className="w-4 h-4 mr-1" />アップロード</>}
        </Button>
      </div>
      {mockFiles.length === 0 && realFiles.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">ファイルがありません</p> : (
        <div className="space-y-2">
          {/* モックファイル */}
          {mockFiles.map(f => (
            <div key={f.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                {typeIcon(f.name)}
                <div>
                  <p className="text-sm font-medium text-slate-800">{f.name}</p>
                  <p className="text-xs text-slate-400">{f.size} / {f.uploadedAt} / {f.uploadedBy}</p>
                </div>
              </div>
              <button className="p-1.5 text-slate-400 hover:text-indigo-600"><Download className="w-4 h-4" /></button>
            </div>
          ))}
          {/* 実ファイル（Vercel Blob） */}
          {realFiles.map(f => (
            <div key={f.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-200 bg-indigo-50/30">
              <div className="flex items-center gap-3">
                {typeIcon(f.name)}
                <div>
                  <p className="text-sm font-medium text-slate-800">{f.name}</p>
                  <p className="text-xs text-slate-400">{formatSize(f.size)} / {f.uploadedAt} / {f.uploadedBy}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => window.open(f.url, '_blank')} className="p-1.5 text-slate-400 hover:text-indigo-600" title="ダウンロード"><Download className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(f)} className="p-1.5 text-slate-400 hover:text-red-600" title="削除"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- ワークスペース本体 ---
const WORKSPACE_TABS = [
  { key: 'actions', label: '要対応事項', icon: AlertCircle },
  { key: 'repairs', label: '修繕記録', icon: Wrench },
  { key: 'internal', label: '社内チャット', icon: MessageCircle },
  { key: 'files', label: 'ファイル保管', icon: FileUp },
  { key: 'ownerChat', label: 'オーナーチャット', icon: Users },
  { key: 'tenantChat', label: '入居者チャット', icon: UserCheck },
]

const PropertyWorkspace = () => {
  const { workspacePropertyId, properties, owners, setActivePage, setWorkspacePropertyId } = useData()
  const [activeTab, setActiveTab] = useState('actions')
  const property = properties.find(p => p.id === workspacePropertyId)
  const owner = property ? owners.find(o => o.id === property.ownerId) : null

  if (!property) return <p className="text-center py-8 text-slate-400">物件が見つかりません</p>

  const goBack = () => { setWorkspacePropertyId(null); setActivePage('properties') }

  return (
    <div>
      <div className="mb-4">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-2"><ArrowLeft className="w-4 h-4" />物件一覧に戻る</button>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">{property.name}</h2>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{property.address}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" />{owner?.name}</span>
            <span className="flex items-center gap-1"><Home className="w-4 h-4" />{property.type} / 全{property.totalUnits}戸（空室{property.vacantUnits}）</span>
            <span>担当: {property.assignees.join(', ')}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {WORKSPACE_TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.key ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
              <Icon className="w-4 h-4" /><span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-h-[300px]">
        {activeTab === 'actions' && <ActionItemSubTab propertyId={property.id} />}
        {activeTab === 'repairs' && <RepairRecordSubTab propertyId={property.id} />}
        {activeTab === 'internal' && <InternalChatSubTab propertyId={property.id} />}
        {activeTab === 'files' && <FileStorageSubTab propertyId={property.id} />}
        {activeTab === 'ownerChat' && <OwnerChatSubTab propertyId={property.id} />}
        {activeTab === 'tenantChat' && <TenantChatSubTab propertyId={property.id} />}
      </div>
    </div>
  )
}

// =============================================================================
// 修繕業者管理
// =============================================================================

const RepairVendorPage = () => {
  const { repairVendors, setRepairVendors } = useData()
  const [search, setSearch] = useState('')
  const [editVendor, setEditVendor] = useState<RepairVendor | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RepairVendor | null>(null)

  const filtered = useMemo(() => repairVendors.filter(v => v.name.includes(search) || v.specialty.includes(search)), [repairVendors, search])

  const handleSave = () => {
    if (!editVendor || !editVendor.name.trim()) return
    if (editVendor.id) setRepairVendors(prev => prev.map(v => v.id === editVendor.id ? editVendor : v))
    else {
      const newId = `RV${String(repairVendors.length + 1).padStart(3, '0')}`
      setRepairVendors(prev => [...prev, { ...editVendor, id: newId }])
    }
    setEditVendor(null)
  }

  const handleDelete = () => { if (!deleteTarget) return; setRepairVendors(prev => prev.filter(v => v.id !== deleteTarget.id)); setDeleteTarget(null) }
  const emptyVendor: RepairVendor = { id: '', name: '', phone: '', email: '', specialty: '' }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="業者名・専門分野で検索..." /></div>
        <Button onClick={() => setEditVendor({ ...emptyVendor })}><Plus className="w-4 h-4 mr-1" />新規追加</Button>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">業者名</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">専門分野</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">電話番号</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">メール</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-600 w-24">操作</th>
            </tr></thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} className="border-b border-slate-100 hover:bg-indigo-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{v.name}</td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{v.specialty}</td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{v.phone}</td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{v.email}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setEditVendor({ ...v })} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteTarget(v)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!editVendor} onClose={() => setEditVendor(null)} title={editVendor?.id ? '業者編集' : '業者新規追加'}>
        {editVendor && (
          <div className="space-y-4">
            <FormField label="業者名"><FormInput value={editVendor.name} onChange={v => setEditVendor({ ...editVendor, name: v })} /></FormField>
            <FormField label="専門分野"><FormInput value={editVendor.specialty} onChange={v => setEditVendor({ ...editVendor, specialty: v })} /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="電話番号"><FormInput value={editVendor.phone} onChange={v => setEditVendor({ ...editVendor, phone: v })} /></FormField>
              <FormField label="メール"><FormInput value={editVendor.email} onChange={v => setEditVendor({ ...editVendor, email: v })} /></FormField>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setEditVendor(null)}>キャンセル</Button>
              <Button onClick={handleSave}>保存</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="業者削除の確認">
        {deleteTarget && (
          <div>
            <p className="text-sm text-slate-700 mb-4"><b>{deleteTarget.name}</b> を削除しますか？</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>キャンセル</Button>
              <Button variant="danger" onClick={handleDelete}>削除</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// =============================================================================
// 入居者管理
// =============================================================================

const TenantManagementPage = () => {
  const { properties, tenants } = useData()
  const [propertyFilter, setPropertyFilter] = useState('')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() =>
    tenants.filter(t => (!propertyFilter || t.propertyId === propertyFilter) && (!search || t.name.includes(search) || t.room.includes(search))),
    [tenants, propertyFilter, search])

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="入居者名・部屋番号で検索..." /></div>
        <SelectBox value={propertyFilter} onChange={setPropertyFilter} options={properties.map(p => ({ value: p.id, label: p.name }))} placeholder="すべての物件" className="w-full sm:w-56" />
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">物件</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">部屋</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">入居者名</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">家賃</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">契約期間</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-600">ステータス</th>
            </tr></thead>
            <tbody>
              {filtered.map(t => {
                const prop = properties.find(p => p.id === t.propertyId)
                return (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-indigo-50/50">
                    <td className="px-4 py-3 text-slate-600">{prop?.name}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{t.room}</td>
                    <td className="px-4 py-3 text-slate-800">{t.name || '—'}</td>
                    <td className="px-4 py-3 text-right text-slate-600 hidden sm:table-cell">&yen;{t.rent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">{t.contractStart ? `${t.contractStart} 〜 ${t.contractEnd}` : '—'}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={t.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// オーナーポータル
// =============================================================================

const OwnerPortal = () => {
  const { currentUser, properties, owners, chatMessages, setChatMessages, blobFiles } = useData()
  const myProperties = useMemo(() => properties.filter(p => p.ownerId === currentUser.ownerId), [properties, currentUser.ownerId])
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null)
  const [viewTab, setViewTab] = useState<'info' | 'files' | 'chat'>('info')
  const owner = owners.find(o => o.id === currentUser.ownerId)
  const selectedProp = selectedPropId ? properties.find(p => p.id === selectedPropId) : null

  const handleSend = (msg: ChatMessage) => setChatMessages(prev => [...prev, msg])

  if (selectedProp) {
    const mockFiles = STORED_FILES.filter(f => f.propertyId === selectedProp.id)
    const realFiles = blobFiles.filter(f => f.propertyId === selectedProp.id)
    const msgs = chatMessages.filter(m => m.propertyId === selectedProp.id && m.chatType === 'owner')
    return (
      <div>
        <button onClick={() => setSelectedPropId(null)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-4"><ArrowLeft className="w-4 h-4" />物件一覧に戻る</button>
        <h2 className="text-lg font-bold text-slate-800 mb-2">{selectedProp.name}</h2>
        <div className="flex gap-2 mb-4">
          {(['info', 'files', 'chat'] as const).map(tab => (
            <button key={tab} onClick={() => setViewTab(tab)} className={`px-3 py-1.5 text-sm rounded-lg ${viewTab === tab ? 'bg-indigo-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
              {tab === 'info' ? '物件情報' : tab === 'files' ? '共有ファイル' : 'チャット'}
            </button>
          ))}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          {viewTab === 'info' && (
            <div className="space-y-2 text-sm">
              <p><span className="text-slate-500">住所:</span> {selectedProp.address}</p>
              <p><span className="text-slate-500">種別:</span> {selectedProp.type}</p>
              <p><span className="text-slate-500">総戸数:</span> {selectedProp.totalUnits} / <span className="text-slate-500">空室:</span> {selectedProp.vacantUnits}</p>
            </div>
          )}
          {viewTab === 'files' && (
            <div className="space-y-2">
              {mockFiles.length === 0 && realFiles.length === 0 ? <p className="text-sm text-slate-400 text-center py-4">共有ファイルがありません</p> : (
                <>
                  {mockFiles.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                      <div><p className="text-sm font-medium text-slate-800">{f.name}</p><p className="text-xs text-slate-400">{f.size} / {f.uploadedAt}</p></div>
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600"><Download className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {realFiles.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border border-indigo-200 bg-indigo-50/30">
                      <div><p className="text-sm font-medium text-slate-800">{f.name}</p><p className="text-xs text-slate-400">{(f.size / (1024 * 1024)).toFixed(1)}MB / {f.uploadedAt}</p></div>
                      <button onClick={() => window.open(f.url, '_blank')} className="p-1.5 text-slate-400 hover:text-indigo-600"><Download className="w-4 h-4" /></button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
          {viewTab === 'chat' && (
            <ChatPanel messages={msgs} chatType="owner" propertyId={selectedProp.id}
              myRole="owner" mySenderName={currentUser.name} onSend={handleSend} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 mb-4">{owner?.name} 様の所有物件</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {myProperties.map(prop => (
          <div key={prop.id} onClick={() => setSelectedPropId(prop.id)} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors">
            <h3 className="font-bold text-slate-800 mb-2">{prop.name}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{prop.address}</p>
            <div className="flex gap-4 mt-2 text-xs text-slate-500">
              <span>総戸数: {prop.totalUnits}</span>
              <span className={prop.vacantUnits > 0 ? 'text-red-600' : 'text-green-600'}>空室: {prop.vacantUnits}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// 修繕業者ポータル
// =============================================================================

const VendorPortal = () => {
  const { currentUser, properties, repairRecords, repairRequests, setRepairRequests, chatMessages, setChatMessages } = useData()
  const myRequests = useMemo(() => repairRequests.filter(r => r.vendorId === currentUser.vendorId), [repairRequests, currentUser.vendorId])
  const [selectedReq, setSelectedReq] = useState<RepairRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [estimateInput, setEstimateInput] = useState('')
  const [showEstimateForm, setShowEstimateForm] = useState(false)
  const [logComment, setLogComment] = useState('')

  const filteredRequests = useMemo(() => myRequests.filter(r => !statusFilter || r.status === statusFilter), [myRequests, statusFilter])
  const record = selectedReq ? repairRecords.find(r => r.id === selectedReq.repairRecordId) : null

  const handleSubmitEstimate = () => {
    if (!selectedReq || !estimateInput.trim()) return
    setRepairRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, estimateMessage: estimateInput } : r))
    setSelectedReq(prev => prev ? { ...prev, estimateMessage: estimateInput } : null)
    setEstimateInput('')
    setShowEstimateForm(false)
  }

  const handleAddLog = () => {
    if (!selectedReq || !logComment.trim()) return
    const today = new Date().toISOString().slice(0, 10)
    const newLog = { date: today, comment: logComment }
    setRepairRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, logs: [...r.logs, newLog] } : r))
    setSelectedReq(prev => prev ? { ...prev, logs: [...prev.logs, newLog] } : null)
    setLogComment('')
  }

  const handleStatusChange = (newStatus: '依頼中' | '受注' | '完了') => {
    if (!selectedReq) return
    const today = new Date().toISOString().slice(0, 10)
    const statusLog = { date: today, comment: `ステータスを「${newStatus}」に変更` }
    setRepairRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status: newStatus, logs: [...r.logs, statusLog] } : r))
    setSelectedReq(prev => prev ? { ...prev, status: newStatus, logs: [...prev.logs, statusLog] } : null)
  }

  const handleSendVendorMsg = (msg: ChatMessage) => setChatMessages(prev => [...prev, msg])

  if (selectedReq && record) {
    const prop = properties.find(p => p.id === record.propertyId)
    const vendorMsgs = chatMessages.filter(m => m.chatType === 'vendor' && m.repairRequestId === selectedReq.id)
    return (
      <div>
        <button onClick={() => { setSelectedReq(null); setShowEstimateForm(false) }} className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-4"><ArrowLeft className="w-4 h-4" />依頼一覧に戻る</button>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800">修繕依頼詳細</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">物件:</span> {prop?.name}</div>
            <div><span className="text-slate-500">ステータス:</span> <StatusBadge status={selectedReq.status} /></div>
            <div><span className="text-slate-500">カテゴリ:</span> {record.category}</div>
            <div><span className="text-slate-500">期日:</span> {record.dueDate}</div>
          </div>
          <div><p className="text-sm text-slate-700">{record.content}</p></div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">ステータス変更:</span>
            {(['受注', '完了'] as const).map(s => (
              <button key={s} onClick={() => handleStatusChange(s)} disabled={selectedReq.status === s}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${selectedReq.status === s ? 'bg-indigo-100 text-indigo-700 border-indigo-300 cursor-default' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400 hover:text-indigo-600'}`}>
                {s}
              </button>
            ))}
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-500 mb-2">見積もり</h4>
            {selectedReq.estimateMessage ? (
              <div className="p-3 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-800">{selectedReq.estimateMessage}</p>
              </div>
            ) : showEstimateForm ? (
              <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
                <FormField label="見積もり内容">
                  <textarea value={estimateInput} onChange={e => setEstimateInput(e.target.value)} placeholder="例: 外壁塗装一式 概算180万円（税別）"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" rows={3} />
                </FormField>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setShowEstimateForm(false)}>キャンセル</Button>
                  <Button onClick={handleSubmitEstimate}>見積もりを送信</Button>
                </div>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => setShowEstimateForm(true)}><Plus className="w-4 h-4 mr-1" />見積もりを作成</Button>
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-500 mb-2">対応記録</h4>
            <div className="space-y-2 mb-3">
              {selectedReq.logs.map((log, i) => (
                <div key={i} className="flex gap-3 text-sm p-2 bg-slate-50 rounded">
                  <span className="text-slate-400 shrink-0">{log.date}</span>
                  <span className="text-slate-700">{log.comment}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={logComment} onChange={e => setLogComment(e.target.value)} placeholder="対応記録を追加..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyDown={e => { if (e.key === 'Enter') handleAddLog() }} />
              <Button onClick={handleAddLog}>追加</Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-500 mb-2">管理会社とのメッセージ</h4>
            <ChatPanel messages={vendorMsgs} chatType="vendor" propertyId={record.propertyId}
              myRole="vendor" mySenderName={currentUser.name}
              vendorId={currentUser.vendorId} repairRequestId={selectedReq.id}
              onSend={handleSendVendorMsg} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 mb-4">修繕依頼一覧</h2>
      <div className="flex gap-2 mb-4 flex-wrap">
        {['', '依頼中', '受注', '完了'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${statusFilter === s ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-300'}`}>{s || 'すべて'}</button>
        ))}
      </div>
      {filteredRequests.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">依頼がありません</p> : (
        <div className="space-y-3">
          {filteredRequests.map(req => {
            const rec = repairRecords.find(r => r.id === req.repairRecordId)
            const prop = rec ? properties.find(p => p.id === rec.propertyId) : null
            return (
              <div key={req.id} onClick={() => setSelectedReq(req)} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm cursor-pointer hover:border-indigo-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-800">{rec?.content}</span>
                  <StatusBadge status={req.status} />
                </div>
                <div className="flex gap-3 text-xs text-slate-500">
                  <span>{prop?.name}</span>
                  <span>{rec?.category}</span>
                  <span>期日: {rec?.dueDate}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// メインページ
// =============================================================================

const EarthMockPageInner = () => {
  const [showSplash, setShowSplash] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { portal, properties, workspacePropertyId, activePage } = useData()

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />

  const pageTitle = (() => {
    if (portal === 'owner') return 'オーナーポータル'
    if (portal === 'vendor') return '修繕業者ポータル'
    if (workspacePropertyId) {
      const p = properties.find(pr => pr.id === workspacePropertyId)
      return p?.name ?? 'ワークスペース'
    }
    return STAFF_MENU.find(m => m.key === activePage)?.label ?? 'Earth'
  })()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex flex-col">
      <header className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            {portal === 'staff' && (
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-white/10 rounded-lg"><Menu className="w-5 h-5" /></button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
              <div>
                <h1 className="text-base font-bold leading-tight">Earth</h1>
                <p className="text-[10px] text-indigo-200 leading-tight">{pageTitle}</p>
              </div>
            </div>
          </div>
          <PortalSwitcher />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {portal === 'staff' && <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {portal === 'staff' && (
            <>
              {activePage === 'dashboard' && <Dashboard />}
              {activePage === 'owners' && <OwnerListTab />}
              {activePage === 'properties' && !workspacePropertyId && <PropertyTab />}
              {(activePage === 'workspace' || workspacePropertyId) && <PropertyWorkspace />}
              {activePage === 'vendors' && <RepairVendorPage />}
              {activePage === 'tenants' && <TenantManagementPage />}
            </>
          )}
          {portal === 'owner' && <OwnerPortal />}
          {portal === 'vendor' && <VendorPortal />}
        </main>
      </div>
    </div>
  )
}

const EarthMockPage = () => (
  <EarthDataProvider>
    <EarthMockPageInner />
  </EarthDataProvider>
)

export default EarthMockPage
