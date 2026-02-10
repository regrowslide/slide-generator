'use client'

import React from 'react'
import { EigyoshoHikakuData, CustomerSalesRecord } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchEigyoshoHikakuData'
import { Card } from '@cm/shadcn/ui/card'
import { NumHandler } from '@cm/class/NumHandler'
import { cn } from '@cm/shadcn/lib/utils'
import SalesRow from './SalesRow'

type Props = {
  data: EigyoshoHikakuData
  firstDayOfMonth: Date | undefined
  whereQuery: { gte?: Date | undefined; lte?: Date | undefined }
}

const EigyoshoCard = ({ data, firstDayOfMonth, whereQuery }: Props) => {
  const { tbmBase, customerSalesRecords } = data

  // 明細行の値を足し上げて合計を計算
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
                {/* <th className="text-right font-semibold py-2 px-2">通行料（郵便）</th>
                <th className="text-right font-semibold py-2 px-2">通行料（一般）</th> */}
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
                {/* <td className="text-right py-2 px-2">{NumHandler.toPrice(summedTotal.postalFee)}</td>
                <td className="text-right py-2 px-2">{NumHandler.toPrice(summedTotal.generalFee)}</td> */}
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

export default EigyoshoCard
