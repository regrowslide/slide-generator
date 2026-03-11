'use client'

import { useState } from 'react'
import type { KidsRoutine } from '../types'

type Props = {
  item: KidsRoutine
  done: boolean
  onToggle: (item: KidsRoutine) => void
}

/** ルーチンカード（チェックボックス＋名前＋ステッカー） */
export const RoutineCard = ({ item, done, onToggle }: Props) => {
  const [anim, setAnim] = useState(false)

  const handleClick = () => {
    if (!done) {
      setAnim(true)
      setTimeout(() => setAnim(false), 500)
    }
    onToggle(item)
  }

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer select-none"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        borderRadius: 18,
        minHeight: 64,
        background: done
          ? 'linear-gradient(135deg, #E8F5E9, #F1F8E9)'
          : '#fff',
        border: done ? '2.5px solid #6BCB77' : '2.5px solid #EEEEEE',
        transition: 'all 0.25s',
        boxShadow: done
          ? '0 3px 10px rgba(107,203,119,0.15)'
          : '0 1px 4px rgba(0,0,0,0.04)',
        transform: anim ? 'scale(0.96)' : 'scale(1)',
      }}
    >
      {/* チェックボックス / 絵文字アイコン */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: done ? 24 : 28,
          flexShrink: 0,
          transition: 'all 0.3s',
          background: done
            ? 'linear-gradient(135deg, #2ED573, #6BCB77)'
            : '#F5F5F5',
          ...(anim ? { animation: 'checkPop 0.4s ease both' } : {}),
        }}
      >
        {done ? (
          <span style={{ color: '#fff', fontWeight: 900 }}>✓</span>
        ) : (
          item.emoji
        )}
      </div>

      {/* 名前 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: done ? '#2E7D32' : '#2D3142',
            textDecorationLine: done ? 'line-through' : 'none',
            textDecorationColor: done ? '#A5D6A7' : undefined,
            textDecorationStyle: done ? 'solid' : undefined,
            fontFamily: "'Zen Maru Gothic', sans-serif",
          }}
        >
          {item.name}
        </div>
      </div>

      {/* ステッカー */}
      <div
        style={{
          fontSize: 30,
          flexShrink: 0,
          opacity: done ? 1 : 0.15,
          transition: 'opacity 0.3s',
        }}
      >
        {item.sticker}
      </div>
    </div>
  )
}
