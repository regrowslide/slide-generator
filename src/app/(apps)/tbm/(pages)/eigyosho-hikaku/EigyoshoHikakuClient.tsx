'use client'

import { useState } from 'react'
import { EigyoshoHikakuData, CustomerSalesRecord } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchEigyoshoHikakuData'
import { Card } from '@cm/shadcn/ui/card'
import { NumHandler } from '@cm/class/NumHandler'
import { cn } from '@cm/shadcn/lib/utils'

import { getCustomerSchedules, CustomerSchedulesData } from '@app/(apps)/tbm/(server-actions)/get-customer-schedules'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import useModal from '@cm/components/utils/modal/useModal'
import { calculateSalesBySchedules } from '@app/(apps)/tbm/(lib)/calculation'
import { TBM_CODE } from '@app/(apps)/tbm/(class)/TBM_CODE'

type EigyoshoHikakuClientProps = {
  eigyoshoHikakuDataList: EigyoshoHikakuData[]
  firstDayOfMonth: Date | undefined
  whereQuery: { gte?: Date | undefined; lte?: Date | undefined }
}

export default function EigyoshoHikakuClient({
  eigyoshoHikakuDataList,
  firstDayOfMonth,
  whereQuery,
}: EigyoshoHikakuClientProps) {
  return (
    <div className={cn('border p-2 w-full items-start overflow-x-auto max-w-[95vw] mx-auto h-[85vh] grid grid-cols-2 gap-16')}>
      {eigyoshoHikakuDataList.map((data) => (

        <EigyoshoCard key={data.tbmBase.id} data={data} firstDayOfMonth={firstDayOfMonth} whereQuery={whereQuery} />
      ))}
    </div>
  )
}

