import React, { useState, useRef, useEffect } from 'react'

type NavItem = {
  id: string
  label: string
}

type NavMenu = {
  id: string
  label: string
  items?: NavItem[]
  directPage?: string
}

type HeaderMenuProps = {
  currentPage: string
  onNavigate: (page: string) => void
}

/**
 * ヘッダーナビゲーション（メインメニュー＞サブメニュー構成）
 */
export const HeaderMenu = ({ currentPage, onNavigate }: HeaderMenuProps) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const navMenus: NavMenu[] = [
    {
      id: 'master',
      label: 'マスタ',
      items: [
        { id: 'admin-clinic', label: 'クリニック' },
        { id: 'admin-facilities', label: '施設' },
        { id: 'admin-patients', label: '利用者' },
        { id: 'admin-staff', label: 'スタッフ' },
      ],
    },
    {
      id: 'schedule',
      label: '訪問計画スケジュール',
      directPage: 'schedule',
    },

    {
      id: 'document-list',
      label: '文書管理',
      directPage: 'document-list',
    },
  ]

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (menu: NavMenu) => {
    if (menu.directPage) return currentPage === menu.directPage
    return menu.items?.some(item => currentPage === item.id) ?? false
  }

  const handleMenuClick = (menu: NavMenu) => {
    if (menu.directPage) {
      onNavigate(menu.directPage)
      setOpenMenu(null)
      return
    }
    setOpenMenu(prev => (prev === menu.id ? null : menu.id))
  }

  const handleItemClick = (itemId: string) => {
    onNavigate(itemId)
    setOpenMenu(null)
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm" ref={menuRef}>
      <div className="flex items-center h-12 px-4">
        {/* ロゴ */}
        <button
          onClick={() => {
            onNavigate('dashboard')
            setOpenMenu(null)
          }}
          className="flex items-center gap-2 mr-8 hover:opacity-80 transition-opacity"
        >
          <span className="text-lg">🦷</span>
          <span className="text-base font-bold text-slate-700">VisitDental Pro</span>
        </button>

        {/* メインメニュー */}
        <nav className="flex items-center gap-1">
          {navMenus.map(menu => (
            <div key={menu.id} className="relative">
              <button
                onClick={() => handleMenuClick(menu)}
                className={`flex items-center gap-1 px-3 py-2 text-sm rounded transition-colors ${isActive(menu)
                    ? 'bg-slate-100 text-slate-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <span>{menu.label}</span>
                {menu.items && (
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${openMenu === menu.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* サブメニュー（ドロップダウン） */}
              {menu.items && openMenu === menu.id && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[160px] py-1 z-50">
                  {menu.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${currentPage === item.id
                          ? 'bg-slate-100 text-slate-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  )
}
