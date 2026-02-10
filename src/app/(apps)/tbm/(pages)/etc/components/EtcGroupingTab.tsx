'use client'

import React from 'react'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { Button } from '@cm/components/styles/common-components/Button'
import { EtcDataTable } from './EtcDataTable'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

type Props = {
  MonthSelectorBasicForm: any
  monthSelectorLatestFormData: any
  addQuery: (params: Record<string, any>) => void
  etcRawData: any[]
  selectedRows: { [key: number]: boolean }
  toggleRowSelection: (id: number) => void
  selectedRecords: any[]
  isLoading: boolean
  canEdit: boolean
  updateGrouping: (records: any[], nextGroupIndex: number) => void
  getNextGroupIndex: () => number
  ungroupRecords: (meisaiId: number) => Promise<void>
  deleteMonthData: (tbmVehicleId: number, monthFrom: Date, monthTo: Date) => void
  selectedTbmVehicleId: number
  selectedMonthFrom: Date
  selectedMonthTo: Date
  handleLinkSchedule: (etcMeisaiId: number, scheduleId: number | null, scheduleDate: Date) => void
}

const EtcGroupingTab = ({
  MonthSelectorBasicForm,
  monthSelectorLatestFormData,
  addQuery,
  etcRawData,
  selectedRows,
  toggleRowSelection,
  selectedRecords,
  isLoading,
  canEdit,
  updateGrouping,
  getNextGroupIndex,
  ungroupRecords,
  deleteMonthData,
  selectedTbmVehicleId,
  selectedMonthFrom,
  selectedMonthTo,
  handleLinkSchedule,
}: Props) => {
  return (
    <div>
      <MonthSelectorBasicForm
        latestFormData={monthSelectorLatestFormData}
        alignMode="row"
        onSubmit={(data: any) => {
          addQuery({
            monthFrom: formatDate(data.monthFrom, 'YYYY-MM-DD'),
            monthTo: formatDate(data.monthTo, 'YYYY-MM-DD'),
          })
        }}
      >
        <Button>検索</Button>
      </MonthSelectorBasicForm>

      {etcRawData.length > 0 ? (
        <>
          <div className="mb-4">
            <R_Stack className=" justify-between">
              <Button
                onClick={() => updateGrouping(selectedRecords, getNextGroupIndex())}
                disabled={isLoading || selectedRecords.length === 0 || !canEdit}
                className={`mt-2 ${!canEdit ? 'pointer-events-none opacity-50' : ''}`}
              >
                選択したレコードをグループ化
              </Button>

              <Button
                onClick={() => deleteMonthData(selectedTbmVehicleId, selectedMonthFrom, selectedMonthTo)}
                disabled={isLoading || !canEdit}
                className={`mt-2 bg-red-500 hover:bg-red-600 ${!canEdit ? 'pointer-events-none opacity-50' : ''}`}
              >
                選択中の期間のデータを一括削除
              </Button>
            </R_Stack>
          </div>
          <EtcDataTable
            etcRawData={etcRawData}
            selectedRows={selectedRows}
            toggleRowSelection={toggleRowSelection}
            ungroupRecords={ungroupRecords}
            handleLinkSchedule={handleLinkSchedule}
          />
        </>
      ) : (
        <p>表示するデータがありません。</p>
      )}
    </div>
  )
}

export default EtcGroupingTab
