'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { KidsCategory, KidsRoutine } from '../../../types'
import type { SuggestedRoutine } from '../../../types'
import {
  createCategory,
  createRoutine,
  updateCategory,
  updateRoutine,
  deleteCategory,
  deleteRoutine,
  reorderCategories,
  reorderRoutines,
  createRoutinesFromSuggestions,
} from '../../../_actions/routine-actions'
import { suggestRoutines } from '../../../_actions/ai-actions'
import { KidsKeyframes } from '../../../components/KidsStyles'

type CategoryWithRoutines = KidsCategory & { KidsRoutine: KidsRoutine[] }

type Props = {
  childId: number
  childName: string
  childEmoji: string
  initialCategories: CategoryWithRoutines[]
}

export default function KidsMasterClient({
  childId,
  childName,
  childEmoji,
  initialCategories,
}: Props) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)

  // フォーム状態
  const [showCatForm, setShowCatForm] = useState(false)
  const [catName, setCatName] = useState('')
  const [catEmoji, setCatEmoji] = useState('📌')

  const [showRoutineForm, setShowRoutineForm] = useState<number | null>(null) // categoryId
  const [rtName, setRtName] = useState('')
  const [rtEmoji, setRtEmoji] = useState('⭐')
  const [rtSticker, setRtSticker] = useState('🌟')

  // AI提案
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [aiAge, setAiAge] = useState('4')
  const [aiRequest, setAiRequest] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<SuggestedRoutine[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSelected, setAiSelected] = useState<Set<number>>(new Set())
  const [aiEditingIdx, setAiEditingIdx] = useState<number | null>(null)

  // 編集モード
  const [editingCat, setEditingCat] = useState<number | null>(null)
  const [editCatName, setEditCatName] = useState('')
  const [editCatEmoji, setEditCatEmoji] = useState('')

  const refreshCategories = useCallback(async () => {
    const { getAllCategories } = await import('../../../_actions/routine-actions')
    const data = await getAllCategories(childId)
    setCategories(data)
  }, [childId])

  // ── カテゴリ操作 ──

  const handleCreateCategory = async () => {
    if (!catName.trim()) return
    await createCategory(childId, catName.trim(), catEmoji)
    await refreshCategories()
    setCatName('')
    setCatEmoji('📌')
    setShowCatForm(false)
  }

  const handleUpdateCategory = async (catId: number) => {
    if (!editCatName.trim()) return
    await updateCategory(catId, { name: editCatName.trim(), emoji: editCatEmoji })
    await refreshCategories()
    setEditingCat(null)
  }

  const handleArchiveCategory = async (catId: number, archive: boolean) => {
    await updateCategory(catId, { isArchived: archive })
    await refreshCategories()
  }

  const handleDeleteCategory = async (catId: number) => {
    await deleteCategory(catId)
    await refreshCategories()
  }

  const handleMoveCategoryUp = async (index: number) => {
    if (index === 0) return
    const ids = categories.map((c) => c.id)
    ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
    await reorderCategories(ids)
    await refreshCategories()
  }

  const handleMoveCategoryDown = async (index: number) => {
    if (index >= categories.length - 1) return
    const ids = categories.map((c) => c.id)
    ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
    await reorderCategories(ids)
    await refreshCategories()
  }

  // ── ルーチン操作 ──

  const handleCreateRoutine = async (categoryId: number) => {
    if (!rtName.trim()) return
    await createRoutine(categoryId, {
      name: rtName.trim(),
      emoji: rtEmoji,
      sticker: rtSticker,
    })
    await refreshCategories()
    setRtName('')
    setRtEmoji('⭐')
    setRtSticker('🌟')
    setShowRoutineForm(null)
  }

  const handleArchiveRoutine = async (routineId: number, archive: boolean) => {
    await updateRoutine(routineId, { isArchived: archive })
    await refreshCategories()
  }

  const handleDeleteRoutine = async (routineId: number) => {
    await deleteRoutine(routineId)
    await refreshCategories()
  }

  const handleMoveRoutineUp = async (cat: CategoryWithRoutines, index: number) => {
    if (index === 0) return
    const ids = cat.KidsRoutine.map((r) => r.id)
    ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
    await reorderRoutines(ids)
    await refreshCategories()
  }

  const handleMoveRoutineDown = async (cat: CategoryWithRoutines, index: number) => {
    if (index >= cat.KidsRoutine.length - 1) return
    const ids = cat.KidsRoutine.map((r) => r.id)
    ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
    await reorderRoutines(ids)
    await refreshCategories()
  }

  // ── AI提案 ──

  const handleAiSuggest = async () => {
    setAiLoading(true)
    const existingRoutines = categories.flatMap((c) =>
      c.KidsRoutine.map((r) => r.name)
    )
    const existingCats = categories.map((c) => `${c.emoji}${c.name}`)
    const suggestions = await suggestRoutines(
      aiAge,
      existingRoutines,
      existingCats,
      aiRequest || undefined
    )
    setAiSuggestions(suggestions)
    setAiSelected(new Set(suggestions.map((_, i) => i)))
    setAiLoading(false)
  }

  const handleAcceptSuggestions = async () => {
    const selected = aiSuggestions.filter((_, i) => aiSelected.has(i))
    if (selected.length === 0) return

    // カテゴリごとにグループ化
    const byCat: Record<string, { emoji: string; items: SuggestedRoutine[] }> = {}
    for (const s of selected) {
      if (!byCat[s.categoryName]) {
        byCat[s.categoryName] = { emoji: s.categoryEmoji, items: [] }
      }
      byCat[s.categoryName].items.push(s)
    }

    // 既存カテゴリとのマッチング、なければ新規作成
    const routinesToCreate: Array<{
      name: string
      emoji: string
      sticker: string
      categoryId: number
      sortOrder: number
    }> = []

    for (const [catName, { emoji, items }] of Object.entries(byCat)) {
      let cat = categories.find((c) => c.name === catName)
      if (!cat) {
        // 新規カテゴリ作成
        const newCat = await createCategory(childId, catName, emoji)
        cat = { ...newCat, KidsRoutine: [] }
      }

      const existingCount = cat.KidsRoutine.length
      for (let i = 0; i < items.length; i++) {
        routinesToCreate.push({
          name: items[i].name,
          emoji: items[i].emoji,
          sticker: items[i].sticker,
          categoryId: cat.id,
          sortOrder: existingCount + i,
        })
      }
    }

    if (routinesToCreate.length > 0) {
      await createRoutinesFromSuggestions(childId, routinesToCreate)
    }

    await refreshCategories()
    setAiSuggestions([])
    setShowAiPanel(false)
  }

  const toggleAiSelect = (index: number) => {
    setAiSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const updateAiSuggestion = (index: number, field: keyof SuggestedRoutine, value: string) => {
    setAiSuggestions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  return (
    <>
      <KidsKeyframes />
      <div
        className="min-h-screen mx-auto select-none"
        style={{
          maxWidth: 480,
          fontFamily: "'Zen Maru Gothic', sans-serif",
          background: 'linear-gradient(170deg, #F5F5F5 0%, #FAFAFA 100%)',
          padding: '0 0 80px',
        }}
      >
        {/* ヘッダー */}
        <div
          className="sticky top-0 flex items-center gap-3"
          style={{
            zIndex: 10,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #EEE',
            padding: '14px 20px',
          }}
        >
          <button
            onClick={() => {
              router.push(`/kids/${childId}`)
              router.refresh()
            }}
            className="bg-transparent border-none cursor-pointer p-1"
            style={{ fontSize: 20 }}
          >
            ←
          </button>
          <div className="flex-1">
            <div style={{ fontSize: 15, fontWeight: 900, color: '#2D3142' }}>
              ⚙️ マスタかんり
            </div>
            <div style={{ fontSize: 11, color: '#999', fontWeight: 700 }}>
              {childEmoji} {childName}
            </div>
          </div>
          <button
            onClick={() => setShowAiPanel(true)}
            className="cursor-pointer border-none"
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: 50,
              padding: '7px 14px',
              fontSize: 11,
              fontWeight: 900,
              color: '#fff',
              fontFamily: 'inherit',
            }}
          >
            🤖 AIていあん
          </button>
        </div>

        {/* カテゴリ一覧 */}
        <div style={{ padding: '16px 20px' }}>
          {categories.map((cat, catIdx) => (
            <div
              key={cat.id}
              className="mb-4"
              style={{
                background: cat.isArchived ? '#F9F9F9' : '#fff',
                borderRadius: 16,
                padding: 16,
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                opacity: cat.isArchived ? 0.6 : 1,
              }}
            >
              {/* カテゴリヘッダー */}
              <div className="flex items-center gap-2 mb-3">
                {editingCat === cat.id ? (
                  <>
                    <input
                      value={editCatEmoji}
                      onChange={(e) => setEditCatEmoji(e.target.value)}
                      className="w-10 text-center"
                      style={{
                        border: '1px solid #DDD',
                        borderRadius: 8,
                        padding: 4,
                        fontSize: 18,
                      }}
                    />
                    <input
                      value={editCatName}
                      onChange={(e) => setEditCatName(e.target.value)}
                      className="flex-1"
                      style={{
                        border: '1px solid #DDD',
                        borderRadius: 8,
                        padding: '4px 8px',
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      onClick={() => handleUpdateCategory(cat.id)}
                      className="cursor-pointer border-none bg-transparent"
                      style={{ fontSize: 14 }}
                    >
                      ✅
                    </button>
                    <button
                      onClick={() => setEditingCat(null)}
                      className="cursor-pointer border-none bg-transparent"
                      style={{ fontSize: 14 }}
                    >
                      ❌
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#333' }}>
                      {cat.name}
                    </span>
                    {cat.isArchived && (
                      <span
                        style={{
                          fontSize: 9,
                          background: '#EEE',
                          borderRadius: 8,
                          padding: '2px 6px',
                          color: '#999',
                        }}
                      >
                        アーカイブ
                      </span>
                    )}
                    <div className="ml-auto flex gap-1">
                      <button
                        onClick={() => handleMoveCategoryUp(catIdx)}
                        className="cursor-pointer border-none bg-transparent"
                        style={{ fontSize: 12, opacity: catIdx === 0 ? 0.3 : 1 }}
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveCategoryDown(catIdx)}
                        className="cursor-pointer border-none bg-transparent"
                        style={{
                          fontSize: 12,
                          opacity: catIdx >= categories.length - 1 ? 0.3 : 1,
                        }}
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => {
                          setEditingCat(cat.id)
                          setEditCatName(cat.name)
                          setEditCatEmoji(cat.emoji)
                        }}
                        className="cursor-pointer border-none bg-transparent"
                        style={{ fontSize: 12 }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() =>
                          handleArchiveCategory(cat.id, !cat.isArchived)
                        }
                        className="cursor-pointer border-none bg-transparent"
                        style={{ fontSize: 12 }}
                      >
                        {cat.isArchived ? '📤' : '📥'}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`「${cat.name}」カテゴリを削除しますか？`))
                            handleDeleteCategory(cat.id)
                        }}
                        className="cursor-pointer border-none bg-transparent"
                        style={{ fontSize: 12 }}
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* ルーチン一覧 */}
              {cat.KidsRoutine.map((rt, rtIdx) => (
                <div
                  key={rt.id}
                  className="flex items-center gap-2 mb-1.5"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: rt.isArchived ? '#F5F5F5' : '#FAFAFA',
                    border: '1px solid #F0F0F0',
                    opacity: rt.isArchived ? 0.5 : 1,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{rt.emoji}</span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#555',
                    }}
                  >
                    {rt.name}
                  </span>
                  <span style={{ fontSize: 14 }}>{rt.sticker}</span>
                  <button
                    onClick={() => handleMoveRoutineUp(cat, rtIdx)}
                    className="cursor-pointer border-none bg-transparent"
                    style={{
                      fontSize: 10,
                      opacity: rtIdx === 0 ? 0.3 : 1,
                    }}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveRoutineDown(cat, rtIdx)}
                    className="cursor-pointer border-none bg-transparent"
                    style={{
                      fontSize: 10,
                      opacity: rtIdx >= cat.KidsRoutine.length - 1 ? 0.3 : 1,
                    }}
                  >
                    ▼
                  </button>
                  <button
                    onClick={() =>
                      handleArchiveRoutine(rt.id, !rt.isArchived)
                    }
                    className="cursor-pointer border-none bg-transparent"
                    style={{ fontSize: 10 }}
                  >
                    {rt.isArchived ? '📤' : '📥'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`「${rt.name}」を削除しますか？`))
                        handleDeleteRoutine(rt.id)
                    }}
                    className="cursor-pointer border-none bg-transparent"
                    style={{ fontSize: 10 }}
                  >
                    🗑️
                  </button>
                </div>
              ))}

              {/* ルーチン追加 */}
              {showRoutineForm === cat.id ? (
                <div
                  className="mt-2"
                  style={{
                    background: '#F8F8F8',
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <div className="flex gap-2 mb-2">
                    <input
                      value={rtEmoji}
                      onChange={(e) => setRtEmoji(e.target.value)}
                      placeholder="絵文字"
                      className="w-12 text-center"
                      style={{
                        border: '1px solid #DDD',
                        borderRadius: 8,
                        padding: 4,
                        fontSize: 16,
                      }}
                    />
                    <input
                      value={rtName}
                      onChange={(e) => setRtName(e.target.value)}
                      placeholder="ルーチンめい"
                      className="flex-1"
                      style={{
                        border: '1px solid #DDD',
                        borderRadius: 8,
                        padding: '4px 8px',
                        fontSize: 13,
                        fontFamily: 'inherit',
                      }}
                    />
                    <input
                      value={rtSticker}
                      onChange={(e) => setRtSticker(e.target.value)}
                      placeholder="バッジ"
                      className="w-12 text-center"
                      style={{
                        border: '1px solid #DDD',
                        borderRadius: 8,
                        padding: 4,
                        fontSize: 16,
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowRoutineForm(null)}
                      className="flex-1 cursor-pointer"
                      style={{
                        background: '#EEE',
                        border: 'none',
                        borderRadius: 8,
                        padding: 6,
                        fontSize: 12,
                        fontFamily: 'inherit',
                      }}
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={() => handleCreateRoutine(cat.id)}
                      className="flex-1 cursor-pointer"
                      style={{
                        background: '#2ED573',
                        border: 'none',
                        borderRadius: 8,
                        padding: 6,
                        fontSize: 12,
                        fontWeight: 900,
                        color: '#fff',
                        fontFamily: 'inherit',
                      }}
                    >
                      ついか
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowRoutineForm(cat.id)}
                  className="w-full cursor-pointer mt-2"
                  style={{
                    background: 'transparent',
                    border: '1.5px dashed #DDD',
                    borderRadius: 12,
                    padding: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#BBB',
                    fontFamily: 'inherit',
                  }}
                >
                  ＋ ルーチンをついか
                </button>
              )}
            </div>
          ))}

          {/* カテゴリ追加 */}
          {showCatForm ? (
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 16,
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex gap-2 mb-3">
                <input
                  value={catEmoji}
                  onChange={(e) => setCatEmoji(e.target.value)}
                  className="w-12 text-center"
                  style={{
                    border: '1px solid #DDD',
                    borderRadius: 8,
                    padding: 4,
                    fontSize: 18,
                  }}
                />
                <input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="カテゴリめい"
                  className="flex-1"
                  style={{
                    border: '1px solid #DDD',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontSize: 14,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCatForm(false)}
                  className="flex-1 cursor-pointer"
                  style={{
                    background: '#F5F5F5',
                    border: 'none',
                    borderRadius: 50,
                    padding: 8,
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreateCategory}
                  className="flex-1 cursor-pointer"
                  style={{
                    background: '#2ED573',
                    border: 'none',
                    borderRadius: 50,
                    padding: 8,
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#fff',
                    fontFamily: 'inherit',
                  }}
                >
                  つくる
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCatForm(true)}
              className="w-full cursor-pointer"
              style={{
                background: 'transparent',
                border: '2px dashed #DDD',
                borderRadius: 16,
                padding: 14,
                fontSize: 13,
                fontWeight: 700,
                color: '#BBB',
                fontFamily: 'inherit',
              }}
            >
              ＋ カテゴリをついか
            </button>
          )}
        </div>

        {/* AI提案パネル */}
        {showAiPanel && (
          <div
            className="fixed inset-0 flex items-end justify-center"
            style={{
              zIndex: 1000,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(3px)',
            }}
          >
            <div
              className="w-full"
              style={{
                maxWidth: 480,
                background: '#fff',
                borderRadius: '24px 24px 0 0',
                padding: 24,
                maxHeight: '80vh',
                overflowY: 'auto',
                fontFamily: "'Zen Maru Gothic', sans-serif",
                animation: 'fadeUp 0.3s ease both',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div style={{ fontSize: 16, fontWeight: 900, color: '#2D3142' }}>
                  🤖 AIにルーチンをていあんしてもらう
                </div>
                <button
                  onClick={() => {
                    setShowAiPanel(false)
                    setAiSuggestions([])
                  }}
                  className="cursor-pointer border-none bg-transparent"
                  style={{ fontSize: 18 }}
                >
                  ✕
                </button>
              </div>

              {aiSuggestions.length === 0 ? (
                <>
                  <div className="mb-3">
                    <label
                      style={{ fontSize: 12, fontWeight: 700, color: '#999' }}
                    >
                      おこさまのねんれい
                    </label>
                    <select
                      value={aiAge}
                      onChange={(e) => setAiAge(e.target.value)}
                      className="w-full mt-1"
                      style={{
                        border: '1px solid #DDD',
                        borderRadius: 10,
                        padding: '8px 12px',
                        fontSize: 14,
                        fontFamily: 'inherit',
                      }}
                    >
                      {[2, 3, 4, 5, 6].map((age) => (
                        <option key={age} value={age}>
                          {age}さい
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label
                      style={{ fontSize: 12, fontWeight: 700, color: '#999' }}
                    >
                      ようぼう（にゅうりょくしなくてもOK）
                    </label>
                    <input
                      value={aiRequest}
                      onChange={(e) => setAiRequest(e.target.value)}
                      placeholder="れい: おてつだい系をふやしたい"
                      className="w-full mt-1"
                      style={{
                        border: '1px solid #DDD',
                        borderRadius: 10,
                        padding: '8px 12px',
                        fontSize: 14,
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <button
                    onClick={handleAiSuggest}
                    disabled={aiLoading}
                    className="w-full cursor-pointer"
                    style={{
                      background: aiLoading
                        ? '#CCC'
                        : 'linear-gradient(135deg, #667eea, #764ba2)',
                      border: 'none',
                      borderRadius: 50,
                      padding: 12,
                      fontSize: 14,
                      fontWeight: 900,
                      color: '#fff',
                      fontFamily: 'inherit',
                    }}
                  >
                    {aiLoading ? 'かんがえちゅう...' : '🤖 ていあんしてもらう'}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
                    ついかしたいルーチンをえらんでね
                  </div>
                  {aiSuggestions.map((s, i) => (
                    <div
                      key={i}
                      onClick={() => toggleAiSelect(i)}
                      className="flex items-center gap-2 cursor-pointer mb-2"
                      style={{
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: aiSelected.has(i) ? '#E8F5E9' : '#F5F5F5',
                        border: aiSelected.has(i)
                          ? '2px solid #6BCB77'
                          : '2px solid transparent',
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{s.emoji}</span>
                      <div className="flex-1">
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#333' }}>
                          {s.name}
                        </div>
                        <div style={{ fontSize: 10, color: '#999' }}>
                          {s.categoryEmoji} {s.categoryName}
                        </div>
                      </div>
                      <span style={{ fontSize: 18 }}>{s.sticker}</span>
                      <span style={{ fontSize: 16 }}>
                        {aiSelected.has(i) ? '✅' : '⬜'}
                      </span>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setAiSuggestions([])}
                      className="flex-1 cursor-pointer"
                      style={{
                        background: '#F5F5F5',
                        border: 'none',
                        borderRadius: 50,
                        padding: 10,
                        fontSize: 13,
                        fontFamily: 'inherit',
                      }}
                    >
                      もういちど
                    </button>
                    <button
                      onClick={handleAcceptSuggestions}
                      className="flex-1 cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #2ED573, #6BCB77)',
                        border: 'none',
                        borderRadius: 50,
                        padding: 10,
                        fontSize: 13,
                        fontWeight: 900,
                        color: '#fff',
                        fontFamily: 'inherit',
                      }}
                    >
                      ついか！
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
