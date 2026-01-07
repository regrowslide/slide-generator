/**
 * Worksフィルタリング用のカスタムフック
 */

import { useState, useMemo, useCallback } from 'react'
import type { CategoryType, Work } from '../types/works'

interface UseWorksFilterOptions {
  works: Work[]
}

interface FilterState {
  searchQuery: string
  selectedCategory: string | null
  selectedCategoryType: CategoryType | null
}

export const useWorksFilter = ({ works }: UseWorksFilterOptions) => {
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    selectedCategory: null,
    selectedCategoryType: null,
  })

  // フィルタリングされた実績
  const filteredWorks = useMemo(() => {
    return works.filter(work => {
      // 検索クエリでフィルタ
      if (filterState.searchQuery) {
        const query = filterState.searchQuery.toLowerCase()
        const titleMatch = work.title?.toLowerCase().includes(query)
        const subtitleMatch = work.subtitle?.toLowerCase().includes(query)
        const descriptionMatch = work.description?.toLowerCase().includes(query)
        if (!titleMatch && !subtitleMatch && !descriptionMatch) return false
      }

      // カテゴリーでフィルタ
      if (filterState.selectedCategory && filterState.selectedCategoryType) {
        if (work[filterState.selectedCategoryType] !== filterState.selectedCategory) return false
      }

      return true
    })
  }, [works, filterState.searchQuery, filterState.selectedCategory, filterState.selectedCategoryType])

  const setSearchQuery = useCallback((query: string) => {
    setFilterState(prev => ({ ...prev, searchQuery: query }))
  }, [])

  const setCategory = useCallback((category: string | null, type: CategoryType | null) => {
    setFilterState(prev => ({ ...prev, selectedCategory: category, selectedCategoryType: type }))
  }, [])

  const handleCategoryClick = useCallback((category: string, type: CategoryType) => {
    setFilterState(prev => {
      // 同じカテゴリーをクリックしたら解除
      if (prev.selectedCategory === category && prev.selectedCategoryType === type) {
        return { ...prev, selectedCategory: null, selectedCategoryType: null }
      }
      return { ...prev, selectedCategory: category, selectedCategoryType: type }
    })
  }, [])

  const resetFilters = useCallback(() => {
    setFilterState({
      searchQuery: '',
      selectedCategory: null,
      selectedCategoryType: null,
    })
  }, [])

  return {
    filteredWorks,
    searchQuery: filterState.searchQuery,
    selectedCategory: filterState.selectedCategory,
    selectedCategoryType: filterState.selectedCategoryType,
    setSearchQuery,
    setCategory,
    handleCategoryClick,
    resetFilters,
  }
}

