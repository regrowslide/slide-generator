'use client'

import {useState} from 'react'

type Props = {
  courtNumbers: string[]
  onChange: (numbers: string[]) => void
}

export default function CourtNumberEditor({courtNumbers, onChange}: Props) {
  const [input, setInput] = useState('')

  const addNumber = () => {
    const trimmed = input.trim()
    if (!trimmed || courtNumbers.includes(trimmed)) return
    onChange([...courtNumbers, trimmed])
    setInput('')
  }

  const removeNumber = (num: string) => {
    onChange(courtNumbers.filter((n) => n !== num))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">コート番号（{courtNumbers.length}面）</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {courtNumbers.map((num) => (
          <span key={num} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-sm font-medium px-2.5 py-1 rounded-full">
            {num}番
            <button type="button" onClick={() => removeNumber(num)} className="text-emerald-400 hover:text-red-500 transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 12 12">
                <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        ))}
        {courtNumbers.length === 0 && <span className="text-xs text-slate-400">コート番号を追加してください</span>}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addNumber()
            }
          }}
          placeholder="例：1, A, 南"
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
        />
        <button
          type="button"
          onClick={addNumber}
          disabled={!input.trim() || courtNumbers.includes(input.trim())}
          className="shrink-0 bg-emerald-500 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          追加
        </button>
      </div>
    </div>
  )
}
