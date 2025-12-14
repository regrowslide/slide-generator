import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { NumHandler } from '@cm/class/NumHandler'
import { C_Stack } from '@cm/components/styles/common-components/common-components'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { IconBtn } from '@cm/components/styles/common-components/IconBtn'
import useModal from '@cm/components/utils/modal/useModal'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import { cn } from '@cm/shadcn/lib/utils'
import { TbmDriveSchedule, TbmRouteGroup, TbmVehicle, User } from '@prisma/generated/prisma/client'
import React from 'react'

type TbmDriveScheduleData = TbmDriveSchedule & {
  User: User
  TbmVehicle: TbmVehicle
  TbmRouteGroup: TbmRouteGroup
}
export default function EtcConnectHistoryTable({
  tbmVehicleId,
  selectedDriveSchedule,
}: {
  tbmVehicleId: number
  selectedDriveSchedule?: TbmDriveSchedule
}) {
  const HimiodukeMD = useModal()
  const { data: tbmVehicle = {} } = useDoStandardPrisma(`tbmVehicle`, `findUnique`, {
    where: { id: tbmVehicleId },
    include: {
      TbmEtcMeisai: { orderBy: [{ month: `desc` }, { groupIndex: `asc` }] },
      TbmDriveSchedule: {
        include: {
          TbmRouteGroup: {},
          User: {},
          TbmVehicle: {},
        },
      },
    },
  })

  const groupByMonth = {}

  tbmVehicle?.TbmEtcMeisai?.forEach(item => {
    const month = item.month
    if (!groupByMonth[month]) {
      groupByMonth[month] = { month, data: [] }
    }
    groupByMonth[month].data.push(item)
  })

  const groupedList = Object.values(groupByMonth)
  const TB = CsvTable({
    records: groupedList.map((monthData: any) => {
      const { month, data } = monthData ?? {}
      const sum = data.reduce((acc, item) => acc + item.sum, 0)
      return {
        csvTableRow: [
          //
          {
            label: '月',
            className: `w-[100px]`,
            cellValue: (
              <C_Stack className={` items-center  `}>
                <div className={`font-bold`}>{formatDate(month, 'YYYY/MM')}</div>
                <small>{NumHandler.WithUnit(sum, `円`)}</small>
              </C_Stack>
            ),
          },

          {
            label: '明細',
            style: { minWidth: 600 },
            cellValue: CsvTable({
              virtualized: { enabled: false },
              records: data.map(item => {
                const { TbmDriveSchedule, info: meisaiList } = item

                const firstMeisai = JSON.parse(meisaiList[0])
                const lastMeisai = JSON.parse(meisaiList[meisaiList.length - 1])

                const Route = () => {
                  // return TbmDriveSchedule ? <IconBtn></IconBtn> : <></>
                  if (TbmDriveSchedule) {
                    return <IconBtn>{TbmDriveSchedule?.routeName}</IconBtn>
                  } else {
                    return <IconBtn color={`red`}>未</IconBtn>
                  }
                }

                return {
                  csvTableRow: [
                    { label: '連番', cellValue: item.groupIndex },
                    { label: '出発', cellValue: firstMeisai.fromDatetime },
                    { label: '到着', cellValue: lastMeisai.toDatetime },
                    { label: '出発IC', cellValue: firstMeisai.fromIc },
                    { label: '到着IC', cellValue: lastMeisai.toIc },
                    { label: '請求額', cellValue: item.sum },
                    { label: '明細件数', cellValue: meisaiList.length },
                    {
                      label: '紐付先の運行',
                      cellValue: (
                        <>
                          <div
                            className={` cursor-pointer`}
                            onClick={() => {
                              HimiodukeMD.setopen(true)
                            }}
                          >
                            <Route />
                          </div>
                        </>
                      ),
                    },
                  ],
                }
              }),
            }).WithWrapper({
              size: `sm`,
              className: cn(
                //
                `rounded-none`,
                // `[&_th]:font-bold`,
                // `[&_td]:!px-`,
                `text-xs`,
                'max-h-[400px]',
                '[&_td]:border'
              ),
            }),
          },
        ],
      }
    }),
  })
  return (
    <C_Stack>
      <HimiodukeMD.Modal>
        {HimiodukeMD.open && HimiodukeMD?.open?.TbmDriveSchedule ? (
          <HimodukeKaijo {...{ TbmDriveSchedule: HimiodukeMD?.open?.TbmDriveSchedule }} />
        ) : (
          <DriveScheduleSelector {...{ TbmDriveSchedule: HimiodukeMD?.open?.TbmDriveSchedule }} />
        )}
      </HimiodukeMD.Modal>
      {TB.WithWrapper({ className: `w-[1000px]` })}
    </C_Stack>
  )
}

const HimodukeKaijo = ({ TbmDriveSchedule }: { TbmDriveSchedule: TbmDriveScheduleData }) => {
  const { User, TbmVehicle } = TbmDriveSchedule
  return (
    <div>
      <div>下記の運行データとの紐付けを解除しますか？</div>
      <div>
        <div>
          <div>{User.name}</div>
          <div>{User.name}</div>
          <div>{TbmVehicle.vehicleNumber}</div>
        </div>
      </div>
    </div>
  )
}

const DriveScheduleSelector = ({ TbmDriveSchedule }: { TbmDriveSchedule: TbmDriveScheduleData }) => {
  const { data: tbmDriveScheduleList = [] } = useDoStandardPrisma(`tbmDriveSchedule`, `findMany`, {
    where: { TbmEtcMeisai: { none: {} } },
    include: {
      User: {},
      TbmVehicle: {},
      TbmRouteGroup: {},
    },
  })

  return (
    <div className={`p-4`}>
      <div>紐付け先の運行を選択してください。</div>

      <small>ETC明細紐付け未設定の運行データのみが表示されます。</small>
      {CsvTable({
        records: tbmDriveScheduleList.map(schedule => {
          const { TbmRouteGroup, User, TbmVehicle } = schedule ?? {}
          return {
            csvTableRow: [
              //
              { label: '日付', cellValue: formatDate(schedule.date, 'YYYY/MM/DD(ddd)') },
              { label: '便名', cellValue: TbmRouteGroup?.name },
              { label: '路線名', cellValue: TbmRouteGroup?.routeName },
              { label: '運行者', cellValue: User?.name },
              { label: '車両', cellValue: TbmVehicle?.vehicleNumber },
              { label: '設定する', cellValue: '設定する' },
            ],
          }
        }),
      }).WithWrapper({ className: `w-[90vw] ` })}
      <div></div>
    </div>
  )
}
