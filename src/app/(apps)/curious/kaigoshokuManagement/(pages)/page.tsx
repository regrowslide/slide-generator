import { Suspense } from 'react'
import type { Prisma } from '@prisma/generated/prisma/client'
import { OrderDashboardClient } from './OrderDashboardClient'
import { getOrders } from '../_actions/order-actions'
import { getFacilities } from '../_actions/facility-actions'

type Props = {
  searchParams: Promise<{
    year?: string
    month?: string
    day?: string
    facilityId?: string
  }>
}

export default async function OrderDashboardPage(props: Props) {
  const query = await props.searchParams

  const now = new Date()
  const year = query.year ? parseInt(query.year) : now.getFullYear()
  const month = query.month ? parseInt(query.month) : now.getMonth() + 1
  const day = query.day ? parseInt(query.day) : now.getDate()
  const facilityId = query.facilityId ? parseInt(query.facilityId) : undefined

  // 日付範囲を構築
  const dateFrom = new Date(year, month - 1, day)
  dateFrom.setHours(0, 0, 0, 0)
  const dateTo = new Date(year, month - 1, day + 1)

  const where: Prisma.KgOrderWhereInput = {
    deliveryDate: { gte: dateFrom, lt: dateTo },
    ...(facilityId ? { facilityId } : {}),
  }

  const [orders, facilities] = await Promise.all([
    getOrders({
      where,
      orderBy: { deliveryDate: 'asc' },
    }),
    getFacilities(),
  ])

  return (
    <Suspense fallback={<div className="animate-pulse">読み込み中...</div>}>
      <OrderDashboardClient
        initialOrders={orders}
        facilities={facilities}
        currentFilter={{ year, month, day, facilityId }}
      />
    </Suspense>
  )
}
