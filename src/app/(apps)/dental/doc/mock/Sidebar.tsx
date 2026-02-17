import React from 'react'

type NavItem = {
  id: string
  label: string
  icon: string
}

type NavSection = {
  label: string | null
  items: NavItem[]
}

type SidebarProps = {
  currentPage: string
  onNavigate: (page: string) => void
}

/**
 * サイドバーナビゲーション
 */
export const Sidebar = ({currentPage, onNavigate}: SidebarProps) => {
  const navSections: NavSection[] = [
    {label: null, items: [{id: 'dashboard', label: 'トップ', icon: '🏠'}]},
    {label: '予定・訪問', items: [{id: 'schedule', label: '訪問計画スケジュール', icon: '📅'}]},
    {
      label: '患者',
      items: [{id: 'individual-input', label: '個別入力', icon: '✏️'}],
    },
    {
      label: 'マスタデータ管理',
      items: [
        {id: 'admin-clinic', label: 'クリニック設定', icon: '🏥'},
        {id: 'admin-facilities', label: '施設マスタ', icon: '🏢'},
        {id: 'admin-patients', label: '利用者マスタ', icon: '👥'},
        {id: 'admin-staff', label: 'スタッフマスタ', icon: '👨‍⚕️'},
        {id: 'admin-templates', label: 'テンプレート登録', icon: '📋'},
      ],
    },
    {
      label: 'レポート・参照',
      items: [
        {id: 'scoring-reference', label: '算定項目・点数一覧', icon: '📊'},
        {id: 'scoring-ledger', label: '算定対象台帳', icon: '📒'},
        {id: 'document-list', label: '提供文書一覧', icon: '📄'},
        {id: 'summary', label: '日次報告', icon: '📈'},
        {id: 'batch-print', label: '履歴・一括印刷', icon: '🖨️'},
      ],
    },
  ]

  const isActive = (id: string) => currentPage === id || currentPage.startsWith(id)

  return (
    <aside className="w-56 bg-gray-50 border-r border-gray-200 min-h-screen overflow-y-auto">
      <div className="p-3">
        <h1
          className="text-lg font-bold text-slate-700 flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate('dashboard')}
        >
          <span>🦷</span>
          <span>VisitDental Pro</span>
        </h1>
      </div>
      <nav className="mt-1 pb-4">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.label && (
              <div className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">{section.label}</div>
            )}
            {section.items.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-500 ${
                  isActive(item.id)
                    ? 'bg-slate-100 text-slate-900 border-r-2 border-slate-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
