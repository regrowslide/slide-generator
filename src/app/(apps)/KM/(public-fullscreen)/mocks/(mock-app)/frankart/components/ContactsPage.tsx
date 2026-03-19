'use client'

import React, { useState } from 'react'
import { Building2, Phone, Mail, MapPin, BookOpen, ChevronDown, ChevronUp, Plus, Pencil, Trash2 } from 'lucide-react'
import { useFrankartMockData } from '../context/MockDataContext'

// インライン編集フィールド
const InlineEdit = ({
  value,
  onSave,
  className = '',
}: {
  value: string
  onSave: (val: string) => void
  className?: string
}) => {
  const [editing, setEditing] = useState(false)
  const [localVal, setLocalVal] = useState(value)

  if (editing) {
    return (
      <input
        autoFocus
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={() => { onSave(localVal); setEditing(false) }}
        onKeyDown={(e) => { if (e.key === 'Enter') { onSave(localVal); setEditing(false) } if (e.key === 'Escape') { setLocalVal(value); setEditing(false) } }}
        className={`px-1.5 py-0.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 ${className}`}
      />
    )
  }

  return (
    <button
      onClick={() => { setLocalVal(value); setEditing(true) }}
      className={`text-left hover:bg-slate-50 px-1 py-0.5 -mx-1 rounded transition-colors group/edit inline-flex items-center gap-1 ${className}`}
    >
      <span>{value || '—'}</span>
      <Pencil className="w-3 h-3 text-stone-300 opacity-0 group-hover/edit:opacity-100 transition-opacity shrink-0" />
    </button>
  )
}

