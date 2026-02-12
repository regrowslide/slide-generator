'use client'
import {useCallback} from 'react'
import {UsePaginationParams, UsePaginationReturn} from '../types/haisha-page-types'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

export function usePagination({initialPage = 1, initialItemsPerPage = 900}: UsePaginationParams = {}): UsePaginationReturn {
  const { addQuery, query } = useGlobal()

  // queryから現在のページとitemsPerPageを取得
  const currentPage = query.page ? parseInt(query.page as string) : initialPage
  const itemsPerPage = query.itemsPerPage ? parseInt(query.itemsPerPage as string) : initialItemsPerPage

  const handlePageChange = useCallback((page: number) => {
    addQuery({ page: String(page) })
  }, [addQuery])

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number | undefined) => {
    // itemsPerPageとpageを同時に更新
    addQuery({
      itemsPerPage: newItemsPerPage === undefined ? undefined : String(newItemsPerPage),
      page: '1' // ページサイズが変更されたら最初のページに戻る
    })
  }, [addQuery])

  // const resetPagination = useCallback(() => {
  //   setCurrentPage(1)
  // }, [])

  return {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    // resetPagination,
  }
}
