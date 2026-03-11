'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { KidsKeyframes } from '../../components/KidsStyles'
import { CelebrationEffect } from '../../components/CelebrationEffect'
import { CompletionPopup } from '../../components/CompletionPopup'
import { RoutineCard } from '../../components/RoutineCard'
import { ProgressBar } from '../../components/ProgressBar'
import { AchievementView } from '../../components/AchievementView'
import { toggleRoutine, resetToday, getAchievements } from '../../_actions/log-actions'
import type { CategoryWithRoutines, KidsRoutine, AchievementEntry, StreakInfo, KidsChild } from '../../types'

type Props = {
  child: KidsChild
  categories: CategoryWithRoutines[]
  initialCompletedIds: number[]
  initialStreak: StreakInfo
  initialAchievementCount: number
}

export default function KidsRoutineClient({
  child,
  categories,
  initialCompletedIds,
  initialStreak,
  initialAchievementCount,
}: Props) {
  const router = useRouter()
  const [completedIds, setCompletedIds] = useState<Set<number>>(
    new Set(initialCompletedIds)
  )
  const [popup, setPopup] = useState<{ name: string; sticker: string } | null>(null)
  const [celeb, setCeleb] = useState(false)
  const [streak, setStreak] = useState(initialStreak)
  const [achievementCount, setAchievementCount] = useState(initialAchievementCount)

  // 実績画面
  const [showAchiev, setShowAchiev] = useState(false)
  const [achievements, setAchievements] = useState<AchievementEntry[]>([])

  // 全ルーチンをフラットに
  const allRoutines = categories.flatMap((c) => c.KidsRoutine)
  const totalRoutines = allRoutines.length
  const completedCount = completedIds.size

  const handleToggle = useCallback(
    async (item: KidsRoutine) => {
      const wasDone = completedIds.has(item.id)

      // 楽観的更新
      setCompletedIds((prev) => {
        const next = new Set(prev)
        if (wasDone) next.delete(item.id)
        else next.add(item.id)
        return next
      })

      if (!wasDone) {
        // エフェクト発火
        setCeleb(true)
        setPopup({ name: item.name, sticker: item.sticker })
        setTimeout(() => setCeleb(false), 2500)
        setAchievementCount((prev) => prev + 1)
      }

      // サーバー同期
      await toggleRoutine(item.id, child.id, item.name, item.sticker)
    },
    [completedIds, child.id]
  )

  const handleReset = async () => {
    setCompletedIds(new Set())
    setPopup(null)
    await resetToday(child.id)
  }

  const handleShowAchievements = async () => {
    const data = await getAchievements(child.id)
    setAchievements(
      data.map((d) => ({
        id: d.id,
        sticker: d.sticker,
        name: d.name,
        date: d.date,
        createdAt: d.createdAt,
      }))
    )
    setShowAchiev(true)
  }

  return (
    <>
      <KidsKeyframes />
      <CelebrationEffect active={celeb} />
      {popup && <CompletionPopup item={popup} onClose={() => setPopup(null)} />}
      {showAchiev && (
        <AchievementView
          history={achievements}
          onClose={() => setShowAchiev(false)}
        />
      )}

      <div
        className="min-h-screen flex flex-col mx-auto select-none"
        style={{
          maxWidth: 480,
          fontFamily: "'Zen Maru Gothic', sans-serif",
          background:
            'linear-gradient(170deg, #EAFAF1 0%, #F0FFF4 40%, #F8FFFC 100%)',
          transition: 'background 0.5s',
        }}
      >
        {/* ヘッダー */}
        <div className="shrink-0" style={{ padding: '14px 20px 0' }}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                router.push('/kids')
                router.refresh()
              }}
              className="cursor-pointer border-none bg-transparent"
              style={{ fontSize: 18, padding: 4 }}
            >
              ←
            </button>
            <div
              style={{
                fontSize: 17,
                fontWeight: 900,
                letterSpacing: 3,
                color: '#2ED573',
              }}
            >
              ✦ できたよ！ ✦
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  router.push(`/kids/${child.id}/master`)
                  router.refresh()
                }}
                className="cursor-pointer border-none bg-transparent"
                style={{ fontSize: 18, padding: 4 }}
              >
                ⚙️
              </button>
              <button
                onClick={handleShowAchievements}
                className="flex items-center gap-1 cursor-pointer border-none"
                style={{
                  background: 'linear-gradient(135deg, #FFD93D, #FFB020)',
                  borderRadius: 50,
                  padding: '7px 14px',
                  fontSize: 11,
                  fontWeight: 900,
                  color: '#fff',
                  fontFamily: 'inherit',
                  boxShadow: '0 2px 8px rgba(255,176,32,0.3)',
                }}
              >
                🏆 <span>{achievementCount}</span>
              </button>
            </div>
          </div>

          {/* 子ども名 */}
          <div
            className="text-center mt-1"
            style={{ fontSize: 13, fontWeight: 700, color: '#999' }}
          >
            {child.emoji} {child.name}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '12px 20px 80px' }}>
          {/* プログレスバー + 連続日数 */}
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="flex-1">
              <ProgressBar completed={completedCount} total={totalRoutines} />
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: '#FF922B',
                whiteSpace: 'nowrap',
                animation: 'streakGlow 2s ease infinite',
              }}
            >
              🔥{streak.currentStreak}日
            </div>
          </div>

          {/* コンプリートバナー */}
          {completedCount === totalRoutines && totalRoutines > 0 && (
            <div
              className="text-center mb-3"
              style={{
                padding: 10,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #E8F5E9, #F1F8E9)',
                border: '2px solid #6BCB77',
                animation: 'fadeUp 0.4s ease both',
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 900, color: '#2E7D32' }}>
                🎉 きょうのルーチンコンプリート！
              </span>
            </div>
          )}

          {/* カテゴリ別カード一覧 */}
          {categories.map((cat) => {
            const items = cat.KidsRoutine
            const catDone = items.filter((r) => completedIds.has(r.id)).length
            return (
              <div key={cat.id} style={{ marginBottom: 16 }}>
                {/* カテゴリヘッダー */}
                <div
                  className="flex items-center gap-2"
                  style={{
                    marginBottom: 10,
                    paddingBottom: 8,
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: '#555' }}>
                    {cat.name}
                  </span>
                  <span
                    className="ml-auto"
                    style={{ fontSize: 12, color: '#BBB', fontWeight: 700 }}
                  >
                    {catDone}/{items.length}
                  </span>
                </div>

                {/* カード */}
                <div className="flex flex-col gap-2.5">
                  {items.map((item) => (
                    <RoutineCard
                      key={item.id}
                      item={item}
                      done={completedIds.has(item.id)}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {/* リセットボタン */}
          {completedCount > 0 && (
            <div className="text-center mt-2">
              <button
                onClick={handleReset}
                className="cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1.5px solid #C8E6C9',
                  borderRadius: 50,
                  padding: '8px 20px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#999',
                  fontFamily: 'inherit',
                }}
              >
                🔄 きょうのリセット
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
