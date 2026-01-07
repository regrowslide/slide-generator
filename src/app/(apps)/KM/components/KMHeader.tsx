'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@cm/shadcn/ui/drawer'
import { cn } from '@shadcn/lib/utils'
import { useIsMobile } from '@cm/shadcn/hooks/use-mobile'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

export type MenuItem = {
  label: string
  href: string
}

const defaultMenuItems: MenuItem[] = [
  { label: 'ホーム', href: '/KM' },
  { label: 'デモ先行開発', href: '/KM/demoDriven' },
  { label: 'こんなお客様に', href: '/KM/services' },
  { label: 'お客様の声', href: '/KM/testimonials' },
  { label: 'お問い合わせ', href: '/KM/contact' },
]

interface KMHeaderProps {
  menuItems?: MenuItem[]
}

export const KMHeader: React.FC<KMHeaderProps> = ({ menuItems = defaultMenuItems }) => {
  const { pathname } = useGlobal()
  const isMobile = useIsMobile()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/KM') {
      return pathname === '/KM' || pathname === '/KM/'
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/KM" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Image
              src="/image/KM/logo.png"
              alt="改善マニア"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-900 via-blue-600 to-blue-900 bg-clip-text text-transparent">
              改善マニア
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          {isMobile && (
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <button
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  aria-label="メニューを開く"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="text-left">
                  <DrawerTitle className="text-lg font-semibold">メニュー</DrawerTitle>
                </DrawerHeader>
                <nav className="flex flex-col px-4 pb-4">
                  {menuItems.map((item) => (
                    <DrawerClose key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          'px-4 py-3 rounded-md text-base font-medium transition-colors',
                          isActive(item.href)
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        )}
                      >
                        {item.label}
                      </Link>
                    </DrawerClose>
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

