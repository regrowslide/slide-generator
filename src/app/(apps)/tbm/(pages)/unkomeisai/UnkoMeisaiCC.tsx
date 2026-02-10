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
import { useCallback, useState, useEffect, useMemo } from 'react'
import { Button } from '@cm/components/styles/common-components/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useUnkoMeisaiFilter } from './hooks/useUnkoMeisaiFilter'
import UnkoMeisaiTableBody from './components/UnkoMeisaiTableBody'

const PAGE_SIZE = 100

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
  const { router } = useGlobal()

  const { BasicForm, latestFormData, filteredList, resetFilters } = useUnkoMeisaiFilter({
    monthlyTbmDriveList,
    tbmRouteGroupList,
    userList,
    tbmCustomerList,
    tbmVehicleList,
  })

  // ページネーション
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE))
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredList.slice(start, start + PAGE_SIZE)
  }, [filteredList, currentPage])

  // フィルター変更時に1ページ目にリセット
  useEffect(() => {
    setCurrentPage(1)
  }, [latestFormData])

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
          <Button size="sm" color="sub" onClick={resetFilters}>
            リセット
          </Button>
        </R_Stack>
        <R_Stack className="justify-between mt-2">
          <div className="text-xs text-gray-500">
            {filteredList.length} / {monthlyTbmDriveList.length} 件中{' '}
            {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredList.length)}-
            {Math.min(currentPage * PAGE_SIZE, filteredList.length)} 件表示
          </div>
          {totalPages > 1 && (
            <R_Stack className="items-center gap-2">
              <Button
                size="sm"
                color="sub"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                size="sm"
                color="sub"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={14} />
              </Button>
            </R_Stack>
          )}
        </R_Stack>
      </C_Stack>

      <UnkoMeisaiTableBody
        filteredList={paginatedList}
        onScheduleEdit={openScheduleEditModal}
        onImageOpen={params => ImageModalReturn.handleOpen(params)}
      />
    </>
  )
}
