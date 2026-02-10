'use client'

import React from 'react'
import { NumHandler } from '@cm/class/NumHandler'
import { CustomerSchedulesData } from '@app/(apps)/tbm/(server-actions)/get-customer-schedules'
import { calculateSalesBySchedules } from '@app/(apps)/tbm/(lib)/calculation'
import { TBM_CODE } from '@app/(apps)/tbm/(class)/TBM_CODE'

type Props = {
  schedules: CustomerSchedulesData['schedules']
}

const ScheduleTable = ({ schedules }: Props) => {
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
  const routeKbnOrder = TBM_CODE.ROUTE_KBN.array.map(item => item.code)
  const sortedCategories = Object.keys(schedulesByCategory).sort(
    (a, b) => routeKbnOrder.indexOf(a) - routeKbnOrder.indexOf(b)
  )

  return (
    <div className="overflow-auto max-h-[70vh]">
      {sortedCategories.map(categoryCode => {
        const categorySchedules = schedulesByCategory[categoryCode]
        const categoryLabel = TBM_CODE.ROUTE_KBN.byCode(categoryCode)?.label || '不明'

        // 便グループごとにグループ化
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

export default ScheduleTable
