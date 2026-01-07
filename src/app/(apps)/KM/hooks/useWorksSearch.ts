/**
 * Works検索用のカスタムフック
 */

import { useState, useMemo, useCallback } from 'react'
import type { Work } from '../types/works'

interface UseWorksSearchOptions {
  works: Work[]
}

export const useWorksSearch = ({ works }: UseWorksSearchOptions) => {
  const [workState, setWorkState] = useState<Work[]>(works)

  // 検索フィルタリング関数
  const filterWorks = useCallback((searchData: Record<string, string>) => {
    const filtered = works.filter(work => {
      const isHit = Object.keys(searchData).reduce((acc, key) => {
        const input = searchData[key]
        if (!input) return acc // 空の場合はスキップ

        const data = String(work[key])
        const hit = data.includes(String(input))
        return acc && hit
      }, true)

      return isHit
    })

    setWorkState(filtered)
  }, [works])

  // 一意な値を取得
  const getUniqueValues = useCallback((key: string) => {
    return works
      .reduce((acc: string[], work) => {
        const dataKey = work[key]
        const isExist = acc.includes(dataKey)
        if (!isExist && dataKey) acc.push(dataKey)
        return acc
      }, [])
      .filter(val => val)
  }, [works])

  return {
    workState,
    filterWorks,
    getUniqueValues,
  }
}

