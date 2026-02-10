import { useState, useEffect, useMemo } from 'react'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { Days } from '@cm/class/Days/Days'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { showSpendTime } from '@cm/lib/methods/toast-helper'
import { fetchUnkoMeisaiData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'

type UseMonthlyScheduleDataParams = {
  selectedYearMonth: string
  tbmBaseId: number
  selectedDriverId: number
  toggleLocalLoading: (callback: () => Promise<void>) => void
}

export const useMonthlyScheduleData = ({
  selectedYearMonth,
  tbmBaseId,
  selectedDriverId,
  toggleLocalLoading,
}: UseMonthlyScheduleDataParams) => {
  const [monthlyData, setMonthlyData] = useState<any>(null)
  const [userList, setUserList] = useState<any[]>([])

  const fetchData = async () => {
    toggleLocalLoading(async () => {
      await showSpendTime(async () => {
        try {
          const startDate = new Date(selectedYearMonth + '-01')
          const endDate = new Date(startDate)
          endDate.setMonth(endDate.getMonth() + 1)

          const whereQuery = {
            gte: startDate,
            lte: endDate,
          }

          const data = await fetchUnkoMeisaiData({
            firstDayOfMonth: startDate,
            allowNonApprovedSchedule: true,
            whereQuery,
            tbmBaseId,
            userId: selectedDriverId,
          })

          setMonthlyData(data)

          const { result: allUsers } = await doStandardPrisma('user', 'findMany', {
            where: { tbmBaseId },
            select: {
              id: true,
              code: true,
              name: true,
            },
            orderBy: { code: 'asc' },
          })
          setUserList(allUsers)
        } catch (error) {
          console.error('データ取得エラー:', error)
        }
      })
    })
  }

  useEffect(() => {
    fetchData()
  }, [selectedYearMonth, tbmBaseId, selectedDriverId])

  // カレンダー表示用のデータ処理
  const calendarData = useMemo(() => {
    if (!monthlyData) return null

    const startDate = new Date(selectedYearMonth + '-01')
    const monthDatum = Days.month.getMonthDatum(startDate)
    const weeks = monthDatum.getWeeks('日')

    const filteredSchedules = monthlyData.monthlyTbmDriveList.filter(item => {
      return item.schedule?.User?.id === selectedDriverId
    })

    // 日付別にスケジュールを整理
    const schedulesByDate = filteredSchedules.reduce((acc, item) => {
      const dateKey = formatDate(item.schedule.date, 'YYYY-MM-DD')
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(item)
      return acc
    }, {})

    return {
      weeks,
      schedulesByDate,
      startDate,
    }
  }, [monthlyData, selectedDriverId, selectedYearMonth])

  return { calendarData, userList }
}
