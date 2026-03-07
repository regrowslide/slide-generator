'use client'

import type {TennisCourtWithRelations, EventCourtInput, CourtStatus} from '../lib/types'
import {COURT_STATUS_DISPLAY} from '../lib/types'

type Props = {
  courts: TennisCourtWithRelations[]
  selected: EventCourtInput[]
  onChange: (courts: EventCourtInput[]) => void
}

export default function CourtMultiSelect({courts, selected, onChange}: Props) {
  const addCourtNumber = (courtId: number, courtNumber: string) => {
    onChange([...selected, {courtId, courtNumber, status: 'planned'}])
  }

  const removeCourtEntry = (courtId: number, courtNumber: string) => {
    onChange(selected.filter((s) => !(s.courtId === courtId && s.courtNumber === courtNumber)))
  }

  const toggleStatus = (courtId: number, courtNumber: string) => {
    onChange(
      selected.map((s) =>
        s.courtId === courtId && s.courtNumber === courtNumber
          ? {...s, status: (s.status === 'planned' ? 'reserved' : 'planned') as CourtStatus}
          : s
      )
    )
  }

  const getSelected = (courtId: number) => selected.filter((s) => s.courtId === courtId)

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">コート（任意・複数選択可）</label>
      <div className="space-y-2">
        {courts.map((court) => {
          const courtSelections = getSelected(court.id)
          return (
            <div key={court.id} className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-3 py-2.5 bg-slate-50">
                <span className="font-medium text-sm text-slate-700">{court.name}</span>
                <span className="text-xs text-slate-400 ml-1.5">（{court.courtNumbers.length}面）</span>
              </div>
              <div className="px-3 py-2 space-y-1.5">
                {court.courtNumbers.map((num) => {
                  const entry = courtSelections.find((s) => s.courtNumber === num)
                  return (
                    <div key={num} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => (entry ? removeCourtEntry(court.id, num) : addCourtNumber(court.id, num))}
                        className={`flex items-center gap-2 flex-1 px-2.5 py-2 rounded-lg text-sm text-left transition-all
                          ${entry ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-500 hover:bg-slate-50'}
                        `}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                          ${entry ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}
                        `}
                        >
                          {entry && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12">
                              <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium">{num}番コート</span>
                      </button>
                      {entry && (
                        <button
                          type="button"
                          onClick={() => toggleStatus(court.id, num)}
                          className={`shrink-0 text-xs font-bold px-2.5 py-1.5 rounded-full transition-all
                            ${entry.status === 'reserved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                          `}
                        >
                          {COURT_STATUS_DISPLAY[entry.status]}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      {courts.length === 0 && <p className="text-xs text-slate-400 mt-1">コートが登録されていません。先にコートタブで登録してください。</p>}
    </div>
  )
}
