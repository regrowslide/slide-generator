'use client'

import React from 'react'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { Button } from '@cm/components/styles/common-components/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  selectedYearMonth: string
  onYearMonthChange: (newYearMonth: string) => void
}

const MonthNavigator = ({ selectedYearMonth, onYearMonthChange }: Props) => {
  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentYearMonth = new Date(selectedYearMonth + '-01')
    const newDate = new Date(currentYearMonth)
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    onYearMonthChange(formatDate(newDate, 'YYYY-MM'))
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => navigateMonth('prev')} className="p-2">
        <ChevronLeft size={16} />
      </Button>

      <input
        type="month"
        value={selectedYearMonth}
        onChange={e => onYearMonthChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md"
      />

      <Button onClick={() => navigateMonth('next')} className="p-2">
        <ChevronRight size={16} />
      </Button>
    </div>
  )
}

export default MonthNavigator
