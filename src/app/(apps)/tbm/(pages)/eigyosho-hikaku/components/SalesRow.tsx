'use client'

import React, { useState } from 'react'
import { CustomerSalesRecord } from '@app/(apps)/tbm/(class)/TbmReportCl/fetchers/fetchEigyoshoHikakuData'
import { NumHandler } from '@cm/class/NumHandler'
import { getCustomerSchedules, CustomerSchedulesData } from '@app/(apps)/tbm/(server-actions)/get-customer-schedules'
import useModal from '@cm/components/utils/modal/useModal'
import ScheduleTable from './ScheduleTable'

type Props = {
  record: CustomerSalesRecord
  tbmBaseId: number
  firstDayOfMonth: Date | undefined
  whereQuery: { gte?: Date | undefined; lte?: Date | undefined }
}

const SalesRow = ({ record, tbmBaseId, firstDayOfMonth, whereQuery }: Props) => {
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
        {/* <td className="text-right py-1 px-2">{NumHandler.toPrice(Number(keyValue.postalFee.cellValue) || 0)}</td>
        <td className="text-right py-1 px-2">{NumHandler.toPrice(Number(keyValue.generalFee.cellValue) || 0)}</td> */}
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

export default SalesRow
