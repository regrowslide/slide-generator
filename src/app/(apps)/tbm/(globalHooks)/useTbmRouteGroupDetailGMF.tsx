'use client'

import TbmRouteGroupDetail from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/TbmRouteGroupDetail'
import { useGlobalModalForm } from '@cm/components/utils/modal/useGlobalModalForm'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { atomKey } from '@cm/hooks/useJotai'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import { DetailPagePropType } from '@cm/types/types'
import { TbmRouteGroupUpsertController } from '@app/(apps)/tbm/(builders)/PageBuilders/TbmRouteGroupUpsertController'
import { ColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import { useRouter } from 'next/navigation'
import React from 'react'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'

export default function useTbmRouteGroupDetailGMF() {
 const atomKeyValue = `useTbmRouteGroupDetailGMF` as atomKey

 return useGlobalModalForm<{ tbmRouteGroupId: number; onClose?: () => void }>(atomKeyValue, null, {
  mainJsx: ({ GMF_OPEN, setGMF_OPEN, close }) => {
   const useGlobalProps = useGlobal()
   const router = useRouter()
   const { tbmRouteGroupId, onClose } = GMF_OPEN ?? {}

   // 便グループデータを取得
   const { data: routeGroupData, isLoading } = useDoStandardPrisma('tbmRouteGroup', 'findFirst', {
    where: { id: tbmRouteGroupId },
    include: {
     TbmBase: {},
     TbmRouteGroupShare: {
      include: { TbmBase: true },
     },
     Mid_TbmRouteGroup_TbmCustomer: {
      include: { TbmCustomer: true },
     },
    },
   })

   // 編集完了時のコールバック
   const handleClose = () => {
    close()
    if (onClose) {
     onClose()
    }
    // 自動リフレッシュ
    router.refresh()
   }

   if (isLoading || !routeGroupData) {
    return <PlaceHolder />
   }

   // DetailPagePropTypeに必要なpropsを構築
   const detailPageProps: DetailPagePropType = {
    useGlobalProps,
    formData: routeGroupData,
    setformData: () => { },
    records: [routeGroupData],
    setrecords: () => { },
    mutateRecords: () => { },
    deleteRecord: () => { },
    dataModelName: 'tbmRouteGroup',
    columns: ColBuilder.tbmRouteGroup({ useGlobalProps }),
    myForm: {
     create: {
      ...TbmRouteGroupUpsertController,

     },

    },

    additional: {
     include: {
      TbmBase: {},
      TbmRouteGroupShare: {
       include: { TbmBase: true },
      },
      Mid_TbmRouteGroup_TbmCustomer: {
       include: { TbmCustomer: true },
      },
     },
    },
   }

   return (
    <TbmRouteGroupDetail {...detailPageProps} onUpdate={handleClose} />
   )
  },
 })
}

