'use client'

import {useState} from 'react'
import {Plus, Edit3, Trash2, Navigation, ExternalLink} from 'lucide-react'
import useModal from '@cm/components/utils/modal/useModal'
import CourtFormModal from './CourtFormModal'
import type {TennisCourtWithRelations, CourtFormData} from '../lib/types'
import {createCourt, updateCourt, deleteCourt, seedCourts} from '../_actions/court-actions'

type Props = {
  initialCourts: TennisCourtWithRelations[]
  onCourtsChange: (courts: TennisCourtWithRelations[]) => void
}

export default function CourtsTab({initialCourts, onCourtsChange}: Props) {
  const [courts, setCourts] = useState(initialCourts)
  const createModal = useModal()
  const editModal = useModal<number>()

  const editingCourt = editModal.open ? courts.find((c) => c.id === editModal.open) : null

  const handleCreate = async (data: CourtFormData) => {
    const created = await createCourt(data)
    const updated = [...courts, created]
    setCourts(updated)
    onCourtsChange(updated)
  }

  const handleUpdate = async (data: CourtFormData) => {
    if (!editModal.open) return
    const result = await updateCourt(editModal.open as number, data)
    const updated = courts.map((c) => (c.id === result.id ? result : c))
    setCourts(updated)
    onCourtsChange(updated)
  }

  const handleDelete = async (id: number) => {
    await deleteCourt(id)
    const updated = courts.filter((c) => c.id !== id)
    setCourts(updated)
    onCourtsChange(updated)
  }

  return (
    <div className="pb-24 px-3 pt-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-slate-600 px-1">登録コート一覧</h4>
        <button
          onClick={() => createModal.handleOpen()}
          className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          追加
        </button>
      </div>

      <div className="space-y-2">
        {courts.map((court) => (
          <div key={court.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-slate-800 text-sm">
                  {court.name}
                  <span className="text-xs font-normal text-slate-400 ml-1.5">（{court.courtNumbers.length}面）</span>
                </h5>
                {court.address && <p className="text-xs text-slate-500 mt-1">{court.address}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => editModal.handleOpen(court.id)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4 text-slate-400" />
                </button>
                <button onClick={() => handleDelete(court.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-slate-300 hover:text-red-400" />
                </button>
              </div>
            </div>
            {court.googleMapsUrl && (
              <a
                href={court.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                Google Mapsで開く
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>

      {courts.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
          <p className="text-sm text-slate-400 mb-4">コートが登録されていません</p>
          <button
            onClick={async () => {
              const seeded = await seedCourts()
              setCourts(seeded)
              onCourtsChange(seeded)
            }}
            className="text-xs font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full hover:bg-emerald-100 transition-colors"
          >
            サンプルデータを登録
          </button>
        </div>
      )}

      <CourtFormModal modal={createModal} onSubmit={handleCreate} />
      <CourtFormModal modal={editModal} court={editingCourt} onSubmit={handleUpdate} />
    </div>
  )
}
