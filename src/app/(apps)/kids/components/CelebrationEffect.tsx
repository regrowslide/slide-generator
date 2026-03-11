'use client'

import { ROUTINE_COLORS, RAIN_EMOJIS } from '../lib/constants'

type Props = {
  active: boolean
}

/** 完了時のパーティクル・ステッカーレイン・リングエフェクト */
export const CelebrationEffect = ({ active }: Props) => {
  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 998 }}>
      {/* 画面フラッシュ */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(46,213,115,0.3), transparent 70%)',
          animation: 'flashBang 0.7s ease-out forwards',
        }}
      />

      {/* バーストパーティクル */}
      <div className="absolute" style={{ left: '50%', top: '38%', width: 0, height: 0 }}>
        {Array.from({ length: 40 }, (_, i) => {
          const angle = (i / 40) * Math.PI * 2
          const spread = 70 + Math.random() * 180
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 5 + Math.random() * 10,
                height: 5 + Math.random() * 10,
                backgroundColor: ROUTINE_COLORS[i % ROUTINE_COLORS.length],
                borderRadius: i % 3 === 0 ? '50%' : '2px',
                animation: `burstOut ${0.5 + Math.random() * 0.6}s cubic-bezier(0,0.9,0.2,1) ${Math.random() * 0.15}s forwards`,
                opacity: 0,
                // @ts-expect-error CSS custom properties
                '--tx': `${Math.cos(angle) * spread}px`,
                '--ty': `${Math.sin(angle) * spread - 30}px`,
              }}
            />
          )
        })}
      </div>

      {/* ステッカーレイン */}
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={`sr-${i}`}
          style={{
            position: 'absolute',
            left: `${8 + Math.random() * 84}%`,
            top: -30,
            fontSize: 18 + Math.random() * 16,
            animation: `stickerRain ${1.2 + Math.random() * 1.5}s ease-in ${0.2 + Math.random() * 1}s forwards`,
            // @ts-expect-error CSS custom properties
            '--wobble': `${(Math.random() > 0.5 ? 1 : -1) * 60}px`,
            opacity: 0,
          }}
        >
          {RAIN_EMOJIS[i]}
        </div>
      ))}

      {/* エクスパンディングリング */}
      {[0, 0.2, 0.4].map((delay, i) => (
        <div
          key={`ring-${i}`}
          className="absolute rounded-full border-2"
          style={{
            left: '50%',
            top: '38%',
            transform: 'translate(-50%, -50%)',
            borderColor: '#2ED573',
            width: 20,
            height: 20,
            animation: `expandRing 0.8s ease-out ${delay}s forwards`,
            opacity: 0,
          }}
        />
      ))}

      <style>{`
        @keyframes expandRing {
          0% { width: 20px; height: 20px; opacity: 0.8; }
          100% { width: 300px; height: 300px; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
