'use client'

import React from 'react'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { NumHandler } from '@cm/class/NumHandler'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import EmptyPlaceholder from '@cm/components/utils/loader/EmptyPlaceHolder'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import { ColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { Button } from '@shadcn/ui/button'
import { PencilIcon } from 'lucide-react'
import { TbmVehicle, User } from '@prisma/generated/prisma/client'

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

type UserCardProps = {
  user: User & { TbmVehicle: TbmVehicle }
  allCars: CarData[]
  whereQuery: {
    gte: Date
    lte: Date
  }
}

const UserCard: React.FC<UserCardProps> = ({ user, allCars, whereQuery }) => {
  return (
    <div className={`t-paper w-[500px] p-2`}>
      <R_Stack className={`w-full justify-between`}>
        <h2>{user.name}</h2>
        <span className="text-sm text-gray-500">{user.code}</span>
      </R_Stack>
      {allCars.length > 0 ? (
        <div className="space-y-4">
          {allCars.map(carData => (
            <VehicleSection
              key={carData.car.id}
              carData={carData}
              whereQuery={whereQuery}
            />
          ))}
        </div>
      ) : (
        <EmptyPlaceholder>データがありません</EmptyPlaceholder>
      )}
    </div>
  )
}

type VehicleSectionProps = {
  carData: CarData
  whereQuery: {
    gte: Date
    lte: Date
  }
}

const VehicleSection: React.FC<VehicleSectionProps> = ({ carData, whereQuery }) => {
  const useGlobalProps = useGlobal()
  const { Modal, handleOpen } = useModal()
  const { car, sokoKyoriInPeriod, heikinNempiInPeriod, sokyuyuRyoInPeriod, fuelCostInPeriod } = carData

  return (
    <div className="border-t pt-2 first:border-t-0 first:pt-0">
      <R_Stack className="justify-between items-center mb-1">
        <span className="font-medium">{car.vehicleNumber}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpen}
          className="flex items-center gap-1 h-6 text-xs"
        >
          <PencilIcon className="w-3 h-3" />
          給油履歴
        </Button>
      </R_Stack>

      {CsvTable({
        records: [{
          csvTableRow: [
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
          ],
        }],
      }).WithWrapper({ className: '' })}

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
    </div>
  )
}

export default UserCard










