'use client'

import { UnkoBinKyuyoRecord, UnkoBinKyuyoDriveScheduleData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoBinKyuyoData'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { TbmBase, TbmVehicle, User } from '@prisma/generated/prisma/client'
import { useMemo } from 'react'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { Fields } from '@cm/class/Fields/Fields'
import { Button } from '@cm/components/styles/common-components/Button'
import { NumHandler } from '@cm/class/NumHandler'

type Props = {
  unkoBinKyuyoList: UnkoBinKyuyoRecord[]
  userList: (User & { TbmVehicle?: TbmVehicle })[]
  routeGroupList: UnkoBinKyuyoDriveScheduleData['TbmRouteGroup'][]
  vehicleList: TbmVehicle[]
  tbmBase: TbmBase | null
  whereQuery: { gte?: Date; lte?: Date }
}

export default function UnkoBinKyuyoCC({
  unkoBinKyuyoList,
  userList,
  routeGroupList,
  vehicleList,
  tbmBase,
  whereQuery,
}: Props) {
  const { router } = useGlobal()

  // 件数カウント用のマップを作成
  const countMaps = useMemo(() => {
    const routeGroupCountMap = new Map<number, number>()
    const userCountMap = new Map<number, number>()
    const vehicleCountMap = new Map<number, number>()

    unkoBinKyuyoList.forEach(row => {
      const { schedule } = row

      // 便カウント
      const routeGroupId = schedule.TbmRouteGroup.id
      routeGroupCountMap.set(routeGroupId, (routeGroupCountMap.get(routeGroupId) || 0) + 1)

      // ドライバーカウント
      if (schedule.userId) {
        userCountMap.set(schedule.userId, (userCountMap.get(schedule.userId) || 0) + 1)
      }

      // 車両カウント
      if (schedule.tbmVehicleId) {
        vehicleCountMap.set(schedule.tbmVehicleId, (vehicleCountMap.get(schedule.tbmVehicleId) || 0) + 1)
      }
    })

    return { routeGroupCountMap, userCountMap, vehicleCountMap }
  }, [unkoBinKyuyoList])

  // フィルター用の選択肢を作成
  const filterOptions = useMemo(() => {
    const { routeGroupCountMap, userCountMap, vehicleCountMap } = countMaps

    // 便選択肢
    const routeGroupOptions = routeGroupList
      .filter(route => routeGroupCountMap.has(route.id))
      .sort((a, b) => String(a.code ?? '').localeCompare(String(b.code ?? '')))
      .map(route => {
        const count = routeGroupCountMap.get(route.id) || 0
        return {
          value: route.id,
          name: `${route.code ? `[${route.code}] ` : ''}${route.name}（${count}）`,
        }
      })

    // ドライバー選択肢
    const userOptions = userList
      .filter(user => userCountMap.has(user.id))
      .sort((a, b) => String(a.code ?? '').localeCompare(String(b.code ?? '')))
      .map(user => {
        const count = userCountMap.get(user.id) || 0
        return {
          value: user.id,
          name: `${user.code ? `[${user.code}] ` : ''}${user.name}（${count}）`,
        }
      })

    // 車両選択肢
    const vehicleOptions = vehicleList
      .filter(vehicle => vehicleCountMap.has(vehicle.id))
      .sort((a, b) => String(a.vehicleNumber ?? '').localeCompare(String(b.vehicleNumber ?? '')))
      .map(vehicle => {
        const count = vehicleCountMap.get(vehicle.id) || 0
        return {
          value: vehicle.id,
          name: `${vehicle.vehicleNumber}（${count}）`,
        }
      })

    return { routeGroupOptions, userOptions, vehicleOptions }
  }, [countMaps, routeGroupList, userList, vehicleList])

  // フィルター用BasicForm
  const { BasicForm, latestFormData, ReactHookForm } = useBasicFormProps({
    columns: new Fields([
      {
        id: 'tbmRouteGroupId',
        label: '便',
        form: { style: { minWidth: 220 } },
        forSelect: {
          optionsOrOptionFetcher: filterOptions.routeGroupOptions,
        },
      },
      {
        id: 'userId',
        label: 'ドライバー',
        form: { style: { minWidth: 180 } },
        forSelect: {
          optionsOrOptionFetcher: filterOptions.userOptions,
        },
      },
      {
        id: 'tbmVehicleId',
        label: '車両',
        form: { style: { minWidth: 150 } },
        forSelect: {
          optionsOrOptionFetcher: filterOptions.vehicleOptions,
        },
      },
    ]).transposeColumns(),
    formData: {
      tbmRouteGroupId: '',
      userId: '',
      tbmVehicleId: '',
    },
  })

  // フィルタリングされたリスト
  const filteredList = useMemo(() => {
    const filterRouteGroupId = latestFormData.tbmRouteGroupId
    const filterUserId = latestFormData.userId
    const filterVehicleId = latestFormData.tbmVehicleId

    return unkoBinKyuyoList.filter(row => {
      const { schedule } = row

      // 便フィルター
      if (filterRouteGroupId && schedule.TbmRouteGroup.id !== Number(filterRouteGroupId)) {
        return false
      }

      // ドライバーフィルター
      if (filterUserId && schedule.userId !== Number(filterUserId)) {
        return false
      }

      // 車両フィルター
      if (filterVehicleId && schedule.tbmVehicleId !== Number(filterVehicleId)) {
        return false
      }

      return true
    })
  }, [unkoBinKyuyoList, latestFormData])

  // 合計計算
  const totals = useMemo(() => {
    let standardSalaryTotal = 0
    let driverFeeTotal = 0
    let futaiFeeTotal = 0

    filteredList.forEach(row => {
      const { keyValue } = row
      if (typeof keyValue.standardSalary?.cellValue === 'number') {
        standardSalaryTotal += keyValue.standardSalary.cellValue
      }
      if (typeof keyValue.driverFee.cellValue === 'number') {
        driverFeeTotal += keyValue.driverFee.cellValue
      }
      if (typeof keyValue.futaiFee.cellValue === 'number') {
        futaiFeeTotal += keyValue.futaiFee.cellValue
      }
    })

    return { standardSalaryTotal, driverFeeTotal, futaiFeeTotal }
  }, [filteredList])

  // フィルターをリセット
  const resetFilters = () => {
    ReactHookForm.reset({
      tbmRouteGroupId: '',
      userId: '',
      tbmVehicleId: '',
    })
  }

  return (
    <>
      {/* フィルターセクション */}
      <C_Stack className="mb-4 p-4 bg-gray-50 rounded-lg">
        <R_Stack className="items-end gap-4">
          <BasicForm latestFormData={latestFormData} alignMode="row" />
          <Button size="sm" color="sub" onClick={resetFilters}>
            リセット
          </Button>
        </R_Stack>
        <R_Stack className="text-xs text-gray-500 mt-2 gap-4">
          <span>{filteredList.length} / {unkoBinKyuyoList.length} 件表示</span>
          <span>|</span>
          <span>標準給料合計: {NumHandler.WithUnit(totals.standardSalaryTotal, '円')}</span>
          <span>運賃合計: {NumHandler.WithUnit(totals.driverFeeTotal, '円')}</span>
          <span>付帯作業合計: {NumHandler.WithUnit(totals.futaiFeeTotal, '円')}</span>
        </R_Stack>
      </C_Stack>

      <div className={` relative`}>
        {filteredList.length === 0 && <PlaceHolder>表示するデータがありません</PlaceHolder>}
        {CsvTable({
          records: filteredList.map((row, rowIdx) => {
            const { keyValue, schedule } = row

            const cols = Object.entries(keyValue)

            return {
              csvTableRow: cols.map(([dataKey, item]) => {
                let value
                if (item.type === `date`) {
                  value = formatDate(item.cellValue as Date, 'short')
                } else if (typeof item.cellValue === 'number') {
                  value = NumHandler.WithUnit(item.cellValue, '円')
                } else {
                  value = item.cellValue ?? '-'
                }

                const baseWidth = 80
                const width = item?.style?.minWidth ?? baseWidth

                const style = {
                  fontSize: 13,
                  ...item.style,
                  minWidth: width,
                }

                return {
                  ...item,
                  label: <div className="text-xs">{item.label}</div>,
                  style,
                  cellValue: value,
                }
              }),
            }
          }),
        }).WithWrapper({
          className: `w-[calc(95vw)] max-h-[75vh]`,
        })}
      </div>
    </>
  )
}
