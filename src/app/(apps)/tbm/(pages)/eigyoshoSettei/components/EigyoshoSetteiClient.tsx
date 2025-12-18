'use client'
import { ColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import TbmUserDetail from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/TbmUserDetail'
import TbmVehicleDetail from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/TbmVehicleDetail'
import RouteDisplay from '@app/(apps)/tbm/(pages)/eigyoshoSettei/components/RouteDisplay'

import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'

import { C_Stack } from '@cm/components/styles/common-components/common-components'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'

import BasicTabs from '@cm/components/utils/tabs/BasicTabs'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useWindowSize from '@cm/hooks/useWindowSize'

export default function EigyoshoSetteiClient({ days, currentMonth, tbmBase, whereQuery, theMonth }) {
  const useGlobalProps = useGlobal()

  const { pathname, query, toggleLoad, accessScopes } = useGlobalProps
  const { canEdit } = accessScopes().getTbmScopes()
  const { width, PC } = useWindowSize()
  // const minWidth = 1000
  // const maxWidth = width * 0.95
  const ColBuiderProps = {
    useGlobalProps,
    ColBuilderExtraProps: { tbmBaseId: tbmBase?.id },
  }
  const childCreatorProps = {
    ParentData: tbmBase,
    useGlobalProps,
    additional: {
      include: { TbmBase: {} },
      orderBy: [{ code: 'asc' }],
    },
  }

  if (!width) return <PlaceHolder></PlaceHolder>

  return (
    <div className={`pt-2`}>
      <NewDateSwitcher {...{ monthOnly: true }} />
      <BasicTabs
        {...{
          id: 'driveSchedule',
          showAll: false,
          TabComponentArray: [
            {
              label: <div>便設定【月別】</div>,
              component: (
                <C_Stack>
                  <RouteDisplay {...{ tbmBase, whereQuery, toggleLoad, currentMonth }} />
                </C_Stack>
              ),
            },

            {
              label: <div> 車両マスタ</div>,
              component: (
                <ChildCreator
                  {...{
                    ParentData: tbmBase,
                    useGlobalProps,
                    additional: {
                      include: { TbmBase: {}, TbmVehicleMaintenanceRecord: {} },
                      orderBy: [{ vehicleNumber: `asc` }],
                    },
                    EditForm: TbmVehicleDetail,
                    models: { parent: `tbmBase`, children: `tbmVehicle` },
                    columns: ColBuilder.tbmVehicle(ColBuiderProps),
                    myTable: { disabled: !canEdit },
                  }}
                />
              ),
            },

            {
              label: <div> ドライバーマスタ</div>,
              component: (
                <ChildCreator
                  {...{
                    ParentData: tbmBase,
                    useGlobalProps,
                    additional: {
                      include: { TbmBase: {} },
                      orderBy: [{ code: `asc` }],
                      payload: { apps: [`tbm`] },
                    },
                    EditForm: TbmUserDetail,
                    models: { parent: `tbmBase`, children: `user` },
                    columns: ColBuilder.user({ useGlobalProps }),
                    myTable: { disabled: !canEdit },
                  }}
                />
              ),
            },

            // {
            //   label: <div> 荷主マスタ</div>,
            //   component: (
            //     <ChildCreator
            //       {...{
            //         ...childCreatorProps,
            //         models: {parent: `tbmBase`, children: `tbmCustomer`},
            //         columns: ColBuilder.tbmCustomer(ColBuiderProps),
            //       }}
            //     />
            //   ),
            // },
            {
              label: <div> 経費</div>,
              component: (
                <ChildCreator
                  {...{
                    ...childCreatorProps,
                    models: { parent: `tbmBase`, children: `tbmKeihi` },
                    columns: ColBuilder.tbmKeihi(ColBuiderProps),
                    additional: {
                      include: { TbmBase: {} },
                      orderBy: [{ date: 'desc' }],
                    },
                    myTable: { disabled: !canEdit },
                  }}
                />
              ),
            },
            {
              label: <div>ガソリン・軽油【月別】</div>,
              component: (
                <ChildCreator
                  {...{
                    ...childCreatorProps,
                    models: { parent: `tbmBase`, children: `tbmBase_MonthConfig` },
                    columns: ColBuilder.tbmBase_MonthConfig(ColBuiderProps),
                    myTable: { disabled: !canEdit },
                  }}
                />
              ),
            },

            // {
            //   label: <div> 商品マスタ</div>,
            //   component: (
            //     <ChildCreator
            //       {...{
            //         ...childCreatorProps,
            //         models: {parent: `tbmBase`, children: `tbmProduct`},
            //         columns: ColBuilder.tbmProduct(ColBuiderProps),
            //       }}
            //     />
            //   ),
            // },
          ],
        }}
      />
    </div>
  )
}
