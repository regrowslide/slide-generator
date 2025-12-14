import React, { useState, useEffect } from 'react'
import { Button } from '@cm/components/styles/common-components/Button'
import { Fields } from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { toastByResult } from '@cm/lib/ui/notifications'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { NumHandler } from '@cm/class/NumHandler'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { TbmReportCl } from '@app/(apps)/tbm/(class)/TbmReportCl'
import { TimeHandler } from '@app/(apps)/tbm/(class)/TimeHandler'
import { addDays } from '@cm/class/Days/date-utils/calculations'

interface EtcScheduleLinkModalProps {
  etcMeisaiId: number
  scheduleId: number | null
  scheduleDate: Date
  onClose: () => void
  onUpdate: () => void
}

export const EtcScheduleLinkModal: React.FC<EtcScheduleLinkModalProps> = ({
  etcMeisaiId,
  scheduleId,
  scheduleDate,
  onClose,
  onUpdate,
}) => {
  const [etcMeisai, setEtcMeisai] = useState<any>(null)
  const [availableSchedules, setAvailableSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { BasicForm, latestFormData } = useBasicFormProps({
    columns: new Fields([
      {
        id: 'tbmDriveScheduleId',
        label: '運行明細',
        forSelect: {
          optionsOrOptionFetcher: availableSchedules.map(schedule => {
            const { routeName, name, departureTime } = schedule.TbmRouteGroup
            const { User } = schedule

            // 出発時刻が2400以上の場合は翌日扱いなので、表示用の日付を計算
            const parsed = TimeHandler.parseTimeString(departureTime)
            const isNextDaySchedule = parsed && parsed.originalHour >= 24
            const displayDate = isNextDaySchedule
              ? addDays(schedule.date, 1)
              : schedule.date

            const nextDayMark = isNextDaySchedule ? '【翌日扱い】' : ''
            const displayName = [
              formatDate(displayDate, 'YYYY/MM/DD(ddd)'),
              nextDayMark,
              routeName,
              name,
              User?.name,
            ].filter(Boolean).join(' ')

            return {
              name: displayName,
              label: displayName,
              value: schedule.id,
            }
          }),
        },
      },
      {
        id: 'feeType',
        label: '料金種別',
        forSelect: {
          optionsOrOptionFetcher: [
            { name: '郵便', label: '郵便', value: 'postal' },
            { name: '一般', label: '一般', value: 'general' },
          ],
        },
        form: {
          defaultValue: 'postal',
        },
      },
    ]).transposeColumns(),
    formData: {
      tbmDriveScheduleId: scheduleId,
      feeType: 'postal',
    },
  })

  // ETCデータと利用可能な運行明細を取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ETCデータを取得（グループ内のEtcCsvRawも取得して日付範囲を確認）
        const etcResponse = await doStandardPrisma('tbmEtcMeisai', 'findUnique', {
          where: { id: etcMeisaiId },
          include: {
            TbmVehicle: true,
            TbmDriveSchedule: {
              include: {
                TbmRouteGroup: true,
                User: true,
              },
            },
            EtcCsvRaw: {
              orderBy: { fromDate: 'asc' },
            },
          },
        })

        if (etcResponse.result) {
          setEtcMeisai(etcResponse.result)

          // グループ内のETC利用データから日付範囲を取得
          const etcCsvRawList = etcResponse.result.EtcCsvRaw || []
          let minDate: Date | null = null
          let maxDate: Date | null = null

          etcCsvRawList.forEach((raw: any) => {
            const fromDate = new Date(raw.fromDate)
            if (!minDate || fromDate < minDate) minDate = fromDate
            if (!maxDate || fromDate > maxDate) maxDate = fromDate
          })

          // フォールバック: EtcCsvRawがない場合は渡されたscheduleDateを使用
          if (!minDate) minDate = new Date(scheduleDate)
          if (!maxDate) maxDate = new Date(scheduleDate)

          // 翌日扱いの便も検索対象に含めるため、前日も検索対象にする
          const searchStartDate = addDays(minDate, -1)
          const searchEndDate = maxDate

          // 検索範囲の運行明細を取得
          const schedulesResponse = await doStandardPrisma('tbmDriveSchedule', 'findMany', {
            where: {
              tbmVehicleId: etcResponse.result.tbmVehicleId,
              date: {
                gte: searchStartDate,
                lte: searchEndDate,
              },
              approved: TbmReportCl.allowNonApprovedSchedule ? undefined : true,
            },
            include: {
              TbmRouteGroup: true,
              User: true,
            },
            orderBy: [{ date: 'asc' }, { TbmRouteGroup: { departureTime: 'asc' } }],
          })

          if (schedulesResponse.result) {
            // グループ内の日付範囲にマッチするスケジュールをフィルタリング
            // 月跨ぎの場合: 前月最終日と翌月初日の運行明細を対象とする
            const filteredSchedules = schedulesResponse.result.filter((schedule: any) => {
              const scheduleDateTime = new Date(schedule.date)
              const parsed = TimeHandler.parseTimeString(schedule.TbmRouteGroup?.departureTime)
              const isNextDaySchedule = parsed && parsed.originalHour >= 24

              // 表示用の日付を計算
              const displayDate = isNextDaySchedule
                ? addDays(scheduleDateTime, 1)
                : scheduleDateTime

              // グループ内の日付範囲（minDate〜maxDate）にマッチするものを返す
              return displayDate >= minDate! && displayDate <= maxDate!
            })

            setAvailableSchedules(filteredSchedules)
          }
        }
      } catch (error) {
        console.error('データ取得エラー:', error)
      }
    }

    fetchData()
  }, [etcMeisaiId, scheduleDate])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const { feeType } = data
      const tbmDriveScheduleId = Number(data.tbmDriveScheduleId)

      if (tbmDriveScheduleId) {
        // 運行明細にETC料金を反映
        const feeField = feeType === 'postal' ? 'M_postalHighwayFee' : 'O_generalHighwayFee'

        await doStandardPrisma('tbmDriveSchedule', 'update', {
          where: { id: tbmDriveScheduleId },
          data: { [feeField]: etcMeisai?.sum || 0 },
        })

        // ETCデータに運行明細IDを紐付け
        const result = await doStandardPrisma('tbmEtcMeisai', 'update', {
          where: { id: etcMeisaiId },
          data: {
            tbmDriveScheduleId: tbmDriveScheduleId,
          },
        })

        toastByResult(result)
      } else {
        // 紐付け解除の場合
        const result = await doStandardPrisma('tbmEtcMeisai', 'update', {
          where: { id: etcMeisaiId },
          data: {
            tbmDriveScheduleId: null,
          },
        })

        // 運行明細からETC料金を削除
        if (scheduleId) {
          await doStandardPrisma('tbmDriveSchedule', 'update', {
            where: { id: scheduleId },
            data: {
              M_postalHighwayFee: null,
              O_generalHighwayFee: null,
            },
          })
        }

        toastByResult(result)
      }

      onUpdate()
      onClose()
    } catch (error) {
      console.error('紐付けエラー:', error)
      toastByResult({ success: false, message: '紐付け処理に失敗しました' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnlinkEtcMeisai = async () => {
    try {
      setIsLoading(true)
      const result = await doStandardPrisma('tbmEtcMeisai', 'update', {
        where: { id: etcMeisaiId },
        data: { tbmDriveScheduleId: null },
      })
      toastByResult(result)
      onUpdate()
      onClose()
    } catch (error) {
      console.error('紐付け解除エラー:', error)
      toastByResult({ success: false, message: '紐付け解除処理に失敗しました' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!etcMeisai) {
    return <div>データを読み込み中...</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
      <h3 className="text-lg font-bold mb-4">ETC利用明細の運行紐付け</h3>

      <C_Stack className="mb-4 gap-2">
        <div className="text-sm text-gray-600">
          <strong>車両:</strong> {etcMeisai.TbmVehicle?.vehicleNumber}
        </div>
        <div className="text-sm text-gray-600">
          <strong>対象月:</strong> {formatDate(etcMeisai.month, 'YYYY年MM月')}
        </div>
        {etcMeisai.EtcCsvRaw?.length > 0 && (() => {
          const dates = etcMeisai.EtcCsvRaw.map((raw: any) => new Date(raw.fromDate))
          const minDate = new Date(Math.min(...dates.map((d: Date) => d.getTime())))
          const maxDate = new Date(Math.max(...dates.map((d: Date) => d.getTime())))
          const isSameDate = minDate.toDateString() === maxDate.toDateString()
          return (
            <div className="text-sm text-gray-600">
              <strong>利用日:</strong>{' '}
              {isSameDate
                ? formatDate(minDate, 'MM/DD(ddd)')
                : `${formatDate(minDate, 'MM/DD(ddd)')} 〜 ${formatDate(maxDate, 'MM/DD(ddd)')}`}
              {!isSameDate && minDate.getMonth() !== maxDate.getMonth() && (
                <span className="ml-2 text-orange-600">【月跨ぎ】</span>
              )}
            </div>
          )
        })()}
        <div className="text-sm text-gray-600">
          <strong>合計金額:</strong> {NumHandler.WithUnit(etcMeisai.sum, '円')}
        </div>
        {etcMeisai.TbmDriveSchedule && (
          <div className="text-sm text-blue-600">
            <strong>現在の紐付け:</strong> {formatDate(etcMeisai.TbmDriveSchedule.date, 'MM/DD')}{' '}
            {etcMeisai.TbmDriveSchedule.TbmRouteGroup?.name}
          </div>
        )}
      </C_Stack>

      <BasicForm latestFormData={latestFormData} onSubmit={handleSubmit}>
        <R_Stack className="gap- ">
          <Button type="button" color="red" onClick={handleUnlinkEtcMeisai} disabled={isLoading}>
            キャンセル
          </Button>
          <Button type="submit" color="blue" disabled={isLoading || !latestFormData.tbmDriveScheduleId}>
            {isLoading ? '処理中...' : '紐付け実行'}
          </Button>
        </R_Stack>
      </BasicForm>
    </div>
  )
}
