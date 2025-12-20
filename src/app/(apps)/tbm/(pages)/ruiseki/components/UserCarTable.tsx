'use client'

import React from 'react'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { NumHandler } from '@cm/class/NumHandler'
import { CsvTable, csvTableCol } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import { ColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { Button } from '@shadcn/ui/button'
import { PencilIcon } from 'lucide-react'
import { TbmVehicle } from '@prisma/generated/prisma/client'

type RefuelHistoryItem = {
  id: number
  date: Date
  odometer: number
  amount: number
  tbmVehicleId: number
  userId: number
}

type CarData = {
  car: TbmVehicle
  sokoKyoriInPeriod: number
  heikinNempiInPeriod: number
  sokyuyuRyoInPeriod: number
  fuelCostInPeriod: number
  refuelHistory: RefuelHistoryItem[]
}

type UserCarTableProps = {
  allCars: CarData[]
  whereQuery: {
    gte: Date
    lte: Date
  }
}

const UserCarTable: React.FC<UserCarTableProps> = ({ allCars, whereQuery }) => {
  const useGlobalProps = useGlobal()

  const records = allCars.map(carData => {
    const { car, sokoKyoriInPeriod, heikinNempiInPeriod, sokyuyuRyoInPeriod, fuelCostInPeriod } = carData

    return {
      carData,
      csvTableRow: [
        {
          label: `車番`,
          cellValue: car.vehicleNumber,
        },
        {
          label: `走行距離計`,
          cellValue: NumHandler.WithUnit(sokoKyoriInPeriod, 'km', 1),
          style: { textAlign: `right` },
        },
        {
          label: `平均燃費`,
          cellValue: NumHandler.WithUnit(heikinNempiInPeriod, 'km/L', 1),
          style: { textAlign: `right` },
        },
        {
          label: `総給油量`,
          cellValue: NumHandler.WithUnit(sokyuyuRyoInPeriod, 'L', 1),
          style: { textAlign: `right` },
        },
        {
          label: `使用金額`,
          cellValue: NumHandler.WithUnit(fuelCostInPeriod, '円', 1),
        },
        {
          label: `給油履歴`,
          cellValue: <RefuelHistoryButton carData={carData} whereQuery={whereQuery} useGlobalProps={useGlobalProps} />,
        },
      ],
    }
  })

  return CsvTable({ records: records.map(r => ({ csvTableRow: r.csvTableRow as csvTableCol[] })) }).WithWrapper({
    size: 'sm',
    className: ''
  })
}

type RefuelHistoryButtonProps = {
  carData: CarData
  whereQuery: {
    gte: Date
    lte: Date
  }
  useGlobalProps: ReturnType<typeof useGlobal>
}

const RefuelHistoryButton: React.FC<RefuelHistoryButtonProps> = ({ carData, whereQuery, useGlobalProps }) => {
  const { Modal, handleOpen } = useModal()
  const { car } = carData

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="flex items-center gap-1 h-7 text-xs"
      >
        <PencilIcon className="w-3 h-3" />
        給油履歴
      </Button>

      <Modal
        title={`給油履歴編集 - ${car.vehicleNumber}`}
        description={`${formatDate(whereQuery.gte, 'short')} ～ ${formatDate(whereQuery.lte, 'short')} の給油履歴`}
      >
        <div className={`w-fit mx-auto`}>
          <ChildCreator
            {...{
              ParentData: car,
              useGlobalProps,
              additional: {
                include: { TbmVehicle: {}, User: {} },
                orderBy: [{ date: 'desc' }, { id: 'asc' }],
              },
              models: { parent: `tbmVehicle`, children: `tbmRefuelHistory` },
              columns: ColBuilder.tbmRefuelHistory({
                useGlobalProps,
                ColBuilderExtraProps: { tbmVehicleId: car.id },
              }),
            }}
          />
        </div>
      </Modal>
    </>
  )
}

export default UserCarTable