const ContactsPage: React.FC = () => {
  const {
    companies, advisors,
    addCompany, updateCompany, deleteCompany,
    addContact, updateContact, deleteContact,
    addAdvisor, updateAdvisor, deleteAdvisor,
  } = useFrankartMockData()

  const [tab, setTab] = useState<'companies' | 'advisors'>('companies')
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null)

  // 新規取引先フォーム
  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [companyForm, setCompanyForm] = useState({ name: '', industry: '', address: '', phone: '' })

  // 新規連絡先フォーム（companyId別）
  const [showContactForm, setShowContactForm] = useState<string | null>(null)
  const [contactForm, setContactForm] = useState({ name: '', position: '', email: '', phone: '' })

  // 新規顧問フォーム
  const [showAdvisorForm, setShowAdvisorForm] = useState(false)
  const [advisorForm, setAdvisorForm] = useState({ name: '', specialty: '', firm: '', phone: '', email: '' })

  const handleAddCompany = () => {
    if (!companyForm.name) return
    addCompany({ id: `comp-${Date.now()}`, ...companyForm, contacts: [] })
    setCompanyForm({ name: '', industry: '', address: '', phone: '' })
    setShowCompanyForm(false)
  }

  const handleDeleteCompany = (id: string) => {
    if (!window.confirm('この取引先を削除しますか？')) return
    deleteCompany(id)
  }

  const handleAddContact = (companyId: string) => {
    if (!contactForm.name) return
    addContact(companyId, { id: `cont-${Date.now()}`, ...contactForm })
    setContactForm({ name: '', position: '', email: '', phone: '' })
    setShowContactForm(null)
  }

  const handleDeleteContact = (companyId: string, contactId: string) => {
    if (!window.confirm('この連絡先を削除しますか？')) return
    deleteContact(companyId, contactId)
  }

  const handleAddAdvisor = () => {
    if (!advisorForm.name) return
    addAdvisor({ id: `adv-${Date.now()}`, ...advisorForm })
    setAdvisorForm({ name: '', specialty: '', firm: '', phone: '', email: '' })
    setShowAdvisorForm(false)
  }

  const handleDeleteAdvisor = (id: string) => {
    if (!window.confirm('この顧問を削除しますか？')) return
    deleteAdvisor(id)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* タブ切替 */}
      <div className="flex gap-1 border-b border-stone-200">
        <button
          onClick={() => setTab('companies')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'companies' ? 'border-slate-700 text-slate-800' : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          取引先企業
          <span className="text-xs text-stone-400 ml-1">{companies.length}</span>
        </button>
        <button
          onClick={() => setTab('advisors')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'advisors' ? 'border-slate-700 text-slate-800' : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          顧問
          <span className="text-xs text-stone-400 ml-1">{advisors.length}</span>
        </button>
      </div>

      {/* 取引先企業 */}
      {tab === 'companies' && (
        <div className="space-y-3">
          {/* 新規取引先ボタン */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowCompanyForm(!showCompanyForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              新規取引先
            </button>
          </div>

          {/* 新規取引先フォーム */}
          {showCompanyForm && (
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="企業名" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20" />
                <input type="text" placeholder="業種" value={companyForm.industry} onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })} className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20" />
              </div>
              <input type="text" placeholder="住所" value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20" />
              <input type="text" placeholder="電話番号" value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowCompanyForm(false)} className="px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-lg">キャンセル</button>
                <button onClick={handleAddCompany} disabled={!companyForm.name} className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40">追加する</button>
              </div>
            </div>
          )}

          {/* 企業一覧 */}
          {companies.map((company) => {
            const expanded = expandedCompanyId === company.id
            return (
              <div key={company.id} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedCompanyId(expanded ? null : company.id)}
                    className="flex-1 text-left hover:bg-stone-50 transition-colors -m-2 p-2 rounded-lg"
                  >
                    <h3 className="font-medium text-stone-800">{company.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                      <span className="px-2 py-0.5 bg-stone-100 rounded">{company.industry}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{company.address}</span>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs text-stone-400">{company.contacts.length}名</span>
                    <button onClick={() => handleDeleteCompany(company.id)} className="p-1 text-stone-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    {expanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </div>
                </div>
                {expanded && (
                  <div className="px-5 pb-4 border-t border-stone-100 pt-3 space-y-3">
                    {/* 企業情報（インライン編集） */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-stone-500 w-10">企業名</span>
                        <InlineEdit value={company.name} onSave={(v) => updateCompany(company.id, { name: v })} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-stone-500 w-10">業種</span>
                        <InlineEdit value={company.industry} onSave={(v) => updateCompany(company.id, { industry: v })} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-stone-500 w-10">住所</span>
                        <InlineEdit value={company.address} onSave={(v) => updateCompany(company.id, { address: v })} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-stone-500 w-10">電話</span>
                        <InlineEdit value={company.phone} onSave={(v) => updateCompany(company.id, { phone: v })} />
                      </div>
                    </div>

                    {/* 連絡先一覧 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-stone-500">連絡先</p>
                        <button
                          onClick={() => setShowContactForm(showContactForm === company.id ? null : company.id)}
                          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800"
                        >
                          <Plus className="w-3 h-3" />追加
                        </button>
                      </div>

                      {showContactForm === company.id && (
                        <div className="bg-stone-50 rounded-lg p-3 mb-2 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="氏名" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className="px-2 py-1.5 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-400" />
                            <input type="text" placeholder="役職" value={contactForm.position} onChange={(e) => setContactForm({ ...contactForm, position: e.target.value })} className="px-2 py-1.5 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-400" />
                            <input type="text" placeholder="メール" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className="px-2 py-1.5 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-400" />
                            <input type="text" placeholder="電話" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} className="px-2 py-1.5 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-400" />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowContactForm(null)} className="px-2 py-1 text-xs text-stone-500">キャンセル</button>
                            <button onClick={() => handleAddContact(company.id)} disabled={!contactForm.name} className="px-2 py-1 text-xs bg-slate-700 text-white rounded disabled:opacity-40">追加</button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {company.contacts.map((contact) => (
                          <div key={contact.id} className="flex items-center gap-4 px-3 py-2.5 bg-stone-50 rounded-lg group">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                              {contact.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <InlineEdit value={contact.name} onSave={(v) => updateContact(company.id, contact.id, { name: v })} className="text-sm font-medium text-stone-800" />
                                <InlineEdit value={contact.position} onSave={(v) => updateContact(company.id, contact.id, { position: v })} className="text-xs text-stone-500" />
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="flex items-center gap-1 text-xs text-stone-500"><Mail className="w-3 h-3" /><InlineEdit value={contact.email} onSave={(v) => updateContact(company.id, contact.id, { email: v })} /></span>
                                <span className="flex items-center gap-1 text-xs text-stone-500"><Phone className="w-3 h-3" /><InlineEdit value={contact.phone} onSave={(v) => updateContact(company.id, contact.id, { phone: v })} /></span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteContact(company.id, contact.id)}
                              className="p-1 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 顧問 */}
      {tab === 'advisors' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAdvisorForm(!showAdvisorForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              新規顧問
            </button>
          </div>

          {showAdvisorForm && (
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="氏名" value={advisorForm.name} onChange={(e) => setAdvisorForm({ ...advisorForm, name: e.target.value })} className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20" />
                <input type="text" placeholder="得意領域" value={advisorForm.specialty} onChange={(e) => setAdvisorForm({ ...advisorForm, specialty: e.target.value })} className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20" />
              </div>
              <input type="text" placeholder="所属（フリーランス等）" value={advisorForm.firm} onChange={(e) => setAdvisorForm({ ...advisorForm, firm: e.target.value })} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="電話番号" value={advisorForm.phone} onChange={(e) => setAdvisorForm({ ...advisorForm, phone: e.target.value })} className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20" />
                <input type="text" placeholder="メール" value={advisorForm.email} onChange={(e) => setAdvisorForm({ ...advisorForm, email: e.target.value })} className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAdvisorForm(false)} className="px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-lg">キャンセル</button>
                <button onClick={handleAddAdvisor} disabled={!advisorForm.name} className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40">追加する</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advisors.map((advisor) => (
              <div key={advisor.id} className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 group">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center text-slate-600 text-sm font-bold shrink-0">
                    {advisor.name[0]}
                  </div>
                  <div className="flex-1">
                    <InlineEdit value={advisor.name} onSave={(v) => updateAdvisor(advisor.id, { name: v })} className="font-medium text-stone-800" />
                    <InlineEdit value={advisor.specialty} onSave={(v) => updateAdvisor(advisor.id, { specialty: v })} className="text-xs text-stone-500 block" />
                    <InlineEdit value={advisor.firm} onSave={(v) => updateAdvisor(advisor.id, { firm: v })} className="text-xs text-stone-400 block mt-0.5" />
                    <div className="mt-2 space-y-1 text-xs text-stone-500">
                      <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /><InlineEdit value={advisor.phone} onSave={(v) => updateAdvisor(advisor.id, { phone: v })} /></p>
                      <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" /><InlineEdit value={advisor.email} onSave={(v) => updateAdvisor(advisor.id, { email: v })} /></p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAdvisor(advisor.id)}
                    className="p-1 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactsPage
