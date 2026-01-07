/**
 * Works一括編集用のフィルタリングフック
 */

import { useState, useMemo } from 'react'

type FilterPublicType = 'all' | 'public' | 'private'

interface UseWorksBulkFilterOptions {
  works: any[]
}

export const useWorksBulkFilter = ({ works }: UseWorksBulkFilterOptions) => {
  const [filterPublic, setFilterPublic] = useState<FilterPublicType>('all')
  const [filterClient, setFilterClient] = useState<string>('')

  // フィルタリングされた実績（sortOrderでソート）
  const filteredWorks = useMemo(() => {
    return works
      .filter(work => {
        if (filterPublic === 'public' && !work.isPublic) return false
        if (filterPublic === 'private' && work.isPublic) return false
        if (filterClient && work.kaizenClientId !== Number(filterClient)) return false
        return true
      })
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  }, [works, filterPublic, filterClient])

  return {
    filterPublic,
    filterClient,
    filteredWorks,
    setFilterPublic,
    setFilterClient,
  }
}

