'use client'

import {useCallback, useEffect, useState} from 'react'
import type {ProfitMarginAlert} from '../types'
import {checkProfitMarginAlert} from '../server-actions/profit-margin-actions'

interface UseProfitMarginAlertProps {
  packCount: number
  profitMargin: number
  sellingPrice: number
}

export const useProfitMarginAlert = ({packCount, profitMargin, sellingPrice}: UseProfitMarginAlertProps) => {
  const [alert, setAlert] = useState<ProfitMarginAlert | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchAlert = useCallback(async () => {
    if (packCount <= 0) {
      setAlert(null)
      return
    }

    setIsLoading(true)
    try {
      const result = await checkProfitMarginAlert(packCount, profitMargin, sellingPrice)
      setAlert(result)
    } catch (error) {
      console.error('粗利アラート取得エラー:', error)
      setAlert(null)
    } finally {
      setIsLoading(false)
    }
  }, [packCount, profitMargin, sellingPrice])

  useEffect(() => {
    fetchAlert()
  }, [fetchAlert])

  return {alert, isLoading}
}
