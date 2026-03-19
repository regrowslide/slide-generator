'use client'

import React, { useState } from 'react'
import { Settings, Users, Tag, Plus, Pencil, Trash2 } from 'lucide-react'
import { useFrankartMockData } from '../context/MockDataContext'
import { DEAL_STATUS_CONFIG, DEAL_STATUSES, LEAD_SOURCE_CONFIG, LEAD_SOURCES } from './constants'

const SettingsPage: React.FC = () => {
  const { staff, addStaff, updateStaff, deleteStaff } = useFrankartMockData()
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')

  const handleAdd = () => {
    if (!newName) return
    addStaff({ id: `staff-${Date.now()}`, name: newName, role: newRole || '担当者' })
    setNewName('')
    setNewRole('')
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('この担当者を削除しますか？')) return
    deleteStaff(id)
  }

  const startEdit = (s: typeof staff[0]) => {
    setEditingId(s.id)
    setEditName(s.name)
    setEditRole(s.role)
  }

  const saveEdit = () => {
    if (!editingId || !editName) return
    updateStaff(editingId, { name: editName, role: editRole })
    setEditingId(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <h1 className="text-lg font-bold text-stone-800 flex items-center gap-2">
        <Settings className="w-5 h-5 text-slate-600" />
        マスタ設定
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ステータス定義 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-600" />
            <h2 className="font-bold text-stone-800 text-sm">案件ステータス</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {DEAL_STATUSES.map((status) => {
              const conf = DEAL_STATUS_CONFIG[status]
              return (
                <div key={status} className="px-5 py-3 flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${conf.bg} ${conf.color}`}>
                    {conf.label}
                  </span>
                  <span className="text-sm text-stone-500">{status}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* リード元定義 */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-600" />
            <h2 className="font-bold text-stone-800 text-sm">リード元</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {LEAD_SOURCES.map((source) => {
              const conf = LEAD_SOURCE_CONFIG[source]
              return (
                <div key={source} className="px-5 py-3 flex items-center gap-3">
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-stone-100 text-stone-700">
                    {conf.label}
                  </span>
                  <span className="text-sm text-stone-500">{source}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 担当者一覧（CRUD） */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm lg:col-span-2">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              <h2 className="font-bold text-stone-800 text-sm">担当者</h2>
              <span className="text-xs text-stone-400">{staff.length}名</span>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              新規担当者
            </button>
          </div>

          {/* 新規フォーム */}
          {showForm && (
            <div className="px-5 py-4 border-b border-stone-100 bg-stone-50 flex items-center gap-3">
              <input
                type="text"
                placeholder="氏名"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              />
              <input
                type="text"
                placeholder="役職"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              />
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-200 rounded-lg">キャンセル</button>
              <button onClick={handleAdd} disabled={!newName} className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40">追加</button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
            {staff.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 bg-stone-50 rounded-lg group relative">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {s.name[0]}
                </div>
                {editingId === s.id ? (
                  <div className="flex-1 space-y-1">
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
                      className="w-full px-1.5 py-0.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                    <input
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
                      onBlur={saveEdit}
                      className="w-full px-1.5 py-0.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <button onClick={() => startEdit(s)} className="block w-full text-left">
                      <p className="text-sm font-medium text-stone-800 flex items-center gap-1">
                        {s.name}
                        <Pencil className="w-3 h-3 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      <p className="text-xs text-stone-500">{s.role}</p>
                    </button>
                  </div>
                )}
                <button
                  onClick={() => handleDelete(s.id)}
                  className="absolute top-1 right-1 p-1 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