function EigyoshoCard({
  data,
  firstDayOfMonth,
  whereQuery,
}: {
  data: EigyoshoHikakuData
  firstDayOfMonth: Date | undefined
  whereQuery: { gte?: Date | undefined; lte?: Date | undefined }
}) {
  const { tbmBase, customerSalesRecords } = data

  // 明細行の値を足し上げて合計を計算（grandTotalと明細のずれを防止）
  const summedTotal = customerSalesRecords.reduce(
    (acc, record) => ({
      postalFee: acc.postalFee + (Number(record.keyValue.postalFee.cellValue) || 0),
      generalFee: acc.generalFee + (Number(record.keyValue.generalFee.cellValue) || 0),
      driverFee: acc.driverFee + (Number(record.keyValue.driverFee.cellValue) || 0),
      futaiFee: acc.futaiFee + (Number(record.keyValue.futaiFee.cellValue) || 0),
      totalExclTax: acc.totalExclTax + (Number(record.keyValue.totalExclTax.cellValue) || 0),
      taxAmount: acc.taxAmount + (Number(record.keyValue.taxAmount.cellValue) || 0),
      grandTotal: acc.grandTotal + (Number(record.keyValue.grandTotal.cellValue) || 0),
    }),
    { postalFee: 0, generalFee: 0, driverFee: 0, futaiFee: 0, totalExclTax: 0, taxAmount: 0, grandTotal: 0 }
  )

  const tableClassName = cn(
    '[&_th]:!text-[11px]',
    '[&_td]:!text-[11px]',
    '[&_td]:!p-1',
    '[&_td]:!px-1.5',
    '[&_th]:!p-1',
    '[&_th]:!px-1.5',
    'min-w-[400px]'
  )

  return (
    <div className={`px-4`}>
      <h2 className={`mb-4 text-lg font-bold bg-primary-main text-white text-center py-1`}>{tbmBase.name}</h2>
      {tbmBase.code && <p className={`mb-2 text-sm text-gray-500`}>コード: {tbmBase.code}</p>}

      <Card className="p-0">
        <div className={cn('overflow-auto max-h-[70vh]', tableClassName)}>
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr className="border-b border-gray-300">
                <th className="text-left font-semibold py-2 px-2">コード</th>
                <th className="text-left font-semibold py-2 px-2">荷主名</th>
                <th className="text-right font-semibold py-2 px-2">通行料（郵便）</th>
                <th className="text-right font-semibold py-2 px-2">通行料（一般）</th>
                <th className="text-right font-semibold py-2 px-2">運賃</th>
                <th className="text-right font-semibold py-2 px-2">付帯料金</th>
                <th className="text-right font-semibold py-2 px-2">小計（税抜）</th>
                <th className="text-right font-semibold py-2 px-2">消費税</th>
                <th className="text-right font-semibold py-2 px-2 bg-blue-50">請求額合計（税込）</th>
              </tr>
            </thead>
            <tbody>
              {customerSalesRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-gray-500">
                    データがありません
                  </td>
                </tr>
              ) : (
                customerSalesRecords.map((record, idx) => (
                  <SalesRow
                    key={record.customer?.id ?? idx}
                    record={record}
                    tbmBaseId={tbmBase.id}
                    firstDayOfMonth={firstDayOfMonth}
                    whereQuery={whereQuery}
                  />
                ))
              )}
            </tbody>
            <tfoot className="sticky bottom-0 bg-gray-200 font-bold z-10">
              <tr className="border-t-2 border-gray-400">
                <td colSpan={2} className="py-2 px-2 text-center">
                  合計
                </td>
                <td className="text-right py-2 px-2">{NumHandler.toPrice(summedTotal.postalFee)}</td>
                <td className="text-right py-2 px-2">{NumHandler.toPrice(summedTotal.generalFee)}</td>
                <td className="text-right py-2 px-2">{NumHandler.toPrice(summedTotal.driverFee)}</td>
                <td className="text-right py-2 px-2">{NumHandler.toPrice(summedTotal.futaiFee)}</td>
                <td className="text-right py-2 px-2">{NumHandler.toPrice(summedTotal.totalExclTax)}</td>
                <td className="text-right py-2 px-2">{NumHandler.toPrice(summedTotal.taxAmount)}</td>
                <td className="text-right py-2 px-2 bg-blue-100">{NumHandler.toPrice(summedTotal.grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}

function SalesRow({
  record,
  tbmBaseId,
  firstDayOfMonth,
  whereQuery,
}: {
  record: CustomerSalesRecord
  tbmBaseId: number
  firstDayOfMonth: Date | undefined
  whereQuery: { gte?: Date | undefined; lte?: Date | undefined }
}) {
  const { keyValue, customer } = record
  const modalReturn = useModal()
  const [scheduleData, setScheduleData] = useState<CustomerSchedulesData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRowClick = async () => {
    if (!customer?.id) return

    setIsLoading(true)
    try {
      const data = await getCustomerSchedules({
        customerId: customer.id,
        firstDayOfMonth,
        whereQuery,
        tbmBaseId,
      })
      setScheduleData(data)
      modalReturn.handleOpen()
    } catch (error) {
      console.error('運行明細の取得に失敗しました:', error)
    } finally {
      setIsLoading(false)
    }
  }




  return (
    <>
      <tr
        className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
        onClick={handleRowClick}
        title="クリックで運行明細を表示"
      >
        <td className="py-1 px-2">{keyValue.code.cellValue as string}</td>
        <td className="py-1 px-2">{keyValue.customerName.cellValue as string}</td>
        <td className="text-right py-1 px-2">{NumHandler.toPrice(Number(keyValue.postalFee.cellValue) || 0)}</td>
        <td className="text-right py-1 px-2">{NumHandler.toPrice(Number(keyValue.generalFee.cellValue) || 0)}</td>
        <td className="text-right py-1 px-2">{NumHandler.toPrice(Number(keyValue.driverFee.cellValue) || 0)}</td>
        <td className="text-right py-1 px-2">{NumHandler.toPrice(Number(keyValue.futaiFee.cellValue) || 0)}</td>
        <td className="text-right py-1 px-2">{NumHandler.toPrice(Number(keyValue.totalExclTax.cellValue) || 0)}</td>
        <td className="text-right py-1 px-2">{NumHandler.toPrice(Number(keyValue.taxAmount.cellValue) || 0)}</td>
        <td className="text-right py-1 px-2 bg-blue-50 font-medium">
          {NumHandler.toPrice(Number(keyValue.grandTotal.cellValue) || 0)}
        </td>
      </tr>

      <modalReturn.Modal>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">運行明細 - {scheduleData?.customerName}</h2>
          {isLoading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : scheduleData ? (
            <ScheduleTable schedules={scheduleData.schedules} />
          ) : null}
        </div>
      </modalReturn.Modal>
    </>
  )
}

function ScheduleTable({ schedules }: { schedules: CustomerSchedulesData['schedules'] }) {
  if (schedules.length === 0) {
    return <div className="text-center py-8 text-gray-500">運行明細データがありません</div>
  }

  // 区分（seikyuKbn）でグループ化
  const schedulesByCategory = schedules.reduce(
    (acc, schedule) => {
      const categoryCode = schedule.TbmRouteGroup?.seikyuKbn || '不明'
      if (!acc[categoryCode]) {
        acc[categoryCode] = []
      }
      acc[categoryCode].push(schedule)
      return acc
    },
    {} as Record<string, typeof schedules>
  )

  // TBM_CODEの順序に従って並べ替え
  const routeKbnOrder = TBM_CODE.ROUTE_KBN.array.map((item) => item.code)
  const sortedCategories = Object.keys(schedulesByCategory).sort(
    (a, b) => routeKbnOrder.indexOf(a) - routeKbnOrder.indexOf(b)
  )

  return (
    <div className="overflow-auto max-h-[70vh]">
      {sortedCategories.map((categoryCode) => {
        const categorySchedules = schedulesByCategory[categoryCode]
        const categoryLabel = TBM_CODE.ROUTE_KBN.byCode(categoryCode)?.label || '不明'

        // 便グループごとにグループ化して calculateSalesBySchedules で計算（営業所比較ページと同じロジック）
        const schedulesByRouteGroup = categorySchedules.reduce(
          (acc, schedule) => {
            const routeGroupId = schedule.TbmRouteGroup?.id
            if (!routeGroupId) return acc
            if (!acc[routeGroupId]) {
              acc[routeGroupId] = []
            }
            acc[routeGroupId].push(schedule)
            return acc
          },
          {} as Record<number, typeof categorySchedules>
        )

        return (
          <div key={categoryCode} className="mb-6">
            <h3 className="text-lg font-bold mb-2 bg-gray-200 px-3 py-2">{categoryLabel}</h3>
            <table className="w-full border-collapse text-sm mb-4">
              <thead className="bg-gray-100">
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 px-3 font-semibold">便名</th>
                  <th className="text-right py-2 px-3 font-semibold">便数</th>
                  <th className="text-right py-2 px-3 font-semibold">運賃</th>
                  <th className="text-right py-2 px-3 font-semibold">付帯料</th>
                  <th className="text-right py-2 px-3 font-semibold">通行料</th>
                  <th className="text-right py-2 px-3 font-semibold">合計（税抜）</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(schedulesByRouteGroup).map(([routeGroupId, routeSchedules]) => {
                  const routeName = routeSchedules[0]?.TbmRouteGroup?.name || '不明'
                  const tripCount = routeSchedules.length
                  // calculateSalesBySchedules で統一計算（EigyoshoCardと同一ロジック）
                  const sales = calculateSalesBySchedules(routeSchedules)

                  return (
                    <tr key={routeGroupId} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2 px-3">{routeName}</td>
                      <td className="text-right py-2 px-3">{tripCount}件</td>
                      <td className="text-right py-2 px-3">{NumHandler.toPrice(sales.driverFee)}</td>
                      <td className="text-right py-2 px-3">{NumHandler.toPrice(sales.futaiFee)}</td>
                      <td className="text-right py-2 px-3">{NumHandler.toPrice(sales.tollExclTax)}</td>
                      <td className="text-right py-2 px-3 font-semibold">{NumHandler.toPrice(sales.totalExclTax)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-gray-100 font-bold">
                {(() => {
                  const categorySales = calculateSalesBySchedules(categorySchedules)
                  return (
                    <tr className="border-t-2 border-gray-400">
                      <td className="py-2 px-3">小計</td>
                      <td className="text-right py-2 px-3">{categorySchedules.length}件</td>
                      <td className="text-right py-2 px-3">{NumHandler.toPrice(categorySales.driverFee)}</td>
                      <td className="text-right py-2 px-3">{NumHandler.toPrice(categorySales.futaiFee)}</td>
                      <td className="text-right py-2 px-3">{NumHandler.toPrice(categorySales.tollExclTax)}</td>
                      <td className="text-right py-2 px-3">{NumHandler.toPrice(categorySales.totalExclTax)}</td>
                    </tr>
                  )
                })()}
              </tfoot>
            </table>
          </div>
        )
      })}

      {(() => {
        const grandSales = calculateSalesBySchedules(schedules)
        return (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <div className="text-lg font-bold">総合計</div>
            <div className="grid grid-cols-5 gap-4 mt-2">
              <div>
                <div className="text-sm text-gray-600">合計便数</div>
                <div className="text-xl font-bold">{schedules.length}件</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">運賃合計</div>
                <div className="text-xl font-bold">{NumHandler.toPrice(grandSales.driverFee)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">付帯料合計</div>
                <div className="text-xl font-bold">{NumHandler.toPrice(grandSales.futaiFee)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">通行料合計</div>
                <div className="text-xl font-bold">{NumHandler.toPrice(grandSales.tollExclTax)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">合計（税抜）</div>
                <div className="text-xl font-bold text-blue-600">{NumHandler.toPrice(grandSales.totalExclTax)}</div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
