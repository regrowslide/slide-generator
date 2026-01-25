'use client'

import {useState} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {Bot, Calculator, Database, Menu} from 'lucide-react'
import {Button} from '@shadcn/ui/button'
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger} from '@shadcn/ui/drawer'
import {useIsMobile} from '@shadcn/hooks/use-mobile'
import {MENU_ITEMS} from '../../constants/menu-constants'
import type {MenuItem} from '../../types'

// アイコンマッピング
const IconMap = {
  calculator: Calculator,
  database: Database,
}

const NavItem = ({item, isActive, onClick}: {item: MenuItem; isActive: boolean; onClick?: () => void}) => {
  const Icon = IconMap[item.icon]
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
        ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}
      `}
    >
      <Icon className="w-5 h-5" />
      <span>{item.label}</span>
    </Link>
  )
}

export const AppHeader = () => {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // 現在のパスに基づいてアクティブなメニュー項目を判定
  const isActive = (href: string) => (pathname || '').includes(href.split('/').pop() || '')

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/curious/recipeCalculator" className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                Smart<span className="text-blue-600">Factory</span>
              </h1>
              <p className="text-[10px] text-slate-400 -mt-1">食品製造原価計算システム</p>
            </div>
          </Link>

          {/* デスクトップナビゲーション */}
          {!isMobile && (
            <nav className="flex items-center gap-2">
              {MENU_ITEMS.map((item) => (
                <NavItem key={item.id} item={item} isActive={isActive(item.href)} />
              ))}
            </nav>
          )}

          {/* モバイルハンバーガーメニュー */}
          {isMobile && (
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>メニュー</DrawerTitle>
                </DrawerHeader>
                <nav className="flex flex-col gap-2 p-4">
                  {MENU_ITEMS.map((item) => (
                    <NavItem key={item.id} item={item} isActive={isActive(item.href)} onClick={() => setDrawerOpen(false)} />
                  ))}
                </nav>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </div>
    </header>
  )
}
