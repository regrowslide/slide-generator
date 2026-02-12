'use client'
import React from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

interface PaginationControlProps {
  currentPage: number
  itemsPerPage: number | undefined
  maxRecord: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number | undefined) => void
}

export default function PaginationControl({
  currentPage,
  itemsPerPage,
  maxRecord,
  onPageChange,
  onItemsPerPageChange,
}: PaginationControlProps) {
  const totalPages = itemsPerPage ? Math.ceil(maxRecord / itemsPerPage) : 1

  return (
    <R_Stack className="mt-4 justify-center gap-2 p-2">
      {/* ページあたり表示件数選択 */}
      <select
        className="rounded-sm border px-2 py-1 text-sm"
        value={itemsPerPage ?? 'all'}
        onChange={e => {
          const value = e.target.value === 'all' ? undefined : Number(e.target.value)
          onItemsPerPageChange(value)
        }}
      >
        <option value="all">全件表示</option>
        <option value={15}>15件</option>
        <option value={30}>30件</option>
        <option value={50}>50件</option>
        <option value={100}>100件</option>
        <option value={300}>300件</option>
        <option value={900}>900件</option>
      </select>

      {/* ページネーションコントロール */}
      <Button color="blue" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        前へ
      </Button>

      {/* ページ選択セレクトボックス */}
      <select
        className="rounded-sm border px-2 py-1 text-sm font-bold"
        value={currentPage}
        onChange={e => onPageChange(Number(e.target.value))}
      >
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <option key={page} value={page}>
            {page} / {totalPages}
          </option>
        ))}
      </select>

      <Button color="blue" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        次へ
      </Button>
    </R_Stack>
  )
}
