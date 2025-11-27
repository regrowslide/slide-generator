import { useState } from 'react'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { toastByResult } from '@cm/lib/ui/notifications'
import { doTransaction, transactionQuery } from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

export const useEtcGrouping = (etcRawData: EtcRecord[], onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false)

  // グルーピングを更新する関数
  const updateGrouping = async (records: EtcRecord[], groupIndex: number) => {
    if (records.length === 0) return


    // 一つもEtc明細が紐づいていないTbmEtcMeisaiを削除
    await doStandardPrisma('tbmEtcMeisai', 'deleteMany', {
      where: {
        tbmVehicleId: records[0].tbmVehicleId,
        EtcCsvRaw: { none: { id: { gte: 0 }, }, }
      },
    })

    // 選択されたレコードが既にグループ化されていないか確認
    const alreadyGroupedRecords = records.filter(record => record.isGrouped)
    if (alreadyGroupedRecords.length > 0) {
      toastByResult({
        success: false,
        message: '既にグループ化されているレコードが含まれています。未グループのレコードのみ選択してください。',
      })
      return
    }

    // 連続した走行記録かどうかを確認（行番号的連続）
    // etcRawData内で未グループ化レコードのみを抽出（テーブル表示順と同じ順序）
    const ungroupedRecords = etcRawData.filter(
      record => record.tbmVehicleId === records[0].tbmVehicleId && !record.isGrouped
    )

    // 選択されたレコードのIDセット
    const selectedRecordIds = new Set(records.map(r => r.id))

    // 未グループ化レコード内で選択されたレコードのインデックスを取得
    const selectedIndices: number[] = []
    ungroupedRecords.forEach((record, index) => {
      if (selectedRecordIds.has(record.id)) {
        selectedIndices.push(index)
      }
    })

    // 選択されたレコードが存在しない場合
    if (selectedIndices.length === 0) {
      alert('選択されたレコードが見つかりません。')
      return
    }

    // インデックスが連続しているか確認
    // インデックスをソート
    selectedIndices.sort((a, b) => a - b)

    // 連続しているか確認（最小インデックスから最大インデックスまで全て選択されている必要がある）
    const minIndex = selectedIndices[0]
    const maxIndex = selectedIndices[selectedIndices.length - 1]
    const expectedIndices = Array.from({ length: maxIndex - minIndex + 1 }, (_, i) => minIndex + i)

    // 期待されるインデックスと実際のインデックスが一致するか確認
    const isConsecutive = expectedIndices.length === selectedIndices.length &&
      expectedIndices.every((val, idx) => val === selectedIndices[idx])

    if (!isConsecutive) {
      alert('連続した走行記録でない限りグルーピングできません。選択範囲内の全ての未グループ化レコードを選択してください。')
      return
    }

    setIsLoading(true)
    try {
      const vehicleId = records[0].tbmVehicleId
      const month = new Date(records[0].fromDate)
      month.setDate(1) // 月の初日に設定

      // グループの合計金額を計算
      const sum = records.reduce((acc, item) => acc + item.fee, 0)

      // 新しいグループを作成
      const { result: meisai } = await doStandardPrisma('tbmEtcMeisai', 'create', {
        data: {
          tbmVehicleId: vehicleId,
          groupIndex,
          month,
          sum,
          info: records.map(record =>
            JSON.stringify({
              fromDatetime: `${formatDate(record.fromDate)} ${record.fromTime}`,
              toDatetime: `${formatDate(record.toDate)} ${record.toTime}`,
              fromIc: record.fromIc,
              toIc: record.toIc,
              originalFee: record.originalFee,
              discount: record.discountAmount,
              toll: record.fee,
            })
          ),
        },
      })



      // EtcCsvRawのisGroupedとtbmEtcMeisaiIdを更新
      const updateQueries: transactionQuery<'etcCsvRaw', 'update'>[] = records.map(record => {

        return {
          model: 'etcCsvRaw',
          method: 'update',
          queryObject: {
            where: { id: record.id },
            data: {
              isGrouped: true,
              tbmEtcMeisaiId: meisai.id,
            },
          },
        }
      })


      await doTransaction({ transactionQueryList: updateQueries })

      onSuccess()
      toastByResult({ success: true, message: 'グルーピングが保存されました' })
    } catch (error) {
      console.error('グルーピング更新中にエラーが発生しました:', error)
      toastByResult({ success: false, message: 'グルーピング更新中にエラーが発生しました' })
    } finally {
      setIsLoading(false)
    }
  }

  // グループを解除する関数
  const ungroupRecords = async (meisaiId: number) => {
    if (!confirm('このグループを解除しますか？')) return

    setIsLoading(true)
    try {
      // グループに属するレコードを取得
      const records = etcRawData.filter(record => record.tbmEtcMeisaiId === meisaiId)

      if (!records.length) {
        toastByResult({ success: false, message: 'グループに属するレコードが見つかりません' })
        return
      }

      // EtcCsvRawのisGroupedとtbmEtcMeisaiIdをリセット
      const updateQueries: transactionQuery<'etcCsvRaw', 'update'>[] = records.map(record => ({
        model: 'etcCsvRaw',
        method: 'update',
        queryObject: {
          where: { id: record.id },
          data: {
            isGrouped: false,
            tbmEtcMeisaiId: null,
          },
        },
      }))

      // TbmEtcMeisaiを削除（別のトランザクションで実行）
      try {
        await doStandardPrisma('tbmEtcMeisai', 'delete', {
          where: { id: parseInt(String(meisaiId)) },
        })
      } catch (error) {
        console.error('TbmEtcMeisai削除中にエラーが発生しました:', error)
      }

      const result = await doTransaction({
        transactionQueryList: updateQueries,
      })

      toastByResult(result)

      if (result.success) {
        onSuccess()
      }
    } catch (error) {
      console.error('グループ解除中にエラーが発生しました:', error)
      toastByResult({ success: false, message: 'グループ解除中にエラーが発生しました' })
    } finally {
      setIsLoading(false)
    }
  }

  // 次のグループインデックスを取得
  const getNextGroupIndex = () => {
    // グループ化されたレコードからグループインデックスを取得
    const groupIndices = etcRawData.filter(record => record.TbmEtcMeisai).map(record => record.TbmEtcMeisai.groupIndex)

    // ユニークなグループインデックスを取得
    const uniqueIndices = [...new Set(groupIndices)]

    // 最大のグループインデックス + 1 を返す
    return uniqueIndices.length > 0 ? Math.max(...uniqueIndices) + 1 : 1
  }

  return {
    isLoading,
    updateGrouping,
    ungroupRecords,
    getNextGroupIndex,
  }
}
