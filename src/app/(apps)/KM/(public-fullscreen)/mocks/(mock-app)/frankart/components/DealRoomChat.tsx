'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { useFrankartMockData } from '../context/MockDataContext'

type Props = { dealId: string }

const DealRoomChat: React.FC<Props> = ({ dealId }) => {
  const { chatMessages, addChatMessage, staff } = useFrankartMockData()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUser = staff[0] // 茂木（ログインユーザー想定）

  const messages = chatMessages.filter((m) => m.dealId === dealId).sort((a, b) => a.timestamp.localeCompare(b.timestamp))

  // 最下部にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = () => {
    if (!input.trim()) return
    addChatMessage({
      id: `chat-${Date.now()}`,
      dealId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 日付ラベル判定
  const getDateLabel = (timestamp: string) => {
    return timestamp.split('T')[0]
  }

  let lastDate = ''

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm flex flex-col" style={{ height: '500px' }}>
      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const dateLabel = getDateLabel(msg.timestamp)
          const showDate = dateLabel !== lastDate
          lastDate = dateLabel

          const isMe = msg.senderId === currentUser.id

          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div className="text-center">
                  <span className="text-xs text-stone-400 bg-stone-100 px-3 py-1 rounded-full">{dateLabel}</span>
                </div>
              )}
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isMe ? 'order-2' : ''}`}>
                  {!isMe && (
                    <p className="text-xs text-stone-500 mb-1 ml-1">{msg.senderName}</p>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-br-md'
                        : 'bg-stone-100 text-stone-800 rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-[10px] text-stone-400 mt-0.5 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </React.Fragment>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="border-t border-stone-200 p-3 flex gap-2">
        <input
          type="text"
          placeholder="メッセージを入力..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-2.5 border border-stone-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-2.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-full disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default DealRoomChat
