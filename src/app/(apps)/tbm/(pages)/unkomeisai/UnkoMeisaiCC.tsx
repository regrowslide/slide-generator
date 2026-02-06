'use client'

import { MonthlyTbmDriveData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import UnkomeisaiDetailModal from '@app/(apps)/tbm/(pages)/unkomeisai/[id]/UnkomeisaiDetailModal'
import DriveScheduleImageModal from '@app/(apps)/tbm/(pages)/unkomeisai/DriveScheduleImageModal'
import useHaishaTableEditorGMF from '@app/(apps)/tbm/(globalHooks)/useHaishaTableEditorGMF'

import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { ImageIcon } from 'lucide-react'
import { TbmDriveScheduleImage } from '@prisma/generated/prisma/client'
import { CsvTable } from '@cm/components/styles/common-components/CsvTable/CsvTable'
import { createCsvTableTotalRow } from '@cm/components/styles/common-components/CsvTable/createCsvTableTotalRow'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { TbmBase, TbmCustomer, TbmRouteGroup, TbmVehicle, User } from '@prisma/generated/prisma/client'
import { useMemo, useCallback } from 'react'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { Fields } from '@cm/class/Fields/Fields'
import { Button } from '@cm/components/styles/common-components/Button'
import { optionType } from '@cm/class/Fields/col-operator-types'

type TbmRouteGroupWithCustomer = TbmRouteGroup & {
  Mid_TbmRouteGroup_TbmCustomer?: {
    TbmCustomer: TbmCustomer
  } | null
}

type Props = {
  monthlyTbmDriveList: MonthlyTbmDriveData[]
  tbmRouteGroupList: TbmRouteGroupWithCustomer[]
  userList: User[]
  tbmCustomerList: TbmCustomer[]
  tbmVehicleList: TbmVehicle[]
  tbmBase: TbmBase | null
  whereQuery: { gte?: Date; lte?: Date }
}

export default function UnkoMeisaiCC({
  monthlyTbmDriveList,
  tbmRouteGroupList,
  userList,
  tbmCustomerList,
  tbmVehicleList,
  tbmBase,
  whereQuery,
}: Props) {
  const { toastIfFailed, router, query } = useGlobal()

  // 件数カウント用のマップを作成
  const countMaps = useMemo(() => {
    const routeGroupCountMap = new Map<number, number>()
    const userCountMap = new Map<number, number>()
    const customerCountMap = new Map<number, number>()
    const vehicleCountMap = new Map<number, number>()

    monthlyTbmDriveList.forEach(row => {
      const { schedule } = row

      // 便カウント
      const routeGroupId = schedule.TbmRouteGroup.id
      routeGroupCountMap.set(routeGroupId, (routeGroupCountMap.get(routeGroupId) || 0) + 1)

      // ドライバーカウント
      if (schedule.userId) {
        userCountMap.set(schedule.userId, (userCountMap.get(schedule.userId) || 0) + 1)
      }

      // 取引先カウント
      const customerId = schedule.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.id
      if (customerId) {
        customerCountMap.set(customerId, (customerCountMap.get(customerId) || 0) + 1)
      }

      // 車両カウント
      if (schedule.tbmVehicleId) {
        vehicleCountMap.set(schedule.tbmVehicleId, (vehicleCountMap.get(schedule.tbmVehicleId) || 0) + 1)
      }
    })

    return { routeGroupCountMap, userCountMap, customerCountMap, vehicleCountMap }
  }, [monthlyTbmDriveList])

  // フィルター用の選択肢を作成（コード順、件数付き）
  const filterOptions = useMemo(() => {
    const { routeGroupCountMap, userCountMap, customerCountMap, vehicleCountMap } = countMaps

    // 便選択肢（コード順）
    const routeGroupOptions: optionType[] = tbmRouteGroupList
      .filter(route => routeGroupCountMap.has(route.id))
      .sort((a, b) => String(a.code ?? '').localeCompare(String(b.code ?? '')))
      .map(route => {
        const count = routeGroupCountMap.get(route.id) || 0
        return {
          value: route.id,
          label: `${route.code ? `[${route.code}] ` : ''}${route.name}（${count}）`,
        }
      })

    // ドライバー選択肢（コード順）
    const userOptions: optionType[] = userList
      .filter(user => userCountMap.has(user.id))
      .sort((a, b) => String(a.code ?? '').localeCompare(String(b.code ?? '')))
      .map(user => {
        const count = userCountMap.get(user.id) || 0
        return {
          value: user.id,
          label: `${user.code ? `[${user.code}] ` : ''}${user.name}（${count}）`,
        }
      })



    // 取引先選択肢（コード順）
    const customerOptions: optionType[] = tbmCustomerList
      .filter(customer => customerCountMap.has(customer.id))
      .sort((a, b) => String(a.code ?? '').localeCompare(String(b.code ?? '')))
      .map(customer => {
        const count = customerCountMap.get(customer.id) || 0
        return {
          value: customer.id,
          label: `${customer.code ? `[${customer.code}] ` : ''}${customer.name}（${count}）`,
        }
      })

    // 車両選択肢（車両番号順）
    const vehicleOptions: optionType[] = tbmVehicleList
      .filter(vehicle => vehicleCountMap.has(vehicle.id))
      .sort((a, b) => String(a.vehicleNumber ?? '').localeCompare(String(b.vehicleNumber ?? '')))
      .map(vehicle => {
        const count = vehicleCountMap.get(vehicle.id) || 0
        return {
          value: vehicle.id,
          label: `${vehicle.vehicleNumber}（${count}）`,
        }
      })

    return { routeGroupOptions, userOptions, customerOptions, vehicleOptions }
  }, [countMaps, tbmRouteGroupList, userList, tbmCustomerList, tbmVehicleList])

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
        id: 'tbmCustomerId',
        label: '取引先',
        form: { style: { minWidth: 180 } },
        forSelect: {
          optionsOrOptionFetcher: filterOptions.customerOptions,
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
      tbmCustomerId: '',
      tbmVehicleId: '',
    },
  })

  const UnkoMeisaiModalReturn = useModal<{ id: number }>()
  const ImageModalReturn = useModal<{
    images: TbmDriveScheduleImage[]
    date: Date | null
    routeGroupName: string | null
  }>()

  // 便変更用のGlobalModalForm（配車管理と同じUI）
  // 運行明細では承認状態を維持する
  const HK_HaishaTableEditorGMF = useHaishaTableEditorGMF({
    preserveApprovalStatus: true, // 承認状態を維持
    afterUpdate: async ({ res }) => {
      if (res.success) {
        // データを再取得
        router.refresh()
      }
    },
    afterDelete: async ({ res }) => {
      if (res.success) {
        router.refresh()
      }
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

      // 便フィルター
      if (filterRouteGroupId && schedule.TbmRouteGroup.id !== Number(filterRouteGroupId)) {
        return false
      }

      // ドライバーフィルター
      if (filterUserId && schedule.userId !== Number(filterUserId)) {
        return false
      }

      // 取引先フィルター
      if (filterCustomerId) {
        const customerId = schedule.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.id
        if (customerId !== Number(filterCustomerId)) {
          return false
        }
      }

      // 車両フィルター
      if (filterVehicleId && schedule.tbmVehicleId !== Number(filterVehicleId)) {
        return false
      }

      return true
    })
  }, [monthlyTbmDriveList, latestFormData])

  // 便変更モーダルを開く
  const openScheduleEditModal = useCallback(
    (schedule: MonthlyTbmDriveData['schedule']) => {
      HK_HaishaTableEditorGMF.setGMF_OPEN({
        user: schedule.User ?? null,
        date: schedule.date,
        tbmDriveSchedule: schedule,
        tbmBase: tbmBase,
        tbmRouteGroup: schedule.TbmRouteGroup,
      })
    },
    [HK_HaishaTableEditorGMF, tbmBase]
  )

  // フィルターをリセット
  const resetFilters = () => {
    ReactHookForm.reset({
      tbmRouteGroupId: '',
      userId: '',
      tbmCustomerId: '',
      tbmVehicleId: '',
    })
  }

  return (
    <>
      <UnkoMeisaiModalReturn.Modal>
        <UnkomeisaiDetailModal {...{ id: UnkoMeisaiModalReturn.open?.id }} />
      </UnkoMeisaiModalReturn.Modal>

      {/* 便変更モーダル */}
      <HK_HaishaTableEditorGMF.Modal />

      {/* 画像一覧モーダル */}
      <ImageModalReturn.Modal>
        {ImageModalReturn.open && (
          <DriveScheduleImageModal
            images={ImageModalReturn.open.images}
            date={ImageModalReturn.open.date}
            routeGroupName={ImageModalReturn.open.routeGroupName}
          />
        )}
      </ImageModalReturn.Modal>

      {/* フィルターセクション */}
      <C_Stack className="mb-4 p-4 bg-gray-50 rounded-lg">
        <R_Stack className="items-end gap-4">
          <BasicForm latestFormData={latestFormData} alignMode="row" />
          <Button size="sm" color="sub" onClick={resetFilters}>
            リセット
          </Button>
        </R_Stack>
        <div className="text-xs text-gray-500 mt-2">
          {filteredList.length} / {monthlyTbmDriveList.length} 件表示
        </div>
      </C_Stack>

      <div className={` relative`}>
        {filteredList.length === 0 && <PlaceHolder>表示するデータがありません</PlaceHolder>}
        {(() => {
          const records = filteredList.map((row, rowIdx) => {
            const { keyValue, schedule } = row

            const cols = Object.entries(keyValue).filter(([dataKey, item]) => !String(item.label).includes(`CD`))

            const routeGroupColIndex = cols.findIndex(([dataKey, item]) => String(item.label ?? '').includes(`便名`))

            const convertedCols: any[][] = [...cols]
            convertedCols[routeGroupColIndex] = [
              String(routeGroupColIndex),
              {
                label: `便名`,
                cellValue: schedule.TbmRouteGroup.name,
                // 便名をクリックすると編集モーダルを開く
                onClick: () => openScheduleEditModal(schedule),
                style: {
                  minWidth: 160,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  color: '#2563eb',
                },
              },
            ]

            // 画像データを取得
            const images = (schedule as any).TbmDriveScheduleImage || []
            const imageCount = images.length

            return {
              csvTableRow: [
                // 画像列
                {
                  label: <div className="text-xs">画像</div>,
                  cellValue: (
                    <button
                      className={`flex items-center gap-1 text-xs ${imageCount > 0
                        ? 'text-blue-600 hover:text-blue-800 cursor-pointer'
                        : 'text-gray-400 cursor-not-allowed'
                        }`}
                      onClick={() => {
                        if (imageCount > 0) {
                          ImageModalReturn.handleOpen({
                            images,
                            date: schedule.date,
                            routeGroupName: schedule.TbmRouteGroup?.name || null,
                          })
                        }
                      }}
                      disabled={imageCount === 0}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>{imageCount}</span>
                    </button>
                  ),
                  style: { minWidth: 50, textAlign: 'center' },
                },
                ...convertedCols.map((props: any, colIdx) => {
                  const [dataKey, item] = props

                  let value
                  if (item.type === `date`) {
                    value = formatDate(item.cellValue, 'short')
                  } else {
                    value = item.cellValue
                  }

                  const baseWidth = 80
                  const width = item?.style?.minWidth ?? baseWidth

                  const style = {
                    fontSize: 13,
                    color: typeof value === 'number' && value < 0 ? 'red' : undefined,
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
              ],
            }
          })
          return CsvTable({
            records: [...records, createCsvTableTotalRow(records)],
          }).WithWrapper({
            className: `w-[calc(95vw)] `,
          })
        })()}
      </div>
    </>
  )
}
