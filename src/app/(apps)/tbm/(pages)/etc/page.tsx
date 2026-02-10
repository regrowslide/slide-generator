'use client'
import React from 'react'
import { C_Stack, FitMargin } from '@cm/components/styles/common-components/common-components'
import { Card } from '@cm/shadcn/ui/card'
import { Button } from '@cm/components/styles/common-components/Button'

import { useEtcData } from './hooks/useEtcData'
import { useEtcGrouping } from './hooks/useEtcGrouping'
import { useEtcSelection } from './hooks/useEtcSelection'

import { Days } from '@cm/class/Days/Days'
import { Fields } from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import { getVehicleForSelectConfig } from '@app/(apps)/tbm/(builders)/ColBuilders/TbmVehicleColBuilder'
import { EtcScheduleLinkModal } from './components/EtcScheduleLinkModal'
import { EtcImportForm } from '@app/(apps)/tbm/(pages)/etc/components/EtcImportForm'
import EtcGroupingTab from './components/EtcGroupingTab'
import useModal from '@cm/components/utils/modal/useModal'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'

export default function EtcCsvImportPage() {
  const useGlobalProps = useGlobal()
  const { query, addQuery, accessScopes } = useGlobalProps
  const { canEdit } = accessScopes().getTbmScopes()
  const { firstDayOfMonth } = Days.month.getMonthDatum(new Date())

  const VehicleSelector = useBasicFormProps({
    columns: new Fields([
      {
        id: `tbmVehicleId`,
        label: `車両`,
        form: { style: { width: 350 }, defaultValue: query.tbmVehicleId ? parseInt(query.tbmVehicleId) : null },
        forSelect: { config: getVehicleForSelectConfig({}) },
      },
    ]).transposeColumns(),
  })

  const MonthSelector = useBasicFormProps({
    columns: new Fields([
      {
        id: `monthFrom`,
        label: `開始月`,
        type: `month`,
        form: { defaultValue: query.monthFrom ? new Date(query.monthFrom) : firstDayOfMonth },
      },
      {
        id: `monthTo`,
        label: `終了月`,
        type: `month`,
        form: { defaultValue: query.monthTo ? new Date(query.monthTo) : firstDayOfMonth },
      },
    ]).transposeColumns(),
  })

  const selectedTbmVehicleId = query.tbmVehicleId ? parseInt(query.tbmVehicleId) : 0
  const selectedMonthFrom = query.monthFrom ? new Date(query.monthFrom) : firstDayOfMonth
  const selectedMonthTo = query.monthTo ? new Date(query.monthTo) : firstDayOfMonth

  const { etcRawData, isLoading: dataLoading, importCsvData, mutateEtcRawData, deleteMonthData } = useEtcData({
    selectedTbmVehicleId,
    selectedMonthFrom,
    selectedMonthTo,
  })

  const { selectedRows, toggleRowSelection, selectedRecords, clearSelection } = useEtcSelection(etcRawData)

  const {
    isLoading: groupingLoading,
    updateGrouping,
    ungroupRecords,
    getNextGroupIndex,
  } = useEtcGrouping(etcRawData, () => {
    mutateEtcRawData()
    clearSelection()
  })

  const EtcScheduleLinkModalReturn = useModal()
  const isLoading = dataLoading || groupingLoading

  const handleLinkSchedule = (etcMeisaiId: number, scheduleId: number | null, scheduleDate: Date) => {
    EtcScheduleLinkModalReturn.handleOpen({ etcMeisaiId, scheduleId, scheduleDate })
  }

  return (
    <FitMargin className={`p-2`}>
      <C_Stack>
        <Card>
          <div className={`w-fit mx-auto`}>
            <VehicleSelector.BasicForm
              onSubmit={data => {
                addQuery({
                  tbmVehicleId: data?.tbmVehicleId,
                  month: formatDate(data.month, 'YYYY-MM-DD'),
                })
              }}
              latestFormData={VehicleSelector.latestFormData}
              alignMode="row"
            >
              <Button>検索</Button>
            </VehicleSelector.BasicForm>
          </div>
        </Card>

        {query.tbmVehicleId ? (
          <Card>
            <BasicTabs
              id="etc-import-tabs"
              TabComponentArray={[
                {
                  label: 'データインポート',
                  component: (
                    <EtcImportForm {...{ isLoading, importCsvData, selectedTbmVehicleId }} />
                  ),
                },
                {
                  label: 'データ確認とグルーピング',
                  component: (
                    <EtcGroupingTab
                      MonthSelectorBasicForm={MonthSelector.BasicForm}
                      monthSelectorLatestFormData={MonthSelector.latestFormData}
                      addQuery={addQuery}
                      etcRawData={etcRawData}
                      selectedRows={selectedRows}
                      toggleRowSelection={toggleRowSelection}
                      selectedRecords={selectedRecords}
                      isLoading={isLoading}
                      canEdit={canEdit}
                      updateGrouping={updateGrouping}
                      getNextGroupIndex={getNextGroupIndex}
                      ungroupRecords={ungroupRecords}
                      deleteMonthData={deleteMonthData}
                      selectedTbmVehicleId={selectedTbmVehicleId}
                      selectedMonthFrom={selectedMonthFrom}
                      selectedMonthTo={selectedMonthTo}
                      handleLinkSchedule={handleLinkSchedule}
                    />
                  ),
                },
              ]}
            />
          </Card>
        ) : (
          <p>車両を選択してください。</p>
        )}
      </C_Stack>

      <EtcScheduleLinkModalReturn.Modal>
        <EtcScheduleLinkModal
          etcMeisaiId={EtcScheduleLinkModalReturn?.open?.etcMeisaiId}
          scheduleId={EtcScheduleLinkModalReturn?.open?.scheduleId}
          scheduleDate={EtcScheduleLinkModalReturn?.open?.scheduleDate}
          onClose={() => EtcScheduleLinkModalReturn.handleClose()}
          onUpdate={() => {
            if (selectedTbmVehicleId && selectedMonthFrom && selectedMonthTo) {
              mutateEtcRawData()
            }
          }}
        />
      </EtcScheduleLinkModalReturn.Modal>
    </FitMargin>
  )
}
