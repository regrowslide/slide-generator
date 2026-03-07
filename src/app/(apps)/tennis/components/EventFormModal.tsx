'use client'

import { useState, useEffect } from 'react'
import useModal from '@cm/components/utils/modal/useModal'
import CourtMultiSelect from './CourtMultiSelect'
import { HOUR_OPTIONS } from '../lib/constants'
import type { TennisCourtWithRelations, EventFormData, EventCourtInput } from '../lib/types'

type Props = {
  modal: ReturnType<typeof useModal>
  courts: TennisCourtWithRelations[]
  initialData?: EventFormData | null
  onSubmit: (data: EventFormData) => void
  title?: string
}

export default function EventFormModal({ modal, courts, initialData, onSubmit, title = '予定を作成' }: Props) {
  const [form, setForm] = useState<EventFormData>({
    title: '練習',
    date: '',
    startTime: '07:00',
    endTime: '09:00',
    courts: [],
    memo: '',
  })

  useEffect(() => {
    if (initialData) {
      setForm(initialData)
    } else {
      setForm({ title: '練習', date: '', startTime: '07:00', endTime: '09:00', courts: [], memo: '' })
    }
  }, [initialData])

  const handleSubmit = () => {
    if (!form.title || !form.date) return
    onSubmit(form)
    modal.handleClose()
  }

  return (
    <modal.Modal title={title}>
      <div className="space-y-4 w-[360px] max-w-[80vw]">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">タイトル</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="例：定期練習会"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">日付</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <HourSelect label="開始時間" value={form.startTime} onChange={(v) => setForm((p) => ({ ...p, startTime: v }))} />
          <HourSelect label="終了時間" value={form.endTime} onChange={(v) => setForm((p) => ({ ...p, endTime: v }))} />
        </div>
        <CourtMultiSelect courts={courts} selected={form.courts} onChange={(c: EventCourtInput[]) => setForm((p) => ({ ...p, courts: c }))} />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">メモ（任意）</label>
          <textarea
            value={form.memo}
            onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
            placeholder=""
            rows={2}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 resize-none"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!form.title || !form.date}
          className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold py-3 rounded-xl hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {title === '予定を編集' ? '更新する' : '作成する'}
        </button>
      </div>
    </modal.Modal>
  )
}

function HourSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 bg-white"
      >
        {HOUR_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
