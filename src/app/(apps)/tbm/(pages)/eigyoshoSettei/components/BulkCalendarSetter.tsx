'use client'
import { Days } from '@cm/class/Days/Days'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { Button } from '@cm/components/styles/common-components/Button'
import { Head2 } from '@cm/components/styles/common-components/heading'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import React, { useState } from 'react'
import { Card } from '@cm/shadcn/ui/card'
import { Calendar } from '@prisma/generated/prisma/client'

export default function BulkCalendarSetter({ days, defaultSelectedDays, onConfirm, months }) {
  const weekDays = [`月`, `火`, `水`, `木`, `金`, `土`, `日`, `祝`]
  const [selectedDays, setselectedDays] = useState<Date[]>(defaultSelectedDays)
  const { data: holidays = [] } = useDoStandardPrisma(`calendar`, `findMany`, {
    where: { holidayType: `祝日` },
  })

  const setSelectedDays = async (selectedWeekDay: string, mode: 'on' | 'off') => {
    const daysToSetDisabled: Date[] = []
    const daysToSetActive: Date[] = []

    days.filter(day => {
      const shukujitsu = holidays.some(h => Days.validate.isSameDate(h.date, day))
      const hit = selectedWeekDay === `祝` ? shukujitsu : formatDate(day, 'ddd') === selectedWeekDay

      if (hit) {
        if (mode === 'on') {
          daysToSetActive.push(day)
        } else {
          daysToSetDisabled.push(day)
        }
      }
    })

    setselectedDays(prev => {
      const next = [...prev]
      daysToSetActive.forEach(item => {
        if (!next.some(d => Days.validate.isSameDate(d, item))) {
          next.push(item)
        }
      })

      daysToSetDisabled.forEach(item => {
        if (next.some(d => Days.validate.isSameDate(d, item))) {
          next.splice(
            next.findIndex(d => Days.validate.isSameDate(d, item)),
            1
          )
        }
      })

      return next
    })
  }

  return (
    <div className="w-full mx-auto p-2">
      {/* ヘッダー部分 */}

      <div className="grid grid-cols-5 w-[80vw] gap-8">
        {/* 左側: 一括設定パネル */}

        <div className="col-span-1">
          <Card variant="gradient">
            <Head2 className="text-lg font-semibold text-gray-800 mb-6 text-center">曜日別一括設定</Head2>

            <div className="space-y-4">
              {weekDays.map(wd => (
                <div key={wd} className="flex items-center justify-between p-3 bg-gray-200 rounded-lg">
                  <span className="font-medium text-gray-700 w-8">{wd}</span>
                  <div className="flex gap-2">
                    <Button className="px-4 py-2 text-sm" color="blue" onClick={() => setSelectedDays(wd, 'on')}>
                      ON
                    </Button>
                    <Button className="px-4 py-2 text-sm" color="gray" onClick={() => setSelectedDays(wd, 'off')}>
                      OFF
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* 説明文 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800 space-y-1">
                <p>• 曜日を一括で設定できます</p>
                <p>• 個別設定は右側で可能です</p>
                <p>• 一括設定後に個別修正もできます</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 右側: カレンダー表示 */}
        <div className="col-span-4">
          <Card variant="gradient">
            <Head2 className="text-lg font-semibold text-gray-800 mb-6">月別カレンダー</Head2>

            <div className="flex gap-6 overflow-x-auto pb-4">
              {months.map((month, i) => {
                const daysOnMonth = days.filter(d => Days.validate.isSameMonth(d, month))

                return (
                  <div key={i} className="flex-shrink-0">
                    <div className="sticky top-0 bg-white z-10 py-3 mb-4 border-b border-gray-200">
                      <h3 className="text-center text-lg font-semibold text-gray-800">{formatDate(month, 'YYYY年M月')}</h3>
                    </div>

                    <div className="space-y-2 min-w-[200px]">
                      {daysOnMonth.map(day => {
                        const isHoliday = holidays.some(
                          (h: Calendar) => h.holidayType === '祝日' && Days.validate.isSameDate(h.date, day)
                        )
                        const isWeekend = formatDate(day, 'ddd') === '土' || formatDate(day, 'ddd') === '日'
                        const isSelected = selectedDays.some(d => Days.validate.isSameDate(d, day))

                        // 優先度: 祝日 > 土日 > 通常
                        const bgColor = isSelected
                          ? 'bg-blue-50 border-blue-200'
                          : isHoliday
                            ? 'bg-green-50 border-green-200'
                            : isWeekend
                              ? 'bg-red-50 border-red-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'

                        return (
                          <div
                            key={day.toISOString()}
                            className={`
                              flex items-center justify-between p-3 rounded-lg border transition-all
                              ${bgColor}
                            `}
                          >
                            <span
                              className={`text-sm font-medium
                              `}
                            >
                              {formatDate(day, 'D(ddd)')}
                            </span>

                            <input
                              type="checkbox"
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                              checked={isSelected}
                              onChange={() => {
                                setselectedDays(prev => {
                                  const nextData = [...prev]
                                  if (nextData.some(d => Days.validate.isSameDate(d, day))) {
                                    nextData.splice(
                                      nextData.findIndex(d => Days.validate.isSameDate(d, day)),
                                      1
                                    )
                                  } else {
                                    nextData.push(day)
                                  }
                                  return nextData
                                })
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* 下部: アクションボタン */}
      <div className="mt-8 flex justify-end">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full lg:w-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">選択した設定を反映しますか？</div>
            <Button
              size="lg"
              color="red"
              className="px-8 py-3 font-semibold"
              onClick={async () => await onConfirm({ selectedDays })}
            >
              変更を反映
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
