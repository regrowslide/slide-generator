'use client'

import React from 'react'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { NumHandler } from '@cm/class/NumHandler'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { KeyValue } from '@cm/components/styles/common-components/ParameterCard'
import EmptyPlaceholder from '@cm/components/utils/loader/EmptyPlaceHolder'
import { TbmReportCl } from '@app/(apps)/tbm/(class)/TbmReportCl'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import { ColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { Button } from '@shadcn/ui/button'
import { PencilIcon } from 'lucide-react'

type VehicleCardProps = {
  vehicle: {
    id: number
    vehicleNumber: string | null
    frameNo: string | null
    TbmRefuelHistory: Array<{
      id: number
      date: Date
      odometer: number
      amount: number
    }>
  }
  nenpiKanriData: {
    sokoKyoriInPeriod: number
    sokyuyuRyoInPeriod: number
    heikinNempiInPeriod: number
    fuelCostInPeriod: number
  } | undefined
  prevRefuelHistory: Array<{
    id: number
    date: Date
    odometer: number
    amount: number
  }>
  whereQuery: {
    gte?: Date
    lte?: Date
  }
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  nenpiKanriData,
  prevRefuelHistory,
  whereQuery,
}) => {
  const useGlobalProps = useGlobal()
  const { Modal, handleOpen } = useModal()

  const flexChild = `w-1/2 px-1`
  const hasHistory = vehicle.TbmRefuelHistory.length > 0

  return (
    <div className={`t-paper w-[450px] p-2`}>
      <div>
        <section>
          <R_Stack className={`text-lg font-bold justify-between items-center`}>
            <div>
              <span>{vehicle?.vehicleNumber}</span>
              <span className="text-sm text-gray-500 ml-2">{vehicle?.frameNo}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpen}
              className="flex items-center gap-1"
            >
              <PencilIcon className="w-4 h-4" />
              給油履歴を編集
            </Button>
          </R_Stack>
        </section>

        <section className={`${hasHistory ? 'opacity-100' : 'opacity-20'}`}>
          <R_Stack className={`gap-0 text-lg`}>
            <div className={flexChild}>
              <KeyValue label="総走行距離">
                <strong>{NumHandler.toPrice(nenpiKanriData?.sokoKyoriInPeriod)}</strong>
              </KeyValue>
            </div>
            <div className={flexChild}>
              <KeyValue label="総給油量">
                <strong>{NumHandler.toPrice(nenpiKanriData?.sokyuyuRyoInPeriod)}</strong>
              </KeyValue>
            </div>
            <div className={flexChild}>
              <KeyValue label="燃費">
                <strong>{NumHandler.toPrice(nenpiKanriData?.heikinNempiInPeriod)}</strong>
              </KeyValue>
            </div>
            <div className={flexChild}>
              <KeyValue label="金額">
                <strong>{NumHandler.toPrice(nenpiKanriData?.fuelCostInPeriod)}</strong>
              </KeyValue>
            </div>
          </R_Stack>
        </section>

        <section>
          {hasHistory ? (
            <>
              {CsvTable({
                records: (vehicle.TbmRefuelHistory ?? []).map((current, i) => {
                  const prev = vehicle.TbmRefuelHistory[i - 1] ?? prevRefuelHistory[0]

                  const kukanKyori = TbmReportCl.getKukankYori(prev?.odometer ?? 0, current.odometer ?? 0)

                  const kyuyuryo = current.amount
                  const nempi = kukanKyori && kyuyuryo ? kukanKyori / kyuyuryo : null

                  return {
                    csvTableRow: [
                      //
                      { label: '日付', cellValue: formatDate(current.date, 'short') },
                      { label: '給油時走行距離', cellValue: current.odometer },
                      { label: '区間距離', cellValue: kukanKyori ?? '-' },
                      { label: '給油量', cellValue: kyuyuryo },
                      { label: '燃費', cellValue: nempi ? NumHandler.round(nempi) : '-' },
                    ],
                  }
                }),
              }).WithWrapper({ className: '' })}
            </>
          ) : (
            <EmptyPlaceholder>データがありません</EmptyPlaceholder>
          )}
        </section>
      </div>

      <Modal
        title={`給油履歴編集 - ${vehicle?.vehicleNumber}`}
        description={`${formatDate(whereQuery.gte, 'short')} ～ ${formatDate(whereQuery.lte, 'short')} の給油履歴`}

      >
        <div className={`w-fit mx-auto`}>
          <ChildCreator
            {...{
              ParentData: vehicle,
              useGlobalProps,
              additional: {
                include: { TbmVehicle: {}, User: {} },
                orderBy: [{ date: 'desc' }, { id: 'asc' }],
                // where: {
                //   date: whereQuery,
                // },
              },
              models: { parent: `tbmVehicle`, children: `tbmRefuelHistory` },
              columns: ColBuilder.tbmRefuelHistory({
                useGlobalProps,
                ColBuilderExtraProps: { tbmVehicleId: vehicle.id },
              }),
            }}
          />
        </div>
      </Modal>
    </div>
  )
}

export default VehicleCard
