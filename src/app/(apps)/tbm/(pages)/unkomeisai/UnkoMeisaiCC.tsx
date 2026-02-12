'use client'

import { MonthlyTbmDriveData } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchUnkoMeisaiData'
import UnkomeisaiDetailModal from '@app/(apps)/tbm/(pages)/unkomeisai/[id]/UnkomeisaiDetailModal'
import DriveScheduleImageModal from '@app/(apps)/tbm/(pages)/unkomeisai/DriveScheduleImageModal'
import useHaishaTableEditorGMF from '@app/(apps)/tbm/(globalHooks)/useHaishaTableEditorGMF'

import { TbmDriveScheduleImage } from '@prisma/generated/prisma/client'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { TbmBase, TbmCustomer, TbmRouteGroup, TbmVehicle, User } from '@prisma/generated/prisma/client'
import { useCallback, useMemo } from 'react'
import { Button } from '@cm/components/styles/common-components/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import UnkoMeisaiTableBody from './components/UnkoMeisaiTableBody'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { Fields } from '@cm/class/Fields/Fields'

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
  itemsPerPage?: number // undefinedの場合は全件表示
  currentFilters: {
    tbmRouteGroupId?: number
    userId?: number
    tbmCustomerId?: number
    tbmVehicleId?: number
  }
}

