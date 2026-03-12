'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { KidsChild } from './types'
import { createChild, updateChild, deleteChild } from './_actions/child-actions'
import { KidsKeyframes } from './components/KidsStyles'

type Props = {
  initialChildren: KidsChild[]
  userId: string
}

const CHILD_EMOJIS = ['👶', '👧', '👦', '🧒', '👸', '🤴', '🧑', '🐣']

export default function KidsHomeClient({ initialChildren, userId }: Props) {
  const router = useRouter()
  const [children, setChildren] = useState(initialChildren)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('👶')

  const handleCreate = async () => {
    if (!name.trim()) return
    const child = await createChild(userId, name.trim(), emoji)
    setChildren((prev) => [...prev, child])
    setName('')
    setEmoji('👶')
    setShowForm(false)
  }

  const handleUpdate = async () => {
    if (!editingId || !name.trim()) return
    await updateChild(editingId, { name: name.trim(), emoji })
    setChildren((prev) =>
      prev.map((c) => (c.id === editingId ? { ...c, name: name.trim(), emoji } : c))
    )
    setEditingId(null)
    setName('')
    setEmoji('👶')
  }

  const handleDelete = async (childId: number) => {
    await deleteChild(childId)
    setChildren((prev) => prev.filter((c) => c.id !== childId))
  }

  const startEdit = (child: KidsChild) => {
    setEditingId(child.id)
    setName(child.name)
    setEmoji(child.emoji)
    setShowForm(true)
  }

  return (
    <>
      <KidsKeyframes />
      <div
        className="min-h-screen flex flex-col items-center mx-auto select-none"
        style={{
          maxWidth: 480,
          fontFamily: "'Zen Maru Gothic', sans-serif",
          background: 'linear-gradient(170deg, #EAFAF1 0%, #F0FFF4 40%, #F8FFFC 100%)',
          padding: '40px 20px',
        }}
      >
        {/* タイトル */}
        <div
          className="text-center mb-8"
          style={{ animation: 'fadeUp 0.4s ease both' }}
        >
          <div style={{ fontSize: 24, fontWeight: 900, color: '#2ED573', letterSpacing: 3 }}>
            ✦ できたよ！ ✦
          </div>
          <div style={{ fontSize: 13, color: '#999', fontWeight: 700, marginTop: 4 }}>
            だれのルーチン？
          </div>
        </div>

        {/* 子ども一覧 */}
        <div className="w-full flex flex-col gap-3 mb-6">
          {children.map((child, i) => (
            <div
              key={child.id}
              className="flex items-center gap-3"
              style={{ animation: `fadeUp 0.3s ease ${i * 0.1}s both` }}
            >
              <button
                onClick={() => router.push(`/kids/${child.id}`)}
                className="flex-1 flex items-center gap-4 cursor-pointer border-none text-left"
                style={{
                  background: '#fff',
                  borderRadius: 24,
                  padding: '20px 24px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  fontFamily: 'inherit',
                  transition: 'transform 0.2s',
                  minHeight: 80,
                }}
              >
                <span style={{ fontSize: 48 }}>{child.emoji}</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#2D3142' }}>
                  {child.name}
                </span>
              </button>

              {/* 編集・削除 */}
              <button
                onClick={() => startEdit(child)}
                className="cursor-pointer border-none bg-transparent"
                style={{ fontSize: 16, padding: 8 }}
              >
                ✏️
              </button>
              <button
                onClick={() => {
                  if (confirm(`${child.name}を削除しますか？`)) handleDelete(child.id)
                }}
                className="cursor-pointer border-none bg-transparent"
                style={{ fontSize: 16, padding: 8 }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {/* 追加/編集フォーム */}
        {showForm ? (
          <div
            className="w-full"
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 20,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              animation: 'fadeUp 0.3s ease both',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900, color: '#555', marginBottom: 12 }}>
              {editingId ? '✏️ へんしゅう' : '➕ あたらしくつくる'}
            </div>

            {/* 絵文字選択 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {CHILD_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className="cursor-pointer border-none"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    fontSize: 24,
                    background: emoji === e ? '#E8F5E9' : '#F5F5F5',
                    border: emoji === e ? '2px solid #6BCB77' : '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>

            {/* 名前入力 */}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="なまえをいれてね"
              className="w-full mb-3"
              style={{
                border: '2px solid #E0E0E0',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "'Zen Maru Gothic', sans-serif",
                outline: 'none',
              }}
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setName('')
                  setEmoji('👶')
                }}
                className="flex-1 cursor-pointer"
                style={{
                  background: '#F5F5F5',
                  border: 'none',
                  borderRadius: 50,
                  padding: '10px 0',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#999',
                  fontFamily: 'inherit',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                className="flex-1 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #2ED573, #6BCB77)',
                  border: 'none',
                  borderRadius: 50,
                  padding: '10px 0',
                  fontSize: 14,
                  fontWeight: 900,
                  color: '#fff',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 15px rgba(46,213,115,0.3)',
                }}
              >
                {editingId ? 'ほぞん' : 'つくる！'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="cursor-pointer border-none"
            style={{
              background: 'linear-gradient(135deg, #2ED573, #6BCB77)',
              borderRadius: 50,
              padding: '12px 32px',
              fontSize: 15,
              fontWeight: 900,
              color: '#fff',
              fontFamily: "'Zen Maru Gothic', sans-serif",
              boxShadow: '0 4px 15px rgba(46,213,115,0.3)',
              animation: 'fadeUp 0.3s ease 0.3s both',
            }}
          >
            ➕ こどもをついか
          </button>
        )}
      </div>
    </>
  )
}
