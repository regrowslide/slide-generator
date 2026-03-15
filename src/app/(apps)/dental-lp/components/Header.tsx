'use client'

import { useState, useRef, useEffect } from 'react'

const NAV_ITEMS = [
  { label: 'こんなお悩みありませんか？', href: '#pain' },
  { label: '機能紹介', href: '#features' },
  { label: '導入メリット', href: '#benefits' },
  { label: '導入の流れ', href: '#flow' },
  { label: 'お問い合わせ', href: '#contact' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuHeight, setMenuHeight] = useState(0)

  useEffect(() => {
    if (menuRef.current) {
      setMenuHeight(menuOpen ? menuRef.current.scrollHeight : 0)
    }
  }, [menuOpen])

  return (
    <header className='fixed top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-sm'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
        <a href='#' className='text-xl font-bold text-slate-800'>
          <span className='text-teal-600'>Visit</span>Dental Pro
        </a>

        {/* PC ナビ */}
        <nav className='hidden items-center gap-6 md:flex'>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className='text-sm text-slate-600 transition-colors hover:text-teal-600'
            >
              {item.label}
            </a>
          ))}
          <a
            href='#contact'
            className='rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow-md'
          >
            無料で相談する
          </a>
        </nav>

        {/* モバイルメニューボタン */}
        <button
          className='flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden'
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label='メニュー'
        >
          {menuOpen ? (
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M18 6L6 18M6 6l12 12' />
            </svg>
          ) : (
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M3 12h18M3 6h18M3 18h18' />
            </svg>
          )}
        </button>
      </div>

      {/* モバイルメニュー（アニメーション付き） */}
      <div
        ref={menuRef}
        className='overflow-hidden border-t border-slate-100 transition-all duration-300 ease-in-out md:hidden'
        style={{ maxHeight: menuHeight }}
      >
        <div className='bg-white px-4 py-4'>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className='block py-3 text-sm text-slate-600 hover:text-teal-600'
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a
            href='#contact'
            className='mt-2 block rounded-full bg-teal-600 py-3 text-center text-sm font-semibold text-white'
            onClick={() => setMenuOpen(false)}
          >
            無料で相談する
          </a>
        </div>
      </div>
    </header>
  )
}
