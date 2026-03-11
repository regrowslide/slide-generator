'use client'

import { useRef } from 'react'
import { PRAISE_MESSAGES } from '../lib/constants'

type Props = {
  item: { name: string; sticker: string }
  onClose: () => void
}

/** 完了時のポップアップ（褒め言葉表示） */
export const CompletionPopup = ({ item, onClose }: Props) => {
  const msg = useRef(
    PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)]
  ).current

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 1000,
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(5px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #F0FFF4, #FFFFFF)',
          borderRadius: 28,
          padding: '34px 30px 24px',
          textAlign: 'center',
          maxWidth: 290,
          width: '85%',
          boxShadow: '0 0 0 3px #6BCB77, 0 20px 60px rgba(0,0,0,0.15)',
          animation: 'popIn 0.45s cubic-bezier(0.175,0.885,0.32,1.275)',
          fontFamily: "'Zen Maru Gothic', sans-serif",
        }}
      >
        {/* メインステッカー */}
        <div
          style={{
            fontSize: 72,
            lineHeight: 1,
            marginBottom: 8,
            animation:
              'megaBounce 0.7s cubic-bezier(0.175,0.885,0.32,1.275) 0.1s both',
          }}
        >
          {item.sticker}
        </div>

        {/* バッジテキスト */}
        <div
          style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: 16,
            background: 'linear-gradient(90deg, #2ED573, #6BCB77)',
            fontSize: 10,
            fontWeight: 900,
            color: '#fff',
            letterSpacing: 2,
            marginBottom: 8,
            animation: 'fadeUp 0.3s ease 0.3s both',
          }}
        >
          ✓ DONE!
        </div>

        {/* 名前 */}
        <div
          style={{
            fontSize: 19,
            fontWeight: 900,
            color: '#2D3142',
            marginBottom: 12,
            animation: 'fadeUp 0.3s ease 0.4s both',
          }}
        >
          {item.name}
        </div>

        {/* 褒め言葉 */}
        <div
          style={{
            fontSize: 20,
            fontWeight: 900,
            background: 'linear-gradient(90deg, #2ED573, #6BCB77, #2ED573)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'fadeUp 0.4s ease 0.5s both, shimmerText 2s linear 1s infinite',
          }}
        >
          {msg}
        </div>

        {/* ボタン */}
        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            background: 'linear-gradient(135deg, #2ED573, #6BCB77)',
            color: '#fff',
            border: 'none',
            borderRadius: 50,
            padding: '11px 34px',
            fontSize: 15,
            fontWeight: 900,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 4px 15px rgba(46,213,115,0.35)',
            animation: 'fadeUp 0.3s ease 0.7s both',
          }}
        >
          やったー！ 🎉
        </button>
      </div>
    </div>
  )
}
