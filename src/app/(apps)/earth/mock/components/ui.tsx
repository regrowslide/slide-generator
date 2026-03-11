import React from 'react'
import { Search, ChevronDown, X, Building2 } from 'lucide-react'
import { useEffect } from 'react'

// ボタン
export const Button = ({ children, onClick, variant = 'primary', className = '', size = 'sm', disabled = false }: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
  size?: 'sm' | 'md'
  disabled?: boolean
}) => {
  const v = {
    primary: 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 shadow-lg shadow-indigo-500/25',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }
  const s = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm' }
  return (
    <button onClick={onClick} type="button" disabled={disabled}
      className={`font-semibold rounded-lg flex items-center justify-center transition-all duration-300 ${s[size]} ${v[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {children}
    </button>
  )
}

// フォーム部品
export const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div><label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>{children}</div>
)

export const FormInput = ({ value, onChange, placeholder, type = 'text' }: { value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
)

export const FormSelect = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
)

// モーダル
export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start p-4 pt-16 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-top-4 duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// バッジ
export const StatusBadge = ({ status }: { status: string }) => {
  const m: Record<string, string> = {
    '入居中': 'bg-green-100 text-green-700', '完了': 'bg-green-100 text-green-700', '解決済': 'bg-green-100 text-green-700',
    '進行中': 'bg-blue-100 text-blue-700', '対応中': 'bg-blue-100 text-blue-700', '受注': 'bg-blue-100 text-blue-700',
    '未着手': 'bg-amber-100 text-amber-700', '依頼中': 'bg-amber-100 text-amber-700',
    '退去予定': 'bg-orange-100 text-orange-700', '空室': 'bg-slate-100 text-slate-500',
    '受託管理': 'bg-indigo-100 text-indigo-700', 'サブリース': 'bg-violet-100 text-violet-700',
    '個人': 'bg-sky-100 text-sky-700', '法人': 'bg-emerald-100 text-emerald-700',
  }
  return <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${m[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>
}

export const PriorityBadge = ({ priority }: { priority: '高' | '中' | '低' }) => {
  const m = { '高': 'bg-red-100 text-red-700 border-red-200', '中': 'bg-amber-100 text-amber-700 border-amber-200', '低': 'bg-blue-100 text-blue-700 border-blue-200' }
  return <span className={`px-2 py-0.5 text-xs font-bold rounded border ${m[priority]}`}>{priority}</span>
}

// 検索・セレクト
export const SearchBar = ({ value, onChange, placeholder = '検索...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
  </div>
)

export const SelectBox = ({ value, onChange, options, placeholder, className = '' }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string; className?: string }) => (
  <div className={`relative ${className}`}>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
  </div>
)

// スプラッシュスクリーン
export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => { const t = setTimeout(onComplete, 1500); return () => clearTimeout(t) }, [onComplete])
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 flex items-center justify-center z-[9999]">
      <div className="text-center animate-pulse">
        <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"><Building2 className="w-10 h-10 text-white" /></div>
        <h1 className="text-2xl font-bold text-white mb-1">Earth</h1>
        <p className="text-indigo-200 text-sm">不動産管理システム</p>
      </div>
    </div>
  )
}
