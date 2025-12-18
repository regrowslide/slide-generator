'use client'
import React, { useMemo, useCallback } from 'react'
import { C_Stack } from '@cm/components/styles/common-components/common-components'
import useHaishaTableEditorGMF from '@app/(apps)/tbm/(globalHooks)/useHaishaTableEditorGMF'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import HaishaTableSwitcher from './HaishaTableSwitcher'
import TableContent from './HaishaTableContent'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import { useHaishaData } from '../hooks/useHaishaData'
import { usePagination } from '../hooks/usePagination'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import { HaishaTableProps, HaishaTableMode, ModalOpenParams } from '../types/haisha-page-types'
import { BulkAssignmentModal } from './BulkAssignment/BulkAssignmentModal'
import useModal from '@cm/components/utils/modal/useModal'

export type haishaTableMode = HaishaTableMode

export default function HaishaTable({ days, tbmBase, whereQuery }: HaishaTableProps) {
  const useGlobalProps = useGlobal()
  const { query, session, accessScopes } = useGlobalProps
  const { admin } = session.scopes
  const { canEdit } = accessScopes().getTbmScopes()
  const tbmBaseId = tbmBase?.id ?? 0
  const mode: haishaTableMode = query.mode

  // ページネーション管理
  const { currentPage, itemsPerPage, handlePageChange, handleItemsPerPageChange } = usePagination()

  // データ取得管理
  const { listDataState, maxRecord, LocalLoader, fetchData } = useHaishaData({
    tbmBaseId,
    whereQuery,
    mode,
    currentPage,
    itemsPerPage,
  })

  const HK_HaishaTableEditorGMF = useHaishaTableEditorGMF({
    afterDelete: ({ res, tbmDriveSchedule }) => {
      fetchData()
    },
    afterUpdate: ({ res }) => {
      fetchData()
    },
  })



  const BulkAssignmentModalReturn = useModal()

  // モーダルオープン処理
  const setModalOpen = useCallback(
    (props: ModalOpenParams) => {
      // 一括割り当てモードの場合
      if (props.isBulkAssignment && props.tbmRouteGroup && props.tbmBase) {
        // 月の初日を取得
        const firstDayOfMonth = whereQuery?.gte ?? new Date()

        BulkAssignmentModalReturn.setopen({
          tbmRouteGroup: props.tbmRouteGroup,
          tbmBase: props.tbmBase,
          month: firstDayOfMonth,
        })
      } else {
        // 通常のモーダル
        ; (HK_HaishaTableEditorGMF.setGMF_OPEN as (props: any) => void)(props)
      }
    },
    [HK_HaishaTableEditorGMF.setGMF_OPEN, BulkAssignmentModalReturn.setopen, whereQuery]
  )

  const { data: holidays = [] } = useDoStandardPrisma(`calendar`, `findMany`, {
    where: { holidayType: `祝日` },
  })


  const { TbmDriveSchedule, userList, tbmRouteGroup, userWorkStatusCount } = listDataState ?? {}


  const ModalMemo = useMemo(() => <HK_HaishaTableEditorGMF.Modal />, [HK_HaishaTableEditorGMF.GMF_OPEN])

  if (!listDataState) return <PlaceHolder />

  return (
    <C_Stack className="p-3">
      <NewDateSwitcher {...{ monthOnly: true }} />
      <LocalLoader />
      {ModalMemo}
      <HaishaTableSwitcher />
      <TableContent
        {...({
          mode,
          tbmBase,
          days,
          holidays,
          fetchData,
          setModalOpen,
          admin,
          query,
          TbmDriveSchedule,
          tbmRouteGroup,
          userList,
          userWorkStatusCount,
          canEdit,
        } as any)}
      />
      <div className={` flex justify-around text-gray-500`}>{maxRecord}件のデータを表示</div>

      {/* 一括割り当てモーダル */}
      <BulkAssignmentModalReturn.Modal>
        <BulkAssignmentModal
          tbmRouteGroup={BulkAssignmentModalReturn?.open?.tbmRouteGroup}
          tbmBase={BulkAssignmentModalReturn?.open?.tbmBase}
          month={BulkAssignmentModalReturn?.open?.month}
          onClose={BulkAssignmentModalReturn.handleClose}
          onComplete={fetchData}
        />
      </BulkAssignmentModalReturn.Modal>
    </C_Stack>
  )
}
