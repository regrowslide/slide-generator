import { ColBuilder } from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import { NumHandler } from '@cm/class/NumHandler'
import { Button } from '@cm/components/styles/common-components/Button'
import { C_Stack } from '@cm/components/styles/common-components/common-components'
import { Paper } from '@cm/components/styles/common-components/paper'
import { KeyValue } from '@cm/components/styles/common-components/ParameterCard'
import { useGlobalModalForm } from '@cm/components/utils/modal/useGlobalModalForm'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { createUpdate } from '@cm/lib/methods/createUpdate'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { toastByResult } from '@cm/lib/ui/notifications'
import React from 'react'

export default function useOdometerInputGMF() {
  return useGlobalModalForm<{ OdometerInput: { date: Date; TbmVehicle: any; odometerStart: number; odometerEnd: number } }>(`odometerInputGMF`, null, {
    mainJsx: ({ GMF_OPEN, setGMF_OPEN }) => {
      const useGlobalProps = useGlobal()
      const { OdometerInput } = GMF_OPEN ?? {}
      const { date, TbmVehicle, odometerStart, odometerEnd } = OdometerInput || {}

      const lastOdometer = TbmVehicle.OdometerInput.filter(d => d.date < date).sort(
        (a, b) => -(a.date.getTime() - b.date.getTime())
      )?.[0]
      const { odometerStart: lastOdometerStart, odometerEnd: lastOdometerEnd } = lastOdometer ?? {}

      const { BasicForm, latestFormData } = useBasicFormProps({
        formData: {
          date,
          tbmVehicleId: TbmVehicle?.id,
          odometerStart,
          odometerEnd,
        },
        columns: ColBuilder.odometerInput({
          useGlobalProps,
          ColBuilderExtraProps: {
            lastOdometerStart,
            lastOdometerEnd,
            tbmVehicleId: TbmVehicle?.id,
            date,
          },
        }),
      })

      return (
        <C_Stack className={`gap-6`}>
          <Paper>
            <div>この車両の最後の記録</div>
            <div>
              <KeyValue label={`開始`}>{lastOdometerStart && NumHandler.toPrice(lastOdometerStart) + ' km'}</KeyValue>
              <KeyValue label={`終了`}>{lastOdometerEnd && NumHandler.toPrice(lastOdometerEnd) + ' km'}</KeyValue>
            </div>
          </Paper>
          <Paper>
            <BasicForm
              {...{
                latestFormData,
                onSubmit: async data => {
                  const { date, tbmVehicleId, odometerStart, odometerEnd, userId } = data

                  useGlobalProps.toggleLoad(async () => {
                    const res = await doStandardPrisma(`odometerInput`, `upsert`, {
                      where: { unique_tbmVehicleId_date: { tbmVehicleId: TbmVehicle?.id, date: date } },
                      ...createUpdate({
                        userId,
                        odometerStart,
                        odometerEnd,
                        tbmVehicleId,
                        date,
                      }),
                    })
                    toastByResult(res)
                    setGMF_OPEN(null)
                  })
                },
              }}
            >
              <Button>登録</Button>
            </BasicForm>
          </Paper>
        </C_Stack>
      )
    },
  })
}
