'use client'

import {useState, useEffect} from 'react'
import useModal from '@cm/components/utils/modal/useModal'
import CourtNumberEditor from './CourtNumberEditor'
import type {CourtFormData, TennisCourtWithRelations} from '../lib/types'
import {SCHEDULE_PAGE_OPTIONS} from '../lib/constants'

type Props = {
  modal: ReturnType<typeof useModal<number | boolean>>
  court?: TennisCourtWithRelations | null
  onSubmit: (data: CourtFormData) => void
}

export default function CourtFormModal({modal, court, onSubmit}: Props) {
  const isEdit = !!court
  const [form, setForm] = useState<CourtFormData>({
    name: '',
    address: '',
    googleMapsUrl: '',
    courtNumbers: ['1', '2'],
    schedulePageKey: '',
  })

  useEffect(() => {
    if (court) {
      setForm({
        name: court.name,
        address: court.address || '',
        googleMapsUrl: court.googleMapsUrl || '',
        courtNumbers: court.courtNumbers,
        schedulePageKey: court.schedulePageKey || '',
      })
    } else {
      setForm({name: '', address: '', googleMapsUrl: '', courtNumbers: ['1', '2'], schedulePageKey: ''})
    }
  }, [court])

  const handleSubmit = () => {
    if (!form.name) return
    const data: CourtFormData = {
      ...form,
      googleMapsUrl: form.googleMapsUrl || (form.address ? `https://maps.google.com/?q=${encodeURIComponent(form.address)}` : ''),
    }
    onSubmit(data)
    modal.handleClose()
  }

  return (
    <modal.Modal title={isEdit ? 'コートを編集' : 'コートを追加'}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">コート名</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({...p, name: e.target.value}))}
            placeholder="例：中央公園テニスコート"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
          />
        </div>
        <CourtNumberEditor courtNumbers={form.courtNumbers} onChange={(nums) => setForm((p) => ({...p, courtNumbers: nums}))} />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">住所</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm((p) => ({...p, address: e.target.value}))}
            placeholder="例：東京都新宿区○○1-2-3"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">スケジュールページ（任意）</label>
          <select
            value={form.schedulePageKey}
            onChange={(e) => setForm((p) => ({...p, schedulePageKey: e.target.value}))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 bg-white"
          >
            <option value="">なし</option>
            {SCHEDULE_PAGE_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Google Maps URL（任意）</label>
          <input
            type="url"
            value={form.googleMapsUrl}
            onChange={(e) => setForm((p) => ({...p, googleMapsUrl: e.target.value}))}
            placeholder="空欄の場合は住所から自動生成"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!form.name}
          className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold py-3 rounded-xl hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isEdit ? '更新する' : '追加する'}
        </button>
      </div>
    </modal.Modal>
  )
}
