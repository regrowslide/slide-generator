import { useMemo } from 'react'
import { MonthlyTbmDriveData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import { TbmCustomer, TbmRouteGroup, TbmVehicle, User } from '@prisma/generated/prisma/client'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { Fields } from '@cm/class/Fields/Fields'
import { optionType } from '@cm/class/Fields/col-operator-types'

type TbmRouteGroupWithCustomer = TbmRouteGroup & {
  Mid_TbmRouteGroup_TbmCustomer?: {
    TbmCustomer: TbmCustomer
  } | null
}

type UseUnkoMeisaiFilterParams = {
  monthlyTbmDriveList: MonthlyTbmDriveData[]
  tbmRouteGroupList: TbmRouteGroupWithCustomer[]
  userList: User[]
  tbmCustomerList: TbmCustomer[]
  tbmVehicleList: TbmVehicle[]
}

export const useUnkoMeisaiFilter = ({
  monthlyTbmDriveList,
  tbmRouteGroupList,
  userList,
  tbmCustomerList,
  tbmVehicleList,
}: UseUnkoMeisaiFilterParams) => {
  // 件数カウント用のマップを作成
  const countMaps = useMemo(() => {
    const routeGroupCountMap = new Map<number, number>()
    const userCountMap = new Map<number, number>()
    const customerCountMap = new Map<number, number>()
    const vehicleCountMap = new Map<number, number>()

    monthlyTbmDriveList.forEach(row => {
      const { schedule } = row

      const routeGroupId = schedule.TbmRouteGroup.id
      routeGroupCountMap.set(routeGroupId, (routeGroupCountMap.get(routeGroupId) || 0) + 1)

      if (schedule.userId) {
        userCountMap.set(schedule.userId, (userCountMap.get(schedule.userId) || 0) + 1)
      }

      const customerId = schedule.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.id
      if (customerId) {
        customerCountMap.set(customerId, (customerCountMap.get(customerId) || 0) + 1)
      }

      if (schedule.tbmVehicleId) {
        vehicleCountMap.set(schedule.tbmVehicleId, (vehicleCountMap.get(schedule.tbmVehicleId) || 0) + 1)
      }
    })

    return { routeGroupCountMap, userCountMap, customerCountMap, vehicleCountMap }
  }, [monthlyTbmDriveList])

  // フィルター用の選択肢を作成（コード順、件数付き）
  const filterOptions = useMemo(() => {
    const { routeGroupCountMap, userCountMap, customerCountMap, vehicleCountMap } = countMaps

    const routeGroupOptions: optionType[] = tbmRouteGroupList
      .filter(route => routeGroupCountMap.has(route.id))
      .sort((a, b) => String(a.code ?? '').localeCompare(String(b.code ?? '')))
      .map(route => ({
        value: route.id,
        label: `${route.code ? `[${route.code}] ` : ''}${route.name}（${routeGroupCountMap.get(route.id) || 0}）`,
      }))

    const userOptions: optionType[] = userList
      .filter(user => userCountMap.has(user.id))
      .sort((a, b) => String(a.code ?? '').localeCompare(String(b.code ?? '')))
      .map(user => ({
        value: user.id,
        label: `${user.code ? `[${user.code}] ` : ''}${user.name}（${userCountMap.get(user.id) || 0}）`,
      }))

    const customerOptions: optionType[] = tbmCustomerList
      .filter(customer => customerCountMap.has(customer.id))
      .sort((a, b) => String(a.code ?? '').localeCompare(String(b.code ?? '')))
      .map(customer => ({
        value: customer.id,
        label: `${customer.code ? `[${customer.code}] ` : ''}${customer.name}（${customerCountMap.get(customer.id) || 0}）`,
      }))

    const vehicleOptions: optionType[] = tbmVehicleList
      .filter(vehicle => vehicleCountMap.has(vehicle.id))
      .sort((a, b) => String(a.vehicleNumber ?? '').localeCompare(String(b.vehicleNumber ?? '')))
      .map(vehicle => ({
        value: vehicle.id,
        label: `${vehicle.vehicleNumber}（${vehicleCountMap.get(vehicle.id) || 0}）`,
      }))

    return { routeGroupOptions, userOptions, customerOptions, vehicleOptions }
  }, [countMaps, tbmRouteGroupList, userList, tbmCustomerList, tbmVehicleList])

  // フィルター用BasicForm
  const { BasicForm, latestFormData, ReactHookForm } = useBasicFormProps({
    columns: new Fields([
      {
        id: 'tbmRouteGroupId',
        label: '便',
        form: { style: { minWidth: 220 } },
        forSelect: { optionsOrOptionFetcher: filterOptions.routeGroupOptions },
      },
      {
        id: 'userId',
        label: 'ドライバー',
        form: { style: { minWidth: 180 } },
        forSelect: { optionsOrOptionFetcher: filterOptions.userOptions },
      },
      {
        id: 'tbmCustomerId',
        label: '取引先',
        form: { style: { minWidth: 180 } },
        forSelect: { optionsOrOptionFetcher: filterOptions.customerOptions },
      },
      {
        id: 'tbmVehicleId',
        label: '車両',
        form: { style: { minWidth: 150 } },
        forSelect: { optionsOrOptionFetcher: filterOptions.vehicleOptions },
      },
    ]).transposeColumns(),
    formData: {
      tbmRouteGroupId: '',
      userId: '',
      tbmCustomerId: '',
      tbmVehicleId: '',
    },
  })

  // フィルタリングされたリスト
  const filteredList = useMemo(() => {
    const filterRouteGroupId = latestFormData.tbmRouteGroupId
    const filterUserId = latestFormData.userId
    const filterCustomerId = latestFormData.tbmCustomerId
    const filterVehicleId = latestFormData.tbmVehicleId

    return monthlyTbmDriveList.filter(row => {
      const { schedule } = row

      if (filterRouteGroupId && schedule.TbmRouteGroup.id !== Number(filterRouteGroupId)) return false
      if (filterUserId && schedule.userId !== Number(filterUserId)) return false
      if (filterCustomerId) {
        const customerId = schedule.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.id
        if (customerId !== Number(filterCustomerId)) return false
      }
      if (filterVehicleId && schedule.tbmVehicleId !== Number(filterVehicleId)) return false

      return true
    })
  }, [monthlyTbmDriveList, latestFormData])

  const resetFilters = () => {
    ReactHookForm.reset({
      tbmRouteGroupId: '',
      userId: '',
      tbmCustomerId: '',
      tbmVehicleId: '',
    })
  }

  return { BasicForm, latestFormData, filteredList, resetFilters }
}
