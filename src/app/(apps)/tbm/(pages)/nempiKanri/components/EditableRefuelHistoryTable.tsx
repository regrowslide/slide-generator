'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { updateRefuelHistory } from '@app/(apps)/tbm/(server-actions)/refuelHistoryActions'
import { toast } from 'react-toastify'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { NumHandler } from '@cm/class/NumHandler'
import { TbmReportCl } from '@app/(apps)/tbm/(class)/TbmReportCl'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { PencilIcon } from 'lucide-react'
import { cn } from '@cm/shadcn/lib/utils'
import { useRouter } from 'next/navigation'

type RefuelHistoryItem = {
  id: number
  date: Date
  odometer: number
  amount: number
}

type EditableRefuelHistoryTableProps = {
  refuelHistory: RefuelHistoryItem[]
  prevRefuelHistory: RefuelHistoryItem[]
  onUpdate?: () => void
}

const EditableRefuelHistoryTable: React.FC<EditableRefuelHistoryTableProps> = ({
  refuelHistory,
  prevRefuelHistory,
  onUpdate,
}) => {
  const router = useRouter()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFieldClick = useCallback((id: number, field: string) => {
    setEditingId(id)
    setEditingField(field)
  }, [])

  const handleSave = useCallback(
    async (id: number, field: string, value: any) => {
      setIsLoading(true)
      try {
        const updateData: any = { id }
        if (field === 'date') {
          updateData.date = typeof value === 'string' ? new Date(value) : value
        } else if (field === 'odometer' || field === 'amount') {
          updateData[field] = value ? parseFloat(value.toString()) : null
        } else {
          updateData[field] = value
        }

        const result = await updateRefuelHistory(updateData)
        if (result.success) {
          toast.success('更新しました')
          setEditingId(null)
          setEditingField(null)
          router.refresh()
          onUpdate?.()
        } else {
          toast.error(result.error || '更新に失敗しました')
        }
      } catch (error: any) {
        console.error(error)
        toast.error('エラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    },
    [onUpdate]
  )

  const handleCancel = useCallback(() => {
    setEditingId(null)
    setEditingField(null)
  }, [])

  const records = refuelHistory.map((current, i) => {
    const prev = refuelHistory[i - 1] ?? prevRefuelHistory[0]
    const kukanKyori = TbmReportCl.getKukankYori(prev?.odometer ?? 0, current.odometer ?? 0)
    const kyuyuryo = current.amount
    const nempi = kukanKyori && kyuyuryo ? kukanKyori / kyuyuryo : null

    const isEditingDate = editingId === current.id && editingField === 'date'
    const isEditingOdometer = editingId === current.id && editingField === 'odometer'
    const isEditingAmount = editingId === current.id && editingField === 'amount'

    return {
      csvTableRow: [
        {
          label: '日付',
          cellValue: isEditingDate ? (
            <EditableDateField
              value={current.date}
              onSave={value => handleSave(current.id, 'date', value)}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          ) : (
            <EditableCell
              onClick={() => handleFieldClick(current.id, 'date')}
              value={formatDate(current.date, 'short')}
            />
          ),
        },
        {
          label: '給油時走行距離',
          cellValue: isEditingOdometer ? (
            <EditableNumberField
              value={current.odometer}
              onSave={value => handleSave(current.id, 'odometer', value)}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          ) : (
            <EditableCell
              onClick={() => handleFieldClick(current.id, 'odometer')}
              value={current.odometer}
            />
          ),
        },
        {
          label: '区間距離',
          cellValue: kukanKyori ?? '-',
        },
        {
          label: '給油量',
          cellValue: isEditingAmount ? (
            <EditableNumberField
              value={current.amount}
              onSave={value => handleSave(current.id, 'amount', value)}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          ) : (
            <EditableCell
              onClick={() => handleFieldClick(current.id, 'amount')}
              value={kyuyuryo}
            />
          ),
        },
        {
          label: '燃費',
          cellValue: nempi ? NumHandler.round(nempi) : '-',
        },
      ],
    }
  })

  return CsvTable({ records }).WithWrapper({ className: '' })
}

type EditableCellProps = {
  onClick: () => void
  value: string | number
}

const EditableCell: React.FC<EditableCellProps> = ({ onClick, value }) => {
  return (
    <div
      className="group relative flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 transition-colors"
      onClick={onClick}
      title="クリックして編集"
    >
      <span>{value}</span>
      <PencilIcon className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
    </div>
  )
}

type EditableDateFieldProps = {
  value: Date
  onSave: (value: Date) => void
  onCancel: () => void
  isLoading: boolean
}

const EditableDateField: React.FC<EditableDateFieldProps> = ({ value, onSave, onCancel, isLoading }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [currentValue, setCurrentValue] = useState(
    value ? new Date(value).toISOString().split('T')[0] : ''
  )

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (currentValue) {
          onSave(new Date(currentValue))
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    },
    [currentValue, onSave, onCancel]
  )

  const handleBlur = useCallback(() => {
    if (currentValue) {
      onSave(new Date(currentValue))
    } else {
      onCancel()
    }
  }, [currentValue, onSave, onCancel])

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="date"
        value={currentValue}
        onChange={e => setCurrentValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={isLoading}
        className="w-full px-1 py-0.5 text-xs border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

type EditableNumberFieldProps = {
  value: number
  onSave: (value: number) => void
  onCancel: () => void
  isLoading: boolean
}

const EditableNumberField: React.FC<EditableNumberFieldProps> = ({ value, onSave, onCancel, isLoading }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [currentValue, setCurrentValue] = useState(value?.toString() || '')

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        const numValue = currentValue ? parseFloat(currentValue) : null
        if (numValue !== null && !isNaN(numValue)) {
          onSave(numValue)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    },
    [currentValue, onSave, onCancel]
  )

  const handleBlur = useCallback(() => {
    const numValue = currentValue ? parseFloat(currentValue) : null
    if (numValue !== null && !isNaN(numValue)) {
      onSave(numValue)
    } else {
      onCancel()
    }
  }, [currentValue, onSave, onCancel])

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="number"
        step="0.01"
        value={currentValue}
        onChange={e => setCurrentValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={isLoading}
        className="w-full px-1 py-0.5 text-xs border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

export default EditableRefuelHistoryTable
