'use client'

import type { AttendanceStatus } from '../lib/types'
import { ATTENDANCE_DISPLAY } from '../lib/types'
import { STATUS_CONFIG } from '../lib/constants'

const STATUSES: AttendanceStatus[] = ['yes', 'maybe', 'no']

type Props = {
  currentStatus?: AttendanceStatus
  onSelect: (status: AttendanceStatus) => void
  compact?: boolean
}

export default function AttendanceButtons({ currentStatus, onSelect, compact }: Props) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 mr-1">参加：</span>
        {STATUSES.map((status) => {
          const isActive = currentStatus === status
          const config = STATUS_CONFIG[status]
          return (
            <button
              key={status}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(status)
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all
                ${isActive ? `${config.bg} ${config.color} ring-2 ring-offset-1 ${config.ring}` : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}
              `}
            >
              {ATTENDANCE_DISPLAY[status]}
            </button>
          )
        })}
        {/* {currentStatus && <span className="text-xs text-slate-400 ml-auto">{STATUS_CONFIG[currentStatus].label}</span>} */}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {STATUSES.map((status) => {
        const isActive = currentStatus === status
        const config = STATUS_CONFIG[status]
        return (
          <button
            key={status}
            onClick={() => onSelect(status)}
            className={`flex-1  rounded-xl text-base font-bold transition-all
              ${isActive ? `${config.bg} ${config.color} ring-2 ring-offset-1 ${config.ring} shadow-sm` : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-200'}
            `}
          >
            {ATTENDANCE_DISPLAY[status]} {config.label}
          </button>
        )
      })}
    </div>
  )
}
