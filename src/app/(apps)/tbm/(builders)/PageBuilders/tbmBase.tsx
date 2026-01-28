'use client'

import { ColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import { TbmRouteGroupUpsertController } from '@app/(apps)/tbm/(builders)/PageBuilders/TbmRouteGroupUpsertController'
import { DetailPagePropType } from '@cm/types/types'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'


export const tbmBase = {
  form: (props: DetailPagePropType) => {
    const useGlobalProps = useGlobal()
    const { toastIfFailed } = useGlobalProps
    const wrapperClass = `t-paper p-4`

    const ColBuiderProps = {
      useGlobalProps,
      ColBuilderExtraProps: { tbmBaseId: props.formData?.id },
    }
    const childCreatorProps = {
      ParentData: props.formData ?? {},
      useGlobalProps,
      additional: {
        include: { TbmBase: {} },
        orderBy: [{ code: 'asc' }],
      },
    }
    return (
      <R_Stack className={` items-start gap-6`}>
        <section {...{ className: wrapperClass }}>
          <MyForm {...props} />
        </section>
        <section {...{ className: wrapperClass }}>
          <BasicTabs
            {...{
              id: 'tbmBaseDetail',
              showAll: false,
              style: { minWidth: 700 },
              TabComponentArray: [
                //
                {
                  label: '便マスタ',
                  component: (
                    <ChildCreator
                      {...{
                        models: { parent: `tbmBase`, children: 'tbmRouteGroup' },
                        columns: ColBuilder.tbmRouteGroup(ColBuiderProps),
                        myForm: { create: TbmRouteGroupUpsertController },
                        ...childCreatorProps,
                        additional: {
                          ...childCreatorProps.additional,
                          include: {
                            TbmBase: {},
                            Mid_TbmRouteGroup_TbmCustomer: {
                              include: { TbmCustomer: {} },
                            },
                          },
                        },
                      }}
                    />
                  ),
                },

                {
                  label: '月間設定',
                  component: (
                    <ChildCreator
                      {...{
                        ...childCreatorProps,
                        models: { parent: `tbmBase`, children: `tbmBase_MonthConfig` },
                        columns: ColBuilder.tbmBase_MonthConfig(ColBuiderProps),
                        additional: {
                          include: { TbmBase: {} },
                        },
                      }}
                    />
                  ),
                },
                {
                  label: 'ドライバー/ユーザー',
                  component: (
                    <ChildCreator
                      {...{
                        ...childCreatorProps,
                        models: { parent: `tbmBase`, children: `user` },
                        columns: ColBuilder.user(ColBuiderProps),
                        additional: {
                          include: {
                            TbmBase: {},
                            TbmVehicle: {},
                          },
                        },
                      }}
                    />
                  ),
                },
                {
                  label: '車両',
                  component: (
                    <ChildCreator
                      {...{
                        ...childCreatorProps,
                        models: { parent: `tbmBase`, children: `tbmVehicle` },
                        columns: ColBuilder.tbmVehicle(ColBuiderProps),
                      }}
                    />
                  ),
                },
                {
                  label: '取引先',
                  component: (
                    <ChildCreator
                      {...{
                        ...childCreatorProps,
                        models: { parent: `tbmBase`, children: `tbmCustomer` },
                        columns: ColBuilder.tbmCustomer(ColBuiderProps),
                      }}
                    />
                  ),
                },
              ],
            }}
          />
        </section>
      </R_Stack>
    )
  },
}