export default function UnkoMeisaiCC({
  monthlyTbmDriveList,
  tbmRouteGroupList,
  userList,
  tbmCustomerList,
  tbmVehicleList,
  tbmBase,
  whereQuery,
  itemsPerPage, // デフォルト100件、undefinedの場合は全件表示
  currentFilters,
}: Props) {


  const { router, addQuery, query } = useGlobal()

  // フィルター用の選択肢を作成（件数表示なし）
  const filterOptions = useMemo(() => {
    const routeGroupOptions = tbmRouteGroupList
      .sort((a, b) => String(a.code ?? '').localeCompare(String(b.code ?? '')))
      .map(route => ({
        value: route.id,
        label: `${route.code ? `[${route.code}] ` : ''}${route.name}`,
      }))

    const userOptions = userList
      .sort((a, b) => String(a.code ?? '').localeCompare(String(b.code ?? '')))
      .map(user => ({
        value: user.id,
        label: `${user.code ? `[${user.code}] ` : ''}${user.name}`,
      }))

    const customerOptions = tbmCustomerList
      .sort((a, b) => String(a.code ?? '').localeCompare(String(b.code ?? '')))
      .map(customer => ({
        value: customer.id,
        label: `${customer.code ? `[${customer.code}] ` : ''}${customer.name}`,
      }))

    const vehicleOptions = tbmVehicleList
      .sort((a, b) => String(a.vehicleNumber ?? '').localeCompare(String(b.vehicleNumber ?? '')))
      .map(vehicle => ({
        value: vehicle.id,
        label: vehicle.vehicleNumber,
      }))

    return { routeGroupOptions, userOptions, customerOptions, vehicleOptions }
  }, [tbmRouteGroupList, userList, tbmCustomerList, tbmVehicleList])

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
      tbmRouteGroupId: currentFilters.tbmRouteGroupId,
      userId: currentFilters.userId,
      tbmCustomerId: currentFilters.tbmCustomerId,
      tbmVehicleId: currentFilters.tbmVehicleId,
    },
  })

  // フィルターリセット
  const resetFilters = useCallback(() => {
    ReactHookForm.reset({
      tbmRouteGroupId: undefined,
      userId: undefined,
      tbmCustomerId: undefined,
      tbmVehicleId: undefined,

    })
    addQuery({
      tbmRouteGroupId: undefined,
      userId: undefined,
      tbmCustomerId: undefined,
      tbmVehicleId: undefined,
      page: '1',
    })
  }, [addQuery])

  // フィルター適用（サーバー側にリダイレクト）
  const applyFilters = useCallback(() => {
    addQuery({
      tbmRouteGroupId: latestFormData.tbmRouteGroupId || undefined,
      userId: latestFormData.userId || undefined,
      tbmCustomerId: latestFormData.tbmCustomerId || undefined,
      tbmVehicleId: latestFormData.tbmVehicleId || undefined,
      page: '1', // フィルター変更時はページをリセット
    })
  }, [addQuery, latestFormData])

  // ページネーション（queryで管理）
  const currentPage = query.page ? parseInt(query.page as string) : 1
  const localItemsPerPage = query.itemsPerPage ? parseInt(query.itemsPerPage as string) : itemsPerPage

  const isPaginationEnabled = localItemsPerPage !== undefined && localItemsPerPage !== null
  const totalPages = isPaginationEnabled && localItemsPerPage
    ? Math.max(1, Math.ceil(monthlyTbmDriveList.length / localItemsPerPage))
    : 1

  const paginatedList = useMemo(() => {
    if (!isPaginationEnabled || !localItemsPerPage) return monthlyTbmDriveList
    const start = (currentPage - 1) * localItemsPerPage
    return monthlyTbmDriveList.slice(start, start + localItemsPerPage)
  }, [monthlyTbmDriveList, currentPage, localItemsPerPage, isPaginationEnabled])

  // ページ変更ハンドラー
  const handlePageChange = useCallback((newPage: number) => {
    addQuery({ page: String(newPage) })
  }, [addQuery])

  // ページあたり表示件数変更ハンドラー
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number | undefined) => {
    // itemsPerPageとpageを同時に更新
    addQuery({
      itemsPerPage: newItemsPerPage === undefined ? undefined : String(newItemsPerPage),
      page: '1' // ページサイズ変更時は1ページ目に戻る
    })
  }, [addQuery])

  const UnkoMeisaiModalReturn = useModal<{ id: number }>()
  const ImageModalReturn = useModal<{
    images: TbmDriveScheduleImage[]
    date: Date | null
    routeGroupName: string | null
  }>()

  // 便変更用のGlobalModalForm（配車管理と同じUI）
  const HK_HaishaTableEditorGMF = useHaishaTableEditorGMF({
    preserveApprovalStatus: true,
    afterUpdate: async ({ res }) => {
      if (res.success) router.refresh()
    },
    afterDelete: async ({ res }) => {
      if (res.success) router.refresh()
    },
  })

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

  return (
    <>
      <UnkoMeisaiModalReturn.Modal>
        <UnkomeisaiDetailModal {...{ id: UnkoMeisaiModalReturn.open?.id }} />
      </UnkoMeisaiModalReturn.Modal>

      <HK_HaishaTableEditorGMF.Modal />

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
          <Button size="sm" color="blue" onClick={applyFilters}>
            絞り込み
          </Button>
          <Button size="sm" color="sub" onClick={resetFilters}>
            リセット
          </Button>
        </R_Stack>
        <R_Stack className="justify-between mt-2">
          <div className="text-xs text-gray-500">
            {isPaginationEnabled && localItemsPerPage ? (
              <>
                {monthlyTbmDriveList.length} 件中{' '}
                {Math.min((currentPage - 1) * localItemsPerPage + 1, monthlyTbmDriveList.length)}-
                {Math.min(currentPage * localItemsPerPage, monthlyTbmDriveList.length)} 件表示
              </>
            ) : (
              <>全 {monthlyTbmDriveList.length} 件表示</>
            )}
          </div>
          <R_Stack className="items-center gap-2">
            {/* ページあたり表示件数選択 */}
            <select
              className="text-xs rounded-sm border px-2 py-1"
              value={localItemsPerPage ?? 'all'}
              onChange={e => {
                const value = e.target.value === 'all' ? undefined : Number(e.target.value)
                handleItemsPerPageChange(value)
              }}
            >
              <option value="all">全件表示</option>
              <option value={50}>50件</option>
              <option value={100}>100件</option>
              <option value={200}>200件</option>
              <option value={500}>500件</option>
            </select>

            {/* ページネーションコントロール */}
            {isPaginationEnabled && totalPages > 1 && (
              <>
                <Button
                  size="sm"
                  color="sub"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={14} />
                </Button>

                {/* ページ選択セレクトボックス */}
                <select
                  className="text-xs rounded-sm border px-2 py-1"
                  value={currentPage}
                  onChange={e => handlePageChange(Number(e.target.value))}
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <option key={page} value={page}>
                      {page} / {totalPages}
                    </option>
                  ))}
                </select>

                <Button
                  size="sm"
                  color="sub"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={14} />
                </Button>
              </>
            )}
          </R_Stack>
        </R_Stack>
      </C_Stack>

      <UnkoMeisaiTableBody
        filteredList={paginatedList}
        allFilteredList={monthlyTbmDriveList}
        startIndex={(currentPage - 1) * (localItemsPerPage || 0)}
        onScheduleEdit={openScheduleEditModal}
        onImageOpen={params => ImageModalReturn.handleOpen(params)}
      />
    </>
  )
}
