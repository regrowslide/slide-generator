'use client'

import React, { useMemo } from 'react'
import { MapPin, Bus, User, FileText, Users, UserCheck, Building, Clock } from 'lucide-react'
import { StVehicle } from '@prisma/generated/prisma/client'
import { StScheduleWithRelations } from '../../(server-actions)/schedule-actions'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

type Props = {
  schedules: StScheduleWithRelations[]
  vehicles: StVehicle[]
}

const getDayOfWeek = (date: Date) => {
  const day = date.getDay()
  return ['日', '月', '火', '水', '木', '金', '土'][day]
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
            {daySchedules.map(s => {
              const vehicle = vehicleMap.get(s.stVehicleId || 0)
              const driverNames = s.StScheduleDriver?.map(sd => sd.userId).join(', ') || ''
              const allDrivers = s.StScheduleDriver?.map(sd => `ユーザーID: ${sd.userId}`).join(', ') || ''



              return (
                <div key={s.id} className="p-4 bg-white rounded-lg shadow-md border-l-4 border-blue-500">
                  {/* ヘッダー: 時間、団体名、PDF */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700">
                          {s.departureTime} → {s.returnTime}
                        </span>
                        {s.hasGuide && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <UserCheck className="w-3 h-3 mr-1" />
                            ガイド有
                          </span>
                        )}
                      </div>
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
                        className="flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 flex-shrink-0 ml-2"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        運行指示書
                      </a>
                    )}
                  </div>

                  {/* 主要情報: グリッドレイアウト */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {/* 左カラム */}
                    <div className="space-y-2">
                      <div className="flex items-start text-sm text-gray-700">
                        <MapPin className="w-4 h-4 mr-1.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong className="text-gray-600">行き先:</strong>
                          <span className="ml-1">{s.destination || '-'}</span>
                        </div>
                      </div>
                      <div className="flex items-start text-sm text-gray-700">
                        <Bus className="w-4 h-4 mr-1.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong className="text-gray-600">車両:</strong>
                          <span className="ml-1">
                            {vehicle?.plateNumber || '不明'}
                            {vehicle && (
                              <span className="text-xs text-gray-500 ml-1">
                                ({vehicle.type} / 正{vehicle.seats}座席 / 補{vehicle.subSeats}座席)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      {s.StScheduleDriver && s.StScheduleDriver.length > 0 && (
                        <div className="flex items-start text-sm text-gray-700">
                          <Users className="w-4 h-4 mr-1.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong className="text-gray-600">乗務員:</strong>
                            <span className="ml-1 text-xs">
                              {s.StScheduleDriver.map((sd, idx) => (
                                <span key={sd.userId}>
                                  {idx > 0 && ', '}ID: {sd.userId}
                                </span>
                              ))}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 右カラム */}
                    <div className="space-y-2">
                      {s.StCustomer && (
                        <div className="flex items-start text-sm text-gray-700">
                          <Building className="w-4 h-4 mr-1.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong className="text-gray-600">顧客:</strong>
                            <span className="ml-1">{s.StCustomer.name || '-'}</span>
                          </div>
                        </div>
                      )}
                      {s.StContact && (
                        <div className="flex items-start text-sm text-gray-700">
                          <User className="w-4 h-4 mr-1.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong className="text-gray-600">担当者:</strong>
                            <span className="ml-1">
                              {s.StContact.name || s.organizationContact || '-'}
                              {s.StContact.phone && (
                                <span className="text-xs text-gray-500 ml-1">({s.StContact.phone})</span>
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                      {s.organizationContact && !s.StContact && (
                        <div className="flex items-start text-sm text-gray-700">
                          <User className="w-4 h-4 mr-1.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong className="text-gray-600">担当者:</strong>
                            <span className="ml-1">{s.organizationContact}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 備考 */}
                  {s.remarks && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700 border border-gray-200">
                      <strong>備考:</strong> {s.remarks}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

