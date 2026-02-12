'use client'
import { useState, useEffect, useCallback } from 'react'
import { showSpendTime } from '@cm/lib/methods/toast-helper'
import useLocalLoading from '@cm/hooks/globalHooks/useLocalLoading'
import { getListData } from '../components/getListData'
import {
  UseHaishaDataParams,
  UseHaishaDataReturn,
  HaishaListData,
  TbmDriveScheduleWithDuplicated,
  HaishaSortBy,
} from '../types/haisha-page-types'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

export function useHaishaData({
  tbmBaseId,
  whereQuery,
  mode,
  currentPage,
  itemsPerPage,
}: UseHaishaDataParams): UseHaishaDataReturn {
  const [listDataState, setListDataState] = useState<HaishaListData | null>(null)
  const [maxRecord, setMaxRecord] = useState(0)
  const { LocalLoader, toggleLocalLoading } = useLocalLoading()
  const { query } = useGlobal()

  const fetchData = useCallback(async () => {


    toggleLocalLoading(async () => {
      await showSpendTime(async () => {
        // itemsPerPageがundefinedの場合はページネーションなし（全件取得）
        const takeSkip = itemsPerPage !== undefined
          ? { take: itemsPerPage, skip: (currentPage - 1) * itemsPerPage }
          : undefined
        const sortBy = (query.sortBy as HaishaSortBy) ?? 'departureTime'
        const tbmCustomerId = query.tbmCustomerId ? parseInt(query.tbmCustomerId) : undefined
        const routeNameFilter = query.routeNameFilter as string
        console.time('HaishaPage')

        const data = await getListData({ tbmBaseId, whereQuery, mode, takeSkip, sortBy, tbmCustomerId, routeNameFilter })
        console.timeEnd('HaishaPage')
        setMaxRecord(data.maxCount)
        setListDataState(data)
      })
    })



  }, [tbmBaseId, whereQuery, mode, currentPage, itemsPerPage, query])

  useEffect(() => {
    fetchData()
  }, [query])



  // ローカルstate更新用のヘルパー関数
  const updateScheduleInState = useCallback((updatedSchedule: TbmDriveScheduleWithDuplicated) => {
    setListDataState(prev => {
      if (!prev) return null

      const newList = [...prev.TbmDriveSchedule]
      const findIndex = newList.findIndex(item => item.id === updatedSchedule.id)

      if (findIndex !== -1) {
        newList[findIndex] = updatedSchedule
      } else {
        newList.push(updatedSchedule)
      }

      return { ...prev, TbmDriveSchedule: newList }
    })
  }, [])

  const removeScheduleFromState = useCallback((scheduleId: number) => {
    setListDataState(prev => {
      if (!prev) return null

      const newList = prev.TbmDriveSchedule.filter(item => item.id !== scheduleId)
      return { ...prev, TbmDriveSchedule: newList }
    })
  }, [])

  return {
    listDataState,
    maxRecord,
    LocalLoader,
    fetchData,
    updateScheduleInState,
    removeScheduleFromState,
  }
}
