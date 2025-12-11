'use client'

import React from 'react'
import {Copy} from 'lucide-react'
import {StScheduleWithRelations} from '../../(server-actions)/schedule-actions'

type Props = {
  schedule: StScheduleWithRelations
  onClick: () => void
  onCopyStart: (e: React.MouseEvent) => void
  getDriverNames: (driverIds: number[]) => string
  isCopyMode?: boolean
}

export const ScheduleBar = ({schedule, onClick, onCopyStart, getDriverNames, isCopyMode = false}: Props) => {
  const driverIds = schedule.StScheduleDriver?.map(sd => sd.userId) || []

  return (
    <div className="mx-0.5 group relative">
      <button
        onClick={onClick}
        className="w-full h-full p-1.5 bg-blue-500 text-white rounded shadow-sm hover:bg-blue-600 focus:outline-none overflow-hidden text-left relative"
        title={`${schedule.organizationName || ''}\n${schedule.destination || ''}\n${getDriverNames(driverIds)}`}
      >
        <div className="text-xs font-semibold truncate pr-4">
          {schedule.departureTime} - {schedule.organizationName || '(未設定)'}
        </div>
        <div className="text-[10px] truncate opacity-80">{schedule.destination}</div>
        <div className="text-[10px] truncate opacity-80">{getDriverNames(driverIds)}</div>
      </button>

      {/* コピーボタン (ホバー時に表示、コピーモード中は非表示) */}
      {!isCopyMode && (
        <button
          onClick={e => {
            e.stopPropagation()
            onCopyStart(e)
          }}
          className="absolute top-0.5 right-0.5 p-1 bg-white text-blue-600 rounded-full opacity-0 group-hover:opacity-100 hover:bg-blue-100 transition-opacity shadow-sm"
          title="このスケジュールをコピー"
        >
          <Copy className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

