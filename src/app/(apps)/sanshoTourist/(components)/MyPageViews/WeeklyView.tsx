'use client'

import React, { useMemo } from 'react'
import { MapPin, Bus, User, FileText } from 'lucide-react'
import { StVehicle } from '@prisma/generated/prisma/client'
import { StScheduleWithRelations } from '../../(server-actions)/schedule-actions'

type Props = {
  schedules: StScheduleWithRelations[]
  vehicles: StVehicle[]
}

const getDayOfWeek = (date: Date) => {
  const day = date.getDay()
  return ['日', '月', '火', '水', '木', '金', '土'][day]
}

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0]
}

export const WeeklyView = ({ schedules, vehicles }: Props) => {
  const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v])), [vehicles])

  // 日付ごとにグループ化
  const schedulesByDate = useMemo(() => {
    const groups = new Map<string, StScheduleWithRelations[]>()
    schedules.forEach(s => {
      const dateStr = formatDate(s.date)
      if (!groups.has(dateStr)) {
        groups.set(dateStr, [])
      }
      groups.get(dateStr)!.push(s)
    })
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [schedules])

  if (schedulesByDate.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📅</div>
        <p>今週のスケジュールはありません。</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {schedulesByDate.map(([dateStr, daySchedules]) => (
        <div key={dateStr}>
          <h4 className="text-lg font-semibold mb-2 p-2 bg-gray-100 rounded-t-lg border-b-2 border-indigo-500">
            {dateStr} ({getDayOfWeek(new Date(dateStr))})
          </h4>
          <div className="space-y-3">
            {daySchedules.map(s => (
              <div key={s.id} className="p-4 bg-white rounded-lg shadow-md border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      {s.departureTime} 〜 {s.returnTime}
                    </span>
                    <h5 className="text-xl font-semibold text-gray-800">{s.organizationName || '(団体名未設定)'}</h5>
                  </div>
                  {s.pdfFileName && (
                    <a
                      href={s.pdfFileUrl || '#'}
                      onClick={e => {
                        if (!s.pdfFileUrl) {
                          e.preventDefault()
                          alert(`「${s.pdfFileName}」を開きます (機能未実装)`)
                        }
                      }}
                      className="flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      運行指示書
                    </a>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                    <strong>行き先:</strong> <span className="ml-1">{s.destination || '-'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Bus className="w-4 h-4 mr-1.5 text-gray-400" />
                    <strong>車両:</strong> <span className="ml-1">{vehicleMap.get(s.stVehicleId || 0)?.plateNumber || '不明'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-1.5 text-gray-400" />
                    <strong>担当:</strong> <span className="ml-1">{s.organizationContact || '-'}</span>
                  </div>
                </div>
                {s.hasGuide && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">ガイド付き</span>
                  </div>
                )}
                {s.remarks && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700 border border-gray-200">
                    <strong>備考:</strong> {s.remarks}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

