'use client'

import type { AchievementEntry } from '../types'

type Props = {
  history: AchievementEntry[]
  onClose: () => void
}

/** じっせきかくにん画面（バッジコレクション＋日別タイムライン） */
export const AchievementView = ({ history, onClose }: Props) => {
  // 日付ごとにグルーピング
  const grouped: Record<string, AchievementEntry[]> = {}
  history.forEach((entry) => {
    if (!grouped[entry.date]) grouped[entry.date] = []
    grouped[entry.date].push(entry)
  })
  const dates = Object.keys(grouped).sort().reverse()
  const totalBadges = history.length

  const today = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
  )
    .toISOString()
    .split('T')[0]

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{
        zIndex: 900,
        background: 'linear-gradient(170deg, #FFFEF5, #FFF8EC, #FFF5F5)',
        fontFamily: "'Zen Maru Gothic', sans-serif",
      }}
    >
      {/* ヘッダー */}
      <div
        className="sticky top-0 flex items-center gap-3"
        style={{
          zIndex: 10,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '14px 20px',
        }}
      >
        <button
          onClick={onClose}
          className="bg-transparent border-none cursor-pointer p-1"
          style={{ fontSize: 22 }}
        >
          ←
        </button>
        <div className="flex-1">
          <div style={{ fontSize: 16, fontWeight: 900, color: '#2D3142' }}>
            🏆 じっせきかくにん
          </div>
          <div style={{ fontSize: 11, color: '#999', fontWeight: 700 }}>
            これまでにもらったバッジ
          </div>
        </div>
        <div
          style={{
            background: 'linear-gradient(135deg, #FFD93D, #FFB020)',
            borderRadius: 20,
            padding: '4px 14px',
            fontSize: 13,
            fontWeight: 900,
            color: '#fff',
          }}
        >
          {totalBadges}コ
        </div>
      </div>

      {/* バッジコレクション */}
      <div style={{ padding: '16px 20px 8px' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: '#BBB',
              marginBottom: 10,
              letterSpacing: 1,
            }}
          >
            🎖️ バッジコレクション
          </div>
          {totalBadges === 0 ? (
            <div
              className="text-center"
              style={{ padding: '20px 0', color: '#DDD', fontSize: 14, fontWeight: 700 }}
            >
              まだバッジがありません。ルーチンをクリアしよう！
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {history.map((entry, i) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-center"
                  style={{
                    fontSize: 28,
                    width: 44,
                    height: 44,
                    background: 'linear-gradient(135deg, #FFFDE7, #FFF8E1)',
                    borderRadius: 12,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    animation: `fadeUp 0.2s ease ${Math.min(i * 0.02, 0.5)}s both`,
                  }}
                  title={`${entry.name} (${entry.date})`}
                >
                  {entry.sticker}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 日別タイムライン */}
      <div style={{ padding: '8px 20px 40px' }}>
        {dates.map((date) => {
          const entries = grouped[date]
          const isToday = date === today
          return (
            <div key={date} style={{ marginBottom: 16 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    color: isToday ? '#2ED573' : '#BBB',
                  }}
                >
                  {isToday ? '📅 きょう' : `📅 ${date.slice(5).replace('-', '/')}`}
                </div>
                <div className="flex-1" style={{ height: 1, background: '#EEE' }} />
                <div style={{ fontSize: 11, fontWeight: 800, color: '#DDD' }}>
                  {entries.length}コ
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-1.5"
                    style={{
                      padding: '6px 10px 6px 8px',
                      background: '#fff',
                      borderRadius: 12,
                      border: '1px solid #F0F0F0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{entry.sticker}</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#666',
                        fontFamily: "'Zen Maru Gothic', sans-serif",
                      }}
                    >
                      {entry.name}
                    </span>
                    <span style={{ fontSize: 9, color: '#CCC', fontWeight: 600 }}>
                      🔄
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
