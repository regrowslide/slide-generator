'use client'
import { useState } from 'react'
import { TbmBase } from '@prisma/generated/prisma/client'
import { TbmRouteGroupWithCalendar } from '../../types/haisha-page-types'

interface UseBulkAssignmentModalParams {
  onComplete?: () => void
}

interface UseBulkAssignmentModalReturn {
  isOpen: boolean
  currentData: {
    tbmRouteGroup: TbmRouteGroupWithCalendar | null
    tbmBase: TbmBase | null
    month: Date
  }
  openModal: (params: { tbmRouteGroup: TbmRouteGroupWithCalendar; tbmBase: TbmBase | null; month: Date }) => void
  closeModal: () => void
}

/**
 * 一括割り当てモーダルの表示状態を管理するカスタムフック
 */
export function useBulkAssignmentModal({ onComplete }: UseBulkAssignmentModalParams = {}): UseBulkAssignmentModalReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [currentData, setCurrentData] = useState<{
    tbmRouteGroup: TbmRouteGroupWithCalendar | null
    tbmBase: TbmBase | null
    month: Date
  }>({
    tbmRouteGroup: null,
    tbmBase: null,
    month: new Date(),
  })

  const openModal = (params: { tbmRouteGroup: TbmRouteGroupWithCalendar; tbmBase: TbmBase | null; month: Date }) => {
    setCurrentData(params)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    currentData,
    openModal,
    closeModal,
  }
}
