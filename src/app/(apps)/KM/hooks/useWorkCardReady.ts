/**
 * WorkCardのready状態管理用のカスタムフック
 */

import { useState, useEffect } from 'react'
import { PLACEHOLDER_DELAY_MS } from '../constants/workCardConstants'

export const useWorkCardReady = () => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true)
    }, PLACEHOLDER_DELAY_MS)

    return () => clearTimeout(timer)
  }, [])

  return ready
}

